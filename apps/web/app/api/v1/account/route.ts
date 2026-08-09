import {
  createAccountDeletionHttpHandler,
  unavailableAccountDeletionResponse,
} from "@/lib/server/account-deletion/http";
import { createRuntimeAccountDeletionBillingCoordinator } from "@/lib/server/account-deletion/billing-coordinator";
import { createAccountDeletionHasher } from "@/lib/server/account-deletion/hashing";
import { reportAccountDeletionFailure } from "@/lib/server/account-deletion/operational-log";
import { readAccountDeletionConfiguration } from "@/lib/server/account-deletion/runtime";
import { createAccountDeleter } from "@/lib/server/account-deletion/service";
import { createSupabaseAccountDeletionAuthAdministrator } from "@/lib/server/account-deletion/supabase-admin";
import { createSupabaseAccountDeletionIdentityVerifier } from "@/lib/server/account-deletion/supabase-auth";
import { createSupabaseAccountDeletionBillingHistoryReader } from "@/lib/server/account-deletion/supabase-billing-history";
import { createSupabaseAccountDeletionReceiptRepository } from "@/lib/server/account-deletion/supabase-repository";
import { createSupabaseAccountDeletionSessionVerifier } from "@/lib/server/account-deletion/supabase-session";
import { createCurrentAccountDeletionStoragePurger } from "@/lib/server/account-deletion/storage";
import { readBillingMode } from "@/lib/server/billing/runtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Handler = (request: Request) => Promise<Response>;
let cachedHandler: Handler | undefined;

function accountDeletionHandler(): Handler | null {
  if (cachedHandler !== undefined) return cachedHandler;
  const configuration = readAccountDeletionConfiguration();
  if (configuration === null) return null;

  cachedHandler = createAccountDeletionHttpHandler({
    deleteAccount: createAccountDeleter({
      identityVerifier: createSupabaseAccountDeletionIdentityVerifier({
        url: configuration.url,
        publishableKey: configuration.publishableKey,
      }),
      sessionVerifier: createSupabaseAccountDeletionSessionVerifier({
        url: configuration.url,
        secretKey: configuration.secretKey,
      }),
      repository: createSupabaseAccountDeletionReceiptRepository({
        url: configuration.url,
        secretKey: configuration.secretKey,
      }),
      billingCoordinator: createRuntimeAccountDeletionBillingCoordinator({
        billingMode: readBillingMode(),
        historyReader: createSupabaseAccountDeletionBillingHistoryReader({
          url: configuration.url,
          secretKey: configuration.secretKey,
        }),
      }),
      storage: createCurrentAccountDeletionStoragePurger(),
      authAdministrator: createSupabaseAccountDeletionAuthAdministrator({
        url: configuration.url,
        secretKey: configuration.secretKey,
      }),
      hasher: createAccountDeletionHasher(configuration.receiptPepper),
    }),
    reportOperationalFailure: reportAccountDeletionFailure,
  });
  return cachedHandler;
}

export async function DELETE(request: Request): Promise<Response> {
  const handler = accountDeletionHandler();
  return handler === null
    ? unavailableAccountDeletionResponse()
    : handler(request);
}
