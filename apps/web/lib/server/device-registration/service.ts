import type {
  DeviceRegistrationRequest,
  DeviceRegistrationResponse,
} from "./contracts";
import { DeviceRegistrationApiError } from "./errors";
import type { DeviceRegistrationRepository } from "./ports";

export function createDeviceRegistrar(
  repository: DeviceRegistrationRepository,
): (input: {
  readonly userId: string;
  readonly registration: DeviceRegistrationRequest;
}) => Promise<DeviceRegistrationResponse> {
  return async ({ userId, registration }) => {
    const result = await repository.register({ userId, ...registration });
    if (result.kind !== "registered") {
      throw new DeviceRegistrationApiError(result.kind);
    }
    return { device: result.device };
  };
}
