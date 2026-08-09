import { z } from "zod";

import catalogJson from "../data/catalog/authoring-lessons.v1.json";

const PUBLIC_METADATA_MARKDOWN_PATTERN =
  /(?:\*\*|__|`|!\[[^\]]*\]\(|\[[^\]]+\]\(|<[^>]+>)/u;
const INTERNAL_METADATA_PATTERN =
  /(?:titre de travail|note (?:interne|éditoriale)|contre-audit|finding\s|tmp-[a-z0-9-]+)/iu;

function publicMetadataSchema(maximumLength: number) {
  return z
    .string()
    .min(1)
    .max(maximumLength)
    .refine((value) => value === value.trim())
    .refine((value) => !PUBLIC_METADATA_MARKDOWN_PATTERN.test(value))
    .refine((value) => !INTERNAL_METADATA_PATTERN.test(value));
}

const plainObjectiveSchema = z
  .string()
  .min(1)
  .max(3_000)
  .refine((value) => value === value.trim())
  .refine((value) => !PUBLIC_METADATA_MARKDOWN_PATTERN.test(value));

const catalogEntrySchema = z
  .object({
    schemaVersion: z.literal(1),
    lessonId: z.string().regex(/^u\d{2}-l\d+[a-f]$/u),
    unitId: z.string().regex(/^u\d{2}$/u),
    unitNumber: z.number().int().positive(),
    lessonLetter: z.string().regex(/^[a-f]$/u),
    // Le titre peut apparaître dans la navigation : aucune note d'autorat ne
    // franchit ce contrat.
    titleFr: publicMetadataSchema(160),
    // L'objectif long reste un outil d'édition tant que la leçon est draft ;
    // la porte du paquet public applique le contrat plus strict.
    objectiveFr: plainObjectiveSchema,
    authoringStatus: z.enum([
      "draft",
      "review",
      "approved",
      "published",
      "unknown",
    ]),
    compiled: z.boolean(),
  })
  .strict();

export const authoringCatalogSchema = z
  .object({
    schemaVersion: z.literal(1),
    entries: z.array(catalogEntrySchema).min(1),
  })
  .strict();

export const authoringCatalog =
  authoringCatalogSchema.parse(catalogJson).entries;

export type AuthoringCatalogEntry = z.infer<typeof catalogEntrySchema>;

export function catalogByUnit(): ReadonlyMap<
  string,
  readonly AuthoringCatalogEntry[]
> {
  const byUnit = new Map<string, AuthoringCatalogEntry[]>();
  for (const entry of authoringCatalog) {
    const current = byUnit.get(entry.unitId) ?? [];
    current.push(entry);
    byUnit.set(entry.unitId, current);
  }
  return byUnit;
}
