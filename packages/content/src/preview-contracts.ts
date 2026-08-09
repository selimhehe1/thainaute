import { z } from "zod";

import { lessonSchema } from "./schemas";

const previewTeachingPageSchema = z
  .object({
    ordre: z.number().int().positive(),
    titleFr: z.string().min(1).max(160),
    bodyFr: z.string().min(1).max(2_400),
    specimen: z.string().min(1).max(512).nullable(),
  })
  .strict();

/** Contrat client de l'aperçu ; il n'importe aucun registre ni accès disque. */
export const editorLessonPreviewPayloadSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("compiled"),
    lesson: lessonSchema,
    audioSources: z.record(z.string(), z.string().startsWith("/")),
  }),
  z.strictObject({
    kind: z.literal("draft"),
    draft: z
      .object({
        schemaVersion: z.literal(1),
        lessonId: z.string().regex(/^u\d{2}-l\d+[a-f]$/u),
        versionId: z.string().min(1).max(120),
        revision: z.literal(1),
        workflowStatus: z.literal("draft"),
        visibility: z.literal("internal"),
        locale: z.literal("fr-FR"),
        titleFr: z.string().min(1).max(1_000),
        objectiveFr: z.string().min(1).max(3_000),
        sourceFile: z.string().min(1).max(300),
        sourceIds: z.array(z.string().min(1).max(120)).max(100),
        authoringStatus: z.enum([
          "draft",
          "review",
          "approved",
          "published",
          "unknown",
        ]),
        teaching: z.array(previewTeachingPageSchema).min(1).max(40),
        blockers: z
          .array(
            z
              .object({
                code: z.literal("EXERCISES_NOT_COMPILED"),
                summaryFr: z.string().min(1).max(500),
              })
              .strict(),
          )
          .min(1)
          .max(8),
      })
      .strict(),
  }),
]);

export type EditorLessonPreviewPayload = z.infer<
  typeof editorLessonPreviewPayloadSchema
>;

export type EditorLessonPreviewDraft = Extract<
  EditorLessonPreviewPayload,
  { kind: "draft" }
>["draft"];
