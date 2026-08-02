import { readSupabaseAttemptSyncConfiguration } from "./attempt-sync/runtime";
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

  if (
    diagnostic.syncMode === "disabled" &&
    diagnostic.studioMode !== "fixture"
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
  if (diagnostic.studioMode === "fixture" && studioConfiguration === null) {
    return {
      ready: false,
      diagnostic,
      dependencies: {
        auth: "error",
        dataApi: diagnostic.syncMode === "supabase" ? "error" : "disabled",
      },
    };
  }

  const authConfiguration = syncConfiguration ?? studioConfiguration;
  if (authConfiguration === null) {
    return {
      ready: false,
      diagnostic,
      dependencies: { auth: "error", dataApi: "disabled" },
    };
  }

  const probe = options.probe ?? createSupabaseReadinessProbe();
  const timeoutMs = normalizeTimeout(options.timeoutMs);
  const [auth, dataApi] = await Promise.all([
    runBoundedProbe(
      (signal) =>
        probe.checkAuth({
          url: authConfiguration.url,
          publishableKey: authConfiguration.publishableKey,
          signal,
        }),
      timeoutMs,
    ),
    syncConfiguration === null
      ? Promise.resolve<null>(null)
      : runBoundedProbe(
          (signal) =>
            probe.checkDataApi({
              url: syncConfiguration.url,
              publishableKey: syncConfiguration.publishableKey,
              signal,
            }),
          timeoutMs,
        ),
  ]);

  return {
    ready: diagnostic.ready && auth && (dataApi ?? true),
    diagnostic,
    dependencies: {
      auth: auth ? "ok" : "error",
      dataApi: dataApi === null ? "disabled" : dataApi ? "ok" : "error",
    },
  };
}
