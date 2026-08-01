import { describe, expect, it } from "vitest";

import {
  applyProgressSnapshot,
  createAttemptOutboxSnapshot,
} from "../src/index";

const owner = {
  kind: "account" as const,
  userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
};
const state = {
  itemId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  skill: "listening" as const,
  masteryPermille: 250,
  status: "learning" as const,
  attemptCount: 1,
  successfulAttempts: 1,
  consecutiveCorrect: 1,
  dueAt: "2026-08-02T10:00:00.000Z",
  algorithmVersion: "srs-v0" as const,
};

describe("hydratation de progression autoritaire", () => {
  it("remplace l'image autoritaire complète sans toucher aux entrées locales", () => {
    const snapshot = createAttemptOutboxSnapshot(owner);
    const hydrated = applyProgressSnapshot(snapshot, {
      syncRevision: 2,
      states: [state],
    });
    expect(hydrated.syncRevision).toBe(2);
    expect(hydrated.authoritativeStates).toEqual([state]);
    expect(hydrated.entries).toEqual(snapshot.entries);
  });

  it("ignore un snapshot réseau plus ancien", () => {
    const current = applyProgressSnapshot(createAttemptOutboxSnapshot(owner), {
      syncRevision: 3,
      states: [state],
    });
    expect(
      applyProgressSnapshot(current, { syncRevision: 2, states: [] }),
    ).toEqual(current);
  });
});
