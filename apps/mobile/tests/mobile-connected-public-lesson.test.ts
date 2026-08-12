import {
  cachedPublicLessonSchema,
  cachedPublicReleaseSchema,
  PublicContentProtocolError,
  PublicContentTransportError,
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

vi.mock("expo-constants", () => ({
  default: { expoConfig: undefined },
}));

vi.mock("../lib/sha256", () => ({
  mobileSha256Hex: vi.fn(() => Promise.resolve("a".repeat(64))),
}));

const ids = {
  release: "30000000-0000-4000-8000-000000000001",
  nextRelease: "30000000-0000-4000-8000-000000000002",
  lesson: "10000000-0000-4000-8000-000000000001",
  version: "10000000-0000-4000-8000-000000000002",
  nextVersion: "10000000-0000-4000-8000-000000000003",
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
const nextRelease = cachedPublicReleaseSchema.parse({
  ...release,
  etag: `"sha256-${"e".repeat(64)}"`,
  response: {
    ...release.response,
    manifestSha256: "e".repeat(64),
    release: {
      ...release.response.release,
      releaseId: ids.nextRelease,
      releaseVersion: 2,
      lessons: [
        {
          ...release.response.release.lessons[0],
          versionId: ids.nextVersion,
          revision: 2,
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
  const mocks = {
    readCurrentRelease: vi.fn<
      MobileConnectedPublicLessonStore["readCurrentRelease"]
    >(() => Promise.resolve(null)),
    readLesson: vi.fn<MobileConnectedPublicLessonStore["readLesson"]>(() =>
      Promise.resolve(null),
    ),
    writeCurrentRelease: vi.fn<
      MobileConnectedPublicLessonStore["writeCurrentRelease"]
    >((entry) => {
      writes.push("release");
      return Promise.resolve(entry);
    }),
    writeLesson: vi.fn<MobileConnectedPublicLessonStore["writeLesson"]>(
      (entry) => {
        writes.push("lesson");
        return Promise.resolve(entry);
      },
    ),
    getCurrentRelease: vi.fn<PublicContentClient["getCurrentRelease"]>(() =>
      Promise.resolve({
        entry: release,
        revalidated: false,
      }),
    ),
    getLesson: vi.fn<PublicContentClient["getLesson"]>(() =>
      Promise.resolve({
        entry: lessonEntry,
        revalidated: false,
      }),
    ),
    audioUrl: vi.fn<PublicContentClient["audioUrl"]>(
      (versionId, assetId) => `/audio/${versionId}/${assetId}`,
    ),
  };
  const store: MobileConnectedPublicLessonStore = {
    readCurrentRelease: mocks.readCurrentRelease,
    readLesson: mocks.readLesson,
    writeCurrentRelease: mocks.writeCurrentRelease,
    writeLesson: mocks.writeLesson,
  };
  const client: PublicContentClient = {
    getCurrentRelease: mocks.getCurrentRelease,
    getLesson: mocks.getLesson,
    audioUrl: mocks.audioUrl,
  };
  return { store, client, mocks, writes };
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
    const { store, client, mocks, writes } = harness();
    const result = await loadCurrentMobileConnectedPublicLesson({
      database: {} as SQLiteDatabase,
      store,
      client,
    });
    expect(result.lesson.key).toBe(ids.version);
    expect(writes).toEqual(["lesson", "release"]);
    expect(mocks.writeCurrentRelease).toHaveBeenCalledWith(release, null);
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

  it("reprend le cache immuable vérifié après une panne de transport", async () => {
    const cachedLesson = lesson();
    const { store, client, mocks, writes } = harness();
    mocks.readCurrentRelease.mockResolvedValue(release);
    mocks.readLesson.mockResolvedValue(cachedLesson);
    mocks.getCurrentRelease.mockRejectedValue(
      new PublicContentTransportError(),
    );

    const result = await loadCurrentMobileConnectedPublicLesson({
      database: {} as SQLiteDatabase,
      store,
      client,
    });

    expect(result.release).toEqual(release);
    expect(result.lesson).toEqual(cachedLesson);
    expect(result.audioUrl(ids.asset)).toBe(
      `/audio/${ids.version}/${ids.asset}`,
    );
    expect(writes).toEqual([]);
  });

  it("conserve l'ancienne release vérifiée si la nouvelle leçon est hors ligne", async () => {
    const cachedLesson = lesson();
    const { store, client, mocks, writes } = harness();
    mocks.readCurrentRelease.mockResolvedValue(release);
    mocks.readLesson.mockImplementation((versionId) =>
      Promise.resolve(versionId === ids.version ? cachedLesson : null),
    );
    mocks.getCurrentRelease.mockResolvedValue({
      entry: nextRelease,
      revalidated: false,
    });
    mocks.getLesson.mockRejectedValue(new PublicContentTransportError());

    const result = await loadCurrentMobileConnectedPublicLesson({
      database: {} as SQLiteDatabase,
      store,
      client,
    });

    expect(result.release).toEqual(release);
    expect(result.lesson).toEqual(cachedLesson);
    expect(mocks.readLesson).toHaveBeenNthCalledWith(1, ids.nextVersion);
    expect(mocks.readLesson).toHaveBeenNthCalledWith(2, ids.version);
    expect(writes).toEqual([]);
  });

  it("reste fermé si le cache diverge ou si la réponse est invalide", async () => {
    const { store, client, mocks } = harness();
    mocks.readCurrentRelease.mockResolvedValue(release);
    mocks.readLesson.mockResolvedValue(lesson("d".repeat(64)));
    mocks.getCurrentRelease.mockRejectedValue(
      new PublicContentTransportError(),
    );

    await expect(
      loadCurrentMobileConnectedPublicLesson({
        database: {} as SQLiteDatabase,
        store,
        client,
      }),
    ).rejects.toBeInstanceOf(MobileConnectedPublicLessonError);

    mocks.readLesson.mockResolvedValue(lesson());
    mocks.getCurrentRelease.mockRejectedValue(new PublicContentProtocolError());
    await expect(
      loadCurrentMobileConnectedPublicLesson({
        database: {} as SQLiteDatabase,
        store,
        client,
      }),
    ).rejects.toBeInstanceOf(MobileConnectedPublicLessonError);
  });
});
