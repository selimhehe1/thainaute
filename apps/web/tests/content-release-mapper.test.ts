import { publicReleaseResponseSchema } from "@thainaute/content/public";
import { describe, expect, it } from "vitest";

import { toPublicReleaseResponse } from "../lib/server/content-delivery/mapper";
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

describe("manifeste public de release", () => {
  it("expose seulement un index gratuit, déterministe et hashé", () => {
    const first = toPublicReleaseResponse(verifiedRelease());
    const second = toPublicReleaseResponse(verifiedRelease());

    expect(first).not.toBeNull();
    expect(publicReleaseResponseSchema.safeParse(first).success).toBe(true);
    expect(second).toEqual(first);
    expect(first?.manifestSha256).toMatch(/^[0-9a-f]{64}$/u);
    expect(first?.release.releaseId).toBe(RELEASE_ID);
    expect(first?.release.lessons).toHaveLength(1);

    const serialized = JSON.stringify(first);
    for (const forbidden of [
      "correctOptionId",
      "feedback",
      "itemId",
      "canonicalPath",
      "distributionPaths",
      "sources",
      "provenance",
      "manifest_sha256",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it("ferme toute la release si une seule leçon est invalide", () => {
    const valid = makePublishedLessonRow(makePublishableBundle());
    const invalid = structuredClone(valid);
    invalid.payload.lesson.titleFr = "Altération après hash";

    expect(verifyPublishedReleaseRows([valid, invalid], RELEASE_ID)).toBeNull();
    expect(verifyPublishedReleaseRows([], RELEASE_ID)).toBeNull();
  });
});
