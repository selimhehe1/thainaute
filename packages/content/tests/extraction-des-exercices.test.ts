import { describe, expect, it } from "vitest";

import { extraireBloc } from "../../../scripts/content/lib/extraire-exercices.mjs";

/**
 * Les notations d'autorat que l'extraction doit savoir lire.
 *
 * POURQUOI CE FICHIER EXISTE
 * --------------------------
 * L'extraction refusait 212 blocs d'exercice sur 308, soit les deux tiers du
 * travail pédagogique écrit, et 28 leçons se retrouvaient sous cinq
 * exercices. Les causes n'étaient pas du contenu manquant : c'étaient des
 * formulations parfaitement claires pour un lecteur humain que les motifs
 * réguliers ne couvraient pas.
 *
 * Chaque cas ci-dessous est repris d'une leçon réelle du corpus. Un test qui
 * inventerait sa propre notation ne prouverait rien : il verrouillerait une
 * grammaire que personne n'écrit.
 */

const resoudre = (graphie: string) => `item-${graphie}`;

function bloc(corps: string) {
  return {
    ordre: 1,
    titre: "Exercice 1 : essai",
    mecanique: "listening",
    corps,
  };
}

/** Le bloc extrait, ou une erreur qui NOMME le refus au lieu de le taire. */
function ecoute(corps: string) {
  const extrait = extraireBloc(bloc(corps), resoudre);
  if (!extrait.ok) throw new Error(`bloc refusé : ${extrait.motif}`);
  if (extrait.type !== "audio_choice") {
    throw new Error(`type inattendu : ${extrait.type}`);
  }
  return extrait;
}

function refus(corps: string) {
  const extrait = extraireBloc(bloc(corps), resoudre);
  if (extrait.ok)
    throw new Error("bloc accepté alors qu'il devait être refusé");
  return extrait;
}

/** Le n-ième tirage, en base 1 comme le corpus les numérote. */
function tirage(corps: string, rang: number) {
  const trouve = ecoute(corps).tirages[rang - 1];
  if (trouve === undefined) throw new Error(`tirage ${rang} absent`);
  return trouve;
}

const FEEDBACK = `
- Feedback correct : « Oui. »
- Feedback incorrect : « Réécoutez. »
`;

describe("renvoi d'un tirage vers un jeu d'options déjà posé", () => {
  // Repris de u02-l2a, u03-l3a, u04-l4a : première cause de refus du corpus.
  const CORPS = `
- Mécanique : \`listening\`
- Consigne : « Écoutez, puis choisissez le mot entendu. »
- Tirages : 6 au total.
  1. Audio พา ; options ปา (paa, lancer) / พา (phaa, emmener) : réponse พา.
  2. Audio ปา ; mêmes options : réponse ปา.
  3. Audio ผ่า ; options ป่า (pàa, forêt) / ผ่า (phàa, fendre) : réponse ผ่า.
  4. Audio ป่า ; mêmes options : réponse ป่า.
  5. Audio พา ; options de la paire 1 : réponse พา.
  6. Audio ป่า ; options de la paire 2 : réponse ป่า.
${FEEDBACK}`;

  it("lit les six tirages au lieu de refuser le bloc", () => {
    expect(ecoute(CORPS).tirages).toHaveLength(6);
  });

  it("« mêmes options » reprend le jeu du tirage précédent", () => {
    expect(tirage(CORPS, 2).itemId).toBe("item-ปา");
    expect(tirage(CORPS, 2).indiceCorrect).toBe(0);
  });

  it("« la paire 2 » désigne le deuxième jeu DISTINCT, pas le deuxième tirage", () => {
    // Le tirage 6 renvoie à la paire ป่า / ผ่า, introduite au tirage 3.
    // S'il désignait le deuxième TIRAGE, le jeu serait ปา / พา et la
    // réponse ป่า n'y figurerait pas.
    expect(tirage(CORPS, 6).itemId).toBe("item-ป่า");
    expect(tirage(CORPS, 6).indiceCorrect).toBe(0);
  });

  it("refuse le bloc quand la réponse est absente du jeu visé", () => {
    // Le garde-fou de tout ce chemin. Une lecture fausse du renvoi doit
    // produire un refus, jamais un corrigé faux.
    const faux = CORPS.replace(
      "6. Audio ป่า ; options de la paire 2 : réponse ป่า.",
      "6. Audio ป่า ; options de la paire 1 : réponse ป่า.",
    );
    expect(refus(faux).motif).toMatch(/réponse absente du jeu/u);
  });
});

