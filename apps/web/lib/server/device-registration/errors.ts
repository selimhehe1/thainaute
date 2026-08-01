import type { DeviceRegistrationErrorCode } from "./contracts";

const HTTP_STATUS_BY_CODE = {
  invalid_json: 400,
  unauthorized: 401,
  payload_too_large: 413,
  unsupported_media_type: 415,
  invalid_request: 422,
  device_conflict: 409,
  device_limit_reached: 409,
  auth_unavailable: 503,
  database_unavailable: 503,
  internal_error: 500,
} as const satisfies Readonly<Record<DeviceRegistrationErrorCode, number>>;

const PUBLIC_MESSAGE_BY_CODE = {
  invalid_json: "Le corps JSON est invalide.",
  unauthorized: "Une authentification valide est requise.",
  payload_too_large: "La requête dépasse la taille autorisée.",
  unsupported_media_type: "Le type de contenu doit être application/json.",
  invalid_request: "La requête ne respecte pas le contrat attendu.",
  device_conflict:
    "Cet identifiant d’appareil est déjà associé de façon incompatible.",
  device_limit_reached:
    "Le nombre maximal d’appareils associés à ce compte est atteint.",
  auth_unavailable: "Le service d’authentification est indisponible.",
  database_unavailable: "Le service d’enregistrement est indisponible.",
  internal_error: "Une erreur interne est survenue.",
} as const satisfies Readonly<Record<DeviceRegistrationErrorCode, string>>;

export class DeviceRegistrationApiError extends Error {
  public readonly code: DeviceRegistrationErrorCode;
  public readonly status: number;

  public constructor(code: DeviceRegistrationErrorCode) {
    super(PUBLIC_MESSAGE_BY_CODE[code]);
    this.name = "DeviceRegistrationApiError";
    this.code = code;
    this.status = HTTP_STATUS_BY_CODE[code];
  }
}

export class DeviceRegistrationInfrastructureError extends Error {
  public readonly code: "database_unavailable";

  public constructor() {
    super("database_unavailable");
    this.name = "DeviceRegistrationInfrastructureError";
    this.code = "database_unavailable";
  }
}
