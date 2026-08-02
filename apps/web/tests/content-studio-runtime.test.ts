import { Buffer } from "node:buffer";

import { describe, expect, it } from "vitest";

import { readContentStudioConfiguration } from "../lib/server/content-studio/runtime";

const VALID_ENVIRONMENT = {
  THAINAUTE_STUDIO_MODE: "fixture",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co/",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example_public_value",
} as const;

function legacyJwtKey(role: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString(
    "base64url",
  );
  const payload = Buffer.from(JSON.stringify({ role })).toString("base64url");
  return `${header}.${payload}.test-signature`;
}

describe("configuration du Studio de contenu", () => {
  it("reste masqué par défaut et en mode disabled", () => {
    expect(readContentStudioConfiguration({})).toBeNull();
    expect(
      readContentStudioConfiguration({
        ...VALID_ENVIRONMENT,
        THAINAUTE_STUDIO_MODE: "disabled",
      }),
    ).toBeNull();
  });

  it("active uniquement le mode fixture avec l'URL et la clé publique", () => {
    expect(readContentStudioConfiguration(VALID_ENVIRONMENT)).toEqual({
      mode: "fixture",
      url: "https://project.supabase.co",
      publishableKey: "sb_publishable_example_public_value",
    });
  });

  it("ferme les configurations incomplètes, inconnues ou secrètes", () => {
    expect(
      readContentStudioConfiguration({
        THAINAUTE_STUDIO_MODE: "fixture",
      }),
    ).toBeNull();
    expect(
      readContentStudioConfiguration({
        ...VALID_ENVIRONMENT,
        THAINAUTE_STUDIO_MODE: "production",
      }),
    ).toBeNull();
    expect(
      readContentStudioConfiguration({
        ...VALID_ENVIRONMENT,
        NEXT_PUBLIC_SUPABASE_URL: "http://project.example/",
      }),
    ).toBeNull();
    expect(
      readContentStudioConfiguration({
        ...VALID_ENVIRONMENT,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          "sb_secret_never_accepted_by_studio",
      }),
    ).toBeNull();
  });

  it("accepte HTTP uniquement sur la boucle locale", () => {
    expect(
      readContentStudioConfiguration({
        ...VALID_ENVIRONMENT,
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321/",
      }),
    ).toMatchObject({ url: "http://127.0.0.1:54321" });
  });

  it("accepte l'ancienne clé anon mais refuse un JWT service_role", () => {
    expect(
      readContentStudioConfiguration({
        ...VALID_ENVIRONMENT,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: legacyJwtKey("anon"),
      }),
    ).toMatchObject({ publishableKey: legacyJwtKey("anon") });
    expect(
      readContentStudioConfiguration({
        ...VALID_ENVIRONMENT,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: legacyJwtKey("service_role"),
      }),
    ).toBeNull();
  });
});
