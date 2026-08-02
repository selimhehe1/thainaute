import { describe, expect, it } from "vitest";

import { createAccountDeletionHasher } from "../lib/server/account-deletion/hashing";

const PEPPER = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const HEADERS = {
  idempotencyKey: "10000000-0000-4000-8000-000000000001",
  continuationSecret: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBA",
};

describe("empreintes de suppression", () => {
  it("produit quatre HMAC séparés sans conserver les valeurs sources", () => {
    const result = createAccountDeletionHasher(PEPPER).fingerprint({
      userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      request: { confirmation: "delete_account" },
      headers: HEADERS,
    });

    expect(result).toEqual({
      subjectHmac: expect.stringMatching(/^[0-9a-f]{64}$/u),
      idempotencyHmac: expect.stringMatching(/^[0-9a-f]{64}$/u),
      requestHmac: expect.stringMatching(/^[0-9a-f]{64}$/u),
      continuationHmac: expect.stringMatching(/^[0-9a-f]{64}$/u),
    });
    expect(new Set(Object.values(result))).toHaveLength(4);
    expect(JSON.stringify(result)).not.toContain(HEADERS.continuationSecret);
  });

  it("permet le lookup de reprise sans empreinte sujet", () => {
    const result = createAccountDeletionHasher(PEPPER).fingerprint({
      request: { confirmation: "delete_account" },
      headers: HEADERS,
    });
    expect(result.subjectHmac).toBe("");
    expect(result.idempotencyHmac).toMatch(/^[0-9a-f]{64}$/u);
  });

  it.each(["short", `${PEPPER}=`, "é".repeat(43)])(
    "refuse un pepper non canonique: %s",
    (pepper) => {
      expect(() => createAccountDeletionHasher(pepper)).toThrow();
    },
  );
});
