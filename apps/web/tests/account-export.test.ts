import type { Session } from "@supabase/supabase-js";
import type { AccountExportDocument } from "@thainaute/sync";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  user: "10000000-0000-4000-8000-000000000001",
} as const;

const mocks = vi.hoisted(() => ({
  state: { client: null as Record<string, unknown> | null },
}));

vi.mock("../lib/client/supabase-auth", () => ({
  getWebSupabaseAuthClient: () => mocks.state.client,
}));

import {
  deliverWebAccountExport,
  requestWebAccountExport,
  webAccountExportFileName,
} from "../lib/client/account-export";

function session(userId: string): Session {
  return {
    access_token: "unit-test-access-token",
    expires_in: 3_600,
    refresh_token: "unit-test-refresh-token",
    token_type: "bearer",
    user: {
      app_metadata: {},
      aud: "authenticated",
      created_at: "2026-08-01T10:00:00.000Z",
      id: userId,
      is_anonymous: false,
      user_metadata: {},
    },
  } as Session;
}

function exportDocument(): AccountExportDocument {
  return {
    format: "thainaute.account-export/v2",
    exportedAt: "2026-08-02T10:00:00.000Z",
    identity: {
      id: ids.user,
      email: "apprenant@example.test",
      phone: null,
      providers: ["email"],
      createdAt: "2026-08-01T10:00:00.000Z",
      updatedAt: "2026-08-02T09:00:00.000Z",
      lastSignInAt: "2026-08-02T09:00:00.000Z",
      emailConfirmedAt: "2026-08-01T10:05:00.000Z",
      phoneConfirmedAt: null,
    },
    data: {
      profile: null,
      devices: [],
      attemptEvents: [],
      learnerItemStates: [],
      contentReports: [],
    },
  };
}

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsText(blob);
  });
}

describe("export du compte web", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.state.client = null;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("relit la session autour du GET authentifié", async () => {
    const currentSession = session(ids.user);
    const getSession = vi.fn(() =>
      Promise.resolve({ data: { session: currentSession }, error: null }),
    );
    mocks.state.client = { auth: { getSession } };
    const fetchMock = vi.fn(() =>
      Promise.resolve(Response.json(exportDocument())),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      requestWebAccountExport({
        expectedUserId: ids.user,
        signal: new AbortController().signal,
      }),
    ).resolves.toEqual(exportDocument());

    expect(getSession).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/account/export",
      expect.objectContaining({
        method: "GET",
        credentials: "omit",
        headers: expect.objectContaining({
          Authorization: "Bearer unit-test-access-token",
        }),
      }),
    );
  });

  it("crée un JSON daté au nom neutre puis révoque immédiatement son URL", async () => {
    let capturedBlob: Blob | undefined;
    let clickedDownload: string | undefined;
    let clickedHref: string | undefined;
    const createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return "blob:account-export-test";
    });
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      function click(this: HTMLAnchorElement) {
        clickedDownload = this.download;
        clickedHref = this.href;
      },
    );

    deliverWebAccountExport(exportDocument());

    expect(webAccountExportFileName("2026-08-02T10:00:00.000Z")).toBe(
      "thainaute-donnees-compte-2026-08-02.json",
    );
    expect(clickedDownload).toBe("thainaute-donnees-compte-2026-08-02.json");
    expect(clickedHref).toBe("blob:account-export-test");
    expect(capturedBlob?.type).toBe("application/json;charset=utf-8");
    expect(JSON.parse(await readBlob(capturedBlob as Blob))).toEqual(
      exportDocument(),
    );
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:account-export-test");
    expect(
      document.querySelector('a[href="blob:account-export-test"]'),
    ).toBeNull();
  });

  it("révoque aussi l'URL si le navigateur refuse le clic", () => {
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:account-export-failure"),
      revokeObjectURL,
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
      throw new Error("download blocked");
    });

    expect(() => deliverWebAccountExport(exportDocument())).toThrow(
      "download blocked",
    );
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:account-export-failure");
  });
});
