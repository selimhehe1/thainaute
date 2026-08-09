export type BillingInfrastructureCode =
  "billing_unavailable" | "billing_conflict";

export type BillingAuthenticationFailure = "unauthorized" | "auth_unavailable";

export class BillingApiError extends Error {
  public readonly code:
    | "billing_disabled"
    | "billing_unavailable"
    | "billing_invalid_signature"
    | "billing_conflict"
    | "unauthorized"
    | "invalid_request"
    | "invalid_json"
    | "invalid_idempotency_key"
    | "unsupported_media_type"
    | "payload_too_large";

  public readonly status: number;

  public constructor(code: BillingApiError["code"], status?: number) {
    super(code);
    this.name = "BillingApiError";
    this.code = code;
    this.status = status ?? billingApiStatus(code);
  }
}

function billingApiStatus(code: BillingApiError["code"]): number {
  switch (code) {
    case "billing_disabled":
      return 404;
    case "billing_invalid_signature":
    case "invalid_json":
    case "invalid_idempotency_key":
    case "invalid_request":
    case "payload_too_large":
      return 400;
    case "unsupported_media_type":
      return 415;
    case "unauthorized":
      return 401;
    case "billing_conflict":
      return 409;
    case "billing_unavailable":
      return 503;
  }
}

export class BillingInfrastructureError extends Error {
  public readonly code: BillingInfrastructureCode;

  public constructor(code: BillingInfrastructureCode = "billing_unavailable") {
    super(code);
    this.name = "BillingInfrastructureError";
    this.code = code;
  }
}

export class BillingAuthenticationError extends Error {
  public readonly kind: BillingAuthenticationFailure;

  public constructor(kind: BillingAuthenticationFailure) {
    super(kind);
    this.name = "BillingAuthenticationError";
    this.kind = kind;
  }
}
