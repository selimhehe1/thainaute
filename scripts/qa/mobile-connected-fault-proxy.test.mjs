import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { createServer, request as createHttpRequest } from "node:http";
import { afterEach, describe, it } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { URL } from "node:url";
import { gzipSync } from "node:zlib";

import {
  FAULT_PROXY_ARM_PATH,
  FAULT_PROXY_STATE_PATH,
  FaultProxyConfigurationError,
  createMobileConnectedFaultProxy,
} from "./mobile-connected-fault-proxy.mjs";

const EVENT_ID = "10000000-0000-4000-8000-000000000001";
const ITEM_ID = "20000000-0000-4000-8000-000000000001";
const IDEMPOTENCY_KEY = "30000000-0000-4000-8000-000000000001";

const openServers = new Set();
const openProxies = new Set();

afterEach(async () => {
  await Promise.all([...openProxies].map((proxy) => proxy.close()));
  openProxies.clear();
  await Promise.all(
    [...openServers].map(
      (server) =>
        new Promise((resolveClose) => {
          server.close(() => resolveClose());
          server.closeAllConnections();
        }),
    ),
  );
  openServers.clear();
});

function readBody(stream) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.once("error", rejectBody);
    stream.once("aborted", () => rejectBody(new Error("aborted")));
    stream.once("end", () => resolveBody(Buffer.concat(chunks)));
  });
}

async function listen(server) {
  openServers.add(server);
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen({ host: "127.0.0.1", port: 0 }, resolveListen);
  });
  const address = server.address();
  assert.notEqual(address, null);
  assert.equal(typeof address, "object");
  return `http://127.0.0.1:${address.port}`;
}

async function startProxy(targetOrigin, options = {}) {
  const proxy = createMobileConnectedFaultProxy({
    targetOrigin,
    ...options,
  });
  openProxies.add(proxy);
  const started = await proxy.start();
  return { proxy, origin: started.origin };
}

function request(origin, path, options = {}) {
  const proxyUrl = new URL(origin);
  const url = new URL(path, origin);
  return new Promise((resolveResponse, rejectResponse) => {
    let settled = false;
    const finishError = (error) => {
      if (settled) return;
      settled = true;
      rejectResponse(error);
    };
    const outgoing = createHttpRequest(
      {
        protocol: proxyUrl.protocol,
        hostname: proxyUrl.hostname,
        port: proxyUrl.port,
        path: options.rawPath ?? `${url.pathname}${url.search}`,
        method: options.method ?? "GET",
        headers: options.headers,
        agent: false,
      },
      (incoming) => {
        void readBody(incoming).then((body) => {
          if (settled) return;
          settled = true;
          resolveResponse({
            status: incoming.statusCode,
            headers: incoming.headers,
            body,
            json: () => JSON.parse(body.toString("utf8")),
          });
        }, finishError);
      },
    );
    outgoing.once("error", finishError);
    outgoing.end(options.body);
  });
}

function openRequest(origin, path, options = {}) {
  const proxyUrl = new URL(origin);
  const url = new URL(path, origin);
  let settleResponse;
  let rejectResponse;
  const response = new Promise((resolve, reject) => {
    settleResponse = resolve;
    rejectResponse = reject;
  });
  let settled = false;
  const finishError = (error) => {
    if (settled) return;
    settled = true;
    rejectResponse(error);
  };
  const outgoing = createHttpRequest(
    {
      protocol: proxyUrl.protocol,
      hostname: proxyUrl.hostname,
      port: proxyUrl.port,
      path: `${url.pathname}${url.search}`,
      method: options.method ?? "POST",
      headers: options.headers,
      agent: false,
    },
    (incoming) => {
      void readBody(incoming).then((body) => {
        if (settled) return;
        settled = true;
        settleResponse({
          status: incoming.statusCode,
          headers: incoming.headers,
          body,
          json: () => JSON.parse(body.toString("utf8")),
        });
      }, finishError);
    },
  );
  outgoing.once("error", finishError);
  return { outgoing, response };
}

async function waitForProxyState(proxy, predicate) {
  const deadline = Date.now() + 2_000;
  while (!predicate(proxy.getPublicState())) {
    if (Date.now() >= deadline) {
      throw new Error("fault_proxy_state_timeout");
    }
    await delay(5);
  }
}

