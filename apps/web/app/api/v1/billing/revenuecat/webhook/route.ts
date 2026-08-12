import {
  createRevenueCatWebhookHttpHandler,
  unavailableBillingResponse,
} from "@/lib/server/billing/http";
import { areBillingProviderActionsEnabled } from "@/lib/server/billing/capability";
import { readRevenueCatHandlerDependencies } from "@/lib/server/billing/handler";
import { readBillingMode } from "@/lib/server/billing/runtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!areBillingProviderActionsEnabled()) {
    return unavailableBillingResponse(
      readBillingMode() === "disabled"
        ? "billing_disabled"
        : "billing_unavailable",
    );
  }

  const dependencies = readRevenueCatHandlerDependencies();
  return dependencies === null
    ? unavailableBillingResponse(
        readBillingMode() === "disabled"
          ? "billing_disabled"
          : "billing_unavailable",
      )
    : createRevenueCatWebhookHttpHandler(dependencies)(request);
}
