import {
  cachedPublicLessonSchema,
  cachedPublicReleaseSchema,
  verifyPublicLessonResponseIntegrity,
  verifyPublicReleaseResponseIntegrity,
  type CachedPublicLesson,
  type CachedPublicRelease,
  type PublicContentSha256Hex,
} from "@thainaute/sync";
import { publicLessonVersionIdSchema } from "@thainaute/content/public";
import type { SQLiteDatabase } from "expo-sqlite";

import {
  runMobileSQLiteTransaction,
  serializeMobileSQLiteOperation,
} from "./mobile-sqlite-operation-queue";
import { getActiveMobileLanguagePack } from "./mobile-language-pack";

type PublicContentCacheKind = "lesson" | "release";
type PublicContentCacheEntry = CachedPublicLesson | CachedPublicRelease;

interface PublicContentCacheRow {
  readonly payload: string;
  readonly validated_at: string;
}

export type MobilePublicContentCacheFailureCode =
  | "cache_conflict"
  | "cache_corrupt"
  | "cache_unavailable"
  | "invalid_entry"
  | "invalid_key";

export class MobilePublicContentCacheError extends Error {
  public readonly code: MobilePublicContentCacheFailureCode;

  public constructor(code: MobilePublicContentCacheFailureCode) {
    super("Le cache public local n’a pas pu être utilisé en sécurité.");
    this.name = "MobilePublicContentCacheError";
    this.code = code;
  }
}

function serializeDatabaseOperation<T>(
  database: SQLiteDatabase,
  operation: () => Promise<T>,
): Promise<T> {
  return serializeMobileSQLiteOperation(database, operation);
}

function parseEntry(
  kind: PublicContentCacheKind,
  value: unknown,
): PublicContentCacheEntry {
  const result =
    kind === "release"
      ? cachedPublicReleaseSchema.safeParse(value)
      : cachedPublicLessonSchema.safeParse(value);
  if (!result.success) {
    throw new MobilePublicContentCacheError("cache_corrupt");
  }
  const activePack = getActiveMobileLanguagePack();
  const content =
    result.data.kind === "release"
      ? result.data.response.release
      : result.data.response.lesson;
  if (
    content.languagePackId !== activePack.id ||
    content.targetLocale !== activePack.targetLocale
  ) {
    throw new MobilePublicContentCacheError("cache_corrupt");
  }
  return result.data;
}

async function parseStoredEntry(
  kind: PublicContentCacheKind,
  row: PublicContentCacheRow,
  sha256Hex: PublicContentSha256Hex,
): Promise<PublicContentCacheEntry> {
  let payload: unknown;
  try {
    payload = JSON.parse(row.payload) as unknown;
  } catch {
    throw new MobilePublicContentCacheError("cache_corrupt");
  }
  const entry = parseEntry(kind, payload);
  if (entry.validatedAt !== row.validated_at) {
    throw new MobilePublicContentCacheError("cache_corrupt");
  }
  try {
    if (entry.kind === "release") {
      await verifyPublicReleaseResponseIntegrity(entry.response, sha256Hex);
    } else {
      await verifyPublicLessonResponseIntegrity(entry.response, sha256Hex);
    }
  } catch {
    throw new MobilePublicContentCacheError("cache_corrupt");
  }
  return entry;
}

async function readStoredEntryOrPurgeCorrupt(
  transaction: SQLiteDatabase,
  kind: PublicContentCacheKind,
  key: string,
  row: PublicContentCacheRow,
  sha256Hex: PublicContentSha256Hex,
): Promise<PublicContentCacheEntry | null> {
  try {
    return await parseStoredEntry(kind, row, sha256Hex);
  } catch (error) {
    if (
      !(error instanceof MobilePublicContentCacheError) ||
      error.code !== "cache_corrupt"
    ) {
      throw error;
    }
    await transaction.runAsync(
      `DELETE FROM public_content_cache
       WHERE kind = ? AND cache_key = ?`,
      kind,
      key,
    );
    return null;
  }
}

function canonicalEntry(entry: PublicContentCacheEntry): string {
  return JSON.stringify(entry);
}

