export type ContentDeliveryErrorCode =
  "invalid_content_id" | "content_not_found" | "content_unavailable";

const STATUS_BY_CODE = {
  invalid_content_id: 400,
  content_not_found: 404,
  content_unavailable: 503,
} as const satisfies Readonly<Record<ContentDeliveryErrorCode, number>>;

const MESSAGE_BY_CODE = {
  invalid_content_id: "L'identifiant de contenu est invalide.",
  content_not_found: "Cette version de leçon est introuvable.",
  content_unavailable: "Le service de contenu est indisponible.",
} as const satisfies Readonly<Record<ContentDeliveryErrorCode, string>>;

export class ContentDeliveryError extends Error {
  public readonly code: ContentDeliveryErrorCode;
  public readonly status: number;

  public constructor(code: ContentDeliveryErrorCode) {
    super(MESSAGE_BY_CODE[code]);
    this.name = "ContentDeliveryError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
  }
}

export class ContentInfrastructureError extends Error {
  public constructor() {
    super("content_unavailable");
    this.name = "ContentInfrastructureError";
  }
}

export class ContentIntegrityError extends Error {
  public constructor() {
    super("content_integrity_failed");
    this.name = "ContentIntegrityError";
  }
}
