import { describe, expect, it } from "vitest";

import {
  ContentReportApiError,
  ContentReportInfrastructureError,
} from "../lib/server/content-report/errors";
import type { ContentReportRepository } from "../lib/server/content-report/ports";
import {
  createContentReportSubmitter,
  hashContentReport,
} from "../lib/server/content-report/service";

const input = {
  userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  idempotencyKey: "50000000-0000-4000-8000-000000000001",
  report: {
    contentVersionId: "31000000-0000-4000-8000-000000000001",
    exerciseId: "41000000-0000-4000-8000-000000000001",
    category: "tone" as const,
    platform: "web" as const,
  },
};

describe("service de signalement linguistique", () => {
  it.each(["received", "duplicate"] as const)(
    "retourne le statut autoritaire %s et un hash canonique",
    async (status) => {
      const commands: Array<Parameters<ContentReportRepository["submit"]>[0]> =
        [];
      const repository: ContentReportRepository = {
        submit: async (command) => {
          commands.push(command);
          return { status };
        },
      };

      await expect(
        createContentReportSubmitter(repository)(input),
      ).resolves.toEqual({ status });
      const submitted = commands[0];
      expect(submitted).toBeDefined();
      if (submitted === undefined) throw new Error("Commande attendue.");
      expect(submitted).toMatchObject({
        ...input,
        requestSha256: expect.stringMatching(/^[0-9a-f]{64}$/u),
      });
      expect(submitted.requestSha256).toBe(hashContentReport(input.report));
      expect(
        hashContentReport({
          platform: "web",
          category: "tone",
          exerciseId: input.report.exerciseId,
          contentVersionId: input.report.contentVersionId,
        }),
      ).toBe(hashContentReport(input.report));
    },
  );

  it.each([
    ["idempotency_conflict", "idempotency_key_reused"],
    ["invalid_target", "invalid_request"],
  ] as const)("convertit %s en %s", async (status, code) => {
    const repository: ContentReportRepository = {
      submit: async () => ({ status }),
    };

    await expect(
      createContentReportSubmitter(repository)(input),
    ).rejects.toEqual(
      expect.objectContaining({
        code,
      } satisfies Partial<ContentReportApiError>),
    );
  });

  it("refuse un contrat interne invalide avant l'accès base", async () => {
    let called = false;
    const repository: ContentReportRepository = {
      submit: async () => {
        called = true;
        return { status: "received" };
      },
    };

    await expect(
      createContentReportSubmitter(repository)({
        ...input,
        report: { ...input.report, comment: "interdit" } as never,
      }),
    ).rejects.toMatchObject({ code: "invalid_request" });
    expect(called).toBe(false);
  });

  it("masque une exception arbitraire de la base", async () => {
    const repository: ContentReportRepository = {
      submit: () => Promise.reject(new Error("secret upstream detail")),
    };

    const error = await createContentReportSubmitter(repository)(input).catch(
      (failure: unknown) => failure,
    );
    expect(error).toBeInstanceOf(ContentReportInfrastructureError);
    expect(error).toMatchObject({ code: "database_unavailable" });
    expect(String(error)).not.toContain("secret upstream detail");
  });

  it("ferme une réponse repository hors contrat", async () => {
    const repository: ContentReportRepository = {
      submit: async () => ({ status: "accepted" }) as never,
    };

    await expect(
      createContentReportSubmitter(repository)(input),
    ).rejects.toEqual(
      expect.objectContaining({ code: "database_unavailable" }),
    );
  });
});
