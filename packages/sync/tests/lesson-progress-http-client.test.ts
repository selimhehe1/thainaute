import { describe, expect, it, vi } from "vitest";

import {
  SyncHttpAuthenticationError,
  SyncHttpProtocolError,
  SyncHttpRequestValidationError,
  createSyncHttpClient,
} from "../src/index";
import type { SyncHttpApiError } from "../src/index";

const USER_ID = "10000000-0000-4000-8000-000000000001";
const OTHER_USER_ID = "10000000-0000-4000-8000-000000000002";
const VERSION_ID = "20000000-0000-4000-8000-000000000001";
const EXERCISE_ID = "30000000-0000-4000-8000-000000000001";
const REQUEST_ID = "40000000-0000-4000-8000-000000000001";

const responseBody = {
  schemaVersion: 1 as const,
  lessonVersionId: VERSION_ID,
  syncRevision: 2,
  exercises: [
    {
      exerciseId: EXERCISE_ID,
      skill: "listening" as const,
      status: "learning" as const,
      masteryPermille: 250,
      attemptCount: 1,
      successfulAttempts: 1,
      consecutiveCorrect: 1,
      dueAt: "2026-08-03T10:00:00.000Z",
      algorithmVersion: "srs-v0" as const,
    },
  ],
};

function session(userId = USER_ID) {
  return { accessToken: "header.payload.signature", userId };
}

describe("client partagé de progression par leçon", () => {
  it("envoie le Bearer, valide la version et relit la session après réponse", async () => {
    const getSession = vi.fn(() => Promise.resolve(session()));
    const fetch = vi.fn((url: string, init: RequestInit) => {
      expect(url).toBe(
        `https://preview.thainaute.test/api/v1/progress/lessons/${VERSION_ID}`,
      );
      expect(init.method).toBe("GET");
      expect((init.headers as Record<string, string>).Authorization).toBe(
        "Bearer header.payload.signature",
      );
      return Promise.resolve(Response.json(responseBody));
    });
    const client = createSyncHttpClient({
      baseUrl: "https://preview.thainaute.test",
      expectedUserId: USER_ID,
      getSession,
      fetch,
    });

    await expect(client.getLessonProgress(VERSION_ID)).resolves.toEqual(
      responseBody,
    );
    expect(getSession).toHaveBeenCalledTimes(2);
  });

  it("refuse un identifiant local invalide sans appel réseau", async () => {
    const fetch = vi.fn();
    const client = createSyncHttpClient({
      baseUrl: "https://preview.thainaute.test",
      expectedUserId: USER_ID,
      getSession: () => session(),
      fetch,
    });

    await expect(client.getLessonProgress("../secret")).rejects.toBeInstanceOf(
      SyncHttpRequestValidationError,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejette une réponse d'une autre version ou contenant itemId", async () => {
    const clientFor = (payload: unknown) =>
      createSyncHttpClient({
        baseUrl: "https://preview.thainaute.test",
        expectedUserId: USER_ID,
        getSession: () => session(),
        fetch: () => Promise.resolve(Response.json(payload)),
      });

    await expect(
      clientFor({
        ...responseBody,
        lessonVersionId: OTHER_USER_ID,
      }).getLessonProgress(VERSION_ID),
    ).rejects.toBeInstanceOf(SyncHttpProtocolError);
    await expect(
      clientFor({
        ...responseBody,
        exercises: [{ ...responseBody.exercises[0], itemId: OTHER_USER_ID }],
      }).getLessonProgress(VERSION_ID),
    ).rejects.toBeInstanceOf(SyncHttpProtocolError);
  });

  it("ne remet pas la progression du compte A après une bascule vers B", async () => {
    let currentSession = session();
    const client = createSyncHttpClient({
      baseUrl: "https://preview.thainaute.test",
      expectedUserId: USER_ID,
      getSession: () => currentSession,
      fetch: () => {
        currentSession = session(OTHER_USER_ID);
        return Promise.resolve(Response.json(responseBody));
      },
    });

    await expect(client.getLessonProgress(VERSION_ID)).rejects.toBeInstanceOf(
      SyncHttpAuthenticationError,
    );
  });

  it("conserve le refus unpublished dans une erreur API fermée", async () => {
    const client = createSyncHttpClient({
      baseUrl: "https://preview.thainaute.test",
      expectedUserId: USER_ID,
      getSession: () => session(),
      fetch: () =>
        Promise.resolve(
          Response.json(
            {
              error: {
                code: "content_not_found",
                message: "Cette version de leçon est introuvable.",
                requestId: REQUEST_ID,
              },
            },
            { status: 404 },
          ),
        ),
    });

    await expect(client.getLessonProgress(VERSION_ID)).rejects.toMatchObject({
      endpoint: "lesson_progress",
      status: 404,
      code: "content_not_found",
    } satisfies Partial<SyncHttpApiError>);
  });
});
