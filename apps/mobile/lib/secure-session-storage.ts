const SESSION_CHUNK_CODE_POINTS = 400;
const MAX_SESSION_CHUNKS = 64;
const REMOVE_BATCH_SIZE = 8;
const LEGACY_MIGRATION_MARKER_VALUE = "1";

interface SecureKeyValueStorage {
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  setItem(key: string, value: string): Promise<void>;
}

interface ChunkManifestV1 {
  readonly schemaVersion: 1;
  readonly chunkCount: number;
  readonly valueLength: number;
}

type ChunkSlot = 0 | 1;

interface ChunkManifestV2 {
  readonly schemaVersion: 2;
  readonly slot: ChunkSlot;
  readonly chunkCount: number;
  readonly valueLength: number;
}

type ChunkManifest = ChunkManifestV1 | ChunkManifestV2;

type StoredValue =
  | { readonly kind: "absent" }
  | { readonly kind: "corrupted" }
  | { readonly kind: "legacy"; readonly value: string }
  | { readonly kind: "manifest"; readonly manifest: ChunkManifest };

type CleanupDescriptor =
  | { readonly kind: "absent" }
  | { readonly kind: "legacy" }
  | { readonly kind: "unknown" }
  | {
      readonly kind: "v1";
      readonly chunkCount: number;
      readonly valueLength: number;
    }
  | {
      readonly kind: "v2";
      readonly slot: ChunkSlot;
      readonly chunkCount: number;
      readonly valueLength: number;
    };

interface PendingSetTransaction {
  readonly schemaVersion: 1;
  readonly operation: "set";
  readonly target: ChunkManifestV2;
  readonly previous: CleanupDescriptor;
}

interface PendingDeleteTransaction {
  readonly schemaVersion: 1;
  readonly operation: "delete";
  readonly previous: CleanupDescriptor;
}

interface PendingLegacyMigrationTransaction {
  readonly schemaVersion: 1;
  readonly operation: "migrate_legacy";
}

type PendingTransaction =
  | PendingSetTransaction
  | PendingDeleteTransaction
  | PendingLegacyMigrationTransaction;

const operationQueues = new Map<string, Promise<void>>();

function legacyChunkKey(key: string, index: number): string {
  return `${key}.thainaute_chunk_${index}`;
}

function chunkKey(key: string, slot: ChunkSlot, index: number): string {
  return `${key}.thainaute_chunk_v2_${slot}_${index}`;
}

function stagingKey(key: string): string {
  return `${key}.thainaute_staging_v2`;
}

function legacyMigrationMarkerKey(key: string): string {
  return `${key}.thainaute_legacy_migrated_v2`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isChunkCount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= MAX_SESSION_CHUNKS
  );
}

