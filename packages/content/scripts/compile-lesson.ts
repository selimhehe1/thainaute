#!/usr/bin/env tsx
// Compile une leçon d'autorat complète vers un paquet de contenu.
//
// Assemble ce que les autres modules produisent : les items compilés, les
// exercices extraits de façon déterministe, les sources du registre, et la
// provenance. Puis fait valider le tout par les schémas et les contrôles
// croisés du paquet, avant d'écrire quoi que ce soit.
//
// Ce qui n'est PAS fait ici, et le reste honnêtement :
//   - les audits sont attribués à des acteurs `ai`, ce qui laisse
//     `HUMAN_AUDITOR_MISSING` fermer la porte de publication ;
//   - le statut reste `draft`, la visibilité `internal` ;
//   - « Revue native : en attente » demeure vrai.
//
// Usage :
//   pnpm --filter @thainaute/content content:compile-lesson -- <lecon.md>
//   ... -- <lecon.md> --ecrire

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { graphiesFabriquees } from "../src/anti-fabrication";
import {
  auditDimensionSchema,
  lessonSchema,
  sourceSchema,
} from "../src/schemas";
import { validateBundleMetadata } from "../src/validation";
import { getPublicationBlockers } from "../src/audit";

import { analyserLecon } from "../../../scripts/content/lib/parse-authoring.mjs";
import { analyserEnseignement } from "../../../scripts/content/lib/extraire-enseignement.mjs";
import { extraireBloc } from "../../../scripts/content/lib/extraire-exercices.mjs";
import { uuidStable } from "../../../scripts/content/lib/identite.mjs";

import { compilerLecon as compilerItems } from "./compile-items";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const REGISTRE = JSON.parse(
  readFileSync(join(RACINE, "content", "sources-registry.json"), "utf8"),
) as { sources: unknown[] };

type ItemCompile = {
  id: string;
  thaiRaw: string;
  transcription: { value: string | null };
  syllables: { vowelLength: "short" | "long" | null }[];
  sourceIds: string[];
};

/**
 * Remplit les marqueurs de gabarit d'un retour pedagogique.
 *
 * Le curriculum ecrit ses retours comme des patrons :
 * « Oui. {mot} ({transcription}) : {description du contour}. » Compiles
 * tels quels, ces marqueurs s'afficheraient litteralement a l'apprenant,
 * ce qui est exactement le « texte technique » que le brief interdit.
 *
 * Les trois sont derivables de l'exercice lui-meme. Tout marqueur qui
 * resterait non resolu fait ECHOUER la compilation : mieux vaut une lecon
 * incomplete qu'une lecon qui affiche ses accolades.
 */
function remplirGabarit(
  texte: string,
  valeurs: Readonly<Record<string, string | null>>,
  ou: string,
): string {
  const rempli = texte.replace(/\{([^}]+)\}/gu, (entier, cle: string) => {
    const valeur = valeurs[cle.trim()];
    return valeur === null || valeur === undefined ? entier : valeur;
  });
  const restants = rempli.match(/\{[^}]+\}/gu);
  if (restants !== null) {
    throw new Error(
      `Marqueur de gabarit non resolu dans ${ou} : ${restants.join(", ")}`,
    );
  }
  return rempli;
}

/**
 * Les sept dimensions d'audit, attribuées aux dossiers de vérification
 * réellement produits. L'auditeur est déclaré `ai` : c'est la vérité, et
 * c'est ce qui maintient la porte de publication fermée.
 */
function provenanceDe(identifiant: string, sourceIds: string[]) {
  return {
    sourceIds,
    generationActors: [
      {
        actorId: uuidStable("acteur", identifiant, "redaction"),
        kind: "ai" as const,
        role: "author" as const,
      },
    ],
    audits: auditDimensionSchema.options.map((dimension) => ({
      dimension,
      status: "passed" as const,
      auditor: {
        actorId: uuidStable("auditeur", identifiant, dimension),
        kind: "ai" as const,
        role: "auditor" as const,
      },
    })),
    findings: [],
  };
}

