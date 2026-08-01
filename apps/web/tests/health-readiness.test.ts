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
    };

    const assessment = await assessReadiness({ environment: {}, probe });

    expect(assessment).toMatchObject({
      ready: true,
      dependencies: { auth: "disabled", dataApi: "disabled" },
    });
    expect(probe.checkAuth).not.toHaveBeenCalled();
    expect(probe.checkDataApi).not.toHaveBeenCalled();
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
    expect(fetcher).toHaveBeenCalledTimes(2);

    const requests = fetcher.mock.calls.map(([url, init]) => ({
      url: String(url),
      init,
    }));
    const auth = requests.find(({ url }) => url.endsWith("/auth/v1/health"));
    const dataApi = requests.find(({ url }) =>
      url.includes("/rest/v1/content_releases"),
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
    expect(JSON.stringify(requests)).not.toContain(
      SUPABASE_ENVIRONMENT.SUPABASE_SECRET_KEY,
    );
    expect(dataApi?.url).toContain("select=id");
    expect(dataApi?.url).toContain("limit=1");
    expect(auth?.init?.signal).toBeInstanceOf(AbortSignal);
    expect(dataApi?.init?.signal).toBeInstanceOf(AbortSignal);
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

  it("reste fermé sans lancer de sonde si la configuration Supabase est incomplète", async () => {
    const probe: SupabaseReadinessProbePort = {
      checkAuth: vi.fn(),
      checkDataApi: vi.fn(),
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

  it("retourne seulement un statut d'erreur quand un amont échoue", async () => {
    const upstreamDetail = "SUPABASE_SECRET_KEY=do-not-expose database failed";
    const probe: SupabaseReadinessProbePort = {
      checkAuth: vi.fn().mockResolvedValue(true),
      checkDataApi: vi.fn().mockRejectedValue(new Error(upstreamDetail)),
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
