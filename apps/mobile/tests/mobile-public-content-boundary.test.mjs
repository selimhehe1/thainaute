import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const mobileRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const routeRoot = join(mobileRoot, "app");
const lessonsRoot = join(
  mobileRoot,
  "..",
  "..",
  "packages",
  "content",
  "data",
  "lessons",
);

/**
 * La frontière que les routes Expo ne franchissent pas.
 *
 * CE QUI A CHANGÉ : la liste interdisait toute référence au contenu, parce
 * que tout le contenu U01 était en brouillon quand l'ADR-0041 a été prise.
 * Cinq de ces leçons sont désormais signées et publiées, et leur raison
 * d'être est justement d'être distribuées.
 *
 * L'invariant n'a jamais été « aucun contenu dans les routes », c'était
 * « aucun BROUILLON dans un binaire ». Un écran marqué interne ne protège
 * rien : le contenu reste extractible d'un APK ou d'un IPA. C'est donc le
 * statut de publication qui décide, ici comme dans
 * `scripts/check-public-export.mjs`.
 */
const brouillonsDuCorpus = readdirSync(lessonsRoot)
  .filter((fichier) => fichier.endsWith(".v1.json"))
  .map((fichier) => ({
    cle: fichier.replace(/\.v1\.json$/u, ""),
    lesson: JSON.parse(readFileSync(join(lessonsRoot, fichier), "utf8")),
  }))
  .filter(
    ({ lesson }) =>
      lesson.workflowStatus !== "published" || lesson.visibility !== "public",
  );

function sourcesDesRoutes() {
  return readdirSync(routeRoot, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")),
    )
    .map((entry) => ({
      name: entry.name,
      source: readFileSync(join(routeRoot, entry.name), "utf8"),
    }));
}

describe("frontière publique du contenu mobile", () => {
  it("ne cite aucun identifiant ni titre de leçon en brouillon", () => {
    const routes = sourcesDesRoutes();

    for (const { cle, lesson } of brouillonsDuCorpus) {
      for (const marqueur of [cle, lesson.versionId, lesson.titleFr]) {
        if (typeof marqueur !== "string" || marqueur.length < 8) continue;
        expect(
          routes.filter(({ source }) => source.includes(marqueur)),
          `Un brouillon ne doit pas apparaître dans une route Expo: ${marqueur}`,
        ).toEqual([]);
      }
    }
  });

  it("garde un corpus où tout n’est pas publié, sinon ce test ne prouve rien", () => {
    // Le jour où tout serait publié, l'assertion ci-dessus passerait à vide.
    // Mieux vaut le savoir que croire qu'elle protège encore.
    expect(brouillonsDuCorpus.length).toBeGreaterThan(0);
  });

  it("enchaîne le contrôle du bundle après les deux exports publics", () => {
    const packageJson = JSON.parse(
      readFileSync(join(mobileRoot, "package.json"), "utf8"),
    );

    expect(packageJson.scripts?.build).toContain("pnpm run bundle:check");
    expect(packageJson.scripts?.["bundle:check"]).toBe(
      "node scripts/check-public-export.mjs dist/android dist/ios",
    );
  });
});
