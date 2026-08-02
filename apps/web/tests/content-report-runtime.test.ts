import { afterEach, describe, expect, it, vi } from "vitest";

import { GET as getReadiness } from "../app/api/v1/health/ready/route";
import {
  assessReadiness,
  createSupabaseReadinessProbe,
  type HealthFetchPort,
} from "../lib/server/health-readiness";
import { diagnoseRuntime } from "../lib/server/runtime-config";
import {
  readContentReportConfiguration,
  readContentReportMode,
  readContentReportSubmissionConfiguration,
} from "../lib/server/content-report/runtime";

const SUPABASE_ENVIRONMENT = {
  THAINAUTE_PUBLIC_CONTENT_RELEASE_ID: "30000000-0000-4000-8000-000000000001",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example_public_value",
  SUPABASE_SECRET_KEY: "sb_secret_example_server_value",
} as const;

describe("configuration des signalements structurés", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("reste désactivée par défaut et refuse un mode inconnu", () => {
    expect(readContentReportMode({})).toBe("disabled");
    expect(readContentReportConfiguration({})).toBeNull();
    expect(diagnoseRuntime({})).toMatchObject({
      ready: true,
      contentReportMode: "disabled",
    });

    const invalid = diagnoseRuntime({
      THAINAUTE_CONTENT_REPORT_MODE: "public",
    });
    expect(invalid.ready).toBe(false);
    expect(invalid.contentReportMode).toBeNull();
    expect(invalid.issues).toContain("content_report_mode_invalid");
  });

  it("exige la configuration serveur complète en mode Supabase", () => {
    const missing = diagnoseRuntime({
      THAINAUTE_CONTENT_REPORT_MODE: "supabase",
    });
    expect(missing.issues).toEqual(
      expect.arrayContaining([
        "content_report_config_missing",
        "content_report_rate_limit_missing",
        "content_report_sync_required",
      ]),
    );
    expect(
      readContentReportConfiguration({
        THAINAUTE_CONTENT_REPORT_MODE: "supabase",
        ...SUPABASE_ENVIRONMENT,
      }),
    ).toEqual({
      url: SUPABASE_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_URL,
      publishableKey: SUPABASE_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      secretKey: SUPABASE_ENVIRONMENT.SUPABASE_SECRET_KEY,
    });
    expect(
      readContentReportSubmissionConfiguration({
        THAINAUTE_CONTENT_REPORT_MODE: "supabase",
        ...SUPABASE_ENVIRONMENT,
      }),
    ).toBeNull();
    expect(
      readContentReportSubmissionConfiguration({
        THAINAUTE_SYNC_MODE: "supabase",
        THAINAUTE_CONTENT_REPORT_MODE: "supabase",
        ACCOUNT_DELETION_RECEIPT_PEPPER:
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        ...SUPABASE_ENVIRONMENT,
      }),
    ).toEqual({
      url: SUPABASE_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_URL,
      publishableKey: SUPABASE_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      secretKey: SUPABASE_ENVIRONMENT.SUPABASE_SECRET_KEY,
    });
  });

  it("sonde Supabase mais reste non-ready tant que OPEN-API-001 est ouvert", async () => {
    const probe = {
      checkAuth: vi.fn().mockResolvedValue(true),
      checkDataApi: vi.fn().mockResolvedValue(true),
      checkContentReportsDataApi: vi.fn().mockResolvedValue(true),
      checkPublicContentDataApi: vi.fn(),
    };
    const environment = {
      THAINAUTE_CONTENT_REPORT_MODE: "supabase",
      ...SUPABASE_ENVIRONMENT,
    } as const;

    const assessment = await assessReadiness({ environment, probe });

    expect(assessment).toMatchObject({
      ready: false,
      diagnostic: {
        contentReportMode: "supabase",
        issues: [
          "content_report_sync_required",
          "content_report_rate_limit_missing",
        ],
      },
      dependencies: { auth: "ok", dataApi: "ok" },
    });
    expect(probe.checkAuth).toHaveBeenCalledOnce();
    expect(probe.checkDataApi).not.toHaveBeenCalled();
    expect(probe.checkContentReportsDataApi).toHaveBeenCalledWith({
      url: SUPABASE_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_URL,
      secretKey: SUPABASE_ENVIRONMENT.SUPABASE_SECRET_KEY,
      signal: expect.any(AbortSignal),
    });
    expect(JSON.stringify(assessment)).not.toContain(
      SUPABASE_ENVIRONMENT.SUPABASE_SECRET_KEY,
    );
  });

  it("refuse la collecte si sync et suppression ne sont pas actives", async () => {
    for (const [name, value] of Object.entries({
      THAINAUTE_CONTENT_REPORT_MODE: "supabase",
      ...SUPABASE_ENVIRONMENT,
    })) {
      vi.stubEnv(name, value);
    }
    let route = await import("../app/api/v1/content/reports/route");
    const disabled = await route.POST(
      new Request("https://thainaute.example/api/v1/content/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      }),
    );
    expect(disabled.status).toBe(503);
    await expect(disabled.json()).resolves.toMatchObject({
      error: { code: "database_unavailable" },
    });

    vi.stubEnv("THAINAUTE_SYNC_MODE", "supabase");
    vi.stubEnv(
      "ACCOUNT_DELETION_RECEIPT_PEPPER",
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    );
    vi.resetModules();
    route = await import("../app/api/v1/content/reports/route");
    const active = await route.POST(
      new Request("https://thainaute.example/api/v1/content/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      }),
    );
    expect(active.status).toBe(401);
  });

  it("sonde la table privée avec la clé serveur sans lire de ligne", async () => {
    const fetcher = vi
      .fn<HealthFetchPort>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    const probe = createSupabaseReadinessProbe(fetcher);

    await expect(
      probe.checkContentReportsDataApi({
        url: SUPABASE_ENVIRONMENT.NEXT_PUBLIC_SUPABASE_URL,
        secretKey: SUPABASE_ENVIRONMENT.SUPABASE_SECRET_KEY,
        signal: new AbortController().signal,
      }),
    ).resolves.toBe(true);

    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0] ?? [];
    expect(String(url)).toContain("/rest/v1/content_reports");
    expect(String(url)).toContain("select=idempotency_key");
    expect(String(url)).toContain("limit=1");
    expect(init).toMatchObject({
      method: "HEAD",
      cache: "no-store",
      redirect: "error",
      headers: { apikey: SUPABASE_ENVIRONMENT.SUPABASE_SECRET_KEY },
    });
    expect(new Headers(init?.headers).has("authorization")).toBe(false);
  });

  it("combine les sondes sync et reports quand les deux modes sont actifs", async () => {
    const probe = {
      checkAuth: vi.fn().mockResolvedValue(true),
      checkDataApi: vi.fn().mockResolvedValue(true),
      checkContentReportsDataApi: vi.fn().mockResolvedValue(false),
      checkPublicContentDataApi: vi.fn(),
    };
    const assessment = await assessReadiness({
      environment: {
        THAINAUTE_SYNC_MODE: "supabase",
        THAINAUTE_CONTENT_REPORT_MODE: "supabase",
        ACCOUNT_DELETION_RECEIPT_PEPPER:
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        ...SUPABASE_ENVIRONMENT,
      },
      probe,
    });

    expect(assessment.dependencies).toEqual({
      auth: "ok",
      dataApi: "error",
    });
    expect(assessment.diagnostic.issues).toEqual([
      "content_report_rate_limit_missing",
    ]);
    expect(probe.checkAuth).toHaveBeenCalledOnce();
    expect(probe.checkDataApi).toHaveBeenCalledOnce();
    expect(probe.checkContentReportsDataApi).toHaveBeenCalledOnce();
  });

  it("expose seulement les diagnostics fermés dans la route readiness", async () => {
    const environment = {
      THAINAUTE_SYNC_MODE: "supabase",
      THAINAUTE_CONTENT_REPORT_MODE: "supabase",
      ACCOUNT_DELETION_RECEIPT_PEPPER:
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      ...SUPABASE_ENVIRONMENT,
    } as const;
    for (const [name, value] of Object.entries(environment)) {
      vi.stubEnv(name, value);
    }
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 200 })),
    );

    const response = await getReadiness();
    const body: unknown = await response.json();
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      status: "error",
      checks: {
        contentReport: { status: "error", mode: "supabase" },
        auth: { status: "ok" },
        dataApi: { status: "ok" },
      },
      issues: ["content_report_rate_limit_missing"],
    });
    expect(serialized).not.toContain(SUPABASE_ENVIRONMENT.SUPABASE_SECRET_KEY);
  });
});
