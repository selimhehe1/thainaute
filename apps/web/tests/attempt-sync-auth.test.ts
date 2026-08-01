import { describe, expect, it } from "vitest";

import { userIdFromVerifiedClaims } from "../lib/server/attempt-sync/supabase-auth";

describe("identité issue des claims Supabase vérifiés", () => {
  it("normalise le sub UUID et ignore les autres claims", () => {
    expect(
      userIdFromVerifiedClaims({
        sub: "AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA",
        email: "ne-doit-pas-servir-a-lautorisation@example.invalid",
      }),
    ).toBe("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
  });

  it("refuse un sub absent ou non UUID", () => {
    expect(userIdFromVerifiedClaims({ role: "authenticated" })).toBeNull();
    expect(userIdFromVerifiedClaims({ sub: "user-controlled" })).toBeNull();
  });
});
