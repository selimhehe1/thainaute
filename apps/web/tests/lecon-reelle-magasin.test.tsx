// Les leçons RÉELLES du curriculum journalisent-elles au bon endroit ?
//
// Pourquoi ce test existe
// -----------------------
// Le lecteur Expédition sert deux usages : la démonstration technique de
// `/learn/demo`, et les vraies leçons de `/learn/lecon/[lecon]`. Il ouvrait
// dans les deux cas la base IndexedDB `thainaute-demo-v1`.
//
// Or la synchronisation de compte ne relève que `thainaute-learning-v1`, et
// la base de démonstration est délibérément mise en quarantaine au moment de
// la fusion du profil anonyme. Toute la progression du cours réel était donc
// écrite dans un endroit dont personne ne la relèverait jamais : l'apprenant
// travaillait, voyait sa réussite, et perdait tout à la création du compte.
//
// Le défaut était invisible à l'écran, parce que la lecture locale, elle,
// fonctionnait parfaitement. Seule la destination était fausse. Ce test
// regarde donc la destination, pas le rendu.

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/** Chemin d'un fichier source de l'application, depuis la racine du paquet. */
const lire = (relatif: string): Promise<string> =>
  readFile(join(process.cwd(), relatif), "utf8");

describe("destination des tentatives", () => {
  it("la route de leçon réelle déclare la base d'apprentissage", async () => {
    // On lit la déclaration à la source plutôt que de monter tout le lecteur :
    // c'est la page qui décide, et c'est donc sa décision qu'il faut geler.
    const source = await lire("app/learn/lecon/[lecon]/page.tsx");

    expect(
      source,
      'la route de leçon réelle doit déclarer attemptStorage="learning", sinon la progression du cours part dans la base de démonstration mise en quarantaine',
    ).toContain('attemptStorage="learning"');
  });

  it("la démonstration ne réclame pas la base d'apprentissage", async () => {
    // La page de démonstration doit rester sur la base de démonstration :
    // sinon ses tentatives sur une fixture pollueraient la progression réelle.
    const source = await lire("app/learn/demo/page.tsx");

    expect(source).not.toContain('attemptStorage="learning"');
  });

  it("le lecteur n'écrit dans aucune base codée en dur", async () => {
    const source = await lire("app/learn/demo/expedition-experience.tsx");

    // Le défaut à empêcher est précis : un magasin ouvert sur une base
    // imposée, que l'appelant ne peut plus choisir. C'était exactement la
    // ligne d'origine, `new WebAttemptOutboxStore("thainaute-demo-v1")`.
    expect(
      /new WebAttemptOutboxStore\(\s*"thainaute-(demo|learning)-v1"/u.test(
        source,
      ),
      "le lecteur ne doit pas imposer une base : c'est à l'appelant de déclarer s'il rend une leçon réelle ou une démonstration",
    ).toBe(false);

    // Et la branche pilotée par la prop doit bien exister.
    expect(source).toMatch(/attemptStorage === "learning"/u);
  });

  it("la page de progrès lit la base où les vraies leçons écrivent", async () => {
    // Le défaut avait survécu à sa moitié : la DESTINATION des tentatives
    // était gelée par les tests ci-dessus, leur LECTURE ne l'était pas. La
    // page de progrès projetait la fixture depuis `thainaute-demo-v1`, si
    // bien que terminer une vraie leçon n'apparaissait nulle part.
    const source = await lire("app/progress/page.tsx");

    expect(
      source,
      "la page de progrès doit lire thainaute-learning-v1, sinon la progression des cours réels reste invisible",
    ).toContain('storageKey="thainaute-learning-v1"');
    expect(
      source,
      "elle doit projeter les leçons publiées, pas la fixture technique",
    ).toContain("paquetsPublies");
  });
});
