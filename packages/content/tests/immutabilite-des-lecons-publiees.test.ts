import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { authoringCatalog, readCompiledLessonBundle } from "../src";
import { compilerLeconComplete } from "../scripts/compile-lesson";

/**
 * Une leçon publiée ne bouge plus. Jamais.
 *
 * POURQUOI CE TEST EXISTE
 * -----------------------
 * `AGENTS.md` pose que le contenu publié est immuable et qu'une correction
 * crée une nouvelle version. Rien ne le vérifiait. `compile-text-lessons`
 * n'écrit que les paquets ABSENTS (`!existsSync`), ce qui protège le fichier
 * sur disque mais ne protège pas le SENS : améliorer l'extracteur pouvait
 * rendre la source et le paquet publié discordants sans qu'aucune commande
 * échoue. Un apprenant aurait alors une progression accrochée à des
 * identifiants que plus personne ne sait reproduire.
 *
 * Le test recompile chaque leçon publiée depuis son markdown d'autorat et
 * exige l'égalité stricte avec le paquet versionné.
 *
 * CE QU'IL FAUT FAIRE QUAND IL ÉCHOUE
 * -----------------------------------
 * Ne pas mettre à jour le paquet publié. Produire une nouvelle version de la
 * leçon, ou restreindre le changement d'extracteur aux formulations que le
 * corpus publié n'emploie pas. Les brouillons, eux, ont le droit de changer
 * et ne sont pas couverts ici : c'est précisément là que les 212 blocs
 * refusés doivent être récupérés.
 */

const RACINE = join(import.meta.dirname, "..", "..", "..");

function cheminAutorat(lessonId: string): string {
  const entree = authoringCatalog.find((e) => e.lessonId === lessonId);
  if (entree === undefined) {
    throw new Error(`Leçon ${lessonId} absente du catalogue d'autorat.`);
  }
  // Le catalogue ne porte pas le chemin source ; il porte de quoi le
  // reconstruire. Le répertoire garde son zéro de tête, pas le fichier :
  // `unite-01/lecon-1a.md`, `unite-10/lecon-10a.md`.
  const repertoire = `unite-${String(entree.unitNumber).padStart(2, "0")}`;
  const fichier = `lecon-${entree.unitNumber}${entree.lessonLetter}.md`;
  return join(RACINE, "content", "authoring", repertoire, fichier);
}

const PUBLIEES = authoringCatalog
  .map(({ lessonId }) => lessonId)
  .filter((lessonId) => {
    const bundle = readCompiledLessonBundle(lessonId);
    return (
      bundle !== null &&
      bundle.lesson.workflowStatus === "published" &&
      bundle.lesson.visibility === "public"
    );
  });

describe("immutabilité des leçons publiées", () => {
  it("en couvre au moins une, sinon le test ne prouve rien", () => {
    expect(PUBLIEES.length).toBeGreaterThan(0);
  });

  it.each(PUBLIEES)(
    "%s se recompile à l'identique depuis son markdown d'autorat",
    (lessonId) => {
      const versionne = JSON.parse(
        readFileSync(
          join(
            RACINE,
            "packages",
            "content",
            "data",
            "lessons",
            `${lessonId}.v1.json`,
          ),
          "utf8",
        ),
      ) as Record<string, unknown>;
      const recompile = compilerLeconComplete(cheminAutorat(lessonId))
        .lesson as unknown as Record<string, unknown>;

      // Les quatre champs que l'extraction produit. Le reste du paquet est
      // de la métadonnée d'identité, déjà verrouillée par les UUID canoniques.
      for (const cle of ["items", "exercises", "teaching", "pools"]) {
        expect(recompile[cle], `${lessonId}.${cle}`).toStrictEqual(
          versionne[cle],
        );
      }
    },
  );
});
