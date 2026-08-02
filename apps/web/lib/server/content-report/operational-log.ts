import { publicRelease } from "../runtime-config";

interface OperationalFailure {
  readonly operation: "content_report";
  readonly errorKind:
    "auth_unavailable" | "database_unavailable" | "internal_error";
  readonly requestId: string;
}

/** Journal fermé : aucun jeton, sujet, contenu, exercice ou catégorie. */
export function reportContentReportOperationalFailure(
  event: OperationalFailure,
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
