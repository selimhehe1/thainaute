import type {
  AccountDeletionHeaders,
  AccountDeletionReceipt,
  AccountDeletionRequest,
} from "@thainaute/sync";

export interface AccountDeletionVerifiedIdentity {
  readonly userId: string;
  readonly claims: unknown;
}

export interface AccountDeletionIdentityVerifier {
  verify(input: {
    readonly accessToken: string;
    readonly signal: AbortSignal;
  }): Promise<AccountDeletionVerifiedIdentity>;
}

export interface AccountDeletionSessionVerifier {
  isActive(input: {
    readonly userId: string;
    readonly sessionId: string;
    readonly signal: AbortSignal;
  }): Promise<boolean>;
}

export interface AccountDeletionFingerprints {
  readonly subjectHmac: string;
  readonly idempotencyHmac: string;
  readonly requestHmac: string;
  readonly continuationHmac: string;
}

export type AccountDeletionReceiptState =
  | {
      readonly kind: "not_found";
    }
  | {
      readonly kind: "in_progress";
      readonly receiptId: string;
      readonly targetUserId: string;
    }
  | {
      readonly kind: "completed";
      readonly receipt: AccountDeletionReceipt;
    }
  | {
      readonly kind: "idempotency_key_reused";
    }
  | {
      readonly kind: "deletion_in_progress";
    };

export interface AccountDeletionReceiptRepository {
  resume(input: {
    readonly idempotencyHmac: string;
    readonly continuationHmac: string;
    readonly signal: AbortSignal;
  }): Promise<AccountDeletionReceiptState>;
  begin(
    input: AccountDeletionFingerprints & {
      readonly targetUserId: string;
      readonly signal: AbortSignal;
    },
  ): Promise<Exclude<AccountDeletionReceiptState, { kind: "not_found" }>>;
  readCompleted(input: {
    readonly idempotencyHmac: string;
    readonly continuationHmac: string;
    readonly signal: AbortSignal;
  }): Promise<AccountDeletionReceiptState>;
}

export interface AccountDeletionStoragePurger {
  purgeUserObjects(input: {
    readonly userId: string;
    readonly signal: AbortSignal;
  }): Promise<void>;
}

export interface AccountDeletionAuthAdministrator {
  revokeGlobalSessions(input: {
    readonly accessToken: string;
    readonly signal: AbortSignal;
  }): Promise<void>;
  hardDeleteUser(input: {
    readonly userId: string;
    readonly signal: AbortSignal;
    readonly acceptAlreadyDeleted: boolean;
  }): Promise<void>;
}

export interface AccountDeletionHasher {
  fingerprint(input: {
    readonly userId?: string;
    readonly request: AccountDeletionRequest;
    readonly headers: AccountDeletionHeaders;
  }): AccountDeletionFingerprints;
}

export type AccountDeleter = (input: {
  readonly accessToken: string | null;
  readonly request: AccountDeletionRequest;
  readonly headers: AccountDeletionHeaders;
  readonly signal: AbortSignal;
}) => Promise<AccountDeletionReceipt>;
