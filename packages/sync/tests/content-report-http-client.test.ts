import { describe, expect, it } from "vitest";

import {
  SyncHttpApiError,
  SyncHttpAuthenticationError,
  SyncHttpProtocolError,
  SyncHttpRequestValidationError,
  SyncHttpTransportError,
  classifyContentReportRejection,
  createSyncHttpClient,
  type SyncFetch,
} from "../src/index";

const ids = {
  user: "10000000-0000-4000-8000-000000000001",
  exercise: "40000000-0000-4000-8000-000000000001",
  contentVersion: "60000000-0000-4000-8000-000000000001",
  request: "90000000-0000-4000-8000-000000000001",
} as const;
const SECRET_TOKEN = "header.payload.sensitive-token";
const contentReportEntry = {
  idempotencyKey: ids.request,
  body: {
    contentVersionId: ids.contentVersion,
    exerciseId: ids.exercise,
    category: "tone" as const,
    platform: "android" as const,
  },
  createdAt: "2026-08-02T10:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function headersOf(init: RequestInit): Record<string, string> {
  return init.headers as Record<string, string>;
}

function bodyOf(init: RequestInit): string {
  if (typeof init.body !== "string") throw new Error("Expected JSON body.");
  return init.body;
}

function client(fetchImplementation: SyncFetch) {
  return createSyncHttpClient({
    baseUrl: "https://api.example.test/root/",
    expectedUserId: ids.user,
    getSession: () => ({
      accessToken: SECRET_TOKEN,
      userId: ids.user,
    }),
    fetch: fetchImplementation,
  });
}

