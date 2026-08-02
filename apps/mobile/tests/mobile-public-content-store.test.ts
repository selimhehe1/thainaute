import {
  canonicalPublicLessonHashMaterial,
  canonicalPublicReleaseHashMaterial,
  cachedPublicLessonSchema,
  cachedPublicReleaseSchema,
  type CachedPublicLesson,
  type CachedPublicRelease,
} from "@thainaute/sync";
import {
  publicLessonSchema,
  publicReleaseSchema,
  type PublicLesson,
  type PublicRelease,
} from "@thainaute/content/public";
import type { SQLiteDatabase } from "expo-sqlite";
import { describe, expect, it } from "vitest";

import {
  MobilePublicContentCacheError,
  MobilePublicContentStore,
} from "../lib/mobile-public-content-store";

const RELEASE_ID = "30000000-0000-4000-8000-000000000001";
const LESSON_ID = "10000000-0000-4000-8000-000000000001";
const VERSION_ID = "10000000-0000-4000-8000-000000000002";
const EXERCISE_ID = "10000000-0000-4000-8000-000000000004";
const ASSET_ID = "10000000-0000-4000-8000-000000000005";
const OPTION_A = "20000000-0000-4000-8000-000000000001";
const OPTION_B = "20000000-0000-4000-8000-000000000002";

function digest(value: string): string {
  const state = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    for (let lane = 0; lane < state.length; lane += 1) {
      const current = state[lane] ?? 0;
      state[lane] = Math.imul(current ^ code ^ lane, 0x01000193) >>> 0;
    }
  }
  return state.map((lane) => lane.toString(16).padStart(8, "0")).join("");
}

const sha256Hex = async (value: string): Promise<string> => digest(value);

const BASE_LESSON = publicLessonSchema.parse({
  releaseId: RELEASE_ID,
  releaseVersion: 1,
  lessonId: LESSON_ID,
  versionId: VERSION_ID,
  revision: 1,
  locale: "fr-FR",
  titleFr: "Boucle technique",
  objectiveFr: "Vérifier le cache public mobile.",
  publishedAt: "2026-08-01T10:00:00.000Z",
  access: "free",
  exercises: [
    {
      id: EXERCISE_ID,
      type: "audio_choice",
      skill: "listening",
      audioAssetId: ASSET_ID,
      promptFr: "Choisissez l’option technique A.",
      options: [
        { id: OPTION_A, labelFr: "Option A" },
        { id: OPTION_B, labelFr: "Option B" },
      ],
    },
  ],
  audioAssets: [
    {
      assetId: ASSET_ID,
      variant: "natural",
      mimeType: "audio/wav",
      sha256: "c".repeat(64),
      byteLength: 5164,
      durationMs: 320,
    },
  ],
});
const CONTENT_HASH = digest(canonicalPublicLessonHashMaterial(BASE_LESSON));

const BASE_RELEASE = publicReleaseSchema.parse({
  releaseId: RELEASE_ID,
  releaseVersion: 1,
  publishedAt: "2026-08-01T10:00:00.000Z",
  lessons: [
    {
      lessonId: LESSON_ID,
      versionId: VERSION_ID,
      revision: 1,
      titleFr: "Boucle technique",
      objectiveFr: "Vérifier le cache public mobile.",
      access: "free",
      contentSha256: CONTENT_HASH,
    },
  ],
});

interface StoredRow {
  payload: string;
  validated_at: string;
}

class FakePublicContentDatabase {
  readonly rows = new Map<string, StoredRow>();
  busyFailuresRemaining = 0;
  deleteCount = 0;
  failAfterRun = false;
  readCount = 0;
  runCount = 0;
  transactionCount = 0;

  private storageKey(kind: unknown, key: unknown): string {
    return `${String(kind)}:${String(key)}`;
  }

  async getFirstAsync<T>(
    _statement: string,
    kind: unknown,
    key: unknown,
  ): Promise<T | null> {
    this.readCount += 1;
    if (this.busyFailuresRemaining > 0) {
      this.busyFailuresRemaining -= 1;
      throw new Error("SQLITE_BUSY: database is locked");
    }
    const row = this.rows.get(this.storageKey(kind, key));
    return (row === undefined ? null : { ...row }) as T | null;
  }

