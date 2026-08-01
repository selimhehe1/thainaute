import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import { describe, expect, it, vi } from "vitest";

import { AttemptInfrastructureError } from "../lib/server/attempt-sync/errors";
import { createProgressSnapshotHttpHandler } from "../lib/server/progress-snapshot/http";

const userId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const requestId = "10000000-0000-4000-8000-000000000001";
const snapshot = {
  syncRevision: 3,
  states: [
    {
      itemId: "20000000-0000-4000-8000-000000000001",
      skill: "listening" as const,
      masteryPermille: 500,
      status: "learning" as const,
      attemptCount: 2,
      successfulAttempts: 1,
      consecutiveCorrect: 1,
      dueAt: "2026-08-02T10:00:00.000Z",
      algorithmVersion: SRS_ALGORITHM_VERSION,
    },
  ],
};

function request(token = "access-token") {
  return new Request("https://thainaute.example/api/v1/progress/snapshot", {
    headers: token === "" ? {} : { Authorization: `Bearer ${token}` },
  });
}

describe("GET /api/v1/progress/snapshot", () => {
  it("renvoie le snapshot autoritaire du seul compte issu du jeton", async () => {
    const readSnapshot = vi.fn(() => Promise.resolve(snapshot));
    const response = await createProgressSnapshotHttpHandler({
      accessTokenVerifier: {
        verify: () => Promise.resolve({ userId }),
      },
      readSnapshot,
      requestIdFactory: () => requestId,
    })(request());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-request-id")).toBe(requestId);
    await expect(response.json()).resolves.toEqual(snapshot);
    expect(readSnapshot).toHaveBeenCalledWith(userId);
  });

  it("refuse l'absence de Bearer avant tout accès aux données", async () => {
    const verify = vi.fn();
    const readSnapshot = vi.fn();
    const response = await createProgressSnapshotHttpHandler({
      accessTokenVerifier: { verify },
      readSnapshot,
      requestIdFactory: () => requestId,
    })(request(""));

    expect(response.status).toBe(401);
    expect(verify).not.toHaveBeenCalled();
    expect(readSnapshot).not.toHaveBeenCalled();
  });

  it("ferme les pannes sans journaliser jeton, utilisateur ou progression", async () => {
    const report = vi.fn();
    const response = await createProgressSnapshotHttpHandler({
      accessTokenVerifier: {
        verify: () => Promise.resolve({ userId }),
      },
      readSnapshot: () =>
        Promise.reject(new AttemptInfrastructureError("database_unavailable")),
      requestIdFactory: () => requestId,
      reportOperationalFailure: report,
    })(request("sensitive-token"));

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error: { code: "database_unavailable", requestId },
    });
    expect(report).toHaveBeenCalledWith({
      operation: "progress_snapshot",
      errorKind: "database_unavailable",
      requestId,
    });
    expect(JSON.stringify(report.mock.calls)).not.toContain("sensitive-token");
    expect(JSON.stringify(report.mock.calls)).not.toContain(userId);
  });
});
