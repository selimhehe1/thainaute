import type { VerifiedPublishedBundle } from "./verified-bundle";

export interface PublishedLessonRepository {
  loadPublishedBundle(
    versionId: string,
  ): Promise<VerifiedPublishedBundle | null>;
}
