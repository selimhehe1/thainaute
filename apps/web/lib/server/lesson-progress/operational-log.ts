import { publicRelease } from "../runtime-config";

interface LessonProgressOperationalFailure {
  readonly operation: "lesson_progress";
  readonly errorKind:
    | "auth_unavailable"
    | "content_integrity_failed"
    | "database_unavailable"
    | "internal_error";
  readonly requestId: string;
}

/** Journal fermé : aucune identité, progression ou donnée éditoriale. */
export function reportLessonProgressFailure(
  event: LessonProgressOperationalFailure,
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
