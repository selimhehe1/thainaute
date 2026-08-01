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
            ["sync_mode_invalid", "supabase_config_missing"].includes(issue),
          )
            ? "error"
            : "ok",
          mode: diagnostic.syncMode,
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
