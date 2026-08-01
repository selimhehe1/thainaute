import { readSupabaseAttemptSyncConfiguration } from "@/lib/server/attempt-sync/runtime";
import { createSupabaseAccessTokenVerifier } from "@/lib/server/attempt-sync/supabase-auth";
import {
  createProgressSnapshotHttpHandler,
  unavailableProgressSnapshotResponse,
} from "@/lib/server/progress-snapshot/http";
import { reportProgressSnapshotFailure } from "@/lib/server/progress-snapshot/operational-log";
import { createSupabaseProgressSnapshotRepository } from "@/lib/server/progress-snapshot/supabase-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Handler = (request: Request) => Promise<Response>;
let cachedHandler: Handler | undefined;

function progressSnapshotHandler(): Handler | null {
  if (cachedHandler !== undefined) return cachedHandler;
  const configuration = readSupabaseAttemptSyncConfiguration();
  if (configuration === null) return null;

  const repository = createSupabaseProgressSnapshotRepository({
    url: configuration.url,
    secretKey: configuration.secretKey,
  });
  cachedHandler = createProgressSnapshotHttpHandler({
    accessTokenVerifier: createSupabaseAccessTokenVerifier({
      url: configuration.url,
      publishableKey: configuration.publishableKey,
    }),
    readSnapshot: (userId) => repository.read(userId),
    reportOperationalFailure: reportProgressSnapshotFailure,
  });
  return cachedHandler;
}

export async function GET(request: Request): Promise<Response> {
  const handler = progressSnapshotHandler();
  return handler === null
    ? unavailableProgressSnapshotResponse()
    : handler(request);
}
