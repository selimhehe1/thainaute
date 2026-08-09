import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { fetchSupabase } from "../attempt-sync/supabase-fetch";
import {
  billingCustomerResponseSchema,
  billingEventResponseSchema,
  billingStatusResponseSchema,
} from "./contracts";
import { BillingInfrastructureError } from "./errors";
import type { BillingRepository } from "./ports";

interface RpcErrorShape {
  readonly code?: unknown;
}

function mapRpcError(error: RpcErrorShape | null): never {
  if (error?.code === "BL003") {
    throw new BillingInfrastructureError("billing_conflict");
  }
  throw new BillingInfrastructureError("billing_unavailable");
}

function parseRpcData<T>(
  data: unknown,
  error: RpcErrorShape | null,
  schema: z.ZodType<T>,
): T {
  if (error !== null) mapRpcError(error);
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new BillingInfrastructureError("billing_unavailable");
  }
  return parsed.data;
}

export function createSupabaseBillingRepository(input: {
  readonly url: string;
  readonly secretKey: string;
}): BillingRepository {
  const client = createClient(input.url, input.secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: { fetch: fetchSupabase },
  });

  return {
    async getCustomer(userId) {
      try {
        const { data, error } = await client.rpc("billing_get_customer_v1", {
          p_user_id: userId,
        });
        return parseRpcData(data, error, billingCustomerResponseSchema);
      } catch (error) {
        if (error instanceof BillingInfrastructureError) throw error;
        throw new BillingInfrastructureError("billing_unavailable");
      }
    },

    async upsertCustomer({
      userId,
      stripeCustomerId = null,
      revenuecatAppUserId = null,
    }) {
      try {
        const { data, error } = await client.rpc("billing_upsert_customer_v1", {
          p_user_id: userId,
          p_stripe_customer_id: stripeCustomerId,
          p_revenuecat_app_user_id: revenuecatAppUserId,
        });
        return parseRpcData(data, error, billingCustomerResponseSchema);
      } catch (error) {
        if (error instanceof BillingInfrastructureError) throw error;
        throw new BillingInfrastructureError("billing_unavailable");
      }
    },

    async findUserByCustomer({ provider, providerCustomerId }) {
      try {
        const { data, error } = await client.rpc(
          "billing_find_user_by_customer_v1",
          {
            p_provider: provider,
            p_provider_customer_id: providerCustomerId,
          },
        );
        const parsed = parseRpcData(
          data,
          error,
          z.strictObject({ userId: z.uuid().nullable() }),
        );
        return parsed.userId;
      } catch (error) {
        if (error instanceof BillingInfrastructureError) throw error;
        throw new BillingInfrastructureError("billing_unavailable");
      }
    },

    async getStatus(userId) {
      try {
        const { data, error } = await client.rpc("billing_get_status_v1", {
          p_user_id: userId,
        });
        return parseRpcData(data, error, billingStatusResponseSchema);
      } catch (error) {
        if (error instanceof BillingInfrastructureError) throw error;
        throw new BillingInfrastructureError("billing_unavailable");
      }
    },

    async applyEvent(input) {
      try {
        const { data, error } = await client.rpc("billing_apply_event_v1", {
          p_provider: input.provider,
          p_event_id: input.eventId,
          p_event_type: input.eventType,
          p_event_created_at: input.eventCreatedAt,
          p_payload_sha256: input.payloadSha256,
          p_user_id: input.userId ?? null,
          p_entitlement: input.entitlement ?? null,
          p_provider_customer_id: input.providerCustomerId ?? null,
          p_provider_subscription_id: input.providerSubscriptionId ?? null,
          p_status: input.status ?? null,
          p_current_period_end: input.currentPeriodEnd ?? null,
        });
        return parseRpcData(data, error, billingEventResponseSchema);
      } catch (error) {
        if (error instanceof BillingInfrastructureError) throw error;
        throw new BillingInfrastructureError("billing_unavailable");
      }
    },
  };
}
