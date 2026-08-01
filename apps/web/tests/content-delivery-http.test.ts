import { publicLessonResponseSchema } from "@thainaute/content/public";
import { describe, expect, it, vi } from "vitest";

import {
  ContentInfrastructureError,
  ContentIntegrityError,
} from "../lib/server/content-delivery/errors";
import { createPublishedLessonHttpHandler } from "../lib/server/content-delivery/http";
import { verifyPublishedBundleRow } from "../lib/server/content-delivery/verified-bundle";
import {
  makePublishableBundle,
  makePublishedLessonRow,
} from "./content-delivery-test-data";

const VERSION_ID = "10000000-0000-4000-8000-000000000002";

function verifiedBundle() {
  const verified = verifyPublishedBundleRow(
    makePublishedLessonRow(makePublishableBundle()),
  );
  if (verified === null) throw new Error("Bundle publie de test invalide.");
  return verified;
}

function dependencies() {
  return {
    repository: {
      loadPublishedBundle: vi.fn(
        async () =>
          verifiedBundle() as ReturnType<typeof verifiedBundle> | null,
      ),
    },
    requestIdFactory: () => "content-request-1",
    reportOperationalFailure: vi.fn(),
  };
}

function request(headers?: HeadersInit): Request {
  return new Request(
    `http://localhost/api/v1/content/lessons/${VERSION_ID}`,
    headers === undefined ? {} : { headers },
  );
}

describe("transport HTTP du contenu publie", () => {
  it("sert un DTO revocable avec un ETag fort puis repond 304", async () => {
    const handler = createPublishedLessonHttpHandler(dependencies());
    const first = await handler(request(), VERSION_ID);
    const etag = first.headers.get("etag");

    expect(first.status).toBe(200);
    expect(etag).toMatch(/^"sha256-[0-9a-f]{64}"$/u);
    expect(first.headers.get("cache-control")).toContain("s-maxage=300");
    expect(first.headers.get("cache-control")).toContain("must-revalidate");
    expect(first.headers.get("cache-control")).not.toContain("immutable");
    expect(
      publicLessonResponseSchema.safeParse(await first.json()).success,
    ).toBe(true);

    const second = await handler(
      request({ "If-None-Match": etag ?? "" }),
      VERSION_ID,
    );
    expect(second.status).toBe(304);
    expect(second.headers.get("etag")).toBe(etag);
    expect(second.headers.get("cache-control")).toBe(
      first.headers.get("cache-control"),
    );
    expect(second.headers.get("x-content-type-options")).toBe("nosniff");
    expect(second.headers.get("www-authenticate")).toBeNull();
    expect(await second.text()).toBe("");
  });

  it("ferme les identifiants invalides et les contenus absents", async () => {
    const deps = dependencies();
    const handler = createPublishedLessonHttpHandler(deps);
    const invalid = await handler(request(), "not-a-uuid");
    expect(invalid.status).toBe(400);
    expect(deps.repository.loadPublishedBundle).not.toHaveBeenCalled();

    deps.repository.loadPublishedBundle.mockResolvedValueOnce(null);
    const missing = await handler(request(), VERSION_ID);
    expect(missing.status).toBe(404);
    expect(missing.headers.get("cache-control")).toContain("no-store");
  });

  it("retourne 404 pour le premium sans varier selon l'authentification", async () => {
    const premium = verifiedBundle();
    premium.bundle.lesson.requiredEntitlement = "premium";
    const deps = dependencies();
    deps.repository.loadPublishedBundle.mockResolvedValueOnce(premium);
    const handler = createPublishedLessonHttpHandler(deps);

    const response = await handler(
      request({ Authorization: "Bearer jeton-ignore" }),
      VERSION_ID,
    );
    expect(response.status).toBe(404);
  });

  it("ne revele pas une exception Supabase", async () => {
    const deps = dependencies();
    deps.repository.loadPublishedBundle.mockRejectedValueOnce(
      new Error("SUPABASE_SECRET_KEY=secret-content"),
    );
    const handler = createPublishedLessonHttpHandler(deps);
    const response = await handler(request(), VERSION_ID);
    const serialized = JSON.stringify(await response.json());

    expect(response.status).toBe(503);
    expect(serialized).not.toContain("secret-content");
    expect(deps.reportOperationalFailure).toHaveBeenCalledWith({
      operation: "published_lesson_read",
      errorKind: "content_unavailable",
      requestId: "content-request-1",
    });
  });

  it("traduit une panne fermee du repository en 503", async () => {
    const deps = dependencies();
    deps.repository.loadPublishedBundle.mockRejectedValueOnce(
      new ContentInfrastructureError(),
    );
    const handler = createPublishedLessonHttpHandler(deps);
    expect((await handler(request(), VERSION_ID)).status).toBe(503);
  });

  it("masque un bundle corrompu en 404 et le signale sans donnee metier", async () => {
    const deps = dependencies();
    deps.repository.loadPublishedBundle.mockRejectedValueOnce(
      new ContentIntegrityError(),
    );
    const handler = createPublishedLessonHttpHandler(deps);
    const response = await handler(request(), VERSION_ID);

    expect(response.status).toBe(404);
    expect(deps.reportOperationalFailure).toHaveBeenCalledWith({
      operation: "published_lesson_read",
      errorKind: "content_integrity_failed",
      requestId: "content-request-1",
    });
  });
});
