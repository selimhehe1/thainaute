import { ContentStudioError } from "./errors";
import { readContentStudioConfiguration } from "./runtime";
import { createSupabaseContentStudioAuthorizer } from "./supabase-auth";

const ACCESS_TOKEN_MAX_LENGTH = 16 * 1_024;

export function hiddenContentPreviewResponse(status = 404): Response {
  return Response.json(
    { error: { code: status === 503 ? "auth_unavailable" : "not_found" } },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        Pragma: "no-cache",
        "Referrer-Policy": "no-referrer",
        Vary: "Authorization",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    },
  );
}

function bearer(request: Request): string | null {
  const match = /^Bearer ([^\s]+)$/u.exec(
    request.headers.get("authorization") ?? "",
  );
  return match?.[1] !== undefined && match[1].length <= ACCESS_TOKEN_MAX_LENGTH
    ? match[1]
    : null;
}

/** Relit le rôle `content_editor` côté serveur pour chaque ressource interne. */
export async function authorizeContentPreviewRequest(
  request: Request,
): Promise<Response | null> {
  const configuration = readContentStudioConfiguration();
  const accessToken = bearer(request);
  if (configuration === null || accessToken === null) {
    return hiddenContentPreviewResponse();
  }

  try {
    await createSupabaseContentStudioAuthorizer(configuration).authorize({
      accessToken,
      signal: request.signal,
    });
    return null;
  } catch (error) {
    return hiddenContentPreviewResponse(
      error instanceof ContentStudioError && error.code === "auth_unavailable"
        ? 503
        : 404,
    );
  }
}
