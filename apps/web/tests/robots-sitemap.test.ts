import { describe, expect, it, vi } from "vitest";

const FERME = {
  ready: false,
  publicIndexing: false,
  syncMode: "disabled" as const,
  publicOrigin: new URL("https://thainaute.example/"),
};
const OUVERT = {
  ready: true,
  publicIndexing: true,
  syncMode: "supabase" as const,
  publicOrigin: new URL("https://thainaute.example/"),
};

// `vi.hoisted` s'exécute AVANT les constantes du module : l'état initial
// doit donc être construit à l'intérieur.
const diagnostic = vi.hoisted(() => ({
  valeur: {
    ready: false,
    publicIndexing: false,
    syncMode: "disabled",
    publicOrigin: new URL("https://thainaute.example/"),
  } as unknown,
}));
vi.mock("@/lib/server/runtime-config", () => ({
  diagnoseRuntime: () => diagnostic.valeur,
}));

const { default: robots } = await import("../app/robots");
const { default: sitemap } = await import("../app/sitemap");

describe("robots et sitemap", () => {
  it("interdit tout tant que le site n'est pas indexable", () => {
    diagnostic.valeur = FERME;

    expect(robots()).toStrictEqual({
      rules: [{ userAgent: "*", disallow: "/" }],
    });
    // Annoncer des URL qu'on demande par ailleurs de ne pas indexer serait
    // se contredire.
    expect(sitemap()).toStrictEqual([]);
  });

  it("reste fermé si la synchronisation l'est, même indexation ouverte", () => {
    diagnostic.valeur = { ...OUVERT, syncMode: "disabled" };

    expect(robots().rules).toStrictEqual([{ userAgent: "*", disallow: "/" }]);
    expect(sitemap()).toStrictEqual([]);
  });

  it("ouvre le site sans jamais exposer compte, studio ni API", () => {
    diagnostic.valeur = OUVERT;

    const rules = robots().rules;
    const regle = Array.isArray(rules) ? rules[0] : rules;
    expect(regle?.allow).toBe("/");
    expect(regle?.disallow).toStrictEqual([
      "/account",
      "/studio",
      "/learn/",
      "/api/",
    ]);
    expect(robots().sitemap).toBe("https://thainaute.example/sitemap.xml");
  });

  it("ne liste que des pages réellement publiques", () => {
    diagnostic.valeur = OUVERT;

    const urls = sitemap().map(({ url }) => url);
    expect(urls).toContain("https://thainaute.example/");
    expect(urls).toContain("https://thainaute.example/confidentialite");
    // Aucune leçon n'est publiée : en annoncer une serait mentir.
    expect(urls.some((url) => url.includes("/learn/"))).toBe(false);
  });
});