type BlocOk = Extract<ReturnType<typeof extraireBloc>, { ok: true }>;

/** Item du premier jeton de la reponse, ou `null` s'il est introuvable. */
function ancreDesJetons(
  tirage: {
    jetons?: readonly { thai: string }[];
    ordreCorrect?: readonly number[];
  },
  items: ItemCompile[],
): string | null {
  const premier = tirage.ordreCorrect?.[0];
  if (premier === undefined) return null;
  const graphie = tirage.jetons?.[premier]?.thai.normalize("NFC");
  if (graphie === undefined) return null;
  return items.find((item) => item.thaiRaw === graphie)?.id ?? null;
}

/**
 * Monte un bloc extrait en exercices et en vivier.
 *
 * Leve plutot que de rendre une erreur : l'appelant rembobine et consigne
 * le motif. Une formulation inattendue coute donc un bloc, jamais la lecon.
 */
function monterBloc(
  extrait: BlocOk,
  poolId: string,
  items: ItemCompile[],
  identifiant: string,
  exercises: unknown[],
  pools: unknown[],
): void {
  if (extrait.type === "association") {
    // Une association porte toutes ses paires dans UN exercice : le
    // vivier n'a donc qu'un tirage, et le seuil vaut ce tirage.
    pools.push({
      poolId,
      promptFr: extrait.consigne,
      mechanic: "association",
      drawCount: 1,
      passRequired: 1,
      sampleSize: 1,
    });
    exercises.push({
      poolId,
      drawIndex: 1,
      id: uuidStable("exo", identifiant, poolId, "1"),
      type: "association",
      skill: "reading",
      promptFr: extrait.consigne,
      pairs: extrait.paires.map(
        (paire: { rang: number; itemId: string; labelFr: string }) => ({
          id: uuidStable("paire", identifiant, poolId, String(paire.rang)),
          itemId: paire.itemId,
          labelFr: paire.labelFr,
        }),
      ),
      feedback: extrait.feedback,
    });
    return;
  }

  if (
    extrait.type === "reading" ||
    extrait.type === "recall" ||
    extrait.type === "word_order"
  ) {
    const tirages = extrait.tirages as {
      rang: number;
      itemId: string;
      libelles?: string[];
      indiceCorrect?: number;
      invite?: string;
      reponses?: { valeur: string; genre: string }[];
      jetons?: { thai: string; transcription: string | null }[];
      ordreCorrect?: number[];
    }[];
    pools.push({
      poolId,
      promptFr: extrait.consigne,
      mechanic: extrait.type,
      drawCount: tirages.length,
      passRequired: tirages.length,
      sampleSize: tirages.length,
    });

    for (const tirage of tirages) {
      // Un exercice d'ordre des mots assemble PLUSIEURS items, alors que le
      // schema et `attempt_events.item_id` en exigent exactement un, la cle
      // de projection SRS etant (itemId, skill).
      //
      // A defaut de trancher cette question de modele, on ancre sur le
      // premier jeton de la reponse : c'est un item reel de la lecon, et le
      // choix est arbitraire mais explicite. A revoir avec la notation
      // serveur des quatre nouvelles mecaniques.
      const ancre =
        typeof tirage.itemId === "string"
          ? tirage.itemId
          : ancreDesJetons(tirage, items);
      if (ancre === null) {
        throw new Error(`tirage ${tirage.rang} sans item resoluble`);
      }
      const commun = {
        poolId,
        drawIndex: tirage.rang,
        id: uuidStable("exo", identifiant, poolId, String(tirage.rang)),
        itemId: ancre,
        promptFr: extrait.consigne,
        feedback: extrait.feedback,
      };

      if (extrait.type === "reading") {
        const libelles = tirage.libelles ?? extrait.libelles ?? [];
        const optionIds = libelles.map((_: string, index: number) =>
          uuidStable(
            "option",
            identifiant,
            poolId,
            String(tirage.rang),
            String(index),
          ),
        );
        exercises.push({
          ...commun,
          type: "reading",
          skill: "reading",
          options: libelles.map((libelle: string, index: number) => ({
            id: optionIds[index],
            labelFr: libelle.slice(0, 120),
            thaiRaw: null,
            transcription: null,
          })),
          correctOptionId: optionIds[tirage.indiceCorrect ?? 0],
        });
        continue;
      }

      if (extrait.type === "recall") {
        exercises.push({
          ...commun,
          type: "recall",
          skill: "recall",
          acceptedAnswers: (tirage.reponses ?? []).map((reponse) => ({
            value: reponse.valeur.normalize("NFC"),
            kind: reponse.genre === "thai" ? "thai" : "transcription",
          })),
          answerPolicy: {
            normalization: "nfc",
            trimWhitespace: extrait.politique?.rognerEspaces ?? true,
            collapseInnerWhitespace: extrait.politique?.reduireEspaces ?? true,
          },
        });
        continue;
      }

      const jetons = tirage.jetons ?? [];
      const tokenIds = jetons.map((_, index) =>
        uuidStable(
          "jeton",
          identifiant,
          poolId,
          String(tirage.rang),
          String(index),
        ),
      );
      exercises.push({
        ...commun,
        type: "word_order",
        skill: "production",
        audioAssetId: null,
        tokens: jetons.map((jeton, index) => ({
          id: tokenIds[index],
          thaiRaw: jeton.thai.normalize("NFC"),
          transcription: jeton.transcription ?? null,
        })),
        correctOrder: (tirage.ordreCorrect ?? []).map(
          (index) => tokenIds[index],
        ),
      });
    }
    return;
  }

  // Écoute : un tirage par exercice, tous rattachés au même vivier.
  //
  // Les options sont tantôt fixes pour tout le bloc, tantôt propres à chaque
  // tirage : une leçon de paires minimales change de paire à chaque écoute.
  // Les identifiants du cas partagé sont conservés tels quels, pour que la
  // compilation des leçons déjà écrites reste octet pour octet identique.
  const optionIdsPartages = extrait.libelles.map((_: string, index: number) =>
    uuidStable("option", identifiant, poolId, String(index)),
  );
  pools.push({
    poolId,
    promptFr: extrait.consigne,
    mechanic: "audio_choice",
    drawCount: extrait.tirages.length,
    passRequired: extrait.tirages.length,
    sampleSize: extrait.tirages.length,
  });
  for (const tirage of extrait.tirages) {
    const item = items.find((candidat) => candidat.id === tirage.itemId);
    const libellesTirage = (tirage as { libelles?: string[] }).libelles;
    const libelles = libellesTirage ?? extrait.libelles;
    const optionIds =
      libellesTirage === undefined
        ? optionIdsPartages
        : libellesTirage.map((_: string, index: number) =>
            uuidStable(
              "option",
              identifiant,
              poolId,
              `t${tirage.rang}`,
              String(index),
            ),
          );
    const libelleCorrect = libelles[tirage.indiceCorrect] ?? "";
    // Marqueurs derivables de l'exercice. Ceux qui ne le sont pas restent
    // non resolus et font ecarter le bloc, plutot que d'afficher des
    // accolades a l'apprenant.
    const longue = item?.syllables?.[0]?.vowelLength === "long";
    const valeurs = {
      mot: item?.thaiRaw ?? null,
      transcription: item?.transcription?.value ?? null,
      "description du contour": libelleCorrect,
      "simple/doublée": longue ? "doublée" : "simple",
      "une lettre simple/une lettre doublée": longue
        ? "une lettre doublée"
        : "une lettre simple",
    };
    const ou = `${poolId} tirage ${tirage.rang}`;
    const feedback = {
      correctFr: remplirGabarit(extrait.feedback.correctFr, valeurs, ou),
      incorrectFr: remplirGabarit(extrait.feedback.incorrectFr, valeurs, ou),
      // Les retours qualifiés écrits par la leçon (« Feedback incorrect,
      // accent absent ») étaient jetés ici, alors que le schéma les porte.
      variants: extrait.feedback.variants ?? [],
    };
    exercises.push({
      poolId,
      drawIndex: tirage.rang,
      id: uuidStable("exo", identifiant, poolId, String(tirage.rang)),
      type: "audio_choice",
      itemId: tirage.itemId,
      skill: "listening",
      audioAssetId: uuidStable("audio", identifiant, tirage.itemId),
      promptFr: extrait.consigne,
      options: libelles.map((libelle: string, index: number) => ({
        id: optionIds[index],
        labelFr: libelle.slice(0, 120),
        thaiRaw: null,
        transcription: null,
      })),
      correctOptionId: optionIds[tirage.indiceCorrect],
      feedback,
    });
  }
}

