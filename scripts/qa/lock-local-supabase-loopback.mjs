#!/usr/bin/env node

/**
 * Garde Docker local pour la recette Supabase connectee.
 *
 * La CLI Supabase 2.111 ne permet pas de choisir l'adresse de publication et
 * cree ses ports sur toutes les interfaces. Ce proxy prive intercepte les
 * ContainerCreate de la stack locale et remplace uniquement les trois
 * publications attendues par 127.0.0.1. Les corps Docker, variables
 * d'environnement et inspect complets ne sont jamais journalises.
 */

import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { chmod, mkdir, rm } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { URL } from "node:url";

const PROJECT_ID = "Thainaute";
const PROJECT_LABEL = "com.supabase.cli.project";
const COMPOSE_PROJECT_LABEL = "com.docker.compose.project";
const PROJECT_NETWORK = `supabase_network_${PROJECT_ID}`;
const MAX_DOCKER_BODY_BYTES = 16 * 1024 * 1024;
const MAX_DOCKER_RESPONSE_BYTES = 16 * 1024 * 1024;
const DOCKER_TIMEOUT_MS = 30_000;
const HEALTH_TIMEOUT_MS = 120_000;
const CONTAINER_CREATE_ROUTE = /^\/(?:v1\.\d{2,3}\/)?containers\/create$/u;
const NETWORK_CREATE_ROUTE = /^\/(?:v1\.\d{2,3}\/)?networks\/create$/u;
const ROUTE_PREFIX = String.raw`\/(?:v1\.\d{2,3}\/)?`;

export const EXPECTED_LOCAL_PUBLICATIONS = Object.freeze({
  [`supabase_db_${PROJECT_ID}`]: Object.freeze({ "5432/tcp": "54322" }),
  [`supabase_inbucket_${PROJECT_ID}`]: Object.freeze({
    "8025/tcp": "54324",
  }),
  [`supabase_kong_${PROJECT_ID}`]: Object.freeze({ "8000/tcp": "54321" }),
});

const EXPECTED_PROJECT_VOLUMES = new Set([
  `supabase_db_${PROJECT_ID}`,
  `supabase_edge_runtime_${PROJECT_ID}`,
  `supabase_storage_${PROJECT_ID}`,
]);

const EXPECTED_PROJECT_CONTAINERS = new Set([
  `supabase_auth_${PROJECT_ID}`,
  `supabase_db_${PROJECT_ID}`,
  `supabase_edge_runtime_${PROJECT_ID}`,
  `supabase_inbucket_${PROJECT_ID}`,
  `supabase_kong_${PROJECT_ID}`,
  `supabase_pg_meta_${PROJECT_ID}`,
  `supabase_realtime_${PROJECT_ID}`,
  `supabase_rest_${PROJECT_ID}`,
  `supabase_storage_${PROJECT_ID}`,
]);

export class SupabaseLoopbackError extends Error {
  constructor(message) {
    super(message);
    this.name = "SupabaseLoopbackError";
  }
}

function environmentValue(environment, name, platform) {
  const entry = Object.entries(environment).find(([key]) =>
    platform === "win32" ? key.toUpperCase() === name : key === name,
  );
  return entry?.[1];
}

function deleteEnvironmentKey(environment, name, platform) {
  for (const key of Object.keys(environment)) {
    if (platform === "win32" ? key.toUpperCase() === name : key === name) {
      delete environment[key];
    }
  }
}

function localUnixDockerSocketPath(dockerHost) {
  if (typeof dockerHost !== "string" || dockerHost === "") return null;
  let parsed;
  try {
    parsed = new URL(dockerHost);
  } catch {
    return null;
  }
  if (
    parsed.protocol !== "unix:" ||
    parsed.hostname !== "" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.search !== "" ||
    parsed.hash !== "" ||
    !path.isAbsolute(parsed.pathname)
  ) {
    return null;
  }
  return parsed.pathname;
}

function dockerSocketPath(
  environment = process.env,
  platform = process.platform,
) {
  const configuredHost = environmentValue(
    environment,
    "DOCKER_HOST",
    platform,
  )?.trim();
  if (configuredHost) {
    const localUnixSocket =
      platform === "win32" ? null : localUnixDockerSocketPath(configuredHost);
    if (localUnixSocket !== null) return localUnixSocket;
    throw new SupabaseLoopbackError(
      "La recette refuse un daemon Docker distant ou surcharge.",
    );
  }
  return platform === "win32"
    ? "//./pipe/docker_engine"
    : "/var/run/docker.sock";
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    throw new SupabaseLoopbackError(
      "La reponse du daemon Docker est invalide.",
    );
  }
}

function exactProjectLabels(labels) {
  return (
    labels?.[PROJECT_LABEL] === PROJECT_ID &&
    labels?.[COMPOSE_PROJECT_LABEL] === PROJECT_ID
  );
}

export function canonicalDockerPathname(rawUrl) {
  if (
    typeof rawUrl !== "string" ||
    !rawUrl.startsWith("/") ||
    rawUrl.includes("#")
  ) {
    throw new SupabaseLoopbackError("La route Docker QA est invalide.");
  }
  const rawPathname = rawUrl.split("?", 1)[0];
  let decoded;
  try {
    decoded = decodeURIComponent(rawPathname);
  } catch {
    throw new SupabaseLoopbackError("La route Docker QA est invalide.");
  }
  if (
    decoded.includes("%") ||
    decoded.includes("\\") ||
    decoded.includes("\0") ||
    decoded.slice(1).includes("//") ||
    decoded.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    throw new SupabaseLoopbackError("La route Docker QA n'est pas canonique.");
  }
  return decoded;
}

export function stripDockerCapability(rawUrl, capability) {
  if (capability === null) return rawUrl;
  if (
    typeof capability !== "string" ||
    !/^[a-f0-9]{32}$/u.test(capability) ||
    typeof rawUrl !== "string"
  ) {
    throw new SupabaseLoopbackError("La capacite Docker QA est invalide.");
  }
  const separator = rawUrl.indexOf("/", 1);
  const presented = separator === -1 ? "" : rawUrl.slice(1, separator);
  if (
    !/^[a-f0-9]{32}$/u.test(presented) ||
    !timingSafeEqual(Buffer.from(presented), Buffer.from(capability))
  ) {
    throw new SupabaseLoopbackError("La capacite Docker QA est absente.");
  }
  return rawUrl.slice(separator);
}

