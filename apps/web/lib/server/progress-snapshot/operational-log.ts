import { publicRelease } from "../runtime-config";

interface ProgressSnapshotOperationalFailure {
  readonly operation: "progress_snapshot";
  readonly errorKind:
    "auth_unavailable" | "database_unavailable" | "internal_error";
  readonly requestId: string;
}

/** Journal fermé : aucun jeton, UUID, email, état pédagogique ou détail. */
export function reportProgressSnapshotFailure(
  event: ProgressSnapshotOperationalFailure,
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
