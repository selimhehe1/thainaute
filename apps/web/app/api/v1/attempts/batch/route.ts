import {
  createAttemptBatchHttpHandler,
  unavailableAttemptBatchResponse,
} from "@/lib/server/attempt-sync/http";
import { reportOperationalFailure } from "@/lib/server/attempt-sync/operational-log";
import { readSupabaseAttemptSyncConfiguration } from "@/lib/server/attempt-sync/runtime";
import { createAttemptBatchSynchronizer } from "@/lib/server/attempt-sync/service";
import { createSupabaseAccessTokenVerifier } from "@/lib/server/attempt-sync/supabase-auth";
import { createSupabaseAttemptRepository } from "@/lib/server/attempt-sync/supabase-repository";
import { readActiveContentReleaseId } from "@/lib/server/content-delivery/runtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Handler = (request: Request) => Promise<Response>;
let cachedHandler: Handler | undefined;

function attemptBatchHandler(): Handler | null {
  if (cachedHandler !== undefined) return cachedHandler;

  const configuration = readSupabaseAttemptSyncConfiguration();
  const activeReleaseId = readActiveContentReleaseId();
  if (configuration === null || activeReleaseId === null) return null;

  const repository = createSupabaseAttemptRepository({
    url: configuration.url,
    secretKey: configuration.secretKey,
    releaseId: activeReleaseId,
  });
  cachedHandler = createAttemptBatchHttpHandler({
    accessTokenVerifier: createSupabaseAccessTokenVerifier({
      url: configuration.url,
      publishableKey: configuration.publishableKey,
    }),
    synchronize: createAttemptBatchSynchronizer(repository, {
      activeReleaseId,
    }),
    reportOperationalFailure,
  });
  return cachedHandler;
}

export async function POST(request: Request): Promise<Response> {
  const handler = attemptBatchHandler();
  return handler === null
    ? unavailableAttemptBatchResponse()
    : handler(request);
}
