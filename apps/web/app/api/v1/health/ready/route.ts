import { healthJson } from "@/lib/server/health";
import { diagnoseRuntime } from "@/lib/server/runtime-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  const diagnostic = diagnoseRuntime();

  return healthJson(
    {
      status: diagnostic.ready ? "ok" : "error",
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
      },
      issues: diagnostic.issues,
    },
    diagnostic.ready ? 200 : 503,
  );
}
