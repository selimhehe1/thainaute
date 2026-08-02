import { createHash, randomUUID } from "node:crypto";

import {
  PUBLIC_AUDIO_MAX_BYTES,
  publicAudioAssetIdSchema,
  publicLessonVersionIdSchema,
} from "@thainaute/content/public";

import { apiResponseHeaders } from "../api-http";
import { parsePublishedAudioStorageLocation } from "./audio-path";
import {
  ContentDeliveryError,
  ContentInfrastructureError,
  ContentIntegrityError,
} from "./errors";
import { contentDeliveryErrorResponse } from "./http";
import { toPublicLessonResponse } from "./mapper";
import type {
  PublishedAudioObjectStore,
  PublishedLessonRepository,
} from "./ports";

const REVOCABLE_CACHE_CONTROL =
  "public, max-age=0, s-maxage=300, must-revalidate";

type ByteRange =
  | { readonly status: "invalid" }
  | { readonly status: "none" }
  | {
      readonly status: "valid";
      readonly start: number;
      readonly endInclusive: number;
    };

function matchesIfNoneMatch(value: string | null, etag: string): boolean {
  if (value === null) return false;
  return value.split(",").some((candidate) => {
    const normalized = candidate.trim();
    return (
      normalized === "*" || normalized === etag || normalized === `W/${etag}`
    );
  });
}

function parseByteRange(value: string | null, total: number): ByteRange {
  if (value === null) return { status: "none" };
  const match = /^bytes=(\d*)-(\d*)$/u.exec(value.trim());
  if (match === null) return { status: "invalid" };
  const rawStart = match[1] ?? "";
  const rawEnd = match[2] ?? "";
  if (rawStart === "" && rawEnd === "") return { status: "invalid" };

  if (rawStart === "") {
    const suffixLength = Number(rawEnd);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
      return { status: "invalid" };
    }
    return {
      status: "valid",
      start: Math.max(0, total - suffixLength),
      endInclusive: total - 1,
    };
  }

  const start = Number(rawStart);
  const requestedEnd = rawEnd === "" ? total - 1 : Number(rawEnd);
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(requestedEnd) ||
    start < 0 ||
    requestedEnd < start ||
    start >= total
  ) {
    return { status: "invalid" };
  }
  return {
    status: "valid",
    start,
    endInclusive: Math.min(requestedEnd, total - 1),
  };
}

function rangeNotSatisfiable(total: number): Response {
  return new Response(null, {
    status: 416,
    headers: apiResponseHeaders(416, {
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store, max-age=0",
      "Content-Range": `bytes */${total}`,
    }),
  });
}

export interface PublishedAudioHttpDependencies {
  readonly repository: PublishedLessonRepository;
  readonly objectStore: PublishedAudioObjectStore;
  readonly activeReleaseId: string;
  readonly requestIdFactory?: () => string;
  readonly reportOperationalFailure?: (event: {
    readonly operation: "published_audio_read";
    readonly errorKind: "content_integrity_failed" | "content_unavailable";
    readonly requestId: string;
  }) => void;
}

export function createPublishedAudioHttpHandler(
  dependencies: PublishedAudioHttpDependencies,
) {
  return async function handlePublishedAudio(
    request: Request,
    rawVersionId: string,
    rawAssetId: string,
  ): Promise<Response> {
    const requestId = (dependencies.requestIdFactory ?? randomUUID)();

    try {
      const versionId = publicLessonVersionIdSchema.safeParse(rawVersionId);
      const assetId = publicAudioAssetIdSchema.safeParse(rawAssetId);
      if (!versionId.success || !assetId.success) {
        throw new ContentDeliveryError("invalid_content_id");
      }

      let verified;
      try {
        verified = await dependencies.repository.loadPublishedBundle(
          versionId.data,
        );
      } catch (error) {
        if (error instanceof ContentInfrastructureError) throw error;
        if (error instanceof ContentIntegrityError) throw error;
        throw new ContentInfrastructureError();
      }
      if (
        verified === null ||
        verified.release.id !== dependencies.activeReleaseId ||
        toPublicLessonResponse(verified) === null
      ) {
        throw new ContentDeliveryError("content_not_found");
      }

      const entry = verified.bundle.audioManifest.entries.find(
        (candidate) => candidate.assetId === assetId.data,
      );
      if (entry === undefined) {
        throw new ContentDeliveryError("content_not_found");
      }
      if (
        entry.variant === "fixture" ||
        entry.byteLength > PUBLIC_AUDIO_MAX_BYTES
      ) {
        throw new ContentIntegrityError();
      }
      const location = parsePublishedAudioStorageLocation(entry.canonicalPath);
      if (location === null) throw new ContentIntegrityError();

      const etag = `"sha256-${entry.sha256}"`;
      const range = parseByteRange(
        request.headers.get("range"),
        entry.byteLength,
      );
      if (range.status === "invalid") {
        return rangeNotSatisfiable(entry.byteLength);
      }
      if (
        range.status === "none" &&
        matchesIfNoneMatch(request.headers.get("if-none-match"), etag)
      ) {
        return new Response(null, {
          status: 304,
          headers: apiResponseHeaders(304, {
            "Accept-Ranges": "bytes",
            "Cache-Control": REVOCABLE_CACHE_CONTROL,
            ETag: etag,
          }),
        });
      }

      const object = await dependencies.objectStore.download(location);
      if (object === null || object.size !== entry.byteLength) {
        throw new ContentIntegrityError();
      }
      const bytes = new Uint8Array(await object.arrayBuffer());
      const hash = createHash("sha256").update(bytes).digest("hex");
      if (bytes.byteLength !== entry.byteLength || hash !== entry.sha256) {
        throw new ContentIntegrityError();
      }

      const start = range.status === "valid" ? range.start : 0;
      const endInclusive =
        range.status === "valid" ? range.endInclusive : bytes.byteLength - 1;
      const body = bytes.slice(start, endInclusive + 1);
      const status = range.status === "valid" ? 206 : 200;
      return new Response(body, {
        status,
        headers: apiResponseHeaders(status, {
          "Accept-Ranges": "bytes",
          "Cache-Control": REVOCABLE_CACHE_CONTROL,
          "Content-Length": String(body.byteLength),
          "Content-Type": entry.mimeType,
          ETag: etag,
          ...(range.status === "valid"
            ? {
                "Content-Range": `bytes ${start}-${endInclusive}/${bytes.byteLength}`,
              }
            : {}),
        }),
      });
    } catch (error) {
      const integrityFailure = error instanceof ContentIntegrityError;
      if (integrityFailure) {
        dependencies.reportOperationalFailure?.({
          operation: "published_audio_read",
          errorKind: "content_integrity_failed",
          requestId,
        });
      }
      const apiError =
        error instanceof ContentDeliveryError
          ? error
          : integrityFailure
            ? new ContentDeliveryError("content_not_found")
            : new ContentDeliveryError("content_unavailable");
      if (apiError.code === "content_unavailable") {
        dependencies.reportOperationalFailure?.({
          operation: "published_audio_read",
          errorKind: "content_unavailable",
          requestId,
        });
      }
      return contentDeliveryErrorResponse(apiError, requestId);
    }
  };
}
