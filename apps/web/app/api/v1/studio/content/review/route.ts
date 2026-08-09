import { readFixtureBundle } from "@thainaute/content";
import { reviewContentBundle } from "@thainaute/content/studio";

import {
  createContentStudioHttpHandler,
  hiddenContentStudioResponse,
} from "@/lib/server/content-studio/http";
import { createSupabaseContentReportAggregateReader } from "@/lib/server/content-studio/content-report-aggregate";
import { readContentStudioConfiguration } from "@/lib/server/content-studio/runtime";
import { createSupabaseContentStudioAuthorizer } from "@/lib/server/content-studio/supabase-auth";
import { readSupabaseServerConfiguration } from "@/lib/server/attempt-sync/runtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Handler = (request: Request) => Promise<Response>;

function contentStudioHandler(): Handler | null {
  const configuration = readContentStudioConfiguration();
  const reportConfiguration = readSupabaseServerConfiguration();
  if (configuration === null || reportConfiguration === null) return null;

  // La configuration est relue à chaque requête. La construction du handler
  // est pure et peu coûteuse ; ne pas la mettre en cache évite surtout qu'un
  // runtime long-lived conserve un ancien mode Studio après une rotation de
  // configuration ou un redémarrage partiel.
  return createContentStudioHttpHandler({
    authorizer: createSupabaseContentStudioAuthorizer(configuration),
    reviewFixture: () => reviewContentBundle(readFixtureBundle()),
    reportAggregateReader:
      createSupabaseContentReportAggregateReader(reportConfiguration),
  });
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
