import {
  contentBundleSchema,
  getPublicationBlockers,
  validateBundleMetadata,
  type ContentBundle,
} from "@thainaute/content";
import { z } from "zod";

import { hashCanonical } from "../attempt-sync/canonical-json";

const publishedReleaseSchema = z.strictObject({
  id: z.uuid(),
  version: z.number().int().positive(),
  status: z.literal("published"),
  published_at: z.string().datetime({ offset: true }),
});

const releaseRelationSchema = z.union([
  publishedReleaseSchema,
  z.array(publishedReleaseSchema).length(1),
]);

const publishedLessonRowSchema = z.strictObject({
  id: z.uuid(),
  lesson_id: z.uuid(),
  version: z.number().int().positive(),
  release_id: z.uuid(),
  status: z.literal("published"),
  title_fr: z.string().min(1).max(160),
  payload: z.unknown(),
  payload_sha256: z.string().regex(/^[0-9a-f]{64}$/u),
  published_at: z.string().datetime({ offset: true }),
  content_releases: releaseRelationSchema,
});

export interface VerifiedPublishedBundle {
  readonly bundle: ContentBundle;
  readonly release: {
    readonly id: string;
    readonly version: number;
    readonly publishedAt: string;
  };
}

function normalizeTimestamp(value: string): string {
  return new Date(value).toISOString();
}

/**
 * Porte unique entre un payload editorial brut et les usages serveur publies.
 * Toute incoherence echoue fermee sans exposer le motif au client.
 */
export function verifyPublishedBundleRow(
  value: unknown,
): VerifiedPublishedBundle | null {
  const rowResult = publishedLessonRowSchema.safeParse(value);
  if (!rowResult.success) return null;
  const row = rowResult.data;
  const release = Array.isArray(row.content_releases)
    ? row.content_releases[0]
    : row.content_releases;
  if (release === undefined || release.id !== row.release_id) return null;

  if (
    hashCanonical("thainaute.content-bundle/v1", row.payload) !==
    row.payload_sha256
  ) {
    return null;
  }

  const bundleResult = contentBundleSchema.safeParse(row.payload);
  if (!bundleResult.success) return null;
  const bundle = bundleResult.data;
  const { lesson } = bundle;

  try {
    validateBundleMetadata(bundle);
  } catch {
    return null;
  }

  if (
    lesson.versionId !== row.id ||
    lesson.lessonId !== row.lesson_id ||
    lesson.revision !== row.version ||
    lesson.titleFr !== row.title_fr ||
    lesson.workflowStatus !== "published" ||
    lesson.visibility !== "public" ||
    lesson.publishedAt === null ||
    normalizeTimestamp(lesson.publishedAt) !==
      normalizeTimestamp(row.published_at) ||
    getPublicationBlockers(bundle).length > 0
  ) {
    return null;
  }

  return {
    bundle,
    release: {
      id: release.id.toLowerCase(),
      version: release.version,
      publishedAt: normalizeTimestamp(release.published_at),
    },
  };
}

export function verifyPublishedBundleRows(
  value: unknown,
): VerifiedPublishedBundle[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    const verified = verifyPublishedBundleRow(row);
    return verified === null ? [] : [verified];
  });
}
