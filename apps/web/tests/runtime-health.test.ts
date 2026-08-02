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
      studioMode: "disabled",
      syncMode: "disabled",
    });
  });

  it("exige Auth lorsque le studio fixture est activé", () => {
    const missing = diagnoseRuntime({
      THAINAUTE_STUDIO_MODE: "fixture",
    });
    expect(missing.ready).toBe(false);
    expect(missing.issues).toContain("studio_config_missing");

    const configured = diagnoseRuntime({
      THAINAUTE_STUDIO_MODE: "fixture",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        "sb_publishable_example_public_value",
      SUPABASE_SECRET_KEY: "sb_secret_example_server_value",
    });
    expect(configured).toMatchObject({
      ready: true,
      studioMode: "fixture",
      syncMode: "disabled",
    });

    const aggregateMissing = diagnoseRuntime({
      THAINAUTE_STUDIO_MODE: "fixture",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        "sb_publishable_example_public_value",
    });
    expect(aggregateMissing.issues).toContain("studio_report_config_missing");
  });

  it("refuse un mode studio inconnu", () => {
    const diagnostic = diagnoseRuntime({
      THAINAUTE_STUDIO_MODE: "public",
    });

    expect(diagnostic.ready).toBe(false);
    expect(diagnostic.studioMode).toBeNull();
    expect(diagnostic.issues).toContain("studio_mode_invalid");
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

  it("exige le pepper de reçu quand la synchronisation distante est active", () => {
    const diagnostic = diagnoseRuntime({
      THAINAUTE_SYNC_MODE: "supabase",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        "sb_publishable_example_public_value",
      SUPABASE_SECRET_KEY: "sb_secret_example_server_value",
    });

    expect(diagnostic.ready).toBe(false);
    expect(diagnostic.issues).toContain("account_deletion_config_missing");
  });

  it("exige une release active pour accepter les tentatives synchronisées", () => {
    const diagnostic = diagnoseRuntime({
      THAINAUTE_SYNC_MODE: "supabase",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        "sb_publishable_example_public_value",
      SUPABASE_SECRET_KEY: "sb_secret_example_server_value",
      ACCOUNT_DELETION_RECEIPT_PEPPER:
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    });

    expect(diagnostic.ready).toBe(false);
    expect(diagnostic.issues).toContain("sync_release_config_missing");
  });

  it("refuse un secret public ou une URL HTTP distante pour Supabase", () => {
    const sharedKey = "sb_secret_never_publish_this_value";
    const diagnostic = diagnoseRuntime({
      THAINAUTE_SYNC_MODE: "supabase",
      THAINAUTE_PUBLIC_CONTENT_RELEASE_ID:
        "30000000-0000-4000-8000-000000000001",
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
      THAINAUTE_PUBLIC_CONTENT_RELEASE_ID:
        "30000000-0000-4000-8000-000000000001",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        "sb_publishable_example_public_value",
      SUPABASE_SECRET_KEY: "sb_secret_example_server_value",
      ACCOUNT_DELETION_RECEIPT_PEPPER:
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    });

    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(new URL(String(metadata.metadataBase)).origin).toBe(
      "https://thainaute.example",
    );
  });
});
