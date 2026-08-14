// Tout audio demandé par un exercice doit exister dans le manifeste.
//
// Pourquoi ce test existe
// -----------------------
// La leçon u01-l1f avait été livrée, atteignable, avec cinq fichiers audio
// servis en HTTP 200 par la page. Et pourtant aucun de ses exercices ne
// pouvait les jouer : le manifeste avait gardé des chemins de la leçon source,
// alors que le compilateur dérive la référence attendue de l'identifiant de la
// leçon d'accueil. Le manifeste a été vidé puis régénéré avec des audios
// propres à 1F.
//
// Le défaut était invisible aux deux vérifications faites à l'époque : les
// fichiers existaient bien, et la page les listait bien. Seul le maillon
// exercice -> manifeste était rompu, et le lecteur, qui préfère se taire
// plutôt que jouer un son faux, restait simplement muet.
//
// Une vérification par URL ne prouve donc pas la résolution. Ce test la
// prouve, pour toutes les leçons compilées à la fois.

import { describe, expect, it } from "vitest";

import {
  compiledLessonIds,
  readCompiledLessonBundle,
  validateBundle,
} from "../src/repository";
import { getPublicationBlockers } from "../src/audit";

/**
 * Dette audio explicite, le cas échéant, et pourquoi.
 *
 * Ce n'est PAS une tolérance de complaisance : ces leçons ont des exercices
 * d'écoute muets, ce qui est un vrai défaut visible par l'apprenant. Elles
 * sont listées ici pour que le fait soit écrit et compté, plutôt que caché
 * par une assertion relâchée.
 *
 * Toute dette ajoutée ici doit être accompagnée d'une raison et faire
 * échouer la validation audio de la leçon concernée.
 */
const AUDIO_EN_ATTENTE: Readonly<Record<string, string>> = {
  "u02-l2b":
    "L'extraction a récupéré son exercice d'écoute le 13 août ; sa voix " +
    "n'est pas produite. La leçon est un brouillon interne, et sa porte " +
    "AUDIO_ASSET_MISSING la bloque. Le chiffrage de la production est dans " +
    "docs/qa/chiffrage-audio-2026-08-13.md, en attente d'un budget.",
  "u10-l10a":
    "Ses douze exercices d'écoute étaient écrits en notation « réponse, " +
    "contre distracteurs », que l'extraction ne lisait pas. Elle la lit " +
    "depuis le 14 août, la leçon passe de 8 à 20 exercices, et les douze " +
    "voix ne sont pas produites. Brouillon interne que AUDIO_ASSET_MISSING " +
    "bloque.",
  "u02-l2c":
    "Ses items ขอบคุณครับ et ขอบคุณค่ะ notaient leur IPA « /A/ + /B/ », que " +
    "le compilateur refuse : la leçon perdait quatre items et deux blocs, dont " +
    "son exercice d'écoute. La notation est unifiée depuis le 14 août sur la " +
    "forme qui compile, une seule IPA à syllabes séparées par un point. La " +
    "voix féminine sur ขอโทษค่ะ n'est pas produite. Brouillon interne que " +
    "AUDIO_ASSET_MISSING bloque.",
  "u03-l3c":
    "Ses six exercices d'écoute étaient écrits et invisibles : l'étiquette " +
    "de leur champ Options se repliait avant son deux-points, et le champ " +
    "n'était donc pas reconnu. Le repli est lu depuis le 13 août, la leçon " +
    "passe de 3 à 9 exercices, et les six voix ne sont pas produites. " +
    "Brouillon interne que AUDIO_ASSET_MISSING bloque.",
  "u01-l1e":
    "Son exercice d'écoute était écrit depuis le 3 août et refusé par le " +
    "compilateur, faute d'un item déclarant la réplique entière " +
    "แล้วเจอกันครับ. L'item composé a été ajouté le 13 août, l'exercice " +
    "existe donc enfin, et il demande une voix MASCULINE qui n'est pas " +
    "produite. La leçon reste un brouillon interne que AUDIO_ASSET_MISSING " +
    "bloque. C'est un progrès, pas une régression : la leçon annonçait " +
    "déjà une compréhension à l'écoute qu'aucun exercice ne mesurait, et " +
    "ce manque était alors totalement invisible.",
};

