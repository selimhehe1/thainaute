import type { ApiErrorCode } from "@thainaute/sync";

const HTTP_STATUS_BY_CODE = {
  invalid_json: 400,
  invalid_idempotency_key: 400,
  unauthorized: 401,
  payload_too_large: 413,
  unsupported_media_type: 415,
  invalid_request: 422,
  idempotency_key_reused: 409,
  concurrent_update: 409,
  auth_unavailable: 503,
  database_unavailable: 503,
  internal_error: 500,
} as const satisfies Readonly<Record<ApiErrorCode, number>>;

const PUBLIC_MESSAGE_BY_CODE = {
  invalid_json: "Le corps JSON est invalide.",
  invalid_idempotency_key: "La clé d'idempotence est invalide.",
  unauthorized: "Une authentification valide est requise.",
  payload_too_large: "La requête dépasse la taille autorisée.",
  unsupported_media_type: "Le type de contenu doit être application/json.",
  invalid_request: "La requête ne respecte pas le contrat attendu.",
  idempotency_key_reused:
    "Cette clé d'idempotence a déjà été utilisée pour une autre requête.",
  concurrent_update: "La progression a changé ; réessayez la synchronisation.",
  auth_unavailable: "Le service d'authentification est indisponible.",
  database_unavailable: "Le service de synchronisation est indisponible.",
  internal_error: "Une erreur interne est survenue.",
} as const satisfies Readonly<Record<ApiErrorCode, string>>;

export class AttemptApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number;

  public constructor(code: ApiErrorCode) {
    super(PUBLIC_MESSAGE_BY_CODE[code]);
    this.name = "AttemptApiError";
    this.code = code;
    this.status = HTTP_STATUS_BY_CODE[code];
  }
}

export class AttemptInfrastructureError extends Error {
  public readonly code: "auth_unavailable" | "database_unavailable";

  public constructor(code: "auth_unavailable" | "database_unavailable") {
    super(code);
    this.name = "AttemptInfrastructureError";
    this.code = code;
  }
}
