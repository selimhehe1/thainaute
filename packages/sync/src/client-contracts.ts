import { z } from "zod";

import { learnerItemStateSchema } from "./contracts";

const canonicalUuidSchema = z.uuid().transform((uuid) => uuid.toLowerCase());
const appVersionSchema = z.string().regex(/^[0-9A-Za-z._+-]{1,32}$/u);

export const DEVICE_PLATFORMS = ["web", "ios", "android"] as const;
export const DEVICE_REGISTRATION_ERROR_CODES = [
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
] as const;

export const MAX_PROGRESS_SNAPSHOT_STATES = 10_000;

/** Corps public de `POST /api/v1/devices/register`. */
export const deviceRegistrationRequestSchema = z.strictObject({
  deviceId: canonicalUuidSchema,
  platform: z.enum(DEVICE_PLATFORMS),
  appVersion: appVersionSchema,
});

export const registeredDeviceSchema = z.strictObject({
  deviceId: canonicalUuidSchema,
  platform: z.enum(DEVICE_PLATFORMS),
  appVersion: appVersionSchema,
  registeredAt: z.string().datetime({ offset: true }),
});

/** Réponse 2xx de `POST /api/v1/devices/register`. */
export const deviceRegistrationResponseSchema = z.strictObject({
  device: registeredDeviceSchema,
});

export const deviceRegistrationErrorCodeSchema = z.enum(
  DEVICE_REGISTRATION_ERROR_CODES,
);

/** Enveloppe fermée des erreurs de l'enregistrement d'appareil. */
export const deviceRegistrationErrorResponseSchema = z.strictObject({
  error: z.strictObject({
    code: deviceRegistrationErrorCodeSchema,
    message: z.string().trim().min(1).max(500),
    requestId: canonicalUuidSchema,
  }),
});

/**
 * Projection complète d'un compte, destinée à hydrater un nouvel appareil.
 * Les états suivent le même ordre canonique que les réponses de lot.
 */
export const progressSnapshotResponseSchema = z
  .strictObject({
    syncRevision: z.number().int().nonnegative(),
    states: z.array(learnerItemStateSchema).max(MAX_PROGRESS_SNAPSHOT_STATES),
  })
  .superRefine((snapshot, context) => {
    let previousKey: string | undefined;

    snapshot.states.forEach((state, index) => {
      const key = `${state.itemId}\u0000${state.skill}`;
      if (previousKey !== undefined && key <= previousKey) {
        context.addIssue({
          code: "custom",
          message: "states doit être unique et trié par itemId puis par skill.",
          path: ["states", index],
        });
      }
      previousKey = key;
    });
  });

export type DevicePlatform = (typeof DEVICE_PLATFORMS)[number];
export type DeviceRegistrationRequest = z.infer<
  typeof deviceRegistrationRequestSchema
>;
export type RegisteredDevice = z.infer<typeof registeredDeviceSchema>;
export type DeviceRegistrationResponse = z.infer<
  typeof deviceRegistrationResponseSchema
>;
export type DeviceRegistrationErrorCode = z.infer<
  typeof deviceRegistrationErrorCodeSchema
>;
export type DeviceRegistrationErrorResponse = z.infer<
  typeof deviceRegistrationErrorResponseSchema
>;
export type ProgressSnapshotResponse = z.infer<
  typeof progressSnapshotResponseSchema
>;
