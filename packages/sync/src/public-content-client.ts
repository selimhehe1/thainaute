import {
  publicAudioAssetIdSchema,
  publicContentErrorResponseSchema,
  publicLessonResponseSchema,
  publicLessonVersionIdSchema,
  publicReleaseResponseSchema,
  type PublicLessonResponse,
  type PublicReleaseResponse,
} from "@thainaute/content/public";
import { z } from "zod";

import {
  verifyPublicLessonResponseIntegrity,
  verifyPublicReleaseResponseIntegrity,
  type PublicContentSha256Hex,
} from "./public-content-integrity";

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_TIMEOUT_MS = 120_000;
const sha256EtagSchema = z.string().regex(/^"sha256-[0-9a-f]{64}"$/u);
const validatedAtSchema = z.iso.datetime({ precision: 3, offset: true });

export const cachedPublicLessonSchema = z
  .strictObject({
    kind: z.literal("lesson"),
    key: publicLessonVersionIdSchema,
    etag: sha256EtagSchema,
    validatedAt: validatedAtSchema,
    response: publicLessonResponseSchema,
  })
  .superRefine((entry, context) => {
    if (entry.key !== entry.response.lesson.versionId) {
      context.addIssue({
        code: "custom",
        message: "La clé du cache ne correspond pas à la version de leçon.",
        path: ["key"],
      });
    }
    if (entry.etag !== `"sha256-${entry.response.contentSha256}"`) {
      context.addIssue({
        code: "custom",
        message: "L'ETag du cache ne correspond pas au contenu.",
        path: ["etag"],
      });
    }
  });

export const cachedPublicReleaseSchema = z
  .strictObject({
    kind: z.literal("release"),
    key: z.literal("current"),
    etag: sha256EtagSchema,
    validatedAt: validatedAtSchema,
    response: publicReleaseResponseSchema,
  })
  .superRefine((entry, context) => {
    if (entry.etag !== `"sha256-${entry.response.manifestSha256}"`) {
      context.addIssue({
        code: "custom",
        message: "L'ETag du cache ne correspond pas au manifeste.",
        path: ["etag"],
      });
    }
  });

export type CachedPublicLesson = z.infer<typeof cachedPublicLessonSchema>;
export type CachedPublicRelease = z.infer<typeof cachedPublicReleaseSchema>;

export class PublicContentClientConfigurationError extends Error {
  public constructor() {
    super("La configuration de lecture du contenu est invalide.");
    this.name = "PublicContentClientConfigurationError";
  }
}

export class PublicContentTransportError extends Error {
  public constructor() {
    super("Le contenu publié est momentanément injoignable.");
    this.name = "PublicContentTransportError";
  }
}

export class PublicContentProtocolError extends Error {
  public constructor() {
    super("La réponse de contenu ne respecte pas le protocole attendu.");
    this.name = "PublicContentProtocolError";
  }
}

export class PublicContentApiError extends Error {
  public readonly status: number;
  public readonly code:
    "content_not_found" | "content_unavailable" | "invalid_content_id";

  public constructor(input: {
    readonly status: number;
    readonly code:
      "content_not_found" | "content_unavailable" | "invalid_content_id";
  }) {
    super("Le service a refusé la lecture du contenu.");
    this.name = "PublicContentApiError";
    this.status = input.status;
    this.code = input.code;
  }
}

export interface PublicContentClientOptions {
  /** Origine absolue sur mobile, chaîne vide pour l'origine web courante. */
  readonly baseUrl: string;
  readonly allowInsecureHttp?: boolean;
  readonly timeoutMs?: number;
  readonly fetch?: (input: string, init: RequestInit) => Promise<Response>;
  readonly now?: () => string;
  readonly sha256Hex: PublicContentSha256Hex;
}

export interface PublicContentFetchResult<T> {
  readonly entry: T;
  readonly revalidated: boolean;
}

export interface PublicContentClient {
  getCurrentRelease(
    cached?: CachedPublicRelease,
  ): Promise<PublicContentFetchResult<CachedPublicRelease>>;
  getLesson(
    versionId: string,
    cached?: CachedPublicLesson,
  ): Promise<PublicContentFetchResult<CachedPublicLesson>>;
  audioUrl(versionId: string, assetId: string): string;
}

function normalizeBaseUrl(input: string, allowInsecureHttp: boolean): string {
  const value = input.trim();
  if (value === "") return "";
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new PublicContentClientConfigurationError();
  }
  if (
    (url.protocol !== "https:" &&
      !(allowInsecureHttp && url.protocol === "http:")) ||
    url.username !== "" ||
    url.password !== "" ||
    url.pathname !== "/" ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new PublicContentClientConfigurationError();
  }
  return url.href.replace(/\/+$/u, "");
}

function jsonMediaType(response: Response): boolean {
  return (
    response.headers
      .get("content-type")
      ?.split(";", 1)[0]
      ?.trim()
      .toLowerCase() === "application/json"
  );
}

