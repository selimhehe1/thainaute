import { describe, expect, it, vi } from "vitest";

import {
  AttemptApiError,
  AttemptInfrastructureError,
} from "../lib/server/attempt-sync/errors";
import { ContentIntegrityError } from "../lib/server/content-delivery/errors";
import {
  createLessonProgressHttpHandler,
  type LessonProgressHttpDependencies,
} from "../lib/server/lesson-progress/http";
import { verifyPublishedBundleRow } from "../lib/server/content-delivery/verified-bundle";
import {
  makePublishableBundle,
  makePublishedLessonRow,
  RELEASE_ID,
} from "./content-delivery-test-data";

const USER_A = "a0000000-0000-4000-8000-000000000001";
const USER_B = "b0000000-0000-4000-8000-000000000001";
const REQUEST_ID = "request-lesson-progress";

function publishedFixture() {
  const bundle = makePublishableBundle();
  const verified = verifyPublishedBundleRow(makePublishedLessonRow(bundle));
  const exercise = bundle.lesson.exercises[0];
  if (verified === null || exercise === undefined) {
    throw new Error("Fixture publiée incomplète.");
  }
  return { verified, exercise };
}

function request(token?: string) {
  return new Request("http://localhost/api/v1/progress/lessons/version", {
    headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
  });
}

function dependencies(
  overrides: Partial<LessonProgressHttpDependencies> = {},
): LessonProgressHttpDependencies {
  const { verified, exercise } = publishedFixture();
  return {
    activeReleaseId: RELEASE_ID,
    accessTokenVerifier: {
      verify: vi.fn(async (token: string) => {
        if (token === "token-a") return { userId: USER_A };
        if (token === "token-b") return { userId: USER_B };
        throw new AttemptApiError("unauthorized");
      }),
    },
    repository: {
      loadPublishedBundle: vi.fn(async () => verified),
    },
    readSnapshot: vi.fn(async (userId: string) =>
      userId === USER_A
        ? {
            syncRevision: 4,
            states: [
              {
                itemId: exercise.itemId,
                skill: exercise.skill,
                masteryPermille: 250,
                status: "learning" as const,
                attemptCount: 1,
                successfulAttempts: 1,
                consecutiveCorrect: 1,
                dueAt: "2026-08-03T10:00:00.000Z",
                algorithmVersion: "srs-v0" as const,
              },
            ],
          }
        : { syncRevision: 0, states: [] },
    ),
    requestIdFactory: () => REQUEST_ID,
    ...overrides,
  };
}

describe("GET /api/v1/progress/lessons/[versionId]", () => {
  it("isole les comptes A et B et n'expose aucun itemId", async () => {
    const { verified, exercise } = publishedFixture();
    const handler = createLessonProgressHttpHandler(dependencies());

    const responseA = await handler(
      request("token-a"),
      verified.bundle.lesson.versionId,
    );
    const responseB = await handler(
      request("token-b"),
      verified.bundle.lesson.versionId,
    );
    const bodyA = await responseA.json();
    const bodyB = await responseB.json();

    expect(responseA.status).toBe(200);
    expect(responseA.headers.get("cache-control")).toContain("no-store");
    expect(bodyA).toMatchObject({
      syncRevision: 4,
      exercises: [{ exerciseId: exercise.id, masteryPermille: 250 }],
    });
    expect(bodyB).toMatchObject({
      syncRevision: 0,
      exercises: [{ exerciseId: exercise.id, status: "new" }],
    });
    expect(JSON.stringify(bodyA)).not.toContain(exercise.itemId);
    expect(JSON.stringify(bodyB)).not.toContain(USER_A);
  });

  it("refuse l'anonyme avant toute lecture de contenu", async () => {
    const input = dependencies();
    const handler = createLessonProgressHttpHandler(input);
    const response = await handler(
      request(),
      publishedFixture().verified.bundle.lesson.versionId,
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe("Bearer");
    expect(input.repository.loadPublishedBundle).not.toHaveBeenCalled();
  });

  it("masque une leçon absente, non publiée ou hors release active", async () => {
    const readSnapshot = vi.fn();
    const missing = createLessonProgressHttpHandler(
      dependencies({
        repository: { loadPublishedBundle: vi.fn(async () => null) },
        readSnapshot,
      }),
    );
    const wrongRelease = createLessonProgressHttpHandler(
      dependencies({ activeReleaseId: USER_A }),
    );
    const versionId = publishedFixture().verified.bundle.lesson.versionId;

    for (const handler of [missing, wrongRelease]) {
      const response = await handler(request("token-a"), versionId);
      const body = await response.json();
      expect(response.status).toBe(404);
      expect(body).toEqual({
        error: {
          code: "content_not_found",
          message: "Cette version de leçon est introuvable.",
          requestId: REQUEST_ID,
        },
      });
    }
    expect(readSnapshot).not.toHaveBeenCalled();
  });

  it("masque une leçon Premium avant toute lecture de progression", async () => {
    const { verified } = publishedFixture();
    verified.bundle.lesson.requiredEntitlement = "premium";
    const readSnapshot = vi.fn();
    const handler = createLessonProgressHttpHandler(
      dependencies({
        repository: {
          loadPublishedBundle: vi.fn(async () => verified),
        },
        readSnapshot,
      }),
    );

    const response = await handler(
      request("token-a"),
      verified.bundle.lesson.versionId,
    );

    expect(response.status).toBe(404);
    expect(readSnapshot).not.toHaveBeenCalled();
  });

  it("ferme une intégrité éditoriale défaillante sans détail sensible", async () => {
    const report = vi.fn();
    const handler = createLessonProgressHttpHandler(
      dependencies({
        repository: {
          loadPublishedBundle: vi.fn(async () => {
            throw new ContentIntegrityError();
          }),
        },
        reportOperationalFailure: report,
      }),
    );
    const response = await handler(
      request("token-a"),
      publishedFixture().verified.bundle.lesson.versionId,
    );

    expect(response.status).toBe(404);
    expect(JSON.stringify(await response.json())).not.toContain(USER_A);
    expect(report).toHaveBeenCalledWith({
      operation: "lesson_progress",
      errorKind: "content_integrity_failed",
      requestId: REQUEST_ID,
    });
  });

  it("traduit une panne Auth ou progression dans une enveloppe fermée", async () => {
    const authUnavailable = createLessonProgressHttpHandler(
      dependencies({
        accessTokenVerifier: {
          verify: vi.fn(async () => {
            throw new AttemptInfrastructureError("auth_unavailable");
          }),
        },
      }),
    );
    const progressUnavailable = createLessonProgressHttpHandler(
      dependencies({
        readSnapshot: vi.fn(async () => {
          throw new AttemptInfrastructureError("database_unavailable");
        }),
      }),
    );
    const versionId = publishedFixture().verified.bundle.lesson.versionId;

    expect((await authUnavailable(request("token-a"), versionId)).status).toBe(
      503,
    );
    expect(
      (await progressUnavailable(request("token-a"), versionId)).status,
    ).toBe(503);
  });
});
