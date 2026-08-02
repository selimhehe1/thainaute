import {
  createAttemptOutboxSnapshot,
  type AttemptOutboxOwner,
} from "@thainaute/sync";
import { beforeEach, describe, expect, it, vi } from "vitest";

const userId = "20000000-0000-4000-8000-000000000001";
const testState = vi.hoisted(() => ({ calls: [] as string[] }));

vi.mock("../lib/client/attempt-outbox-store", () => ({
  migrateLegacyDemoFixtureAttempts: async () => {
    testState.calls.push("migrate");
    return { status: "not_needed", copiedEntries: 0, deduplicatedEntries: 0 };
  },
  WebAttemptOutboxStore: class {
    readonly owner: AttemptOutboxOwner;

    constructor(
      _databaseName?: string,
      owner: AttemptOutboxOwner = { kind: "anonymous" },
    ) {
      this.owner = owner;
      testState.calls.push(
        owner.kind === "account" ? "construct-account" : "construct-anonymous",
      );
    }

    async read() {
      testState.calls.push(
        this.owner.kind === "account" ? "read-account" : "read-anonymous",
      );
      return createAttemptOutboxSnapshot(this.owner);
    }

    async readFusionMarker() {
      return null;
    }

    async purgeOwnerData() {
      testState.calls.push("purge-anonymous");
    }

    close() {
      testState.calls.push("close");
    }
  },
}));

import {
  discardWebAnonymousProgress,
  readWebAccountLocalState,
} from "../lib/client/account-sync";

describe("orchestration locale du compte web", () => {
  beforeEach(() => testState.calls.splice(0));

  it("isole la fixture avant de présenter la progression anonyme", async () => {
    await readWebAccountLocalState(userId);

    expect(testState.calls[0]).toBe("migrate");
    expect(testState.calls.indexOf("migrate")).toBeLessThan(
      testState.calls.indexOf("construct-account"),
    );
    expect(testState.calls.indexOf("migrate")).toBeLessThan(
      testState.calls.indexOf("construct-anonymous"),
    );
  });

  it("isole la fixture avant un abandon explicite", async () => {
    await discardWebAnonymousProgress();

    expect(testState.calls.slice(0, 3)).toEqual([
      "migrate",
      "construct-anonymous",
      "purge-anonymous",
    ]);
  });
});
