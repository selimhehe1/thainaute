import {
  contentReportRequestSchema,
  contentReportResponseSchema,
  type ContentReportResponse,
} from "@thainaute/sync";

import { hashCanonical } from "../attempt-sync/canonical-json";
import {
  ContentReportApiError,
  ContentReportInfrastructureError,
} from "./errors";
import type {
  ContentReportRepository,
  SubmitContentReportInput,
} from "./ports";

export function hashContentReport(report: unknown): string {
  return hashCanonical(
    "thainaute.content-report/v1:/api/v1/content/reports",
    report,
  );
}

export function createContentReportSubmitter(
  repository: ContentReportRepository,
) {
  return async function submitContentReport(
    input: SubmitContentReportInput,
  ): Promise<ContentReportResponse> {
    const reportResult = contentReportRequestSchema.safeParse(input.report);
    if (!reportResult.success) {
      throw new ContentReportApiError("invalid_request");
    }

    let result;
    try {
      result = await repository.submit({
        ...input,
        report: reportResult.data,
        requestSha256: hashContentReport(reportResult.data),
      });
    } catch (error) {
      if (error instanceof ContentReportInfrastructureError) throw error;
      throw new ContentReportInfrastructureError("database_unavailable");
    }

    if (result.status === "idempotency_conflict") {
      throw new ContentReportApiError("idempotency_key_reused");
    }
    if (result.status === "invalid_target") {
      throw new ContentReportApiError("invalid_request");
    }
    const response = contentReportResponseSchema.safeParse(result);
    if (!response.success) {
      throw new ContentReportInfrastructureError("database_unavailable");
    }
    return response.data;
  };
}
