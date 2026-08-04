import { describe, expect, it } from "vitest";

import { assertAucuneFabrication, graphiesFabriquees } from "../src";

// Extraits réels de la leçon 1A, pour que le test porte sur le corpus et
// non sur un exemple de laboratoire.
const SOURCE = `
#### Item 2 : ข่า

- thai : ข่า
- ipa : /kʰaː˨˩/
- fr : galanga (rhizome parfumé de la cuisine thaïe)

### Exercice 1 : quel ton entendez-vous ?

- Tirages et réponses :
  1. Audio คา : réponse « moyen ».
  2. Audio ข่า : réponse « bas ».
  5. Audio ขา : réponse « montant ».
`;

describe("porte anti-fabrication", () => {
  it("laisse passer une sortie entièrement tirée de la source", () => {
    const sortie = {
      promptFr: "Quel ton entendez-vous ?",
      options: [
        { id: "a", thaiRaw: "คา", labelFr: null },
        { id: "b", thaiRaw: "ข่า", labelFr: null },
        { id: "c", thaiRaw: "ขา", labelFr: null },
      ],
    };
    expect(graphiesFabriquees(sortie, SOURCE)).toEqual([]);
  });

  it("attrape une graphie inventée, même plausible", () => {
    // ค้า est un mot thaï parfaitement valide, de la même série tonale, mais
    // il n'apparaît PAS dans cet extrait. Une assistance qui « complèterait »
    // la série produirait exactement cela, et un francophone ne verrait rien.
    const sortie = {
      options: [
        { id: "a", thaiRaw: "คา" },
        { id: "b", thaiRaw: "ค้า" },
      ],
    };
    const fautives = graphiesFabriquees(sortie, SOURCE);
    expect(fautives).toHaveLength(1);
    expect(fautives[0]?.valeur).toBe("ค้า");
    expect(fautives[0]?.chemin).toBe("options[1].thaiRaw");
  });

  it("descend dans les structures imbriquées et nomme le chemin", () => {
    const sortie = {
      exercises: [
        { feedback: { variants: [{ textFr: "Réécoutez ผิด, pas ข่า." }] } },
      ],
    };
    const fautives = graphiesFabriquees(sortie, SOURCE);
    expect(fautives).toHaveLength(1);
    expect(fautives[0]?.valeur).toBe("ผิด");
    expect(fautives[0]?.chemin).toBe(
      "exercises[0].feedback.variants[0].textFr",
    );
  });

  it("compare en NFC, pour ne pas signaler une fausse fabrication", () => {
    // Même graphie, marque de ton saisie avant la voyelle souscrite : NFC
    // les réordonne. Sans normalisation des deux côtés, la porte crierait
    // à la fabrication sur une graphie pourtant identique.
    // Construite par points de code, et non écrite en clair : un éditeur ou
    // un formateur normaliserait la chaîne du fichier, et le test passerait
    // alors pour de mauvaises raisons.
    // ก + mai ek (classe 107) + sara u (classe 103) : NFC réordonne.
    const malOrdonne = String.fromCodePoint(0x0e01, 0x0e48, 0x0e38);
    expect(malOrdonne).not.toEqual(malOrdonne.normalize("NFC"));
    const source = `- thai : ${malOrdonne.normalize("NFC")}`;
    expect(graphiesFabriquees({ thaiRaw: malOrdonne }, source)).toEqual([]);
  });

  it("ignore le français, le latin et la ponctuation", () => {
    const sortie = {
      promptFr: "Écoutez le mot, puis choisissez la carte.",
      transcription: "khàa",
      note: "Voir https://en.wiktionary.org/wiki/xyz (consulté).",
    };
    expect(graphiesFabriquees(sortie, SOURCE)).toEqual([]);
  });

  it("lève et nomme la graphie quand la chaîne doit s'arrêter", () => {
    expect(() => assertAucuneFabrication({ thaiRaw: "ค้า" }, SOURCE)).toThrow(
      /Graphie absente du texte source.*ค้า/u,
    );
  });

  it("accepte une graphie présente ailleurs dans la source", () => {
    // La porte vérifie la PRÉSENCE, pas la position : placer une graphie au
    // mauvais endroit est une autre faute, que d'autres contrôles attrapent.
    expect(
      graphiesFabriquees({ options: [{ thaiRaw: "ข่า" }] }, SOURCE),
    ).toEqual([]);
  });
});
