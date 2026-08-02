import {
  ACCOUNT_DELETION_CONTINUATION_SECRET_BYTES,
  accountDeletionHeadersSchema,
  accountDeletionReceiptSchema,
  createSyncHttpClient,
  idempotencyKeySchema,
  type AccountDeletionHeaders,
  type AccountDeletionReceipt,
  type AuthenticatedSyncSession,
} from "@thainaute/sync";
import { getRandomBytesAsync, randomUUID } from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import type { SQLiteDatabase } from "expo-sqlite";

import { forcePurgeDeletedMobileAccountData } from "./account-sync";
import { purgeMobileAccountExportCache } from "./mobile-account-export";
import { getMobileSupabaseAuthClient } from "./supabase-auth";

const MOBILE_ACCOUNT_DELETION_OPERATION_FORMAT =
  "thainaute.mobile-account-deletion-operation/v1" as const;
const MOBILE_ACCOUNT_DELETION_OPERATION_KEY =
  "thainaute.mobile-account-deletion-operation.v1";
const ACCOUNT_DELETION_TIMEOUT_MS = 40_000;
const BASE64URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

let mobileAccountDeletionBarrier: Promise<void> = Promise.resolve();

function serializeMobileAccountDeletionState<T>(
  operation: () => Promise<T>,
): Promise<T> {
  const result = mobileAccountDeletionBarrier.then(operation, operation);
  mobileAccountDeletionBarrier = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

type MobileAccountDeletionOperationBase = {
  readonly format: typeof MOBILE_ACCOUNT_DELETION_OPERATION_FORMAT;
  readonly expectedUserId: string;
  readonly idempotencyKey: string;
  readonly continuationSecret: string;
};

export type MobileAccountDeletionOperation =
  | (MobileAccountDeletionOperationBase & {
      readonly status: "awaiting_server_receipt";
    })
  | (MobileAccountDeletionOperationBase & {
      readonly status: "server_deleted";
      readonly receipt: AccountDeletionReceipt;
    });

export type MobileAccountDeletionResumeResult =
  | { readonly status: "idle" }
  | {
      readonly status: "completed";
      readonly expectedUserId: string;
      readonly receipt: AccountDeletionReceipt;
    };

export type MobileAccountDeletionFailureCode =
  | "api_unconfigured"
  | "deletion_in_progress"
  | "operation_corrupt"
  | "pending_subject_changed"
  | "secure_random_unavailable"
  | "operation_storage_unavailable";

export class MobileAccountDeletionError extends Error {
  public readonly code: MobileAccountDeletionFailureCode;

  public constructor(code: MobileAccountDeletionFailureCode) {
    super("La suppression du compte ne peut pas être reprise en sécurité.");
    this.name = "MobileAccountDeletionError";
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const keys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  return (
    keys.length === expectedKeys.length &&
    keys.every((key, index) => key === sortedExpectedKeys[index])
  );
}

/**
 * La forme persistée est fermée et versionnée. Une valeur partielle ou future
 * reste intacte dans le trousseau afin de ne jamais perdre un secret de reprise.
 */
export function parseMobileAccountDeletionOperation(
  value: unknown,
): MobileAccountDeletionOperation {
  if (!isRecord(value)) {
    throw new MobileAccountDeletionError("operation_corrupt");
  }

  const serverDeleted = value.status === "server_deleted";
  const expectedKeys = serverDeleted
    ? [
        "continuationSecret",
        "expectedUserId",
        "format",
        "idempotencyKey",
        "receipt",
        "status",
      ]
    : [
        "continuationSecret",
        "expectedUserId",
        "format",
        "idempotencyKey",
        "status",
      ];
  if (
    !hasExactKeys(value, expectedKeys) ||
    value.format !== MOBILE_ACCOUNT_DELETION_OPERATION_FORMAT ||
    (value.status !== "awaiting_server_receipt" && !serverDeleted)
  ) {
    throw new MobileAccountDeletionError("operation_corrupt");
  }

  const userId = idempotencyKeySchema.safeParse(value.expectedUserId);
  const headers = accountDeletionHeadersSchema.safeParse({
    idempotencyKey: value.idempotencyKey,
    continuationSecret: value.continuationSecret,
  });
  if (
    !userId.success ||
    !headers.success ||
    userId.data !== value.expectedUserId ||
    headers.data.idempotencyKey !== value.idempotencyKey ||
    headers.data.continuationSecret !== value.continuationSecret
  ) {
    throw new MobileAccountDeletionError("operation_corrupt");
  }

  const base: MobileAccountDeletionOperationBase = {
    format: MOBILE_ACCOUNT_DELETION_OPERATION_FORMAT,
    expectedUserId: userId.data,
    idempotencyKey: headers.data.idempotencyKey,
    continuationSecret: headers.data.continuationSecret,
  };
  if (!serverDeleted) {
    return { ...base, status: "awaiting_server_receipt" };
  }

  const receipt = accountDeletionReceiptSchema.safeParse(value.receipt);
  if (!receipt.success) {
    throw new MobileAccountDeletionError("operation_corrupt");
  }
  return { ...base, status: "server_deleted", receipt: receipt.data };
}

function encodeBase64Url(bytes: Uint8Array): string {
  let encoded = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    if (first === undefined) break;
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    const bits = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);
    encoded += BASE64URL_ALPHABET[(bits >>> 18) & 63];
    encoded += BASE64URL_ALPHABET[(bits >>> 12) & 63];
    if (second !== undefined) {
      encoded += BASE64URL_ALPHABET[(bits >>> 6) & 63];
    }
    if (third !== undefined) encoded += BASE64URL_ALPHABET[bits & 63];
  }
  return encoded;
}