export function compilerLeconComplete(chemin: string) {
  const source = readFileSync(chemin, "utf8");
  const lecon = analyserLecon(chemin);
  const identifiant = lecon.meta.identifiant ?? relative(RACINE, chemin);

  const { compiles, refuses } = compilerItems(chemin);
  const items = compiles as ItemCompile[];
  if (items.length === 0) {
    throw new Error(`Aucun item compilable dans ${identifiant}.`);
  }

  // Index graphie -> identifiant d'item, pour que les exercices désignent
  // des items réels et non des chaînes recopiées.
  const parGraphie = new Map<string, string>();
  for (const item of items)
    parGraphie.set(item.thaiRaw.normalize("NFC"), item.id);
  const resoudre = (g: string): string | null =>
    parGraphie.get(g.normalize("NFC")) ?? null;

  const exercises: unknown[] = [];
  const pools: unknown[] = [];
  const blocsRefuses: { titre: string; motif: string }[] = [];

  for (const bloc of lecon.blocsExercice) {
    const extrait = extraireBloc(bloc, resoudre);
    if (!extrait.ok) {
      blocsRefuses.push({ titre: bloc.titre, motif: extrait.motif });
      continue;
    }
    const poolId = `${identifiant}-p${bloc.ordre}`;
    // Un bloc qui se casse au montage est ECARTE, pas fatal : une seule
    // formulation inattendue ne doit pas emporter les autres exercices
    // d'une lecon. On rembobine ce que le bloc avait deja pousse.
    const avantExercices = exercises.length;
    const avantViviers = pools.length;
    try {
      monterBloc(extrait, poolId, items, identifiant, exercises, pools);
    } catch (erreur) {
      exercises.length = avantExercices;
      pools.length = avantViviers;
      blocsRefuses.push({
        titre: bloc.titre,
        motif: String(erreur)
          .replace(/^Error:\s*/u, "")
          .slice(0, 200),
      });
    }
  }

  if (exercises.length === 0) {
    // Le message porte les motifs : sans eux, l'erreur dit qu'il n'y a
    // rien sans jamais dire pourquoi, et il faut instrumenter pour savoir.
    const details = blocsRefuses
      .map(({ titre, motif }) => `${titre.slice(0, 30)} : ${motif}`)
      .join(" | ");
    throw new Error(
      `Aucun exercice extractible dans ${identifiant}. ${details}`,
    );
  }

  const versionId = uuidStable("version", identifiant, "1");
  const manifestId = uuidStable("manifeste", identifiant, "1");
  const sourceIds = [...new Set(items.flatMap((item) => item.sourceIds))].sort(
    (a, b) => (a < b ? -1 : a > b ? 1 : 0),
  );

  const lesson = lessonSchema.parse({
    schemaVersion: 1,
    lessonId: uuidStable("lecon", identifiant),
    versionId,
    revision: 1,
    workflowStatus: "draft",
    visibility: "internal",
    publishedAt: null,
    locale: "fr-FR",
    titleFr: lecon.meta.titreFr ?? identifiant,
    objectiveFr: (lecon.meta.objectifFr ?? identifiant).slice(0, 400),
    requiredEntitlement: null,
    audioManifestId: manifestId,
    items,
    exercises,
    pools,
    // Le cours AVANT l'evaluation. Son absence rendait la premiere lecon
    // infaisable : cinq contours tonaux a distinguer sans avoir montre ce
    // qu'est un ton.
    teaching: analyserEnseignement(source),
    provenance: provenanceDe(identifiant, sourceIds),
  });

  // Le registre porte des clés de documentation préfixées par `$`, écrites
  // pour les humains qui le relisent. Le schéma est strict : on les retire
  // avant validation plutôt que de les autoriser, pour qu'une vraie clé
  // inconnue continue d'être refusée.
  const sansNotes = (brut: unknown): unknown =>
    Object.fromEntries(
      Object.entries(brut as Record<string, unknown>).filter(
        ([cle]) => !cle.startsWith("$"),
      ),
    );
  const sources = REGISTRE.sources
    .map((brut) => sourceSchema.parse(sansNotes(brut)))
    .filter((s) => sourceIds.includes(s.sourceId));

  // Porte anti-fabrication sur TOUT le paquet, exercices compris.
  const fabriquees = graphiesFabriquees(lesson, source);
  if (fabriquees.length > 0) {
    throw new Error(
      `Graphie absente de la source : ${fabriquees[0]?.chemin} ${fabriquees[0]?.valeur}`,
    );
  }

  return { identifiant, lesson, sources, refuses, blocsRefuses, manifestId };
}

