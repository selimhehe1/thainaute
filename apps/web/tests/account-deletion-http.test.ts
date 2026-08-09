import { describe, expect, it, vi } from "vitest";

import {
  AccountDeletionApiError,
  AccountDeletionInfrastructureError,
} from "../lib/server/account-deletion/errors";
import { createAccountDeletionHttpHandler } from "../lib/server/account-deletion/http";

const REQUEST_ID = "10000000-0000-4000-8000-000000000001";
const IDEMPOTENCY_KEY = "20000000-0000-4000-8000-000000000001";
const CONTINUATION = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBA";
const RECEIPT = {
  format: "thainaute.account-deletion-receipt/v1" as const,
  receiptId: "30000000-0000-4000-8000-000000000001",
  completedAt: "2026-08-02T10:00:00.000Z",
  deleted: true as const,
};

function request(input?: {
  readonly body?: string;
  readonly headers?: Readonly<Record<string, string>>;
}): Request {
  return new Request("http://localhost/api/v1/account", {
    method: "DELETE",
    headers: {
      Authorization: "Bearer sensitive.jwt",
      "Content-Type": "application/json; charset=utf-8",
      "Idempotency-Key": IDEMPOTENCY_KEY,
      "Account-Deletion-Continuation": CONTINUATION,
      ...input?.headers,
    },
    body: input?.body ?? JSON.stringify({ confirmation: "delete_account" }),
  });
}

function dependencies() {
  return {
    deleteAccount: vi.fn(async () => RECEIPT),
    requestIdFactory: () => REQUEST_ID,
    reportOperationalFailure: vi.fn(),
  };
}

