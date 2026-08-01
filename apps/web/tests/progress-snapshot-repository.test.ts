import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import { describe, expect, it } from "vitest";

import { AttemptInfrastructureError } from "../lib/server/attempt-sync/errors";
import { parseProgressSnapshotRpcResult } from "../lib/server/progress-snapshot/supabase-repository";

describe("repository du snapshot de progression", () => {
  it("valide la forme fermée et conserve une révision zéro", () => {
    expect(
      parseProgressSnapshotRpcResult(
        {
          syncRevision: 0,
          states: [
            {
              itemId: "20000000-0000-4000-8000-000000000001",
              skill: "listening",
              masteryPermille: 0,
              status: "new",
              attemptCount: 1,
              successfulAttempts: 0,
              consecutiveCorrect: 0,
              dueAt: "2026-08-02T10:00:00.000Z",
              algorithmVersion: SRS_ALGORITHM_VERSION,
            },
          ],
        },
        null,
      ),
    ).toMatchObject({ syncRevision: 0 });
  });

  it("ferme une erreur RPC ou un résultat non trié", () => {
    expect(() =>
      parseProgressSnapshotRpcResult(null, { code: "XX000" }),
    ).toThrow(AttemptInfrastructureError);
    expect(() =>
      parseProgressSnapshotRpcResult(
        {
          syncRevision: 1,
          states: [
            {
              itemId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
              skill: "listening",
              masteryPermille: 1,
              status: "learning",
              attemptCount: 1,
              successfulAttempts: 1,
              consecutiveCorrect: 1,
              dueAt: "2026-08-02T10:00:00.000Z",
              algorithmVersion: SRS_ALGORITHM_VERSION,
            },
            {
              itemId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              skill: "listening",
              masteryPermille: 1,
              status: "learning",
              attemptCount: 1,
              successfulAttempts: 1,
              consecutiveCorrect: 1,
              dueAt: "2026-08-02T10:00:00.000Z",
              algorithmVersion: SRS_ALGORITHM_VERSION,
            },
          ],
        },
        null,
      ),
    ).toThrow(AttemptInfrastructureError);
  });
});
