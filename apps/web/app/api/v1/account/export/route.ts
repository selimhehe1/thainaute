import {
  createAccountExportHttpHandler,
  unavailableAccountExportResponse,
} from "@/lib/server/account-export/http";
import { reportAccountExportFailure } from "@/lib/server/account-export/operational-log";
import { createAccountExporter } from "@/lib/server/account-export/service";
import { createSupabaseAccountExportIdentityVerifier } from "@/lib/server/account-export/supabase-auth";
import { createSupabaseAccountExportRepository } from "@/lib/server/account-export/supabase-repository";
import { readSupabaseAttemptSyncConfiguration } from "@/lib/server/attempt-sync/runtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Handler = (request: Request) => Promise<Response>;
let cachedHandler: Handler | undefined;

function accountExportHandler(): Handler | null {
  if (cachedHandler !== undefined) return cachedHandler;
  const configuration = readSupabaseAttemptSyncConfiguration();
  if (configuration === null) return null;

  cachedHandler = createAccountExportHttpHandler({
    exportAccount: createAccountExporter({
      identityVerifier: createSupabaseAccountExportIdentityVerifier({
        url: configuration.url,
        publishableKey: configuration.publishableKey,
      }),
      repository: createSupabaseAccountExportRepository({
        url: configuration.url,
        publishableKey: configuration.publishableKey,
        secretKey: configuration.secretKey,
      }),
    }),
    reportOperationalFailure: reportAccountExportFailure,
  });
  return cachedHandler;
}

export async function GET(request: Request): Promise<Response> {
  const handler = accountExportHandler();
  return handler === null
    ? unavailableAccountExportResponse()
    : handler(request);
}
