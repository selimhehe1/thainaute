import {
  ACCOUNT_EXPORT_FILE_NAME,
  createSyncHttpClient,
  type AccountExportDocument,
  type AuthenticatedSyncSession,
} from "@thainaute/sync";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { AppState } from "react-native";

import { getMobileSupabaseAuthClient } from "./supabase-auth";

const ACCOUNT_EXPORT_TIMEOUT_MS = 25_000;

export type MobileAccountExportFailureCode =
  | "cache_cleanup_failed"
  | "cache_write_failed"
  | "session_changed"
  | "sharing_failed"
  | "sharing_unavailable";

export class MobileAccountExportError extends Error {
  public readonly code: MobileAccountExportFailureCode;

  public constructor(code: MobileAccountExportFailureCode) {
    super("L’export du compte n’a pas pu être remis sur cet appareil.");
    this.name = "MobileAccountExportError";
    this.code = code;
  }
}

function accountExportFile(): File {
  return new File(Paths.cache, ACCOUNT_EXPORT_FILE_NAME);
}

function assertActive(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new MobileAccountExportError("session_changed");
  }
}

async function waitForApplicationToBecomeActive(
  signal: AbortSignal,
): Promise<void> {
  assertActive(signal);
  if (AppState.currentState === "active") return;

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      subscription.remove();
      signal.removeEventListener("abort", handleAbort);
      if (error === undefined) resolve();
      else reject(error);
    };
    const handleAbort = () =>
      finish(new MobileAccountExportError("session_changed"));
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") finish();
    });
    signal.addEventListener("abort", handleAbort, { once: true });

    // L’état peut avoir changé entre le premier contrôle et l’abonnement.
    if (AppState.currentState === "active") finish();
    else if (signal.aborted) handleAbort();
  });
}

function readMobileApiOrigin(): string {
  const value = process.env.EXPO_PUBLIC_API_URL;
  if (value === undefined) {
    throw new Error("L’API d’export mobile n’est pas configurée.");
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
    throw new Error("L’API d’export mobile est mal configurée.");
  }
}

function authenticatedSessionProvider(expectedUserId: string) {
  return async (): Promise<AuthenticatedSyncSession | null> => {
    const client = getMobileSupabaseAuthClient();
    if (client === null) return null;
    const { data, error } = await client.auth.getSession();
    const session = data.session;
    if (
      error !== null ||
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

/**
 * Supprime uniquement le fichier temporaire au nom fixe de l’export compte.
 * Une suppression refusée bloque toute nouvelle remise de fichier.
 */
export function purgeMobileAccountExportCache(): void {
  const file = accountExportFile();
  if (!file.exists) return;

  try {
    file.delete();
  } catch {
    if (file.exists) {
      throw new MobileAccountExportError("cache_cleanup_failed");
    }
  }
  if (file.exists) {
    throw new MobileAccountExportError("cache_cleanup_failed");
  }
}

/** Vérifie la capacité de remise avant de demander des données personnelles. */
export async function prepareMobileAccountExportDelivery(): Promise<void> {
  purgeMobileAccountExportCache();
  let available = false;
  try {
    available = await Sharing.isAvailableAsync();
  } catch {
    // Même message sûr pour une API absente et une panne native du partage.
  }
  if (!available) {
    throw new MobileAccountExportError("sharing_unavailable");
  }
}

/**
 * Lit l’export via le contrat partagé. `getAccountExport` relit la session après
 * la réponse et refuse aussi un document dont le sujet diffère du compte prévu.
 */
export async function requestMobileAccountExport(input: {
  readonly expectedUserId: string;
  readonly signal: AbortSignal;
}): Promise<AccountExportDocument> {
  assertActive(input.signal);
  const getSession = authenticatedSessionProvider(input.expectedUserId);
  const client = createSyncHttpClient({
    baseUrl: readMobileApiOrigin(),
    allowInsecureHttp: process.env.NODE_ENV !== "production",
    expectedUserId: input.expectedUserId,
    getSession,
    timeoutMs: ACCOUNT_EXPORT_TIMEOUT_MS,
  });
  return client.getAccountExport(input.signal);
}

/**
 * Écrit une copie éphémère dans le cache privé, ouvre la feuille système puis
 * purge le chemin exact dans tous les cas. Le document ne quitte jamais cette
 * portée sous forme d’état React ou de journal.
 */
export async function shareMobileAccountExport(input: {
  readonly document: AccountExportDocument;
  readonly signal: AbortSignal;
}): Promise<void> {
  assertActive(input.signal);
  purgeMobileAccountExportCache();

  let available = false;
  try {
    available = await Sharing.isAvailableAsync();
  } catch {
    // Le code fermé ci-dessous évite d’exposer l’erreur native brute.
  }
  if (!available) {
    throw new MobileAccountExportError("sharing_unavailable");
  }
  assertActive(input.signal);

  const file = accountExportFile();
  let operationError: unknown;
  try {
    try {
      file.create({ overwrite: true });
      file.write(`${JSON.stringify(input.document)}\n`);
    } catch {
      throw new MobileAccountExportError("cache_write_failed");
    }
    if (!file.exists || file.size <= 0) {
      throw new MobileAccountExportError("cache_write_failed");
    }

    assertActive(input.signal);
    try {
      await Sharing.shareAsync(file.uri, {
        dialogTitle: "Exporter mes données Thaïnaute",
        mimeType: "application/json",
        UTI: "public.json",
      });
    } catch {
      throw new MobileAccountExportError("sharing_failed");
    }
    // Android peut résoudre `shareAsync` avant que l’application destinataire
    // ait fini de lire le fichier. Attendre le retour au premier plan évite de
    // supprimer la source trop tôt ; une frontière de session interrompt cette
    // attente et conserve la purge immédiate prioritaire.
    await waitForApplicationToBecomeActive(input.signal);
    assertActive(input.signal);
  } catch (error) {
    operationError = error;
  }

  // Une panne de purge prime sur l’erreur fonctionnelle : elle laisse une copie
  // personnelle dans le cache et doit donc rester visible et bloquante.
  purgeMobileAccountExportCache();
  if (operationError !== undefined) throw operationError;
}
