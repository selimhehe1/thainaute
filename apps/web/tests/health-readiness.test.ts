import { afterEach, describe, expect, it, vi } from "vitest";

import { GET as getReadiness } from "../app/api/v1/health/ready/route";
import {
  assessReadiness,
  createSupabaseReadinessProbe,
  type HealthFetchPort,
  type SupabaseReadinessProbePort,
} from "../lib/server/health-readiness";

const SUPABASE_ENVIRONMENT = {
  THAINAUTE_SYNC_MODE: "supabase",
  THAINAUTE_PUBLIC_CONTENT_RELEASE_ID: "30000000-0000-4000-8000-000000000001",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example_public_value",
  SUPABASE_SECRET_KEY: "sb_secret_example_server_value",
  ACCOUNT_DELETION_RECEIPT_PEPPER:
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
} as const;

const STUDIO_ENVIRONMENT = {
  THAINAUTE_STUDIO_MODE: "fixture",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example_public_value",
  SUPABASE_SECRET_KEY: "sb_secret_example_server_value",
} as const;

describe("readiness des dépendances Supabase", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("ne contacte aucune dépendance quand la synchronisation est désactivée", async () => {
    const probe: SupabaseReadinessProbePort = {
      checkAuth: vi.fn(),
      checkDataApi: vi.fn(),
      checkContentReportsDataApi: vi.fn(),
      checkPublicContentDataApi: vi.fn(),
    };

    const assessment = await assessReadiness({ environment: {}, probe });

    expect(assessment).toMatchObject({
      ready: true,
      dependencies: { auth: "disabled", dataApi: "disabled" },
    });
    expect(probe.checkAuth).not.toHaveBeenCalled();
    expect(probe.checkDataApi).not.toHaveBeenCalled();
    expect(probe.checkContentReportsDataApi).not.toHaveBeenCalled();
    expect(probe.checkPublicContentDataApi).not.toHaveBeenCalled();
  });

  it("garde les contrôles de configuration actifs en mode désactivé", async () => {
    const assessment = await assessReadiness({
      environment: {
        THAINAUTE_PUBLIC_INDEXING: "enabled",
        THAINAUTE_PUBLIC_URL: "http://localhost:3000/",
      },
    });

    expect(assessment.ready).toBe(false);
    expect(assessment.diagnostic.issues).toContain("public_indexing_invalid");
    expect(assessment.dependencies).toEqual({
      auth: "disabled",
      dataApi: "disabled",
    });
  });

  it("sonde Auth et l'agrégat historique pour un studio fixture", async () => {
    const probe: SupabaseReadinessProbePort = {
      checkAuth: vi.fn().mockResolvedValue(true),
      checkDataApi: vi.fn(),
      checkContentReportsDataApi: vi.fn().mockResolvedValue(true),
      checkPublicContentDataApi: vi.fn(),
    };

    const assessment = await assessReadiness({
      environment: STUDIO_ENVIRONMENT,
      probe,
    });

    expect(assessment).toMatchObject({
      ready: true,
      diagnostic: { studioMode: "fixture", syncMode: "disabled" },
      dependencies: { auth: "ok", dataApi: "ok" },
    });
    expect(probe.checkAuth).toHaveBeenCalledWith({
      url: STUDIO_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_URL,
      publishableKey: STUDIO_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      signal: expect.any(AbortSignal),
    });
    expect(probe.checkDataApi).not.toHaveBeenCalled();
    expect(probe.checkContentReportsDataApi).toHaveBeenCalledWith({
      url: STUDIO_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_URL,
      secretKey: STUDIO_ENVIRONMENT.SUPABASE_SECRET_KEY,
      signal: expect.any(AbortSignal),
    });
  });

  it("ferme la readiness du studio avant toute sonde si Auth est incomplète", async () => {
    const probe: SupabaseReadinessProbePort = {
      checkAuth: vi.fn(),
      checkDataApi: vi.fn(),
      checkContentReportsDataApi: vi.fn(),
      checkPublicContentDataApi: vi.fn(),
    };

    const assessment = await assessReadiness({
      environment: { THAINAUTE_STUDIO_MODE: "fixture" },
      probe,
    });

    expect(assessment).toMatchObject({
      ready: false,
      dependencies: { auth: "error", dataApi: "error" },
    });
    expect(probe.checkAuth).not.toHaveBeenCalled();
    expect(probe.checkDataApi).not.toHaveBeenCalled();
  });

  it("signale explicitement l'agrégat Studio mal configuré dans la route", async () => {
    vi.stubEnv("THAINAUTE_STUDIO_MODE", "fixture");
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      STUDIO_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_URL,
    );
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      STUDIO_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
    vi.stubEnv("SUPABASE_SECRET_KEY", "");

    const response = await getReadiness();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      status: "error",
      checks: {
        studio: { status: "error", mode: "fixture" },
      },
      issues: expect.arrayContaining(["studio_report_config_missing"]),
    });
  });

  it("sonde Auth et PostgREST en parallèle avec les bonnes clés", async () => {
    const fetcher = vi
      .fn<HealthFetchPort>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    const probe = createSupabaseReadinessProbe(fetcher);

    const assessment = await assessReadiness({
      environment: SUPABASE_ENVIRONMENT,
      probe,
    });

    expect(assessment).toMatchObject({
      ready: true,
      dependencies: { auth: "ok", dataApi: "ok" },
    });
    expect(fetcher).toHaveBeenCalledTimes(3);

    const requests = fetcher.mock.calls.map(([url, init]) => ({
      url: String(url),
      init,
    }));
    const auth = requests.find(({ url }) => url.endsWith("/auth/v1/health"));
    const dataApi = requests.find(({ url }) =>
      url.includes("/rest/v1/content_releases"),
    );
    const contentReportsDataApi = requests.find(({ url }) =>
      url.includes("/rest/v1/content_reports"),
    );

    expect(auth?.init).toMatchObject({
      method: "GET",
      cache: "no-store",
      redirect: "error",
      headers: {
        apikey: SUPABASE_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      },
    });
    expect(dataApi?.init).toMatchObject({
      method: "HEAD",
      cache: "no-store",
      redirect: "error",
      headers: {
        apikey: SUPABASE_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      },
    });
    expect(new Headers(dataApi?.init?.headers).has("authorization")).toBe(
      false,
    );
    expect(contentReportsDataApi?.init).toMatchObject({
      method: "HEAD",
      cache: "no-store",
      redirect: "error",
      headers: { apikey: SUPABASE_ENVIRONMENT.SUPABASE_SECRET_KEY },
    });
    expect(
      new Headers(contentReportsDataApi?.init?.headers).has("authorization"),
    ).toBe(false);
    expect(JSON.stringify([auth, dataApi])).not.toContain(
      SUPABASE_ENVIRONMENT.SUPABASE_SECRET_KEY,
    );
    expect(dataApi?.url).toContain("select=id");
    expect(dataApi?.url).toContain("limit=1");
    expect(contentReportsDataApi?.url).toContain("select=idempotency_key");
    expect(contentReportsDataApi?.url).toContain("limit=1");
    expect(auth?.init?.signal).toBeInstanceOf(AbortSignal);
    expect(dataApi?.init?.signal).toBeInstanceOf(AbortSignal);
    expect(contentReportsDataApi?.init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("libère le corps de la réponse Auth sans le lire", async () => {
    const cancel = vi.fn().mockResolvedValue(undefined);
    const fetcher = vi.fn<HealthFetchPort>().mockResolvedValue({
      ok: true,
      body: { cancel },
    } as unknown as Response);
    const probe = createSupabaseReadinessProbe(fetcher);

    await expect(
      probe.checkAuth({
        url: SUPABASE_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_URL,
        publishableKey:
          SUPABASE_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        signal: new AbortController().signal,
      }),
    ).resolves.toBe(true);
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("porte le rôle PostgREST uniquement pour une clé service_role JWT locale", async () => {
    const fetcher = vi
      .fn<HealthFetchPort>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    const probe = createSupabaseReadinessProbe(fetcher);
    const legacyServiceRole =
      "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.signature";

    await expect(
      probe.checkContentReportsDataApi({
        url: SUPABASE_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_URL,
        secretKey: legacyServiceRole,
        signal: new AbortController().signal,
      }),
    ).resolves.toBe(true);

    const headers = new Headers(fetcher.mock.calls[0]?.[1]?.headers);
    expect(headers.get("apikey")).toBe(legacyServiceRole);
    expect(headers.get("authorization")).toBe(`Bearer ${legacyServiceRole}`);
  });

  it("reste fermé sans lancer de sonde si la configuration Supabase est incomplète", async () => {
    const probe: SupabaseReadinessProbePort = {
      checkAuth: vi.fn(),
      checkDataApi: vi.fn(),
      checkContentReportsDataApi: vi.fn(),
      checkPublicContentDataApi: vi.fn(),
    };

    const assessment = await assessReadiness({
      environment: { THAINAUTE_SYNC_MODE: "supabase" },
      probe,
    });

    expect(assessment).toMatchObject({
      ready: false,
      dependencies: { auth: "error", dataApi: "error" },
    });
    expect(probe.checkAuth).not.toHaveBeenCalled();
    expect(probe.checkDataApi).not.toHaveBeenCalled();
  });

  it("marque la synchronisation en erreur sans release active", async () => {
    for (const [name, value] of Object.entries({
      ...SUPABASE_ENVIRONMENT,
      THAINAUTE_PUBLIC_CONTENT_RELEASE_ID: "",
    })) {
      vi.stubEnv(name, value);
    }
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 200 })),
    );

    const response = await getReadiness();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      checks: { sync: { status: "error", mode: "supabase" } },
      issues: expect.arrayContaining(["sync_release_config_missing"]),
    });
  });

  it("retourne seulement un statut d'erreur quand un amont échoue", async () => {
    const upstreamDetail = "SUPABASE_SECRET_KEY=do-not-expose database failed";
    const probe: SupabaseReadinessProbePort = {
      checkAuth: vi.fn().mockResolvedValue(true),
      checkDataApi: vi.fn().mockRejectedValue(new Error(upstreamDetail)),
      checkContentReportsDataApi: vi.fn(),
      checkPublicContentDataApi: vi.fn(),
    };

    const assessment = await assessReadiness({
      environment: SUPABASE_ENVIRONMENT,
      probe,
    });

    expect(assessment).toMatchObject({
      ready: false,
      dependencies: { auth: "ok", dataApi: "error" },
    });
    expect(JSON.stringify(assessment)).not.toContain(upstreamDetail);
    expect(JSON.stringify(assessment)).not.toContain(
      SUPABASE_ENVIRONMENT.SUPABASE_SECRET_KEY,
    );
  });

  it("ferme aussi l'export v2 si content_reports manque en mode sync seul", async () => {
    const probe: SupabaseReadinessProbePort = {
      checkAuth: vi.fn().mockResolvedValue(true),
      checkDataApi: vi.fn().mockResolvedValue(true),
      checkContentReportsDataApi: vi.fn().mockResolvedValue(false),
      checkPublicContentDataApi: vi.fn(),
    };

    const assessment = await assessReadiness({
      environment: SUPABASE_ENVIRONMENT,
      probe,
    });

    expect(assessment).toMatchObject({
      ready: false,
      diagnostic: { contentReportMode: "disabled", syncMode: "supabase" },
      dependencies: { auth: "ok", dataApi: "error" },
    });
    expect(probe.checkContentReportsDataApi).toHaveBeenCalledOnce();
  });

  it("ferme la route en 503 sans exposer le détail amont", async () => {
    for (const [name, value] of Object.entries(SUPABASE_ENVIRONMENT)) {
      vi.stubEnv(name, value);
    }
    const upstreamDetail = "database.internal.example refused secret-value";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).endsWith("/auth/v1/health")) {
          return new Response(null, { status: 200 });
        }
        throw new Error(upstreamDetail);
      }),
    );

    const response = await getReadiness();
    const body: unknown = await response.json();
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      status: "error",
      checks: {
        auth: { status: "ok" },
        dataApi: { status: "error" },
      },
    });
    expect(serialized).not.toContain(upstreamDetail);
    expect(serialized).not.toContain(SUPABASE_ENVIRONMENT.SUPABASE_SECRET_KEY);
  });

  it("borne même une sonde qui ignore le signal d'annulation", async () => {
    const never = new Promise<boolean>(() => undefined);
    const probe: SupabaseReadinessProbePort = {
      checkAuth: vi.fn().mockReturnValue(never),
      checkDataApi: vi.fn().mockResolvedValue(true),
      checkContentReportsDataApi: vi.fn().mockResolvedValue(true),
      checkPublicContentDataApi: vi.fn(),
    };
    const startedAt = performance.now();

    const assessment = await assessReadiness({
      environment: SUPABASE_ENVIRONMENT,
      probe,
      timeoutMs: 10,
    });

    expect(assessment).toMatchObject({
      ready: false,
      dependencies: { auth: "error", dataApi: "ok" },
    });
    expect(performance.now() - startedAt).toBeLessThan(500);
  });
});
