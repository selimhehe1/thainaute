import "fake-indexeddb/auto";

import type { Session } from "@supabase/supabase-js";
import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  userA: "10000000-0000-4000-8000-000000000001",
  userB: "10000000-0000-4000-8000-000000000002",
  version: "20000000-0000-4000-8000-000000000001",
  exercise: "20000000-0000-4000-8000-000000000002",
  reportA: "30000000-0000-4000-8000-000000000001",
  reportB: "30000000-0000-4000-8000-000000000002",
} as const;

const mocks = vi.hoisted(() => ({
  state: { session: null as Session | null },
}));

vi.mock("../lib/client/supabase-auth", () => ({
  getWebSupabaseAuthClient: () => ({
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({
          data: { session: mocks.state.session },
          error: null,
        }),
      ),
    },
  }),
}));

import {
  discardRejectedWebContentReport,
  submitWebContentReport,
  synchronizeWebContentReports,
  WebContentReportSessionError,
} from "../lib/client/content-report";
import { WebAttemptOutboxStore } from "../lib/client/attempt-outbox-store";

function session(userId: string): Session {
  return {
    access_token: `access-${userId}`,
    expires_in: 3_600,
    refresh_token: `refresh-${userId}`,
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

const body = {
  contentVersionId: ids.version,
  exerciseId: ids.exercise,
  category: "tone",
  platform: "web",
} as const;

function accountStore(userId: string): WebAttemptOutboxStore {
  return new WebAttemptOutboxStore(
    "thainaute-learning-v1",
    { kind: "account", userId },
    async () => "11".repeat(32),
  );
}

beforeEach(async () => {
  vi.clearAllMocks();
  window.localStorage.clear();
  mocks.state.session = session(ids.userA);
  await Dexie.delete("thainaute-learning-v1");
});

afterEach(async () => {
  vi.unstubAllGlobals();
  await Dexie.delete("thainaute-learning-v1");
});

describe("signalement structuré web", () => {
  it("persiste le payload fermé avant le réseau puis acquitte la réponse", async () => {
    const fetchMock = vi.fn(
      async (_request: RequestInfo | URL, init?: RequestInit) => {
        const inspector = accountStore(ids.userA);
        expect((await inspector.readContentReports()).entries).toHaveLength(1);
        inspector.close();
        expect(JSON.parse(String(init?.body))).toEqual(body);
        expect(new Headers(init?.headers).get("Idempotency-Key")).toBe(
          ids.reportA,
        );
        return Response.json({ status: "received" });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      submitWebContentReport({
        expectedUserId: ids.userA,
        body,
        online: true,
        idempotencyKey: ids.reportA,
        createdAt: "2026-08-02T10:00:00.000Z",
      }),
    ).resolves.toEqual({ status: "sent", pendingCount: 0 });
    const inspector = accountStore(ids.userA);
    expect((await inspector.readContentReports()).entries).toEqual([]);
    inspector.close();
  });

  it("conserve hors ligne puis rejoue strictement en FIFO", async () => {
    vi.stubGlobal("fetch", vi.fn());
    await submitWebContentReport({
      expectedUserId: ids.userA,
      body,
      online: false,
      idempotencyKey: ids.reportA,
      createdAt: "2026-08-02T10:00:00.000Z",
    });
    await submitWebContentReport({
      expectedUserId: ids.userA,
      body: { ...body, category: "audio" },
      online: false,
      idempotencyKey: ids.reportB,
      createdAt: "2026-08-02T10:01:00.000Z",
    });
    expect(fetch).not.toHaveBeenCalled();

    const observedKeys: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn((_request: RequestInfo | URL, init?: RequestInit) => {
        observedKeys.push(
          new Headers(init?.headers).get("Idempotency-Key") ?? "",
        );
        return Promise.resolve(Response.json({ status: "duplicate" }));
      }),
    );
    await expect(synchronizeWebContentReports(ids.userA)).resolves.toEqual({
      acknowledgedIdempotencyKeys: [ids.reportA, ids.reportB],
      pendingCount: 0,
      rejectedHead: null,
    });
    expect(observedKeys).toEqual([ids.reportA, ids.reportB]);
  });

  it("n’acquitte jamais A après une bascule de session vers B", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        mocks.state.session = session(ids.userB);
        return Promise.resolve(Response.json({ status: "received" }));
      }),
    );

    await expect(
      submitWebContentReport({
        expectedUserId: ids.userA,
        body,
        online: true,
        idempotencyKey: ids.reportA,
        createdAt: "2026-08-02T10:00:00.000Z",
      }),
    ).resolves.toEqual({
      status: "queued",
      pendingCount: 1,
      reason: "delivery_failed",
    });
    const accountA = accountStore(ids.userA);
    const accountB = accountStore(ids.userB);
    expect((await accountA.readContentReports()).entries).toHaveLength(1);
    expect((await accountB.readContentReports()).entries).toHaveLength(0);
    accountA.close();
    accountB.close();
  });

  it("refuse un utilisateur anonyme avant toute persistance", async () => {
    const anonymous = session(ids.userA);
    anonymous.user.is_anonymous = true;
    mocks.state.session = anonymous;
    vi.stubGlobal("fetch", vi.fn());

    await expect(
      submitWebContentReport({
        expectedUserId: ids.userA,
        body,
        online: true,
      }),
    ).rejects.toBeInstanceOf(WebContentReportSessionError);
    const inspector = accountStore(ids.userA);
    expect((await inspector.readContentReports()).entries).toEqual([]);
    inspector.close();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    [409, "idempotency_key_reused"],
    [422, "invalid_request"],
  ] as const)(
    "conserve le refus permanent %s/%s et ne tente pas la suite FIFO",
    async (status, code) => {
      await submitWebContentReport({
        expectedUserId: ids.userA,
        body,
        online: false,
        idempotencyKey: ids.reportA,
        createdAt: "2026-08-02T10:00:00.000Z",
      });
      await submitWebContentReport({
        expectedUserId: ids.userA,
        body: { ...body, category: "audio" },
        online: false,
        idempotencyKey: ids.reportB,
        createdAt: "2026-08-02T10:01:00.000Z",
      });
      const fetchMock = vi.fn(() =>
        Promise.resolve(
          Response.json(
            { error: { code, message: "refus permanent" } },
            { status },
          ),
        ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const result = await synchronizeWebContentReports(ids.userA);
      expect(result).toMatchObject({
        acknowledgedIdempotencyKeys: [],
        pendingCount: 1,
        rejectedHead: {
          entry: { idempotencyKey: ids.reportA },
          reason: code,
        },
      });
      expect(fetchMock).toHaveBeenCalledOnce();
      const inspector = accountStore(ids.userA);
      const durable = await inspector.readContentReports();
      inspector.close();
      expect(
        durable.entries.map(({ idempotencyKey }) => idempotencyKey),
      ).toEqual([ids.reportA, ids.reportB]);
      expect(durable.rejection).toEqual(result.rejectedHead);
    },
  );

  it("retire le refus exact puis reprend et acquitte les suivants", async () => {
    await submitWebContentReport({
      expectedUserId: ids.userA,
      body,
      online: false,
      idempotencyKey: ids.reportA,
      createdAt: "2026-08-02T10:00:00.000Z",
    });
    await submitWebContentReport({
      expectedUserId: ids.userA,
      body: { ...body, category: "audio" },
      online: false,
      idempotencyKey: ids.reportB,
      createdAt: "2026-08-02T10:01:00.000Z",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          Response.json(
            {
              error: {
                code: "invalid_request",
                message: "cible invalide",
              },
            },
            { status: 422 },
          ),
        ),
      ),
    );
    const blocked = await synchronizeWebContentReports(ids.userA);
    if (blocked.rejectedHead === null) throw new Error("Expected rejection.");

    const observedKeys: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn((_request: RequestInfo | URL, init?: RequestInit) => {
        observedKeys.push(
          new Headers(init?.headers).get("Idempotency-Key") ?? "",
        );
        return Promise.resolve(Response.json({ status: "received" }));
      }),
    );
    await expect(
      discardRejectedWebContentReport({
        expectedUserId: ids.userA,
        rejection: blocked.rejectedHead,
        online: true,
      }),
    ).resolves.toEqual({
      acknowledgedIdempotencyKeys: [ids.reportB],
      pendingCount: 0,
      rejectedHead: null,
    });
    expect(observedKeys).toEqual([ids.reportB]);
    const inspector = accountStore(ids.userA);
    expect((await inspector.readContentReports()).entries).toEqual([]);
    inspector.close();
  });

  it("ne transforme jamais un refus d'authentification en rejet retirable", async () => {
    await submitWebContentReport({
      expectedUserId: ids.userA,
      body,
      online: false,
      idempotencyKey: ids.reportA,
      createdAt: "2026-08-02T10:00:00.000Z",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          Response.json(
            { error: { code: "unauthorized", message: "session invalide" } },
            { status: 401 },
          ),
        ),
      ),
    );

    await expect(synchronizeWebContentReports(ids.userA)).rejects.toMatchObject(
      {
        endpoint: "content_report",
        status: 401,
      },
    );
    const inspector = accountStore(ids.userA);
    const durable = await inspector.readContentReports();
    inspector.close();
    expect(durable.rejection).toBeNull();
    expect(durable.entries).toHaveLength(1);
  });

  it("ne masque pas un refus existant lors d'un nouvel ajout hors ligne", async () => {
    await submitWebContentReport({
      expectedUserId: ids.userA,
      body,
      online: false,
      idempotencyKey: ids.reportA,
      createdAt: "2026-08-02T10:00:00.000Z",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          Response.json(
            {
              error: { code: "invalid_request", message: "cible invalide" },
            },
            { status: 422 },
          ),
        ),
      ),
    );
    const blocked = await synchronizeWebContentReports(ids.userA);
    if (blocked.rejectedHead === null) throw new Error("Expected rejection.");

    await expect(
      submitWebContentReport({
        expectedUserId: ids.userA,
        body: { ...body, category: "audio" },
        online: false,
        idempotencyKey: ids.reportB,
        createdAt: "2026-08-02T10:01:00.000Z",
      }),
    ).resolves.toEqual({
      status: "queued",
      pendingCount: 1,
      reason: "blocked_by_rejected",
      rejectedHead: blocked.rejectedHead,
    });
  });

  it("ne retire rien si la session a basculé vers un autre compte", async () => {
    await submitWebContentReport({
      expectedUserId: ids.userA,
      body,
      online: false,
      idempotencyKey: ids.reportA,
      createdAt: "2026-08-02T10:00:00.000Z",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          Response.json(
            {
              error: { code: "invalid_request", message: "cible invalide" },
            },
            { status: 422 },
          ),
        ),
      ),
    );
    const blocked = await synchronizeWebContentReports(ids.userA);
    if (blocked.rejectedHead === null) throw new Error("Expected rejection.");
    mocks.state.session = session(ids.userB);

    await expect(
      discardRejectedWebContentReport({
        expectedUserId: ids.userA,
        rejection: blocked.rejectedHead,
        online: false,
      }),
    ).rejects.toBeInstanceOf(WebContentReportSessionError);
    const inspector = accountStore(ids.userA);
    expect((await inspector.readContentReports()).rejection).toEqual(
      blocked.rejectedHead,
    );
    inspector.close();
  });
});
