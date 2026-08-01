import {
  createDeviceRegistrationHttpHandler,
  unavailableDeviceRegistrationResponse,
} from "@/lib/server/device-registration/http";
import { reportDeviceRegistrationFailure } from "@/lib/server/device-registration/operational-log";
import { createDeviceRegistrar } from "@/lib/server/device-registration/service";
import { createSupabaseDeviceRegistrationRepository } from "@/lib/server/device-registration/supabase-repository";
import { readSupabaseAttemptSyncConfiguration } from "@/lib/server/attempt-sync/runtime";
import { createSupabaseAccessTokenVerifier } from "@/lib/server/attempt-sync/supabase-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Handler = (request: Request) => Promise<Response>;
let cachedHandler: Handler | undefined;

function deviceRegistrationHandler(): Handler | null {
  if (cachedHandler !== undefined) return cachedHandler;

  const configuration = readSupabaseAttemptSyncConfiguration();
  if (configuration === null) return null;

  const repository = createSupabaseDeviceRegistrationRepository({
    url: configuration.url,
    secretKey: configuration.secretKey,
  });
  cachedHandler = createDeviceRegistrationHttpHandler({
    accessTokenVerifier: createSupabaseAccessTokenVerifier({
      url: configuration.url,
      publishableKey: configuration.publishableKey,
    }),
    registerDevice: createDeviceRegistrar(repository),
    reportOperationalFailure: reportDeviceRegistrationFailure,
  });
  return cachedHandler;
}

export async function POST(request: Request): Promise<Response> {
  const handler = deviceRegistrationHandler();
  return handler === null
    ? unavailableDeviceRegistrationResponse()
    : handler(request);
}
