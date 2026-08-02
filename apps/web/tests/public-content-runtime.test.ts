import { describe, expect, it, vi } from "vitest";

import {
  assessReadiness,
  type SupabaseReadinessProbePort,
} from "../lib/server/health-readiness";
import {
  readActiveContentReleaseId,
  readPublicContentConfiguration,
  readPublicContentMode,
} from "../lib/server/content-delivery/runtime";
import { diagnoseRuntime } from "../lib/server/runtime-config";

const RELEASE_ID = "30000000-0000-4000-8000-000000000001";
const ENVIRONMENT = {
  THAINAUTE_PUBLIC_CONTENT_MODE: "supabase",
  THAINAUTE_PUBLIC_CONTENT_RELEASE_ID: RELEASE_ID,
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SECRET_KEY: "sb_secret_server_only_value",
} as const;

function probe(): SupabaseReadinessProbePort {
  return {
    checkAuth: vi.fn().mockResolvedValue(true),
    checkDataApi: vi.fn().mockResolvedValue(true),
    checkContentReportsDataApi: vi.fn().mockResolvedValue(true),
    checkPublicContentDataApi: vi.fn().mockResolvedValue(true),
  };
}

describe("configuration du contenu public connecté", () => {
  it("reste désactivée par défaut et refuse les modes inconnus", () => {
    expect(readPublicContentMode({})).toBe("disabled");
    expect(
      readPublicContentConfiguration({
        ...ENVIRONMENT,
        THAINAUTE_PUBLIC_CONTENT_MODE: "disabled",
      }),
    ).toBeNull();
    expect(
      readPublicContentMode({ THAINAUTE_PUBLIC_CONTENT_MODE: "public" }),
    ).toBeNull();
  });

  it("exige une release UUID explicite en plus de la clé serveur", () => {
    expect(readActiveContentReleaseId(ENVIRONMENT)).toBe(RELEASE_ID);
    expect(readPublicContentConfiguration(ENVIRONMENT)).toEqual({
      url: ENVIRONMENT.NEXT_PUBLIC_SUPABASE_URL,
      secretKey: ENVIRONMENT.SUPABASE_SECRET_KEY,
      releaseId: RELEASE_ID,
    });
    expect(
      readPublicContentConfiguration({
        ...ENVIRONMENT,
        THAINAUTE_PUBLIC_CONTENT_RELEASE_ID: "",
      }),
    ).toBeNull();
  });

  it("sonde la table éditoriale côté serveur sans exiger Auth", async () => {
    const readinessProbe = probe();
    const assessment = await assessReadiness({
      environment: ENVIRONMENT,
      probe: readinessProbe,
    });

    expect(assessment.dependencies).toEqual({
      auth: "disabled",
      dataApi: "ok",
    });
    expect(readinessProbe.checkPublicContentDataApi).toHaveBeenCalledWith({
      url: ENVIRONMENT.NEXT_PUBLIC_SUPABASE_URL,
      secretKey: ENVIRONMENT.SUPABASE_SECRET_KEY,
      signal: expect.any(AbortSignal),
    });
    expect(readinessProbe.checkAuth).not.toHaveBeenCalled();
    expect(assessment.ready).toBe(false);
    expect(assessment.diagnostic.issues).toContain(
      "public_content_rate_limit_missing",
    );
  });

  it("ferme la readiness si la configuration de release manque", async () => {
    const environment = {
      ...ENVIRONMENT,
      THAINAUTE_PUBLIC_CONTENT_RELEASE_ID: "",
    };
    const assessment = await assessReadiness({
      environment,
      probe: probe(),
    });

    expect(diagnoseRuntime(environment).issues).toContain(
      "public_content_config_missing",
    );
    expect(assessment.dependencies).toEqual({
      auth: "disabled",
      dataApi: "error",
    });
    expect(assessment.ready).toBe(false);
  });
});
