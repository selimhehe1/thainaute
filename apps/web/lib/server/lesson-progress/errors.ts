import type { LessonProgressErrorCode } from "@thainaute/sync";

const STATUS_BY_CODE = {
  invalid_content_id: 400,
  unauthorized: 401,
  content_not_found: 404,
  auth_unavailable: 503,
  database_unavailable: 503,
  internal_error: 500,
} as const satisfies Readonly<Record<LessonProgressErrorCode, number>>;

const MESSAGE_BY_CODE = {
  invalid_content_id: "L'identifiant de contenu est invalide.",
  unauthorized: "Une authentification valide est requise.",
  content_not_found: "Cette version de leçon est introuvable.",
  auth_unavailable: "Le service d'authentification est indisponible.",
  database_unavailable: "La progression est momentanément indisponible.",
  internal_error: "Une erreur interne est survenue.",
} as const satisfies Readonly<Record<LessonProgressErrorCode, string>>;

export class LessonProgressApiError extends Error {
  public readonly code: LessonProgressErrorCode;
  public readonly status: number;

  public constructor(code: LessonProgressErrorCode) {
    super(MESSAGE_BY_CODE[code]);
    this.name = "LessonProgressApiError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
  }
}
