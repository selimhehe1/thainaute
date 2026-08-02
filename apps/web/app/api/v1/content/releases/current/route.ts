import {
  createPublishedReleaseHttpHandler,
  unavailablePublishedLessonResponse,
} from "@/lib/server/content-delivery/http";
import { reportContentDeliveryFailure } from "@/lib/server/content-delivery/operational-log";
import { readPublicContentConfiguration } from "@/lib/server/content-delivery/runtime";
import { createSupabasePublishedLessonRepository } from "@/lib/server/content-delivery/supabase-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Handler = (request: Request) => Promise<Response>;
let cachedHandler: Handler | undefined;

function publishedReleaseHandler(): Handler | null {
  if (cachedHandler !== undefined) return cachedHandler;
  const configuration = readPublicContentConfiguration();
  if (configuration === null) return null;

  const handler = createPublishedReleaseHttpHandler({
    repository: createSupabasePublishedLessonRepository(configuration),
    reportOperationalFailure: reportContentDeliveryFailure,
  });
  cachedHandler = (request) => handler(request, configuration.releaseId);
  return cachedHandler;
}

export async function GET(request: Request): Promise<Response> {
  const handler = publishedReleaseHandler();
  return handler === null
    ? unavailablePublishedLessonResponse()
    : handler(request);
}
