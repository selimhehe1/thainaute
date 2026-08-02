import { describe, expect, it } from "vitest";

import {
  AttemptApiError,
  AttemptInfrastructureError,
} from "../lib/server/attempt-sync/errors";
import {
  ContentReportApiError,
  ContentReportInfrastructureError,
} from "../lib/server/content-report/errors";
import { adaptContentReportAccessTokenVerifier } from "../lib/server/content-report/supabase-auth";

describe("adaptateur Auth permanent des signalements", () => {
  it("préserve le sujet permanent vérifié", async () => {
    const verifier = adaptContentReportAccessTokenVerifier({
      verify: async () => ({
        userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      }),
    });

    await expect(verifier.verify("verified-token")).resolves.toEqual({
      userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });
  });

  it("convertit le refus d'un compte absent ou anonyme en 401", async () => {
    const verifier = adaptContentReportAccessTokenVerifier({
      verify: () => Promise.reject(new AttemptApiError("unauthorized")),
    });

    await expect(verifier.verify("rejected-token")).rejects.toBeInstanceOf(
      ContentReportApiError,
    );
    await expect(verifier.verify("rejected-token")).rejects.toMatchObject({
      code: "unauthorized",
      status: 401,
    });
  });

  it("convertit toute panne Auth en indisponibilité opaque", async () => {
    for (const error of [
      new AttemptInfrastructureError("auth_unavailable"),
      new Error("sensitive upstream detail"),
    ]) {
      const verifier = adaptContentReportAccessTokenVerifier({
        verify: () => Promise.reject(error),
      });
      const failure = await verifier
        .verify("sensitive-token")
        .catch((caught: unknown) => caught);

      expect(failure).toBeInstanceOf(ContentReportInfrastructureError);
      expect(failure).toMatchObject({ code: "auth_unavailable" });
      expect(String(failure)).not.toContain("sensitive upstream detail");
    }
  });
});
