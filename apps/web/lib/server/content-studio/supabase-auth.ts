import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import {
  SupabaseAuthenticationError,
  verifySupabasePermanentUser,
  type SupabaseUserAuthClient,
} from "../supabase-auth/verified-user";
import { ContentStudioError } from "./errors";
import type { ContentStudioAuthorizer } from "./ports";
import { createContentStudioSupabaseFetch } from "./supabase-fetch";

const CONTENT_EDITOR_ROLE = "content_editor";
const liveUserAuthorizationSchema = z
  .object({ app_metadata: z.unknown().optional() })
  .passthrough();
const appMetadataSchema = z
  .object({ roles: z.unknown().optional() })
  .passthrough();
const rolesSchema = z.array(z.string().min(1).max(64)).max(64);

function hasLiveContentEditorRole(user: unknown): boolean {
  const parsedUser = liveUserAuthorizationSchema.safeParse(user);
  if (!parsedUser.success) return false;

  const parsedMetadata = appMetadataSchema.safeParse(
    parsedUser.data.app_metadata,
  );
  if (!parsedMetadata.success) return false;

  const parsedRoles = rolesSchema.safeParse(parsedMetadata.data.roles);
  return (
    parsedRoles.success &&
    parsedRoles.data.some((role) => role === CONTENT_EDITOR_ROLE)
  );
}

/**
 * Relit toujours le compte courant. Les claims de rôle du JWT, et notamment
 * `user_metadata`, ne participent jamais à l'autorisation.
 */
export async function authorizeSupabaseContentEditor(input: {
  readonly auth: SupabaseUserAuthClient;
  readonly accessToken: string;
}): Promise<void> {
  try {
    const verified = await verifySupabasePermanentUser(input);
    if (!hasLiveContentEditorRole(verified.user)) {
      throw new ContentStudioError("not_found");
    }
  } catch (error) {
    if (error instanceof ContentStudioError) throw error;
    if (error instanceof SupabaseAuthenticationError) {
      throw new ContentStudioError(
        error.kind === "unauthorized" ? "unauthorized" : "auth_unavailable",
      );
    }
    throw new ContentStudioError("auth_unavailable");
  }
}

export function createSupabaseContentStudioAuthorizer(input: {
  readonly url: string;
  readonly publishableKey: string;
}): ContentStudioAuthorizer {
  return {
    async authorize({ accessToken, signal }) {
      const client = createClient(input.url, input.publishableKey, {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
        global: { fetch: createContentStudioSupabaseFetch(signal) },
      });
      await authorizeSupabaseContentEditor({
        auth: client.auth,
        accessToken,
      });
    },
  };
}