describe("transport HTTP de suppression de compte", () => {
  it("retourne un reçu fermé, sans cache et sans secret", async () => {
    const deps = dependencies();
    const response = await createAccountDeletionHttpHandler(deps)(request());
    const serialized = JSON.stringify(await response.json());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-request-id")).toBe(REQUEST_ID);
    expect(serialized).not.toContain(CONTINUATION);
    expect(serialized).not.toContain("sensitive.jwt");
    expect(deps.deleteAccount).toHaveBeenCalledWith({
      accessToken: "sensitive.jwt",
      request: { confirmation: "delete_account" },
      headers: {
        idempotencyKey: IDEMPOTENCY_KEY,
        continuationSecret: CONTINUATION,
      },
      signal: expect.any(AbortSignal),
    });
  });

  it("autorise une reprise sans Bearer mais laisse le service décider", async () => {
    const deps = dependencies();
    const response = await createAccountDeletionHttpHandler(deps)(
      request({ headers: { Authorization: "" } }),
    );

    // Une valeur présente mais vide est volontairement un Bearer malformé.
    expect(response.status).toBe(401);
    expect(deps.deleteAccount).not.toHaveBeenCalled();

    const noAuthorization = new Headers(request().headers);
    noAuthorization.delete("authorization");
    const resumed = await createAccountDeletionHttpHandler(deps)(
      new Request("http://localhost/api/v1/account", {
        method: "DELETE",
        headers: noAuthorization,
        body: JSON.stringify({ confirmation: "delete_account" }),
      }),
    );
    expect(resumed.status).toBe(200);
    expect(deps.deleteAccount).toHaveBeenLastCalledWith(
      expect.objectContaining({ accessToken: null }),
    );
  });

  it.each([
    ["média absent", { "Content-Type": "" }, undefined],
    ["idempotence invalide", { "Idempotency-Key": "not-a-uuid" }, undefined],
    [
      "continuation invalide",
      { "Account-Deletion-Continuation": "short" },
      undefined,
    ],
    ["confirmation incorrecte", {}, JSON.stringify({ confirmation: "DELETE" })],
    [
      "champ supplémentaire",
      {},
      JSON.stringify({ confirmation: "delete_account", userId: "victim" }),
    ],
  ])("refuse %s avant tout effet", async (_label, headers, body) => {
    const deps = dependencies();
    const response = await createAccountDeletionHttpHandler(deps)(
      request({ headers, ...(body === undefined ? {} : { body }) }),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: { code: "invalid_request", requestId: REQUEST_ID },
    });
    expect(deps.deleteAccount).not.toHaveBeenCalled();
  });

  it("borne les octets réels du corps", async () => {
    const deps = dependencies();
    const response = await createAccountDeletionHttpHandler(deps)(
      request({ body: JSON.stringify({ confirmation: "x".repeat(256) }) }),
    );
    expect(response.status).toBe(400);
    expect(deps.deleteAccount).not.toHaveBeenCalled();
  });

  it("rend la réauthentification explicite et Retry-After seulement pour le travail en cours", async () => {
    const reauth = dependencies();
    reauth.deleteAccount.mockRejectedValueOnce(
      new AccountDeletionApiError("reauthentication_required"),
    );
    const reauthResponse =
      await createAccountDeletionHttpHandler(reauth)(request());
    expect(reauthResponse.status).toBe(403);

    const conflict = dependencies();
    conflict.deleteAccount.mockRejectedValueOnce(
      new AccountDeletionApiError("deletion_in_progress"),
    );
    const response =
      await createAccountDeletionHttpHandler(conflict)(request());
    expect(response.status).toBe(409);
    expect(response.headers.get("retry-after")).toBe("3");

    const reused = dependencies();
    reused.deleteAccount.mockRejectedValueOnce(
      new AccountDeletionApiError("idempotency_key_reused"),
    );
    const reusedResponse =
      await createAccountDeletionHttpHandler(reused)(request());
    expect(reusedResponse.status).toBe(409);
    expect(reusedResponse.headers.get("retry-after")).toBeNull();
  });

  it("ne journalise que le type fermé et l'identifiant de requête", async () => {
    const deps = dependencies();
    deps.deleteAccount.mockRejectedValueOnce(
      new Error(`bearer=sensitive.jwt continuation=${CONTINUATION}`),
    );
    const response = await createAccountDeletionHttpHandler(deps)(request());
    const serialized = JSON.stringify(await response.json());

    expect(response.status).toBe(500);
    expect(serialized).not.toContain("sensitive.jwt");
    expect(serialized).not.toContain(CONTINUATION);
    expect(deps.reportOperationalFailure).toHaveBeenCalledWith({
      operation: "account_deletion",
      errorKind: "internal_error",
      requestId: REQUEST_ID,
    });
  });

  it("mappe les pannes d'infrastructure sans détail amont", async () => {
    for (const code of [
      "billing_unavailable",
      "auth_unavailable",
      "storage_unavailable",
      "database_unavailable",
    ] as const) {
      const deps = dependencies();
      deps.deleteAccount.mockRejectedValueOnce(
        new AccountDeletionInfrastructureError(code),
      );
      const response = await createAccountDeletionHttpHandler(deps)(request());
      expect(response.status).toBe(503);
      expect(await response.json()).toMatchObject({ error: { code } });
      expect(deps.reportOperationalFailure).toHaveBeenCalledWith({
        operation: "account_deletion",
        errorKind: code,
        requestId: REQUEST_ID,
      });
    }
  });

  it("répond in_progress à la deadline afin que le même secret soit rejoué", async () => {
    vi.useFakeTimers();
    try {
      const deps = dependencies();
      deps.deleteAccount.mockImplementationOnce(
        () => new Promise(() => undefined),
      );
      const responsePromise = createAccountDeletionHttpHandler({
        ...deps,
        timeoutMs: 25,
      })(request());
      await vi.advanceTimersByTimeAsync(25);
      const response = await responsePromise;
      expect(response.status).toBe(409);
      expect(await response.json()).toMatchObject({
        error: { code: "deletion_in_progress" },
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("applique aussi la deadline à un corps chunked qui ne se termine pas", async () => {
    vi.useFakeTimers();
    try {
      const deps = dependencies();
      const cancel = vi.fn();
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode('{"confirmation":"delete_account"'),
          );
        },
        cancel,
      });
      const responsePromise = createAccountDeletionHttpHandler({
        ...deps,
        timeoutMs: 25,
      })(
        new Request("http://localhost/api/v1/account", {
          method: "DELETE",
          headers: request().headers,
          body,
          duplex: "half",
        } as RequestInit & { duplex: "half" }),
      );

      await vi.advanceTimersByTimeAsync(25);
      const response = await responsePromise;
      expect(response.status).toBe(409);
      expect(await response.json()).toMatchObject({
        error: { code: "deletion_in_progress" },
      });
      expect(cancel).toHaveBeenCalledOnce();
      expect(deps.deleteAccount).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
