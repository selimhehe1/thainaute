import { createHash } from "node:crypto";

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
} from "@thainaute/content/public";
import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  WebPublicContentCache,
  WebPublicContentCacheError,
} from "../lib/client/public-content-cache";

const RELEASE_ID = "30000000-0000-4000-8000-000000000001";
const LESSON_ID = "10000000-0000-4000-8000-000000000001";
const VERSION_ID = "10000000-0000-4000-8000-000000000002";
const EXERCISE_ID = "10000000-0000-4000-8000-000000000004";
const ASSET_ID = "10000000-0000-4000-8000-000000000005";
const OPTION_A = "20000000-0000-4000-8000-000000000001";
const OPTION_B = "20000000-0000-4000-8000-000000000002";
const VALIDATED_AT = "2026-08-02T08:00:00.000Z";

function digest(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

const sha256Hex = async (value: string): Promise<string> => digest(value);

const publicLesson = publicLessonSchema.parse({
  releaseId: RELEASE_ID,
  releaseVersion: 1,
  lessonId: LESSON_ID,
  versionId: VERSION_ID,
  revision: 1,
  locale: "fr-FR",
  titleFr: "Boucle technique",
  objectiveFr: "Vérifier le cache public.",
  publishedAt: "2026-08-01T10:00:00.000Z",
  access: "free",
  exercises: [
    {
      id: EXERCISE_ID,
      type: "audio_choice",
      skill: "listening",
      audioAssetId: ASSET_ID,
      promptFr: "Choisissez l'option technique A.",
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
const CONTENT_HASH = digest(canonicalPublicLessonHashMaterial(publicLesson));
const lessonEntry = cachedPublicLessonSchema.parse({
  kind: "lesson",
  key: VERSION_ID,
  etag: `"sha256-${CONTENT_HASH}"`,
  validatedAt: VALIDATED_AT,
  response: {
    schemaVersion: 1,
    contentSha256: CONTENT_HASH,
    lesson: publicLesson,
  },
});

const publicRelease = publicReleaseSchema.parse({
  releaseId: RELEASE_ID,
  releaseVersion: 1,
  publishedAt: "2026-08-01T10:00:00.000Z",
  lessons: [
    {
      lessonId: LESSON_ID,
      versionId: VERSION_ID,
      revision: 1,
      titleFr: "Boucle technique",
      objectiveFr: "Vérifier le cache public.",
      access: "free",
      contentSha256: CONTENT_HASH,
    },
  ],
});
const MANIFEST_HASH = digest(canonicalPublicReleaseHashMaterial(publicRelease));
const releaseEntry = cachedPublicReleaseSchema.parse({
  kind: "release",
  key: "current",
  etag: `"sha256-${MANIFEST_HASH}"`,
  validatedAt: VALIDATED_AT,
  response: {
    schemaVersion: 1,
    manifestSha256: MANIFEST_HASH,
    release: publicRelease,
  },
});

interface RawCacheRow {
  readonly key: string;
  readonly entry: string;
}

let databaseName: string;
let caches: WebPublicContentCache[];

function openCache(): WebPublicContentCache {
  const cache = new WebPublicContentCache(databaseName, sha256Hex);
  caches.push(cache);
  return cache;
}

function openRawDatabase(): Dexie {
  const database = new Dexie(databaseName);
  database.version(1).stores({ entries: "&key" });
  return database;
}

async function readRawRows(): Promise<RawCacheRow[]> {
  const database = openRawDatabase();
  try {
    return (await database.table("entries").toArray()) as RawCacheRow[];
  } finally {
    database.close();
  }
}

beforeEach(() => {
  databaseName = `thainaute-public-content-test-${crypto.randomUUID()}`;
  caches = [];
});

afterEach(async () => {
  caches.forEach((cache) => cache.close());
  await Dexie.delete(databaseName);
});

describe("cache web du contenu public", () => {
  it("retourne une absence sans créer de ligne", async () => {
    const cache = openCache();

    await expect(cache.readCurrentRelease()).resolves.toBeNull();
    await expect(cache.readLesson(VERSION_ID)).resolves.toBeNull();
    await expect(readRawRows()).resolves.toEqual([]);
  });

  it("persiste les deux espaces de clés publics entre deux ouvertures", async () => {
    const first = openCache();
    await first.writeCurrentRelease(releaseEntry, null);
    await first.writeLesson(lessonEntry);
    first.close();

    const restored = openCache();
    await expect(restored.readCurrentRelease()).resolves.toEqual(releaseEntry);
    await expect(restored.readLesson(VERSION_ID)).resolves.toEqual(lessonEntry);

    const rows = await readRawRows();
    expect(rows.map((row) => row.key).sort()).toEqual([
      `lesson:${VERSION_ID}`,
      "release:current",
    ]);
    expect(rows.map((row) => JSON.parse(row.entry))).toEqual(
      expect.arrayContaining([lessonEntry, releaseEntry]),
    );
    expect("purge" in restored).toBe(false);
  });

  it("garde la transaction active pendant une revalidation WebCrypto asynchrone", async () => {
    const delayedSha256Hex = async (value: string): Promise<string> => {
      await new Promise<void>((resolve) => setTimeout(resolve, 20));
      return digest(value);
    };
    const cache = new WebPublicContentCache(databaseName, delayedSha256Hex);
    caches.push(cache);

    await cache.writeCurrentRelease(releaseEntry, null);
    await cache.writeLesson(lessonEntry);

    const refreshedRelease = cachedPublicReleaseSchema.parse({
      ...releaseEntry,
      validatedAt: "2026-08-02T08:01:00.000Z",
    });
    await expect(
      cache.writeCurrentRelease(refreshedRelease, releaseEntry),
    ).resolves.toEqual(refreshedRelease);
    await expect(cache.writeLesson(lessonEntry)).resolves.toEqual(lessonEntry);
    await expect(cache.readCurrentRelease()).resolves.toEqual(refreshedRelease);
    await expect(cache.readLesson(VERSION_ID)).resolves.toEqual(lessonEntry);
  });

  it("refuse les corps lesson et release altérés sous les mêmes hash et ETag", async () => {
    const seed = openRawDatabase();
    const alteredLesson = cachedPublicLessonSchema.parse({
      ...lessonEntry,
      response: {
        ...lessonEntry.response,
        lesson: {
          ...lessonEntry.response.lesson,
          objectiveFr: "Altération locale non signée.",
        },
      },
    });
    const alteredRelease = cachedPublicReleaseSchema.parse({
      ...releaseEntry,
      response: {
        ...releaseEntry.response,
        release: {
          ...releaseEntry.response.release,
          publishedAt: "2026-08-02T10:00:00.000Z",
        },
      },
    });
    await seed.table("entries").bulkPut([
      {
        key: `lesson:${VERSION_ID}`,
        entry: JSON.stringify(alteredLesson),
      },
      { key: "release:current", entry: JSON.stringify(alteredRelease) },
    ]);
    seed.close();

    const cache = openCache();
    await expect(cache.readLesson(VERSION_ID)).rejects.toBeInstanceOf(
      WebPublicContentCacheError,
    );
    await expect(cache.readCurrentRelease()).rejects.toBeInstanceOf(
      WebPublicContentCacheError,
    );
    await expect(readRawRows()).resolves.toHaveLength(2);
  });

  it("échoue fermé et conserve une ligne illisible", async () => {
    const seed = openRawDatabase();
    await seed.table("entries").put({
      key: "release:current",
      entry: "{cassé",
    });
    seed.close();

    const cache = openCache();
    await expect(cache.readCurrentRelease()).rejects.toBeInstanceOf(
      WebPublicContentCacheError,
    );
    await expect(
      cache.writeCurrentRelease(releaseEntry, null),
    ).rejects.toBeInstanceOf(WebPublicContentCacheError);

    await expect(readRawRows()).resolves.toEqual([
      { key: "release:current", entry: "{cassé" },
    ]);
  });

  it("refuse une écriture enrichie et conserve atomiquement la valeur valide", async () => {
    const cache = openCache();
    await cache.writeCurrentRelease(releaseEntry, null);
    const enriched = {
      ...releaseEntry,
      accountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    } as CachedPublicRelease;

    await expect(
      cache.writeCurrentRelease(enriched, releaseEntry),
    ).rejects.toBeInstanceOf(WebPublicContentCacheError);
    await expect(cache.readCurrentRelease()).resolves.toEqual(releaseEntry);
    expect((await readRawRows())[0]?.entry).toBe(JSON.stringify(releaseEntry));
  });

  it("refuse de remplacer une version immuable par un autre contenu", async () => {
    const cache = openCache();
    await cache.writeLesson(lessonEntry);
    const otherLesson = publicLessonSchema.parse({
      ...lessonEntry.response.lesson,
      objectiveFr: "Autre corps valide sous le même UUID.",
    });
    const otherHash = digest(canonicalPublicLessonHashMaterial(otherLesson));
    const divergent = cachedPublicLessonSchema.parse({
      ...lessonEntry,
      etag: `"sha256-${otherHash}"`,
      response: {
        ...lessonEntry.response,
        contentSha256: otherHash,
        lesson: otherLesson,
      },
    });

    await expect(cache.writeLesson(divergent)).rejects.toBeInstanceOf(
      WebPublicContentCacheError,
    );
    await expect(cache.readLesson(VERSION_ID)).resolves.toEqual(lessonEntry);
  });

  it("refuse un identifiant de leçon invalide avant toute lecture IndexedDB", async () => {
    await expect(openCache().readLesson("../compte")).rejects.toBeInstanceOf(
      WebPublicContentCacheError,
    );
    await expect(readRawRows()).resolves.toEqual([]);
  });

  it("empêche une revalidation tardive d'écraser la release gagnante", async () => {
    const first = openCache();
    const second = openCache();
    await first.writeCurrentRelease(releaseEntry, null);
    const expectedByFirst = await first.readCurrentRelease();
    const expectedBySecond = await second.readCurrentRelease();
    const winnerRelease = publicReleaseSchema.parse({
      ...releaseEntry.response.release,
      releaseId: "40000000-0000-4000-8000-000000000001",
    });
    const winnerHash = digest(
      canonicalPublicReleaseHashMaterial(winnerRelease),
    );
    const winner = cachedPublicReleaseSchema.parse({
      ...releaseEntry,
      etag: `"sha256-${winnerHash}"`,
      validatedAt: "2026-08-02T08:01:00.000Z",
      response: {
        ...releaseEntry.response,
        manifestSha256: winnerHash,
        release: winnerRelease,
      },
    });
    const lateOldResponse = cachedPublicReleaseSchema.parse({
      ...releaseEntry,
      validatedAt: "2026-08-02T08:02:00.000Z",
    });

    await second.writeCurrentRelease(winner, expectedBySecond);
    await expect(
      first.writeCurrentRelease(lateOldResponse, expectedByFirst),
    ).rejects.toBeInstanceOf(WebPublicContentCacheError);
    await expect(first.readCurrentRelease()).resolves.toEqual(winner);
  });

  it("valide strictement une leçon avant de démarrer son écriture", async () => {
    const cache = openCache();
    await cache.writeLesson(lessonEntry);
    const invalid = {
      ...lessonEntry,
      response: {
        ...lessonEntry.response,
        contentSha256: "0".repeat(64),
      },
    } as CachedPublicLesson;

    await expect(cache.writeLesson(invalid)).rejects.toBeInstanceOf(
      WebPublicContentCacheError,
    );
    await expect(cache.readLesson(VERSION_ID)).resolves.toEqual(lessonEntry);
  });
});