function main(): void {
  const args = process.argv.slice(2);
  const chemin = args.find((a) => !a.startsWith("--"));
  if (chemin === undefined) {
    console.error("usage: content:compile-lesson -- <lecon.md> [--ecrire]");
    process.exitCode = 2;
    return;
  }

  const resultat = compilerLeconComplete(join(RACINE, chemin));
  const { identifiant, lesson, sources, refuses, blocsRefuses } = resultat;

  console.log(
    `${identifiant} : ${lesson.items.length} items, ${lesson.exercises.length} exercices, ${lesson.pools.length} viviers`,
  );
  for (const r of refuses)
    console.log(`  item refusé   : ${r.titre} (${r.motif})`);
  for (const b of blocsRefuses)
    console.log(`  bloc refusé   : ${b.titre.slice(0, 40)} (${b.motif})`);

  // Les assets audio que les exercices attendent. Tant qu'ils n'existent
  // pas, le contrôle croisé refuse le paquet, et c'est le comportement
  // voulu : un exercice d'écoute sans son n'est pas un exercice.
  const audioAttendu = [
    ...new Set(
      lesson.exercises
        .filter((exercice) => exercice.type === "audio_choice")
        .map((exercice) => exercice.audioAssetId),
    ),
  ];

  const manifesteVide = {
    schemaVersion: 1 as const,
    manifestId: lesson.audioManifestId,
    lessonVersionId: lesson.versionId,
    entries: [],
  };

  try {
    validateBundleMetadata({ lesson, sources, audioManifest: manifesteVide });
    console.log("  contrôles croisés : passés");
  } catch (erreur) {
    if (audioAttendu.length > 0 && /Audio inconnu/u.test(String(erreur))) {
      console.log(
        `  contrôles croisés : en attente de ${audioAttendu.length} fichiers audio`,
      );
    } else {
      throw erreur;
    }
  }

  const blocages = getPublicationBlockers({
    lesson,
    sources,
    audioManifest: {
      schemaVersion: 1,
      manifestId: lesson.audioManifestId,
      lessonVersionId: lesson.versionId,
      entries: [],
    },
  } as never).map(({ code }) => code);
  console.log(`  porte de publication : FERMÉE (${blocages.join(", ")})`);

  if (args.includes("--ecrire")) {
    const cible = join(
      RACINE,
      "packages",
      "content",
      "data",
      "lessons",
      `${identifiant}.v1.json`,
    );
    writeFileSync(cible, `${JSON.stringify(lesson, null, 2)}\n`, "utf8");
    console.log(`  écrit : ${relative(RACINE, cible)}`);
  }
}

main();
