import { describe, expect, it, vi } from "vitest";
import type { AccountExportDocument } from "@thainaute/sync";

import { AccountExportApiError } from "../lib/server/account-export/errors";
import { createAccountExportHttpHandler } from "../lib/server/account-export/http";

const REQUEST_ID = "10000000-0000-4000-8000-000000000001";
const USER_ID = "20000000-0000-4000-8000-000000000001";
const ACCESS_TOKEN = "header.payload.sensitive-token";
const DEVICE_ID = "30000000-0000-4000-8000-000000000001";
const document: AccountExportDocument = {
  format: "thainaute.account-export/v2" as const,
  exportedAt: "2026-08-02T10:00:00.000Z",
  identity: {
    id: USER_ID,
    email: "selim@example.test",
    phone: null,
    providers: ["email"],
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: null,
    lastSignInAt: "2026-08-02T08:00:00.000Z",
    emailConfirmedAt: "2026-08-01T09:01:00.000Z",
    phoneConfirmedAt: null,
  },
  data: {
    profile: {
      createdAt: "2026-08-01T09:00:01.000Z",
      syncRevision: 4,
    },
    devices: [
      {
        id: DEVICE_ID,
        platform: "web",
        appVersion: "1.0.0",
        createdAt: "2026-08-01T09:00:02.000Z",
      },
    ],
    attemptEvents: [
      {
        eventId: "40000000-0000-4000-8000-000000000001",
        deviceId: DEVICE_ID,
        exerciseId: "50000000-0000-4000-8000-000000000001",
        itemId: "60000000-0000-4000-8000-000000000001",
        lessonVersionId: "70000000-0000-4000-8000-000000000001",
        selectedOptionId: "80000000-0000-4000-8000-000000000001",
        answer: null,
        skill: "listening",
        rating: 1,
        answeredAt: "2026-08-01T10:00:00.000Z",
        durationMs: 1_000,
        algorithmVersion: "srs-v0",
        payloadSha256: "a".repeat(64),
        receivedAt: "2026-08-01T10:00:01.000Z",
      },
      {
        eventId: "40000000-0000-4000-8000-000000000002",
        deviceId: DEVICE_ID,
        exerciseId: "50000000-0000-4000-8000-000000000002",
        itemId: "60000000-0000-4000-8000-000000000002",
        lessonVersionId: "70000000-0000-4000-8000-000000000001",
        selectedOptionId: null,
        answer: {
          kind: "association",
          pairs: [
            {
              promptPairId: "80000000-0000-4000-8000-000000000002",
              chosenPairId: "80000000-0000-4000-8000-000000000003",
            },
          ],
        },
        skill: "reading",
        rating: 1,
        answeredAt: "2026-08-01T10:01:00.000Z",
        durationMs: 2_000,
        algorithmVersion: "srs-v0",
        payloadSha256: "b".repeat(64),
        receivedAt: "2026-08-01T10:01:01.000Z",
      },
      {
        eventId: "40000000-0000-4000-8000-000000000003",
        deviceId: DEVICE_ID,
        exerciseId: "50000000-0000-4000-8000-000000000003",
        itemId: "60000000-0000-4000-8000-000000000003",
        lessonVersionId: "70000000-0000-4000-8000-000000000001",
        selectedOptionId: null,
        answer: {
          kind: "word_order",
          tokenIds: [
            "80000000-0000-4000-8000-000000000004",
            "80000000-0000-4000-8000-000000000005",
          ],
        },
        skill: "production",
        rating: 0,
        answeredAt: "2026-08-01T10:02:00.000Z",
        durationMs: 3_000,
        algorithmVersion: "srs-v0",
        payloadSha256: "c".repeat(64),
        receivedAt: "2026-08-01T10:02:01.000Z",
      },
      {
        eventId: "40000000-0000-4000-8000-000000000004",
        deviceId: DEVICE_ID,
        exerciseId: "50000000-0000-4000-8000-000000000004",
        itemId: "60000000-0000-4000-8000-000000000004",
        lessonVersionId: "70000000-0000-4000-8000-000000000001",
        selectedOptionId: null,
        answer: { kind: "recall", value: "ไม่เป็นไรครับ" },
        skill: "recall",
        rating: 1,
        answeredAt: "2026-08-01T10:03:00.000Z",
        durationMs: 4_000,
        algorithmVersion: "srs-v0",
        payloadSha256: "d".repeat(64),
        receivedAt: "2026-08-01T10:03:01.000Z",
      },
    ],
    learnerItemStates: [],
    contentReports: [],
  },
};