function containerNameFromCreateRoute(rawUrl) {
  const pathname = canonicalDockerPathname(rawUrl);
  const parsed = new URL(rawUrl, "http://docker.local");
  if (!CONTAINER_CREATE_ROUTE.test(pathname)) {
    throw new SupabaseLoopbackError("La requete Docker Create est invalide.");
  }
  const name = parsed.searchParams.get("name");
  if (name === null || name === "") return null;
  if (!/^supabase_[a-z0-9_]+_Thainaute$/u.test(name)) {
    throw new SupabaseLoopbackError(
      "Le nom du conteneur Supabase local est invalide.",
    );
  }
  return name;
}

function publishedBindings(portBindings) {
  return Object.entries(portBindings ?? {}).filter(([, mappings]) =>
    Array.isArray(mappings) ? mappings.length > 0 : false,
  );
}

export function rewriteLoopbackPortBindings(name, portBindings) {
  const expected = EXPECTED_LOCAL_PUBLICATIONS[name];
  if (expected === undefined) {
    throw new SupabaseLoopbackError(
      "Un conteneur Supabase inattendu publie un port local.",
    );
  }
  const actualEntries = publishedBindings(portBindings);
  const expectedEntries = Object.entries(expected);
  if (actualEntries.length !== expectedEntries.length) {
    throw new SupabaseLoopbackError(
      "Les ports publies par Supabase ne correspondent pas au contrat QA.",
    );
  }
  const rewritten = {};
  for (const [containerPort, hostPort] of expectedEntries) {
    const mappings = portBindings?.[containerPort];
    if (
      !Array.isArray(mappings) ||
      mappings.length !== 1 ||
      mappings[0]?.HostPort !== hostPort ||
      ![undefined, "", "127.0.0.1"].includes(mappings[0]?.HostIp)
    ) {
      throw new SupabaseLoopbackError(
        "Les ports publies par Supabase ne correspondent pas au contrat QA.",
      );
    }
    rewritten[containerPort] = [{ ...mappings[0], HostIp: "127.0.0.1" }];
  }
  return rewritten;
}

export function rewriteDockerCreatePayload(rawUrl, payload) {
  const name = containerNameFromCreateRoute(rawUrl);
  if (
    payload === null ||
    typeof payload !== "object" ||
    Array.isArray(payload) ||
    (!exactProjectLabels(payload.Labels) &&
      !(name === null && Object.keys(payload.Labels ?? {}).length === 0)) ||
    payload.HostConfig === null ||
    typeof payload.HostConfig !== "object" ||
    Array.isArray(payload.HostConfig) ||
    payload.HostConfig.PublishAllPorts === true ||
    payload.HostConfig.NetworkMode !== PROJECT_NETWORK
  ) {
    throw new SupabaseLoopbackError(
      "Docker Create ne porte pas les labels Supabase QA exacts.",
    );
  }
  const bindings = payload.HostConfig.PortBindings ?? {};
  const hasPublication = publishedBindings(bindings).length > 0;
  if (!hasPublication) {
    if (name !== null && EXPECTED_LOCAL_PUBLICATIONS[name] !== undefined) {
      throw new SupabaseLoopbackError(
        "Une publication Supabase attendue est absente de Docker Create.",
      );
    }
    return Object.freeze({ name, payload, rewritten: false });
  }
  if (name === null || EXPECTED_LOCAL_PUBLICATIONS[name] === undefined) {
    throw new SupabaseLoopbackError(
      "Un conteneur Supabase inattendu publie un port local.",
    );
  }
  return Object.freeze({
    name,
    payload: {
      ...payload,
      HostConfig: {
        ...payload.HostConfig,
        PortBindings: rewriteLoopbackPortBindings(name, bindings),
      },
    },
    rewritten: true,
  });
}

export function rewriteDockerNetworkCreatePayload(payload) {
  if (
    payload === null ||
    typeof payload !== "object" ||
    Array.isArray(payload) ||
    payload.Name !== PROJECT_NETWORK ||
    !exactProjectLabels(payload.Labels) ||
    ![undefined, "", "bridge"].includes(payload.Driver) ||
    payload.Internal === true ||
    payload.Attachable === true ||
    payload.Ingress === true ||
    payload.ConfigOnly === true ||
    payload.EnableIPv6 === true ||
    ![undefined, "", "default"].includes(payload.IPAM?.Driver) ||
    (Array.isArray(payload.IPAM?.Config) && payload.IPAM.Config.length > 0)
  ) {
    throw new SupabaseLoopbackError(
      "Docker NetworkCreate ne respecte pas le reseau prive Supabase QA.",
    );
  }
  const allowedOptions = new Set([
    "com.docker.network.enable_ipv4",
    "com.docker.network.enable_ipv6",
  ]);
  if (
    Object.entries(payload.Options ?? {}).some(
      ([name, value]) =>
        !allowedOptions.has(name) ||
        (name.endsWith("enable_ipv4") && value !== "true") ||
        (name.endsWith("enable_ipv6") && value !== "false"),
    )
  ) {
    throw new SupabaseLoopbackError(
      "Docker NetworkCreate contient une option reseau inattendue.",
    );
  }
  return {
    ...payload,
    Attachable: false,
    ConfigOnly: false,
    Driver: "bridge",
    EnableIPv4: true,
    EnableIPv6: false,
    Ingress: false,
    Internal: false,
    IPAM: { Driver: "default" },
    Options: {
      "com.docker.network.enable_ipv4": "true",
      "com.docker.network.enable_ipv6": "false",
    },
  };
}

class DockerEngineClient {
  #apiPrefix = null;
  #socketPath;

  constructor(socketPath) {
    this.#socketPath = socketPath;
  }

