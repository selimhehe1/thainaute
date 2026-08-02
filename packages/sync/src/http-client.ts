import { z } from "zod";

import {
  apiErrorResponseSchema,
  attemptBatchResponseSchema,
  attemptBatchSchema,
  idempotencyKeySchema,
  type ApiErrorCode,
  type AttemptBatch,
  type AttemptBatchResponse,
} from "./contracts";
import {
  deviceRegistrationErrorResponseSchema,
  deviceRegistrationRequestSchema,
  deviceRegistrationResponseSchema,
  progressSnapshotResponseSchema,
  type DeviceRegistrationErrorCode,
  type DeviceRegistrationRequest,
  type DeviceRegistrationResponse,
  type ProgressSnapshotResponse,
} from "./client-contracts";
import {
  accountExportDocumentSchema,
  accountExportErrorResponseSchema,
  type AccountExportDocument,
  type AccountExportErrorCode,
} from "./account-export-contracts";
import {
  ACCOUNT_DELETION_CONFIRMATION,
  ACCOUNT_DELETION_CONTINUATION_HEADER,
  accountDeletionErrorResponseSchema,
  accountDeletionHeadersSchema,
  accountDeletionReceiptSchema,
  type AccountDeletionErrorCode,
  type AccountDeletionHeaders,
  type AccountDeletionReceipt,
} from "./account-deletion-contracts";
import {
  contentReportOutboxEntrySchema,
  contentReportResponseSchema,
  type ContentReportOutboxEntry,
  type ContentReportRejectionReason,
  type ContentReportResponse,
} from "./content-report-outbox";
import type { PreparedAttemptOutboxBatch } from "./outbox";

const ACCESS_TOKEN_MAX_LENGTH = 16 * 1_024;
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;
const MAX_REQUEST_TIMEOUT_MS = 120_000;
const canonicalUuidSchema = z.uuid().transform((uuid) => uuid.toLowerCase());
const accessTokenSchema = z
  .string()
  .min(1)
  .max(ACCESS_TOKEN_MAX_LENGTH)
  .regex(/^\S+$/u);
const authenticatedSyncSessionSchema = z.strictObject({
  accessToken: accessTokenSchema,
  userId: canonicalUuidSchema,
});
const preparedAttemptBatchSchema = z.strictObject({
  idempotencyKey: idempotencyKeySchema,
  batch: attemptBatchSchema,
});

const ENDPOINT_PATHS = {
  account_deletion: "/api/v1/account",
  account_export: "/api/v1/account/export",
  content_report: "/api/v1/content/reports",
  device_registration: "/api/v1/devices/register",
  attempt_batch: "/api/v1/attempts/batch",
  progress_snapshot: "/api/v1/progress/snapshot",
} as const;

export type SyncHttpEndpoint = keyof typeof ENDPOINT_PATHS;
export type SyncHttpApiErrorCode =
  | ApiErrorCode
  | DeviceRegistrationErrorCode
  | AccountExportErrorCode
  | AccountDeletionErrorCode;

export interface AuthenticatedSyncSession {
  readonly accessToken: string;
  readonly userId: string;
}

export type AuthenticatedSyncSessionProvider = () =>
  AuthenticatedSyncSession | null | Promise<AuthenticatedSyncSession | null>;

export type SyncFetch = (input: string, init: RequestInit) => Promise<Response>;

export interface SyncHttpClientOptions {
  /** Origine absolue sur mobile, ou chaîne vide pour l'origine courante du web. */
  readonly baseUrl: string;
  /** Compte auquel l'outbox et chaque session relue doivent appartenir. */
  readonly expectedUserId: string;
  /** Relue juste avant chaque requête afin de détecter aussi un changement de compte. */
  readonly getSession: AuthenticatedSyncSessionProvider;
  /** Dérogation explicite réservée aux serveurs HTTP d'un build local. */
  readonly allowInsecureHttp?: boolean;
  /** Délai total d'un appel réseau, borné à deux minutes. */
  readonly timeoutMs?: number;
  /** Point d'injection pour les tests et les runtimes sans `globalThis.fetch`. */
  readonly fetch?: SyncFetch;
}

export class SyncHttpConfigurationError extends Error {
  public constructor() {
    super("La configuration du transport de synchronisation est invalide.");
    this.name = "SyncHttpConfigurationError";
  }
}

export class SyncHttpRequestValidationError extends Error {
  public readonly endpoint: SyncHttpEndpoint;

  public constructor(endpoint: SyncHttpEndpoint) {
    super("La requête locale ne respecte pas le contrat de synchronisation.");
    this.name = "SyncHttpRequestValidationError";
    this.endpoint = endpoint;
  }
}

export class SyncHttpAuthenticationError extends Error {
  public readonly endpoint: SyncHttpEndpoint;
  public readonly retryable = false;