function immutableEntryBody(entry: PublicContentCacheEntry): string {
  const { validatedAt: _validatedAt, ...body } = entry;
  return JSON.stringify(body);
}

function chooseImmutableStoredEntry(
  current: PublicContentCacheEntry,
  incoming: PublicContentCacheEntry,
): PublicContentCacheEntry {
  if (current.kind !== incoming.kind || current.key !== incoming.key) {
    throw new MobilePublicContentCacheError("cache_conflict");
  }

  if (immutableEntryBody(current) === immutableEntryBody(incoming)) {
    return Date.parse(incoming.validatedAt) > Date.parse(current.validatedAt)
      ? incoming
      : current;
  }

  // Une version de leçon publiée est immuable. Un autre corps sous le même
  // UUID signale donc une collision, quelle que soit l'horloge locale.
  throw new MobilePublicContentCacheError("cache_conflict");
}

function validateLessonKey(value: string): string {
  const result = publicLessonVersionIdSchema.safeParse(value);
  if (!result.success) {
    throw new MobilePublicContentCacheError("invalid_key");
  }
  return result.data;
}

/**
 * Cache public SQLite strict. Une ligne illisible n’est jamais servie : elle
 * est purgée atomiquement et devient un cache miss réparable par le réseau.
 */
export class MobilePublicContentStore {
  readonly #database: SQLiteDatabase;
  readonly #sha256Hex: PublicContentSha256Hex;

  public constructor(
    database: SQLiteDatabase,
    sha256Hex: PublicContentSha256Hex,
  ) {
    this.#database = database;
    this.#sha256Hex = sha256Hex;
  }

  public async readCurrentRelease(): Promise<CachedPublicRelease | null> {
    const entry = await this.#read("release", "current");
    if (entry === null) return null;
    if (entry.kind !== "release") {
      throw new MobilePublicContentCacheError("cache_corrupt");
    }
    return entry;
  }

  public async readLesson(
    versionIdInput: string,
  ): Promise<CachedPublicLesson | null> {
    const versionId = validateLessonKey(versionIdInput);
    const entry = await this.#read("lesson", versionId);
    if (entry === null) return null;
    if (entry.kind !== "lesson" || entry.key !== versionId) {
      throw new MobilePublicContentCacheError("cache_corrupt");
    }
    return entry;
  }

