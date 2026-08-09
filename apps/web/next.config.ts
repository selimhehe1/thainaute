import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const protectedDraftAudioLessons = [
  "u01-l1a",
  "u01-l1b",
  "u01-l1d",
  "u01-l1f",
] as const;

const productPageSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  },
  {
    key: "Permissions-Policy",
    value:
      "browsing-topics=(), camera=(), display-capture=(), geolocation=(), microphone=(self), payment=(), usb=()",
  },
] as const;

const apiSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  {
    key: "Content-Security-Policy",
    value: "default-src 'none'; frame-ancestors 'none'; sandbox",
  },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), autoplay=(), browsing-topics=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), usb=(), web-share=(), xr-spatial-tracking=()",
  },
] as const;

const activeLanguagePack =
  process.env.NEXT_PUBLIC_THAINAUTE_LANGUAGE_PACK ??
  process.env["THAINAUTE_LANGUAGE_PACK"] ??
  "thai-fr";

const nextConfig: NextConfig = {
  outputFileTracingRoot: workspaceRoot,
  outputFileTracingIncludes: {
    "/learn/lecon/*/preview/audio/*": protectedDraftAudioLessons.map(
      (lessonId) => `../../packages/content/assets/audio/${lessonId}/**/*`,
    ),
  },
  poweredByHeader: false,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_THAINAUTE_LANGUAGE_PACK: activeLanguagePack,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...productPageSecurityHeaders],
      },
      {
        source: "/api/v1/:path*",
        headers: [...apiSecurityHeaders],
      },
    ];
  },
  async rewrites() {
    return {
      // Neutralise les anciennes copies sous `public/` avant la résolution du
      // filesystem. Même une URL historique repasse ainsi par content_editor.
      beforeFiles: protectedDraftAudioLessons.map((lessonId) => ({
        source: `/audio/${lessonId}/:assetId.wav`,
        destination: `/learn/lecon/${lessonId}/preview/audio/:assetId`,
      })),
      afterFiles: [],
      fallback: [],
    };
  },
  transpilePackages: [
    "@thainaute/analytics",
    "@thainaute/content",
    "@thainaute/design-tokens",
    "@thainaute/domain",
    "@thainaute/sync",
  ],
};

export default nextConfig;
