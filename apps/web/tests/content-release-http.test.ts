import { publicReleaseResponseSchema } from "@thainaute/content/public";
import { describe, expect, it, vi } from "vitest";

import {
  ContentInfrastructureError,
  ContentIntegrityError,
} from "../lib/server/content-delivery/errors";
import { createPublishedReleaseHttpHandler } from "../lib/server/content-delivery/http";
import { verifyPublishedReleaseRows } from "../lib/server/content-delivery/verified-bundle";
import {
  RELEASE_ID,
  makePublishableBundle,
  makePublishedLessonRow,
} from "./content-delivery-test-data";

function verifiedRelease() {
  const verified = verifyPublishedReleaseRows(
    [makePublishedLessonRow(makePublishableBundle())],
    RELEASE_ID,
  );
  if (verified === null) throw new Error("Release publiée de test invalide.");
  return verified;
}

function dependencies() {
  return {
    repository: {
      loadPublishedRelease: vi.fn(async () => verifiedRelease()),
    },
    requestIdFactory: () => "release-request-1",
    reportOperationalFailure: vi.fn(),
  };
}

function request(headers?: HeadersInit): Request {
  return new Request("http://localhost/api/v1/content/releases/current", {
    ...(headers === undefined ? {} : { headers }),
  });
}

describe("transport HTTP du manifeste public", () => {
  it("sert le manifeste puis le revalide par ETag", async () => {
    const handler = createPublishedReleaseHttpHandler(dependencies());
    const first = await handler(request(), RELEASE_ID);
    const etag = first.headers.get("etag");

    expect(first.status).toBe(200);
    expect(etag).toMatch(/^"sha256-[0-9a-f]{64}"$/u);
    expect(
      publicReleaseResponseSchema.safeParse(await first.json()).success,
    ).toBe(true);

    const second = await handler(
      request({ "If-None-Match": etag ?? "" }),
      RELEASE_ID,
    );
    expect(second.status).toBe(304);
    expect(second.headers.get("etag")).toBe(etag);
    expect(await second.text()).toBe("");
  });

  it("refuse un identifiant invalide sans lire le dépôt", async () => {
    const deps = dependencies();
    const handler = createPublishedReleaseHttpHandler(deps);
    expect((await handler(request(), "invalid")).status).toBe(400);
    expect(deps.repository.loadPublishedRelease).not.toHaveBeenCalled();
  });

  it("masque une release corrompue et une panne amont", async () => {
    const integrityDeps = dependencies();
    integrityDeps.repository.loadPublishedRelease.mockRejectedValueOnce(
      new ContentIntegrityError(),
    );
    const integrity = await createPublishedReleaseHttpHandler(integrityDeps)(
      request(),
      RELEASE_ID,
    );
    expect(integrity.status).toBe(404);
    expect(integrityDeps.reportOperationalFailure).toHaveBeenCalledWith({
      operation: "published_release_read",
      errorKind: "content_integrity_failed",
      requestId: "release-request-1",
    });

    const outageDeps = dependencies();
    outageDeps.repository.loadPublishedRelease.mockRejectedValueOnce(
      new ContentInfrastructureError(),
    );
    const outage = await createPublishedReleaseHttpHandler(outageDeps)(
      request(),
      RELEASE_ID,
    );
    expect(outage.status).toBe(503);
    expect(JSON.stringify(await outage.json())).not.toContain("Supabase");
  });
});
