import type {
  VerifiedPublishedBundle,
  VerifiedPublishedRelease,
} from "./verified-bundle";

export interface PublishedLessonRepository {
  loadPublishedBundle(
    versionId: string,
  ): Promise<VerifiedPublishedBundle | null>;
}

export interface PublishedReleaseRepository {
  loadPublishedRelease(
    releaseId: string,
  ): Promise<VerifiedPublishedRelease | null>;
}

export interface PublishedAudioObjectStore {
  download(input: {
    readonly bucket: string;
    readonly objectPath: string;
  }): Promise<Blob | null>;
}
