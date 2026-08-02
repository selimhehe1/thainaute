import { contentReviewResponseSchema } from "@thainaute/content/studio";
import { contentReportAggregateSchema } from "@thainaute/sync";
import { z } from "zod";

export const EMPTY_CONTENT_REPORT_AGGREGATE = {
  total: 0,
  byCategory: {
    orthography: 0,
    meaning: 0,
    pronunciation: 0,
    tone: 0,
    vowel_length: 0,
    register: 0,
    naturalness: 0,
    audio: 0,
  },
} as const;

export const contentStudioReviewEnvelopeSchema = z.strictObject({
  review: contentReviewResponseSchema,
  userReports: contentReportAggregateSchema,
});

export type ContentStudioReviewEnvelope = z.infer<
  typeof contentStudioReviewEnvelopeSchema
>;
