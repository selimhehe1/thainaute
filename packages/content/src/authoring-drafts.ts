import { z } from "zod";

import draftsJson from "../data/drafts/authoring-drafts.v1.json";

const authoringDraftTeachingPageSchema = z
  .object({
    ordre: z.number().int().positive(),
    titleFr: z.string().min(1).max(160),
    bodyFr: z.string().min(1).max(2400),
    specimen: z.string().min(1).max(512).nullable(),
  })
  .strict();

const authoringDraftBlockerSchema = z
  .object({
    code: z.literal("EXERCISES_NOT_COMPILED"),
    summaryFr: z.string().min(1).max(500),
  })
  .strict();

export const authoringDraftSchema = z
  .object({
    schemaVersion: z.literal(1),
    lessonId: z.string().regex(/^u\d{2}-l\d+[a-f]$/u),
    versionId: z.string().min(1).max(120),
    revision: z.literal(1),
    workflowStatus: z.literal("draft"),
    visibility: z.literal("internal"),
    locale: z.literal("fr-FR"),
    titleFr: z.string().min(1).max(1000),
    objectiveFr: z.string().min(1).max(3000),
    sourceFile: z.string().min(1).max(300),
    sourceIds: z.array(z.string().min(1).max(120)).max(100),
    authoringStatus: z.enum([
      "draft",
      "review",
      "approved",
      "published",
      "unknown",
    ]),
    teaching: z.array(authoringDraftTeachingPageSchema).min(1).max(40),
    blockers: z.array(authoringDraftBlockerSchema).min(1).max(8),
  })
  .strict();

export const authoringDraftIndexSchema = z
  .object({
    schemaVersion: z.literal(1),
    entries: z.array(authoringDraftSchema),
  })
  .strict();

const authoringDraftIndex = authoringDraftIndexSchema.parse(draftsJson);

export const authoringDrafts = authoringDraftIndex.entries;

export type AuthoringDraft = z.infer<typeof authoringDraftSchema>;

export function authoringDraftIds(): string[] {
  return authoringDrafts.map(({ lessonId }) => lessonId);
}

export function readAuthoringDraft(lessonId: string): AuthoringDraft | null {
  return authoringDrafts.find((draft) => draft.lessonId === lessonId) ?? null;
}
