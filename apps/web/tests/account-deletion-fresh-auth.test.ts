import { describe, expect, it } from "vitest";

import {
  ACCOUNT_DELETION_REAUTH_MAX_AGE_SECONDS,
  assertRecentAccountDeletionOtp,
} from "../lib/server/account-deletion/fresh-auth";

const NOW = new Date("2026-08-02T10:00:00.000Z");
const NOW_SECONDS = Math.floor(NOW.getTime() / 1_000);

function claims(method: string, timestamp: number) {
  return {
    sub: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    session_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    amr: [{ method, timestamp }],
  };
}

describe("réauthentification de suppression", () => {
  it("accepte un OTP Auth récent à la limite incluse", () => {
    expect(
      assertRecentAccountDeletionOtp(
        claims("otp", NOW_SECONDS - ACCOUNT_DELETION_REAUTH_MAX_AGE_SECONDS),
        NOW,
      ),
    ).toEqual({ sessionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" });
  });

  it.each([
    ["un OTP trop ancien", claims("otp", NOW_SECONDS - 601)],
    ["un simple rafraîchissement", claims("token_refresh", NOW_SECONDS)],
    ["un iat sans amr", { session_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" }],
    [
      "un session_id invalide",
      { ...claims("otp", NOW_SECONDS), session_id: "bad" },
    ],
    ["des claims opaques", "secret"],
  ])("refuse %s", (_label, value) => {
    expect(() => assertRecentAccountDeletionOtp(value, NOW)).toThrowError(
      expect.objectContaining({ code: "reauthentication_required" }),
    );
  });

  it("tolère au plus une minute d'écart futur", () => {
    expect(() =>
      assertRecentAccountDeletionOtp(claims("otp", NOW_SECONDS + 60), NOW),
    ).not.toThrow();
    expect(() =>
      assertRecentAccountDeletionOtp(claims("otp", NOW_SECONDS + 61), NOW),
    ).toThrowError(
      expect.objectContaining({ code: "reauthentication_required" }),
    );
  });
});
