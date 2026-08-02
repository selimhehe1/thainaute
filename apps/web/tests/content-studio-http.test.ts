import { readFixtureBundle } from "@thainaute/content";
import {
  reviewContentBundle,
  type ContentReviewResponse,
} from "@thainaute/content/studio";
import { describe, expect, it, vi } from "vitest";

import { ContentStudioError } from "../lib/server/content-studio/errors";
import {
  createContentStudioHttpHandler,
  hiddenContentStudioResponse,
} from "../lib/server/content-studio/http";

const REQUEST_ID = "10000000-0000-4000-8000-000000000001";
const ACCESS_TOKEN = "header.payload.sensitive-token";
const REPORT = reviewContentBundle(readFixtureBundle());

function request(authorization = `Bearer ${ACCESS_TOKEN}`): Request {
  return new Request("https://thainaute.example/api/v1/studio/content/review", {
    headers: authorization === "" ? {} : { Authorization: authorization },
  });
}

function dependencies() {
  return {
    authorizer: { authorize: vi.fn().mockResolvedValue(undefined) },
    reviewFixture: vi.fn(() => REPORT),
    requestIdFactory: () => REQUEST_ID,
  };
}

describe("GET /api/v1/studio/content/review", () => {
  it("retourne uniquement le rapport avec des headers privés", async () => {
    const deps = dependencies();
    const response = await createContentStudioHttpHandler(deps)(request());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0",
    );
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(response.headers.get("vary")).toBe("Authorization");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.get("x-request-id")).toBe(REQUEST_ID);
    await expect(response.json()).resolves.toEqual(REPORT);
    expect(deps.authorizer.authorize).toHaveBeenCalledWith({
      accessToken: ACCESS_TOKEN,
      signal: expect.any(AbortSignal),
    });

    const serialized = JSON.stringify(REPORT);
    expect(serialized).not.toContain("correctOptionId");
    expect(serialized).not.toContain('"email"');
    expect(serialized).not.toContain('"token"');
    expect(serialized).not.toContain("20000000-0000-4000-8000-000000000001");
    expect(serialized).not.toContain("selim@example.test");
    expect(serialized).not.toContain(ACCESS_TOKEN);
  });

  it.each([
    "",
    ACCESS_TOKEN,
    `bearer ${ACCESS_TOKEN}`,
    `Bearer  ${ACCESS_TOKEN}`,
    `Bearer ${ACCESS_TOKEN} extra`,
  ])("refuse le Bearer non strict %#", async (authorization) => {
    const deps = dependencies();
    const response = await createContentStudioHttpHandler(deps)(
      request(authorization),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe("Bearer");
    expect(deps.authorizer.authorize).not.toHaveBeenCalled();
    expect(deps.reviewFixture).not.toHaveBeenCalled();
  });

  it("masque l'absence de rôle comme une route absente", async () => {
    const deps = dependencies();
    deps.authorizer.authorize.mockRejectedValueOnce(
      new ContentStudioError("not_found"),
    );
    const denied = await createContentStudioHttpHandler(deps)(request());
    const disabled = hiddenContentStudioResponse();
    const deniedBody: unknown = await denied.json();
    const disabledBody: unknown = await disabled.json();

    expect(denied.status).toBe(404);
    expect(disabled.status).toBe(404);
    expect(deniedBody).toMatchObject({
      error: { code: "not_found", message: "Ressource introuvable." },
    });
    expect(disabledBody).toMatchObject({
      error: { code: "not_found", message: "Ressource introuvable." },
    });
    expect(deps.reviewFixture).not.toHaveBeenCalled();
  });

  it("retourne 503 quand Auth est indisponible", async () => {
    const deps = dependencies();
    deps.authorizer.authorize.mockRejectedValueOnce(
      new ContentStudioError("auth_unavailable"),
    );
    const response = await createContentStudioHttpHandler(deps)(request());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "auth_unavailable" },
    });
    expect(deps.reviewFixture).not.toHaveBeenCalled();
  });

  it("borne Auth même si l'adaptateur ignore le signal", async () => {
    let authorizationSignal: AbortSignal | undefined;
    const deps = dependencies();
    deps.authorizer.authorize.mockImplementationOnce(({ signal }) => {
      authorizationSignal = signal;
      return new Promise(() => undefined);
    });
    const response = await createContentStudioHttpHandler({
      ...deps,
      timeoutMs: 5,
    })(request());

    expect(response.status).toBe(503);
    expect(authorizationSignal?.aborted).toBe(true);
    expect(deps.reviewFixture).not.toHaveBeenCalled();
  });

  it("ne fuit ni Bearer ni détail interne sur une panne du rapport", async () => {
    const deps = dependencies();
    deps.reviewFixture.mockImplementationOnce(() => {
      throw new Error(
        `${ACCESS_TOKEN} correctOptionId=secret-answer thaiRaw=secret-thai`,
      );
    });
    const response = await createContentStudioHttpHandler(deps)(request());
    const serialized = await response.text();

    expect(response.status).toBe(503);
    expect(serialized).not.toContain(ACCESS_TOKEN);
    expect(serialized).not.toContain("secret-answer");
    expect(serialized).not.toContain("secret-thai");
  });

  it("ferme un rapport injecté invalide sans en refléter les valeurs", async () => {
    const leakedValue = `${ACCESS_TOKEN}:selim@example.test:correctOptionId`;
    const response = await createContentStudioHttpHandler({
      authorizer: { authorize: vi.fn().mockResolvedValue(undefined) },
      reviewFixture: () =>
        ({ schemaVersion: 1, leakedValue }) as unknown as ContentReviewResponse,
      requestIdFactory: () => REQUEST_ID,
    })(request());
    const serialized = await response.text();

    expect(response.status).toBe(503);
    expect(serialized).not.toContain(leakedValue);
    expect(serialized).not.toContain(ACCESS_TOKEN);
    expect(serialized).not.toContain("selim@example.test");
    expect(serialized).not.toContain("correctOptionId");
  });
});
