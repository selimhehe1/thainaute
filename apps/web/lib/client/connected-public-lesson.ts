"use client";

import {
  createPublicContentClient,
  type CachedPublicLesson,
  type CachedPublicRelease,
  type PublicContentClient,
} from "@thainaute/sync";

import { WebPublicContentCache } from "./public-content-cache";
import { browserSha256Hex } from "./sha256";

export class ConnectedPublicLessonError extends Error {
  public constructor() {
    super("La leçon connectée vérifiée est momentanément indisponible.");
    this.name = "ConnectedPublicLessonError";
  }
}

export interface ConnectedPublicLesson {
  readonly release: CachedPublicRelease;
  readonly lesson: CachedPublicLesson;
  readonly audioUrl: (assetId: string) => string;
}

export interface ConnectedPublicLessonCache {
  readCurrentRelease(): Promise<CachedPublicRelease | null>;
  readLesson(versionId: string): Promise<CachedPublicLesson | null>;
  writeCurrentRelease(
    entry: CachedPublicRelease,
    expected: CachedPublicRelease | null,
  ): Promise<CachedPublicRelease>;
  writeLesson(entry: CachedPublicLesson): Promise<CachedPublicLesson>;
  close(): void;
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

/** Charge une seule leçon de preview, première entrée du manifeste canonique. */
export async function loadCurrentConnectedPublicLesson(input?: {
  readonly cache?: ConnectedPublicLessonCache;
  readonly client?: PublicContentClient;
}): Promise<ConnectedPublicLesson> {
  const cache = input?.cache ?? new WebPublicContentCache();
  const client =
    input?.client ??
    createPublicContentClient({
      baseUrl: "",
      sha256Hex: browserSha256Hex,
    });
  try {
    const previousRelease = await cache.readCurrentRelease();
    const fetchedRelease = await client.getCurrentRelease(
      previousRelease ?? undefined,
    );
    const announcedLesson = fetchedRelease.entry.response.release.lessons[0];
    if (announcedLesson === undefined) throw new ConnectedPublicLessonError();

    const previousLesson = await cache.readLesson(announcedLesson.versionId);
    const fetchedLesson = await client.getLesson(
      announcedLesson.versionId,
      previousLesson ?? undefined,
    );
    if (!manifestMatchesLesson(fetchedRelease.entry, fetchedLesson.entry)) {
      throw new ConnectedPublicLessonError();
    }

    // L'incohérence manifeste/leçon est rejetée avant toute promotion locale.
    // La leçon immuable est promue avant le pointeur courant. Le CAS du
    // manifeste empêche ensuite une réponse réseau plus ancienne d'écraser
    // la release gagnante ; au pire, une leçon publique orpheline reste en cache.
    await cache.writeLesson(fetchedLesson.entry);
    await cache.writeCurrentRelease(fetchedRelease.entry, previousRelease);
    return {
      release: fetchedRelease.entry,
      lesson: fetchedLesson.entry,
      audioUrl: (assetId) => client.audioUrl(fetchedLesson.entry.key, assetId),
    };
  } catch (error) {
    if (error instanceof ConnectedPublicLessonError) throw error;
    throw new ConnectedPublicLessonError();
  } finally {
    cache.close();
  }
}
