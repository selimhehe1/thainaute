import type { ContentReviewResponse } from "@thainaute/content/studio";
import type { ContentReportAggregate } from "@thainaute/sync";

export interface ContentStudioAuthorizer {
  readonly authorize: (input: {
    readonly accessToken: string;
    readonly signal: AbortSignal;
  }) => Promise<void>;
}

export type ContentStudioFixtureReviewer = () => ContentReviewResponse;

export interface ContentStudioReportAggregateReader {
  read(input: {
    readonly contentVersionId: string;
    readonly signal: AbortSignal;
  }): Promise<ContentReportAggregate>;
}
