export type ContentStudioErrorCode =
  "unauthorized" | "not_found" | "auth_unavailable" | "content_unavailable";

const ERROR_STATUS = {
  unauthorized: 401,
  not_found: 404,
  auth_unavailable: 503,
  content_unavailable: 503,
} as const satisfies Record<ContentStudioErrorCode, number>;

const ERROR_MESSAGE = {
  unauthorized: "Une authentification valide est requise.",
  not_found: "Ressource introuvable.",
  auth_unavailable: "Le service est temporairement indisponible.",
  content_unavailable: "Le service est temporairement indisponible.",
} as const satisfies Record<ContentStudioErrorCode, string>;

export class ContentStudioError extends Error {
  public readonly code: ContentStudioErrorCode;
  public readonly status: number;

  public constructor(code: ContentStudioErrorCode) {
    super(ERROR_MESSAGE[code]);
    this.name = "ContentStudioError";
    this.code = code;
    this.status = ERROR_STATUS[code];
  }
}
