import {
  createPublicContentClient,
  type CachedPublicLesson,
  type CachedPublicRelease,
  type PublicContentClient,
} from "@thainaute/sync";
import type { SQLiteDatabase } from "expo-sqlite";

import { MobilePublicContentStore } from "./mobile-public-content-store";
import { parseMobileNetworkUrl } from "./mobile-network-url";
import { mobileSha256Hex } from "./sha256";

export class MobileConnectedPublicLessonError extends Error {
  public constructor() {
    super("La leçon connectée vérifiée est momentanément indisponible.");
    this.name = "MobileConnectedPublicLessonError";
  }
}

export interface MobileConnectedPublicLesson {
  readonly release: CachedPublicRelease;
  readonly lesson: CachedPublicLesson;
  readonly audioUrl: (assetId: string) => string;
}

export interface MobileConnectedPublicLessonStore {
  readCurrentRelease(): Promise<CachedPublicRelease | null>;
  readLesson(versionId: string): Promise<CachedPublicLesson | null>;
  writeCurrentRelease(
    input: CachedPublicRelease,
    expected: CachedPublicRelease | null,
  ): Promise<CachedPublicRelease>;
  writeLesson(input: CachedPublicLesson): Promise<CachedPublicLesson>;
}

export function readMobileApiOrigin(): string {
  const value = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (value === undefined || value === "") {
    throw new MobileConnectedPublicLessonError();
  }
  const result = parseMobileNetworkUrl({
    development: process.env.NODE_ENV === "development",
    kind: "api_origin",
    value,
  });
  if (!result.success) {
    throw new MobileConnectedPublicLessonError();
  }
  return result.url;
}

function manifestMatchesLesson(
  releaseEntry: CachedPublicRelease,
  lessonEntry: CachedPublicLesson,
): boolean {
  const release = releaseEntry.response.release;
  const lesson = lessonEntry.response.lesson;
  const announced = release.lessons.find(
    ({ versionId }) => versionId === lesson.versionId,
  );
  return (
    announced !== undefined &&
    release.releaseId === lesson.releaseId &&
    release.releaseVersion === lesson.releaseVersion &&
    announced.lessonId === lesson.lessonId &&
    announced.revision === lesson.revision &&
    announced.titleFr === lesson.titleFr &&
    announced.objectiveFr === lesson.objectiveFr &&
    announced.access === lesson.access &&
    announced.contentSha256 === lessonEntry.response.contentSha256
  );
}

export async function loadCurrentMobileConnectedPublicLesson(input: {
  readonly database: SQLiteDatabase;
  readonly store?: MobileConnectedPublicLessonStore;
  readonly client?: PublicContentClient;
}): Promise<MobileConnectedPublicLesson> {
  const store =
    input.store ??
    new MobilePublicContentStore(input.database, mobileSha256Hex);
  const origin = input.client === undefined ? readMobileApiOrigin() : "";
  const client =
    input.client ??
    createPublicContentClient({
      baseUrl: origin,
      allowInsecureHttp: process.env.NODE_ENV !== "production",
      sha256Hex: mobileSha256Hex,
    });
  try {
    const previousRelease = await store.readCurrentRelease();
    const fetchedRelease = await client.getCurrentRelease(
      previousRelease ?? undefined,
    );
    const announcedLesson = fetchedRelease.entry.response.release.lessons[0];
    if (announcedLesson === undefined) {
      throw new MobileConnectedPublicLessonError();
    }
    const previousLesson = await store.readLesson(announcedLesson.versionId);
    const fetchedLesson = await client.getLesson(
      announcedLesson.versionId,
      previousLesson ?? undefined,
    );
    if (!manifestMatchesLesson(fetchedRelease.entry, fetchedLesson.entry)) {
      throw new MobileConnectedPublicLessonError();
    }

    // Promouvoir d'abord la version immuable évite qu'un pointeur de release
    // courant puisse viser momentanément une leçon absente. Le CAS ferme les
    // réponses réseau concurrentes arrivées en retard.
    await store.writeLesson(fetchedLesson.entry);
    await store.writeCurrentRelease(fetchedRelease.entry, previousRelease);
    return {
      release: fetchedRelease.entry,
      lesson: fetchedLesson.entry,
      audioUrl: (assetId) => client.audioUrl(fetchedLesson.entry.key, assetId),
    };
  } catch (error) {
    if (error instanceof MobileConnectedPublicLessonError) throw error;
    throw new MobileConnectedPublicLessonError();
  }
}
