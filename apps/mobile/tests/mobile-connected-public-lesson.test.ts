import {
  cachedPublicLessonSchema,
  cachedPublicReleaseSchema,
  type CachedPublicLesson,
  type PublicContentClient,
} from "@thainaute/sync";
import type { SQLiteDatabase } from "expo-sqlite";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  loadCurrentMobileConnectedPublicLesson,
  MobileConnectedPublicLessonError,
  readMobileApiOrigin,
  type MobileConnectedPublicLessonStore,
} from "../lib/mobile-connected-public-lesson";

vi.mock("../lib/sha256", () => ({
  mobileSha256Hex: vi.fn(async () => "a".repeat(64)),
}));

const ids = {
  release: "30000000-0000-4000-8000-000000000001",
  lesson: "10000000-0000-4000-8000-000000000001",
  version: "10000000-0000-4000-8000-000000000002",
  exercise: "10000000-0000-4000-8000-000000000004",
  asset: "10000000-0000-4000-8000-000000000005",
  optionA: "20000000-0000-4000-8000-000000000001",
  optionB: "20000000-0000-4000-8000-000000000002",
} as const;
const contentHash = "a".repeat(64);
const release = cachedPublicReleaseSchema.parse({
  kind: "release",
  key: "current",
  etag: `"sha256-${"b".repeat(64)}"`,
  validatedAt: "2026-08-02T08:00:00.000Z",
  response: {
    schemaVersion: 1,
    manifestSha256: "b".repeat(64),
    release: {
      releaseId: ids.release,
      releaseVersion: 1,
      publishedAt: "2026-08-01T10:00:00.000Z",
      lessons: [
        {
          lessonId: ids.lesson,
          versionId: ids.version,
          revision: 1,
          titleFr: "Boucle technique",
          objectiveFr: "Vérifier le client mobile.",
          access: "free",
          contentSha256: contentHash,
        },
      ],
    },
  },
});

function lesson(hash = contentHash): CachedPublicLesson {
  return cachedPublicLessonSchema.parse({
    kind: "lesson",
    key: ids.version,
    etag: `"sha256-${hash}"`,
    validatedAt: "2026-08-02T08:00:00.000Z",
    response: {
      schemaVersion: 1,
      contentSha256: hash,
      lesson: {
        releaseId: ids.release,
        releaseVersion: 1,
        lessonId: ids.lesson,
        versionId: ids.version,
        revision: 1,
        locale: "fr-FR",
        titleFr: "Boucle technique",
        objectiveFr: "Vérifier le client mobile.",
        publishedAt: "2026-08-01T10:00:00.000Z",
        access: "free",
        exercises: [
          {
            id: ids.exercise,
            type: "audio_choice",
            skill: "listening",
            audioAssetId: ids.asset,
            promptFr: "Choisissez A.",
            options: [
              { id: ids.optionA, labelFr: "Option A" },
              { id: ids.optionB, labelFr: "Option B" },
            ],
          },
        ],
        audioAssets: [
          {
            assetId: ids.asset,
            variant: "natural",
            mimeType: "audio/wav",
            sha256: "c".repeat(64),
            byteLength: 5_164,
            durationMs: 320,
          },
        ],
      },
    },
  });
}

function harness(lessonEntry = lesson()) {
  const writes: string[] = [];
  const store: MobileConnectedPublicLessonStore = {
    readCurrentRelease: vi.fn(async () => null),
    readLesson: vi.fn(async () => null),
    writeCurrentRelease: vi.fn(async (entry) => {
      writes.push("release");
      return entry;
    }),
    writeLesson: vi.fn(async (entry) => {
      writes.push("lesson");
      return entry;
    }),
  };
  const client: PublicContentClient = {
    getCurrentRelease: vi.fn(async () => ({
      entry: release,
      revalidated: false,
    })),
    getLesson: vi.fn(async () => ({
      entry: lessonEntry,
      revalidated: false,
    })),
    audioUrl: vi.fn((versionId, assetId) => `/audio/${versionId}/${assetId}`),
  };
  return { store, client, writes };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("chargement public mobile connecté", () => {
  it("applique la politique HTTPS/LAN à l’origine configurée", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("EXPO_PUBLIC_API_URL", "http://192.168.1.20:3000/");
    expect(readMobileApiOrigin()).toBe("http://192.168.1.20:3000");

    vi.stubEnv("EXPO_PUBLIC_API_URL", "http://8.8.8.8:3000/");
    expect(() => readMobileApiOrigin()).toThrow(
      MobileConnectedPublicLessonError,
    );

    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("EXPO_PUBLIC_API_URL", "http://10.0.2.2:3000/");
    expect(() => readMobileApiOrigin()).toThrow(
      MobileConnectedPublicLessonError,
    );
  });

  it("valide le manifeste avant le compare-and-swap local", async () => {
    const { store, client, writes } = harness();
    const result = await loadCurrentMobileConnectedPublicLesson({
      database: {} as SQLiteDatabase,
      store,
      client,
    });
    expect(result.lesson.key).toBe(ids.version);
    expect(writes).toEqual(["lesson", "release"]);
    expect(store.writeCurrentRelease).toHaveBeenCalledWith(release, null);
  });

  it("refuse une leçon qui diverge du manifeste sans écrire", async () => {
    const { store, client, writes } = harness(lesson("d".repeat(64)));
    await expect(
      loadCurrentMobileConnectedPublicLesson({
        database: {} as SQLiteDatabase,
        store,
        client,
      }),
    ).rejects.toBeInstanceOf(MobileConnectedPublicLessonError);
    expect(writes).toEqual([]);
  });
});
