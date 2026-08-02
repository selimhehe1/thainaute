import {
  PUBLIC_AUDIO_MAX_BYTES,
  publicAudioAssetSchema,
  type PublicAudioAsset,
} from "@thainaute/content/public";

import { parseMobileNetworkUrl } from "./mobile-network-url";

const STALE_TEMPORARY_FILE_MS = 24 * 60 * 60 * 1000;
const TEMPORARY_ID_PATTERN = /^[0-9A-Za-z-]{1,64}$/u;
const TEMPORARY_FILE_PATTERN = /^[a-f0-9]{64}\.[0-9A-Za-z-]{1,64}\.part$/u;

export interface MobilePublicAudioFileStat {
  readonly exists: boolean;
  readonly size: number | null;
}

export interface MobilePublicAudioCacheFile {
  readonly modificationTimeMs: number | null;
  readonly name: string;
  readonly uri: string;
}

export interface MobilePublicAudioFileSystemPort {
  ensureCacheDirectory(): Promise<void>;
  listCacheFiles(): Promise<readonly MobilePublicAudioCacheFile[]>;
  resolveCacheFile(name: string): string;
  stat(uri: string): Promise<MobilePublicAudioFileStat>;
  readBytes(uri: string): Promise<Uint8Array<ArrayBuffer>>;
  writeBytes(uri: string, bytes: Uint8Array<ArrayBuffer>): Promise<void>;
  move(sourceUri: string, destinationUri: string): Promise<void>;
  remove(uri: string): Promise<void>;
}

export interface MobilePublicAudioCryptoPort {
  randomId(): string;
  sha256Hex(bytes: Uint8Array<ArrayBuffer>): Promise<string>;
}

export interface MobilePublicAudioNetworkResponse {
  readonly bytes: Uint8Array<ArrayBuffer> | null;
  readonly contentLength: string | null;
  readonly contentType: string | null;
  readonly etag: string | null;
  readonly redirected: boolean;
  readonly responseUrl: string;
  readonly status: number;
}

export interface MobilePublicAudioNetworkPort {
  request(input: {
    readonly accept: PublicAudioAsset["mimeType"];
    readonly ifNoneMatch?: string;
    readonly maximumBytes: number;
    readonly signal?: AbortSignal;
    readonly url: string;
  }): Promise<MobilePublicAudioNetworkResponse>;
}

export interface MobilePublicAudioCachePorts {
  readonly crypto: MobilePublicAudioCryptoPort;
  readonly fileSystem: MobilePublicAudioFileSystemPort;
  readonly network: MobilePublicAudioNetworkPort;
  readonly nowMs: () => number;
}

export type MobilePublicAudioCacheFailureCode =
  | "cache_cleanup_failed"
  | "cache_read_failed"
  | "cache_write_failed"
  | "digest_mismatch"
  | "download_cancelled"
  | "download_failed"
  | "insecure_url"
  | "invalid_request"
  | "revalidation_failed"
  | "size_mismatch";

export class MobilePublicAudioCacheError extends Error {
  public readonly code: MobilePublicAudioCacheFailureCode;

  public constructor(code: MobilePublicAudioCacheFailureCode) {
    super("L’audio public n’a pas pu être mis en cache en sécurité.");
    this.name = "MobilePublicAudioCacheError";
    this.code = code;
  }
}

export interface MobilePublicAudioCacheResult {
  readonly asset: PublicAudioAsset;
  readonly uri: string;
  readonly reused: boolean;
}

type FileVerification =
  | { readonly state: "missing" }
  | { readonly state: "valid" }
  | {
      readonly state: "invalid";
      readonly reason: "digest_mismatch" | "size_mismatch";
    };

function audioExtension(mimeType: PublicAudioAsset["mimeType"]): string {
  return mimeType === "audio/wav" ? "wav" : "mp3";
}

function audioEtag(asset: PublicAudioAsset): string {
  return `"sha256-${asset.sha256}"`;
}