  async #request(method, route, options = {}) {
    const body =
      options.body === undefined ? null : JSON.stringify(options.body);
    const expected = options.expected ?? [200];
    const response = await new Promise((resolve, reject) => {
      const request = http.request(
        {
          headers:
            body === null
              ? undefined
              : {
                  "Content-Length": Buffer.byteLength(body),
                  "Content-Type": "application/json",
                },
          method,
          path: route,
          socketPath: this.#socketPath,
          timeout: DOCKER_TIMEOUT_MS,
        },
        (incoming) => {
          const chunks = [];
          let total = 0;
          incoming.on("data", (chunk) => {
            total += chunk.length;
            if (total > MAX_DOCKER_RESPONSE_BYTES) {
              incoming.destroy(
                new SupabaseLoopbackError(
                  "La reponse du daemon Docker depasse la borne QA.",
                ),
              );
              return;
            }
            chunks.push(chunk);
          });
          incoming.on("end", () => {
            resolve({
              body: Buffer.concat(chunks).toString("utf8"),
              statusCode: incoming.statusCode ?? 0,
            });
          });
          incoming.on("error", reject);
        },
      );
      request.on("timeout", () => {
        request.destroy(
          new SupabaseLoopbackError("Le daemon Docker local ne repond pas."),
        );
      });
      request.on("error", reject);
      if (body !== null) request.write(body);
      request.end();
    });
    if (!expected.includes(response.statusCode)) {
      throw new SupabaseLoopbackError(
        `Le daemon Docker local refuse l'operation QA (${response.statusCode}).`,
      );
    }
    return response.body;
  }

  async initialize() {
    const version = safeJsonParse(await this.#request("GET", "/version"));
    if (
      typeof version.ApiVersion !== "string" ||
      !/^1\.\d{2,3}$/u.test(version.ApiVersion)
    ) {
      throw new SupabaseLoopbackError(
        "La version de l'API Docker locale n'est pas prise en charge.",
      );
    }
    this.#apiPrefix = `/v${version.ApiVersion}`;
  }

  #route(route) {
    if (this.#apiPrefix === null) {
      throw new SupabaseLoopbackError(
        "Le client Docker QA n'est pas initialise.",
      );
    }
    return `${this.#apiPrefix}${route}`;
  }

  async listProjectContainers() {
    const filters = encodeURIComponent(
      JSON.stringify({ label: [`${PROJECT_LABEL}=${PROJECT_ID}`] }),
    );
    return safeJsonParse(
      await this.#request(
        "GET",
        this.#route(`/containers/json?all=1&filters=${filters}`),
      ),
    );
  }

  async listNamedProjectNetworks() {
    const filters = encodeURIComponent(
      JSON.stringify({ name: [PROJECT_NETWORK] }),
    );
    const networks = safeJsonParse(
      await this.#request("GET", this.#route(`/networks?filters=${filters}`)),
    );
    return networks.filter((network) => network?.Name === PROJECT_NETWORK);
  }

  async listVolumes() {
    const response = safeJsonParse(
      await this.#request("GET", this.#route("/volumes")),
    );
    return Array.isArray(response?.Volumes) ? response.Volumes : [];
  }

  async inspectNetwork(id) {
    return safeJsonParse(
      await this.#request(
        "GET",
        this.#route(`/networks/${encodeURIComponent(id)}`),
      ),
    );
  }

  async inspect(id) {
    return safeJsonParse(
      await this.#request(
        "GET",
        this.#route(`/containers/${encodeURIComponent(id)}/json`),
      ),
    );
  }

  async stop(id) {
    await this.#request(
      "POST",
      this.#route(`/containers/${encodeURIComponent(id)}/stop?t=10`),
      { expected: [204, 304] },
    );
  }

  async kill(id) {
    await this.#request(
      "POST",
      this.#route(`/containers/${encodeURIComponent(id)}/kill?signal=SIGKILL`),
      { expected: [204, 409] },
    );
  }

  async remove(id) {
    await this.#request(
      "DELETE",
      this.#route(`/containers/${encodeURIComponent(id)}?v=0&force=0`),
      { expected: [204] },
    );
  }

  async removeNetwork(id) {
    await this.#request(
      "DELETE",
      this.#route(`/networks/${encodeURIComponent(id)}`),
      { expected: [204] },
    );
  }

  async removeVolume(name) {
    await this.#request(
      "DELETE",
      this.#route(`/volumes/${encodeURIComponent(name)}?force=0`),
      { expected: [204] },
    );
  }
}

function containerName(summary, inspect) {
  const inspectedName =
    typeof inspect?.Name === "string" && inspect.Name.startsWith("/")
      ? inspect.Name.slice(1)
      : null;
  const names = Array.isArray(summary?.Names) ? summary.Names : [];
  const summaryName = names.find(
    (entry) => typeof entry === "string" && entry.startsWith("/supabase_"),
  );
  const normalizedSummary = summaryName?.slice(1) ?? null;
  if (
    inspectedName === null ||
    normalizedSummary === null ||
    inspectedName !== normalizedSummary
  ) {
    throw new SupabaseLoopbackError(
      "Un conteneur Supabase local est mal nomme.",
    );
  }
  return inspectedName;
}

async function projectRecords(client) {
  const summaries = await client.listProjectContainers();
  const records = [];
  for (const summary of summaries) {
    if (typeof summary?.Id !== "string" || summary.Id === "") {
      throw new SupabaseLoopbackError(
        "Un conteneur Supabase local est invalide.",
      );
    }
    const inspect = await client.inspect(summary.Id);
    if (!exactProjectLabels(inspect?.Config?.Labels)) {
      throw new SupabaseLoopbackError(
        "Les labels du conteneur Supabase local sont invalides.",
      );
    }
    records.push({
      id: summary.Id,
      inspect,
      name: containerName(summary, inspect),
    });
  }
  return records;
}

async function stopRecordsFailClosed(client, records) {
  await Promise.allSettled(records.map((record) => client.stop(record.id)));
  let remaining = [];
  for (const record of records) {
    const current = await client.inspect(record.id);
    if (current?.State?.Running === true) remaining.push(record);
  }
  if (remaining.length > 0) {
    await Promise.allSettled(remaining.map((record) => client.kill(record.id)));
    remaining = [];
    for (const record of records) {
      const current = await client.inspect(record.id);
      if (current?.State?.Running === true) remaining.push(record);
    }
  }
  if (remaining.length > 0) {
    throw new SupabaseLoopbackError(
      "La stack Supabase locale n'a pas pu etre arretee de facon sure.",
    );
  }
}

