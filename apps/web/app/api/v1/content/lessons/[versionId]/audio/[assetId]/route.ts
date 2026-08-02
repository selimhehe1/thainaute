import { createPublishedAudioHttpHandler } from "@/lib/server/content-delivery/audio-http";
import { unavailablePublishedLessonResponse } from "@/lib/server/content-delivery/http";
import { reportContentDeliveryFailure } from "@/lib/server/content-delivery/operational-log";
import { readPublicContentConfiguration } from "@/lib/server/content-delivery/runtime";
import { createSupabasePublishedAudioObjectStore } from "@/lib/server/content-delivery/supabase-audio-store";
import { createSupabasePublishedLessonRepository } from "@/lib/server/content-delivery/supabase-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Handler = (
  request: Request,
  versionId: string,
  assetId: string,
) => Promise<Response>;
let cachedHandler: Handler | undefined;

function publishedAudioHandler(): Handler | null {
  if (cachedHandler !== undefined) return cachedHandler;
  const configuration = readPublicContentConfiguration();
  if (configuration === null) return null;

  cachedHandler = createPublishedAudioHttpHandler({
    repository: createSupabasePublishedLessonRepository(configuration),
    objectStore: createSupabasePublishedAudioObjectStore(configuration),
    activeReleaseId: configuration.releaseId,
    reportOperationalFailure: reportContentDeliveryFailure,
  });
  return cachedHandler;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ versionId: string; assetId: string }> },
): Promise<Response> {
  const handler = publishedAudioHandler();
  if (handler === null) return unavailablePublishedLessonResponse();
  const { versionId, assetId } = await context.params;
  return handler(request, versionId, assetId);
}