function validateDownloadUrl(value: string, development: boolean): string {
  const result = parseMobileNetworkUrl({
    development,
    kind: "public_resource",
    value,
  });
  if (!result.success) {
    throw new MobilePublicAudioCacheError(
      result.reason === "insecure_http" ? "insecure_url" : "invalid_request",
    );
  }
  return result.url;
}

function normalizeFailure(error: unknown): MobilePublicAudioCacheError {
  return error instanceof MobilePublicAudioCacheError
    ? error
    : new MobilePublicAudioCacheError("cache_write_failed");
}

function signalIsAborted(signal: AbortSignal | undefined): boolean {
  return signal?.aborted === true;
}

async function verifyFile(
  ports: MobilePublicAudioCachePorts,
  uri: string,
  asset: PublicAudioAsset,
): Promise<FileVerification> {
  let stat: MobilePublicAudioFileStat;
  try {
    stat = await ports.fileSystem.stat(uri);
  } catch {
    throw new MobilePublicAudioCacheError("cache_read_failed");
  }
  if (!stat.exists) return { state: "missing" };
  if (stat.size === null || !Number.isSafeInteger(stat.size) || stat.size < 0) {
    throw new MobilePublicAudioCacheError("cache_read_failed");
  }
  if (stat.size !== asset.byteLength) {
    return { state: "invalid", reason: "size_mismatch" };
  }

  let bytes: Uint8Array<ArrayBuffer>;
  let digest: string;
  try {
    bytes = await ports.fileSystem.readBytes(uri);
    if (bytes.byteLength !== asset.byteLength) {
      return { state: "invalid", reason: "size_mismatch" };
    }
    digest = await ports.crypto.sha256Hex(bytes);
  } catch {
    throw new MobilePublicAudioCacheError("cache_read_failed");
  }
  if (digest !== asset.sha256) {
    return { state: "invalid", reason: "digest_mismatch" };
  }
  return { state: "valid" };
}

async function removeAndConfirm(
  fileSystem: MobilePublicAudioFileSystemPort,
  uri: string,
): Promise<void> {
  try {
    if (!(await fileSystem.stat(uri)).exists) return;
    await fileSystem.remove(uri);
    if ((await fileSystem.stat(uri)).exists) {
      throw new Error("retained");
    }
  } catch {
    throw new MobilePublicAudioCacheError("cache_cleanup_failed");
  }
}

async function removeInvalidExistingFile(
  ports: MobilePublicAudioCachePorts,
  uri: string,
  verification: FileVerification,
): Promise<void> {
  if (verification.state !== "invalid") return;
  await removeAndConfirm(ports.fileSystem, uri);
}

async function cleanupStaleTemporaryFiles(
  ports: MobilePublicAudioCachePorts,
): Promise<void> {
  let files: readonly MobilePublicAudioCacheFile[];
  let nowMs: number;
  try {
    files = await ports.fileSystem.listCacheFiles();
    nowMs = ports.nowMs();
  } catch {
    throw new MobilePublicAudioCacheError("cache_cleanup_failed");
  }
  if (!Number.isFinite(nowMs)) {
    throw new MobilePublicAudioCacheError("cache_cleanup_failed");
  }

  for (const file of files) {
    if (
      !TEMPORARY_FILE_PATTERN.test(file.name) ||
      file.modificationTimeMs === null ||
      !Number.isFinite(file.modificationTimeMs) ||
      file.modificationTimeMs > nowMs - STALE_TEMPORARY_FILE_MS
    ) {
      continue;
    }
    let expectedUri: string;
    try {
      expectedUri = ports.fileSystem.resolveCacheFile(file.name);
    } catch {
      throw new MobilePublicAudioCacheError("cache_cleanup_failed");
    }
    if (expectedUri !== file.uri) continue;
    await removeAndConfirm(ports.fileSystem, file.uri);
  }
}