async function initializedClient(options = {}) {
  const socketPath =
    options.socketPath ??
    dockerSocketPath(options.environment, options.platform);
  const client = options.client ?? new DockerEngineClient(socketPath);
  await client.initialize();
  return client;
}

function ipv4Integer(value) {
  if (typeof value !== "string") return null;
  const parts = value.split(".");
  if (parts.length !== 4) return null;
  let result = 0n;
  for (const part of parts) {
    if (!/^(?:0|[1-9]\d{0,2})$/u.test(part)) return null;
    const octet = Number(part);
    if (!Number.isInteger(octet) || octet > 255) return null;
    result = (result << 8n) + BigInt(octet);
  }
  return result;
}

function privateIpv4Cidr(value, gateway) {
  if (typeof value !== "string") return false;
  const [address, prefixText, ...extra] = value.split("/");
  if (extra.length > 0 || !/^(?:[89]|[12]\d|3[0-2])$/u.test(prefixText ?? "")) {
    return false;
  }
  const ip = ipv4Integer(address);
  const gatewayIp = ipv4Integer(gateway);
  if (ip === null || gatewayIp === null) return false;
  const prefix = BigInt(Number(prefixText));
  const full = (1n << 32n) - 1n;
  const hostBits = 32n - prefix;
  const mask = hostBits === 0n ? full : full ^ ((1n << hostBits) - 1n);
  const start = ip & mask;
  const end = start + (1n << hostBits) - 1n;
  const privateRanges = [
    [ipv4Integer("10.0.0.0"), ipv4Integer("10.255.255.255")],
    [ipv4Integer("172.16.0.0"), ipv4Integer("172.31.255.255")],
    [ipv4Integer("192.168.0.0"), ipv4Integer("192.168.255.255")],
  ];
  return (
    gatewayIp > start &&
    gatewayIp < end &&
    privateRanges.some(
      ([rangeStart, rangeEnd]) => start >= rangeStart && end <= rangeEnd,
    )
  );
}

export function privateSupabaseBridgeNetworkIsSafe(network) {
  const labels = network?.Labels;
  const options = network?.Options;
  const ipam = network?.IPAM;
  const configs = ipam?.Config;
  const config =
    Array.isArray(configs) && configs.length === 1 ? configs[0] : null;
  const optionKeys = Object.keys(options ?? {});
  const optionsAreSafe =
    optionKeys.length === 0 ||
    (optionKeys.length === 2 &&
      options?.["com.docker.network.enable_ipv4"] === "true" &&
      options?.["com.docker.network.enable_ipv6"] === "false");
  return (
    network?.Name === PROJECT_NETWORK &&
    network?.Driver === "bridge" &&
    network?.Scope === "local" &&
    network?.Internal === false &&
    network?.Attachable === false &&
    network?.Ingress === false &&
    network?.ConfigOnly === false &&
    network?.EnableIPv4 !== false &&
    network?.EnableIPv6 === false &&
    exactProjectLabels(labels) &&
    Object.keys(labels ?? {}).length === 2 &&
    ipam?.Driver === "default" &&
    config !== null &&
    Object.keys(config).every((key) => ["Gateway", "Subnet"].includes(key)) &&
    privateIpv4Cidr(config.Subnet, config.Gateway) &&
    optionsAreSafe
  );
}

export function projectContainerNamesAreExact(names) {
  if (!Array.isArray(names)) return false;
  const actual = [...names].sort();
  const expected = [...EXPECTED_PROJECT_CONTAINERS].sort();
  return (
    actual.length === expected.length &&
    actual.every((name, index) => name === expected[index])
  );
}

export async function removeLocalSupabaseProjectContainers(options = {}) {
  const client = await initializedClient(options);
  const records = await projectRecords(client);
  await stopRecordsFailClosed(client, records);
  const removalResults = await Promise.allSettled(
    records.map((record) => client.remove(record.id)),
  );
  const summariesAfterRemoval = await client.listProjectContainers();
  if (
    removalResults.some((result) => result.status === "rejected") ||
    summariesAfterRemoval.length !== 0
  ) {
    const originalIds = new Set(records.map((record) => record.id));
    const remaining = summariesAfterRemoval
      .filter(
        (summary) =>
          typeof summary?.Id === "string" && originalIds.has(summary.Id),
      )
      .map((summary) => ({ id: summary.Id }));
    await stopRecordsFailClosed(client, remaining);
    throw new SupabaseLoopbackError(
      "Les anciens conteneurs Supabase n'ont pas tous ete supprimes.",
    );
  }
  const networks = await client.listNamedProjectNetworks();
  if (
    networks.some(
      (network) => typeof network?.Id !== "string" || network.Id === "",
    )
  ) {
    throw new SupabaseLoopbackError(
      "Le reseau Docker Supabase local est invalide.",
    );
  }
  for (const network of networks) {
    const inspected = await client.inspectNetwork(network.Id);
    if (
      !privateSupabaseBridgeNetworkIsSafe(inspected) ||
      Object.keys(inspected?.Containers ?? {}).length !== 0
    ) {
      throw new SupabaseLoopbackError(
        "Le reseau Docker homonyme n'appartient pas au projet QA prive.",
      );
    }
  }
  const networkRemovalResults = await Promise.allSettled(
    networks.map((network) => client.removeNetwork(network.Id)),
  );
  if (
    networkRemovalResults.some((result) => result.status === "rejected") ||
    (await client.listNamedProjectNetworks()).length !== 0
  ) {
    throw new SupabaseLoopbackError(
      "L'ancien reseau Docker Supabase n'a pas ete supprime.",
    );
  }
  return Object.freeze({
    removedContainerCount: records.length,
    removedNetworkCount: networks.length,
  });
}