  public constructor(endpoint: SyncHttpEndpoint) {
    super("Aucune session valide n'est disponible pour la synchronisation.");
    this.name = "SyncHttpAuthenticationError";
    this.endpoint = endpoint;
  }
}

export class SyncHttpTransportError extends Error {
  public readonly endpoint: SyncHttpEndpoint;
  public readonly retryable = true;

  public constructor(endpoint: SyncHttpEndpoint) {
    super("Le service de synchronisation est momentanément injoignable.");
    this.name = "SyncHttpTransportError";
    this.endpoint = endpoint;
  }
}

export type SyncHttpProtocolFailure =
  | "invalid_content_type"
  | "invalid_json"
  | "invalid_error_response"
  | "invalid_success_response"
  | "response_mismatch";

export class SyncHttpProtocolError extends Error {
  public readonly endpoint: SyncHttpEndpoint;
  public readonly reason: SyncHttpProtocolFailure;
  public readonly retryable: boolean;

  public constructor(
    endpoint: SyncHttpEndpoint,
    reason: SyncHttpProtocolFailure,
    status?: number,
  ) {
    super("La réponse du service ne respecte pas le protocole attendu.");
    this.name = "SyncHttpProtocolError";
    this.endpoint = endpoint;
    this.reason = reason;
    this.retryable =
      status === 408 ||
      status === 429 ||
      (status !== undefined && status >= 500);
  }
}

export class SyncHttpApiError extends Error {
  public readonly endpoint: SyncHttpEndpoint;
  public readonly status: number;
  public readonly code: SyncHttpApiErrorCode;
  public readonly requestId: string | undefined;
  public readonly retryable: boolean;

  public constructor(input: {
    readonly endpoint: SyncHttpEndpoint;
    readonly status: number;
    readonly code: SyncHttpApiErrorCode;
    readonly requestId?: string;
  }) {
    super("Le service a refusé la requête de synchronisation.");
    this.name = "SyncHttpApiError";
    this.endpoint = input.endpoint;
    this.status = input.status;
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable =
      input.status === 408 ||
      input.status === 429 ||
      input.status >= 500 ||
      input.code === "concurrent_update" ||
      input.code === "deletion_in_progress";
  }
}

/**
 * Seuls les refus fermés que le même rejeu ne peut jamais réparer deviennent
 * des rejets locaux. Auth, suppression, transport, throttling, 5xx et dérive
 * de protocole restent hors de cette classification.
 */
export function classifyContentReportRejection(
  error: unknown,
): ContentReportRejectionReason | null {
  if (
    !(error instanceof SyncHttpApiError) ||
    error.endpoint !== "content_report" ||
    error.retryable
  ) {
    return null;
  }
  if (error.status === 409 && error.code === "idempotency_key_reused") {
    return "idempotency_key_reused";
  }
  if (error.status === 422 && error.code === "invalid_request") {
    return "invalid_request";
  }
  return null;
}

export interface SyncHttpClient {
  registerDevice(
    registration: DeviceRegistrationRequest,
  ): Promise<DeviceRegistrationResponse>;
  sendAttemptBatch(
    prepared: PreparedAttemptOutboxBatch,
  ): Promise<AttemptBatchResponse>;
  sendContentReport(
    entry: ContentReportOutboxEntry,
  ): Promise<ContentReportResponse>;
  getProgressSnapshot(): Promise<ProgressSnapshotResponse>;
  getAccountExport(signal?: AbortSignal): Promise<AccountExportDocument>;
  deleteAccount(
    headers: AccountDeletionHeaders,
    signal?: AbortSignal,
  ): Promise<AccountDeletionReceipt>;
}

function normalizeBaseUrl(input: string, allowInsecureHttp: boolean): string {
  const value = input.trim();
  if (value === "") return "";

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new SyncHttpConfigurationError();
  }

  if (
    (url.protocol !== "https:" &&
      !(allowInsecureHttp && url.protocol === "http:")) ||
    url.username !== "" ||
    url.password !== "" ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new SyncHttpConfigurationError();
  }

  return url.href.replace(/\/+$/u, "");
}

function endpointUrl(baseUrl: string, endpoint: SyncHttpEndpoint): string {
  return `${baseUrl}${ENDPOINT_PATHS[endpoint]}`;
}

function assertJsonResponse(
  response: Response,
  endpoint: SyncHttpEndpoint,
): void {
  const mediaType = response.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  if (mediaType !== "application/json") {
    throw new SyncHttpProtocolError(
      endpoint,
      "invalid_content_type",
      response.status,
    );
  }
}

async function readJsonResponse(
  response: Response,
  endpoint: SyncHttpEndpoint,
  signal: AbortSignal,
): Promise<unknown> {
  assertJsonResponse(response, endpoint);
  try {
    return (await response.json()) as unknown;
  } catch {
    if (signal.aborted) throw new SyncHttpTransportError(endpoint);
    throw new SyncHttpProtocolError(endpoint, "invalid_json", response.status);
  }
}

