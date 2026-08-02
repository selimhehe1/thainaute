import {
  createSyncHttpClient,
  type AuthenticatedSyncSession,
  type LessonProgressResponse,
} from "@thainaute/sync";

import { getMobileSupabaseAuthClient } from "./supabase-auth";
import { assertNoPendingMobileAccountDeletion } from "./mobile-account-deletion";
import { readMobileApiOrigin } from "./mobile-connected-public-lesson";

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

export async function readMobileLessonProgress(input: {
  readonly userId: string;
  readonly versionId: string;
}): Promise<LessonProgressResponse> {
  const getSession = sessionProvider(input.userId);
  if ((await getSession()) === null) {
    throw new Error("La session a changé avant la lecture de progression.");
  }
  const client = createSyncHttpClient({
    baseUrl: readMobileApiOrigin(),
    allowInsecureHttp: process.env.NODE_ENV !== "production",
    expectedUserId: input.userId,
    getSession,
  });
  const response = await client.getLessonProgress(input.versionId);
  await assertNoPendingMobileAccountDeletion(input.userId);
  return response;
}
