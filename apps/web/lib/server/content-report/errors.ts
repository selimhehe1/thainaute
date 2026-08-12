import type { ApiErrorCode } from "@thainaute/sync";

const STATUS_BY_CODE = {
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
  billing_disabled: 404,
  billing_unavailable: 503,
  billing_invalid_signature: 400,
  billing_conflict: 409,
  internal_error: 500,
} as const satisfies Readonly<Record<ApiErrorCode, number>>;

const MESSAGE_BY_CODE = {
  invalid_json: "Le corps JSON est invalide.",
  invalid_idempotency_key: "La clé d'idempotence est invalide.",
  unauthorized: "Un compte permanent authentifié est requis.",
  payload_too_large: "La requête dépasse la taille autorisée.",
  unsupported_media_type: "Le type de contenu doit être application/json.",
  invalid_request: "Le signalement ou sa cible est invalide.",
  idempotency_key_reused:
    "Cette clé d'idempotence identifie déjà un autre signalement.",
  concurrent_update: "La donnée a changé ; réessayez.",
  auth_unavailable: "Le service d'authentification est indisponible.",
  database_unavailable: "Le service de signalement est indisponible.",
  billing_disabled: "La facturation n'est pas activée.",
  billing_unavailable: "Le service de facturation est indisponible.",
  billing_invalid_signature: "La signature de l'événement est invalide.",
  billing_conflict: "L'état de facturation est en conflit.",
  internal_error: "Une erreur interne est survenue.",
} as const satisfies Readonly<Record<ApiErrorCode, string>>;

export class ContentReportApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number;

  public constructor(code: ApiErrorCode) {
    super(MESSAGE_BY_CODE[code]);
    this.name = "ContentReportApiError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
  }
}

export class ContentReportInfrastructureError extends Error {
  public readonly code: "auth_unavailable" | "database_unavailable";

  public constructor(code: "auth_unavailable" | "database_unavailable") {
    super(code);
    this.name = "ContentReportInfrastructureError";
    this.code = code;
  }
}
