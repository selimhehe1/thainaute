import { unstable_getResponseFromNextConfig } from "next/experimental/testing/server";
import { describe, expect, it } from "vitest";

import nextConfig from "../next.config";

const API_PATHS = [
  "/api/v1",
  "/api/v1/health/live",
  "/api/v1/content/lessons/10000000-0000-4000-8000-000000000001",
] as const;

const PRODUCT_PAGE_PATHS = ["/", "/learn/demo"] as const;

describe("politiques HTTP du web", () => {
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

  it.each(PRODUCT_PAGE_PATHS)(
    "durcit la page produit %s sans bloquer les ressources Next ni le microphone local",
    async (path) => {
      const response = await unstable_getResponseFromNextConfig({
        url: `https://thainaute.example${path}`,
        nextConfig,
      });

      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.get("referrer-policy")).toBe(
        "strict-origin-when-cross-origin",
      );
      expect(response.headers.get("content-security-policy")).toBe(
        "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
      );

      const permissionsPolicy = response.headers.get("permissions-policy");
      expect(permissionsPolicy).toContain("microphone=(self)");
      expect(permissionsPolicy).not.toContain("microphone=()");
      expect(permissionsPolicy).toContain("payment=()");
    },
  );

  it("intercepte les anciennes URLs statiques des audios internes avant public/", async () => {
    const response = await unstable_getResponseFromNextConfig({
      url: "https://thainaute.example/audio/u01-l1a/9ae0a4f7-d9cb-551d-b247-7d258e606b29.wav",
      nextConfig,
    });

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://thainaute.example/learn/lecon/u01-l1a/preview/audio/9ae0a4f7-d9cb-551d-b247-7d258e606b29",
    );

    const fixture = await unstable_getResponseFromNextConfig({
      url: "https://thainaute.example/audio/fixture-tone.wav",
      nextConfig,
    });
    expect(fixture.headers.get("x-middleware-rewrite")).toBeNull();
  });
});
