import {
  createContentReportHttpHandler,
  unavailableContentReportResponse,
} from "@/lib/server/content-report/http";
import { reportContentReportOperationalFailure } from "@/lib/server/content-report/operational-log";
import { readContentReportSubmissionConfiguration } from "@/lib/server/content-report/runtime";
import { createContentReportSubmitter } from "@/lib/server/content-report/service";
import { createSupabaseContentReportAccessTokenVerifier } from "@/lib/server/content-report/supabase-auth";
import { createSupabaseContentReportRepository } from "@/lib/server/content-report/supabase-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Handler = (request: Request) => Promise<Response>;
let cachedHandler: Handler | undefined;

function contentReportHandler(): Handler | null {
  if (cachedHandler !== undefined) return cachedHandler;

  const configuration = readContentReportSubmissionConfiguration();
  if (configuration === null) return null;

  const repository = createSupabaseContentReportRepository({
    url: configuration.url,
    secretKey: configuration.secretKey,
  });
  cachedHandler = createContentReportHttpHandler({
    accessTokenVerifier: createSupabaseContentReportAccessTokenVerifier({
      url: configuration.url,
      publishableKey: configuration.publishableKey,
    }),
    submit: createContentReportSubmitter(repository),
    reportOperationalFailure: reportContentReportOperationalFailure,
  });
  return cachedHandler;
}

export async function POST(request: Request): Promise<Response> {
  const handler = contentReportHandler();
  return handler === null
    ? unavailableContentReportResponse()
    : handler(request);
}