function request(token = ACCESS_TOKEN): Request {
  return new Request("https://thainaute.example/api/v1/account/export", {
    headers: token === "" ? {} : { Authorization: `Bearer ${token}` },
  });
}

describe("GET /api/v1/account/export", () => {
  it("télécharge toutes les formes de réponse avec des headers privés", async () => {
    const exportAccount = vi.fn(() => Promise.resolve(document));
    const response = await createAccountExportHttpHandler({
      exportAccount,
      requestIdFactory: () => REQUEST_ID,
    })(request());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(response.headers.get("vary")).toBe("Authorization");
    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="thainaute-account-export-v2.json"',
    );
    expect(response.headers.get("content-type")).toBe(
      "application/json; charset=utf-8",
    );
    expect(response.headers.get("x-request-id")).toBe(REQUEST_ID);
    const body = await response.json();
    expect(body).toEqual(document);
    expect(
      body.data.attemptEvents.map(
        (attempt: AccountExportDocument["data"]["attemptEvents"][number]) =>
          attempt.answer?.kind ?? "option",
      ),
    ).toEqual(["option", "association", "word_order", "recall"]);
    expect(exportAccount).toHaveBeenCalledWith({
      accessToken: ACCESS_TOKEN,
      signal: expect.any(AbortSignal),
    });
  });

  it("refuse l'absence de Bearer avant l'export", async () => {
    const exportAccount = vi.fn();
    const response = await createAccountExportHttpHandler({
      exportAccount,
      requestIdFactory: () => REQUEST_ID,
    })(request(""));

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe("Bearer");
    expect(exportAccount).not.toHaveBeenCalled();
  });

  it("refuse le document entier au-dessus de la borne UTF-8", async () => {
    const response = await createAccountExportHttpHandler({
      exportAccount: () => Promise.resolve(document),
      requestIdFactory: () => REQUEST_ID,
      maxJsonBytes: 10,
    })(request());

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "export_capacity_exceeded", requestId: REQUEST_ID },
    });
    expect(response.headers.get("content-disposition")).toBeNull();
  });

  it("ne remet aucun fichier si une réponse persistée est malformée", async () => {
    const optionAttempt = document.data.attemptEvents[0];
    if (optionAttempt === undefined) {
      throw new Error("La fixture d'export doit contenir une tentative.");
    }
    const malformedDocument: AccountExportDocument = {
      ...document,
      data: {
        ...document.data,
        attemptEvents: [
          {
            ...optionAttempt,
            selectedOptionId: null,
            answer: null,
          },
        ],
      },
    };
    const response = await createAccountExportHttpHandler({
      exportAccount: () => Promise.resolve(malformedDocument),
      requestIdFactory: () => REQUEST_ID,
    })(request());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "internal_error", requestId: REQUEST_ID },
    });
    expect(response.headers.get("content-disposition")).toBeNull();
  });

  it("borne la durée globale et annule le signal de travail", async () => {
    let exportSignal: AbortSignal | undefined;
    const response = await createAccountExportHttpHandler({
      exportAccount: ({ signal }) => {
        exportSignal = signal;
        return new Promise(() => undefined);
      },
      requestIdFactory: () => REQUEST_ID,
      timeoutMs: 5,
    })(request());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "database_unavailable" },
    });
    expect(exportSignal?.aborted).toBe(true);
  });

  it("journalise seulement une panne opérationnelle fermée", async () => {
    const report = vi.fn();
    const response = await createAccountExportHttpHandler({
      exportAccount: () =>
        Promise.reject(
          new Error(`${ACCESS_TOKEN} selim@example.test ${USER_ID}`),
        ),
      requestIdFactory: () => REQUEST_ID,
      reportOperationalFailure: report,
    })(request());

    expect(response.status).toBe(500);
    expect(report).toHaveBeenCalledWith({
      operation: "account_export",
      errorKind: "internal_error",
      requestId: REQUEST_ID,
    });
    const reported = JSON.stringify(report.mock.calls);
    expect(reported).not.toContain(ACCESS_TOKEN);
    expect(reported).not.toContain("selim@example.test");
    expect(reported).not.toContain(USER_ID);
    expect(await response.text()).not.toContain(ACCESS_TOKEN);
  });

  it("propage un refus Auth contractuel sans le journaliser", async () => {
    const report = vi.fn();
    const response = await createAccountExportHttpHandler({
      exportAccount: () =>
        Promise.reject(new AccountExportApiError("unauthorized")),
      requestIdFactory: () => REQUEST_ID,
      reportOperationalFailure: report,
    })(request());

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe("Bearer");
    expect(report).not.toHaveBeenCalled();
  });
});
