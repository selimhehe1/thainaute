import {
  readSupabaseAttemptSyncConfiguration,
  readSupabaseServerConfiguration,
} from "./attempt-sync/runtime";
import { readContentReportConfiguration } from "./content-report/runtime";
import { readPublicContentConfiguration } from "./content-delivery/runtime";
import { readContentStudioConfiguration } from "./content-studio/runtime";
import { diagnoseRuntime, type RuntimeDiagnostic } from "./runtime-config";

const DEFAULT_DEPENDENCY_TIMEOUT_MS = 2_500;
const MAX_DEPENDENCY_TIMEOUT_MS = 10_000;

type Environment = Readonly<Record<string, string | undefined>>;

export type DependencyCheckStatus = "disabled" | "error" | "ok";

export interface ReadinessDependencyChecks {
  readonly auth: DependencyCheckStatus;
  readonly dataApi: DependencyCheckStatus;
}

export interface ReadinessAssessment {
  readonly ready: boolean;
  readonly diagnostic: RuntimeDiagnostic;
  readonly dependencies: ReadinessDependencyChecks;
}

export interface SupabaseReadinessProbePort {
  checkAuth(input: {
    readonly url: string;
    readonly publishableKey: string;
    readonly signal: AbortSignal;
  }): Promise<boolean>;
  checkDataApi(input: {
    readonly url: string;
    readonly publishableKey: string;
    readonly signal: AbortSignal;
  }): Promise<boolean>;
  checkContentReportsDataApi(input: {
    readonly url: string;
    readonly secretKey: string;
    readonly signal: AbortSignal;
  }): Promise<boolean>;
  checkPublicContentDataApi(input: {
    readonly url: string;
    readonly secretKey: string;
    readonly signal: AbortSignal;
  }): Promise<boolean>;
}

export type HealthFetchPort = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

async function releaseResponse(response: Response): Promise<boolean> {
  const successful = response.ok;
  try {
    await response.body?.cancel();
    return successful;
  } catch {
    return false;
  }
}

function contentReportsProbeHeaders(secretKey: string): Record<string, string> {
  const headers: Record<string, string> = { apikey: secretKey };
  // La CLI locale fournit encore un `service_role` JWT. Contrairement aux
  // clés opaques `sb_secret_`, ce format doit aussi porter le rôle PostgREST
  // dans Authorization. La valeur ne quitte jamais cette requête serveur.
  if (/^eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/u.test(secretKey)) {
    headers.Authorization = `Bearer ${secretKey}`;
  }
  return headers;
}

/**
 * Les deux sondes restent côté serveur. Aucune réponse amont n'est lue,
 * journalisée ou renvoyée par l'API de santé.
 */
export function createSupabaseReadinessProbe(
  fetcher: HealthFetchPort = fetch,
): SupabaseReadinessProbePort {
  return {
    async checkAuth({ url, publishableKey, signal }) {
      try {
        const response = await fetcher(new URL("/auth/v1/health", url), {
          method: "GET",
          headers: { apikey: publishableKey },
          cache: "no-store",
          redirect: "error",
          signal,
        });
        return await releaseResponse(response);
      } catch {
        return false;
      }
    },

    async checkDataApi({ url, publishableKey, signal }) {
      const endpoint = new URL("/rest/v1/content_releases", url);
      endpoint.searchParams.set("select", "id");
      endpoint.searchParams.set("limit", "1");

      try {
        const response = await fetcher(endpoint, {
          // HEAD exécute le SELECT PostgREST sans rapatrier de ligne.
          method: "HEAD",
          headers: {
            apikey: publishableKey,
          },
          cache: "no-store",
          redirect: "error",
          signal,
        });
        return await releaseResponse(response);
      } catch {
        return false;
      }
    },

    async checkContentReportsDataApi({ url, secretKey, signal }) {
      const endpoint = new URL("/rest/v1/content_reports", url);
      endpoint.searchParams.set("select", "idempotency_key");
      endpoint.searchParams.set("limit", "1");

      try {
        const response = await fetcher(endpoint, {
          method: "HEAD",
          headers: contentReportsProbeHeaders(secretKey),
          cache: "no-store",
          redirect: "error",
          signal,
        });
        return await releaseResponse(response);
      } catch {
        return false;
      }
    },

    async checkPublicContentDataApi({ url, secretKey, signal }) {
      const endpoint = new URL("/rest/v1/lesson_versions", url);
      endpoint.searchParams.set("select", "id");
      endpoint.searchParams.set("limit", "1");

      try {
        const response = await fetcher(endpoint, {
          method: "HEAD",
          headers: contentReportsProbeHeaders(secretKey),
          cache: "no-store",
          redirect: "error",
          signal,
        });
        return await releaseResponse(response);
      } catch {
        return false;
      }
    },
  };
}

function normalizeTimeout(timeoutMs: number | undefined): number {
  if (
    timeoutMs === undefined ||
    !Number.isFinite(timeoutMs) ||
    timeoutMs <= 0
  ) {
    return DEFAULT_DEPENDENCY_TIMEOUT_MS;
  }
  return Math.min(Math.trunc(timeoutMs), MAX_DEPENDENCY_TIMEOUT_MS);
}