export async function purgeLocalSupabaseProjectResources(options = {}) {
  const removed = await removeLocalSupabaseProjectContainers(options);
  const client = await initializedClient(options);
  const candidates = (await client.listVolumes()).filter(
    (volume) =>
      EXPECTED_PROJECT_VOLUMES.has(volume?.Name) ||
      volume?.Labels?.[PROJECT_LABEL] === PROJECT_ID,
  );
  for (const volume of candidates) {
    if (
      typeof volume?.Name !== "string" ||
      !EXPECTED_PROJECT_VOLUMES.has(volume.Name) ||
      volume.Driver !== "local" ||
      volume.Scope !== "local" ||
      !exactProjectLabels(volume.Labels) ||
      Object.keys(volume.Labels ?? {}).length !== 2
    ) {
      throw new SupabaseLoopbackError(
        "Un volume Docker homonyme n'appartient pas au projet QA prive.",
      );
    }
  }
  const results = await Promise.allSettled(
    candidates.map((volume) => client.removeVolume(volume.Name)),
  );
  const remaining = (await client.listVolumes()).filter(
    (volume) =>
      EXPECTED_PROJECT_VOLUMES.has(volume?.Name) ||
      volume?.Labels?.[PROJECT_LABEL] === PROJECT_ID,
  );
  if (
    results.some((result) => result.status === "rejected") ||
    remaining.length !== 0
  ) {
    throw new SupabaseLoopbackError(
      "Les volumes Docker Supabase locaux n'ont pas ete purges.",
    );
  }
  return Object.freeze({
    ...removed,
    removedVolumeCount: candidates.length,
  });
}

function exactBindings(bindings, expected, networkSettings = false) {
  const entries = publishedBindings(bindings);
  if (entries.length !== Object.keys(expected).length) return false;
  return Object.entries(expected).every(([containerPort, hostPort]) => {
    const mappings = bindings?.[containerPort];
    return (
      Array.isArray(mappings) &&
      mappings.length === 1 &&
      mappings[0]?.HostIp === "127.0.0.1" &&
      mappings[0]?.HostPort === hostPort &&
      (!networkSettings || typeof mappings[0]?.HostPort === "string")
    );
  });
}

export async function stopLocalSupabaseProjectContainers(options = {}) {
  const client = await initializedClient(options);
  const records = await projectRecords(client);
  await stopRecordsFailClosed(client, records);
  return Object.freeze({ stoppedContainerCount: records.length });
}

export async function attestLocalSupabaseLoopback(options = {}) {
  const client = await initializedClient(options);
  let attestedRecords = [];
  try {
    const deadline = Date.now() + HEALTH_TIMEOUT_MS;
    let records = [];
    while (Date.now() < deadline) {
      records = await projectRecords(client);
      attestedRecords = records;
      if (
        records.length > 0 &&
        records.every((record) => {
          const health = record.inspect?.State?.Health?.Status;
          return (
            record.inspect?.State?.Status === "running" &&
            record.inspect?.State?.Running === true &&
            record.inspect?.State?.Restarting !== true &&
            record.inspect?.State?.Paused !== true &&
            record.inspect?.State?.Dead !== true &&
            (health === undefined || health === "healthy")
          );
        })
      ) {
        break;
      }
      await delay(250, undefined, { signal: options.signal });
    }
    const networks = await client.listNamedProjectNetworks();
    if (
      networks.length !== 1 ||
      typeof networks[0]?.Id !== "string" ||
      !privateSupabaseBridgeNetworkIsSafe(
        await client.inspectNetwork(networks[0].Id),
      )
    ) {
      throw new SupabaseLoopbackError(
        "Le reseau Docker Supabase local n'est pas un bridge prive atteste.",
      );
    }
    const publishedNames = [];
    if (!projectContainerNamesAreExact(records.map((record) => record.name))) {
      throw new SupabaseLoopbackError(
        "Le jeu de services Supabase locaux est inattendu.",
      );
    }
    for (const record of records) {
      const health = record.inspect?.State?.Health?.Status;
      if (
        record.inspect?.State?.Running !== true ||
        record.inspect?.State?.Status !== "running" ||
        record.inspect?.State?.Restarting === true ||
        record.inspect?.State?.Paused === true ||
        record.inspect?.State?.Dead === true ||
        (health !== undefined && health !== "healthy") ||
        record.inspect?.HostConfig?.PublishAllPorts === true ||
        record.inspect?.HostConfig?.NetworkMode !== PROJECT_NETWORK
      ) {
        throw new SupabaseLoopbackError(
          "Un conteneur Supabase local n'est pas sain.",
        );
      }
      const hostBindings = record.inspect?.HostConfig?.PortBindings ?? {};
      const runtimeBindings = record.inspect?.NetworkSettings?.Ports ?? {};
      const hasPublication =
        publishedBindings(hostBindings).length > 0 ||
        publishedBindings(runtimeBindings).length > 0;
      const expected = EXPECTED_LOCAL_PUBLICATIONS[record.name];
      if (!hasPublication) {
        if (expected !== undefined) {
          throw new SupabaseLoopbackError(
            "Une publication Supabase attendue est absente.",
          );
        }
        continue;
      }
      if (
        expected === undefined ||
        !exactBindings(hostBindings, expected) ||
        !exactBindings(runtimeBindings, expected, true)
      ) {
        throw new SupabaseLoopbackError(
          "Une publication Supabase locale n'est pas liee au loopback.",
        );
      }
      publishedNames.push(record.name);
    }
    const expectedNames = Object.keys(EXPECTED_LOCAL_PUBLICATIONS).sort();
    if (
      publishedNames.length !== expectedNames.length ||
      publishedNames.sort().some((name, index) => name !== expectedNames[index])
    ) {
      throw new SupabaseLoopbackError(
        "Le jeu de publications Supabase locales est inattendu.",
      );
    }
    return Object.freeze({
      lockedContainerCount: publishedNames.length,
      projectContainerCount: records.length,
    });
  } catch (error) {
    await stopRecordsFailClosed(client, attestedRecords);
    throw error instanceof SupabaseLoopbackError
      ? error
      : new SupabaseLoopbackError(
          "L'attestation loopback Supabase a echoue ; la stack est arretee.",
        );
  }
}