async function persistOperation(
  operation: MobileAccountDeletionOperation,
): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      MOBILE_ACCOUNT_DELETION_OPERATION_KEY,
      JSON.stringify(operation),
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    );
  } catch {
    throw new MobileAccountDeletionError("operation_storage_unavailable");
  }
}

export async function readMobileAccountDeletionOperation(): Promise<MobileAccountDeletionOperation | null> {
  let stored: string | null;
  try {
    stored = await SecureStore.getItemAsync(
      MOBILE_ACCOUNT_DELETION_OPERATION_KEY,
    );
  } catch {
    throw new MobileAccountDeletionError("operation_storage_unavailable");
  }
  if (stored === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored) as unknown;
  } catch {
    throw new MobileAccountDeletionError("operation_corrupt");
  }
  return parseMobileAccountDeletionOperation(parsed);
}

/** Ferme toute nouvelle mutation du même compte tant que sa reprise existe. */
export async function assertNoPendingMobileAccountDeletion(
  expectedUserIdInput: string,
): Promise<void> {
  const expectedUserId = idempotencyKeySchema.safeParse(expectedUserIdInput);
  if (!expectedUserId.success) {
    throw new MobileAccountDeletionError("operation_corrupt");
  }
  const pending = await readMobileAccountDeletionOperation();
  if (pending?.expectedUserId === expectedUserId.data) {
    throw new MobileAccountDeletionError("deletion_in_progress");
  }
}

/** Ordonne les mutations du compte avec la persistance SecureStore de sa suppression. */
export function withNoPendingMobileAccountDeletion<T>(
  expectedUserId: string,
  operation: () => Promise<T>,
): Promise<T> {
  return serializeMobileAccountDeletionState(async () => {
    await assertNoPendingMobileAccountDeletion(expectedUserId);
    const result = await operation();
    await assertNoPendingMobileAccountDeletion(expectedUserId);
    return result;
  });
}

async function clearMobileAccountDeletionOperation(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(MOBILE_ACCOUNT_DELETION_OPERATION_KEY);
  } catch {
    throw new MobileAccountDeletionError("operation_storage_unavailable");
  }
}

