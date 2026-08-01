import { describe, expect, it } from "vitest";

import { healthJson } from "../lib/server/health";
import { diagnoseRuntime, publicRelease } from "../lib/server/runtime-config";
import { createSiteMetadata } from "../lib/server/site-metadata";

describe("configuration et sondes de santé", () => {
  it("reste prête localement avec la synchronisation désactivée", () => {
    expect(diagnoseRuntime({})).toMatchObject({
      ready: true,
      publicOrigin: "http://localhost:3000",
      publicIndexing: false,
      release: "development",
      syncMode: "disabled",
    });
  });

  it("refuse d'activer l'indexation sur une origine non HTTPS", () => {
    const diagnostic = diagnoseRuntime({
      THAINAUTE_PUBLIC_INDEXING: "enabled",
      THAINAUTE_PUBLIC_URL: "http://localhost:3000/",
    });

    expect(diagnostic.ready).toBe(false);
    expect(diagnostic.issues).toContain("public_indexing_invalid");
  });

  it("exige les trois valeurs Supabase en mode synchronisé", () => {
    const diagnostic = diagnoseRuntime({ THAINAUTE_SYNC_MODE: "supabase" });

    expect(diagnostic.ready).toBe(false);
    expect(diagnostic.issues).toContain("supabase_config_missing");
  });

  it("refuse un secret public ou une URL HTTP distante pour Supabase", () => {
    const sharedKey = "sb_secret_never_publish_this_value";
    const diagnostic = diagnoseRuntime({
      THAINAUTE_SYNC_MODE: "supabase",
      NEXT_PUBLIC_SUPABASE_URL: "http://project.example/",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: sharedKey,
      SUPABASE_SECRET_KEY: sharedKey,
    });

    expect(diagnostic.ready).toBe(false);
    expect(diagnostic.issues).toContain("supabase_config_missing");
  });

  it("ne publie jamais un identifiant de release invalide", () => {
    expect(publicRelease({ THAINAUTE_RELEASE: "secret value" })).toBe(
      "invalid",
    );
  });

  it("désactive le cache et le sniffing sur les réponses de santé", () => {
    const response = healthJson({ status: "ok" });

    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("www-authenticate")).toBeNull();
  });

  it("ajoute le challenge Bearer à toute réponse de santé 401", () => {
    const response = healthJson({ status: "unauthorized" }, 401);

    expect(response.headers.get("www-authenticate")).toBe("Bearer");
  });

  it("garde l'indexation fermée par défaut et sur une configuration incomplète", () => {
    expect(createSiteMetadata({}).robots).toEqual({
      index: false,
      follow: false,
    });
    expect(
      createSiteMetadata({
        THAINAUTE_PUBLIC_INDEXING: "enabled",
        THAINAUTE_PUBLIC_URL: "https://preview.example/",
        THAINAUTE_SYNC_MODE: "supabase",
      }).robots,
    ).toEqual({ index: false, follow: false });
  });

  it("n'autorise l'indexation que sur une origine HTTPS prête", () => {
    const metadata = createSiteMetadata({
      THAINAUTE_PUBLIC_INDEXING: "enabled",
      THAINAUTE_PUBLIC_URL: "https://thainaute.example/",
      THAINAUTE_RELEASE: "production",
      THAINAUTE_SYNC_MODE: "supabase",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        "sb_publishable_example_public_value",
      SUPABASE_SECRET_KEY: "sb_secret_example_server_value",
    });

    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(new URL(String(metadata.metadataBase)).origin).toBe(
      "https://thainaute.example",
    );
  });
});