function parseRequest<T>(
  schema: z.ZodType<T>,
  input: unknown,
  endpoint: SyncHttpEndpoint,
): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new SyncHttpRequestValidationError(endpoint);
  return result.data;
}

function assertAttemptResponseMatchesBatch(
  response: AttemptBatchResponse,
  batch: AttemptBatch,
): void {
  if (response.results.length !== batch.attempts.length) {
    throw new SyncHttpProtocolError("attempt_batch", "response_mismatch");
  }

  response.results.forEach((result, index) => {
    if (result.eventId !== batch.attempts[index]?.eventId) {
      throw new SyncHttpProtocolError("attempt_batch", "response_mismatch");
    }
  });
}

function assertRegistrationResponseMatchesRequest(
  response: DeviceRegistrationResponse,
  request: DeviceRegistrationRequest,
): void {
  if (
    response.device.deviceId !== request.deviceId ||
    response.device.platform !== request.platform ||
    response.device.appVersion !== request.appVersion
  ) {
    throw new SyncHttpProtocolError("device_registration", "response_mismatch");
  }
}

export function createSyncHttpClient(
  options: SyncHttpClientOptions,
): SyncHttpClient {
  const baseUrl = normalizeBaseUrl(
    options.baseUrl,
    options.allowInsecureHttp === true,
  );
  const timeoutMs = options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
  if (
    !Number.isInteger(timeoutMs) ||
    timeoutMs < 1 ||
    timeoutMs > MAX_REQUEST_TIMEOUT_MS
  ) {
    throw new SyncHttpConfigurationError();
  }
  const expectedUserIdResult = canonicalUuidSchema.safeParse(
    options.expectedUserId,
  );
  if (!expectedUserIdResult.success) throw new SyncHttpConfigurationError();
  const expectedUserId = expectedUserIdResult.data;
  const fetchImplementation = options.fetch ?? globalThis.fetch;
  if (typeof fetchImplementation !== "function") {
    throw new SyncHttpConfigurationError();
  }

  async function accessToken(endpoint: SyncHttpEndpoint): Promise<string> {
    let candidate: unknown;
    try {
      candidate = await options.getSession();
    } catch {
      throw new SyncHttpAuthenticationError(endpoint);
    }

    const result = authenticatedSyncSessionSchema.safeParse(candidate);
    if (!result.success || result.data.userId !== expectedUserId) {
      throw new SyncHttpAuthenticationError(endpoint);
    }
    return result.data.accessToken;
  }

  async function accountDeletionAccessToken(): Promise<string | undefined> {
    let candidate: unknown;
    try {
      candidate = await options.getSession();
    } catch {
      return undefined;
    }

    const result = authenticatedSyncSessionSchema.safeParse(candidate);
    if (!result.success || result.data.userId !== expectedUserId) {
      return undefined;
    }
    return result.data.accessToken;
  }

  async function request(input: {
    readonly endpoint: SyncHttpEndpoint;
    readonly method: "DELETE" | "GET" | "POST";
    readonly body?: unknown;
    readonly idempotencyKey?: string;
    readonly continuationSecret?: string;
    readonly signal?: AbortSignal;
  }): Promise<unknown> {
    const externalSignalIsAborted = () => input.signal?.aborted === true;
    if (externalSignalIsAborted()) {
      throw new SyncHttpTransportError(input.endpoint);
    }
    const token =
      input.endpoint === "account_deletion"
        ? await accountDeletionAccessToken()
        : await accessToken(input.endpoint);
    if (externalSignalIsAborted()) {
      throw new SyncHttpTransportError(input.endpoint);
    }
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token !== undefined) headers.Authorization = `Bearer ${token}`;
    if (input.body !== undefined) headers["Content-Type"] = "application/json";
    if (input.idempotencyKey !== undefined) {
      headers["Idempotency-Key"] = input.idempotencyKey;
    }
    if (input.continuationSecret !== undefined) {
      headers[ACCOUNT_DELETION_CONTINUATION_HEADER] = input.continuationSecret;
    }

    let response: Response;
    let payload: unknown;
    const controller = new AbortController();
    const abortFromExternalSignal = () => controller.abort();
    input.signal?.addEventListener("abort", abortFromExternalSignal, {
      once: true,
    });
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      try {
        response = await fetchImplementation(
          endpointUrl(baseUrl, input.endpoint),
          {
            method: input.method,
            headers,
            credentials: "omit",
            signal: controller.signal,
            ...(input.body === undefined
              ? {}
              : { body: JSON.stringify(input.body) }),
          },
        );
      } catch {
        throw new SyncHttpTransportError(input.endpoint);
      }
      payload = await readJsonResponse(
        response,
        input.endpoint,
        controller.signal,
      );
    } finally {
      clearTimeout(timeout);
      input.signal?.removeEventListener("abort", abortFromExternalSignal);
    }

    if (response.ok) return payload;

    const errorResult = (() => {
      if (input.endpoint === "account_deletion") {
        return accountDeletionErrorResponseSchema.safeParse(payload);
      }
      if (input.endpoint === "account_export") {
        return accountExportErrorResponseSchema.safeParse(payload);
      }
      if (input.endpoint === "device_registration") {
        return deviceRegistrationErrorResponseSchema.safeParse(payload);
      }
      return apiErrorResponseSchema.safeParse(payload);
    })();
    if (!errorResult.success) {
      throw new SyncHttpProtocolError(
        input.endpoint,
        "invalid_error_response",
        response.status,
      );
    }

    throw new SyncHttpApiError({
      endpoint: input.endpoint,
      status: response.status,
      code: errorResult.data.error.code,
      ...(errorResult.data.error.requestId === undefined
        ? {}
        : { requestId: errorResult.data.error.requestId }),
    });
  }

  return {
    async registerDevice(registrationInput) {
      const registration = parseRequest(
        deviceRegistrationRequestSchema,
        registrationInput,
        "device_registration",
      );
      const payload = await request({
        endpoint: "device_registration",
        method: "POST",
        body: registration,
      });
      const response = deviceRegistrationResponseSchema.safeParse(payload);
      if (!response.success) {
        throw new SyncHttpProtocolError(
          "device_registration",
          "invalid_success_response",
        );
      }
      assertRegistrationResponseMatchesRequest(response.data, registration);
      return response.data;
    },

    async sendAttemptBatch(preparedInput) {
      const prepared = parseRequest(
        preparedAttemptBatchSchema,
        preparedInput,
        "attempt_batch",
      );
      const payload = await request({
        endpoint: "attempt_batch",
        method: "POST",
        body: prepared.batch,
        idempotencyKey: prepared.idempotencyKey,
      });
      const response = attemptBatchResponseSchema.safeParse(payload);
      if (!response.success) {
        throw new SyncHttpProtocolError(
          "attempt_batch",
          "invalid_success_response",
        );
      }
      assertAttemptResponseMatchesBatch(response.data, prepared.batch);
      return response.data;
    },

    async sendContentReport(entryInput) {
      const entry = parseRequest(
        contentReportOutboxEntrySchema,
        entryInput,
        "content_report",
      );
      const payload = await request({
        endpoint: "content_report",
        method: "POST",
        body: entry.body,
        idempotencyKey: entry.idempotencyKey,
      });
      const response = contentReportResponseSchema.safeParse(payload);
      if (!response.success) {
        throw new SyncHttpProtocolError(
          "content_report",
          "invalid_success_response",
        );
      }

      // Une réponse du compte A ne doit jamais acquitter sa file après A→B.
      await accessToken("content_report");
      return response.data;
    },

    async getProgressSnapshot() {
      const payload = await request({
        endpoint: "progress_snapshot",
        method: "GET",
      });
      const response = progressSnapshotResponseSchema.safeParse(payload);
      if (!response.success) {
        throw new SyncHttpProtocolError(
          "progress_snapshot",
          "invalid_success_response",
        );
      }
      return response.data;
    },

    async getAccountExport(signal) {
      const payload = await request({
        endpoint: "account_export",
        method: "GET",
        ...(signal === undefined ? {} : { signal }),
      });
      const response = accountExportDocumentSchema.safeParse(payload);
      if (!response.success) {
        throw new SyncHttpProtocolError(
          "account_export",
          "invalid_success_response",
        );
      }
      if (response.data.identity.id !== expectedUserId) {
        throw new SyncHttpProtocolError("account_export", "response_mismatch");
      }

      // Une réponse valide du compte A ne doit jamais être remise après A→B.
      await accessToken("account_export");
      if (signal?.aborted === true) {
        throw new SyncHttpTransportError("account_export");
      }
      return response.data;
    },

    async deleteAccount(headersInput, signal) {
      const deletionHeaders = parseRequest(
        accountDeletionHeadersSchema,
        headersInput,
        "account_deletion",
      );
      const payload = await request({
        endpoint: "account_deletion",
        method: "DELETE",
        body: { confirmation: ACCOUNT_DELETION_CONFIRMATION },
        idempotencyKey: deletionHeaders.idempotencyKey,
        continuationSecret: deletionHeaders.continuationSecret,
        ...(signal === undefined ? {} : { signal }),
      });
      const response = accountDeletionReceiptSchema.safeParse(payload);
      if (!response.success) {
        throw new SyncHttpProtocolError(
          "account_deletion",
          "invalid_success_response",
        );
      }
      return response.data;
    },
  };
}
