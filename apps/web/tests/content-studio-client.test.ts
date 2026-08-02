import { readFixtureBundle } from "@thainaute/content";
import { reviewContentBundle } from "@thainaute/content/studio";
import { describe, expect, it, vi } from "vitest";

import {
  ContentStudioClientError,
  requestFixtureContentReview,
} from "../lib/client/content-studio";

const ACCESS_TOKEN = "header.payload.editor-token";
const report = reviewContentBundle(readFixtureBundle());

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

describe("client HTTP du studio", () => {
  it("valide le rapport et envoie seulement le Bearer nécessaire", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse(report));

    await expect(
      requestFixtureContentReview({ accessToken: ACCESS_TOKEN, fetcher }),
    ).resolves.toEqual(report);
    expect(fetcher).toHaveBeenCalledWith(
      "/api/v1/studio/content/review",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
        redirect: "error",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("traduit les statuts sans refléter la réponse serveur", async () => {
    const cases = [
      [401, "session_expired"],
      [404, "access_denied"],
      [503, "unavailable"],
    ] as const;

    for (const [status, kind] of cases) {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          jsonResponse(
            { error: { message: `${ACCESS_TOKEN} editor@example.test` } },
            status,
          ),
        );
      const failure = await requestFixtureContentReview({
        accessToken: ACCESS_TOKEN,
        fetcher,
      }).catch((error: unknown) => error);

      expect(failure).toBeInstanceOf(ContentStudioClientError);
      expect(failure).toMatchObject({ kind });
      expect(String(failure)).not.toContain(ACCESS_TOKEN);
      expect(String(failure)).not.toContain("editor@example.test");
    }
  });

  it("refuse un token, un JSON ou un contrat incohérent avant affichage", async () => {
    const fetcher = vi.fn<typeof fetch>();
    await expect(
      requestFixtureContentReview({
        accessToken: "token avec espace",
        fetcher,
      }),
    ).rejects.toMatchObject({ kind: "session_expired" });
    expect(fetcher).not.toHaveBeenCalled();

    fetcher.mockResolvedValueOnce(new Response("pas du JSON", { status: 200 }));
    await expect(
      requestFixtureContentReview({ accessToken: ACCESS_TOKEN, fetcher }),
    ).rejects.toMatchObject({ kind: "unavailable" });

    fetcher.mockResolvedValueOnce(
      jsonResponse({ ...report, correctOptionId: "ne-doit-pas-sortir" }),
    );
    await expect(
      requestFixtureContentReview({ accessToken: ACCESS_TOKEN, fetcher }),
    ).rejects.toMatchObject({ kind: "unavailable" });
  });

  it("borne une réponse déclarée trop grande", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("{}", {
        status: 200,
        headers: { "Content-Length": String(256 * 1_024 + 1) },
      }),
    );

    await expect(
      requestFixtureContentReview({ accessToken: ACCESS_TOKEN, fetcher }),
    ).rejects.toMatchObject({ kind: "unavailable" });
  });

  it("interrompt le flux dès qu’une réponse non déclarée dépasse la borne", async () => {
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(200 * 1_024));
        controller.enqueue(new Uint8Array(60 * 1_024));
      },
      cancel() {
        cancelled = true;
      },
    });
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(stream, { status: 200 }));

    await expect(
      requestFixtureContentReview({ accessToken: ACCESS_TOKEN, fetcher }),
    ).rejects.toMatchObject({ kind: "unavailable" });
    expect(cancelled).toBe(true);
  });

  it("annule une requête qui dépasse la borne client", async () => {
    let observedSignal: AbortSignal | undefined;
    const fetcher = vi.fn<typeof fetch>((_input, init) => {
      observedSignal = init?.signal as AbortSignal | undefined;
      return new Promise<Response>((_resolve, reject) => {
        observedSignal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    });

    await expect(
      requestFixtureContentReview({
        accessToken: ACCESS_TOKEN,
        fetcher,
        timeoutMs: 5,
      }),
    ).rejects.toMatchObject({ kind: "unavailable" });
    expect(observedSignal?.aborted).toBe(true);
  });
});