async function runBoundedProbe(
  probe: (signal: AbortSignal) => Promise<boolean>,
  timeoutMs: number,
): Promise<boolean> {
  const controller = new AbortController();
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<boolean>((resolve) => {
    timeoutHandle = setTimeout(() => {
      controller.abort();
      resolve(false);
    }, timeoutMs);
  });

  try {
    const result = Promise.resolve()
      .then(() => probe(controller.signal))
      .catch(() => false);
    return await Promise.race([result, timeout]);
  } finally {
    if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
  }
}

export async function assessReadiness(
  options: {
    readonly environment?: Environment;
    readonly probe?: SupabaseReadinessProbePort;
    readonly timeoutMs?: number;
  } = {},
): Promise<ReadinessAssessment> {
  const environment = options.environment ?? process.env;
  const diagnostic = diagnoseRuntime(environment);
  const studioConfiguration = readContentStudioConfiguration(environment);
  const reportConfiguration = readContentReportConfiguration(environment);
  const publicContentConfiguration =
    readPublicContentConfiguration(environment);
  const serverConfiguration = readSupabaseServerConfiguration(environment);

  if (
    diagnostic.syncMode === "disabled" &&
    diagnostic.contentReportMode === "disabled" &&
    diagnostic.publicContentMode !== "supabase" &&
    diagnostic.studioMode !== "fixture" &&
    diagnostic.billingMode === "disabled"
  ) {
    return {
      ready: diagnostic.ready,
      diagnostic,
      dependencies: { auth: "disabled", dataApi: "disabled" },
    };
  }

  const syncConfiguration = readSupabaseAttemptSyncConfiguration(environment);
  if (diagnostic.syncMode === "supabase" && syncConfiguration === null) {
    return {
      ready: false,
      diagnostic,
      dependencies: { auth: "error", dataApi: "error" },
    };
  }
  if (
    diagnostic.contentReportMode === "supabase" &&
    reportConfiguration === null
  ) {
    return {
      ready: false,
      diagnostic,
      dependencies: { auth: "error", dataApi: "error" },
    };
  }
  if (
    diagnostic.publicContentMode === "supabase" &&
    publicContentConfiguration === null
  ) {
    return {
      ready: false,
      diagnostic,
      dependencies: { auth: "disabled", dataApi: "error" },
    };
  }
  if (
    diagnostic.studioMode === "fixture" &&
    (studioConfiguration === null || serverConfiguration === null)
  ) {
    return {
      ready: false,
      diagnostic,
      dependencies: {
        auth: "error",
        dataApi: "error",
      },
    };
  }

  const authConfiguration =
    syncConfiguration ??
    reportConfiguration ??
    studioConfiguration ??
    (diagnostic.billingMode !== "disabled" ? serverConfiguration : null);

  const probe = options.probe ?? createSupabaseReadinessProbe();
  const timeoutMs = normalizeTimeout(options.timeoutMs);
  const authPromise =
    authConfiguration === null
      ? Promise.resolve<boolean | null>(null)
      : runBoundedProbe(
          (signal) =>
            probe.checkAuth({
              url: authConfiguration.url,
              publishableKey: authConfiguration.publishableKey,
              signal,
            }),
          timeoutMs,
        );
  const dataApiPromises: Promise<boolean>[] = [];
  if (syncConfiguration !== null) {
    dataApiPromises.push(
      runBoundedProbe(
        (signal) =>
          probe.checkDataApi({
            url: syncConfiguration.url,
            publishableKey: syncConfiguration.publishableKey,
            signal,
          }),
        timeoutMs,
      ),
    );
  }
  // L'export de compte v2 lit toujours `content_reports`, y compris lorsque
  // les nouvelles soumissions sont désactivées. Une migration ou un GRANT
  // absent doit donc fermer la readiness de tout runtime de synchronisation.
  const contentReportsConfiguration =
    reportConfiguration ??
    syncConfiguration ??
    (diagnostic.studioMode === "fixture" ? serverConfiguration : null);
  if (contentReportsConfiguration !== null) {
    dataApiPromises.push(
      runBoundedProbe(
        (signal) =>
          probe.checkContentReportsDataApi({
            url: contentReportsConfiguration.url,
            secretKey: contentReportsConfiguration.secretKey,
            signal,
          }),
        timeoutMs,
      ),
    );
  }
  if (publicContentConfiguration !== null) {
    dataApiPromises.push(
      runBoundedProbe(
        (signal) =>
          probe.checkPublicContentDataApi({
            url: publicContentConfiguration.url,
            secretKey: publicContentConfiguration.secretKey,
            signal,
          }),
        timeoutMs,
      ),
    );
  }

  const [auth, dataApiResults] = await Promise.all([
    authPromise,
    Promise.all(dataApiPromises),
  ]);
  const dataApi =
    dataApiResults.length === 0
      ? null
      : dataApiResults.every((result) => result);

  return {
    ready: diagnostic.ready && (auth ?? true) && (dataApi ?? true),
    diagnostic,
    dependencies: {
      auth: auth === null ? "disabled" : auth ? "ok" : "error",
      dataApi: dataApi === null ? "disabled" : dataApi ? "ok" : "error",
    },
  };
}
