import { describe, expect, it } from "vitest";

import {
  SyncHttpApiError,
  SyncHttpAuthenticationError,
  SyncHttpConfigurationError,
  SyncHttpProtocolError,
  SyncHttpRequestValidationError,
  SyncHttpTransportError,
  createAttemptOutboxSnapshot,
  createSyncHttpClient,
  deviceRegistrationRequestSchema,
  enqueueAttempt,
  prepareAttemptOutboxBatch,
  progressSnapshotResponseSchema,
  type PreparedAttemptOutboxBatch,
  type SyncFetch,
} from "../src/index";

const ids = {
  user: "10000000-0000-4000-8000-000000000001",
  otherUser: "10000000-0000-4000-8000-000000000002",
  device: "20000000-0000-4000-8000-000000000001",
  event: "30000000-0000-4000-8000-000000000001",
  otherEvent: "30000000-0000-4000-8000-000000000002",
  exercise: "40000000-0000-4000-8000-000000000001",
  option: "50000000-0000-4000-8000-000000000001",
  contentVersion: "60000000-0000-4000-8000-000000000001",
  batch: "70000000-0000-4000-8000-000000000001",
  otherBatch: "70000000-0000-4000-8000-000000000002",
  item: "80000000-0000-4000-8000-000000000001",
  request: "90000000-0000-4000-8000-000000000001",
} as const;

const SECRET_TOKEN = "header.payload.sensitive-token";
const authenticatedSession = (userId: string = ids.user) => ({
  accessToken: SECRET_TOKEN,
  userId,
});
const attempt = {
  eventId: ids.event,
  deviceId: ids.device,
  exerciseId: ids.exercise,
  selectedOptionId: ids.option,
  answeredAt: "2026-08-01T10:00:00.000Z",
  durationMs: 1_200,
  contentVersionId: ids.contentVersion,
  algorithmVersion: "srs-v0" as const,
};
const prepared: PreparedAttemptOutboxBatch = {
  idempotencyKey: ids.batch,
  batch: { attempts: [attempt] },
};
const acceptedResponse = {
  syncRevision: 1,
  results: [{ eventId: ids.event, status: "accepted" as const, rating: 1 }],
  states: [],
};

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function headersOf(init: RequestInit): Record<string, string> {
  return init.headers as Record<string, string>;
}

function bodyOf(init: RequestInit): string {
  if (typeof init.body !== "string") {
    throw new Error("Le test exige un corps JSON sérialisé.");
  }
  return init.body;
}

describe("contrats HTTP clients partagés", () => {
  it("normalise l'appareil et ferme les champs ajoutés", () => {
    expect(
      deviceRegistrationRequestSchema.parse({
        deviceId: ids.device.toUpperCase(),
        platform: "android",
        appVersion: "1.2.3-beta+42",
      }),
    ).toEqual({
      deviceId: ids.device,
      platform: "android",
      appVersion: "1.2.3-beta+42",
    });

    expect(
      deviceRegistrationRequestSchema.safeParse({
        deviceId: ids.device,
        platform: "web",
        appVersion: "1.0.0",
        userId: ids.user,
      }).success,
    ).toBe(false);
  });

  it("ferme, borne et ordonne le snapshot de progression", () => {
    const state = {
      itemId: ids.item,
      skill: "listening" as const,
      masteryPermille: 250,
      status: "learning" as const,
      attemptCount: 1,
      successfulAttempts: 1,
      consecutiveCorrect: 1,
      dueAt: "2026-08-02T10:00:00.000Z",
      algorithmVersion: "srs-v0" as const,
    };

    expect(
      progressSnapshotResponseSchema.safeParse({
        syncRevision: 0,
        states: [state],
      }).success,
    ).toBe(true);
    expect(
      progressSnapshotResponseSchema.safeParse({
        syncRevision: -1,
        states: [],
      }).success,
    ).toBe(false);
    expect(
      progressSnapshotResponseSchema.safeParse({
        syncRevision: 1,
        states: [state, state],
      }).success,
    ).toBe(false);
    expect(
      progressSnapshotResponseSchema.safeParse({
        syncRevision: 1,
        states: [],
        userId: ids.user,
      }).success,
    ).toBe(false);
  });
});

