import { healthJson } from "@/lib/server/health";
import { assessReadiness } from "@/lib/server/health-readiness";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const assessment = await assessReadiness();
  const { diagnostic } = assessment;

  return healthJson(
    {
      status: assessment.ready ? "ok" : "error",
      release: diagnostic.release,
      checks: {
        publicOrigin: {
          status: diagnostic.publicOrigin === null ? "error" : "ok",
        },
        indexing: {
          status: diagnostic.issues.includes("public_indexing_invalid")
            ? "error"
            : "ok",
          enabled: diagnostic.publicIndexing,
        },
        sync: {
          status: diagnostic.issues.some((issue) =>
            [
              "sync_mode_invalid",
              "supabase_config_missing",
              "sync_release_config_missing",
            ].includes(issue),
          )
            ? "error"
            : "ok",
          mode: diagnostic.syncMode,
        },
        contentReport: {
          status: diagnostic.issues.some((issue) =>
            [
              "content_report_config_missing",
              "content_report_mode_invalid",
              "content_report_rate_limit_missing",
              "content_report_sync_required",
            ].includes(issue),
          )
            ? "error"
            : "ok",
          mode: diagnostic.contentReportMode,
        },
        publicContent: {
          status: diagnostic.issues.some((issue) =>
            [
              "public_content_config_missing",
              "public_content_mode_invalid",
              "public_content_rate_limit_missing",
            ].includes(issue),
          )
            ? "error"
            : "ok",
          mode: diagnostic.publicContentMode,
        },
        studio: {
          status: diagnostic.issues.some((issue) =>
            [
              "studio_mode_invalid",
              "studio_config_missing",
              "studio_report_config_missing",
            ].includes(issue),
          )
            ? "error"
            : "ok",
          mode: diagnostic.studioMode,
        },
        auth: {
          status: assessment.dependencies.auth,
        },
        dataApi: {
          status: assessment.dependencies.dataApi,
        },
      },
      issues: diagnostic.issues,
    },
    assessment.ready ? 200 : 503,
  );
}