async function requestRemoteAudio(
  ports: MobilePublicAudioCachePorts,
  input: {
    readonly asset: PublicAudioAsset;
    readonly cached: boolean;
    readonly signal?: AbortSignal;
    readonly url: string;
  },
): Promise<MobilePublicAudioNetworkResponse> {
  let response: MobilePublicAudioNetworkResponse;
  try {
    response = await ports.network.request({
      accept: input.asset.mimeType,
      maximumBytes: input.asset.byteLength,
      url: input.url,
      ...(input.cached ? { ifNoneMatch: audioEtag(input.asset) } : {}),
      ...(input.signal === undefined ? {} : { signal: input.signal }),
    });
  } catch {
    throw new MobilePublicAudioCacheError(
      signalIsAborted(input.signal) ? "download_cancelled" : "download_failed",
    );
  }
  if (signalIsAborted(input.signal)) {
    throw new MobilePublicAudioCacheError("download_cancelled");
  }
  if (
    response.redirected ||
    response.responseUrl !== input.url ||
    !Number.isSafeInteger(response.status)
  ) {
    throw new MobilePublicAudioCacheError("revalidation_failed");
  }
  return response;
}

async function validateDownloadedResponse(
  ports: MobilePublicAudioCachePorts,
  response: MobilePublicAudioNetworkResponse,
  asset: PublicAudioAsset,
): Promise<Uint8Array<ArrayBuffer>> {
  if (
    response.status !== 200 ||
    response.etag !== audioEtag(asset) ||
    response.contentType !== asset.mimeType ||
    response.contentLength !== String(asset.byteLength) ||
    response.bytes === null
  ) {
    throw new MobilePublicAudioCacheError("revalidation_failed");
  }
  if (response.bytes.byteLength !== asset.byteLength) {
    throw new MobilePublicAudioCacheError("size_mismatch");
  }
  let digest: string;
  try {
    digest = await ports.crypto.sha256Hex(response.bytes);
  } catch {
    throw new MobilePublicAudioCacheError("download_failed");
  }
  if (digest !== asset.sha256) {
    throw new MobilePublicAudioCacheError("digest_mismatch");
  }
  return response.bytes;
}

async function promoteVerifiedBytes(
  ports: MobilePublicAudioCachePorts,
  input: {
    readonly asset: PublicAudioAsset;
    readonly bytes: Uint8Array<ArrayBuffer>;
    readonly finalUri: string;
    readonly signal?: AbortSignal;
  },
): Promise<MobilePublicAudioCacheResult> {
  let temporaryId: string;
  try {
    temporaryId = ports.crypto.randomId();
  } catch {
    throw new MobilePublicAudioCacheError("cache_write_failed");
  }
  if (!TEMPORARY_ID_PATTERN.test(temporaryId)) {
    throw new MobilePublicAudioCacheError("cache_write_failed");
  }
  const temporaryUri = ports.fileSystem.resolveCacheFile(
    `${input.asset.sha256}.${temporaryId}.part`,
  );

  let result: MobilePublicAudioCacheResult | undefined;
  let operationError: MobilePublicAudioCacheError | undefined;
  try {
    await removeAndConfirm(ports.fileSystem, temporaryUri);
    try {
      await ports.fileSystem.writeBytes(temporaryUri, input.bytes);
    } catch {
      throw new MobilePublicAudioCacheError("cache_write_failed");
    }
    if (signalIsAborted(input.signal)) {
      throw new MobilePublicAudioCacheError("download_cancelled");
    }

    const temporaryVerification = await verifyFile(
      ports,
      temporaryUri,
      input.asset,
    );
    if (temporaryVerification.state === "missing") {
      throw new MobilePublicAudioCacheError("cache_write_failed");
    }
    if (temporaryVerification.state === "invalid") {
      throw new MobilePublicAudioCacheError(temporaryVerification.reason);
    }
    if (signalIsAborted(input.signal)) {
      throw new MobilePublicAudioCacheError("download_cancelled");
    }

    const racedFinal = await verifyFile(ports, input.finalUri, input.asset);
    if (racedFinal.state === "valid") {
      result = { asset: input.asset, uri: input.finalUri, reused: true };
    } else {
      await removeInvalidExistingFile(ports, input.finalUri, racedFinal);
      try {
        await ports.fileSystem.move(temporaryUri, input.finalUri);
      } catch {
        const concurrentFinal = await verifyFile(
          ports,
          input.finalUri,
          input.asset,
        );
        if (concurrentFinal.state !== "valid") {
          await removeInvalidExistingFile(
            ports,
            input.finalUri,
            concurrentFinal,
          );
          throw new MobilePublicAudioCacheError("cache_write_failed");
        }
        result = { asset: input.asset, uri: input.finalUri, reused: true };
      }
      if (result === undefined) {
        const promoted = await verifyFile(ports, input.finalUri, input.asset);
        if (promoted.state !== "valid") {
          await removeInvalidExistingFile(ports, input.finalUri, promoted);
          throw new MobilePublicAudioCacheError("cache_write_failed");
        }
        result = { asset: input.asset, uri: input.finalUri, reused: false };
      }
    }
  } catch (error) {
    operationError = normalizeFailure(error);
  }

  // Une panne de nettoyage prime afin qu’un fichier partiel ne soit jamais
  // présenté comme une réussite silencieuse.
  await removeAndConfirm(ports.fileSystem, temporaryUri);
  if (operationError !== undefined) throw operationError;
  if (result === undefined) {
    throw new MobilePublicAudioCacheError("cache_write_failed");
  }
  return result;
}

