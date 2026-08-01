import type { AccountExportErrorCode } from "@thainaute/sync";

const HTTP_STATUS_BY_CODE = {
  unauthorized: 401,
  export_capacity_exceeded: 409,
  concurrent_update: 409,
  auth_unavailable: 503,
  database_unavailable: 503,
  internal_error: 500,
} as const satisfies Readonly<Record<AccountExportErrorCode, number>>;

const PUBLIC_MESSAGE_BY_CODE = {
  unauthorized: "Une authentification valide est requise.",
  export_capacity_exceeded:
    "Cet export dépasse la capacité de la version synchrone actuelle.",
  concurrent_update:
    "Les données du compte ont changé pendant l'export ; réessayez.",
  auth_unavailable: "Le service d'authentification est indisponible.",
  database_unavailable: "Le service d'export est indisponible.",
  internal_error: "Une erreur interne est survenue.",
} as const satisfies Readonly<Record<AccountExportErrorCode, string>>;

export class AccountExportApiError extends Error {
  public readonly code: AccountExportErrorCode;
  public readonly status: number;

  public constructor(code: AccountExportErrorCode) {
    super(PUBLIC_MESSAGE_BY_CODE[code]);
    this.name = "AccountExportApiError";
    this.code = code;
    this.status = HTTP_STATUS_BY_CODE[code];
  }
}

export class AccountExportInfrastructureError extends Error {
  public readonly code: "auth_unavailable" | "database_unavailable";

  public constructor(code: "auth_unavailable" | "database_unavailable") {
    super(code);
    this.name = "AccountExportInfrastructureError";
    this.code = code;
  }
}
