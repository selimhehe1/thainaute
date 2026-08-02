import { accountDeletionContinuationSecretSchema } from "@thainaute/sync";

import { readSupabaseAttemptSyncConfiguration } from "../attempt-sync/runtime";

type Environment = Readonly<Record<string, string | undefined>>;

export interface AccountDeletionConfiguration {
  readonly url: string;
  readonly publishableKey: string;
  readonly secretKey: string;
  readonly receiptPepper: string;
}

export function readAccountDeletionConfiguration(
  environment: Environment = process.env,
): AccountDeletionConfiguration | null {
  const supabase = readSupabaseAttemptSyncConfiguration(environment);
  if (supabase === null) return null;
  const pepper = accountDeletionContinuationSecretSchema.safeParse(
    environment.ACCOUNT_DELETION_RECEIPT_PEPPER,
  );
  if (!pepper.success) return null;
  return { ...supabase, receiptPepper: pepper.data };
}
