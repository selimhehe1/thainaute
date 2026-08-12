import assert from "node:assert/strict";
import process from "node:process";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { PassThrough } from "node:stream";
import { clearTimeout, setImmediate, setTimeout } from "node:timers";
import { URL } from "node:url";

import {
  EXPECTED_LOCAL_PUBLICATIONS,
  SupabaseLoopbackError,
  canonicalDockerPathname,
  createSupabaseLoopbackDockerProxy,
  dockerProxyEnvironment,
  privateSupabaseBridgeNetworkIsSafe,
  projectContainerNamesAreExact,
  purgeLocalSupabaseProjectResources,
  removeLocalSupabaseProjectContainers,
  rewriteDockerCreatePayload,
  rewriteDockerNetworkCreatePayload,
  rewriteLoopbackPortBindings,
} from "./lock-local-supabase-loopback.mjs";

const NAME = "supabase_kong_Thainaute";
const LABELS = Object.freeze({
  "com.docker.compose.project": "Thainaute",
  "com.supabase.cli.project": "Thainaute",
});

function createPayload(name = NAME, portBindings = null) {
  const expected = EXPECTED_LOCAL_PUBLICATIONS[name];
  const bindings =
    portBindings ??
    Object.fromEntries(
      Object.entries(expected ?? {}).map(([port, hostPort]) => [
        port,
        [{ HostIp: "", HostPort: hostPort }],
      ]),
    );
  return {
    Env: ["PRIVATE_FIXTURE=value"],
    HostConfig: {
      Binds: ["fixture:/fixture:rw"],
      NetworkMode: "supabase_network_Thainaute",
      PortBindings: bindings,
      PublishAllPorts: false,
    },
    Image: "fixture/image:latest",
    Labels: LABELS,
  };
}

function safeNetwork(overrides = {}) {
  return {
    Attachable: false,
    ConfigOnly: false,
    Driver: "bridge",
    EnableIPv4: true,
    EnableIPv6: false,
    Ingress: false,
    Internal: false,
    IPAM: {
      Config: [{ Gateway: "172.18.0.1", Subnet: "172.18.0.0/16" }],
      Driver: "default",
    },
    Labels: LABELS,
    Name: "supabase_network_Thainaute",
    Options: {
      "com.docker.network.enable_ipv4": "true",
      "com.docker.network.enable_ipv6": "false",
    },
    Scope: "local",
    ...overrides,
  };
}

function testSocketPath(label) {
  const id = randomUUID().replaceAll("-", "");
  return process.platform === "win32"
    ? `\\\\.\\pipe\\thainaute_${label}_${id}`
    : path.join(os.tmpdir(), `thainaute_${label}_${id}.sock`);
}

function proxyEndpoint(dockerHost) {
  const parsed = new URL(dockerHost);
  if (parsed.protocol === "tcp:") {
    return {
      connection: {
        host: parsed.hostname,
        port: Number(parsed.port),
      },
      pathPrefix: parsed.pathname.replace(/\/$/u, ""),
    };
  }
  return {
    connection: { socketPath: parsed.pathname },
    pathPrefix: "",
  };
}

async function listen(server, socketPath) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(socketPath, resolve);
  });
}

async function closeServer(server, socketPath) {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  if (process.platform !== "win32") await rm(socketPath, { force: true });
}

async function requestThroughSocket(endpoint, input) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        ...endpoint.connection,
        headers: input.headers,
        method: input.method ?? "GET",
        path: `${endpoint.pathPrefix}${input.path}`,
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () =>
          resolve({
            body: Buffer.concat(chunks).toString("utf8"),
            statusCode: response.statusCode,
          }),
        );
        response.on("error", reject);
      },
    );
    request.on("error", reject);
    request.end(input.body);
  });
}

