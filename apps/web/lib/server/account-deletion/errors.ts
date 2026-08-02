import type { AccountDeletionErrorCode } from "@thainaute/sync";

const HTTP_STATUS_BY_CODE = {
  invalid_request: 400,
  unauthorized: 401,
  reauthentication_required: 403,
  idempotency_key_reused: 409,
  deletion_in_progress: 409,
  auth_unavailable: 503,
  storage_unavailable: 503,
  database_unavailable: 503,
  internal_error: 500,
} as const satisfies Readonly<Record<AccountDeletionErrorCode, number>>;

const PUBLIC_MESSAGE_BY_CODE = {
  invalid_request: "La demande de suppression est invalide.",
  unauthorized: "Une authentification valide est requise.",
  reauthentication_required:
    "Un code de vérification récent est requis avant la suppression.",
  idempotency_key_reused:
    "Cette clé de reprise a déjà été utilisée pour une autre demande.",
  deletion_in_progress:
    "La suppression est déjà en cours. Réessayez avec les mêmes identifiants de reprise.",
  auth_unavailable: "Le service d’authentification est indisponible.",
  storage_unavailable: "Le stockage du compte est indisponible.",
  database_unavailable: "Le service de suppression est indisponible.",
  internal_error: "Une erreur interne est survenue.",
} as const satisfies Readonly<Record<AccountDeletionErrorCode, string>>;

export class AccountDeletionApiError extends Error {
  public readonly code: AccountDeletionErrorCode;
  public readonly status: number;

  public constructor(code: AccountDeletionErrorCode) {
    super(PUBLIC_MESSAGE_BY_CODE[code]);
    this.name = "AccountDeletionApiError";
    this.code = code;
    this.status = HTTP_STATUS_BY_CODE[code];
  }
}

export type AccountDeletionInfrastructureFailure =
  "auth_unavailable" | "storage_unavailable" | "database_unavailable";

export class AccountDeletionInfrastructureError extends Error {
  public readonly code: AccountDeletionInfrastructureFailure;

  public constructor(code: AccountDeletionInfrastructureFailure) {
    super(code);
    this.name = "AccountDeletionInfrastructureError";
    this.code = code;
  }
}
