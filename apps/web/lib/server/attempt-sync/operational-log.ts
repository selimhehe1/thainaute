import { publicRelease } from "../runtime-config";

interface OperationalFailure {
  readonly operation: "attempt_batch";
  readonly errorKind:
    "auth_unavailable" | "database_unavailable" | "internal_error";
  readonly requestId: string;
}

/** Journal fermé : aucune exception, requête, identité ou donnée métier. */
export function reportOperationalFailure(event: OperationalFailure): void {
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
