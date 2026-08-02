import { readFixtureBundle } from "@thainaute/content";
import { reviewContentBundle } from "@thainaute/content/studio";

import {
  createContentStudioHttpHandler,
  hiddenContentStudioResponse,
} from "@/lib/server/content-studio/http";
import { readContentStudioConfiguration } from "@/lib/server/content-studio/runtime";
import { createSupabaseContentStudioAuthorizer } from "@/lib/server/content-studio/supabase-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Handler = (request: Request) => Promise<Response>;
let cachedHandler: Handler | undefined;

function contentStudioHandler(): Handler | null {
  if (cachedHandler !== undefined) return cachedHandler;
  const configuration = readContentStudioConfiguration();
  if (configuration === null) return null;

  cachedHandler = createContentStudioHttpHandler({
    authorizer: createSupabaseContentStudioAuthorizer(configuration),
    reviewFixture: () => reviewContentBundle(readFixtureBundle()),
  });
  return cachedHandler;
}

export async function GET(request: Request): Promise<Response> {
  const handler = contentStudioHandler();
  return handler === null ? hiddenContentStudioResponse() : handler(request);
}

function hiddenMethodResponse(): Response {
  return hiddenContentStudioResponse();
}

export function POST(): Response {
  return hiddenMethodResponse();
}

export function PUT(): Response {
  return hiddenMethodResponse();
}

export function PATCH(): Response {
  return hiddenMethodResponse();
}

export function DELETE(): Response {
  return hiddenMethodResponse();
}

export function OPTIONS(): Response {
  return hiddenMethodResponse();
}

export function HEAD(): Response {
  return hiddenMethodResponse();
}
