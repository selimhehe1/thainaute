import { z } from "zod";

const canonicalUuidSchema = z.uuid().transform((value) => value.toLowerCase());

export const deviceRegistrationRequestSchema = z.strictObject({
  deviceId: canonicalUuidSchema,
  platform: z.enum(["web", "ios", "android"]),
  appVersion: z.string().regex(/^[0-9A-Za-z._+-]{1,32}$/u),
});

export const registeredDeviceSchema = z.strictObject({
  deviceId: canonicalUuidSchema,
  platform: z.enum(["web", "ios", "android"]),
  appVersion: z.string().regex(/^[0-9A-Za-z._+-]{1,32}$/u),
  registeredAt: z.string().datetime({ offset: true }),
});

export const deviceRegistrationResponseSchema = z.strictObject({
  device: registeredDeviceSchema,
});

export const deviceRegistrationErrorResponseSchema = z.strictObject({
  error: z.strictObject({
    code: z.enum([
      "invalid_json",
      "unauthorized",
      "payload_too_large",
      "unsupported_media_type",
      "invalid_request",
      "device_conflict",
      "device_limit_reached",
      "auth_unavailable",
      "database_unavailable",
      "internal_error",
    ]),
    message: z.string().min(1),
    requestId: z.uuid(),
  }),
});

export type DeviceRegistrationRequest = z.infer<
  typeof deviceRegistrationRequestSchema
>;
export type RegisteredDevice = z.infer<typeof registeredDeviceSchema>;
export type DeviceRegistrationResponse = z.infer<
  typeof deviceRegistrationResponseSchema
>;
export type DeviceRegistrationErrorCode = z.infer<
  typeof deviceRegistrationErrorResponseSchema
>["error"]["code"];