  public async writeCurrentRelease(
    input: CachedPublicRelease,
    expected: CachedPublicRelease | null,
  ): Promise<CachedPublicRelease> {
    const parsed = cachedPublicReleaseSchema.safeParse(input);
    const expectedParsed =
      expected === null ? null : cachedPublicReleaseSchema.safeParse(expected);
    if (!parsed.success || expectedParsed?.success === false) {
      throw new MobilePublicContentCacheError("invalid_entry");
    }
    try {
      await verifyPublicReleaseResponseIntegrity(
        parsed.data.response,
        this.#sha256Hex,
      );
      if (expectedParsed !== null) {
        await verifyPublicReleaseResponseIntegrity(
          expectedParsed.data.response,
          this.#sha256Hex,
        );
      }
    } catch {
      throw new MobilePublicContentCacheError("invalid_entry");
    }
    const entry = await this.#write(
      parsed.data,
      expectedParsed === null ? null : expectedParsed.data,
    );
    if (entry.kind !== "release") {
      throw new MobilePublicContentCacheError("cache_corrupt");
    }
    return entry;
  }

  public async writeLesson(
    input: CachedPublicLesson,
  ): Promise<CachedPublicLesson> {
    const parsed = cachedPublicLessonSchema.safeParse(input);
    if (!parsed.success) {
      throw new MobilePublicContentCacheError("invalid_entry");
    }
    try {
      await verifyPublicLessonResponseIntegrity(
        parsed.data.response,
        this.#sha256Hex,
      );
    } catch {
      throw new MobilePublicContentCacheError("invalid_entry");
    }
    const entry = await this.#write(parsed.data, undefined);
    if (entry.kind !== "lesson") {
      throw new MobilePublicContentCacheError("cache_corrupt");
    }
    return entry;
  }

  async #read(
    kind: PublicContentCacheKind,
    key: string,
  ): Promise<PublicContentCacheEntry | null> {
    try {
      return await serializeDatabaseOperation(this.#database, async () => {
        let stored: PublicContentCacheEntry | null | undefined;
        await runMobileSQLiteTransaction(
          this.#database,
          async (transaction) => {
            const row = await transaction.getFirstAsync<PublicContentCacheRow>(
              `SELECT payload, validated_at
                 FROM public_content_cache
                 WHERE kind = ? AND cache_key = ?`,
              kind,
              key,
            );
            stored =
              row === null
                ? null
                : await readStoredEntryOrPurgeCorrupt(
                    transaction,
                    kind,
                    key,
                    row,
                    this.#sha256Hex,
                  );
          },
        );
        if (stored === undefined) {
          throw new MobilePublicContentCacheError("cache_unavailable");
        }
        return stored;
      });
    } catch (error) {
      if (error instanceof MobilePublicContentCacheError) throw error;
      throw new MobilePublicContentCacheError("cache_unavailable");
    }
  }

  async #write(
    incoming: PublicContentCacheEntry,
    expectedRelease: CachedPublicRelease | null | undefined,
  ): Promise<PublicContentCacheEntry> {
    try {
      return await serializeDatabaseOperation(this.#database, async () => {
        let stored: PublicContentCacheEntry | undefined;
        await runMobileSQLiteTransaction(
          this.#database,
          async (transaction) => {
            const row = await transaction.getFirstAsync<PublicContentCacheRow>(
              `SELECT payload, validated_at
               FROM public_content_cache
               WHERE kind = ? AND cache_key = ?`,
              incoming.kind,
              incoming.key,
            );
            const current =
              row === null
                ? null
                : await readStoredEntryOrPurgeCorrupt(
                    transaction,
                    incoming.kind,
                    incoming.key,
                    row,
                    this.#sha256Hex,
                  );
            if (current !== null) {
              let selected: PublicContentCacheEntry;
              if (incoming.kind === "release") {
                if (current.kind !== "release") {
                  throw new MobilePublicContentCacheError("cache_conflict");
                }
                if (
                  expectedRelease !== null &&
                  expectedRelease !== undefined &&
                  canonicalEntry(current) !== canonicalEntry(expectedRelease)
                ) {
                  // Une autre réponse a gagné. Seule la même release peut
                  // encore actualiser son horodatage sans écraser ce gagnant.
                  selected = chooseImmutableStoredEntry(current, incoming);
                } else if (expectedRelease === null) {
                  selected = chooseImmutableStoredEntry(current, incoming);
                } else {
                  // Le compare-and-swap autorise aussi un rollback explicite
                  // du manifeste courant, sans se fier à l'heure du téléphone.
                  selected =
                    immutableEntryBody(current) === immutableEntryBody(incoming)
                      ? chooseImmutableStoredEntry(current, incoming)
                      : incoming;
                }
              } else {
                selected = chooseImmutableStoredEntry(current, incoming);
              }
              if (selected === current) {
                stored = selected;
                return;
              }
            } else if (
              incoming.kind === "release" &&
              expectedRelease !== null
            ) {
              throw new MobilePublicContentCacheError("cache_conflict");
            }

            await transaction.runAsync(
              `INSERT INTO public_content_cache
                 (kind, cache_key, payload, validated_at)
               VALUES (?, ?, ?, ?)
               ON CONFLICT (kind, cache_key) DO UPDATE SET
                 payload = excluded.payload,
                 validated_at = excluded.validated_at`,
              incoming.kind,
              incoming.key,
              canonicalEntry(incoming),
              incoming.validatedAt,
            );
            stored = incoming;
          },
        );
        if (stored === undefined) {
          throw new MobilePublicContentCacheError("cache_unavailable");
        }
        return stored;
      });
    } catch (error) {
      if (error instanceof MobilePublicContentCacheError) throw error;
      throw new MobilePublicContentCacheError("cache_unavailable");
    }
  }
}
