import {
  beginLocalOnboarding,
  completeLocalOnboarding,
  createLocalExperienceSnapshot,
  serializeLocalExperienceSnapshot,
} from "@thainaute/sync";
import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  LocalExperienceStorageError,
  WebLocalExperienceStore,
} from "../lib/client/local-experience-store";

let databaseName: string;
let stores: WebLocalExperienceStore[];

function openStore(): WebLocalExperienceStore {
  const store = new WebLocalExperienceStore(databaseName);
  stores.push(store);
  return store;
}

beforeEach(() => {
  databaseName = `thainaute-local-experience-test-${crypto.randomUUID()}`;
  stores = [];
});

afterEach(async () => {
  stores.forEach((store) => store.close());
  await Dexie.delete(databaseName);
});

describe("stockage du parcours local web", () => {
  it("retourne un snapshot vide sans créer de ligne", async () => {
    const snapshot = await openStore().read();

    expect(snapshot).toEqual({
      schemaVersion: 1,
      owner: { kind: "anonymous" },
      onboarding: { status: "not_started" },
      lesson: null,
      expedition: null,
    });
  });

  it("persiste atomiquement l’onboarding entre deux ouvertures", async () => {
    const first = openStore();
    const startedAt = "2026-08-02T08:00:00.000Z";
    await first.update((snapshot) => beginLocalOnboarding(snapshot, startedAt));
    await first.update((snapshot) =>
      completeLocalOnboarding(
        snapshot,
        {
          goalOptionId: "ten_minutes",
          motivationOptionId: "daily_life",
          experienceOptionId: "beginner",
        },
        "2026-08-02T08:01:00.000Z",
      ),
    );
    first.close();

    const restored = await openStore().read();

    expect(restored.onboarding).toMatchObject({
      status: "completed",
      goalOptionId: "ten_minutes",
      motivationOptionId: "daily_life",
      experienceOptionId: "beginner",
    });
  });

  it("échoue fermé et conserve une ligne illisible", async () => {
    const seed = new Dexie(databaseName);
    seed.version(1).stores({ snapshots: "&key" });
    await seed.table("snapshots").put({
      key: "local-experience-v1",
      snapshot: "{cassé",
    });
    seed.close();

    const store = openStore();
    await expect(store.read()).rejects.toThrow(LocalExperienceStorageError);
    await expect(store.update((snapshot) => snapshot)).rejects.toThrow(
      LocalExperienceStorageError,
    );
    store.close();

    const inspector = new Dexie(databaseName);
    inspector.version(1).stores({ snapshots: "&key" });
    const row = (await inspector
      .table("snapshots")
      .get("local-experience-v1")) as { snapshot: string };
    expect(row.snapshot).toBe("{cassé");
    inspector.close();
  });

  it("refuse et conserve un snapshot appartenant à un autre espace", async () => {
    const seed = new Dexie(databaseName);
    seed.version(1).stores({ snapshots: "&key" });
    const foreign = serializeLocalExperienceSnapshot(
      createLocalExperienceSnapshot({
        kind: "account",
        userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      }),
    );
    await seed.table("snapshots").put({
      key: "local-experience-v1",
      snapshot: foreign,
    });
    seed.close();

    await expect(openStore().read()).rejects.toThrow(
      LocalExperienceStorageError,
    );

    const inspector = new Dexie(databaseName);
    inspector.version(1).stores({ snapshots: "&key" });
    const row = (await inspector
      .table("snapshots")
      .get("local-experience-v1")) as { snapshot: string };
    expect(row.snapshot).toBe(foreign);
    inspector.close();
  });

  it("interdit de changer de propriétaire pendant une mutation", async () => {
    const store = openStore();

    await expect(
      store.update(() =>
        createLocalExperienceSnapshot({
          kind: "account",
          userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        }),
      ),
    ).rejects.toThrow(LocalExperienceStorageError);
    expect((await store.read()).owner).toEqual({ kind: "anonymous" });
  });
});
