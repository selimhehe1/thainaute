import { Buffer } from "node:buffer";
import { createHash, timingSafeEqual } from "node:crypto";
import { createServer, request as createHttpRequest } from "node:http";
import { isIP } from "node:net";
import { resolve } from "node:path";
import process from "node:process";
import { URL, fileURLToPath } from "node:url";

export const FAULT_PROXY_STATE_PATH = "/.__thainaute_qa/fault-proxy/state";
export const FAULT_PROXY_ARM_PATH = "/.__thainaute_qa/fault-proxy/arm";

const ATTEMPT_BATCH_PATH = "/api/v1/attempts/batch";
const DEFAULT_LISTEN_HOST = "127.0.0.1";
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const MAX_BUFFERED_ATTEMPT_BYTES = 1_048_576;
const MAX_BUFFERED_RESPONSE_BYTES = 2_097_152;
const CANONICAL_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;
const ATTEMPT_REJECTION_CODES = new Set([
  "answer_key_not_found",
  "invalid_submission",
  "event_id_collision",
  "device_not_registered",
]);
const SKILL_DIMENSIONS = new Set([
  "listening",
  "reading",
  "recall",
  "production",
  "tone",
]);
const LEARNER_STATUSES = new Set(["new", "learning", "confirmed"]);
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const SAFE_ERRORS = Object.freeze({
  invalidRequest: {
    error: {
      code: "invalid_request",
      message: "La requête QA locale est invalide.",
    },
  },
  invalidIdempotencyKey: {
    error: {
      code: "invalid_idempotency_key",
      message: "La clé d’idempotence QA est absente ou ambiguë.",
    },
  },
  publicOrigin: {
    error: {
      code: "unauthorized",
      message: "Le proxy QA refuse les origines non locales.",
    },
  },
  replayMismatch: {
    error: {
      code: "idempotency_key_reused",
      message: "Le rejeu QA ne correspond pas à la mutation committée.",
    },
  },
  replayResponseMismatch: {
    error: {
      code: "internal_error",
      message: "La réponse idempotente locale ne correspond pas au commit.",
    },
  },
  stateConflict: {
    error: {
      code: "concurrent_update",
      message: "Le proxy QA traite déjà une preuve d’idempotence.",
    },
  },
  upstreamUnavailable: {
    error: {
      code: "internal_error",
      message: "La cible locale du proxy QA est momentanément indisponible.",
    },
  },
});

export class FaultProxyConfigurationError extends Error {
  constructor() {
    super("La configuration du proxy QA local est invalide.");
    this.name = "FaultProxyConfigurationError";
  }
}

export class FaultProxyStateError extends Error {
  constructor() {
    super("Le proxy QA traite déjà une preuve d’idempotence.");
    this.name = "FaultProxyStateError";
  }
}

function normalizeAddress(value) {
  return value
    .toLowerCase()
    .replace(/^\[|\]$/gu, "")
    .split("%", 1)[0];
}

export function isLoopbackAddress(value) {
  if (typeof value !== "string" || value === "") return false;
  const address = normalizeAddress(value);
  if (address === "::1" || address === "0:0:0:0:0:0:0:1") return true;
  if (address.startsWith("::ffff:")) {
    return isLoopbackAddress(address.slice("::ffff:".length));
  }
  if (isIP(address) !== 4) return false;
  const octets = address.split(".").map(Number);
  return (
    octets.length === 4 &&
    octets[0] === 127 &&
    octets.every((octet) => Number.isInteger(octet) && octet <= 255)
  );
}

function validateTargetOrigin(input) {
  let target;
  try {
    target = new URL(input);
  } catch {
    throw new FaultProxyConfigurationError();
  }

  if (
    target.protocol !== "http:" ||
    !isLoopbackAddress(target.hostname) ||
    target.username !== "" ||
    target.password !== "" ||
    target.pathname !== "/" ||
    target.search !== "" ||
    target.hash !== ""
  ) {
    throw new FaultProxyConfigurationError();
  }
  return target;
}

