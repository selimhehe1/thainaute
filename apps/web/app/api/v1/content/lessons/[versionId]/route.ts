import {
  createPublishedLessonHttpHandler,
  unavailablePublishedLessonResponse,
} from "@/lib/server/content-delivery/http";
import { reportContentDeliveryFailure } from "@/lib/server/content-delivery/operational-log";
import { readPublicContentConfiguration } from "@/lib/server/content-delivery/runtime";
import { createSupabasePublishedLessonRepository } from "@/lib/server/content-delivery/supabase-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Handler = (request: Request, versionId: string) => Promise<Response>;
let cachedHandler: Handler | undefined;

function publishedLessonHandler(): Handler | null {
  if (cachedHandler !== undefined) return cachedHandler;
  const configuration = readPublicContentConfiguration();
  if (configuration === null) return null;

  cachedHandler = createPublishedLessonHttpHandler({
    repository: createSupabasePublishedLessonRepository(configuration),
    activeReleaseId: configuration.releaseId,
    reportOperationalFailure: reportContentDeliveryFailure,
  });
  return cachedHandler;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ versionId: string }> },
): Promise<Response> {
  const handler = publishedLessonHandler();
  if (handler === null) return unavailablePublishedLessonResponse();
  const { versionId } = await context.params;
  return handler(request, versionId);
}
