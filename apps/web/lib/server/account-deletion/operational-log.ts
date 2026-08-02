import { publicRelease } from "../runtime-config";
import type { AccountDeletionInfrastructureFailure } from "./errors";

interface AccountDeletionOperationalFailure {
  readonly operation: "account_deletion";
  readonly errorKind: AccountDeletionInfrastructureFailure | "internal_error";
  readonly requestId: string;
}

/** Journal fermé : aucun secret de reprise, jeton, UUID utilisateur ou email. */
export function reportAccountDeletionFailure(
  event: AccountDeletionOperationalFailure,
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