  async runAsync(statement: string, ...parameters: unknown[]): Promise<void> {
    const kind = parameters[0];
    const key = parameters[1];
    if (/^\s*DELETE\b/iu.test(statement)) {
      this.deleteCount += 1;
      this.rows.delete(this.storageKey(kind, key));
      if (this.failAfterRun) throw new Error("write failed after mutation");
      return;
    }
    const payload = parameters[2];
    const validatedAt = parameters[3];
    this.runCount += 1;
    this.rows.set(this.storageKey(kind, key), {
      payload: String(payload),
      validated_at: String(validatedAt),
    });
    if (this.failAfterRun) throw new Error("write failed after mutation");
  }

  async withExclusiveTransactionAsync(
    callback: (transaction: SQLiteDatabase) => Promise<void>,
  ): Promise<void> {
    this.transactionCount += 1;
    const snapshot = new Map(
      [...this.rows].map(([key, row]) => [key, { ...row }] as const),
    );
    try {
      await callback(this as unknown as SQLiteDatabase);
    } catch (error) {
      this.rows.clear();
      for (const [key, row] of snapshot) this.rows.set(key, row);
      throw error;
    }
  }
}

function lessonEntry(
  validatedAt = "2026-08-02T08:00:00.000Z",
  lessonInput: PublicLesson = BASE_LESSON,
): CachedPublicLesson {
  const lesson = publicLessonSchema.parse(lessonInput);
  const contentHash = digest(canonicalPublicLessonHashMaterial(lesson));
  return cachedPublicLessonSchema.parse({
    kind: "lesson",
    key: VERSION_ID,
    etag: `"sha256-${contentHash}"`,
    validatedAt,
    response: {
      schemaVersion: 1,
      contentSha256: contentHash,
      lesson,
    },
  });
}

function releaseEntry(
  validatedAt = "2026-08-02T08:00:00.000Z",
  releaseInput: PublicRelease = BASE_RELEASE,
): CachedPublicRelease {
  const release = publicReleaseSchema.parse(releaseInput);
  const manifestHash = digest(canonicalPublicReleaseHashMaterial(release));
  return cachedPublicReleaseSchema.parse({
    kind: "release",
    key: "current",
    etag: `"sha256-${manifestHash}"`,
    validatedAt,
    response: {
      schemaVersion: 1,
      manifestSha256: manifestHash,
      release,
    },
  });
}

function createStore(database: FakePublicContentDatabase) {
  return new MobilePublicContentStore(
    database as unknown as SQLiteDatabase,
    sha256Hex,
  );
}

