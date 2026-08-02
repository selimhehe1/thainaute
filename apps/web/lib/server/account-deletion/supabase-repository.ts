import { createClient } from "@supabase/supabase-js";
import {
  ACCOUNT_DELETION_RECEIPT_FORMAT,
  accountDeletionReceiptSchema,
} from "@thainaute/sync";
import { z } from "zod";

import { AccountDeletionInfrastructureError } from "./errors";
import type {
  AccountDeletionReceiptRepository,
  AccountDeletionReceiptState,
} from "./ports";
import { createAccountDeletionSupabaseFetch } from "./supabase-fetch";

const rpcStateSchema = z
  .strictObject({
    status: z.enum(["in_progress", "completed"]),
    receiptId: z.uuid().transform((uuid) => uuid.toLowerCase()),
    targetUserId: z
      .uuid()
      .transform((uuid) => uuid.toLowerCase())
      .nullable(),
    completedAt: z
      .string()
      .datetime({ offset: true })
      .transform((timestamp) => new Date(timestamp).toISOString())
      .nullable(),
  })
  .superRefine((state, context) => {
    if (
      (state.status === "in_progress" &&
        (state.targetUserId === null || state.completedAt !== null)) ||
      (state.status === "completed" &&
        (state.targetUserId !== null || state.completedAt === null))
    ) {
      context.addIssue({
        code: "custom",
        message: "État de reçu incohérent.",
      });
    }
  });

interface RpcErrorShape {
  readonly code?: unknown;
}

export function parseAccountDeletionRpcResult(
  data: unknown,
  error: RpcErrorShape | null,
  allowNotFound: boolean,
): AccountDeletionReceiptState {
  if (error !== null) {
    if (allowNotFound && error.code === "TA002") return { kind: "not_found" };
    if (["TA003", "TA004", "TA005"].includes(String(error.code))) {
      return { kind: "idempotency_key_reused" };
    }
    throw new AccountDeletionInfrastructureError("database_unavailable");
  }

  const parsed = rpcStateSchema.safeParse(data);
  if (!parsed.success) {
    throw new AccountDeletionInfrastructureError("database_unavailable");
  }
  if (parsed.data.status === "in_progress") {
    if (parsed.data.targetUserId === null) {
      throw new AccountDeletionInfrastructureError("database_unavailable");
    }
    return {
      kind: "in_progress",
      receiptId: parsed.data.receiptId,
      targetUserId: parsed.data.targetUserId,
    };
  }
  const receipt = accountDeletionReceiptSchema.safeParse({
    format: ACCOUNT_DELETION_RECEIPT_FORMAT,
    receiptId: parsed.data.receiptId,
    completedAt: parsed.data.completedAt,
    deleted: true,
  });
  if (!receipt.success) {
    throw new AccountDeletionInfrastructureError("database_unavailable");
  }
  return { kind: "completed", receipt: receipt.data };
}

export function createSupabaseAccountDeletionReceiptRepository(input: {
  readonly url: string;
  readonly secretKey: string;
}): AccountDeletionReceiptRepository {
  function client(signal: AbortSignal) {
    return createClient(input.url, input.secretKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: { fetch: createAccountDeletionSupabaseFetch(signal) },
    });
  }

  return {
    async resume(command) {
      try {
        const { data, error } = await client(command.signal).rpc(
          "resume_account_deletion_v1",
          {
            p_idempotency_hmac_sha256: command.idempotencyHmac,
            p_continuation_hmac_sha256: command.continuationHmac,
          },
        );
        return parseAccountDeletionRpcResult(data, error, true);
      } catch (error) {
        if (error instanceof AccountDeletionInfrastructureError) throw error;
        throw new AccountDeletionInfrastructureError("database_unavailable");
      }
    },

    async begin(command) {
      try {
        const { data, error } = await client(command.signal).rpc(
          "begin_account_deletion_v1",
          {
            p_subject_hmac_sha256: command.subjectHmac,
            p_idempotency_hmac_sha256: command.idempotencyHmac,
            p_request_hmac_sha256: command.requestHmac,
            p_continuation_hmac_sha256: command.continuationHmac,
            p_target_user_id: command.targetUserId,
          },
        );
        const result = parseAccountDeletionRpcResult(data, error, false);
        if (result.kind === "not_found") {
          throw new AccountDeletionInfrastructureError("database_unavailable");
        }
        return result;
      } catch (error) {
        if (error instanceof AccountDeletionInfrastructureError) throw error;
        throw new AccountDeletionInfrastructureError("database_unavailable");
      }
    },

    async readCompleted(command) {
      try {
        const { data, error } = await client(command.signal).rpc(
          "read_account_deletion_completion_v1",
          {
            p_idempotency_hmac_sha256: command.idempotencyHmac,
            p_continuation_hmac_sha256: command.continuationHmac,
          },
        );
        return parseAccountDeletionRpcResult(data, error, false);
      } catch (error) {
        if (error instanceof AccountDeletionInfrastructureError) throw error;
        throw new AccountDeletionInfrastructureError("database_unavailable");
      }
    },
  };
}
