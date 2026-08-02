import { publicRelease } from "../runtime-config";

export interface ContentDeliveryOperationalFailure {
  readonly operation:
    "published_audio_read" | "published_lesson_read" | "published_release_read";
  readonly errorKind: "content_integrity_failed" | "content_unavailable";
  readonly requestId: string;
}

/** Journal ferme : aucune exception, identite ni donnee editoriale. */
export function reportContentDeliveryFailure(
  event: ContentDeliveryOperationalFailure,
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
