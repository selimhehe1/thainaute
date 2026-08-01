import {
  publicLessonResponseSchema,
  publicLessonSchema,
  type PublicLessonResponse,
} from "@thainaute/content/public";

import { hashCanonical } from "../attempt-sync/canonical-json";
import type { VerifiedPublishedBundle } from "./verified-bundle";

function publicOptions(
  versionId: string,
  exerciseId: string,
  options: readonly { readonly id: string; readonly labelFr: string }[],
) {
  return [...options].sort((left, right) => {
    const leftOrder = hashCanonical("thainaute.public-option-order/v1", {
      versionId,
      exerciseId,
      optionId: left.id,
    });
    const rightOrder = hashCanonical("thainaute.public-option-order/v1", {
      versionId,
      exerciseId,
      optionId: right.id,
    });
    return leftOrder.localeCompare(rightOrder);
  });
}

/** Construit uniquement le DTO gratuit et expurge destine aux clients. */
export function toPublicLessonResponse(
  verified: VerifiedPublishedBundle,
): PublicLessonResponse | null {
  const { lesson, audioManifest } = verified.bundle;
  if (lesson.requiredEntitlement !== null || lesson.publishedAt === null) {
    return null;
  }

  const publicLessonResult = publicLessonSchema.safeParse({
    releaseId: verified.release.id,
    releaseVersion: verified.release.version,
    lessonId: lesson.lessonId,
    versionId: lesson.versionId,
    revision: lesson.revision,
    locale: lesson.locale,
    titleFr: lesson.titleFr,
    objectiveFr: lesson.objectiveFr,
    publishedAt: new Date(lesson.publishedAt).toISOString(),
    access: "free",
    exercises: lesson.exercises.map((exercise) => ({
      id: exercise.id,
      type: exercise.type,
      skill: exercise.skill,
      audioAssetId: exercise.audioAssetId,
      promptFr: exercise.promptFr,
      options: publicOptions(lesson.versionId, exercise.id, exercise.options),
    })),
    audioAssets: audioManifest.entries.map((entry) => ({
      assetId: entry.assetId,
      variant: entry.variant,
      mimeType: entry.mimeType,
      sha256: entry.sha256,
      byteLength: entry.byteLength,
      durationMs: entry.durationMs,
    })),
  });
  if (!publicLessonResult.success) return null;

  const contentSha256 = hashCanonical(
    "thainaute.public-lesson/v1",
    publicLessonResult.data,
  );
  return publicLessonResponseSchema.parse({
    schemaVersion: 1,
    contentSha256,
    lesson: publicLessonResult.data,
  });
}
