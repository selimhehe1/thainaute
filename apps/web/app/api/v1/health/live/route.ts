import { healthJson } from "@/lib/server/health";
import { publicRelease } from "@/lib/server/runtime-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return healthJson({ status: "ok", release: publicRelease() });
}
