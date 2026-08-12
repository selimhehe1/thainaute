import { describe, expect, it, vi } from "vitest";

import { PREWARMED_ROUTES, prewarmRoutes } from "../e2e/prewarm";

const ORIGIN = "http://127.0.0.1:3000";

function noSleep(): Promise<void> {
  return Promise.resolve();
}

describe("prewarmRoutes", () => {
  it("demande chaque route une fois quand le serveur répond", async () => {
    const fetchImpl = vi.fn<typeof fetch>(
      async () => new Response(null, { status: 200 }),
    );
    const warmed = await prewarmRoutes({
      origin: ORIGIN,
      routes: ["/", "/today"],
      fetchImpl,
      sleep: noSleep,
    });

    expect(warmed).toStrictEqual(["/", "/today"]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(String(fetchImpl.mock.calls[0]?.[0])).toBe(`${ORIGIN}/`);
    expect(String(fetchImpl.mock.calls[1]?.[0])).toBe(`${ORIGIN}/today`);
  });

  it("préchauffe une route qui répond en erreur, la compilation ayant eu lieu", async () => {
    const fetchImpl = vi.fn<typeof fetch>(
      async () => new Response(null, { status: 503 }),
    );
    await expect(
      prewarmRoutes({
        origin: ORIGIN,
        routes: ["/learn/connected"],
        fetchImpl,
        sleep: noSleep,
      }),
    ).resolves.toStrictEqual(["/learn/connected"]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("réessaie tant que le serveur n'écoute pas encore", async () => {
    let calls = 0;
    const fetchImpl = vi.fn<typeof fetch>(async () => {
      calls += 1;
      if (calls < 3) throw new Error("ECONNREFUSED");
      return new Response(null, { status: 200 });
    });

    await expect(
      prewarmRoutes({
        origin: ORIGIN,
        routes: ["/"],
        fetchImpl,
        sleep: noSleep,
      }),
    ).resolves.toStrictEqual(["/"]);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("échoue franchement au bout du budget plutôt que de laisser la course", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => {
      throw new Error("ECONNREFUSED");
    });

    await expect(
      prewarmRoutes({
        origin: ORIGIN,
        routes: ["/"],
        fetchImpl,
        timeoutMs: 0,
        sleep: noSleep,
      }),
    ).rejects.toThrow(/Préchauffage abandonné sur \//u);
  });

  it("ne suit pas les redirections, pour ne préchauffer que ce qui est demandé", async () => {
    const fetchImpl = vi.fn<typeof fetch>(
      async () => new Response(null, { status: 200 }),
    );
    await prewarmRoutes({
      origin: ORIGIN,
      routes: ["/"],
      fetchImpl,
      sleep: noSleep,
    });
    expect(fetchImpl.mock.calls[0]?.[1]).toStrictEqual({ redirect: "manual" });
  });

  it("couvre les routes que les spécifications visitent réellement", () => {
    for (const route of [
      "/",
      "/today",
      "/path",
      "/account",
      "/learn/connected",
    ])
      expect(PREWARMED_ROUTES).toContain(route);
  });
});