function attemptResponse(attemptCount = 1) {
  return {
    syncRevision: 1,
    results: [
      {
        eventId: EVENT_ID,
        status: "accepted",
        rating: 1,
        feedbackFr: "Réponse de fixture acceptée.",
      },
    ],
    states: [
      {
        itemId: ITEM_ID,
        skill: "listening",
        masteryPermille: 200,
        status: "learning",
        attemptCount,
        successfulAttempts: 1,
        consecutiveCorrect: 1,
        dueAt: "2026-08-10T10:00:00.000Z",
        algorithmVersion: "srs-v0",
      },
    ],
  };
}

function createIdempotentUpstream() {
  const mutations = new Map();
  const observations = {
    requestCount: 0,
    batchRequestCount: 0,
    ordinaryRequestCount: 0,
    lastAuthorization: null,
    lastBody: null,
  };
  const server = createServer((incoming, response) => {
    void (async () => {
      observations.requestCount += 1;
      const body = await readBody(incoming);
      observations.lastAuthorization = incoming.headers.authorization ?? null;
      observations.lastBody = body.toString("utf8");

      if (
        incoming.method !== "POST" ||
        new URL(incoming.url ?? "/", "http://local.invalid").pathname !==
          "/api/v1/attempts/batch"
      ) {
        observations.ordinaryRequestCount += 1;
        response.writeHead(202, {
          "content-type": "text/plain; charset=utf-8",
          "x-upstream-fixture": "forwarded",
        });
        response.end(body);
        return;
      }

      observations.batchRequestCount += 1;
      const key = incoming.headers["idempotency-key"];
      const bodyHash = createHash("sha256").update(body).digest("hex");
      const previous = typeof key === "string" ? mutations.get(key) : undefined;
      if (previous !== undefined && previous.bodyHash !== bodyHash) {
        response.writeHead(409, { "content-type": "application/json" });
        response.end(
          JSON.stringify({
            error: {
              code: "idempotency_key_reused",
              message: "Fixture mismatch.",
            },
          }),
        );
        return;
      }
      const stored = previous ?? {
        bodyHash,
        response: attemptResponse(1),
      };
      if (typeof key === "string") mutations.set(key, stored);
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(stored.response));
    })().catch(() => {
      response.writeHead(500).end();
    });
  });
  return { server, mutations, observations };
}