describe("options déclarées au niveau du bloc", () => {
  // Repris de u05-l5d : l'étiquette porte un qualificatif après virgule, que
  // `champ()` ne voit pas. Le bloc partait alors vers le chemin par tirage,
  // où ses tirages n'ont pas d'options puisqu'elles sont déclarées ici.
  const CORPS = `
- Mécanique : \`listening\`
- Consigne : « Quel moyen de transport ? »
- Options, identiques à tous les tirages, ordre aléatoire : un taxi / un bus /
  un bateau / un véhicule (le mot général).
- Tirages, quatre au total :
  1. Audio เรือ. Réponse : un bateau.
  2. Audio แท็กซี่. Réponse : un taxi.
  3. Audio รถเมล์. Réponse : un bus.
  4. Audio รถ. Réponse : un véhicule (le mot général). Ce tirage et le tirage 3
     partagent volontairement leur famille.
${FEEDBACK}`;

  it("lit une étiquette qualifiée par une virgule", () => {
    expect(ecoute(CORPS).libelles).toEqual([
      "un taxi",
      "un bus",
      "un bateau",
      "un véhicule (le mot général)",
    ]);
  });

  it("apparie une réponse suivie de prose d’intention", () => {
    expect(tirage(CORPS, 4).indiceCorrect).toBe(3);
  });

  it("lit une sous-liste à puces sans confondre les faces d’une option", () => {
    // Repris de u03-l3c : « 15 bahts / สิบห้าบาท / sìp·hâa bàat » est UNE
    // option montrée de trois façons. La découper sur la barre oblique en
    // inventerait quatre là où la leçon en pose deux. Le libellé retenu est
    // la première face, celle que la réponse cite.
    const puces = `
- Mécanique : \`listening\`
- Consigne : « Quel prix ? »
- Options, affichées en chiffres et en thaï :
  - 15 bahts / สิบห้าบาท / sìp·hâa bàat
  - 50 bahts / ห้าสิบบาท / hâa·sìp bàat
- Tirages :
  1. Audio ห้าสิบบาท : réponse 50 bahts.
${FEEDBACK}`;
    const extrait = ecoute(puces);
    expect(extrait.libelles).toEqual(["15 bahts", "50 bahts"]);
    expect(tirage(puces, 1).indiceCorrect).toBe(1);
  });

  it("lit des options numérotées et leur réponse, sans champ Tirages", () => {
    // Repris de u01-l1e et de l'unité 2 : les lignes numérotées sont les
    // OPTIONS, pas des tirages. `lignesTirage` les prenait pour des tirages
    // et cherchait ensuite des options à l'intérieur d'une option.
    const numerotees = `
- Mécanique : \`listening\`
- Audio : réplique 4 du dialogue, « ค่า », jouée seule.
- Consigne : « Qui parle ? »
- Options :
  1. Un homme
  2. Une femme
  3. Impossible à savoir
- Réponse correcte : 2 (Une femme)
${FEEDBACK}`;
    const extrait = ecoute(numerotees);
    expect(extrait.libelles).toEqual([
      "Un homme",
      "Une femme",
      "Impossible à savoir",
    ]);
    expect(extrait.tirages).toHaveLength(1);
    expect(tirage(numerotees, 1).indiceCorrect).toBe(1);
    expect(tirage(numerotees, 1).itemId).toBe("item-ค่า");
  });

  it("refuse un bloc à question unique dont l’audio ne cite aucune graphie", () => {
    // Sans graphie, aucune carte n'est créditable. Rattacher au hasard
    // serait pire qu'un refus.
    const sansGraphie = `
- Mécanique : \`listening\`
- Audio : réplique 4 du dialogue, jouée seule.
- Consigne : « Qui parle ? »
- Options :
  1. Un homme
  2. Une femme
- Réponse correcte : 2 (Une femme)
${FEEDBACK}`;
    expect(refus(sansGraphie).motif).toMatch(/aucune graphie thaïe/u);
  });
});

describe("consigne et feedback écrits en sous-puce", () => {
  // Repris de u04-l4c : un exercice en plusieurs manches indente ses
  // étiquettes, ou les préfixe par « Manche 1, ». Elles ne commencent alors
  // plus par « Consigne » ni par « Feedback », et `champsPrefixes` ne les
  // voit pas.
  const CORPS = `
- Mécanique : \`listening\`
- Manche 1, consigne : « Reliez chaque mot à ce qu’il désigne. »
- Options : « un riz sauté », « une eau plate »
- Tirages :
  1. Audio ข้าวผัด : réponse « un riz sauté ».
- Manche 1, feedback correct : « Oui, c’est bien le plat. »
- Manche 1, feedback incorrect : « Réécoutez le premier mot. »
`;

  it("retrouve la consigne et les deux retours", () => {
    const extrait = ecoute(CORPS);
    expect(extrait.consigne).toBe("Reliez chaque mot à ce qu’il désigne.");
    expect(extrait.feedback.correctFr).toBe("Oui, c’est bien le plat.");
    expect(extrait.feedback.incorrectFr).toBe("Réécoutez le premier mot.");
  });
});
