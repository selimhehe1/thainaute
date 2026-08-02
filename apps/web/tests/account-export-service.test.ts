import { describe, expect, it, vi } from "vitest";
import type { AccountExportIdentity } from "@thainaute/sync";

import { createAccountExporter } from "../lib/server/account-export/service";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ACCESS_TOKEN = "header.payload.sensitive-token";
const identity: AccountExportIdentity = {
  id: USER_ID,
  email: "selim@example.test",
  phone: null,
  providers: ["email"],
  createdAt: "2026-08-01T09:00:00.000Z",
  updatedAt: null,
  lastSignInAt: "2026-08-02T08:00:00.000Z",
  emailConfirmedAt: "2026-08-01T09:01:00.000Z",
  phoneConfirmedAt: null,
};

describe("service d'export de compte", () => {
  it("dérive le périmètre base du seul utilisateur Auth validé", async () => {
    const signal = new AbortController().signal;
    const verify = vi.fn(() => Promise.resolve(identity));
    const read = vi.fn(() =>
      Promise.resolve({
        profile: null,
        devices: [],
        attemptEvents: [],
        learnerItemStates: [],
        contentReports: [],
      }),
    );
    const exporter = createAccountExporter({
      identityVerifier: { verify },
      repository: { read },
      now: () => new Date("2026-08-02T10:00:00.000Z"),
    });

    await expect(
      exporter({ accessToken: ACCESS_TOKEN, signal }),
    ).resolves.toMatchObject({
      format: "thainaute.account-export/v2",
      exportedAt: "2026-08-02T10:00:00.000Z",
      identity: { id: USER_ID },
    });
    expect(verify).toHaveBeenCalledWith({
      accessToken: ACCESS_TOKEN,
      signal,
    });
    expect(read).toHaveBeenCalledWith({
      userId: USER_ID,
      accessToken: ACCESS_TOKEN,
      signal,
    });
  });
});
