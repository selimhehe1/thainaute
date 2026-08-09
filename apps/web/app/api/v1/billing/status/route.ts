import {
  createBillingStatusHttpHandler,
  unavailableBillingResponse,
} from "@/lib/server/billing/http";
import { areBillingProviderActionsEnabled } from "@/lib/server/billing/capability";
import { readBillingHandlerDependencies } from "@/lib/server/billing/handler";
import { readBillingMode } from "@/lib/server/billing/runtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  if (!areBillingProviderActionsEnabled()) {
    return unavailableBillingResponse(
      readBillingMode() === "disabled"
        ? "billing_disabled"
        : "billing_unavailable",
    );
  }

  const dependencies = readBillingHandlerDependencies();
  return dependencies === null
    ? unavailableBillingResponse(
        readBillingMode() === "disabled"
          ? "billing_disabled"
          : "billing_unavailable",
      )
    : createBillingStatusHttpHandler(dependencies)(request);
}
