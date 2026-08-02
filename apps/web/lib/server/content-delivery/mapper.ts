import {
  publicLessonResponseSchema,
  publicLessonSchema,
  publicReleaseResponseSchema,
  publicReleaseSchema,
  type PublicLessonResponse,
  type PublicReleaseResponse,
} from "@thainaute/content/public";

import { hashCanonical } from "../attempt-sync/canonical-json";
import type {
  VerifiedPublishedBundle,
  VerifiedPublishedRelease,
} from "./verified-bundle";

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

/** Construit un manifeste technique sans inventer de curriculum ni d'unité. */
export function toPublicReleaseResponse(
  verified: VerifiedPublishedRelease,
): PublicReleaseResponse | null {
  const lessons = verified.lessons
    .map(toPublicLessonResponse)
    .sort((left, right) => {
      if (left === null || right === null) return 0;
      const lessonOrder = left.lesson.lessonId.localeCompare(
        right.lesson.lessonId,
      );
      return lessonOrder === 0
        ? left.lesson.versionId.localeCompare(right.lesson.versionId)
        : lessonOrder;
    });
  if (lessons.some((lesson) => lesson === null)) return null;

  const releaseResult = publicReleaseSchema.safeParse({
    releaseId: verified.release.id,
    releaseVersion: verified.release.version,
    publishedAt: verified.release.publishedAt,
    lessons: lessons.map((response) => {
      if (response === null) throw new Error("Leçon publique absente.");
      return {
        lessonId: response.lesson.lessonId,
        versionId: response.lesson.versionId,
        revision: response.lesson.revision,
        titleFr: response.lesson.titleFr,
        objectiveFr: response.lesson.objectiveFr,
        access: response.lesson.access,
        contentSha256: response.contentSha256,
      };
    }),
  });
  if (!releaseResult.success) return null;

  return publicReleaseResponseSchema.parse({
    schemaVersion: 1,
    manifestSha256: hashCanonical(
      "thainaute.public-release/v1",
      releaseResult.data,
    ),
    release: releaseResult.data,
  });
}
