// Tout audio demandé par un exercice doit exister dans le manifeste.
//
// Pourquoi ce test existe
// -----------------------
// La leçon u01-l1f a été livrée, atteignable, avec ses cinq fichiers audio
// servis en HTTP 200 par la page. Et pourtant aucun de ses exercices ne
// pouvait les jouer : le manifeste avait gardé les `assetId` de la leçon
// source, alors que le compilateur dérive la référence attendue de
// l'identifiant de la leçon d'ACCUEIL.
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

/**
 * Leçons dont l'audio n'a pas encore été produit, et pourquoi.
 *
 * Ce n'est PAS une tolérance de complaisance : ces leçons ont des exercices
 * d'écoute muets, ce qui est un vrai défaut visible par l'apprenant. Elles
 * sont listées ici pour que le fait soit écrit et compté, plutôt que caché
 * par une assertion relâchée.
 *
 * La production de ces enregistrements engage une dépense chez un
 * fournisseur de synthèse vocale, qui exige l'accord explicite du fondateur
 * au moment de l'appel. Tant que cet accord n'est pas donné, la leçon reste
 * en dette, et cette liste doit RÉTRÉCIR, jamais grandir.
 */
const AUDIO_EN_ATTENTE: Readonly<Record<string, string>> = {
  "u01-l1b":
    "aucun enregistrement produit : seules 1A et 1D ont un audio réel, " +
    "les 4 exercices d'écoute de 1B sont donc muets. Attend l'accord de " +
    "dépense pour la synthèse vocale.",
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
        // Dette assumée : on exige tout de même un échec, et que son SEUL
        // motif soit l'audio manquant. Toute autre invalidité reste
        // bloquante, et une leçon qui guérirait ferait échouer ce test pour
        // qu'on la retire de la liste.
        await expect(executer()).rejects.toThrow(/Audio inconnu/u);
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
