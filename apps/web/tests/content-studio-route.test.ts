import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const STUDIO_ENVIRONMENT = {
  THAINAUTE_STUDIO_MODE: "fixture",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example_public_value",
  SUPABASE_SECRET_KEY: "sb_secret_example_server_value",
} as const;

async function importRoute() {
  return import("../app/api/v1/studio/content/review/route");
}

function request(method = "GET"): Request {
  return new Request("https://thainaute.example/api/v1/studio/content/review", {
    method,
  });
}

describe("activation de la route Studio", () => {
  beforeEach(() => {
    vi.stubEnv("THAINAUTE_STUDIO_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it.each([
    {},
    { THAINAUTE_STUDIO_MODE: "disabled" },
    { THAINAUTE_STUDIO_MODE: "fixture" },
  ])(
    "répond par un 404 opaque quand la configuration est fermée %#",
    async (environment) => {
      for (const [name, value] of Object.entries(environment)) {
        vi.stubEnv(name, value);
      }
      const { GET } = await importRoute();
      const response = await GET(request());

      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toMatchObject({
        error: { code: "not_found", message: "Ressource introuvable." },
      });
    },
  );

  it("active le contrôle Bearer sans contacter Auth avant validation", async () => {
    for (const [name, value] of Object.entries(STUDIO_ENVIRONMENT)) {
      vi.stubEnv(name, value);
    }
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const { GET } = await importRoute();
    const response = await GET(request());

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe("Bearer");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each(["POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"] as const)(
    "masque la méthode %s même lorsque le Studio est activé",
    async (method) => {
      for (const [name, value] of Object.entries(STUDIO_ENVIRONMENT)) {
        vi.stubEnv(name, value);
      }
      const fetcher = vi.fn();
      vi.stubGlobal("fetch", fetcher);
      const route = await importRoute();
      const response = route[method]();

      expect(response.status).toBe(404);
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(response.headers.get("allow")).toBeNull();
      await expect(response.json()).resolves.toMatchObject({
        error: { code: "not_found", message: "Ressource introuvable." },
      });
      expect(fetcher).not.toHaveBeenCalled();
      expect(request(method).method).toBe(method);
    },
  );
});
