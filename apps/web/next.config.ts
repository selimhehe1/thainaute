import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@thainaute/analytics",
    "@thainaute/content",
    "@thainaute/design-tokens",
    "@thainaute/domain",
    "@thainaute/sync",
  ],
};

export default nextConfig;