/**
 * Revalide toujours une copie locale avant de la servir. Un `200` est borné,
 * vérifié puis écrit dans un `.part`; seul un `304` avec ETag exact peut
 * réutiliser directement un fichier local re-vérifié.
 */
export async function ensureMobilePublicAudioCached(
  input: {
    readonly asset: PublicAudioAsset;
    readonly development: boolean;
    readonly signal?: AbortSignal;
    readonly url: string;
  },
  ports: MobilePublicAudioCachePorts,
): Promise<MobilePublicAudioCacheResult> {
  const assetResult = publicAudioAssetSchema.safeParse(input.asset);
  if (
    !assetResult.success ||
    assetResult.data.byteLength > PUBLIC_AUDIO_MAX_BYTES
  ) {
    throw new MobilePublicAudioCacheError("invalid_request");
  }
  const asset = assetResult.data;
  const url = validateDownloadUrl(input.url, input.development);
  if (signalIsAborted(input.signal)) {
    throw new MobilePublicAudioCacheError("download_cancelled");
  }

  try {
    await ports.fileSystem.ensureCacheDirectory();
  } catch {
    throw new MobilePublicAudioCacheError("cache_write_failed");
  }
  await cleanupStaleTemporaryFiles(ports);

  const finalUri = ports.fileSystem.resolveCacheFile(
    `${asset.sha256}.${audioExtension(asset.mimeType)}`,
  );
  const current = await verifyFile(ports, finalUri, asset);
  await removeInvalidExistingFile(ports, finalUri, current);

  const response = await requestRemoteAudio(ports, {
    asset,
    cached: current.state === "valid",
    url,
    ...(input.signal === undefined ? {} : { signal: input.signal }),
  });
  if (response.status === 304) {
    if (
      current.state !== "valid" ||
      response.etag !== audioEtag(asset) ||
      response.bytes !== null
    ) {
      throw new MobilePublicAudioCacheError("revalidation_failed");
    }
    const rechecked = await verifyFile(ports, finalUri, asset);
    if (rechecked.state !== "valid") {
      await removeInvalidExistingFile(ports, finalUri, rechecked);
      throw new MobilePublicAudioCacheError("revalidation_failed");
    }
    return { asset, uri: finalUri, reused: true };
  }
  if (response.status === 404) {
    if (current.state === "valid") {
      await removeAndConfirm(ports.fileSystem, finalUri);
    }
    throw new MobilePublicAudioCacheError("revalidation_failed");
  }

  const bytes = await validateDownloadedResponse(ports, response, asset);
  if (signalIsAborted(input.signal)) {
    throw new MobilePublicAudioCacheError("download_cancelled");
  }
  return promoteVerifiedBytes(ports, {
    asset,
    bytes,
    finalUri,
    ...(input.signal === undefined ? {} : { signal: input.signal }),
  });
}