describe("mobile connected fault proxy", () => {
  it("refuse toute cible, écoute ou origine navigateur publique", async () => {
    assert.throws(
      () =>
        createMobileConnectedFaultProxy({
          targetOrigin: "http://198.51.100.10:3000",
        }),
      FaultProxyConfigurationError,
    );
    assert.throws(
      () =>
        createMobileConnectedFaultProxy({
          targetOrigin: "http://127.0.0.1:3000",
          listenHost: "0.0.0.0",
        }),
      FaultProxyConfigurationError,
    );

    const upstream = createIdempotentUpstream();
    const targetOrigin = await listen(upstream.server);
    const { proxy, origin } = await startProxy(targetOrigin);
    const response = await request(origin, "/health", {
      headers: {
        Origin: "https://public.example",
        "Sec-Fetch-Site": "cross-site",
      },
    });

    assert.equal(response.status, 403);
    assert.equal(upstream.observations.requestCount, 0);
    assert.equal(proxy.getPublicState().preflightFailures, 1);
  });

  it("transmet les requêtes ordinaires sans devenir un proxy ouvert", async () => {
    const upstream = createIdempotentUpstream();
    const targetOrigin = await listen(upstream.server);
    const { origin } = await startProxy(targetOrigin);
    const response = await request(origin, "/api/v1/devices/register?qa=1", {
      method: "POST",
      headers: {
        Authorization: "Bearer ordinary-forward-token",
        "Content-Type": "application/json",
      },
      body: '{"fixture":true}',
    });

    assert.equal(response.status, 202);
    assert.equal(response.headers["x-upstream-fixture"], "forwarded");
    assert.equal(response.body.toString("utf8"), '{"fixture":true}');
    assert.equal(upstream.observations.ordinaryRequestCount, 1);

    const absoluteForm = await request(origin, "/", {
      rawPath: "http://public.example/path",
    });
    assert.equal(absoluteForm.status, 400);
    assert.equal(upstream.observations.requestCount, 1);
  });

  it("coupe la première réponse seulement après une réponse 2xx valide, puis accepte le rejeu exact", async () => {
    const logs = [];
    const upstream = createIdempotentUpstream();
    const targetOrigin = await listen(upstream.server);
    const { proxy, origin } = await startProxy(targetOrigin, {
      armed: true,
      logger: (entry) => logs.push(entry),
    });
    const sensitiveToken = "qa-token-must-never-leak";
    const sensitiveOtp = "481516";
    const sensitiveEmail = "qa-private@example.test";
    const body = JSON.stringify({
      fixture: "body-must-never-leak",
      email: sensitiveEmail,
    });
    const headers = {
      Authorization: `Bearer ${sensitiveToken}`,
      "Content-Type": "application/json",
      "Idempotency-Key": IDEMPOTENCY_KEY,
      "X-QA-OTP": sensitiveOtp,
    };

    await assert.rejects(
      request(origin, "/api/v1/attempts/batch", {
        method: "POST",
        headers,
        body,
      }),
    );

    const afterDrop = proxy.getPublicState();
    assert.equal(upstream.observations.batchRequestCount, 1);
    assert.equal(upstream.mutations.size, 1);
    assert.equal(afterDrop.awaitingReplay, true);
    assert.equal(afterDrop.faultInjected, true);
    assert.equal(afterDrop.committedAttemptBatches, 1);
    assert.equal(afterDrop.droppedClientResponses, 1);
    assert.equal(afterDrop.lastCommittedProjection?.singleStateAttemptCount, 1);
    assert.equal(
      afterDrop.lastCommittedProjection?.singleStateMasteryPermille,
      200,
    );
    assert.equal(
      afterDrop.lastCommittedProjection?.singleStateStatus,
      "learning",
    );
    assert.equal(
      afterDrop.lastCommittedProjection?.singleStateDueAt,
      "2026-08-10T10:00:00.000Z",
    );

    const replay = await request(origin, "/api/v1/attempts/batch", {
      method: "POST",
      headers,
      body,
    });
    assert.equal(replay.status, 200);
    assert.deepEqual(replay.json(), attemptResponse(1));

    const stateResponse = await request(origin, FAULT_PROXY_STATE_PATH);
    assert.equal(stateResponse.status, 200);
    const state = stateResponse.json();
    assert.equal(state.attemptBatchRequests, 2);
    assert.equal(state.forwardedRequests, 2);
    assert.equal(state.droppedClientResponses, 1);
    assert.equal(state.validatedReplays, 1);
    assert.equal(state.lastReplayMatched, true);
    assert.equal(state.lastReplayResponseMatched, true);
    assert.equal(state.awaitingReplay, false);
    assert.equal(state.lastCommittedProjection.singleStateAttemptCount, 1);
    assert.equal(state.lastReplayProjection.singleStateAttemptCount, 1);
    assert.equal(state.lastReplayProjection.acceptedCount, 1);
    assert.equal(state.lastReplayProjection.duplicateCount, 0);
    assert.equal(upstream.observations.batchRequestCount, 2);
    assert.equal(upstream.mutations.size, 1);

    const observableText = JSON.stringify({ logs, state });
    const bodyHash = createHash("sha256").update(body).digest("hex");
    for (const forbidden of [
      sensitiveToken,
      sensitiveOtp,
      sensitiveEmail,
      "body-must-never-leak",
      IDEMPOTENCY_KEY,
      EVENT_ID,
      ITEM_ID,
      bodyHash,
    ]) {
      assert.equal(observableText.includes(forbidden), false);
    }
  });

  it("force identity pour valider le JSON bufferisé malgré un client demandant gzip", async () => {
    let receivedAcceptEncoding = null;
    const server = createServer((incoming, response) => {
      void readBody(incoming).then(() => {
        receivedAcceptEncoding = incoming.headers["accept-encoding"] ?? null;
        const payload = Buffer.from(JSON.stringify(attemptResponse(1)));
        response.writeHead(200, {
          "content-type": "application/json",
          ...(receivedAcceptEncoding === "identity"
            ? {}
            : { "content-encoding": "gzip" }),
        });
        response.end(
          receivedAcceptEncoding === "identity" ? payload : gzipSync(payload),
        );
      });
    });
    const targetOrigin = await listen(server);
    const { proxy, origin } = await startProxy(targetOrigin, { armed: true });

    await assert.rejects(
      request(origin, "/api/v1/attempts/batch", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, br",
          "Content-Type": "application/json",
          "Idempotency-Key": IDEMPOTENCY_KEY,
        },
        body: "{}",
      }),
    );

    assert.equal(receivedAcceptEncoding, "identity");
    const state = proxy.getPublicState();
    assert.equal(state.committedAttemptBatches, 1);
    assert.equal(state.droppedClientResponses, 1);
    assert.equal(state.awaitingReplay, true);
    assert.equal(state.lastCommittedProjection?.singleStateAttemptCount, 1);
  });

  it("refuse un rejeu dont la projection est identique mais la réponse brute diffère", async () => {
    let upstreamRequests = 0;
    const firstResponse = attemptResponse(1);
    const replayResponse = {
      ...attemptResponse(1),
      results: [
        {
          ...attemptResponse(1).results[0],
          feedbackFr: "Réponse de fixture modifiée au rejeu.",
        },
      ],
    };
    const server = createServer((incoming, response) => {
      void readBody(incoming).then(() => {
        upstreamRequests += 1;
        response.writeHead(200, { "content-type": "application/json" });
        response.end(
          JSON.stringify(
            upstreamRequests === 1 ? firstResponse : replayResponse,
          ),
        );
      });
    });
    const targetOrigin = await listen(server);
    const { proxy, origin } = await startProxy(targetOrigin, { armed: true });
    const headers = {
      "Content-Type": "application/json",
      "Idempotency-Key": IDEMPOTENCY_KEY,
    };

    await assert.rejects(
      request(origin, "/api/v1/attempts/batch", {
        method: "POST",
        headers,
        body: "{}",
      }),
    );
    const replay = await request(origin, "/api/v1/attempts/batch", {
      method: "POST",
      headers,
      body: "{}",
    });

    assert.equal(replay.status, 502);
    assert.equal(upstreamRequests, 2);
    const state = proxy.getPublicState();
    assert.equal(state.lastReplayMatched, true);
    assert.equal(state.lastReplayResponseMatched, false);
    assert.equal(state.validatedReplays, 0);
    assert.equal(state.replayMismatches, 1);
    assert.equal(state.awaitingReplay, true);
    assert.equal(state.lastReplayProjection, null);
    assert.equal(state.lastCommittedProjection.singleStateAttemptCount, 1);
    const publicState = JSON.stringify(state);
    assert.equal(publicState.includes(EVENT_ID), false);
    assert.equal(publicState.includes(ITEM_ID), false);
    assert.equal(
      publicState.includes(firstResponse.results[0].feedbackFr),
      false,
    );
    assert.equal(
      publicState.includes(replayResponse.results[0].feedbackFr),
      false,
    );
  });

  it("réserve synchroniquement l’injection et le rejeu pendant la lecture du corps", async () => {
    const upstream = createIdempotentUpstream();
    const targetOrigin = await listen(upstream.server);
    const { proxy, origin } = await startProxy(targetOrigin, { armed: true });
    const body = '{"attempts":[{"fixture":"concurrent"}]}';
    const splitAt = 17;
    const headers = {
      "Content-Type": "application/json",
      "Idempotency-Key": IDEMPOTENCY_KEY,
    };

    const first = openRequest(origin, "/api/v1/attempts/batch", { headers });
    void first.response.catch(() => undefined);
    first.outgoing.write(body.slice(0, splitAt));
    await waitForProxyState(
      proxy,
      (state) =>
        state.injectionInProgress === true && state.attemptBatchRequests === 1,
    );

    const concurrentInjection = await request(
      origin,
      "/api/v1/attempts/batch",
      {
        method: "POST",
        headers: {
          ...headers,
          "Idempotency-Key": "40000000-0000-4000-8000-000000000001",
        },
        body,
      },
    );
    assert.equal(concurrentInjection.status, 409);
    assert.equal(upstream.observations.batchRequestCount, 0);
    assert.equal(proxy.getPublicState().forwardedRequests, 0);

    first.outgoing.end(body.slice(splitAt));
    await assert.rejects(first.response);
    assert.equal(upstream.observations.batchRequestCount, 1);
    assert.equal(proxy.getPublicState().awaitingReplay, true);

    const replay = openRequest(origin, "/api/v1/attempts/batch", { headers });
    void replay.response.catch(() => undefined);
    replay.outgoing.write(body.slice(0, splitAt));
    await waitForProxyState(
      proxy,
      (state) =>
        state.injectionInProgress === true && state.attemptBatchRequests === 3,
    );

    const concurrentReplay = await request(origin, "/api/v1/attempts/batch", {
      method: "POST",
      headers,
      body,
    });
    assert.equal(concurrentReplay.status, 409);
    assert.equal(upstream.observations.batchRequestCount, 1);

    replay.outgoing.end(body.slice(splitAt));
    const replayResponse = await replay.response;
    assert.equal(replayResponse.status, 200);
    assert.equal(upstream.observations.batchRequestCount, 2);
    const state = proxy.getPublicState();
    assert.equal(state.attemptBatchRequests, 4);
    assert.equal(state.forwardedRequests, 2);
    assert.equal(state.preflightFailures, 2);
    assert.equal(state.droppedClientResponses, 1);
    assert.equal(state.validatedReplays, 1);
    assert.equal(state.lastReplayResponseMatched, true);
  });

  it("refuse clé ou corps différent sans le transmettre, puis conserve le rejeu attendu", async () => {
    const upstream = createIdempotentUpstream();
    const targetOrigin = await listen(upstream.server);
    const { proxy, origin } = await startProxy(targetOrigin, { armed: true });
    const originalBody = '{"attempts":[{"fixture":"original"}]}';
    const originalHeaders = {
      "Content-Type": "application/json",
      "Idempotency-Key": IDEMPOTENCY_KEY,
    };
    await assert.rejects(
      request(origin, "/api/v1/attempts/batch", {
        method: "POST",
        headers: originalHeaders,
        body: originalBody,
      }),
    );

    const wrongKey = await request(origin, "/api/v1/attempts/batch", {
      method: "POST",
      headers: {
        ...originalHeaders,
        "Idempotency-Key": "40000000-0000-4000-8000-000000000001",
      },
      body: originalBody,
    });
    assert.equal(wrongKey.status, 409);

    const wrongBody = await request(origin, "/api/v1/attempts/batch", {
      method: "POST",
      headers: originalHeaders,
      body: '{"attempts":[{"fixture":"changed"}]}',
    });
    assert.equal(wrongBody.status, 409);
    assert.equal(upstream.observations.batchRequestCount, 1);

    const rejectedState = proxy.getPublicState();
    assert.equal(rejectedState.awaitingReplay, true);
    assert.equal(rejectedState.replayMismatches, 2);
    assert.equal(rejectedState.lastReplayMatched, false);

    const validReplay = await request(origin, "/api/v1/attempts/batch", {
      method: "POST",
      headers: originalHeaders,
      body: originalBody,
    });
    assert.equal(validReplay.status, 200);
    assert.equal(proxy.getPublicState().validatedReplays, 1);
    assert.equal(upstream.observations.batchRequestCount, 2);
  });

  it("ne coupe pas une réponse 2xx qui ne respecte pas le contrat autoritaire", async () => {
    let upstreamRequests = 0;
    const server = createServer((incoming, response) => {
      void readBody(incoming).then(() => {
        upstreamRequests += 1;
        response.writeHead(200, { "content-type": "application/json" });
        response.end(
          JSON.stringify({
            syncRevision: 1,
            results: [{ eventId: EVENT_ID, status: "accepted" }],
            states: [],
          }),
        );
      });
    });
    const targetOrigin = await listen(server);
    const { proxy, origin } = await startProxy(targetOrigin, { armed: true });
    const response = await request(origin, "/api/v1/attempts/batch", {
      method: "POST",
      headers: { "Idempotency-Key": IDEMPOTENCY_KEY },
      body: "{}",
    });

    assert.equal(response.status, 200);
    assert.equal(upstreamRequests, 1);
    assert.deepEqual(proxy.getPublicState(), {
      armed: true,
      injectionInProgress: false,
      awaitingReplay: false,
      faultInjected: false,
      attemptBatchRequests: 1,
      forwardedRequests: 1,
      committedAttemptBatches: 0,
      droppedClientResponses: 0,
      validatedReplays: 0,
      replayMismatches: 0,
      preflightFailures: 0,
      lastReplayMatched: null,
      lastReplayResponseMatched: null,
      lastCommittedProjection: null,
      lastReplayProjection: null,
    });
  });

  it("arme via le contrôle local sans corps et ferme de manière idempotente", async () => {
    const upstream = createIdempotentUpstream();
    const targetOrigin = await listen(upstream.server);
    const { proxy, origin } = await startProxy(targetOrigin);

    const armed = await request(origin, FAULT_PROXY_ARM_PATH, {
      method: "POST",
    });
    assert.equal(armed.status, 200);
    assert.equal(armed.json().armed, true);

    const duplicateArm = await request(origin, FAULT_PROXY_ARM_PATH, {
      method: "POST",
    });
    assert.equal(duplicateArm.status, 409);

    await proxy.close();
    await proxy.close();
    openProxies.delete(proxy);
  });
});