describe("cache SQLite du contenu public mobile", () => {
  it("retourne null sans inventer de release ou de leçon", async () => {
    const database = new FakePublicContentDatabase();
    const store = createStore(database);

    await expect(store.readCurrentRelease()).resolves.toBeNull();
    await expect(store.readLesson(VERSION_ID)).resolves.toBeNull();
    expect(database.runCount).toBe(0);
  });

  it("écrit et relit séparément une release et une leçon strictes", async () => {
    const database = new FakePublicContentDatabase();
    const store = createStore(database);
    const release = releaseEntry();
    const lesson = lessonEntry();

    await expect(store.writeCurrentRelease(release, null)).resolves.toEqual(
      release,
    );
    await expect(store.writeLesson(lesson)).resolves.toEqual(lesson);
    await expect(store.readCurrentRelease()).resolves.toEqual(release);
    await expect(store.readLesson(VERSION_ID)).resolves.toEqual(lesson);
    expect(database.rows.size).toBe(2);
  });

  it("purge les corps lesson et release altérés sous les mêmes hash et ETag", async () => {
    const database = new FakePublicContentDatabase();
    const store = createStore(database);
    const lesson = lessonEntry();
    const release = releaseEntry();
    const alteredLesson = cachedPublicLessonSchema.parse({
      ...lesson,
      response: {
        ...lesson.response,
        lesson: {
          ...lesson.response.lesson,
          objectiveFr: "Altération locale non signée.",
        },
      },
    });
    const alteredRelease = cachedPublicReleaseSchema.parse({
      ...release,
      response: {
        ...release.response,
        release: {
          ...release.response.release,
          publishedAt: "2026-08-02T10:00:00.000Z",
        },
      },
    });
    database.rows.set(`lesson:${VERSION_ID}`, {
      payload: JSON.stringify(alteredLesson),
      validated_at: alteredLesson.validatedAt,
    });
    database.rows.set("release:current", {
      payload: JSON.stringify(alteredRelease),
      validated_at: alteredRelease.validatedAt,
    });

    await expect(store.readLesson(VERSION_ID)).resolves.toBeNull();
    await expect(store.readCurrentRelease()).resolves.toBeNull();
    expect(database.rows.size).toBe(0);
    expect(database.deleteCount).toBe(2);
  });

  it("conserve l’entrée la plus récemment revalidée face à une réponse tardive", async () => {
    const database = new FakePublicContentDatabase();
    const store = createStore(database);
    const recent = lessonEntry("2026-08-02T09:00:00.000Z");
    const stale = lessonEntry("2026-08-02T08:00:00.000Z");

    await store.writeLesson(recent);
    await expect(store.writeLesson(stale)).resolves.toEqual(recent);
    await expect(store.readLesson(VERSION_ID)).resolves.toEqual(recent);
    expect(database.runCount).toBe(1);
  });

  it("refuse toute mutation d’une version de leçon immuable, même plus tard", async () => {
    const database = new FakePublicContentDatabase();
    const store = createStore(database);
    const first = lessonEntry();
    const divergent = lessonEntry(
      "2026-08-02T10:00:00.000Z",
      publicLessonSchema.parse({
        ...first.response.lesson,
        titleFr: "Valeur divergente",
      }),
    );

    await store.writeLesson(first);
    await expect(store.writeLesson(divergent)).rejects.toMatchObject({
      constructor: MobilePublicContentCacheError,
      code: "cache_conflict",
    });
    await expect(store.readLesson(VERSION_ID)).resolves.toEqual(first);
    expect(database.runCount).toBe(1);
  });

  it("remplace ou rollback la release par compare-and-swap, pas par horloge locale", async () => {
    const database = new FakePublicContentDatabase();
    const store = createStore(database);
    const first = releaseEntry("2026-08-02T12:00:00.000Z");
    const next = releaseEntry(
      "2026-08-02T07:00:00.000Z",
      publicReleaseSchema.parse({
        ...first.response.release,
        releaseId: "30000000-0000-4000-8000-000000000002",
        releaseVersion: 2,
        publishedAt: "2026-08-02T10:00:00.000Z",
      }),
    );

    await store.writeCurrentRelease(first, null);
    await expect(store.writeCurrentRelease(next, first)).resolves.toEqual(next);
    await expect(store.readCurrentRelease()).resolves.toEqual(next);
    await expect(store.writeCurrentRelease(first, next)).resolves.toEqual(
      first,
    );
    await expect(store.readCurrentRelease()).resolves.toEqual(first);
    expect(database.runCount).toBe(3);
  });

  it("refuse qu’une réponse tardive remplace une autre release courante", async () => {
    const database = new FakePublicContentDatabase();
    const store = createStore(database);
    const first = releaseEntry();
    const competing = releaseEntry(
      "2026-08-02T09:00:00.000Z",
      publicReleaseSchema.parse({
        ...first.response.release,
        releaseId: "30000000-0000-4000-8000-000000000003",
        releaseVersion: 3,
        publishedAt: "2026-08-03T10:00:00.000Z",
      }),
    );

    await store.writeCurrentRelease(first, null);
    await store.writeCurrentRelease(competing, first);
    await expect(
      store.writeCurrentRelease(
        cachedPublicReleaseSchema.parse({
          ...first,
          validatedAt: "2026-08-02T10:00:00.000Z",
        }),
        first,
      ),
    ).rejects.toMatchObject({ code: "cache_conflict" });
    await expect(store.readCurrentRelease()).resolves.toEqual(competing);
    expect(database.runCount).toBe(2);
  });

  it("purge atomiquement une ligne corrompue puis permet son refetch", async () => {
    const database = new FakePublicContentDatabase();
    const store = createStore(database);
    database.rows.set(`lesson:${VERSION_ID}`, {
      payload: "{json-incomplet",
      validated_at: "2026-08-01T10:00:00.000Z",
    });

    await expect(store.readLesson(VERSION_ID)).resolves.toBeNull();
    expect(database.rows.has(`lesson:${VERSION_ID}`)).toBe(false);
    expect(database.deleteCount).toBe(1);

    const replacement = lessonEntry();
    await expect(store.writeLesson(replacement)).resolves.toEqual(replacement);
    await expect(store.readLesson(VERSION_ID)).resolves.toEqual(replacement);
    expect(database.runCount).toBe(1);
  });

  it("purge une colonne d’horodatage contradictoire sans servir le payload", async () => {
    const database = new FakePublicContentDatabase();
    const store = createStore(database);
    const release = releaseEntry();
    database.rows.set("release:current", {
      payload: JSON.stringify(release),
      validated_at: "2026-08-02T09:00:00.000Z",
    });

    await expect(store.readCurrentRelease()).resolves.toBeNull();
    expect(database.rows.has("release:current")).toBe(false);
    expect(database.deleteCount).toBe(1);
  });

  it("retente SQLITE_BUSY et sérialise deux compare-and-swap concurrents", async () => {
    const database = new FakePublicContentDatabase();
    const store = createStore(database);
    database.busyFailuresRemaining = 2;
    await expect(store.readCurrentRelease()).resolves.toBeNull();
    expect(database.readCount).toBe(3);

    const first = releaseEntry();
    const second = releaseEntry(
      first.validatedAt,
      publicReleaseSchema.parse({
        ...first.response.release,
        releaseId: "30000000-0000-4000-8000-000000000002",
        releaseVersion: 2,
      }),
    );
    const third = releaseEntry(
      first.validatedAt,
      publicReleaseSchema.parse({
        ...first.response.release,
        releaseId: "30000000-0000-4000-8000-000000000003",
        releaseVersion: 3,
      }),
    );
    await store.writeCurrentRelease(first, null);

    const results = await Promise.allSettled([
      store.writeCurrentRelease(second, first),
      store.writeCurrentRelease(third, first),
    ]);
    expect(results[0]).toMatchObject({ status: "fulfilled", value: second });
    expect(results[1]).toMatchObject({
      status: "rejected",
      reason: { code: "cache_conflict" },
    });
    await expect(store.readCurrentRelease()).resolves.toEqual(second);
  });

  it("laisse SQLite rollbacker une purge si la transaction échoue", async () => {
    const database = new FakePublicContentDatabase();
    const store = createStore(database);
    database.rows.set(`lesson:${VERSION_ID}`, {
      payload: "{json-incomplet",
      validated_at: "2026-08-01T10:00:00.000Z",
    });
    database.failAfterRun = true;

    await expect(store.readLesson(VERSION_ID)).rejects.toMatchObject({
      code: "cache_unavailable",
    });
    expect(database.rows.get(`lesson:${VERSION_ID}`)?.payload).toBe(
      "{json-incomplet",
    );
  });

  it("refuse une clé de leçon et une entrée invalides avant SQLite", async () => {
    const database = new FakePublicContentDatabase();
    const store = createStore(database);

    await expect(store.readLesson("../secret")).rejects.toMatchObject({
      code: "invalid_key",
    });
    await expect(
      store.writeLesson({ ...lessonEntry(), etag: '"sha256-invalide"' }),
    ).rejects.toMatchObject({ code: "invalid_entry" });
    expect(database.transactionCount).toBe(0);
    expect(database.runCount).toBe(0);
  });
});
