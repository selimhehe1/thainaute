// @vitest-environment jsdom

import type { AccountExportDocument } from "@thainaute/sync";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const testState = vi.hoisted(() => ({
  appState: "active",
  appStateListener: null as ((state: string) => void) | null,
  createSyncHttpClient: vi.fn(),
  files: new Map<
    string,
    {
      content: string;
      createCalls: number;
      deleteCalls: number;
      deleteThrows: boolean;
      exists: boolean;
      retainAfterDelete: boolean;
    }
  >(),
  getAccountExport: vi.fn(),
  getSession: vi.fn(),
  isAvailableAsync: vi.fn(),
  removeAppStateListener: vi.fn(),
  shareAsync: vi.fn(),
}));

vi.mock("@thainaute/sync", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@thainaute/sync")>();
  return { ...actual, createSyncHttpClient: testState.createSyncHttpClient };
});

vi.mock("expo-file-system", () => {
  class MockFile {
    readonly uri: string;

    constructor(base: { uri?: string } | string, ...parts: string[]) {
      const prefix = typeof base === "string" ? base : (base.uri ?? "");
      this.uri = `${prefix}${parts.join("/")}`;
    }

    get exists(): boolean {
      return testState.files.get(this.uri)?.exists ?? false;
    }

    get size(): number {
      return testState.files.get(this.uri)?.content.length ?? 0;
    }

    create(): void {
      const previous = testState.files.get(this.uri);
      testState.files.set(this.uri, {
        content: "",
        createCalls: (previous?.createCalls ?? 0) + 1,
        deleteCalls: previous?.deleteCalls ?? 0,
        deleteThrows: previous?.deleteThrows ?? false,
        exists: true,
        retainAfterDelete: previous?.retainAfterDelete ?? false,
      });
    }

    write(content: string): void {
      const file = testState.files.get(this.uri);
      if (file === undefined || !file.exists) throw new Error("missing file");
      file.content = content;
    }

    delete(): void {
      const file = testState.files.get(this.uri);
      if (file === undefined) return;
      file.deleteCalls += 1;
      if (file.deleteThrows) throw new Error("locked");
      if (!file.retainAfterDelete) file.exists = false;
    }
  }

  return {
    File: MockFile,
    Paths: { cache: { uri: "file:///private/cache/" } },
  };
});

vi.mock("expo-sharing", () => ({
  isAvailableAsync: testState.isAvailableAsync,
  shareAsync: testState.shareAsync,
}));

vi.mock("react-native", () => ({
  AppState: {
    addEventListener: vi.fn(
      (_event: string, listener: (state: string) => void) => {
        testState.appStateListener = listener;
        return {
          remove: () => {
            testState.removeAppStateListener();
            if (testState.appStateListener === listener) {
              testState.appStateListener = null;
            }
          },
        };
      },
    ),
    get currentState() {
      return testState.appState;
    },
  },
}));

vi.mock("../lib/supabase-auth", () => ({
  getMobileSupabaseAuthClient: () => ({
    auth: { getSession: testState.getSession },
  }),
}));

// Import après les mocks natifs afin qu’aucun module Expo réel ne soit chargé.
// eslint-disable-next-line import/first
import {
  prepareMobileAccountExportDelivery,
  purgeMobileAccountExportCache,
  requestMobileAccountExport,
  shareMobileAccountExport,
} from "../lib/mobile-account-export";

const USER_ID = "10000000-0000-4000-8000-000000000001";
const EXPORT_URI = "file:///private/cache/thainaute-account-export-v2.json";