/** Crée et persiste les deux secrets avant le premier appel destructif. */
export async function createMobileAccountDeletionOperation(
  expectedUserIdInput: string,
  options: Readonly<{ onCreated?: () => void }> = {},
): Promise<MobileAccountDeletionOperation> {
  return serializeMobileAccountDeletionState(async () => {
    const expectedUserId = idempotencyKeySchema.safeParse(expectedUserIdInput);
    if (!expectedUserId.success) {
      throw new MobileAccountDeletionError("operation_corrupt");
    }

    const existing = await readMobileAccountDeletionOperation();
    if (existing !== null) {
      if (existing.expectedUserId !== expectedUserId.data) {
        throw new MobileAccountDeletionError("pending_subject_changed");
      }
      return existing;
    }

    let headers: AccountDeletionHeaders;
    try {
      const continuationBytes = await getRandomBytesAsync(
        ACCOUNT_DELETION_CONTINUATION_SECRET_BYTES,
      );
      headers = accountDeletionHeadersSchema.parse({
        idempotencyKey: randomUUID(),
        continuationSecret: encodeBase64Url(continuationBytes),
      });
    } catch {
      throw new MobileAccountDeletionError("secure_random_unavailable");
    }
    const operation: MobileAccountDeletionOperation = {
      format: MOBILE_ACCOUNT_DELETION_OPERATION_FORMAT,
      status: "awaiting_server_receipt",
      expectedUserId: expectedUserId.data,
      idempotencyKey: headers.idempotencyKey,
      continuationSecret: headers.continuationSecret,
    };
    await persistOperation(operation);
    try {
      options.onCreated?.();
    } catch {
      // Une mesure non essentielle ne bloque jamais la commande durable.
    }
    return operation;
  });
}

function readMobileApiOrigin(): string {
  const value = process.env.EXPO_PUBLIC_API_URL;
  if (value === undefined) {
    throw new MobileAccountDeletionError("api_unconfigured");
  }
  try {
    const url = new URL(value);
    const developmentHttp =
      process.env.NODE_ENV !== "production" && url.protocol === "http:";
    if (
      (url.protocol !== "https:" && !developmentHttp) ||
      url.username !== "" ||
      url.password !== "" ||
      url.pathname !== "/" ||
      url.search !== "" ||
      url.hash !== ""
    ) {
      throw new Error("invalid");
    }
    return url.origin;
  } catch {
    throw new MobileAccountDeletionError("api_unconfigured");
  }
}

function authenticatedSessionProvider(expectedUserId: string) {
  return async (): Promise<AuthenticatedSyncSession | null> => {
    const client = getMobileSupabaseAuthClient();
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
        userId: expectedUserId,
      };
    } catch {
      return null;
    }
  };
}

async function requestServerReceipt(
  operation: MobileAccountDeletionOperationBase,
  signal?: AbortSignal,
): Promise<AccountDeletionReceipt> {
  const client = createSyncHttpClient({
    baseUrl: readMobileApiOrigin(),
    allowInsecureHttp: process.env.NODE_ENV !== "production",
    expectedUserId: operation.expectedUserId,
    getSession: authenticatedSessionProvider(operation.expectedUserId),
    timeoutMs: ACCOUNT_DELETION_TIMEOUT_MS,
  });
  const headers: AccountDeletionHeaders = {
    idempotencyKey: operation.idempotencyKey,
    continuationSecret: operation.continuationSecret,
  };
  return client.deleteAccount(headers, signal);
}

let activeResume: Promise<MobileAccountDeletionResumeResult> | null = null;

/**
 * Rejoue l'opération exacte, y compris sans session après une réponse perdue.
 * Le secret persiste jusqu'à ce que SQLite, le cache d'export et la session du
 * même sujet aient tous été purgés. Une session d'un autre compte est intacte.
 */
export function resumeMobileAccountDeletion(input: {
  readonly database: SQLiteDatabase;
  readonly clearDeletedSession: (expectedUserId: string) => Promise<void>;
  readonly signal?: AbortSignal;
}): Promise<MobileAccountDeletionResumeResult> {
  if (activeResume !== null) return activeResume;

  const run = async (): Promise<MobileAccountDeletionResumeResult> => {
    let operation = await readMobileAccountDeletionOperation();
    if (operation === null) return { status: "idle" };

    if (operation.status === "awaiting_server_receipt") {
      const receipt = await requestServerReceipt(operation, input.signal);
      operation = {
        ...operation,
        status: "server_deleted",
        receipt,
      };
      await persistOperation(operation);
    }

    await forcePurgeDeletedMobileAccountData(
      input.database,
      operation.expectedUserId,
    );
    purgeMobileAccountExportCache();
    await input.clearDeletedSession(operation.expectedUserId);
    await clearMobileAccountDeletionOperation();

    return {
      status: "completed",
      expectedUserId: operation.expectedUserId,
      receipt: operation.receipt,
    };
  };

  activeResume = run().finally(() => {
    activeResume = null;
  });
  return activeResume;
}
