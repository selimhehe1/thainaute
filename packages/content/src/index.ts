export {
  assertPublishable,
  getPublicationBlockers,
  publicationBlockerSchema,
} from "./audit";
export {
  compiledLessonIds,
  publicAudioSources,
  readCompiledLessonBundle,
  readFiveMechanicsFixtureBundle,
  readFixtureBundle,
  readUnite01Lecon1aBundle,
  validateBundle,
} from "./repository";
export {
  assertAucuneFabrication,
  graphiesFabriquees,
  type GraphieFabriquee,
} from "./anti-fabrication";
export {
  auditDimensionSchema,
  auditStatusSchema,
  contentBundleSchema,
  contentVisibilitySchema,
  // Exporté pour le compilateur d'autorat, qui valide item par item avant
  // qu'une leçon complète existe.
  itemSchema,
  lessonSchema,
  sourceSchema,
  workflowStatusSchema,
} from "./schemas";
export {
  CONTENT_REVIEW_MAX_ISSUES,
  CONTENT_REVIEW_MAX_SUMMARY_ENTRIES,
  contentReviewIssueSchema,
  contentReviewRequestSchema,
  contentReviewResponseSchema,
  contentReviewSummarySchema,
  reviewContentBundle,
} from "./studio";
export { validateBundleMetadata } from "./validation";
export type { PublicationBlocker } from "./audit";
export type {
  AssociationExercise,
  AudioChoiceExercise,
  AudioManifest,
  ContentBundle,
  ContentSource,
  Lesson,
  LessonExercise,
  ReadingExercise,
  RecallExercise,
  WordOrderExercise,
} from "./schemas";
export type {
  ContentReviewIssue,
  ContentReviewRequest,
  ContentReviewResponse,
  ContentReviewSummary,
} from "./studio";
