import {
  readAuthoringCompiledLessonBundle,
  readAuthoringDraft,
  readCompiledLessonBundle,
} from "@thainaute/content";

import {
  authorizeContentPreviewRequest,
  hiddenContentPreviewResponse,
} from "@/lib/server/content-studio/preview-access";

export const dynamic = "force-dynamic";

function protectedAudioSources(
  lecon: string,
  assetIds: readonly string[],
): Record<string, string> {
  return Object.fromEntries(
    assetIds.map((assetId) => [
      assetId,
      `/learn/lecon/${encodeURIComponent(lecon)}/preview/audio/${encodeURIComponent(assetId)}`,
    ]),
  );
}

export async function GET(
  request: Request,
  context: { params: Promise<{ lecon: string }> },
): Promise<Response> {
  const denied = await authorizeContentPreviewRequest(request);
  if (denied !== null) return denied;

  const { lecon } = await context.params;
  const bundle =
    readCompiledLessonBundle(lecon) ?? readAuthoringCompiledLessonBundle(lecon);
  if (bundle !== null) {
    return Response.json(
      {
        kind: "compiled",
        lesson: bundle.lesson,
        audioSources: protectedAudioSources(
          lecon,
          bundle.audioManifest.entries.map(({ assetId }) => assetId),
        ),
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
          Vary: "Authorization",
        },
      },
    );
  }

  const draft = readAuthoringDraft(lecon);
  return draft === null
    ? hiddenContentPreviewResponse()
    : Response.json(
        { kind: "draft", draft },
        {
          headers: {
            "Cache-Control": "private, no-store",
            Vary: "Authorization",
          },
        },
      );
}
