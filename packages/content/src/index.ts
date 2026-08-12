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
  validateBundleAudioFiles,
} from "./repository";
export {
  authoringCatalog,
  authoringCatalogSchema,
  catalogByUnit,
} from "./catalog";
export {
  authoringDraftIds,
  authoringDraftSchema,
  authoringDrafts,
  authoringDraftIndexSchema,
  readAuthoringDraft,
} from "./authoring-drafts";
export {
  authoringCompiledLessonIds,
  readAuthoringCompiledLessonBundle,
} from "./authoring-compiled";
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
export {
  validateBundleAudioReferences,
  validateBundleMetadata,
  validateBundleStructureMetadata,
} from "./validation";
export { targetTextOf } from "./target-text";
export type { TargetTextCarrier } from "./target-text";
export {
  DEFAULT_LANGUAGE_PACK_ID,
  LANGUAGE_PACK_ENV,
  LANGUAGE_PACK_IDS,
  getLanguagePack,
  getLanguagePackFromEnvironment,
  requireLanguagePack,
  thaiFrLanguagePack,
} from "./language-packs";
export type {
  LanguagePack,
  LanguagePackId,
  TargetFontFamily,
  TargetScript,
} from "./language-packs";
export type { PublicationBlocker } from "./audit";
export type { AuthoringCatalogEntry } from "./catalog";
export type { AuthoringDraft } from "./authoring-drafts";
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
export * from "./signatures";