function isValueLength(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function parseManifestCandidate(
  candidate: Record<string, unknown>,
): ChunkManifest | null {
  if (
    candidate.schemaVersion === 1 &&
    isChunkCount(candidate.chunkCount) &&
    isValueLength(candidate.valueLength)
  ) {
    return {
      schemaVersion: 1,
      chunkCount: candidate.chunkCount,
      valueLength: candidate.valueLength,
    };
  }

  if (
    candidate.schemaVersion === 2 &&
    (candidate.slot === 0 || candidate.slot === 1) &&
    isChunkCount(candidate.chunkCount) &&
    isValueLength(candidate.valueLength)
  ) {
    return {
      schemaVersion: 2,
      slot: candidate.slot,
      chunkCount: candidate.chunkCount,
      valueLength: candidate.valueLength,
    };
  }

  return null;
}

function inspectStoredValue(value: string | null): StoredValue {
  if (value === null) return { kind: "absent" };

  try {
    const candidate: unknown = JSON.parse(value);
    if (!isRecord(candidate)) return { kind: "legacy", value };

    const manifest = parseManifestCandidate(candidate);
    if (manifest !== null) return { kind: "manifest", manifest };

    if (
      "schemaVersion" in candidate ||
      ("chunkCount" in candidate && "valueLength" in candidate)
    ) {
      return { kind: "corrupted" };
    }
  } catch {
    if (/^\s*\{\s*["']?schemaVersion["']?\s*:/.test(value)) {
      return { kind: "corrupted" };
    }
  }

  return { kind: "legacy", value };
}

function parseCleanupDescriptor(value: unknown): CleanupDescriptor | null {
  if (!isRecord(value) || typeof value.kind !== "string") return null;

  if (
    value.kind === "absent" ||
    value.kind === "legacy" ||
    value.kind === "unknown"
  ) {
    return { kind: value.kind };
  }

  if (
    value.kind === "v1" &&
    isChunkCount(value.chunkCount) &&
    isValueLength(value.valueLength)
  ) {
    return {
      kind: "v1",
      chunkCount: value.chunkCount,
      valueLength: value.valueLength,
    };
  }

  if (
    value.kind === "v2" &&
    (value.slot === 0 || value.slot === 1) &&
    isChunkCount(value.chunkCount) &&
    isValueLength(value.valueLength)
  ) {
    return {
      kind: "v2",
      slot: value.slot,
      chunkCount: value.chunkCount,
      valueLength: value.valueLength,
    };
  }

  return null;
}

function parsePendingTransaction(value: string): PendingTransaction | null {
  try {
    const candidate: unknown = JSON.parse(value);
    if (
      !isRecord(candidate) ||
      candidate.schemaVersion !== 1 ||
      (candidate.operation !== "set" &&
        candidate.operation !== "delete" &&
        candidate.operation !== "migrate_legacy")
    ) {
      return null;
    }

    if (candidate.operation === "migrate_legacy") {
      return { schemaVersion: 1, operation: "migrate_legacy" };
    }

    const previous = parseCleanupDescriptor(candidate.previous);
    if (previous === null) return null;

    if (candidate.operation === "delete") {
      return { schemaVersion: 1, operation: "delete", previous };
    }

    if (previous.kind === "unknown") return null;

    if (!isRecord(candidate.target)) return null;
    const target = parseManifestCandidate(candidate.target);
    if (target === null || target.schemaVersion !== 2) return null;
    if (previous.kind === "v2" && previous.slot === target.slot) return null;

    return {
      schemaVersion: 1,
      operation: "set",
      target,
      previous,
    };
  } catch {
    return null;
  }
}

function splitValue(value: string): string[] {
  const codePoints = Array.from(value);
  const chunks: string[] = [];
  for (
    let offset = 0;
    offset < Math.max(1, codePoints.length);
    offset += SESSION_CHUNK_CODE_POINTS
  ) {
    chunks.push(
      codePoints.slice(offset, offset + SESSION_CHUNK_CODE_POINTS).join(""),
    );
  }
  return chunks;
}

async function setAndConfirm(
  storage: SecureKeyValueStorage,
  key: string,
  value: string,
  errorMessage: string,
): Promise<void> {
  await storage.setItem(key, value);
  if ((await storage.getItem(key)) !== value) throw new Error(errorMessage);
}

async function removeAndConfirm(
  storage: SecureKeyValueStorage,
  key: string,
): Promise<void> {
  await storage.removeItem(key);
  if ((await storage.getItem(key)) !== null) {
    throw new Error("SecureStore n'a pas confirmé la suppression locale.");
  }
}

async function removeKeysInBatches(
  storage: SecureKeyValueStorage,
  keys: readonly string[],
): Promise<void> {
  for (let offset = 0; offset < keys.length; offset += REMOVE_BATCH_SIZE) {
    const results = await Promise.allSettled(
      keys
        .slice(offset, offset + REMOVE_BATCH_SIZE)
        .map((key) => removeAndConfirm(storage, key)),
    );
    const failure = results.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (failure !== undefined) throw failure.reason;
  }
}

function indexes(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index);
}

function removeLegacyChunks(
  storage: SecureKeyValueStorage,
  key: string,
  count: number,
): Promise<void> {
  return removeKeysInBatches(
    storage,
    indexes(count).map((index) => legacyChunkKey(key, index)),
  );
}

function removeVersionedChunks(
  storage: SecureKeyValueStorage,
  key: string,
  slot: ChunkSlot,
  count: number,
): Promise<void> {
  return removeKeysInBatches(
    storage,
    indexes(count).map((index) => chunkKey(key, slot, index)),
  );
}

async function cleanupDescriptor(
  storage: SecureKeyValueStorage,
  key: string,
  descriptor: CleanupDescriptor,
): Promise<void> {
  switch (descriptor.kind) {
    case "absent":
      return;
    case "legacy":
      // L'ancien format n'enregistrait pas le nombre d'éventuels fragments.
      await removeLegacyChunks(storage, key, MAX_SESSION_CHUNKS);
      return;
    case "v1":
      await removeLegacyChunks(storage, key, descriptor.chunkCount);
      return;
    case "v2":
      await removeVersionedChunks(
        storage,
        key,
        descriptor.slot,
        descriptor.chunkCount,
      );
      return;
    case "unknown":
      await removeLegacyChunks(storage, key, MAX_SESSION_CHUNKS);
      await removeVersionedChunks(storage, key, 0, MAX_SESSION_CHUNKS);
      await removeVersionedChunks(storage, key, 1, MAX_SESSION_CHUNKS);
  }
}

function descriptorFor(value: StoredValue): CleanupDescriptor {
  switch (value.kind) {
    case "absent":
      return { kind: "absent" };
    case "legacy":
      return { kind: "legacy" };
    case "corrupted":
      return { kind: "unknown" };
    case "manifest":
      return value.manifest.schemaVersion === 1
        ? {
            kind: "v1",
            chunkCount: value.manifest.chunkCount,
            valueLength: value.manifest.valueLength,
          }
        : {
            kind: "v2",
            slot: value.manifest.slot,
            chunkCount: value.manifest.chunkCount,
            valueLength: value.manifest.valueLength,
          };
  }
}

function storedValueMatchesDescriptor(
  value: StoredValue,
  descriptor: CleanupDescriptor,
): boolean {
  if (descriptor.kind === "absent") return value.kind === "absent";
  if (descriptor.kind === "legacy") return value.kind === "legacy";
  if (descriptor.kind === "unknown") return false;
  if (value.kind !== "manifest") return false;

  const manifest = value.manifest;
  if (descriptor.kind === "v1") {
    return (
      manifest.schemaVersion === 1 &&
      manifest.chunkCount === descriptor.chunkCount &&
      manifest.valueLength === descriptor.valueLength
    );
  }

  return (
    manifest.schemaVersion === 2 &&
    manifest.slot === descriptor.slot &&
    manifest.chunkCount === descriptor.chunkCount &&
    manifest.valueLength === descriptor.valueLength
  );
}

function storedValueMatchesTarget(
  value: StoredValue,
  target: ChunkManifestV2,
): boolean {
  return (
    value.kind === "manifest" &&
    value.manifest.schemaVersion === 2 &&
    value.manifest.slot === target.slot &&
    value.manifest.chunkCount === target.chunkCount &&
    value.manifest.valueLength === target.valueLength
  );
}

async function writePendingTransaction(
  storage: SecureKeyValueStorage,
  key: string,
  transaction: PendingTransaction,
): Promise<void> {
  await setAndConfirm(
    storage,
    stagingKey(key),
    JSON.stringify(transaction),
    "SecureStore n'a pas confirmé le journal de session.",
  );
}

async function writeLegacyMigrationMarker(
  storage: SecureKeyValueStorage,
  key: string,
): Promise<void> {
  await setAndConfirm(
    storage,
    legacyMigrationMarkerKey(key),
    LEGACY_MIGRATION_MARKER_VALUE,
    "SecureStore n'a pas confirmé la migration du stockage de session.",
  );
}

async function finishLegacyMigration(
  storage: SecureKeyValueStorage,
  key: string,
): Promise<void> {
  await removeLegacyChunks(storage, key, MAX_SESSION_CHUNKS);
  await writeLegacyMigrationMarker(storage, key);
}

async function cleanupCommittedDescriptor(
  storage: SecureKeyValueStorage,
  key: string,
  descriptor: CleanupDescriptor,
): Promise<void> {
  if (descriptor.kind === "v1" || descriptor.kind === "legacy") {
    const migrationFinished =
      (await storage.getItem(legacyMigrationMarkerKey(key))) ===
      LEGACY_MIGRATION_MARKER_VALUE;
    if (!migrationFinished) {
      await finishLegacyMigration(storage, key);
      return;
    }
    if (descriptor.kind === "legacy") return;
  }

  await cleanupDescriptor(storage, key, descriptor);
  if (descriptor.kind === "unknown") {
    await writeLegacyMigrationMarker(storage, key);
  }
}

async function ensureLegacyMigration(
  storage: SecureKeyValueStorage,
  key: string,
  stored: StoredValue,
): Promise<void> {
  if (
    (await storage.getItem(legacyMigrationMarkerKey(key))) ===
    LEGACY_MIGRATION_MARKER_VALUE
  ) {
    return;
  }
  if (stored.kind === "manifest" && stored.manifest.schemaVersion === 1) {
    return;
  }

  const transaction: PendingLegacyMigrationTransaction = {
    schemaVersion: 1,
    operation: "migrate_legacy",
  };
  await writePendingTransaction(storage, key, transaction);
  await finishLegacyMigration(storage, key);
  await removeAndConfirm(storage, stagingKey(key));
}

async function completeDeleteTransaction(
  storage: SecureKeyValueStorage,
  key: string,
  transaction: PendingDeleteTransaction,
): Promise<void> {
  await removeAndConfirm(storage, key);
  await cleanupCommittedDescriptor(storage, key, transaction.previous);
  await removeAndConfirm(storage, stagingKey(key));
}

async function purgeUnknownState(
  storage: SecureKeyValueStorage,
  key: string,
): Promise<void> {
  const transaction: PendingDeleteTransaction = {
    schemaVersion: 1,
    operation: "delete",
    previous: { kind: "unknown" },
  };
  await writePendingTransaction(storage, key, transaction);
  await completeDeleteTransaction(storage, key, transaction);
}

async function purgeInvalidManifest(
  storage: SecureKeyValueStorage,
  key: string,
): Promise<void> {
  const transaction: PendingDeleteTransaction = {
    schemaVersion: 1,
    operation: "delete",
    previous: { kind: "unknown" },
  };
  await writePendingTransaction(storage, key, transaction);
  await completeDeleteTransaction(storage, key, transaction);
}

async function restorePreviousManifest(
  storage: SecureKeyValueStorage,
  key: string,
  previous: CleanupDescriptor,
): Promise<void> {
  if (previous.kind === "v1") {
    await setAndConfirm(
      storage,
      key,
      JSON.stringify({
        schemaVersion: 1,
        chunkCount: previous.chunkCount,
        valueLength: previous.valueLength,
      } satisfies ChunkManifestV1),
      "SecureStore n'a pas confirmé le rollback de session.",
    );
    return;
  }
  if (previous.kind === "v2") {
    await setAndConfirm(
      storage,
      key,
      JSON.stringify({
        schemaVersion: 2,
        slot: previous.slot,
        chunkCount: previous.chunkCount,
        valueLength: previous.valueLength,
      } satisfies ChunkManifestV2),
      "SecureStore n'a pas confirmé le rollback de session.",
    );
    return;
  }

  // Une valeur legacy brute ne doit jamais être copiée dans le journal. La
  // cible a été relue intégralement avant publication ; une corruption externe
  // ultérieure reste donc fail-closed plutôt que de dupliquer ce secret.
  await removeAndConfirm(storage, key);
}

async function rollbackPendingTarget(
  storage: SecureKeyValueStorage,
  key: string,
  transaction: PendingSetTransaction,
): Promise<void> {
  await restorePreviousManifest(storage, key, transaction.previous);
  await removeVersionedChunks(
    storage,
    key,
    transaction.target.slot,
    transaction.target.chunkCount,
  );
  await removeAndConfirm(storage, stagingKey(key));
}

async function recoverPendingTransaction(
  storage: SecureKeyValueStorage,
  key: string,
): Promise<void> {
  const serialized = await storage.getItem(stagingKey(key));
  if (serialized === null) return;

  const transaction = parsePendingTransaction(serialized);
  if (transaction === null) {
    await purgeUnknownState(storage, key);
    return;
  }

  if (transaction.operation === "migrate_legacy") {
    await finishLegacyMigration(storage, key);
    await removeAndConfirm(storage, stagingKey(key));
    return;
  }

  if (transaction.operation === "delete") {
    await completeDeleteTransaction(storage, key, transaction);
    return;
  }

  const currentSerialized = await storage.getItem(key);
  const current = inspectStoredValue(currentSerialized);
  if (storedValueMatchesTarget(current, transaction.target)) {
    const targetIsExact =
      currentSerialized === JSON.stringify(transaction.target) &&
      (await readManifestValue(storage, key, transaction.target)) !== null;
    if (!targetIsExact) {
      await rollbackPendingTarget(storage, key, transaction);
      return;
    }

    await cleanupCommittedDescriptor(storage, key, transaction.previous);
    await removeAndConfirm(storage, stagingKey(key));
    return;
  }

  if (storedValueMatchesDescriptor(current, transaction.previous)) {
    await removeVersionedChunks(
      storage,
      key,
      transaction.target.slot,
      transaction.target.chunkCount,
    );
    await removeAndConfirm(storage, stagingKey(key));
    return;
  }

  await purgeUnknownState(storage, key);
}

async function readManifestValue(
  storage: SecureKeyValueStorage,
  key: string,
  manifest: ChunkManifest,
): Promise<string | null> {
  const chunks: string[] = [];
  for (let index = 0; index < manifest.chunkCount; index += 1) {
    const chunk = await storage.getItem(
      manifest.schemaVersion === 1
        ? legacyChunkKey(key, index)
        : chunkKey(key, manifest.slot, index),
    );
    if (chunk === null) return null;
    chunks.push(chunk);
  }

  const value = chunks.join("");
  return value.length === manifest.valueLength ? value : null;
}

async function prepareStoredValue(
  storage: SecureKeyValueStorage,
  key: string,
): Promise<StoredValue> {
  await recoverPendingTransaction(storage, key);
  const stored = inspectStoredValue(await storage.getItem(key));
  await ensureLegacyMigration(storage, key, stored);
  return stored;
}

/**
 * Stocke une session en petits secrets natifs. Un journal sans donnée sensible
 * est écrit avant les fragments, puis le manifeste principal valide le nouveau
 * slot en une seule écriture. Après une interruption, la prochaine opération
 * conserve le dernier slot validé et purge exactement le staging incomplet.
 * Les anciens manifestes v1 et les valeurs monobloc restent lisibles.
 */
export function createChunkedSecureSessionStorage(
  storage: SecureKeyValueStorage,
): SecureKeyValueStorage {
  function exclusively<T>(
    key: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const previous = operationQueues.get(key) ?? Promise.resolve();
    const result = previous.then(operation, operation);
    const settled = result.then(
      () => undefined,
      () => undefined,
    );
    operationQueues.set(key, settled);
    void settled.then(() => {
      if (operationQueues.get(key) === settled) operationQueues.delete(key);
    });
    return result;
  }

  return {
    getItem(key) {
      return exclusively(key, async () => {
        const stored = await prepareStoredValue(storage, key);

        if (stored.kind === "absent") return null;
        if (stored.kind === "legacy") return stored.value;
        if (stored.kind === "corrupted") {
          await purgeUnknownState(storage, key);
          return null;
        }

        const value = await readManifestValue(storage, key, stored.manifest);
        if (value !== null) return value;

        await purgeInvalidManifest(storage, key);
        return null;
      });
    },

    removeItem(key) {
      return exclusively(key, async () => {
        const stored = await prepareStoredValue(storage, key);
        if (stored.kind === "absent") return;
        if (stored.kind === "corrupted") {
          await purgeUnknownState(storage, key);
          return;
        }

        const transaction: PendingDeleteTransaction = {
          schemaVersion: 1,
          operation: "delete",
          previous: descriptorFor(stored),
        };
        await writePendingTransaction(storage, key, transaction);
        await completeDeleteTransaction(storage, key, transaction);
      });
    },

    setItem(key, value) {
      const chunks = splitValue(value);
      if (chunks.length > MAX_SESSION_CHUNKS) {
        return Promise.reject(
          new Error("La session chiffrée dépasse la capacité locale."),
        );
      }

      return exclusively(key, async () => {
        let stored = await prepareStoredValue(storage, key);
        if (stored.kind === "corrupted") {
          await purgeUnknownState(storage, key);
          stored = { kind: "absent" };
        }

        const targetSlot: ChunkSlot =
          stored.kind === "manifest" &&
          stored.manifest.schemaVersion === 2 &&
          stored.manifest.slot === 0
            ? 1
            : 0;
        const target: ChunkManifestV2 = {
          schemaVersion: 2,
          slot: targetSlot,
          chunkCount: chunks.length,
          valueLength: value.length,
        };
        const transaction: PendingSetTransaction = {
          schemaVersion: 1,
          operation: "set",
          target,
          previous: descriptorFor(stored),
        };

        await writePendingTransaction(storage, key, transaction);
        for (const [index, chunk] of chunks.entries()) {
          await setAndConfirm(
            storage,
            chunkKey(key, targetSlot, index),
            chunk,
            "SecureStore n'a pas confirmé un fragment de session.",
          );
        }
        await setAndConfirm(
          storage,
          key,
          JSON.stringify(target),
          "SecureStore n'a pas confirmé le manifeste de session.",
        );
        if ((await readManifestValue(storage, key, target)) !== value) {
          await rollbackPendingTarget(storage, key, transaction);
          throw new Error(
            "SecureStore n'a pas confirmé la session fragmentée.",
          );
        }
        await cleanupCommittedDescriptor(storage, key, transaction.previous);
        await removeAndConfirm(storage, stagingKey(key));
      });
    },
  };
}
