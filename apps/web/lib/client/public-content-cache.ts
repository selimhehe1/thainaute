"use client";

import {
  cachedPublicLessonSchema,
  cachedPublicReleaseSchema,
  verifyPublicLessonResponseIntegrity,
  verifyPublicReleaseResponseIntegrity,
  type CachedPublicLesson,
  type CachedPublicRelease,
  type PublicContentSha256Hex,
} from "@thainaute/sync";
import Dexie, { type EntityTable } from "dexie";

import { browserSha256Hex } from "./sha256";

export const WEB_PUBLIC_CONTENT_CACHE_DATABASE_NAME =
  "thainaute-public-content-v1";

const CURRENT_RELEASE_KEY = "release:current";
const LESSON_KEY_PREFIX = "lesson:";

interface PublicContentCacheRow {
  readonly key: string;
  readonly entry: string;
}

type PublicContentCacheDatabase = Dexie & {
  readonly entries: EntityTable<PublicContentCacheRow, "key">;
};

function openDatabase(name: string): PublicContentCacheDatabase {
  const database = new Dexie(name) as PublicContentCacheDatabase;
  database.version(1).stores({ entries: "&key" });
  return database;
}

export class WebPublicContentCacheError extends Error {
  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "WebPublicContentCacheError";
  }
}

function parseLessonVersionId(versionIdInput: string): string {
  const result = cachedPublicLessonSchema.shape.key.safeParse(versionIdInput);
  if (!result.success) {
    throw new WebPublicContentCacheError(
      "L’identifiant de la leçon à mettre en cache est invalide.",
    );
  }
  return result.data;
}

function lessonStorageKey(versionId: string): string {
  return `${LESSON_KEY_PREFIX}${versionId}`;
}

function parseJson(serialized: string): unknown {
  try {
    return JSON.parse(serialized) as unknown;
  } catch (error) {
    throw new WebPublicContentCacheError(
      "Le cache public est illisible et n’a pas été modifié.",
      { cause: error },
    );
  }
}

async function parseStoredRelease(
  row: PublicContentCacheRow | undefined,
  sha256Hex: PublicContentSha256Hex,
): Promise<CachedPublicRelease | null> {
  if (row === undefined) return null;
  try {
    const entry = cachedPublicReleaseSchema.parse(parseJson(row.entry));
    await verifyPublicReleaseResponseIntegrity(entry.response, sha256Hex);
    return entry;
  } catch (error) {
    if (error instanceof WebPublicContentCacheError) throw error;
    throw new WebPublicContentCacheError(
      "Le manifeste public en cache est invalide et n’a pas été modifié.",
      { cause: error },
    );
  }
}

async function parseStoredLesson(
  row: PublicContentCacheRow | undefined,
  expectedVersionId: string,
  sha256Hex: PublicContentSha256Hex,
): Promise<CachedPublicLesson | null> {
  if (row === undefined) return null;
  try {
    const entry = cachedPublicLessonSchema.parse(parseJson(row.entry));
    if (entry.key !== expectedVersionId) {
      throw new Error("La ligne vise une autre version de leçon.");
    }
    await verifyPublicLessonResponseIntegrity(entry.response, sha256Hex);
    return entry;
  } catch (error) {
    if (error instanceof WebPublicContentCacheError) throw error;
    throw new WebPublicContentCacheError(
      "La leçon publique en cache est invalide et n’a pas été modifiée.",
      { cause: error },
    );
  }
}

async function validateRelease(
  entryInput: CachedPublicRelease,
  sha256Hex: PublicContentSha256Hex,
): Promise<CachedPublicRelease> {
  try {
    const entry = cachedPublicReleaseSchema.parse(entryInput);
    await verifyPublicReleaseResponseIntegrity(entry.response, sha256Hex);
    return entry;
  } catch (error) {
    throw new WebPublicContentCacheError(
      "Le manifeste public reçu ne peut pas être mis en cache.",
      { cause: error },
    );
  }
}

async function validateLesson(
  entryInput: CachedPublicLesson,
  sha256Hex: PublicContentSha256Hex,
): Promise<CachedPublicLesson> {
  try {
    const entry = cachedPublicLessonSchema.parse(entryInput);
    await verifyPublicLessonResponseIntegrity(entry.response, sha256Hex);
    return entry;
  } catch (error) {
    throw new WebPublicContentCacheError(
      "La leçon publique reçue ne peut pas être mise en cache.",
      { cause: error },
    );
  }
}

function immutableReleaseBody(entry: CachedPublicRelease): string {
  return JSON.stringify({
    kind: entry.kind,
    key: entry.key,
    etag: entry.etag,
    response: entry.response,
  });
}

function canonicalRelease(entry: CachedPublicRelease): string {
  return JSON.stringify(entry);
}

/**
 * Cache partagé de contenu public gratuit. Il ne reçoit aucun propriétaire,
 * sujet Auth ou primitive de purge compte : ses deux espaces de clés sont
 * uniquement `release:current` et `lesson:<version UUID>`.
 */