describe("garde Docker loopback Supabase locale", () => {
  it("reecrit uniquement la publication attendue vers IPv4 loopback", () => {
    assert.deepEqual(
      rewriteLoopbackPortBindings(NAME, {
        "8000/tcp": [{ HostIp: "", HostPort: "54321" }],
      }),
      {
        "8000/tcp": [{ HostIp: "127.0.0.1", HostPort: "54321" }],
      },
    );
  });

  it("preserve le payload Docker opaque sans exposer son environnement", () => {
    const source = createPayload();
    const result = rewriteDockerCreatePayload(
      `/v1.55/containers/create?name=${NAME}`,
      source,
    );
    assert.equal(result.rewritten, true);
    assert.equal(result.name, NAME);
    assert.deepEqual(result.payload.Env, source.Env);
    assert.deepEqual(result.payload.HostConfig.Binds, source.HostConfig.Binds);
    assert.deepEqual(result.payload.HostConfig.PortBindings, {
      "8000/tcp": [{ HostIp: "127.0.0.1", HostPort: "54321" }],
    });
  });

  it("laisse passer un conteneur exact du projet qui ne publie rien", () => {
    const name = "supabase_auth_Thainaute";
    const source = createPayload(name, {});
    const result = rewriteDockerCreatePayload(
      `/containers/create?name=${name}`,
      source,
    );
    assert.equal(result.rewritten, false);
    assert.equal(result.payload, source);
  });

  it("autorise un job d'initialisation non nomme et non publie", () => {
    const source = {
      ...createPayload("supabase_auth_Thainaute", {}),
      Labels: {},
    };
    const result = rewriteDockerCreatePayload(
      "/v1.55/containers/create",
      source,
    );
    assert.equal(result.name, null);
    assert.equal(result.rewritten, false);
    assert.equal(result.payload, source);
  });

  it("force un NetworkCreate bridge et refuse macvlan ou IPAM impose", () => {
    const rewritten = rewriteDockerNetworkCreatePayload({
      Attachable: false,
      Driver: "bridge",
      EnableIPv6: false,
      IPAM: { Driver: "default" },
      Labels: LABELS,
      Name: "supabase_network_Thainaute",
    });
    assert.equal(rewritten.Driver, "bridge");
    assert.equal(rewritten.EnableIPv4, true);
    assert.deepEqual(rewritten.IPAM, { Driver: "default" });
    assert.throws(
      () =>
        rewriteDockerNetworkCreatePayload({
          ...rewritten,
          Driver: "macvlan",
        }),
      SupabaseLoopbackError,
    );
    assert.throws(
      () =>
        rewriteDockerNetworkCreatePayload({
          ...rewritten,
          IPAM: {
            Config: [{ Subnet: "203.0.113.0/24" }],
            Driver: "default",
          },
        }),
      SupabaseLoopbackError,
    );
  });

  it("atteste uniquement un bridge local sur un subnet RFC1918", () => {
    assert.equal(privateSupabaseBridgeNetworkIsSafe(safeNetwork()), true);
    assert.equal(
      privateSupabaseBridgeNetworkIsSafe(safeNetwork({ Options: {} })),
      true,
    );
    assert.equal(
      privateSupabaseBridgeNetworkIsSafe(safeNetwork({ Driver: "macvlan" })),
      false,
    );
    assert.equal(
      privateSupabaseBridgeNetworkIsSafe(
        safeNetwork({
          IPAM: {
            Config: [{ Gateway: "203.0.113.1", Subnet: "203.0.113.0/24" }],
            Driver: "default",
          },
        }),
      ),
      false,
    );
  });

  it("refuse labels, ports, cardinal et publications inattendus", () => {
    assert.throws(
      () =>
        rewriteDockerCreatePayload(`/containers/create?name=${NAME}`, {
          ...createPayload(),
          Labels: { "com.supabase.cli.project": "Thainaute" },
        }),
      SupabaseLoopbackError,
    );
    assert.throws(
      () =>
        rewriteDockerCreatePayload(
          "/containers/create?name=supabase_auth_Thainaute",
          createPayload("supabase_auth_Thainaute", {
            "9000/tcp": [{ HostIp: "", HostPort: "59999" }],
          }),
        ),
      SupabaseLoopbackError,
    );
    assert.throws(
      () =>
        rewriteLoopbackPortBindings(NAME, {
          "8000/tcp": [
            { HostIp: "", HostPort: "54321" },
            { HostIp: "::", HostPort: "54321" },
          ],
        }),
      SupabaseLoopbackError,
    );
    assert.throws(
      () =>
        rewriteLoopbackPortBindings(NAME, {
          "8000/tcp": [{ HostIp: "0.0.0.0", HostPort: "54321" }],
        }),
      SupabaseLoopbackError,
    );
    for (const unsafeHostConfig of [
      { NetworkMode: "host", PublishAllPorts: false },
      { NetworkMode: "supabase_network_Thainaute", PublishAllPorts: true },
    ]) {
      assert.throws(
        () =>
          rewriteDockerCreatePayload(`/containers/create?name=${NAME}`, {
            ...createPayload(),
            HostConfig: {
              ...createPayload().HostConfig,
              ...unsafeHostConfig,
            },
          }),
        SupabaseLoopbackError,
      );
    }
  });

  it("refuse les routes absolues et noms hors contrat", () => {
    assert.throws(
      () =>
        rewriteDockerCreatePayload(
          `http://attacker.invalid/containers/create?name=${NAME}`,
          createPayload(),
        ),
      SupabaseLoopbackError,
    );
    assert.throws(
      () =>
        rewriteDockerCreatePayload(
          "/containers/create?name=unrelated",
          createPayload(),
        ),
      SupabaseLoopbackError,
    );
  });

  it("refuse tout encodage ou normalisation ambiguë du pathname Docker", () => {
    assert.equal(
      canonicalDockerPathname(
        "/v1.55/%63ontainers/%63reate?name=supabase_db_Thainaute",
      ),
      "/v1.55/containers/create",
    );
    assert.equal(
      canonicalDockerPathname("/v1.55/%6Eetworks/create"),
      "/v1.55/networks/create",
    );
    assert.equal(
      canonicalDockerPathname("/v1.55/images/supabase%2Fpostgres:17/json"),
      "/v1.55/images/supabase/postgres:17/json",
    );
    for (const route of [
      "/v1.55/%2563ontainers/create",
      "/v1.55/containers/%2e%2e/containers/create",
      "/v1.55//containers/create",
    ]) {
      assert.throws(
        () => canonicalDockerPathname(route),
        SupabaseLoopbackError,
      );
    }
    assert.equal(
      canonicalDockerPathname("/v1.55/version?fixture=a%20b"),
      "/v1.55/version",
    );
  });

  it("exige l'ensemble exact des neuf services finaux", () => {
    const exact = [
      "supabase_auth_Thainaute",
      "supabase_db_Thainaute",
      "supabase_edge_runtime_Thainaute",
      "supabase_inbucket_Thainaute",
      "supabase_kong_Thainaute",
      "supabase_pg_meta_Thainaute",
      "supabase_realtime_Thainaute",
      "supabase_rest_Thainaute",
      "supabase_storage_Thainaute",
    ];
    assert.equal(projectContainerNamesAreExact(exact), true);
    assert.equal(projectContainerNamesAreExact(exact.slice(1)), false);
    assert.equal(
      projectContainerNamesAreExact([
        ...exact.slice(1),
        "supabase_other_Thainaute",
      ]),
      false,
    );
  });

  it("construit un environnement proxy local sans options Docker concurrentes", () => {
    const source = {
      PATH: "fixture",
      DOCKER_CONTEXT: "desktop-linux",
      DOCKER_TLS_VERIFY: "1",
      DOCKER_CERT_PATH: "private",
      DOCKER_API_VERSION: "1.40",
    };
    assert.deepEqual(
      dockerProxyEnvironment(
        source,
        "tcp://127.0.0.1:49152/0123456789abcdef0123456789abcdef",
      ),
      {
        PATH: "fixture",
        DOCKER_HOST: "tcp://127.0.0.1:49152/0123456789abcdef0123456789abcdef",
      },
    );
    assert.throws(
      () =>
        dockerProxyEnvironment(
          { DOCKER_HOST: "tcp://remote.invalid:2375" },
          "npipe:////./pipe/fixture",
        ),
      SupabaseLoopbackError,
    );
    assert.throws(
      () =>
        dockerProxyEnvironment(
          { docker_host: "tcp://remote.invalid:2375" },
          "npipe:////./pipe/fixture",
          "win32",
        ),
      SupabaseLoopbackError,
    );
    assert.deepEqual(
      dockerProxyEnvironment(
        {
          DOCKER_HOST: "unix:///run/user/1000/docker.sock",
          DOCKER_CONTEXT: "rootless",
          PATH: "fixture",
        },
        "unix:///tmp/thainaute-private/docker.sock",
        "linux",
      ),
      {
        DOCKER_HOST: "unix:///tmp/thainaute-private/docker.sock",
        PATH: "fixture",
      },
    );
    assert.throws(
      () =>
        dockerProxyEnvironment(
          { DOCKER_HOST: "tcp://127.0.0.1:2375" },
          "unix:///tmp/thainaute-private/docker.sock",
          "linux",
        ),
      SupabaseLoopbackError,
    );
  });

  it("refuse un signal deja annule sans laisser de proxy vivant", async () => {
    const controller = new globalThis.AbortController();
    controller.abort();
    await assert.rejects(
      createSupabaseLoopbackDockerProxy({
        environment: {},
        signal: controller.signal,
        upstreamSocket: testSocketPath("unused_upstream"),
      }),
      SupabaseLoopbackError,
    );
  });

  it("refuse de supprimer un reseau homonyme qui n'est pas atteste", async () => {
    let networkRemoved = false;
    const client = {
      initialize: async () => undefined,
      inspectNetwork: async () =>
        safeNetwork({ Labels: { foreign: "project" } }),
      listNamedProjectNetworks: async () => [
        { Id: "foreign-network", Name: "supabase_network_Thainaute" },
      ],
      listProjectContainers: async () => [],
      removeNetwork: async () => {
        networkRemoved = true;
      },
    };
    await assert.rejects(
      removeLocalSupabaseProjectContainers({ client }),
      SupabaseLoopbackError,
    );
    assert.equal(networkRemoved, false);
  });

  it("ne stoppe pas un conteneur homonyme dont les deux labels divergent", async () => {
    let stopped = false;
    const client = {
      initialize: async () => undefined,
      inspect: async () => ({
        Config: {
          Labels: {
            "com.docker.compose.project": "foreign",
            "com.supabase.cli.project": "Thainaute",
          },
        },
        Id: "foreign-container",
        Name: "/supabase_db_Thainaute",
      }),
      listProjectContainers: async () => [
        { Id: "foreign-container", Names: ["/supabase_db_Thainaute"] },
      ],
      stop: async () => {
        stopped = true;
      },
    };
    await assert.rejects(
      removeLocalSupabaseProjectContainers({ client }),
      SupabaseLoopbackError,
    );
    assert.equal(stopped, false);
  });

  it("refuse de purger un volume homonyme sans labels exacts", async () => {
    let volumeRemoved = false;
    const client = {
      initialize: async () => undefined,
      listNamedProjectNetworks: async () => [],
      listProjectContainers: async () => [],
      listVolumes: async () => [
        {
          Driver: "local",
          Labels: { foreign: "project" },
          Name: "supabase_db_Thainaute",
          Scope: "local",
        },
      ],
      removeVolume: async () => {
        volumeRemoved = true;
      },
    };
    await assert.rejects(
      purgeLocalSupabaseProjectResources({ client }),
      SupabaseLoopbackError,
    );
    assert.equal(volumeRemoved, false);
  });

  it("retransmet HTTP et reecrit un vrai Docker Create sur IPC", async () => {
    const upstreamPath = testSocketPath("docker_upstream");
    let receivedCreate = null;
    let receivedInitBody = null;
    let receivedNetwork = null;
    const receivedOtherPaths = [];
    const upstream = http.createServer((request, response) => {
      const pathname = canonicalDockerPathname(request.url);
      if (pathname.endsWith("/containers/create")) {
        const chunks = [];
        request.on("data", (chunk) => chunks.push(chunk));
        request.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          if (
            new URL(request.url, "http://docker.local").searchParams.has("name")
          ) {
            receivedCreate = JSON.parse(raw);
          } else receivedInitBody = raw;
          response.writeHead(201, { "Content-Type": "application/json" });
          response.end('{"Id":"fixture"}');
        });
        return;
      }
      if (pathname.endsWith("/networks/create")) {
        const chunks = [];
        request.on("data", (chunk) => chunks.push(chunk));
        request.on("end", () => {
          receivedNetwork = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          response.writeHead(201, { "Content-Type": "application/json" });
          response.end('{"Id":"network-fixture"}');
        });
        return;
      }
      receivedOtherPaths.push(request.url);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.write('{"Api');
      setImmediate(() => response.end('Version":"1.55"}'));
    });
    await listen(upstream, upstreamPath);
    const proxy = await createSupabaseLoopbackDockerProxy({
      environment: {},
      platform: "win32",
      upstreamSocket: upstreamPath,
    });
    const endpoint = proxyEndpoint(proxy.dockerHost);
    try {
      const invalidPrefix = `${endpoint.pathPrefix.slice(0, -1)}${
        endpoint.pathPrefix.endsWith("0") ? "1" : "0"
      }`;
      const denied = await requestThroughSocket(
        { ...endpoint, pathPrefix: invalidPrefix },
        { path: "/version" },
      );
      assert.equal(denied.statusCode, 403);
      assert.deepEqual(receivedOtherPaths, []);
      const version = await requestThroughSocket(endpoint, {
        path: "/version",
      });
      assert.deepEqual(version, {
        body: '{"ApiVersion":"1.55"}',
        statusCode: 200,
      });
      const encodedCreate = await requestThroughSocket(endpoint, {
        body: JSON.stringify(createPayload()),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        path: `/v1.55/%63ontainers/%63reate?name=${NAME}`,
      });
      assert.equal(encodedCreate.statusCode, 201);
      assert.deepEqual(receivedCreate.HostConfig.PortBindings, {
        "8000/tcp": [{ HostIp: "127.0.0.1", HostPort: "54321" }],
      });
      const encodedImage = await requestThroughSocket(endpoint, {
        path: "/v1.55/images/supabase%2Fpostgres:17/json",
      });
      assert.equal(encodedImage.statusCode, 200);
      assert.equal(
        receivedOtherPaths.at(-1),
        "/v1.55/images/supabase%2Fpostgres:17/json",
      );
      const networkPayload = JSON.stringify({
        Driver: "bridge",
        IPAM: { Driver: "default" },
        Labels: LABELS,
        Name: "supabase_network_Thainaute",
      });
      const networkCreated = await requestThroughSocket(endpoint, {
        body: networkPayload,
        headers: {
          "Content-Length": Buffer.byteLength(networkPayload),
          "Content-Type": "application/json",
        },
        method: "POST",
        path: "/v1.55/networks/create",
      });
      assert.equal(networkCreated.statusCode, 201);
      assert.equal(receivedNetwork.Driver, "bridge");
      assert.equal(receivedNetwork.Internal, false);
      assert.deepEqual(receivedNetwork.IPAM, { Driver: "default" });
      const initBody = JSON.stringify(
        {
          HostConfig: {
            NetworkMode: "supabase_network_Thainaute",
            PortBindings: {},
            PublishAllPorts: false,
          },
          Labels: {},
        },
        null,
        2,
      );
      const initCreated = await requestThroughSocket(endpoint, {
        body: initBody,
        headers: {
          "Content-Length": Buffer.byteLength(initBody),
          "Content-Type": "application/json",
        },
        method: "POST",
        path: "/v1.55/containers/create",
      });
      assert.equal(initCreated.statusCode, 201);
      assert.equal(receivedInitBody, initBody);
      const payload = JSON.stringify(createPayload());
      const created = await requestThroughSocket(endpoint, {
        body: payload,
        headers: {
          "Content-Length": Buffer.byteLength(payload),
          "Content-Type": "application/json",
        },
        method: "POST",
        path: `/v1.55/containers/create?name=${NAME}`,
      });
      assert.equal(created.statusCode, 201);
      assert.deepEqual(receivedCreate.HostConfig.PortBindings, {
        "8000/tcp": [{ HostIp: "127.0.0.1", HostPort: "54321" }],
      });
      assert.deepEqual(proxy.getPublicState().rewrittenByName, {
        supabase_db_Thainaute: 0,
        supabase_inbucket_Thainaute: 0,
        supabase_kong_Thainaute: 2,
      });
      assert.equal(proxy.getPublicState().projectNetworkCreates, 1);
    } finally {
      await Promise.all([proxy.close(), proxy.close()]);
      await closeServer(upstream, upstreamPath);
    }
  });

  it("transporte un hijack Docker 101 dans les deux sens", async () => {
    let upstreamInput = "";
    let upstreamUpgradeCount = 0;
    const proxy = await createSupabaseLoopbackDockerProxy({
      createUpgradeTunnel: () => {
        upstreamUpgradeCount += 1;
        const readable = new PassThrough();
        const writable = new PassThrough();
        writable.on("data", (chunk) => {
          upstreamInput += chunk.toString("utf8");
        });
        writable.on("finish", () => {
          readable.end(
            "HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nUpgrade: tcp\r\n\r\nafter-eof",
          );
        });
        return {
          destroy: () => {
            readable.destroy();
            writable.destroy();
          },
          readable,
          writable,
        };
      },
      environment: {},
      platform: "win32",
      upstreamSocket: "//./pipe/docker_engine",
    });
    const endpoint = proxyEndpoint(proxy.dockerHost);
    try {
      await new Promise((resolve, reject) => {
        const rejected = net.createConnection(endpoint.connection);
        const timer = setTimeout(() => {
          rejected.destroy();
          reject(new Error("encoded upgrade fixture timeout"));
        }, 5_000);
        rejected.on("connect", () => {
          rejected.end(
            `POST ${endpoint.pathPrefix}/v1.55/%63ontainers/%63reate HTTP/1.1\r\nHost: docker\r\nConnection: Upgrade\r\nUpgrade: tcp\r\n\r\n`,
          );
        });
        rejected.on("close", () => {
          clearTimeout(timer);
          resolve();
        });
        rejected.on("error", () => undefined);
      });
      assert.equal(upstreamUpgradeCount, 0);
      const transcript = await new Promise((resolve, reject) => {
        const client = net.createConnection({
          ...endpoint.connection,
          allowHalfOpen: true,
        });
        let received = "";
        const timer = setTimeout(() => {
          client.destroy();
          reject(new Error("upgrade fixture timeout"));
        }, 5_000);
        client.on("connect", () => {
          client.end(
            `POST ${endpoint.pathPrefix}/v1.55/containers/fixture/%61ttach HTTP/1.1\r\nHost: docker\r\nConnection: Upgrade\r\nUpgrade: tcp\r\n\r\nstdin`,
          );
        });
        client.on("data", (chunk) => {
          received += chunk.toString("utf8");
        });
        client.on("end", () => {
          clearTimeout(timer);
          client.destroy();
          resolve(received);
        });
        client.on("error", reject);
      });
      assert.match(transcript, /^HTTP\/1\.1 101/u);
      assert.match(transcript, /after-eof/u);
      assert.match(
        upstreamInput,
        /^POST \/v1\.55\/containers\/fixture\/%61ttach HTTP\/1\.1/u,
      );
      assert.match(upstreamInput, /stdin$/u);
      assert.equal(upstreamUpgradeCount, 1);
      assert.equal(proxy.getPublicState().requestCounts.upgrade, 1);
      assert.deepEqual(proxy.getPublicState().upgradeTransport, {
        childErrors: 0,
        downstreamEnds: 1,
        inputFinishes: 1,
        nonzeroExits: 0,
        readableEnds: 1,
        starts: 1,
        zeroExits: 0,
      });
    } finally {
      await Promise.all([proxy.close(), proxy.close()]);
    }
  });
});
