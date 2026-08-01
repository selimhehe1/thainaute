import { unstable_getResponseFromNextConfig } from "next/experimental/testing/server";
import { describe, expect, it } from "vitest";

import nextConfig from "../next.config";

const API_PATHS = [
  "/api/v1",
  "/api/v1/health/live",
  "/api/v1/content/lessons/10000000-0000-4000-8000-000000000001",
] as const;

describe("politique HTTP de l'API v1", () => {
  it("désactive la signature technologique de Next.js", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it.each(API_PATHS)("ferme la surface navigateur sur %s", async (path) => {
    const response = await unstable_getResponseFromNextConfig({
      url: `https://thainaute.example${path}`,
      nextConfig,
    });

    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.get("content-security-policy")).toBe(
      "default-src 'none'; frame-ancestors 'none'; sandbox",
    );

    const permissionsPolicy = response.headers.get("permissions-policy");
    expect(permissionsPolicy).toContain("camera=()");
    expect(permissionsPolicy).toContain("geolocation=()");
    expect(permissionsPolicy).toContain("microphone=()");
    expect(permissionsPolicy).toContain("payment=()");
    expect(permissionsPolicy).toContain("publickey-credentials-get=()");
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("ne pousse pas la CSP d'API sur les pages du produit", async () => {
    const response = await unstable_getResponseFromNextConfig({
      url: "https://thainaute.example/learn/demo",
      nextConfig,
    });

    expect(response.headers.get("content-security-policy")).toBeNull();
    expect(response.headers.get("permissions-policy")).toBeNull();
  });
});
