import { z } from "zod";

import { AccountDeletionApiError } from "./errors";

export const ACCOUNT_DELETION_REAUTH_MAX_AGE_SECONDS = 10 * 60;
const ACCOUNT_DELETION_REAUTH_FUTURE_TOLERANCE_SECONDS = 60;

const claimsSchema = z
  .object({
    amr: z
      .array(
        z
          .object({
            method: z.string(),
            timestamp: z.number().int().nonnegative(),
          })
          .passthrough(),
      )
      .max(32),
    session_id: z.uuid(),
  })
  .passthrough();

/** Exige un OTP réellement attesté par Auth, sans se fier à `iat`. */
export function assertRecentAccountDeletionOtp(
  claims: unknown,
  now: Date,
): { readonly sessionId: string } {
  const parsed = claimsSchema.safeParse(claims);
  if (!parsed.success) {
    throw new AccountDeletionApiError("reauthentication_required");
  }
  const nowSeconds = Math.floor(now.getTime() / 1_000);
  const hasRecentOtp = parsed.data.amr.some(
    (entry) =>
      entry.method === "otp" &&
      entry.timestamp >= nowSeconds - ACCOUNT_DELETION_REAUTH_MAX_AGE_SECONDS &&
      entry.timestamp <=
        nowSeconds + ACCOUNT_DELETION_REAUTH_FUTURE_TOLERANCE_SECONDS,
  );
  if (!hasRecentOtp) {
    throw new AccountDeletionApiError("reauthentication_required");
  }
  return { sessionId: parsed.data.session_id.toLowerCase() };
}