describe("audio des leçons compilées", () => {
  const identifiants = compiledLessonIds();

  it("expose au moins une leçon", () => {
    expect(identifiants.length).toBeGreaterThan(0);
  });

  it.each(identifiants)(
    "%s : chaque exercice résout son audio dans le manifeste",
    (identifiant) => {
      const bundle = readCompiledLessonBundle(identifiant);
      expect(bundle).not.toBeNull();

      const disponibles = new Set(
        bundle!.audioManifest.entries.map((entree) => entree.assetId),
      );
      const introuvables = bundle!.lesson.exercises
        .map((exercice) =>
          "audioAssetId" in exercice ? exercice.audioAssetId : null,
        )
        .filter(
          (assetId): assetId is string =>
            typeof assetId === "string" && !disponibles.has(assetId),
        );

      const dette = AUDIO_EN_ATTENTE[identifiant];
      if (dette !== undefined) {
        // La leçon est en dette d'enregistrement. On vérifie alors que le
        // manifeste est bien VIDE : une dette partielle, où certains audios
        // existent et d'autres non, serait un défaut différent et non
        // couvert par cette dispense.
        expect(
          disponibles.size,
          `${identifiant} est listée en dette d'audio (${dette}) mais son manifeste n'est pas vide : la dispense ne s'applique plus`,
        ).toBe(0);
        return;
      }

      // Le message porte les identifiants : sans eux, l'échec ne dirait pas
      // quel exercice est muet.
      expect(
        introuvables,
        `${identifiant} : ${introuvables.length} audio demandés par un exercice sont absents du manifeste`,
      ).toEqual([]);
    },
  );

  it.each(identifiants)(
    "%s : le paquet livré passe la validation croisée complète",
    async (identifiant) => {
      // LA PORTE QUI MANQUAIT. Le compilateur valide volontairement contre un
      // manifeste VIDE et tolère « en attente de N fichiers audio », parce
      // que l'audio se produit après la compilation. Personne ne revalidait
      // ensuite, une fois le manifeste réellement écrit.
      //
      // C'est ce trou qui a laissé u01-l1f être livrée avec cinq exercices
      // muets : son paquet échouait `validateBundle`, et rien ne le lisait.
      //
      // `validateBundle` est ASYNCHRONE : il relit les fichiers audio sur
      // disque pour recontrôler leur sha256. Une première version de ce test
      // l'appelait sans attendre, et passait donc à vide, ce qui reproduisait
      // exactement le défaut qu'il devait fermer. Le `await` n'est pas
      // cosmétique, il est toute la valeur du test.
      const executer = () =>
        validateBundle(readCompiledLessonBundle(identifiant)!);

      if (AUDIO_EN_ATTENTE[identifiant] !== undefined) {
        // Dette assumée. `validateBundle` la TOLÈRE, et c'est voulu depuis
        // l'ADR-0040 : l'audio se produit après la compilation, donc un
        // manifeste vide n'est pas une invalidité de paquet.
        //
        // Ce qui doit tenir, c'est la porte de PUBLICATION. On l'exige donc
        // explicitement : une leçon en dette d'audio ne doit pas pouvoir
        // être publiée, et une leçon qui guérirait ferait échouer ce test
        // pour qu'on la retire de la liste.
        await expect(executer()).resolves.not.toThrow();
        const codes = getPublicationBlockers(
          readCompiledLessonBundle(identifiant)!,
        ).map(({ code }) => code);
        expect(
          codes,
          `${identifiant} est listée en dette d'audio mais rien ne l'empêche d'être publiée`,
        ).toContain("AUDIO_ASSET_MISSING");
        return;
      }

      await expect(executer()).resolves.not.toThrow();
    },
  );

  it("ne dispense d'audio que des leçons réellement compilées", () => {
    // Une dispense qui survit à la leçon qu'elle couvrait deviendrait un
    // trou permanent dans la porte.
    const orphelines = Object.keys(AUDIO_EN_ATTENTE).filter(
      (id) => !identifiants.includes(id),
    );
    expect(orphelines).toEqual([]);
  });

  it.each(identifiants)(
    "%s : chaque entrée du manifeste est rattachée à un item de la leçon",
    (identifiant) => {
      const bundle = readCompiledLessonBundle(identifiant);
      const items = new Set(bundle!.lesson.items.map((item) => item.id));
      const orphelines = bundle!.audioManifest.entries
        .filter((entree) => !items.has(entree.itemId))
        .map((entree) => entree.assetId);

      expect(
        orphelines,
        `${identifiant} : ${orphelines.length} entrées audio ne désignent aucun item de la leçon`,
      ).toEqual([]);
    },
  );
});
