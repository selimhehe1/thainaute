import {
  createSyncHttpClient,
  type AuthenticatedSyncSession,
  type AttemptOutboxSnapshot,
} from "@thainaute/sync";
import type { SQLiteDatabase } from "expo-sqlite";

import { MobileAttemptOutboxStore } from "./attempt-outbox-store";
import { assertNoPendingMobileAccountDeletion } from "./mobile-account-deletion";
import { readMobileApiOrigin } from "./mobile-connected-public-lesson";
import { mobileSha256Hex } from "./sha256";
import { getMobileSupabaseAuthClient } from "./supabase-auth";

export type MobileProgressSource = "local" | "server";

export interface MobileProgressReadResult {
  readonly snapshot: AttemptOutboxSnapshot;
  readonly source: MobileProgressSource;
}

function accountStore(
  database: SQLiteDatabase,
  userId: string,
): MobileAttemptOutboxStore {
  return new MobileAttemptOutboxStore(
    database,
    { kind: "account", userId },
    "learning",
    mobileSha256Hex,
  );
}

function sessionProvider(expectedUserId: string) {
  return async (): Promise<AuthenticatedSyncSession | null> => {
    await assertNoPendingMobileAccountDeletion(expectedUserId);
    const client = getMobileSupabaseAuthClient();
    if (client === null) return null;
    const current = await client.auth.getSession();
    const session = current.error === null ? current.data.session : null;
    if (
      session === null ||
      session.user.is_anonymous === true ||
      session.user.id.toLowerCase() !== expectedUserId.toLowerCase()
    ) {
      return null;
    }
    return {
      accessToken: session.access_token,
      userId: session.user.id.toLowerCase(),
    };
  };
}

export async function readMobileLocalProgress(input: {
  readonly database: SQLiteDatabase;
  readonly userId: string | null;
}): Promise<AttemptOutboxSnapshot> {
  const store =
    input.userId === null
      ? new MobileAttemptOutboxStore(input.database)
      : accountStore(input.database, input.userId);
  return store.read();
}

/**
 * Lit le snapshot personnel puis l'hydrate dans l'outbox compte. Le serveur
 * reste la source autoritaire ; les tentatives locales en attente restent
 * conservées par `applyProgressSnapshot` pour être envoyées séparément.
 */
export async function refreshMobileAccountProgress(input: {
  readonly database: SQLiteDatabase;
  readonly userId: string;
}): Promise<AttemptOutboxSnapshot> {
  const userId = input.userId.toLowerCase();
  const getSession = sessionProvider(userId);
  if ((await getSession()) === null) {
    throw new Error("La session a changé avant la lecture de progression.");
  }

  const client = createSyncHttpClient({
    baseUrl: readMobileApiOrigin(),
    allowInsecureHttp: process.env.NODE_ENV !== "production",
    expectedUserId: userId,
    getSession,
  });
  const response = await client.getProgressSnapshot();
  await assertNoPendingMobileAccountDeletion(userId);
  return accountStore(input.database, userId).applyProgressSnapshot(response);
}

/**
 * Rend une lecture locale immédiatement exploitable, puis tente une
 * hydratation distante pour les comptes connectés. Une panne réseau ne masque
 * jamais la dernière projection locale disponible.
 */
export async function readMobileProgress(input: {
  readonly database: SQLiteDatabase;
  readonly userId: string | null;
}): Promise<MobileProgressReadResult> {
  const local = await readMobileLocalProgress(input);
  if (input.userId === null) return { snapshot: local, source: "local" };

  try {
    await refreshMobileAccountProgress({
      database: input.database,
      userId: input.userId,
    });
    return {
      snapshot: await readMobileLocalProgress(input),
      source: "server",
    };
  } catch {
    return { snapshot: local, source: "local" };
  }
}
