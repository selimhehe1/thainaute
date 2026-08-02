"use client";

import {
  createSyncHttpClient,
  type AccountExportDocument,
  type AuthenticatedSyncSession,
} from "@thainaute/sync";

import { getWebSupabaseAuthClient } from "./supabase-auth";

const EXPORT_FILE_PREFIX = "thainaute-donnees-compte";

function authenticatedSessionProvider(expectedUserId: string) {
  const canonicalExpectedUserId = expectedUserId.toLowerCase();
  return async (): Promise<AuthenticatedSyncSession | null> => {
    const client = getWebSupabaseAuthClient();
    if (client === null) return null;

    // Le serveur authentifie à nouveau le Bearer. Cette lecture navigateur sert
    // uniquement à l'acheminer et à fermer une bascule de sujet côté client.
    const { data, error } = await client.auth.getSession();
    const session = data.session;
    if (
      error !== null ||
      session === null ||
      session.user.is_anonymous === true ||
      session.user.id.toLowerCase() !== canonicalExpectedUserId
    ) {
      return null;
    }
    return {
      accessToken: session.access_token,
      userId: session.user.id.toLowerCase(),
    };
  };
}

export async function requestWebAccountExport(input: {
  readonly expectedUserId: string;
  readonly signal: AbortSignal;
}): Promise<AccountExportDocument> {
  const client = createSyncHttpClient({
    baseUrl: "",
    expectedUserId: input.expectedUserId,
    getSession: authenticatedSessionProvider(input.expectedUserId),
  });
  return client.getAccountExport(input.signal);
}

export function webAccountExportFileName(exportedAt: string): string {
  const date = exportedAt.slice(0, 10);
  return `${EXPORT_FILE_PREFIX}-${date}.json`;
}

/** Déclenche le téléchargement sans conserver le document au-delà de l'appel. */
export function deliverWebAccountExport(
  exportDocument: AccountExportDocument,
): void {
  const json = `${JSON.stringify(exportDocument, null, 2)}\n`;
  const blob = new Blob([json], {
    type: "application/json;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = webAccountExportFileName(exportDocument.exportedAt);
  link.href = objectUrl;
  link.hidden = true;

  try {
    document.body.append(link);
    link.click();
  } finally {
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }
}