export class WebPublicContentCache {
  readonly #database: PublicContentCacheDatabase;
  readonly #sha256Hex: PublicContentSha256Hex;

  public constructor(
    databaseName: string = WEB_PUBLIC_CONTENT_CACHE_DATABASE_NAME,
    sha256Hex: PublicContentSha256Hex = browserSha256Hex,
  ) {
    this.#database = openDatabase(databaseName);
    this.#sha256Hex = sha256Hex;
  }

  public async readCurrentRelease(): Promise<CachedPublicRelease | null> {
    try {
      return await parseStoredRelease(
        await this.#database.entries.get(CURRENT_RELEASE_KEY),
        this.#sha256Hex,
      );
    } catch (error) {
      if (error instanceof WebPublicContentCacheError) throw error;
      throw new WebPublicContentCacheError(
        "Le cache du manifeste public est temporairement indisponible.",
        { cause: error },
      );
    }
  }

  public async readLesson(
    versionIdInput: string,
  ): Promise<CachedPublicLesson | null> {
    const versionId = parseLessonVersionId(versionIdInput);
    try {
      return await parseStoredLesson(
        await this.#database.entries.get(lessonStorageKey(versionId)),
        versionId,
        this.#sha256Hex,
      );
    } catch (error) {
      if (error instanceof WebPublicContentCacheError) throw error;
      throw new WebPublicContentCacheError(
        "Le cache de la leçon publique est temporairement indisponible.",
        { cause: error },
      );
    }
  }

  public async writeCurrentRelease(
    entryInput: CachedPublicRelease,
    expectedInput: CachedPublicRelease | null,
  ): Promise<CachedPublicRelease> {
    const entry = await validateRelease(entryInput, this.#sha256Hex);
    const expected =
      expectedInput === null
        ? null
        : await validateRelease(expectedInput, this.#sha256Hex);
    try {
      return await this.#database.transaction(
        "rw",
        this.#database.entries,
        async () => {
          // Une ligne corrompue reste une preuve à diagnostiquer. Une écriture
          // réseau ultérieure ne doit pas la remplacer silencieusement.
          const currentRow =
            await this.#database.entries.get(CURRENT_RELEASE_KEY);
          const current = await Dexie.waitFor(
            parseStoredRelease(currentRow, this.#sha256Hex),
          );
          if (current === null && expected !== null) {
            throw new WebPublicContentCacheError(
              "Le manifeste courant a changé pendant sa revalidation.",
            );
          }
          if (
            current !== null &&
            ((expected === null &&
              immutableReleaseBody(current) !== immutableReleaseBody(entry)) ||
              (expected !== null &&
                canonicalRelease(current) !== canonicalRelease(expected) &&
                immutableReleaseBody(current) !== immutableReleaseBody(entry)))
          ) {
            throw new WebPublicContentCacheError(
              "Un autre manifeste courant a gagné la revalidation.",
            );
          }
          const selected =
            current !== null &&
            immutableReleaseBody(current) === immutableReleaseBody(entry) &&
            Date.parse(current.validatedAt) > Date.parse(entry.validatedAt)
              ? current
              : entry;
          if (
            current !== null &&
            canonicalRelease(current) === canonicalRelease(selected)
          ) {
            return current;
          }
          await this.#database.entries.put({
            key: CURRENT_RELEASE_KEY,
            entry: JSON.stringify(selected),
          });
          return selected;
        },
      );
    } catch (error) {
      if (error instanceof WebPublicContentCacheError) throw error;
      throw new WebPublicContentCacheError(
        "Le manifeste public n’a pas pu être mis en cache.",
        { cause: error },
      );
    }
  }

  public async writeLesson(
    entryInput: CachedPublicLesson,
  ): Promise<CachedPublicLesson> {
    const entry = await validateLesson(entryInput, this.#sha256Hex);
    const versionId = parseLessonVersionId(entry.key);
    const storageKey = lessonStorageKey(versionId);
    try {
      return await this.#database.transaction(
        "rw",
        this.#database.entries,
        async () => {
          const currentRow = await this.#database.entries.get(storageKey);
          const current = await Dexie.waitFor(
            parseStoredLesson(currentRow, versionId, this.#sha256Hex),
          );
          if (
            current !== null &&
            current.response.contentSha256 !== entry.response.contentSha256
          ) {
            throw new WebPublicContentCacheError(
              "Une version de leçon immuable existe déjà avec un autre hash.",
            );
          }
          await this.#database.entries.put({
            key: storageKey,
            entry: JSON.stringify(entry),
          });
          return entry;
        },
      );
    } catch (error) {
      if (error instanceof WebPublicContentCacheError) throw error;
      throw new WebPublicContentCacheError(
        "La leçon publique n’a pas pu être mise en cache.",
        { cause: error },
      );
    }
  }

  public close(): void {
    this.#database.close();
  }
}
