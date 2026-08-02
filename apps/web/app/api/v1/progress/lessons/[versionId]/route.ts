import { readSupabaseAttemptSyncConfiguration } from "@/lib/server/attempt-sync/runtime";
import { createSupabaseAccessTokenVerifier } from "@/lib/server/attempt-sync/supabase-auth";
import { readPublicContentConfiguration } from "@/lib/server/content-delivery/runtime";
import { createSupabasePublishedLessonRepository } from "@/lib/server/content-delivery/supabase-repository";
import {
  createLessonProgressHttpHandler,
  unavailableLessonProgressResponse,
} from "@/lib/server/lesson-progress/http";
import { reportLessonProgressFailure } from "@/lib/server/lesson-progress/operational-log";
import { createSupabaseProgressSnapshotRepository } from "@/lib/server/progress-snapshot/supabase-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Handler = (request: Request, versionId: string) => Promise<Response>;
let cachedHandler: Handler | undefined;

function lessonProgressHandler(): Handler | null {
  if (cachedHandler !== undefined) return cachedHandler;
  const syncConfiguration = readSupabaseAttemptSyncConfiguration();
  const contentConfiguration = readPublicContentConfiguration();
  if (syncConfiguration === null || contentConfiguration === null) return null;

  const snapshotRepository = createSupabaseProgressSnapshotRepository({
    url: syncConfiguration.url,
    secretKey: syncConfiguration.secretKey,
  });
  cachedHandler = createLessonProgressHttpHandler({
    accessTokenVerifier: createSupabaseAccessTokenVerifier({
      url: syncConfiguration.url,
      publishableKey: syncConfiguration.publishableKey,
    }),
    repository: createSupabasePublishedLessonRepository(contentConfiguration),
    readSnapshot: (userId) => snapshotRepository.read(userId),
    activeReleaseId: contentConfiguration.releaseId,
    reportOperationalFailure: reportLessonProgressFailure,
  });
  return cachedHandler;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ versionId: string }> },
): Promise<Response> {
  const handler = lessonProgressHandler();
  if (handler === null) return unavailableLessonProgressResponse();
  const { versionId } = await context.params;
  return handler(request, versionId);
}