function validateOptions(options) {
  if (options === null || typeof options !== "object") {
    throw new FaultProxyConfigurationError();
  }
  const listenHost = options.listenHost ?? DEFAULT_LISTEN_HOST;
  const port = options.port ?? 0;
  const timeoutMs = options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
  if (
    !isLoopbackAddress(listenHost) ||
    !Number.isInteger(port) ||
    port < 0 ||
    port > 65_535 ||
    !Number.isInteger(timeoutMs) ||
    timeoutMs < 1 ||
    timeoutMs > 120_000 ||
    (options.logger !== undefined && typeof options.logger !== "function") ||
    (options.armed !== undefined && typeof options.armed !== "boolean")
  ) {
    throw new FaultProxyConfigurationError();
  }
  return {
    target: validateTargetOrigin(options.targetOrigin),
    listenHost,
    port,
    timeoutMs,
    armed: options.armed === true,
    logger: options.logger,
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value, required, optional = []) {
  const allowed = new Set([...required, ...optional]);
  const keys = Object.keys(value);
  return (
    required.every((key) => Object.hasOwn(value, key)) &&
    keys.every((key) => allowed.has(key))
  );
}

function safeLog(logger, event, fields = {}) {
  if (logger === undefined) return;
  try {
    logger(Object.freeze({ event, ...fields }));
  } catch {
    // L’observabilité QA ne doit jamais influer sur le transport testé.
  }
}

function writeJson(response, status, payload) {
  if (response.destroyed || response.writableEnded) return;
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body),
    "content-type": "application/json; charset=utf-8",
  });
  response.end(body);
}

function rejectRequest(request, response, status, payload) {
  request.resume();
  writeJson(response, status, payload);
}

function distinctHeaderValues(message, name) {
  const values = message.headersDistinct?.[name];
  if (values === undefined) return [];
  return values;
}

function singleHeaderValue(message, name) {
  const values = distinctHeaderValues(message, name);
  if (values.length !== 1) return null;
  const value = values[0]?.trim();
  return value === undefined || value === "" ? null : value;
}

function requestComesFromAllowedOrigin(request) {
  if (request.headers["sec-fetch-site"] === "cross-site") return false;
  const origins = distinctHeaderValues(request, "origin");
  if (origins.length === 0) return true;
  if (origins.length !== 1) return false;
  try {
    const origin = new URL(origins[0]);
    return (
      (origin.protocol === "http:" || origin.protocol === "https:") &&
      isLoopbackAddress(origin.hostname) &&
      origin.username === "" &&
      origin.password === "" &&
      origin.pathname === "/" &&
      origin.search === "" &&
      origin.hash === ""
    );
  } catch {
    return false;
  }
}

function relativeTargetUrl(requestUrl, targetOrigin) {
  if (
    typeof requestUrl !== "string" ||
    requestUrl === "" ||
    requestUrl.startsWith("//") ||
    /^[a-z][a-z\d+.-]*:/iu.test(requestUrl)
  ) {
    return null;
  }
  try {
    const targetUrl = new URL(requestUrl, targetOrigin);
    return targetUrl.origin === targetOrigin.origin ? targetUrl : null;
  } catch {
    return null;
  }
}

function connectionHeaderNames(headers) {
  const names = new Set(HOP_BY_HOP_HEADERS);
  const connection = headers.connection;
  const values = Array.isArray(connection) ? connection : [connection];
  for (const value of values) {
    if (typeof value !== "string") continue;
    for (const name of value.split(",")) names.add(name.trim().toLowerCase());
  }
  return names;
}