describe("transport partagé des signalements linguistiques", () => {
  it.each(["received", "duplicate"] as const)(
    "envoie le contrat strict et accepte le statut %s",
    async (status) => {
      const calls: Array<{ readonly url: string; readonly init: RequestInit }> =
        [];
      const httpClient = client((url, init) => {
        calls.push({ url, init });
        return Promise.resolve(jsonResponse({ status }));
      });

      await expect(
        httpClient.sendContentReport(contentReportEntry),
      ).resolves.toEqual({ status });
      expect(calls).toHaveLength(1);
      expect(calls[0]?.url).toBe(
        "https://api.example.test/root/api/v1/content/reports",
      );
      expect(calls[0]?.init).toMatchObject({
        method: "POST",
        credentials: "omit",
      });
      expect(headersOf(calls[0]?.init ?? {})).toMatchObject({
        Authorization: `Bearer ${SECRET_TOKEN}`,
        "Content-Type": "application/json",
        "Idempotency-Key": ids.request,
      });
      expect(JSON.parse(bodyOf(calls[0]?.init ?? {}))).toEqual(
        contentReportEntry.body,
      );
      expect(bodyOf(calls[0]?.init ?? {})).not.toContain("createdAt");
    },
  );

  it("refuse un champ libre avant tout appel réseau", async () => {
    let called = false;
    const httpClient = client(() => {
      called = true;
      return Promise.resolve(jsonResponse({ status: "received" }));
    });

    await expect(
      httpClient.sendContentReport({
        ...contentReportEntry,
        body: { ...contentReportEntry.body, comment: "interdit" },
      } as never),
    ).rejects.toBeInstanceOf(SyncHttpRequestValidationError);
    expect(called).toBe(false);
  });

  it("refuse toute réponse enrichie ou inconnue", async () => {
    for (const payload of [
      { status: "accepted" },
      { status: "received", reportId: ids.request },
    ]) {
      const httpClient = client(() => Promise.resolve(jsonResponse(payload)));
      await expect(
        httpClient.sendContentReport(contentReportEntry),
      ).rejects.toEqual(
        expect.objectContaining({
          endpoint: "content_report",
          reason: "invalid_success_response",
        } satisfies Partial<SyncHttpProtocolError>),
      );
    }
  });

  it("refuse d'acquitter après une bascule de compte A→B", async () => {
    let sessionReads = 0;
    const httpClient = createSyncHttpClient({
      baseUrl: "https://api.example.test/",
      expectedUserId: ids.user,
      getSession: () => {
        sessionReads += 1;
        return {
          accessToken: SECRET_TOKEN,
          userId:
            sessionReads === 1
              ? ids.user
              : "10000000-0000-4000-8000-000000000002",
        };
      },
      fetch: () => Promise.resolve(jsonResponse({ status: "received" })),
    });

    await expect(
      httpClient.sendContentReport(contentReportEntry),
    ).rejects.toMatchObject({
      endpoint: "content_report",
      retryable: false,
    });
    expect(sessionReads).toBe(2);
  });

  it("reclasse une erreur API sans exposer le Bearer", async () => {
    const httpClient = client(() =>
      Promise.resolve(
        jsonResponse(
          {
            error: {
              code: "idempotency_key_reused",
              message: "Cette clé existe déjà.",
              requestId: ids.request,
            },
          },
          409,
        ),
      ),
    );

    const failure = await httpClient
      .sendContentReport(contentReportEntry)
      .catch((error: unknown) => error);
    expect(failure).toMatchObject({
      endpoint: "content_report",
      status: 409,
      code: "idempotency_key_reused",
      requestId: ids.request,
      retryable: false,
    });
    expect(String(failure)).not.toContain(SECRET_TOKEN);
  });

  it("ne remet pas un conflit permanent du compte A après A→B", async () => {
    let currentUserId: string = ids.user;
    let sessionReads = 0;
    const httpClient = createSyncHttpClient({
      baseUrl: "https://api.example.test/",
      expectedUserId: ids.user,
      getSession: () => {
        sessionReads += 1;
        return { accessToken: SECRET_TOKEN, userId: currentUserId };
      },
      fetch: () => {
        currentUserId = "10000000-0000-4000-8000-000000000002";
        return Promise.resolve(
          jsonResponse(
            {
              error: {
                code: "idempotency_key_reused",
                message: "Cette clé existe déjà.",
                requestId: ids.request,
              },
            },
            409,
          ),
        );
      },
    });

    await expect(
      httpClient.sendContentReport(contentReportEntry),
    ).rejects.toBeInstanceOf(SyncHttpAuthenticationError);
    expect(sessionReads).toBe(2);
  });

  it.each([
    {
      status: 409,
      code: "idempotency_key_reused" as const,
      reason: "idempotency_key_reused",
    },
    {
      status: 422,
      code: "invalid_request" as const,
      reason: "invalid_request",
    },
  ])(
    "classe le refus permanent $status/$code dans le contrat fermé",
    ({ status, code, reason }) => {
      expect(
        classifyContentReportRejection(
          new SyncHttpApiError({ endpoint: "content_report", status, code }),
        ),
      ).toBe(reason);
    },
  );

  it("ne classe jamais auth, suppression, transport, débit, 5xx ou protocole", () => {
    const excluded: unknown[] = [
      new SyncHttpApiError({
        endpoint: "content_report",
        status: 401,
        code: "unauthorized",
      }),
      new SyncHttpApiError({
        endpoint: "content_report",
        status: 409,
        code: "deletion_in_progress",
      }),
      new SyncHttpApiError({
        endpoint: "content_report",
        status: 429,
        code: "invalid_request",
      }),
      new SyncHttpApiError({
        endpoint: "content_report",
        status: 503,
        code: "database_unavailable",
      }),
      new SyncHttpApiError({
        endpoint: "attempt_batch",
        status: 422,
        code: "invalid_request",
      }),
      new SyncHttpTransportError("content_report"),
      new SyncHttpProtocolError(
        "content_report",
        "invalid_error_response",
        422,
      ),
    ];

    for (const failure of excluded) {
      expect(classifyContentReportRejection(failure)).toBeNull();
    }
  });
});
