"use client";

import {
  ACCOUNT_DELETION_RECEIPT_FORMAT,
  accountDeletionContinuationSecretSchema,
  accountDeletionReceiptSchema,
  createSyncHttpClient,
  idempotencyKeySchema,
  type AccountDeletionReceipt,
  type AuthenticatedSyncSession,
} from "@thainaute/sync";
import { z } from "zod";

import { WebAttemptOutboxStore } from "./attempt-outbox-store";
import { browserSha256Hex } from "./sha256";
import { getWebSupabaseAuthClient } from "./supabase-auth";

export const WEB_ACCOUNT_DELETION_OPERATION_FORMAT =
  "thainaute.web-account-deletion-operation/v1" as const;
export const WEB_ACCOUNT_DELETION_STORAGE_KEY =
  "thainaute.account-deletion.pending.v1";
const WEB_ACCOUNT_DELETION_TIMEOUT_MS = 40_000;
const WEB_ACCOUNT_DELETION_LOCK_NAME =
  "thainaute.account-deletion.pending.v1.lock";

const canonicalUuidSchema = z.uuid().transform((uuid) => uuid.toLowerCase());

export const pendingWebAccountDeletionSchema = z.strictObject({
  format: z.literal(WEB_ACCOUNT_DELETION_OPERATION_FORMAT),
  expectedUserId: canonicalUuidSchema,
  idempotencyKey: idempotencyKeySchema,
  continuationSecret: accountDeletionContinuationSecretSchema,
});

export type PendingWebAccountDeletion = z.infer<
  typeof pendingWebAccountDeletionSchema
>;

interface WebAccountDeletionStorage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

interface WebAccountDeletionCrypto {
  getRandomValues<T extends ArrayBufferView | null>(array: T): T;
  randomUUID(): `${string}-${string}-${string}-${string}-${string}`;
}

interface WebAccountDeletionLockManager {
  request<T>(
    name: string,
    options: Readonly<{ mode: "exclusive" }>,
    callback: () => Promise<T>,
  ): Promise<T>;
}

export interface WebAccountDeletionExecutionDependencies {
  readonly deleteAccount?: (
    operation: PendingWebAccountDeletion,
    signal?: AbortSignal,
  ) => Promise<AccountDeletionReceipt>;
  readonly purgeOwnerData?: (expectedUserId: string) => Promise<void>;
  readonly isOwnerDataTombstoned?: (expectedUserId: string) => Promise<boolean>;
  readonly storage?: WebAccountDeletionStorage;
}

export class WebAccountDeletionLocalStateError extends Error {
  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "WebAccountDeletionLocalStateError";
  }
}

export class WebAccountDeletionCorruptStateError extends WebAccountDeletionLocalStateError {
  public constructor(options?: ErrorOptions) {
    super(
      "La reprise de suppression locale est illisible et a été conservée.",
      options,
    );
    this.name = "WebAccountDeletionCorruptStateError";
  }
}

export class WebAccountDeletionSubjectConflictError extends Error {
  public constructor() {
    super("Une suppression d'un autre compte attend d'\u00eatre reprise.");
    this.name = "WebAccountDeletionSubjectConflictError";
  }
}

export class WebAccountDeletionInProgressError extends Error {
  public constructor() {
    super("Ce compte est en cours de suppression.");
    this.name = "WebAccountDeletionInProgressError";
  }
}

export class WebAccountDeletionTombstonedError extends WebAccountDeletionLocalStateError {
  public constructor() {
    super(
      "Ce compte a d\u00e9j\u00e0 \u00e9t\u00e9 supprim\u00e9 sur cet appareil.",
    );
    this.name = "WebAccountDeletionTombstonedError";
  }
}

function browserStorage(): WebAccountDeletionStorage {
  if (typeof globalThis.localStorage === "undefined") {
    throw new WebAccountDeletionLocalStateError(
      "Le stockage de reprise n'est pas disponible.",
    );
  }
  return globalThis.localStorage;
}

