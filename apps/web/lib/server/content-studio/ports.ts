import type { ContentReviewResponse } from "@thainaute/content/studio";

export interface ContentStudioAuthorizer {
  readonly authorize: (input: {
    readonly accessToken: string;
    readonly signal: AbortSignal;
  }) => Promise<void>;
}

export type ContentStudioFixtureReviewer = () => ContentReviewResponse;
