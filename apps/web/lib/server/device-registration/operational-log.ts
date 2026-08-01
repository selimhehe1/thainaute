import { publicRelease } from "../runtime-config";

interface DeviceRegistrationOperationalFailure {
  readonly operation: "device_registration";
  readonly errorKind:
    "auth_unavailable" | "database_unavailable" | "internal_error";
  readonly requestId: string;
}

/** Journal fermé : aucun jeton, UUID d'utilisateur ou détail de requête. */
export function reportDeviceRegistrationFailure(
  event: DeviceRegistrationOperationalFailure,
): void {
  console.error(
    JSON.stringify({
      level: "error",
      event: "operational_failure",
      operation: event.operation,
      errorKind: event.errorKind,
      requestId: event.requestId,
      release: publicRelease(),
    }),
  );
}