function browserCrypto(): WebAccountDeletionCrypto {
  if (
    typeof globalThis.crypto?.getRandomValues !== "function" ||
    typeof globalThis.crypto.randomUUID !== "function"
  ) {
    throw new WebAccountDeletionLocalStateError(
      "Le g\u00e9n\u00e9rateur cryptographique du navigateur est indisponible.",
    );
  }
  return globalThis.crypto;
}

function browserLockManager(): WebAccountDeletionLockManager {
  const lockManager = globalThis.navigator?.locks;
  if (lockManager === undefined) {
    throw new WebAccountDeletionLocalStateError(
      "La protection multi-onglets n'est pas disponible dans ce navigateur.",
    );
  }
  return {
    request: (name, options, callback) =>
      lockManager.request(name, options, () => callback()),
  };
}

function encodeBase64Url(bytes: Uint8Array): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let result = "";
  for (let offset = 0; offset < bytes.length; offset += 3) {
    const first = bytes[offset];
    if (first === undefined) break;
    const second = bytes[offset + 1];
    const third = bytes[offset + 2];
    result += alphabet[first >> 2];
    result += alphabet[((first & 0x03) << 4) | ((second ?? 0) >> 4)];
    if (second !== undefined) {
      result += alphabet[((second & 0x0f) << 2) | ((third ?? 0) >> 6)];
    }
    if (third !== undefined) result += alphabet[third & 0x3f];
  }
  return result;
}

function serializeOperation(operation: PendingWebAccountDeletion): string {
  return JSON.stringify(operation);
}

function operationsAreEqual(
  left: PendingWebAccountDeletion,
  right: PendingWebAccountDeletion,
): boolean {
  return serializeOperation(left) === serializeOperation(right);
}

export function readPendingWebAccountDeletion(
  storage: WebAccountDeletionStorage = browserStorage(),
): PendingWebAccountDeletion | null {
  let raw: string | null;
  try {
    raw = storage.getItem(WEB_ACCOUNT_DELETION_STORAGE_KEY);
  } catch (error) {
    throw new WebAccountDeletionLocalStateError(
      "La reprise de suppression est temporairement inaccessible.",
      { cause: error },
    );
  }
  if (raw === null) return null;

  try {
    return pendingWebAccountDeletionSchema.parse(JSON.parse(raw) as unknown);
  } catch (error) {
    throw new WebAccountDeletionCorruptStateError({ cause: error });
  }
}

export async function createPendingWebAccountDeletion(
  expectedUserIdInput: string,
  options: Readonly<{
    crypto?: WebAccountDeletionCrypto;
    isOwnerDataTombstoned?: (expectedUserId: string) => Promise<boolean>;
    lockManager?: WebAccountDeletionLockManager;
    onCreated?: () => void;
    storage?: WebAccountDeletionStorage;
  }> = {},
): Promise<PendingWebAccountDeletion> {
  const expectedUserId = canonicalUuidSchema.safeParse(expectedUserIdInput);
  if (!expectedUserId.success) {
    throw new WebAccountDeletionLocalStateError(
      "L'identit\u00e9 du compte \u00e0 supprimer est invalide.",
    );
  }

  const storage = options.storage ?? browserStorage();
  const lockManager = options.lockManager ?? browserLockManager();
  const isOwnerDataTombstoned =
    options.isOwnerDataTombstoned ??
    (options.storage === undefined
      ? isDeletedWebAccountTombstoned
      : async () => false);

  try {
    return await lockManager.request(
      WEB_ACCOUNT_DELETION_LOCK_NAME,
      { mode: "exclusive" },
      async () => {
        const existing = readPendingWebAccountDeletion(storage);
        if (existing !== null) {
          if (existing.expectedUserId !== expectedUserId.data) {
            throw new WebAccountDeletionSubjectConflictError();
          }
          return existing;
        }
        if (await isOwnerDataTombstoned(expectedUserId.data)) {
          throw new WebAccountDeletionTombstonedError();
        }

        const crypto = options.crypto ?? browserCrypto();
        const continuationBytes = crypto.getRandomValues(new Uint8Array(32));
        const operation = pendingWebAccountDeletionSchema.parse({
          format: WEB_ACCOUNT_DELETION_OPERATION_FORMAT,
          expectedUserId: expectedUserId.data,
          idempotencyKey: crypto.randomUUID(),
          continuationSecret: encodeBase64Url(continuationBytes),
        });

        storage.setItem(
          WEB_ACCOUNT_DELETION_STORAGE_KEY,
          serializeOperation(operation),
        );
        const persisted = readPendingWebAccountDeletion(storage);
        if (persisted === null || !operationsAreEqual(persisted, operation)) {
          throw new Error("L'op\u00e9ration relue ne correspond pas.");
        }
        try {
          options.onCreated?.();
        } catch {
          // Une mesure non essentielle ne bloque jamais la commande durable.
        }
        return persisted;
      },
    );
  } catch (error) {
    if (
      error instanceof WebAccountDeletionLocalStateError ||
      error instanceof WebAccountDeletionSubjectConflictError
    ) {
      throw error;
    }
    throw new WebAccountDeletionLocalStateError(
      "La reprise de suppression n'a pas pu \u00eatre enregistr\u00e9e.",
      { cause: error },
    );
  }
}