async function collectBoundedBody(request) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > MAX_DOCKER_BODY_BYTES) {
      throw new SupabaseLoopbackError(
        "Le corps Docker Create depasse la borne QA.",
      );
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function sanitizedHeaders(headers, body) {
  const next = { ...headers };
  delete next.connection;
  delete next["proxy-connection"];
  delete next["transfer-encoding"];
  delete next.upgrade;
  if (body !== undefined) next["content-length"] = String(body.length);
  return next;
}

function writeProxyFailure(response) {
  if (response.headersSent) {
    response.destroy();
    return;
  }
  const body = Buffer.from('{"message":"Docker QA request refused"}');
  response.writeHead(403, {
    "Content-Length": body.length,
    "Content-Type": "application/json",
  });
  response.end(body);
}

function forwardHttpRequest(request, response, socketPath, forwardedUrl, body) {
  const upstream = http.request(
    {
      headers: sanitizedHeaders(request.headers, body),
      method: request.method,
      path: forwardedUrl,
      socketPath,
      timeout: DOCKER_TIMEOUT_MS,
    },
    (incoming) => {
      response.writeHead(incoming.statusCode ?? 502, incoming.headers);
      incoming.on("error", () => response.destroy());
      incoming.pipe(response);
    },
  );
  upstream.on("timeout", () => upstream.destroy());
  upstream.on("error", () => writeProxyFailure(response));
  request.on("aborted", () => upstream.destroy());
  response.on("close", () => {
    if (!response.writableEnded) upstream.destroy();
  });
  if (body === undefined) request.pipe(upstream);
  else upstream.end(body);
}

function rawUpgradeRequest(request, forwardedUrl) {
  const lines = [
    `${request.method} ${forwardedUrl} HTTP/${request.httpVersion}`,
  ];
  for (let index = 0; index < request.rawHeaders.length; index += 2) {
    lines.push(
      `${request.rawHeaders[index]}: ${request.rawHeaders[index + 1]}`,
    );
  }
  lines.push("", "");
  return Buffer.from(lines.join("\r\n"));
}

function dockerRequestKind(method, forwardedUrl, upgraded) {
  if (upgraded) return "upgrade";
  const pathname = canonicalDockerPathname(forwardedUrl);
  if (CONTAINER_CREATE_ROUTE.test(pathname)) return "container_create";
  if (NETWORK_CREATE_ROUTE.test(pathname)) return "network_create";
  if (
    new RegExp(`^${ROUTE_PREFIX}containers/[^/]+/start$`, "u").test(pathname)
  ) {
    return "container_start";
  }
  if (
    new RegExp(`^${ROUTE_PREFIX}containers/[^/]+/wait$`, "u").test(pathname)
  ) {
    return "container_wait";
  }
  if (
    new RegExp(`^${ROUTE_PREFIX}containers/[^/]+/logs$`, "u").test(pathname)
  ) {
    return "container_logs";
  }
  if (
    new RegExp(`^${ROUTE_PREFIX}containers/[^/]+/json$`, "u").test(pathname)
  ) {
    return "container_inspect";
  }
  if (
    method === "DELETE" &&
    new RegExp(`^${ROUTE_PREFIX}containers/[^/]+$`, "u").test(pathname)
  ) {
    return "container_delete";
  }
  if (new RegExp(`^${ROUTE_PREFIX}exec/[^/]+/start$`, "u").test(pathname)) {
    return "exec_start";
  }
  return "other";
}

function dockerUpgradeKind(forwardedUrl) {
  const pathname = canonicalDockerPathname(forwardedUrl);
  if (
    new RegExp(`^${ROUTE_PREFIX}containers/[^/]+/attach$`, "u").test(pathname)
  ) {
    return "container_attach";
  }
  if (new RegExp(`^${ROUTE_PREFIX}exec/[^/]+/start$`, "u").test(pathname)) {
    return "exec_start";
  }
  return "other";
}

function cleanDockerCliEnvironment(environment, platform) {
  const next = { ...environment };
  for (const name of [
    "DOCKER_HOST",
    "DOCKER_CONTEXT",
    "DOCKER_TLS_VERIFY",
    "DOCKER_CERT_PATH",
    "DOCKER_API_VERSION",
  ]) {
    deleteEnvironmentKey(next, name, platform);
  }
  return next;
}

function dockerHostForWindowsPipe(socketPath) {
  if (!/^\/\/\.\/pipe\/[a-zA-Z0-9_.-]+$/u.test(socketPath)) {
    throw new SupabaseLoopbackError(
      "Le pipe Docker Windows de la recette est invalide.",
    );
  }
  return `npipe:////./pipe/${socketPath.slice("//./pipe/".length)}`;
}

function createDefaultUpgradeTunnel(options) {
  if (options.platform !== "win32") {
    const socket = net.createConnection({
      allowHalfOpen: true,
      path: options.upstreamSocket,
    });
    return {
      destroy: () => socket.destroy(),
      readable: socket,
      writable: socket,
    };
  }
  const executable = "docker.exe";
  const child = spawn(
    executable,
    [
      "--host",
      dockerHostForWindowsPipe(options.upstreamSocket),
      "system",
      "dial-stdio",
    ],
    {
      env: cleanDockerCliEnvironment(options.environment, options.platform),
      shell: false,
      stdio: ["pipe", "pipe", "ignore"],
      windowsHide: true,
    },
  );
  if (child.stdin === null || child.stdout === null) {
    child.kill();
    throw new SupabaseLoopbackError(
      "Le tunnel Docker Windows n'a pas pu etre cree.",
    );
  }
  const completion = new Promise((resolve) => child.once("close", resolve));
  return {
    child,
    completion,
    destroy: () => child.kill(),
    readable: child.stdout,
    writable: child.stdin,
  };
}

function validatedUpgradeTunnel(tunnel) {
  if (
    tunnel === null ||
    typeof tunnel !== "object" ||
    typeof tunnel.destroy !== "function" ||
    typeof tunnel.readable?.pipe !== "function" ||
    typeof tunnel.writable?.write !== "function" ||
    typeof tunnel.writable?.end !== "function"
  ) {
    throw new SupabaseLoopbackError("Le tunnel Docker QA est invalide.");
  }
  return tunnel;
}

function proxyListenContract(platform, temporaryRoot) {
  const id = randomUUID().replaceAll("-", "");
  if (platform === "win32") {
    return {
      capability: id,
      cleanupDirectory: null,
      dockerHost: null,
      listenOptions: { host: "127.0.0.1", port: 0 },
      listenPath: null,
    };
  }
  const directory = path.join(
    temporaryRoot ?? os.tmpdir(),
    `thainaute-docker-${id}`,
  );
  return {
    capability: null,
    cleanupDirectory: directory,
    dockerHost: `unix://${path.join(directory, "docker.sock")}`,
    listenOptions: null,
    listenPath: path.join(directory, "docker.sock"),
  };
}

export async function createSupabaseLoopbackDockerProxy(options = {}) {
  const platform = options.platform ?? process.platform;
  const upstreamSocket =
    options.upstreamSocket ?? dockerSocketPath(options.environment, platform);
  const contract = proxyListenContract(platform, options.temporaryRoot);
  let cleanupDirectoryOwned = false;
  if (contract.cleanupDirectory !== null) {
    try {
      await mkdir(contract.cleanupDirectory, { mode: 0o700 });
      cleanupDirectoryOwned = true;
      await chmod(contract.cleanupDirectory, 0o700);
    } catch (error) {
      if (cleanupDirectoryOwned) {
        await rm(contract.cleanupDirectory, {
          force: true,
          recursive: true,
        }).catch(() => undefined);
      }
      throw error;
    }
  }

  const rewrittenByName = Object.fromEntries(
    Object.keys(EXPECTED_LOCAL_PUBLICATIONS).map((name) => [name, 0]),
  );
  let projectContainerCreates = 0;
  let projectNetworkCreates = 0;
  let lastRejectedContainerShape = null;
  let closing = false;
  let upgradeChildErrors = 0;
  let upgradeDownstreamEnds = 0;
  let upgradeInputFinishes = 0;
  let upgradeNonzeroExits = 0;
  let upgradeReadableEnds = 0;
  let upgradeStarts = 0;
  let upgradeZeroExits = 0;
  const requestCounts = {
    container_create: 0,
    container_delete: 0,
    container_inspect: 0,
    container_logs: 0,
    container_start: 0,
    container_wait: 0,
    exec_start: 0,
    network_create: 0,
    other: 0,
    upgrade: 0,
  };
  const upgradeRoutes = {
    container_attach: 0,
    exec_start: 0,
    other: 0,
  };
  const sockets = new Set();
  const tunnels = new Set();
  const server = http.createServer(
    { allowHalfOpen: true },
    (request, response) => {
      void (async () => {
        if (closing) {
          throw new SupabaseLoopbackError("Le proxy Docker QA se ferme.");
        }
        if (typeof request.url !== "string" || !request.url.startsWith("/")) {
          throw new SupabaseLoopbackError("La route Docker QA est invalide.");
        }
        const forwardedUrl = stripDockerCapability(
          request.url,
          contract.capability,
        );
        requestCounts[dockerRequestKind(request.method, forwardedUrl, false)] +=
          1;
        const pathname = canonicalDockerPathname(forwardedUrl);
        if (
          request.method === "POST" &&
          (CONTAINER_CREATE_ROUTE.test(pathname) ||
            NETWORK_CREATE_ROUTE.test(pathname))
        ) {
          const rawBody = await collectBoundedBody(request);
          const parsedBody = safeJsonParse(rawBody.toString("utf8"));
          let forwardedBody;
          if (CONTAINER_CREATE_ROUTE.test(pathname)) {
            let rewritten;
            try {
              rewritten = rewriteDockerCreatePayload(forwardedUrl, parsedBody);
            } catch (error) {
              const parsedUrl = new URL(forwardedUrl, "http://docker.local");
              lastRejectedContainerShape = Object.freeze({
                name: parsedUrl.searchParams.get("name"),
                networkMode:
                  typeof parsedBody?.HostConfig?.NetworkMode === "string"
                    ? parsedBody.HostConfig.NetworkMode
                    : null,
                endpointNames: Object.keys(
                  parsedBody?.NetworkingConfig?.EndpointsConfig ?? {},
                ).sort(),
                labelsExact: exactProjectLabels(parsedBody?.Labels),
                publishAllPorts:
                  parsedBody?.HostConfig?.PublishAllPorts === true,
              });
              throw error;
            }
            projectContainerCreates += 1;
            if (rewritten.rewritten) rewrittenByName[rewritten.name] += 1;
            forwardedBody = rewritten.rewritten
              ? Buffer.from(JSON.stringify(rewritten.payload))
              : rawBody;
          } else {
            forwardedBody = Buffer.from(
              JSON.stringify(rewriteDockerNetworkCreatePayload(parsedBody)),
            );
            projectNetworkCreates += 1;
          }
          forwardHttpRequest(
            request,
            response,
            upstreamSocket,
            forwardedUrl,
            forwardedBody,
          );
          return;
        }
        forwardHttpRequest(
          request,
          response,
          upstreamSocket,
          forwardedUrl,
          undefined,
        );
      })().catch(() => writeProxyFailure(response));
    },
  );
  server.on("connection", (socket) => {
    if (closing) {
      socket.destroy();
      return;
    }
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
  });
  server.on("clientError", (_error, socket) => socket.destroy());
  server.on("upgrade", (request, socket, head) => {
    let forwardedUrl;
    let pathname;
    try {
      forwardedUrl = stripDockerCapability(request.url, contract.capability);
      pathname = canonicalDockerPathname(forwardedUrl);
    } catch {
      socket.destroy();
      return;
    }
    if (
      closing ||
      (request.method === "POST" &&
        (CONTAINER_CREATE_ROUTE.test(pathname) ||
          NETWORK_CREATE_ROUTE.test(pathname)))
    ) {
      socket.destroy();
      return;
    }
    requestCounts[dockerRequestKind(request.method, forwardedUrl, true)] += 1;
    upgradeRoutes[dockerUpgradeKind(forwardedUrl)] += 1;
    let tunnel;
    try {
      tunnel = validatedUpgradeTunnel(
        options.createUpgradeTunnel?.({ platform, upstreamSocket }) ??
          createDefaultUpgradeTunnel({
            environment: options.environment ?? process.env,
            platform,
            upstreamSocket,
          }),
      );
    } catch {
      socket.destroy();
      return;
    }
    let downstreamEnded = false;
    upgradeStarts += 1;
    tunnels.add(tunnel);
    tunnel.writable.write(rawUpgradeRequest(request, forwardedUrl));
    if (head.length > 0) tunnel.writable.write(head);
    socket.pipe(tunnel.writable);
    tunnel.readable.pipe(socket);
    tunnel.readable.once("end", () => {
      upgradeReadableEnds += 1;
      socket.end();
    });
    tunnel.readable.once("error", () => socket.destroy());
    tunnel.writable.once("error", () => socket.destroy());
    tunnel.writable.once("finish", () => {
      upgradeInputFinishes += 1;
    });
    socket.once("end", () => {
      downstreamEnded = true;
      upgradeDownstreamEnds += 1;
    });
    socket.once("error", () => tunnel.destroy());
    socket.once("close", (hadError) => {
      if (hadError || !downstreamEnded) tunnel.destroy();
    });
    if (tunnel.child !== undefined) {
      tunnel.child.once("error", () => {
        upgradeChildErrors += 1;
        socket.destroy();
      });
      tunnel.child.once("exit", (code) => {
        tunnels.delete(tunnel);
        if (code === 0) upgradeZeroExits += 1;
        else upgradeNonzeroExits += 1;
        if (code !== 0 && !socket.destroyed) socket.destroy();
      });
    } else {
      tunnel.readable.once("close", () => tunnels.delete(tunnel));
    }
  });

  let dockerHost = contract.dockerHost;
  try {
    await new Promise((resolve, reject) => {
      const onError = (error) => {
        server.removeListener("listening", onListening);
        reject(error);
      };
      const onListening = () => {
        server.removeListener("error", onError);
        resolve();
      };
      server.once("error", onError);
      server.once("listening", onListening);
      if (contract.listenOptions === null) server.listen(contract.listenPath);
      else server.listen(contract.listenOptions);
    });
    if (platform !== "win32") await chmod(contract.listenPath, 0o600);
    if (platform === "win32") {
      const address = server.address();
      if (
        address === null ||
        typeof address === "string" ||
        address.address !== "127.0.0.1" ||
        address.family !== "IPv4" ||
        !Number.isInteger(address.port) ||
        address.port < 1 ||
        address.port > 65_535
      ) {
        throw new SupabaseLoopbackError(
          "Le proxy Docker QA n'ecoute pas sur IPv4 loopback.",
        );
      }
      dockerHost = `tcp://127.0.0.1:${address.port}/${contract.capability}`;
    }
  } catch (error) {
    closing = true;
    server.closeAllConnections?.();
    for (const tunnel of tunnels) tunnel.destroy();
    for (const socket of sockets) socket.destroy();
    if (server.listening) {
      await new Promise((resolve) => server.close(() => resolve()));
    }
    if (cleanupDirectoryOwned && contract.cleanupDirectory !== null) {
      await rm(contract.cleanupDirectory, {
        force: true,
        recursive: true,
      }).catch(() => undefined);
    }
    throw error;
  }

  let closePromise = null;
  const close = () => {
    if (closePromise !== null) return closePromise;
    closing = true;
    closePromise = (async () => {
      const serverClosed = new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      server.closeAllConnections?.();
      const tunnelCompletions = [];
      for (const tunnel of tunnels) {
        tunnel.destroy();
        if (tunnel.completion instanceof Promise) {
          tunnelCompletions.push(tunnel.completion);
        }
      }
      for (const socket of sockets) socket.destroy();
      if (tunnelCompletions.length > 0) {
        await Promise.race([
          Promise.allSettled(tunnelCompletions),
          delay(5_000, undefined, { ref: false }),
        ]);
      }
      await serverClosed;
      if (cleanupDirectoryOwned && contract.cleanupDirectory !== null) {
        await rm(contract.cleanupDirectory, { force: true, recursive: true });
      }
    })();
    return closePromise;
  };
  const abortListener = () => {
    void close().catch(() => undefined);
  };
  options.signal?.addEventListener("abort", abortListener, { once: true });
  if (options.signal?.aborted === true) {
    options.signal.removeEventListener("abort", abortListener);
    await close();
    throw new SupabaseLoopbackError(
      "La creation du proxy Docker QA a ete interrompue.",
    );
  }

  return Object.freeze({
    close: async () => {
      options.signal?.removeEventListener("abort", abortListener);
      await close();
    },
    dockerHost,
    getPublicState: () =>
      Object.freeze({
        projectContainerCreates,
        projectNetworkCreates,
        lastRejectedContainerShape,
        requestCounts: Object.freeze({ ...requestCounts }),
        upgradeRoutes: Object.freeze({ ...upgradeRoutes }),
        upgradeTransport: Object.freeze({
          childErrors: upgradeChildErrors,
          downstreamEnds: upgradeDownstreamEnds,
          inputFinishes: upgradeInputFinishes,
          nonzeroExits: upgradeNonzeroExits,
          readableEnds: upgradeReadableEnds,
          starts: upgradeStarts,
          zeroExits: upgradeZeroExits,
        }),
        rewrittenByName: Object.freeze({ ...rewrittenByName }),
        rewrittenPublicationCreates: Object.values(rewrittenByName).reduce(
          (sum, count) => sum + count,
          0,
        ),
      }),
  });
}

export function dockerProxyEnvironment(
  environment,
  dockerHost,
  platform = process.platform,
) {
  const tcpMatch =
    typeof dockerHost === "string"
      ? /^tcp:\/\/127\.0\.0\.1:([1-9]\d{0,4})\/[a-f0-9]{32}$/u.exec(dockerHost)
      : null;
  const localProxyHostIsValid =
    (typeof dockerHost === "string" &&
      /^unix:\/\/\/[^?#]+$/u.test(dockerHost)) ||
    (tcpMatch !== null && Number(tcpMatch[1]) <= 65_535);
  const configuredHost = environmentValue(
    environment,
    "DOCKER_HOST",
    platform,
  )?.trim();
  const configuredHostIsSafe =
    !configuredHost ||
    (platform !== "win32" &&
      localUnixDockerSocketPath(configuredHost) !== null);
  if (!configuredHostIsSafe || !localProxyHostIsValid) {
    throw new SupabaseLoopbackError(
      "L'environnement Docker proxy de la recette est invalide.",
    );
  }
  const next = { ...environment };
  for (const name of [
    "DOCKER_HOST",
    "DOCKER_CONTEXT",
    "DOCKER_TLS_VERIFY",
    "DOCKER_CERT_PATH",
    "DOCKER_API_VERSION",
  ]) {
    deleteEnvironmentKey(next, name, platform);
  }
  next.DOCKER_HOST = dockerHost;
  return next;
}
