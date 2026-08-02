import {
  apiErrorResponseSchema,
  contentReportResponseSchema,
  type ContentReportResponse,
} from "@thainaute/sync";
import { describe, expect, it, vi } from "vitest";

import {
  ContentReportApiError,
  ContentReportInfrastructureError,
} from "../lib/server/content-report/errors";
import {
  createContentReportHttpHandler,
  unavailableContentReportResponse,
} from "../lib/server/content-report/http";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const IDEMPOTENCY_KEY = "50000000-0000-4000-8000-000000000001";
const VERSION_ID = "31000000-0000-4000-8000-000000000001";
const EXERCISE_ID = "41000000-0000-4000-8000-000000000001";
const VALID_BODY = {
  contentVersionId: VERSION_ID,
  exerciseId: EXERCISE_ID,
  category: "tone",
  platform: "web",
} as const;

function request(
  body: string = JSON.stringify(VALID_BODY),
  headers: Readonly<Record<string, string>> = {},
): Request {
  return new Request("http://localhost/api/v1/content/reports", {
    method: "POST",
    headers: {
      Authorization: "Bearer sensitive-test-token",
      "Content-Type": "application/json; charset=utf-8",
      "Idempotency-Key": IDEMPOTENCY_KEY,
      ...headers,
    },
    body,
  });
}

function dependencies(
  response: ContentReportResponse = { status: "received" },
) {
  return {
    accessTokenVerifier: {
      verify: vi.fn(async () => ({ userId: USER_ID })),
    },
    submit: vi.fn(async () => contentReportResponseSchema.parse(response)),
    requestIdFactory: () => "content-report-request-1",
    reportOperationalFailure: vi.fn(),
  };
}

describe("transport HTTP des signalements linguistiques", () => {
  it.each(["received", "duplicate"] as const)(
    "renvoie la réponse publique fermée %s sans cache",
    async (status) => {
      const deps = dependencies({ status });
      const handler = createContentReportHttpHandler(deps);
      const response = await handler(
        request(
          JSON.stringify({
            ...VALID_BODY,
            contentVersionId: VERSION_ID.toUpperCase(),
            exerciseId: EXERCISE_ID.toUpperCase(),
          }),
        ),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.get("x-request-id")).toBe(
        "content-report-request-1",
      );
      expect(await response.json()).toEqual({ status });
      expect(deps.submit).toHaveBeenCalledWith({
        userId: USER_ID,
        idempotencyKey: IDEMPOTENCY_KEY,
        report: VALID_BODY,
      });
    },
  );

  it("refuse un compte absent ou anonyme avant de lire le cas d'usage", async () => {
    const deps = dependencies();
    deps.accessTokenVerifier.verify.mockRejectedValueOnce(
      new ContentReportApiError("unauthorized"),
    );
    const response = await createContentReportHttpHandler(deps)(request());

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe("Bearer");
    expect(await response.json()).toMatchObject({
      error: { code: "unauthorized" },
    });
    expect(deps.submit).not.toHaveBeenCalled();
  });

  it("refuse tout texte libre et tout identifiant d'item fourni par le client", async () => {
    const handler = createContentReportHttpHandler(dependencies());

    for (const extra of [
      { comment: "texte sensible" },
      { itemId: "32000000-0000-4000-8000-000000000001" },
    ]) {
      const response = await handler(
        request(JSON.stringify({ ...VALID_BODY, ...extra })),
      );
      expect(response.status).toBe(422);
      expect(await response.json()).toMatchObject({
        error: { code: "invalid_request" },
      });
    }
  });

  it("distingue JSON, média, clé et corps trop volumineux", async () => {
    const handler = createContentReportHttpHandler(dependencies());
    const invalidJson = await handler(request("{"));
    const invalidMedia = await handler(
      request(undefined, { "Content-Type": "text/plain" }),
    );
    const invalidKey = await handler(
      request(undefined, { "Idempotency-Key": "not-a-uuid" }),
    );
    const oversized = await handler(
      request(JSON.stringify({ value: "x".repeat(5_000) })),
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
    expect(oversized.status).toBe(413);
    expect(await oversized.json()).toMatchObject({
      error: { code: "payload_too_large" },
    });
  });

  it("ferme les pannes Auth et masque les exceptions sensibles", async () => {
    const authDeps = dependencies();
    authDeps.accessTokenVerifier.verify.mockRejectedValueOnce(
      new ContentReportInfrastructureError("auth_unavailable"),
    );
    const authResponse =
      await createContentReportHttpHandler(authDeps)(request());
    expect(authResponse.status).toBe(503);
    expect(await authResponse.json()).toMatchObject({
      error: { code: "auth_unavailable" },
    });

    const submitDeps = dependencies();
    submitDeps.submit.mockRejectedValueOnce(
      new Error("SUPABASE_SECRET_KEY=secret-value sensitive-test-token"),
    );
    const submitResponse =
      await createContentReportHttpHandler(submitDeps)(request());
    const serialized = JSON.stringify(await submitResponse.json());
    expect(submitResponse.status).toBe(500);
    expect(serialized).not.toContain("secret-value");
    expect(serialized).not.toContain("sensitive-test-token");
    expect(submitDeps.reportOperationalFailure).toHaveBeenCalledWith({
      operation: "content_report",
      errorKind: "internal_error",
      requestId: "content-report-request-1",
    });
  });

  it("reste indisponible lorsque le mode n'est pas activé", async () => {
    const response = unavailableContentReportResponse();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(apiErrorResponseSchema.safeParse(body).success).toBe(true);
    expect(body).toMatchObject({ error: { code: "database_unavailable" } });
  });
});