function forwardedHeaders(message, target, bodyLength) {
  const skipped = connectionHeaderNames(message.headers);
  const headers = {};
  for (const [name, value] of Object.entries(message.headers)) {
    if (
      value !== undefined &&
      name !== "host" &&
      name !== "content-length" &&
      !skipped.has(name)
    ) {
      headers[name] = value;
    }
  }
  headers.host = target.host;
  headers.connection = "close";
  if (bodyLength !== undefined) headers["content-length"] = String(bodyLength);
  return headers;
}

function responseHeaders(message) {
  const skipped = connectionHeaderNames(message.headers);
  const headers = {};
  for (const [name, value] of Object.entries(message.headers)) {
    if (value !== undefined && !skipped.has(name)) headers[name] = value;
  }
  headers.connection = "close";
  return headers;
}

function collectBody(stream, maximumBytes) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    let size = 0;
    let settled = false;

    const fail = () => {
      if (settled) return;
      settled = true;
      rejectBody(new Error("buffer_limit_or_stream_failure"));
    };

    stream.on("data", (chunk) => {
      if (settled) return;
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buffer.length;
      if (size > maximumBytes) {
        fail();
        stream.destroy();
        return;
      }
      chunks.push(buffer);
    });
    stream.once("aborted", fail);
    stream.once("error", fail);
    stream.once("end", () => {
      if (settled) return;
      settled = true;
      resolveBody(Buffer.concat(chunks, size));
    });
  });
}

function validUtcTimestamp(value) {
  if (typeof value !== "string") return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}

function statusCounts(results) {
  const counts = { acceptedCount: 0, duplicateCount: 0, rejectedCount: 0 };
  for (const result of results) {
    if (
      !isPlainObject(result) ||
      typeof result.eventId !== "string" ||
      !CANONICAL_UUID_PATTERN.test(result.eventId)
    ) {
      return null;
    }
    if (result.status === "accepted" || result.status === "duplicate") {
      if (
        !hasExactKeys(
          result,
          ["eventId", "status", "rating"],
          ["feedbackFr"],
        ) ||
        (result.rating !== 0 && result.rating !== 1) ||
        (result.feedbackFr !== undefined &&
          (typeof result.feedbackFr !== "string" ||
            result.feedbackFr.length < 1 ||
            result.feedbackFr.length > 280))
      ) {
        return null;
      }
      if (result.status === "accepted") counts.acceptedCount += 1;
      else counts.duplicateCount += 1;
      continue;
    }
    if (
      result.status !== "rejected" ||
      !hasExactKeys(result, ["eventId", "status", "code"]) ||
      !ATTEMPT_REJECTION_CODES.has(result.code)
    ) {
      return null;
    }
    counts.rejectedCount += 1;
  }
  return counts;
}

function validatedLearnerStates(states) {
  let previousKey;
  for (const state of states) {
    if (
      !isPlainObject(state) ||
      !hasExactKeys(state, [
        "itemId",
        "skill",
        "masteryPermille",
        "status",
        "attemptCount",
        "successfulAttempts",
        "consecutiveCorrect",
        "dueAt",
        "algorithmVersion",
      ]) ||
      typeof state.itemId !== "string" ||
      !CANONICAL_UUID_PATTERN.test(state.itemId) ||
      !SKILL_DIMENSIONS.has(state.skill) ||
      !Number.isInteger(state.masteryPermille) ||
      state.masteryPermille < 0 ||
      state.masteryPermille > 1_000 ||
      !LEARNER_STATUSES.has(state.status) ||
      !Number.isInteger(state.attemptCount) ||
      state.attemptCount < 1 ||
      !Number.isInteger(state.successfulAttempts) ||
      state.successfulAttempts < 0 ||
      state.successfulAttempts > state.attemptCount ||
      !Number.isInteger(state.consecutiveCorrect) ||
      state.consecutiveCorrect < 0 ||
      state.consecutiveCorrect > state.successfulAttempts ||
      !validUtcTimestamp(state.dueAt) ||
      state.algorithmVersion !== "srs-v0"
    ) {
      return false;
    }
    const key = `${state.itemId}\u0000${state.skill}`;
    if (previousKey !== undefined && key <= previousKey) return false;
    previousKey = key;
  }
  return true;
}

