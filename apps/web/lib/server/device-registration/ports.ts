import type { DeviceRegistrationRequest, RegisteredDevice } from "./contracts";

export interface RegisterDeviceCommand extends DeviceRegistrationRequest {
  readonly userId: string;
}

export type RegisterDeviceRepositoryResult =
  | { readonly kind: "registered"; readonly device: RegisteredDevice }
  | { readonly kind: "device_conflict" }
  | { readonly kind: "device_limit_reached" };

export interface DeviceRegistrationRepository {
  register(
    command: RegisterDeviceCommand,
  ): Promise<RegisterDeviceRepositoryResult>;
}
