import { accountDeletionReceiptSchema } from "@thainaute/sync";

import {
  AccountDeletionApiError,
  AccountDeletionInfrastructureError,
} from "./errors";
import { assertRecentAccountDeletionOtp } from "./fresh-auth";
import type {
  AccountDeleter,
  AccountDeletionAuthAdministrator,
  AccountDeletionBillingCoordinator,
  AccountDeletionHasher,
  AccountDeletionIdentityVerifier,
  AccountDeletionReceiptRepository,
  AccountDeletionReceiptState,
  AccountDeletionSessionVerifier,
  AccountDeletionStoragePurger,
} from "./ports";

function terminalReceipt(state: AccountDeletionReceiptState) {
  if (state.kind !== "completed") return null;
  const parsed = accountDeletionReceiptSchema.safeParse(state.receipt);
  if (!parsed.success) {
    throw new AccountDeletionInfrastructureError("database_unavailable");
  }
  return parsed.data;
}

function operationFromState(state: AccountDeletionReceiptState): {
  readonly receiptId: string;
  readonly targetUserId: string;
} {
  if (state.kind === "in_progress") {
    return {
      receiptId: state.receiptId,
      targetUserId: state.targetUserId,
    };
  }
  if (state.kind === "idempotency_key_reused") {
    throw new AccountDeletionApiError("idempotency_key_reused");
  }
  if (state.kind === "deletion_in_progress") {
    throw new AccountDeletionApiError("deletion_in_progress");
  }
  throw new AccountDeletionInfrastructureError("database_unavailable");
}

export function createAccountDeleter(dependencies: {
  readonly identityVerifier: AccountDeletionIdentityVerifier;
  readonly sessionVerifier: AccountDeletionSessionVerifier;
  readonly repository: AccountDeletionReceiptRepository;
  readonly billingCoordinator: AccountDeletionBillingCoordinator;
  readonly storage: AccountDeletionStoragePurger;
  readonly authAdministrator: AccountDeletionAuthAdministrator;
  readonly hasher: AccountDeletionHasher;
  readonly now?: () => Date;
}): AccountDeleter {
  return async ({ accessToken, request, headers, signal }) => {
    const preliminary = dependencies.hasher.fingerprint({ request, headers });
    const resumed = await dependencies.repository.resume({
      idempotencyHmac: preliminary.idempotencyHmac,
      continuationHmac: preliminary.continuationHmac,
      signal,
    });
    const replayedReceipt = terminalReceipt(resumed);
    if (replayedReceipt !== null) return replayedReceipt;

    let state = resumed;
    let initialAccessToken: string | null = null;
    if (state.kind === "not_found") {
      if (accessToken === null) {
        throw new AccountDeletionApiError("unauthorized");
      }
      const identity = await dependencies.identityVerifier.verify({
        accessToken,
        signal,
      });
      const { sessionId } = assertRecentAccountDeletionOtp(
        identity.claims,
        (dependencies.now ?? (() => new Date()))(),
      );
      if (
        !(await dependencies.sessionVerifier.isActive({
          userId: identity.userId,
          sessionId,
          signal,
        }))
      ) {
        throw new AccountDeletionApiError("unauthorized");
      }
      await dependencies.billingCoordinator.assertCanStartAccountDeletion({
        userId: identity.userId,
        signal,
      });
      const fingerprints = dependencies.hasher.fingerprint({
        userId: identity.userId,
        request,
        headers,
      });
      state = await dependencies.repository.begin({
        ...fingerprints,
        targetUserId: identity.userId,
        signal,
      });
      const racedReceipt = terminalReceipt(state);
      if (racedReceipt !== null) return racedReceipt;
      initialAccessToken = accessToken;
    }

    const operation = operationFromState(state);
    await dependencies.billingCoordinator.prepareForAccountDeletion({
      receiptId: operation.receiptId,
      userId: operation.targetUserId,
      signal,
    });

    await dependencies.storage.purgeUserObjects({
      userId: operation.targetUserId,
      signal,
    });

    if (initialAccessToken !== null) {
      await dependencies.authAdministrator.revokeGlobalSessions({
        accessToken: initialAccessToken,
        signal,
      });
    }
    await dependencies.authAdministrator.hardDeleteUser({
      userId: operation.targetUserId,
      signal,
      // Dès que le reçu durable existe, une absence Auth signifie qu'un appel
      // concurrent ou précédent a franchi la même étape destructive.
      acceptAlreadyDeleted: true,
    });

    const completed = await dependencies.repository.readCompleted({
      idempotencyHmac: preliminary.idempotencyHmac,
      continuationHmac: preliminary.continuationHmac,
      signal,
    });
    const receipt = terminalReceipt(completed);
    if (receipt === null) {
      if (completed.kind === "deletion_in_progress") {
        throw new AccountDeletionApiError("deletion_in_progress");
      }
      throw new AccountDeletionInfrastructureError("database_unavailable");
    }
    return receipt;
  };
}