describe("client HTTP de synchronisation", () => {
  it("enregistre un appareil avec un Bearer relu à la demande", async () => {
    const calls: Array<{ readonly url: string; readonly init: RequestInit }> =
      [];
    let tokenReads = 0;
    const fetchImplementation: SyncFetch = (url, init) => {
      calls.push({ url, init });
      return Promise.resolve(
        jsonResponse({
          device: {
            deviceId: ids.device,
            platform: "web",
            appVersion: "1.0.0",
            registeredAt: "2026-08-01T10:00:00.000Z",
          },
        }),
      );
    };
    const client = createSyncHttpClient({
      baseUrl: "https://api.example.test/root/",
      expectedUserId: ids.user,
      getSession: () => {
        tokenReads += 1;
        return authenticatedSession();
      },
      fetch: fetchImplementation,
    });

    await expect(
      client.registerDevice({
        deviceId: ids.device.toUpperCase(),
        platform: "web",
        appVersion: "1.0.0",
      }),
    ).resolves.toMatchObject({ device: { deviceId: ids.device } });

    expect(tokenReads).toBe(1);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(
      "https://api.example.test/root/api/v1/devices/register",
    );
    expect(calls[0]?.init.method).toBe("POST");
    expect(headersOf(calls[0]?.init ?? {}).Authorization).toBe(
      `Bearer ${SECRET_TOKEN}`,
    );
    expect(JSON.parse(bodyOf(calls[0]?.init ?? {}))).toMatchObject({
      deviceId: ids.device,
    });
  });

  it("rejette une réponse d'appareil qui ne correspond pas à la commande", async () => {
    const client = createSyncHttpClient({
      baseUrl: "",
      expectedUserId: ids.user,
      getSession: () => authenticatedSession(),
      fetch: () =>
        Promise.resolve(
          jsonResponse({
            device: {
              deviceId: ids.device,
              platform: "ios",
              appVersion: "1.0.0",
              registeredAt: "2026-08-01T10:00:00.000Z",
            },
          }),
        ),
    });

    await expect(
      client.registerDevice({
        deviceId: ids.device,
        platform: "web",
        appVersion: "1.0.0",
      }),
    ).rejects.toMatchObject({
      name: "SyncHttpProtocolError",
      reason: "response_mismatch",
    });
  });

  it("coupe le réseau si la session change de compte entre deux appels", async () => {
    let sessionReads = 0;
    let fetchCalls = 0;
    const client = createSyncHttpClient({
      baseUrl: "",
      expectedUserId: ids.user,
      getSession: () => {
        sessionReads += 1;
        return authenticatedSession(
          sessionReads === 1 ? ids.user : ids.otherUser,
        );
      },
      fetch: () => {
        fetchCalls += 1;
        return Promise.resolve(
          jsonResponse({
            device: {
              deviceId: ids.device,
              platform: "web",
              appVersion: "1.0.0",
              registeredAt: "2026-08-01T10:00:00.000Z",
            },
          }),
        );
      },
    });

    await client.registerDevice({
      deviceId: ids.device,
      platform: "web",
      appVersion: "1.0.0",
    });
    await expect(client.getProgressSnapshot()).rejects.toBeInstanceOf(
      SyncHttpAuthenticationError,
    );
    expect(fetchCalls).toBe(1);
  });

  it("réutilise la clé durable après panne et relit le jeton", async () => {
    const sentKeys: string[] = [];
    let fetchCalls = 0;
    let tokenReads = 0;
    const fetchImplementation: SyncFetch = (_url, init) => {
      fetchCalls += 1;
      sentKeys.push(headersOf(init)["Idempotency-Key"] ?? "missing");
      if (fetchCalls === 1) {
        return Promise.reject(new Error(`network bearer=${SECRET_TOKEN}`));
      }
      return Promise.resolve(jsonResponse(acceptedResponse));
    };
    const client = createSyncHttpClient({
      baseUrl: "https://api.example.test",
      expectedUserId: ids.user,
      getSession: () => {
        tokenReads += 1;
        return authenticatedSession();
      },
      fetch: fetchImplementation,
    });

    let firstFailure: unknown;
    try {
      await client.sendAttemptBatch(prepared);
    } catch (error) {
      firstFailure = error;
    }
    expect(firstFailure).toBeInstanceOf(SyncHttpTransportError);
    expect(String(firstFailure)).not.toContain(SECRET_TOKEN);
    await expect(client.sendAttemptBatch(prepared)).resolves.toEqual(
      acceptedResponse,
    );

    expect(sentKeys).toEqual([ids.batch, ids.batch]);
    expect(tokenReads).toBe(2);
  });

  it("n'acquitte pas l'outbox sur panne ou réponse incohérente", async () => {
    const queued = enqueueAttempt(
      createAttemptOutboxSnapshot({ kind: "account", userId: ids.user }),
      attempt,
    );
    const firstPreparation = prepareAttemptOutboxBatch(queued, ids.batch);
    if (firstPreparation.prepared === null) {
      throw new Error("Le test exige un lot préparé.");
    }
    const durableSnapshot = structuredClone(firstPreparation.snapshot);
    let call = 0;
    const client = createSyncHttpClient({
      baseUrl: "",
      expectedUserId: ids.user,
      getSession: () => authenticatedSession(),
      fetch: () => {
        call += 1;
        if (call === 1) return Promise.reject(new Error("offline"));
        return Promise.resolve(
          jsonResponse({
            ...acceptedResponse,
            results: [
              {
                eventId: ids.otherEvent,
                status: "accepted",
                rating: 1,
              },
            ],
          }),
        );
      },
    });

    await expect(
      client.sendAttemptBatch(firstPreparation.prepared),
    ).rejects.toBeInstanceOf(SyncHttpTransportError);
    await expect(
      client.sendAttemptBatch(firstPreparation.prepared),
    ).rejects.toMatchObject({
      name: "SyncHttpProtocolError",
      reason: "response_mismatch",
    });

    expect(firstPreparation.snapshot).toEqual(durableSnapshot);
    expect(
      prepareAttemptOutboxBatch(firstPreparation.snapshot, ids.otherBatch)
        .prepared,
    ).toEqual(firstPreparation.prepared);
  });

  it("expose une erreur API typée sans recopier le message serveur", async () => {
    const client = createSyncHttpClient({
      baseUrl: "",
      expectedUserId: ids.user,
      getSession: () => authenticatedSession(),
      fetch: () =>
        Promise.resolve(
          jsonResponse(
            {
              error: {
                code: "database_unavailable",
                message: `internal secret ${SECRET_TOKEN}`,
                requestId: ids.request,
              },
            },
            503,
          ),
        ),
    });

    let failure: unknown;
    try {
      await client.sendAttemptBatch(prepared);
    } catch (error) {
      failure = error;
    }

    expect(failure).toBeInstanceOf(SyncHttpApiError);
    expect(failure).toMatchObject({
      code: "database_unavailable",
      status: 503,
      requestId: ids.request,
      retryable: true,
    });
    expect(String(failure)).not.toContain(SECRET_TOKEN);
  });

  it("refuse les enveloppes d'erreur, JSON et médias non conformes", async () => {
    const responses = [
      jsonResponse(
        { error: { code: "unknown", message: "non contractuel" } },
        500,
      ),
      new Response("{", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
      new Response(JSON.stringify(acceptedResponse), {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      }),
    ];
    const client = createSyncHttpClient({
      baseUrl: "",
      expectedUserId: ids.user,
      getSession: () => authenticatedSession(),
      fetch: () =>
        Promise.resolve(responses.shift() ?? jsonResponse(acceptedResponse)),
    });

    await expect(client.sendAttemptBatch(prepared)).rejects.toMatchObject({
      reason: "invalid_error_response",
      retryable: true,
    });
    await expect(client.sendAttemptBatch(prepared)).rejects.toMatchObject({
      reason: "invalid_json",
    });
    await expect(client.sendAttemptBatch(prepared)).rejects.toMatchObject({
      reason: "invalid_content_type",
    });
  });

  it("hydrate le snapshot par GET sans cookie ni clé d'idempotence", async () => {
    const calls: RequestInit[] = [];
    const client = createSyncHttpClient({
      baseUrl: "",
      expectedUserId: ids.user,
      getSession: () => authenticatedSession(),
      fetch: (url, init) => {
        expect(url).toBe("/api/v1/progress/snapshot");
        calls.push(init);
        return Promise.resolve(jsonResponse({ syncRevision: 0, states: [] }));
      },
    });

    await expect(client.getProgressSnapshot()).resolves.toEqual({
      syncRevision: 0,
      states: [],
    });
    expect(calls[0]?.method).toBe("GET");
    expect(calls[0]?.credentials).toBe("omit");
    expect(calls[0]?.body).toBeUndefined();
    expect(headersOf(calls[0] ?? {})["Idempotency-Key"]).toBeUndefined();
  });

  it("refuse un snapshot 2xx invalide", async () => {
    const client = createSyncHttpClient({
      baseUrl: "",
      expectedUserId: ids.user,
      getSession: () => authenticatedSession(),
      fetch: () =>
        Promise.resolve(jsonResponse({ syncRevision: -1, states: [] })),
    });

    await expect(client.getProgressSnapshot()).rejects.toMatchObject({
      name: "SyncHttpProtocolError",
      reason: "invalid_success_response",
    });
  });

  it("échoue avant le réseau sans jeton ou avec une requête locale invalide", async () => {
    let fetchCalls = 0;
    const noTokenClient = createSyncHttpClient({
      baseUrl: "",
      expectedUserId: ids.user,
      getSession: () => null,
      fetch: () => {
        fetchCalls += 1;
        return Promise.resolve(jsonResponse({ syncRevision: 0, states: [] }));
      },
    });
    await expect(noTokenClient.getProgressSnapshot()).rejects.toBeInstanceOf(
      SyncHttpAuthenticationError,
    );

    const invalidRequestClient = createSyncHttpClient({
      baseUrl: "",
      expectedUserId: ids.user,
      getSession: () => authenticatedSession(),
      fetch: () => {
        fetchCalls += 1;
        return Promise.resolve(jsonResponse(acceptedResponse));
      },
    });
    await expect(
      invalidRequestClient.sendAttemptBatch({
        ...prepared,
        idempotencyKey: "not-a-uuid",
      }),
    ).rejects.toBeInstanceOf(SyncHttpRequestValidationError);

    expect(fetchCalls).toBe(0);
  });

  it("exige HTTPS hors dérogation locale et borne une requête suspendue", async () => {
    expect(() =>
      createSyncHttpClient({
        baseUrl: "http://api.example.test",
        expectedUserId: ids.user,
        getSession: () => authenticatedSession(),
        fetch: () => Promise.resolve(jsonResponse({})),
      }),
    ).toThrow(SyncHttpConfigurationError);

    const client = createSyncHttpClient({
      baseUrl: "http://127.0.0.1:3000",
      allowInsecureHttp: true,
      expectedUserId: ids.user,
      getSession: () => authenticatedSession(),
      timeoutMs: 5,
      fetch: (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener("abort", () =>
            reject(new Error("aborted")),
          );
        }),
    });

    await expect(client.getProgressSnapshot()).rejects.toBeInstanceOf(
      SyncHttpTransportError,
    );
  });

  it("borne aussi la lecture d'un corps reçu mais suspendu", async () => {
    const client = createSyncHttpClient({
      baseUrl: "",
      expectedUserId: ids.user,
      getSession: () => authenticatedSession(),
      timeoutMs: 5,
      fetch: (_url, init) =>
        Promise.resolve({
          headers: new Headers({ "content-type": "application/json" }),
          json: () =>
            new Promise<unknown>((_resolve, reject) => {
              init.signal?.addEventListener("abort", () =>
                reject(new Error("aborted")),
              );
            }),
          ok: true,
          status: 200,
        } as Response),
    });

    await expect(client.getProgressSnapshot()).rejects.toBeInstanceOf(
      SyncHttpTransportError,
    );
  });

  it("classe une réponse 2xx valide mais enrichie comme violation du protocole", async () => {
    const client = createSyncHttpClient({
      baseUrl: "",
      expectedUserId: ids.user,
      getSession: () => authenticatedSession(),
      fetch: () =>
        Promise.resolve(
          jsonResponse({ ...acceptedResponse, internalUserId: ids.user }),
        ),
    });

    await expect(client.sendAttemptBatch(prepared)).rejects.toBeInstanceOf(
      SyncHttpProtocolError,
    );
  });
});