export function createPublicContentClient(
  options: PublicContentClientOptions,
): PublicContentClient {
  const baseUrl = normalizeBaseUrl(
    options.baseUrl,
    options.allowInsecureHttp === true,
  );
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (
    !Number.isInteger(timeoutMs) ||
    timeoutMs < 1 ||
    timeoutMs > MAX_TIMEOUT_MS
  ) {
    throw new PublicContentClientConfigurationError();
  }
  const fetcher = options.fetch ?? globalThis.fetch;
  if (
    typeof fetcher !== "function" ||
    typeof options.sha256Hex !== "function"
  ) {
    throw new PublicContentClientConfigurationError();
  }
  const sha256Hex = options.sha256Hex;
  const now = options.now ?? (() => new Date().toISOString());

  async function request<T>(input: {
    readonly path: string;
    readonly cached: T | undefined;
    readonly cachedEtag: (entry: T) => string;
    readonly parse: (value: unknown, etag: string, now: string) => Promise<T>;
  }): Promise<PublicContentFetchResult<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      try {
        response = await fetcher(`${baseUrl}${input.path}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
            ...(input.cached === undefined
              ? {}
              : { "If-None-Match": input.cachedEtag(input.cached) }),
          },
          credentials: "omit",
          signal: controller.signal,
        });
      } catch {
        throw new PublicContentTransportError();
      }
      if (response.redirected) throw new PublicContentProtocolError();

      if (response.status === 304) {
        if (input.cached === undefined) throw new PublicContentProtocolError();
        const etag = response.headers.get("etag");
        if (etag !== input.cachedEtag(input.cached)) {
          throw new PublicContentProtocolError();
        }
        try {
          return {
            entry: await input.parse(input.cached, etag, now()),
            revalidated: true,
          };
        } catch {
          throw new PublicContentProtocolError();
        }
      }

      if (!jsonMediaType(response)) throw new PublicContentProtocolError();
      let payload: unknown;
      try {
        payload = (await response.json()) as unknown;
      } catch {
        throw new PublicContentProtocolError();
      }
      if (!response.ok) {
        const error = publicContentErrorResponseSchema.safeParse(payload);
        if (!error.success) throw new PublicContentProtocolError();
        throw new PublicContentApiError({
          status: response.status,
          code: error.data.error.code,
        });
      }

      const etag = response.headers.get("etag");
      if (etag === null) throw new PublicContentProtocolError();
      try {
        return {
          entry: await input.parse(payload, etag, now()),
          revalidated: false,
        };
      } catch {
        throw new PublicContentProtocolError();
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    async getCurrentRelease(cachedInput) {
      const cachedResult = cachedPublicReleaseSchema.safeParse(cachedInput);
      const cached =
        cachedInput === undefined
          ? undefined
          : cachedResult.success
            ? cachedResult.data
            : (() => {
                throw new PublicContentProtocolError();
              })();
      return request({
        path: "/api/v1/content/releases/current",
        cached,
        cachedEtag: (entry) => entry.etag,
        parse: async (value, etag, validatedAt) => {
          const response = await verifyPublicReleaseResponseIntegrity(
            cached !== undefined && value === cached ? cached.response : value,
            sha256Hex,
          );
          return cachedPublicReleaseSchema.parse({
            kind: "release",
            key: "current",
            etag,
            validatedAt,
            response,
          });
        },
      });
    },

    async getLesson(versionIdInput, cachedInput) {
      const versionIdResult =
        publicLessonVersionIdSchema.safeParse(versionIdInput);
      if (!versionIdResult.success) throw new PublicContentProtocolError();
      const versionId = versionIdResult.data;
      const cachedResult = cachedPublicLessonSchema.safeParse(cachedInput);
      const cached =
        cachedInput === undefined
          ? undefined
          : cachedResult.success
            ? cachedResult.data
            : (() => {
                throw new PublicContentProtocolError();
              })();
      if (cached !== undefined && cached.key !== versionId) {
        throw new PublicContentProtocolError();
      }
      return request({
        path: `/api/v1/content/lessons/${encodeURIComponent(versionId)}`,
        cached,
        cachedEtag: (entry) => entry.etag,
        parse: async (value, etag, validatedAt) => {
          const response: PublicLessonResponse =
            await verifyPublicLessonResponseIntegrity(
              cached !== undefined && value === cached
                ? cached.response
                : value,
              sha256Hex,
            );
          return cachedPublicLessonSchema.parse({
            kind: "lesson",
            key: versionId,
            etag,
            validatedAt,
            response,
          });
        },
      });
    },

    audioUrl(versionIdInput, assetIdInput) {
      const versionId = publicLessonVersionIdSchema.safeParse(versionIdInput);
      const assetId = publicAudioAssetIdSchema.safeParse(assetIdInput);
      if (!versionId.success || !assetId.success) {
        throw new PublicContentProtocolError();
      }
      return `${baseUrl}/api/v1/content/lessons/${encodeURIComponent(versionId.data)}/audio/${encodeURIComponent(assetId.data)}`;
    },
  };
}

export type { PublicLessonResponse, PublicReleaseResponse };
