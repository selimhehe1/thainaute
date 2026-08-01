import { createClient } from "@supabase/supabase-js";

import { fetchSupabase } from "../attempt-sync/supabase-fetch";
import { registeredDeviceSchema } from "./contracts";
import { DeviceRegistrationInfrastructureError } from "./errors";
import type {
  DeviceRegistrationRepository,
  RegisterDeviceRepositoryResult,
} from "./ports";

interface RpcErrorShape {
  readonly code?: unknown;
}

export function parseRegisterDeviceRpcResult(
  data: unknown,
  error: RpcErrorShape | null,
): RegisterDeviceRepositoryResult {
  if (error !== null) {
    if (error.code === "TD002") return { kind: "device_conflict" };
    if (error.code === "TD004") return { kind: "device_limit_reached" };
    throw new DeviceRegistrationInfrastructureError();
  }

  const result = registeredDeviceSchema.safeParse(data);
  if (!result.success) throw new DeviceRegistrationInfrastructureError();
  return { kind: "registered", device: result.data };
}

export function createSupabaseDeviceRegistrationRepository(input: {
  readonly url: string;
  readonly secretKey: string;
}): DeviceRegistrationRepository {
  const client = createClient(input.url, input.secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: { fetch: fetchSupabase },
  });

  return {
    async register(command) {
      try {
        const { data, error } = await client.rpc("register_device_v1", {
          p_user_id: command.userId,
          p_device_id: command.deviceId,
          p_platform: command.platform,
          p_app_version: command.appVersion,
        });
        return parseRegisterDeviceRpcResult(data, error);
      } catch (error) {
        if (error instanceof DeviceRegistrationInfrastructureError) throw error;
        throw new DeviceRegistrationInfrastructureError();
      }
    },
  };
}