function validatedProjection(upstreamResponse) {
  if (
    upstreamResponse.statusCode < 200 ||
    upstreamResponse.statusCode >= 300 ||
    upstreamResponse.complete !== true
  ) {
    return null;
  }
  const mediaType = String(upstreamResponse.headers["content-type"] ?? "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (mediaType !== "application/json") return null;

  let payload;
  try {
    payload = JSON.parse(upstreamResponse.body.toString("utf8"));
  } catch {
    return null;
  }
  if (
    !isPlainObject(payload) ||
    !hasExactKeys(payload, ["syncRevision", "results", "states"]) ||
    !Number.isInteger(payload.syncRevision) ||
    payload.syncRevision < 1 ||
    !Array.isArray(payload.results) ||
    payload.results.length < 1 ||
    payload.results.length > 50 ||
    !Array.isArray(payload.states) ||
    payload.states.length > 50
  ) {
    return null;
  }
  const counts = statusCounts(payload.results);
  if (counts === null || !validatedLearnerStates(payload.states)) return null;
  const singleState = payload.states.length === 1 ? payload.states[0] : null;

  return Object.freeze({
    syncRevision: payload.syncRevision,
    resultCount: payload.results.length,
    ...counts,
    stateCount: payload.states.length,
    singleStateAttemptCount: singleState?.attemptCount ?? null,
    singleStateMasteryPermille: singleState?.masteryPermille ?? null,
    singleStateStatus: singleState?.status ?? null,
    singleStateDueAt: singleState?.dueAt ?? null,
  });
}

function updateLengthPrefixed(hash, value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value));
  const length = Buffer.alloc(8);
  length.writeBigUInt64BE(BigInt(bytes.length));
  hash.update(length);
  hash.update(bytes);
}

function responseDigest(upstreamResponse) {
  const hash = createHash("sha256");
  hash.update("thainaute.qa.fault-proxy.response/v1\u0000");
  updateLengthPrefixed(hash, upstreamResponse.statusCode);
  const contentType = upstreamResponse.headers["content-type"];
  updateLengthPrefixed(
    hash,
    Array.isArray(contentType)
      ? contentType.join("\u0000")
      : (contentType ?? ""),
  );
  updateLengthPrefixed(hash, upstreamResponse.body);
  return hash.digest();
}

function bufferedUpstreamRequest({
  request,
  targetUrl,
  target,
  body,
  timeoutMs,
}) {
  return new Promise((resolveResponse, rejectResponse) => {
    let settled = false;
    const headers = forwardedHeaders(request, target, body.length);
    // Ce chemin doit lire et valider le JSON brut avant de couper la réponse.
    // Une compression négociée par le client rendrait ces octets opaques.
    headers["accept-encoding"] = "identity";
    const upstreamRequest = createHttpRequest(
      targetUrl,
      {
        method: request.method,
        headers,
        agent: false,
      },
      (upstreamResponse) => {
        void collectBody(upstreamResponse, MAX_BUFFERED_RESPONSE_BYTES).then(
          (responseBody) => {
            if (settled) return;
            settled = true;
            resolveResponse({
              statusCode: upstreamResponse.statusCode ?? 502,
              statusMessage: upstreamResponse.statusMessage,
              headers: upstreamResponse.headers,
              complete: upstreamResponse.complete,
              body: responseBody,
            });
          },
          () => {
            if (settled) return;
            settled = true;
            rejectResponse(new Error("upstream_response_failure"));
          },
        );
      },
    );
    upstreamRequest.setTimeout(timeoutMs, () => {
      upstreamRequest.destroy(new Error("upstream_timeout"));
    });
    upstreamRequest.once("error", () => {
      if (settled) return;
      settled = true;
      rejectResponse(new Error("upstream_request_failure"));
    });
    upstreamRequest.end(body);
  });
}

