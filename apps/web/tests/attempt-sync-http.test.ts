import {
  apiErrorResponseSchema,
  attemptBatchResponseSchema,
  type AttemptBatchResponse,
} from "@thainaute/sync";
import { describe, expect, it, vi } from "vitest";

import { AttemptInfrastructureError } from "../lib/server/attempt-sync/errors";
import { createAttemptBatchHttpHandler } from "../lib/server/attempt-sync/http";

const IDEMPOTENCY_KEY = "50000000-0000-4000-8000-000000000001";
const EVENT_ID = "40000000-0000-4000-8000-000000000001";
const VALID_BODY = {
  attempts: [
    {
      eventId: EVENT_ID,
      deviceId: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      exerciseId: "41000000-0000-4000-8000-000000000001",
      selectedOptionId: "42000000-0000-4000-8000-000000000001",
      answeredAt: "2026-08-01T10:00:00.000Z",
      durationMs: 1_200,
      contentVersionId: "31000000-0000-4000-8000-000000000001",
      algorithmVersion: "srs-v0",
    },
  ],
};
const SUCCESS_RESPONSE: AttemptBatchResponse = attemptBatchResponseSchema.parse(
  {
    syncRevision: 1,
    results: [{ eventId: EVENT_ID, status: "accepted", rating: 1 }],
    states: [
      {
        itemId: "32000000-0000-4000-8000-000000000001",
        skill: "listening",
        masteryPermille: 250,
        status: "learning",
        attemptCount: 1,
        successfulAttempts: 1,
        consecutiveCorrect: 1,
        dueAt: "2026-08-02T10:00:00.000Z",
        algorithmVersion: "srs-v0",
      },
    ],
  },
);

function request(
  body: string = JSON.stringify(VALID_BODY),
  headers: Readonly<Record<string, string>> = {},
): Request {
  return new Request("http://localhost/api/v1/attempts/batch", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-token",
      "Content-Type": "application/json; charset=utf-8",
      "Idempotency-Key": IDEMPOTENCY_KEY,
      ...headers,
    },
    body,
  });
}

function dependencies() {
  return {
    accessTokenVerifier: {
      verify: vi.fn(async () => ({
        userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      })),
    },
    synchronize: vi.fn(async () => SUCCESS_RESPONSE),
    requestIdFactory: () => "request-test-1",
    reportOperationalFailure: vi.fn(),
  };
}

describe("transport HTTP des tentatives", () => {
  it("répond avec les protections de cache et de contenu", async () => {
    const deps = dependencies();
    const handler = createAttemptBatchHttpHandler(deps);
    const response = await handler(request());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-request-id")).toBe("request-test-1");
    expect(await response.json()).toEqual(SUCCESS_RESPONSE);
    expect(deps.synchronize).toHaveBeenCalledWith({
      userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      idempotencyKey: IDEMPOTENCY_KEY,
      batch: VALID_BODY,
    });
  });

  it("refuse l'absence de Bearer sans appeler le cas d'usage", async () => {
    const deps = dependencies();
    const handler = createAttemptBatchHttpHandler(deps);
    const response = await handler(request(undefined, { Authorization: "" }));

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe("Bearer");
    expect(deps.synchronize).not.toHaveBeenCalled();
    expect(
      apiErrorResponseSchema.safeParse(await response.json()).success,
    ).toBe(true);
  });

  it("refuse les champs autoritaires ajoutés par le client", async () => {
    const deps = dependencies();
    const handler = createAttemptBatchHttpHandler(deps);
    const unsafeBody = {
      ...VALID_BODY,
      attempts: [{ ...VALID_BODY.attempts[0], userId: "victim", rating: 1 }],
    };
    const response = await handler(request(JSON.stringify(unsafeBody)));

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({
      error: { code: "invalid_request" },
    });
    expect(deps.synchronize).not.toHaveBeenCalled();
  });

  it.each([
    ["itemId", "32000000-0000-4000-8000-000000000099"],
    ["skill", "tone"],
  ])(
    "refuse le champ dérivé %s dans le contrat public",
    async (field, value) => {
      const deps = dependencies();
      const handler = createAttemptBatchHttpHandler(deps);
      const unsafeBody = {
        ...VALID_BODY,
        attempts: [{ ...VALID_BODY.attempts[0], [field]: value }],
      };
      const response = await handler(request(JSON.stringify(unsafeBody)));

      expect(response.status).toBe(422);
      expect(await response.json()).toMatchObject({
        error: { code: "invalid_request" },
      });
      expect(deps.synchronize).not.toHaveBeenCalled();
    },
  );

  it("mesure réellement le corps et refuse plus de 64 Kio", async () => {
    const handler = createAttemptBatchHttpHandler(dependencies());
    const response = await handler(
      request(JSON.stringify({ value: "x".repeat(70_000) })),
    );

    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({
      error: { code: "payload_too_large" },
    });
  });

  it("distingue JSON invalide, média et clé invalides", async () => {
    const handler = createAttemptBatchHttpHandler(dependencies());
    const invalidJson = await handler(request("{"));
    const invalidMedia = await handler(
      request(undefined, { "Content-Type": "text/plain" }),
    );
    const invalidKey = await handler(
      request(undefined, { "Idempotency-Key": "not-a-uuid" }),
    );

    expect(await invalidJson.json()).toMatchObject({
      error: { code: "invalid_json" },
    });
    expect(await invalidMedia.json()).toMatchObject({
      error: { code: "unsupported_media_type" },
    });
    expect(await invalidKey.json()).toMatchObject({
      error: { code: "invalid_idempotency_key" },
    });
  });

  it("ne renvoie ni ne journalise l'exception sensible", async () => {
    const deps = dependencies();
    deps.synchronize.mockRejectedValueOnce(
      new Error("SUPABASE_SECRET_KEY=secret-value bearer=test-token"),
    );
    const handler = createAttemptBatchHttpHandler(deps);
    const response = await handler(request());
    const serialized = JSON.stringify(await response.json());

    expect(response.status).toBe(500);
    expect(serialized).not.toContain("secret-value");
    expect(serialized).not.toContain("test-token");
    expect(deps.reportOperationalFailure).toHaveBeenCalledWith({
      operation: "attempt_batch",
      errorKind: "internal_error",
      requestId: "request-test-1",
    });
  });

  it("ferme une panne d'authentification en 503", async () => {
    const deps = dependencies();
    deps.accessTokenVerifier.verify.mockRejectedValueOnce(
      new AttemptInfrastructureError("auth_unavailable"),
    );
    const handler = createAttemptBatchHttpHandler(deps);
    const response = await handler(request());

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error: { code: "auth_unavailable" },
    });
    expect(deps.synchronize).not.toHaveBeenCalled();
  });
});
