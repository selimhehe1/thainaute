import type { NextConfig } from "next";

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

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/api/v1/:path*",
        headers: [...apiSecurityHeaders],
      },
    ];
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
