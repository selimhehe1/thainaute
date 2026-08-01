import { publicRelease } from "../runtime-config";

interface AccountExportOperationalFailure {
  readonly operation: "account_export";
  readonly errorKind:
    "auth_unavailable" | "database_unavailable" | "internal_error";
  readonly requestId: string;
}

/** Journal fermé : ni jeton, ni UUID utilisateur, ni email, ni contenu exporté. */
export function reportAccountExportFailure(
  event: AccountExportOperationalFailure,
): void {
  console.error(
    JSON.stringify({
      level: "error",
      event: "operational_failure",
      operation: event.operation,
      errorKind: event.errorKind,
      requestId: event.requestId,
      release: publicRelease(),
    }),
  );
}