function deliverBufferedResponse(response, upstreamResponse) {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(
    upstreamResponse.statusCode,
    upstreamResponse.statusMessage,
    responseHeaders(upstreamResponse),
  );
  response.end(upstreamResponse.body);
}

function streamUpstreamRequest({
  request,
  response,
  targetUrl,
  target,
  timeoutMs,
}) {
  return new Promise((resolveRequest, rejectRequestPromise) => {
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      if (error === undefined) resolveRequest();
      else rejectRequestPromise(error);
    };
    const upstreamRequest = createHttpRequest(
      targetUrl,
      {
        method: request.method,
        headers: forwardedHeaders(request, target),
        agent: false,
      },
      (upstreamResponse) => {
        if (!response.destroyed && !response.writableEnded) {
          response.writeHead(
            upstreamResponse.statusCode ?? 502,
            upstreamResponse.statusMessage,
            responseHeaders(upstreamResponse),
          );
          upstreamResponse.pipe(response);
        } else {
          upstreamResponse.resume();
        }
        upstreamResponse.once("end", () => finish());
        upstreamResponse.once("aborted", () =>
          finish(new Error("upstream_response_aborted")),
        );
        upstreamResponse.once("error", () =>
          finish(new Error("upstream_response_failure")),
        );
      },
    );
    upstreamRequest.setTimeout(timeoutMs, () => {
      upstreamRequest.destroy(new Error("upstream_timeout"));
    });
    upstreamRequest.once("error", () =>
      finish(new Error("upstream_request_failure")),
    );
    request.once("aborted", () => {
      upstreamRequest.destroy(new Error("client_request_aborted"));
    });
    request.pipe(upstreamRequest);
  });
}

function controlRequestHasBody(request) {
  const contentLength = singleHeaderValue(request, "content-length");
  if (contentLength !== null && contentLength !== "0") return true;
  return distinctHeaderValues(request, "transfer-encoding").length > 0;
}

function publicStateSnapshot(state) {
  const committedProjection =
    state.lastCommittedProjection === null
      ? null
      : Object.freeze({ ...state.lastCommittedProjection });
  const replayProjection =
    state.lastReplayProjection === null
      ? null
      : Object.freeze({ ...state.lastReplayProjection });
  return Object.freeze({
    armed: state.armed,
    injectionInProgress: state.injectionInProgress,
    awaitingReplay: state.awaitingReplay,
    faultInjected: state.faultInjected,
    attemptBatchRequests: state.attemptBatchRequests,
    forwardedRequests: state.forwardedRequests,
    committedAttemptBatches: state.committedAttemptBatches,
    droppedClientResponses: state.droppedClientResponses,
    validatedReplays: state.validatedReplays,
    replayMismatches: state.replayMismatches,
    preflightFailures: state.preflightFailures,
    lastReplayMatched: state.lastReplayMatched,
    lastReplayResponseMatched: state.lastReplayResponseMatched,
    lastCommittedProjection: committedProjection,
    lastReplayProjection: replayProjection,
  });
}