/**
 * Barriere synchrone pour les autres ecritures locales du compte. Une
 * operation illisible ferme aussi la mutation : elle ne doit jamais etre
 * ecrasee par une synchronisation concurrente.
 */
export function assertNoPendingWebAccountDeletion(
  expectedUserIdInput: string,
  storage: WebAccountDeletionStorage = browserStorage(),
): void {
  const expectedUserId = canonicalUuidSchema.parse(expectedUserIdInput);
  const pending = readPendingWebAccountDeletion(storage);
  if (pending?.expectedUserId === expectedUserId) {
    throw new WebAccountDeletionInProgressError();
  }
}

/**
 * Sérialise une mutation locale avec la création de la reprise de
 * suppression. Avec Web Locks, deux onglets obtiennent un ordre total. Sans
 * cette API, la suppression ne peut pas être créée par ce client et les deux
 * lectures ferment tout de même une reprise déjà persistée.
 */
export async function withNoPendingWebAccountDeletion<T>(
  expectedUserId: string,
  operation: () => Promise<T>,
): Promise<T> {
  const execute = async (): Promise<T> => {
    assertNoPendingWebAccountDeletion(expectedUserId);
    const result = await operation();
    assertNoPendingWebAccountDeletion(expectedUserId);
    return result;
  };

  let lockManager: WebAccountDeletionLockManager | null = null;
  try {
    lockManager = browserLockManager();
  } catch (error) {
    if (!(error instanceof WebAccountDeletionLocalStateError)) throw error;
  }
  return lockManager === null
    ? execute()
    : lockManager.request(
        WEB_ACCOUNT_DELETION_LOCK_NAME,
        { mode: "exclusive" },
        execute,
      );
}

async function currentDeletionSession(
  expectedUserId: string,
): Promise<AuthenticatedSyncSession | null> {
  const client = getWebSupabaseAuthClient();
  if (client === null) return null;
  try {
    const { data, error } = await client.auth.getSession();
    const session = data.session;
    if (
      error !== null ||
      session === null ||
      session.user.is_anonymous === true ||
      session.user.id.toLowerCase() !== expectedUserId
    ) {
      return null;
    }
    return {
      accessToken: session.access_token,
      userId: session.user.id.toLowerCase(),
    };
  } catch {
    return null;
  }
}

async function requestAccountDeletion(
  operation: PendingWebAccountDeletion,
  signal?: AbortSignal,
): Promise<AccountDeletionReceipt> {
  const client = createSyncHttpClient({
    baseUrl: "",
    expectedUserId: operation.expectedUserId,
    getSession: () => currentDeletionSession(operation.expectedUserId),
    timeoutMs: WEB_ACCOUNT_DELETION_TIMEOUT_MS,
  });
  return client.deleteAccount(
    {
      idempotencyKey: operation.idempotencyKey,
      continuationSecret: operation.continuationSecret,
    },
    signal,
  );
}

async function purgeAccountOwnerData(expectedUserId: string): Promise<void> {
  const store = new WebAttemptOutboxStore(
    "thainaute-learning-v1",
    { kind: "account", userId: expectedUserId },
    browserSha256Hex,
  );
  try {
    await store.tombstoneAndPurgeAccountData();
  } finally {
    store.close();
  }
}

