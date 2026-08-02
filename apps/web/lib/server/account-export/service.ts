import {
  ACCOUNT_EXPORT_FORMAT,
  accountExportDocumentSchema,
} from "@thainaute/sync";

import { AccountExportInfrastructureError } from "./errors";
import type {
  AccountExporter,
  AccountExportIdentityVerifier,
  AccountExportRepository,
} from "./ports";

export function createAccountExporter(dependencies: {
  readonly identityVerifier: AccountExportIdentityVerifier;
  readonly repository: AccountExportRepository;
  readonly now?: () => Date;
}): AccountExporter {
  return async ({ accessToken, signal }) => {
    const identity = await dependencies.identityVerifier.verify({
      accessToken,
      signal,
    });
    const data = await dependencies.repository.read({
      userId: identity.id,
      accessToken,
      signal,
    });
    const result = accountExportDocumentSchema.safeParse({
      format: ACCOUNT_EXPORT_FORMAT,
      exportedAt: (dependencies.now ?? (() => new Date()))().toISOString(),
      identity,
      data,
    });
    if (!result.success) {
      throw new AccountExportInfrastructureError("database_unavailable");
    }
    return result.data;
  };
}
