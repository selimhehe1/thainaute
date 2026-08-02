import type {
  ContentReportRequest,
  ContentReportResponse,
} from "@thainaute/sync";

export interface ContentReportAccessTokenVerifier {
  verify(accessToken: string): Promise<{ readonly userId: string }>;
}

export interface SubmitContentReportCommand {
  readonly userId: string;
  readonly idempotencyKey: string;
  readonly requestSha256: string;
  readonly report: ContentReportRequest;
}

export type SubmitContentReportRepositoryResult =
  | ContentReportResponse
  | { readonly status: "idempotency_conflict" | "invalid_target" };

export interface ContentReportRepository {
  submit(
    command: SubmitContentReportCommand,
  ): Promise<SubmitContentReportRepositoryResult>;
}

export interface SubmitContentReportInput {
  readonly userId: string;
  readonly idempotencyKey: string;
  readonly report: ContentReportRequest;
}