export async function isDeletedWebAccountTombstoned(
  expectedUserId: string,
): Promise<boolean> {
  const store = new WebAttemptOutboxStore(
    "thainaute-learning-v1",
    { kind: "account", userId: expectedUserId },
    browserSha256Hex,
  );
  try {
    return await store.isAccountTombstoned();
  } finally {
    store.close();
  }
}

async function removeCompletedOperation(
  operation: PendingWebAccountDeletion,
  storage: WebAccountDeletionStorage,
  isOwnerDataTombstoned: (expectedUserId: string) => Promise<boolean>,
): Promise<void> {
  const persisted = readPendingWebAccountDeletion(storage);
  if (persisted === null) {
    if (await isOwnerDataTombstoned(operation.expectedUserId)) return;
    throw new WebAccountDeletionLocalStateError(
      "La reprise locale a disparu avant la purge confirm\u00e9e.",
    );
  }
  if (!operationsAreEqual(persisted, operation)) {
    throw new WebAccountDeletionLocalStateError(
      "La reprise locale a chang\u00e9 pendant la suppression et a \u00e9t\u00e9 conserv\u00e9e.",
    );
  }
  try {
    storage.removeItem(WEB_ACCOUNT_DELETION_STORAGE_KEY);
  } catch (error) {
    throw new WebAccountDeletionLocalStateError(
      "La reprise termin\u00e9e n'a pas pu \u00eatre effac\u00e9e localement.",
      { cause: error },
    );
  }
}

/**
 * Rejoue exactement la meme commande, puis force la purge du seul namespace
 * compte. L'operation et son secret restent persistes tant que la purge et le
 * nettoyage sur de la session locale n'ont pas tous deux abouti.
 */
export async function completePendingWebAccountDeletion(input: {
  readonly operation: PendingWebAccountDeletion;
  readonly clearDeletedSession: (expectedUserId: string) => Promise<void>;
  readonly signal?: AbortSignal;
  readonly dependencies?: WebAccountDeletionExecutionDependencies;
}): Promise<AccountDeletionReceipt> {
  const operation = pendingWebAccountDeletionSchema.parse(input.operation);
  const storage = input.dependencies?.storage ?? browserStorage();
  const isOwnerDataTombstoned =
    input.dependencies?.isOwnerDataTombstoned ?? isDeletedWebAccountTombstoned;
  const persisted = readPendingWebAccountDeletion(storage);
  if (persisted === null) {
    if (await isOwnerDataTombstoned(operation.expectedUserId)) {
      throw new WebAccountDeletionTombstonedError();
    }
    throw new WebAccountDeletionLocalStateError(
      "La commande de suppression n'est plus pr\u00e9sente localement.",
    );
  }
  if (!operationsAreEqual(persisted, operation)) {
    throw new WebAccountDeletionLocalStateError(
      "La commande de suppression n'est plus l'op\u00e9ration locale attendue.",
    );
  }

  const receipt = accountDeletionReceiptSchema.parse(
    await (input.dependencies?.deleteAccount ?? requestAccountDeletion)(
      operation,
      input.signal,
    ),
  );
  if (receipt.format !== ACCOUNT_DELETION_RECEIPT_FORMAT) {
    throw new WebAccountDeletionLocalStateError(
      "Le re\u00e7u de suppression est incompatible.",
    );
  }

  try {
    await (input.dependencies?.purgeOwnerData ?? purgeAccountOwnerData)(
      operation.expectedUserId,
    );
  } catch (error) {
    throw new WebAccountDeletionLocalStateError(
      "La purge locale du compte n'a pas pu aboutir.",
      { cause: error },
    );
  }
  try {
    await input.clearDeletedSession(operation.expectedUserId);
  } catch (error) {
    throw new WebAccountDeletionLocalStateError(
      "La session locale du compte supprime n'a pas pu etre effacee.",
      { cause: error },
    );
  }
  await removeCompletedOperation(operation, storage, isOwnerDataTombstoned);
  return receipt;
}