const document: AccountExportDocument = {
  format: "thainaute.account-export/v2",
  exportedAt: "2026-08-02T12:00:00.000Z",
  identity: {
    id: USER_ID,
    email: "apprenant@thainaute.invalid",
    phone: null,
    providers: ["email"],
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: null,
    lastSignInAt: null,
    emailConfirmedAt: null,
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

beforeEach(() => {
  vi.clearAllMocks();
  testState.appState = "active";
  testState.appStateListener = null;
  testState.files.clear();
  testState.isAvailableAsync.mockResolvedValue(true);
  testState.shareAsync.mockResolvedValue(undefined);
  testState.getAccountExport.mockResolvedValue(document);
  testState.createSyncHttpClient.mockReturnValue({
    getAccountExport: testState.getAccountExport,
  });
  testState.getSession.mockResolvedValue({
    data: {
      session: {
        access_token: "mobile-access-token",
        user: { id: USER_ID, is_anonymous: false },
      },
    },
    error: null,
  });
  process.env.EXPO_PUBLIC_API_URL = "https://api.thainaute.invalid";
});

afterEach(() => {
  delete process.env.EXPO_PUBLIC_API_URL;
});

describe("export de compte mobile", () => {
  it("purge uniquement le fichier temporaire au nom fixe", () => {
    testState.files.set(EXPORT_URI, {
      content: "sensible",
      createCalls: 0,
      deleteCalls: 0,
      deleteThrows: false,
      exists: true,
      retainAfterDelete: false,
    });
    testState.files.set("file:///private/cache/voice.m4a", {
      content: "voice",
      createCalls: 0,
      deleteCalls: 0,
      deleteThrows: false,
      exists: true,
      retainAfterDelete: false,
    });

    purgeMobileAccountExportCache();

    expect(testState.files.get(EXPORT_URI)).toMatchObject({
      deleteCalls: 1,
      exists: false,
    });
    expect(
      testState.files.get("file:///private/cache/voice.m4a"),
    ).toMatchObject({ deleteCalls: 0, exists: true });
  });

  it("reste fail-closed si un ancien export ne peut pas être supprimé", async () => {
    testState.files.set(EXPORT_URI, {
      content: "sensible",
      createCalls: 0,
      deleteCalls: 0,
      deleteThrows: true,
      exists: true,
      retainAfterDelete: false,
    });

    await expect(prepareMobileAccountExportDelivery()).rejects.toMatchObject({
      code: "cache_cleanup_failed",
    });
    expect(testState.isAvailableAsync).not.toHaveBeenCalled();
    expect(testState.shareAsync).not.toHaveBeenCalled();
  });

  it("utilise le transport partagé et son recheck getAccountExport", async () => {
    const controller = new AbortController();

    await expect(
      requestMobileAccountExport({
        expectedUserId: USER_ID,
        signal: controller.signal,
      }),
    ).resolves.toEqual(document);

    expect(testState.createSyncHttpClient).toHaveBeenCalledWith(
      expect.objectContaining({
        allowInsecureHttp: true,
        baseUrl: "https://api.thainaute.invalid",
        expectedUserId: USER_ID,
        timeoutMs: 25_000,
      }),
    );
    expect(testState.getAccountExport).toHaveBeenCalledWith(controller.signal);

    const options = testState.createSyncHttpClient.mock.calls[0]?.[0] as {
      getSession: () => Promise<unknown>;
    };
    await expect(options.getSession()).resolves.toEqual({
      accessToken: "mobile-access-token",
      userId: USER_ID,
    });
  });

  it("écrit, partage puis supprime la copie privée", async () => {
    const controller = new AbortController();

    await shareMobileAccountExport({
      document,
      signal: controller.signal,
    });

    expect(testState.shareAsync).toHaveBeenCalledWith(EXPORT_URI, {
      dialogTitle: "Exporter mes données Thaïnaute",
      mimeType: "application/json",
      UTI: "public.json",
    });
    expect(testState.files.get(EXPORT_URI)).toMatchObject({
      content: `${JSON.stringify(document)}\n`,
      createCalls: 1,
      deleteCalls: 1,
      exists: false,
    });
  });

  it("attend le retour Android au premier plan avant la purge", async () => {
    testState.appState = "background";
    const controller = new AbortController();
    let completed = false;
    const operation = shareMobileAccountExport({
      document,
      signal: controller.signal,
    }).then(() => {
      completed = true;
    });

    await vi.waitFor(() => expect(testState.shareAsync).toHaveBeenCalledOnce());
    await Promise.resolve();
    expect(completed).toBe(false);
    expect(testState.files.get(EXPORT_URI)).toMatchObject({ exists: true });

    testState.appState = "active";
    testState.appStateListener?.("active");
    await operation;

    expect(completed).toBe(true);
    expect(testState.files.get(EXPORT_URI)).toMatchObject({
      deleteCalls: 1,
      exists: false,
    });
    expect(testState.removeAppStateListener).toHaveBeenCalledOnce();
  });

  it("une frontière de session interrompt l’attente et purge immédiatement", async () => {
    testState.appState = "background";
    const controller = new AbortController();
    const operation = shareMobileAccountExport({
      document,
      signal: controller.signal,
    });

    await vi.waitFor(() => expect(testState.shareAsync).toHaveBeenCalledOnce());
    controller.abort();

    await expect(operation).rejects.toMatchObject({
      code: "session_changed",
    });
    expect(testState.files.get(EXPORT_URI)).toMatchObject({
      deleteCalls: 1,
      exists: false,
    });
  });

  it("supprime aussi le fichier après une panne de partage", async () => {
    testState.shareAsync.mockRejectedValue(new Error("native failure"));
    const controller = new AbortController();

    await expect(
      shareMobileAccountExport({ document, signal: controller.signal }),
    ).rejects.toMatchObject({ code: "sharing_failed" });
    expect(testState.files.get(EXPORT_URI)).toMatchObject({
      deleteCalls: 1,
      exists: false,
    });
  });

  it("ne masque pas un refus de purge après le partage", async () => {
    testState.shareAsync.mockImplementation(async () => {
      const file = testState.files.get(EXPORT_URI);
      if (file !== undefined) file.retainAfterDelete = true;
    });
    const controller = new AbortController();

    await expect(
      shareMobileAccountExport({ document, signal: controller.signal }),
    ).rejects.toMatchObject({ code: "cache_cleanup_failed" });
    expect(testState.files.get(EXPORT_URI)).toMatchObject({ exists: true });
  });
});