export function createMobileConnectedFaultProxy(options) {
  const config = validateOptions(options);
  const state = {
    armed: config.armed,
    injectionInProgress: false,
    awaitingReplay: false,
    faultInjected: false,
    attemptBatchRequests: 0,
    forwardedRequests: 0,
    committedAttemptBatches: 0,
    droppedClientResponses: 0,
    validatedReplays: 0,
    replayMismatches: 0,
    preflightFailures: 0,
    lastReplayMatched: null,
    lastReplayResponseMatched: null,
    lastCommittedProjection: null,
    lastReplayProjection: null,
  };
  let expectedReplay = null;
  let startResult = null;
  let closed = false;

  function armNextAttemptBatch() {
    if (
      closed ||
      state.armed ||
      state.injectionInProgress ||
      state.awaitingReplay ||
      expectedReplay !== null
    ) {
      throw new FaultProxyStateError();
    }
    state.armed = true;
    state.faultInjected = false;
    state.lastReplayMatched = null;
    state.lastReplayResponseMatched = null;
    state.lastCommittedProjection = null;
    state.lastReplayProjection = null;
    safeLog(config.logger, "fault_proxy_armed");
  }

  async function handleControlRequest(request, response, pathname) {
    if (pathname === FAULT_PROXY_STATE_PATH) {
      if (request.method !== "GET" || controlRequestHasBody(request)) {
        rejectRequest(request, response, 405, SAFE_ERRORS.invalidRequest);
        return;
      }
      writeJson(response, 200, publicStateSnapshot(state));
      return;
    }
    if (pathname === FAULT_PROXY_ARM_PATH) {
      if (request.method !== "POST" || controlRequestHasBody(request)) {
        rejectRequest(request, response, 405, SAFE_ERRORS.invalidRequest);
        return;
      }
      request.resume();
      try {
        armNextAttemptBatch();
      } catch {
        writeJson(response, 409, SAFE_ERRORS.stateConflict);
        return;
      }
      writeJson(response, 200, publicStateSnapshot(state));
    }
  }

  async function firstArmedAttempt(request, response, targetUrl) {
    // Réserver la fenêtre d'injection avant le premier await. Une seconde
    // requête concurrente doit être refusée, jamais bufferisée en parallèle.
    state.armed = false;
    state.injectionInProgress = true;
    const idempotencyKey = singleHeaderValue(request, "idempotency-key");
    if (idempotencyKey === null || idempotencyKey.length > 256) {
      state.armed = true;
      state.injectionInProgress = false;
      state.preflightFailures += 1;
      safeLog(config.logger, "fault_proxy_preflight_rejected");
      rejectRequest(request, response, 400, SAFE_ERRORS.invalidIdempotencyKey);
      return;
    }

    let body;
    try {
      body = await collectBody(request, MAX_BUFFERED_ATTEMPT_BYTES);
    } catch {
      state.armed = true;
      state.injectionInProgress = false;
      state.preflightFailures += 1;
      safeLog(config.logger, "fault_proxy_preflight_rejected");
      writeJson(response, 413, SAFE_ERRORS.invalidRequest);
      return;
    }

    expectedReplay = {
      idempotencyKey,
      bodyHash: createHash("sha256").update(body).digest(),
    };
    state.forwardedRequests += 1;

    let upstreamResponse;
    try {
      upstreamResponse = await bufferedUpstreamRequest({
        request,
        targetUrl,
        target: config.target,
        body,
        timeoutMs: config.timeoutMs,
      });
    } catch {
      expectedReplay = null;
      state.armed = true;
      state.injectionInProgress = false;
      safeLog(config.logger, "fault_proxy_upstream_unavailable");
      writeJson(response, 502, SAFE_ERRORS.upstreamUnavailable);
      return;
    }

    const projection = validatedProjection(upstreamResponse);
    if (projection === null) {
      expectedReplay = null;
      state.armed = true;
      state.injectionInProgress = false;
      safeLog(config.logger, "fault_proxy_response_not_committed");
      deliverBufferedResponse(response, upstreamResponse);
      return;
    }
    expectedReplay.responseDigest = responseDigest(upstreamResponse);

    state.injectionInProgress = false;
    state.awaitingReplay = true;
    state.faultInjected = true;
    state.committedAttemptBatches += 1;
    state.droppedClientResponses += 1;
    state.lastCommittedProjection = projection;
    safeLog(config.logger, "fault_proxy_response_dropped");

    response.destroy();
    request.socket.destroy();
  }

  async function expectedAttemptReplay(request, response, targetUrl) {
    // Même réservation synchrone pour le rejeu attendu : une seule requête
    // peut prouver la clé et le corps conservés à un instant donné.
    state.injectionInProgress = true;
    const idempotencyKey = singleHeaderValue(request, "idempotency-key");
    let body;
    try {
      body = await collectBody(request, MAX_BUFFERED_ATTEMPT_BYTES);
    } catch {
      state.injectionInProgress = false;
      state.preflightFailures += 1;
      safeLog(config.logger, "fault_proxy_preflight_rejected");
      writeJson(response, 413, SAFE_ERRORS.invalidRequest);
      return;
    }
    const bodyHash = createHash("sha256").update(body).digest();
    const replayMatches =
      expectedReplay !== null &&
      idempotencyKey === expectedReplay.idempotencyKey &&
      bodyHash.length === expectedReplay.bodyHash.length &&
      timingSafeEqual(bodyHash, expectedReplay.bodyHash);
    if (!replayMatches) {
      state.injectionInProgress = false;
      state.replayMismatches += 1;
      state.lastReplayMatched = false;
      safeLog(config.logger, "fault_proxy_replay_mismatch");
      writeJson(response, 409, SAFE_ERRORS.replayMismatch);
      return;
    }

    state.lastReplayMatched = true;
    state.lastReplayResponseMatched = null;
    state.forwardedRequests += 1;
    let upstreamResponse;
    try {
      upstreamResponse = await bufferedUpstreamRequest({
        request,
        targetUrl,
        target: config.target,
        body,
        timeoutMs: config.timeoutMs,
      });
    } catch {
      state.injectionInProgress = false;
      safeLog(config.logger, "fault_proxy_upstream_unavailable");
      writeJson(response, 502, SAFE_ERRORS.upstreamUnavailable);
      return;
    }

    state.injectionInProgress = false;
    const projection = validatedProjection(upstreamResponse);
    const replayResponseDigest = responseDigest(upstreamResponse);
    const responseMatches =
      expectedReplay !== null &&
      expectedReplay.responseDigest !== undefined &&
      replayResponseDigest.length === expectedReplay.responseDigest.length &&
      timingSafeEqual(replayResponseDigest, expectedReplay.responseDigest);
    state.lastReplayResponseMatched = responseMatches;
    if (projection === null || !responseMatches) {
      state.replayMismatches += 1;
      safeLog(config.logger, "fault_proxy_replay_response_mismatch");
      writeJson(response, 502, SAFE_ERRORS.replayResponseMismatch);
      return;
    }
    state.awaitingReplay = false;
    state.validatedReplays += 1;
    state.lastReplayProjection = projection;
    expectedReplay = null;
    safeLog(config.logger, "fault_proxy_replay_validated");
    deliverBufferedResponse(response, upstreamResponse);
  }

  async function handleRequest(request, response) {
    if (
      !isLoopbackAddress(request.socket.remoteAddress ?? "") ||
      !requestComesFromAllowedOrigin(request)
    ) {
      state.preflightFailures += 1;
      safeLog(config.logger, "fault_proxy_preflight_rejected");
      rejectRequest(request, response, 403, SAFE_ERRORS.publicOrigin);
      return;
    }

    const targetUrl = relativeTargetUrl(request.url, config.target);
    if (targetUrl === null) {
      state.preflightFailures += 1;
      safeLog(config.logger, "fault_proxy_preflight_rejected");
      rejectRequest(request, response, 400, SAFE_ERRORS.invalidRequest);
      return;
    }

    if (
      targetUrl.pathname === FAULT_PROXY_STATE_PATH ||
      targetUrl.pathname === FAULT_PROXY_ARM_PATH
    ) {
      await handleControlRequest(request, response, targetUrl.pathname);
      return;
    }

    const isAttemptBatch =
      request.method === "POST" && targetUrl.pathname === ATTEMPT_BATCH_PATH;
    if (isAttemptBatch) state.attemptBatchRequests += 1;

    if (isAttemptBatch && state.injectionInProgress) {
      state.preflightFailures += 1;
      safeLog(config.logger, "fault_proxy_preflight_rejected");
      rejectRequest(request, response, 409, SAFE_ERRORS.stateConflict);
      return;
    }
    if (isAttemptBatch && state.armed) {
      await firstArmedAttempt(request, response, targetUrl);
      return;
    }
    if (isAttemptBatch && state.awaitingReplay) {
      await expectedAttemptReplay(request, response, targetUrl);
      return;
    }

    state.forwardedRequests += 1;
    await streamUpstreamRequest({
      request,
      response,
      targetUrl,
      target: config.target,
      timeoutMs: config.timeoutMs,
    });
  }

  const server = createServer((request, response) => {
    void handleRequest(request, response).catch(() => {
      safeLog(config.logger, "fault_proxy_request_failed");
      if (response.headersSent) response.destroy();
      else writeJson(response, 502, SAFE_ERRORS.upstreamUnavailable);
    });
  });
  server.requestTimeout = config.timeoutMs;
  server.headersTimeout = Math.min(config.timeoutMs, 10_000);
  server.keepAliveTimeout = 1_000;
  server.on("clientError", (_error, socket) => {
    if (socket.writable) socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
    else socket.destroy();
  });

  async function start() {
    if (closed || startResult !== null) throw new FaultProxyStateError();
    await new Promise((resolveStart, rejectStart) => {
      const onError = () => {
        server.off("listening", onListening);
        rejectStart(new FaultProxyConfigurationError());
      };
      const onListening = () => {
        server.off("error", onError);
        resolveStart();
      };
      server.once("error", onError);
      server.once("listening", onListening);
      server.listen({
        host: config.listenHost,
        port: config.port,
        exclusive: true,
      });
    });
    const address = server.address();
    if (
      address === null ||
      typeof address === "string" ||
      !isLoopbackAddress(address.address)
    ) {
      await new Promise((resolveClose) => server.close(resolveClose));
      throw new FaultProxyConfigurationError();
    }
    const originHost =
      address.family === "IPv6" ? `[${address.address}]` : address.address;
    startResult = Object.freeze({
      origin: `http://${originHost}:${address.port}`,
      host: address.address,
      port: address.port,
    });
    safeLog(config.logger, "fault_proxy_ready", {
      origin: startResult.origin,
      controlStatePath: FAULT_PROXY_STATE_PATH,
      controlArmPath: FAULT_PROXY_ARM_PATH,
    });
    return startResult;
  }

  async function close() {
    if (closed) return;
    closed = true;
    expectedReplay = null;
    if (server.listening) {
      await new Promise((resolveClose) => {
        server.close(resolveClose);
        server.closeAllConnections();
      });
    }
    safeLog(config.logger, "fault_proxy_closed");
  }

  return Object.freeze({
    start,
    close,
    armNextAttemptBatch,
    getPublicState: () => publicStateSnapshot(state),
  });
}

function parseCliArguments(argv) {
  const options = { port: 0, listenHost: DEFAULT_LISTEN_HOST, armed: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--arm-at-start") {
      options.armed = true;
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined) throw new FaultProxyConfigurationError();
    if (argument === "--target-origin") options.targetOrigin = value;
    else if (argument === "--listen-host") options.listenHost = value;
    else if (argument === "--port") options.port = Number(value);
    else throw new FaultProxyConfigurationError();
    index += 1;
  }
  if (options.targetOrigin === undefined) {
    throw new FaultProxyConfigurationError();
  }
  return options;
}

async function runCli() {
  const proxy = createMobileConnectedFaultProxy({
    ...parseCliArguments(process.argv.slice(2)),
    logger: (entry) => process.stdout.write(`${JSON.stringify(entry)}\n`),
  });
  await proxy.start();
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    void proxy.close().finally(() => {
      process.exitCode = 0;
    });
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}

const isMainModule =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMainModule) {
  runCli().catch(() => {
    process.stderr.write('{"event":"fault_proxy_start_failed"}\n');
    process.exitCode = 1;
  });
}
