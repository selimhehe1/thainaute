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

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { graphiesFabriquees } from "../src/anti-fabrication";
import {
  auditDimensionSchema,
  lessonSchema,
  sourceSchema,
} from "../src/schemas";
import {
  DEFAULT_LANGUAGE_PACK_ID,
  thaiFrLanguagePack,
} from "../src/language-packs";
import {
  signatureCouvre,
  signatureUniteSchema,
  type SignatureUnite,
} from "../src/signatures";
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
  translationFr: string | null;
  transcription: { value: string | null };
  syllables: { vowelLength: "short" | "long" | null }[];
  sourceIds: string[];
};

/**
 * Les leçons de synthèse réemploient parfois une carte publiée par une
 * leçon antérieure. La graphie reste écrite dans la source de la leçon, mais
 * elle ne doit pas être recompilée avec un nouvel identifiant : l'identité
 * SRS est celle de la carte d'origine.
 *
 * L'index est construit uniquement depuis l'autorat versionné. Il ne lit ni
 * les paquets générés ni un service distant, et ne choisit jamais une valeur
 * absente d'une source. Une leçon locale reste prioritaire en cas de doublon.
 */
const AUTHORING = join(RACINE, "content", "authoring");

function fichiersAutorat(dossier: string): string[] {
  return readdirSync(dossier, { withFileTypes: true })
    .flatMap((entree) => {
      const chemin = join(dossier, entree.name);
      if (entree.isDirectory()) return fichiersAutorat(chemin);
      return /^lecon-.*\.md$/u.test(entree.name) ? [chemin] : [];
    })
    .sort((gauche, droite) => (gauche < droite ? -1 : gauche > droite ? 1 : 0));
}

/**
 * Signature humaine couvrant cette leçon, ou `null`.
 *
 * Lue depuis `content/signatures/<unité>.json`, un fichier committé : l'acte
 * porte une date, un nom et un périmètre, et se relit dans l'historique. Une
 * variable d'environnement rendrait cette responsabilité invisible.
 */
function signaturePour(identifiantLecon: string): SignatureUnite | null {
  const unite = /^u(\d{2})-l/u.exec(identifiantLecon)?.[1];
  if (unite === undefined) return null;
  const chemin = join(RACINE, "content", "signatures", `${unite}.json`);
  if (!existsSync(chemin)) return null;
  const signature = signatureUniteSchema.parse(
    JSON.parse(readFileSync(chemin, "utf8")),
  );
  return signatureCouvre(signature, identifiantLecon) ? signature : null;
}

let indexItemsAutorat: Map<string, ItemCompile> | null = null;

function indexGlobalDesItems(): Map<string, ItemCompile> {
  if (indexItemsAutorat !== null) return indexItemsAutorat;

  const index = new Map<string, ItemCompile>();
  for (const fichier of fichiersAutorat(AUTHORING)) {
    const resultat = compilerItems(fichier);
    for (const item of resultat.compiles as ItemCompile[]) {
      if (!index.has(item.thaiRaw.normalize("NFC"))) {
        index.set(item.thaiRaw.normalize("NFC"), item);
      }
    }
  }
  indexItemsAutorat = index;
  return index;
}

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
  // Une signature humaine ne remplace jamais la rédaction par un modèle :
  // elle S'AJOUTE. Le dossier de preuve doit continuer de dire qui a écrit.
  const signature = signaturePour(identifiant);
  const humain =
    signature === null
      ? []
      : [
          {
            actorId: uuidStable(
              "acteur-humain",
              signature.signataire.nom,
              signature.unite,
            ),
            kind: "human" as const,
            role: "author" as const,
          },
        ];
  return {
    sourceIds,
    generationActors: [
      {
        actorId: uuidStable("acteur", identifiant, "redaction"),
        kind: "ai" as const,
        role: "author" as const,
      },
      ...humain,
    ],
    audits: auditDimensionSchema.options.map((dimension) => ({
      dimension,
      status: "passed" as const,
      auditor:
        signature === null
          ? {
              actorId: uuidStable("auditeur", identifiant, dimension),
              kind: "ai" as const,
              role: "auditor" as const,
            }
          : {
              actorId: uuidStable(
                "auditeur-humain",
                signature.signataire.nom,
                identifiant,
                dimension,
              ),
              kind: "human" as const,
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
  estPubliee: boolean,
): void {
  if (extrait.type === "association") {
    // Le contrat d'une manche accepte au plus six paires. Quand l'autorat
    // décrit plusieurs manches dans un même bloc, on les garde toutes mais
    // on les matérialise en exercices distincts, par tranches déterministes.
    const paires = extrait.paires as {
      rang: number;
      itemId: string;
      labelFr: string;
    }[];
    if (paires.length < 2) {
      throw new Error("association avec moins de deux paires");
    }
    const nombreManches = Math.ceil(paires.length / 6);
    const tailleManche = Math.ceil(paires.length / nombreManches);
    let numeroManche = 1;
    for (let index = 0; index < paires.length; index += tailleManche) {
      const manche = paires.slice(index, index + tailleManche);
      const manchePoolId =
        paires.length > 6 ? `${poolId}-m${numeroManche}` : poolId;
      numeroManche += 1;
      pools.push({
        poolId: manchePoolId,
        promptFr: extrait.consigne,
        mechanic: "association",
        drawCount: 1,
        passRequired: 1,
        sampleSize: 1,
      });
      exercises.push({
        poolId: manchePoolId,
        drawIndex: 1,
        id: uuidStable("exo", identifiant, manchePoolId, "1"),
        type: "association",
        skill: "reading",
        promptFr: extrait.consigne,
        pairs: manche.map((paire) => ({
          id: uuidStable(
            "paire",
            identifiant,
            manchePoolId,
            String(paire.rang),
          ),
          itemId: paire.itemId,
          labelFr: paire.labelFr,
        })),
        feedback: extrait.feedback,
      });
    }
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
        if (libelles.length > 6) {
          throw new Error(
            `tirage ${tirage.rang} : ${libelles.length} options, maximum 6`,
          );
        }
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
            // Les tolérances ne sont écrites QUE lorsqu'elles sont vraies, et
            // JAMAIS sur une leçon déjà publiée.
            //
            // POURQUOI CETTE SECONDE CONDITION : `u01-l1b` est publiée et
            // déclare « casse ignorée, signes de ton facultatifs à ce
            // stade ». Lire cette promesse changerait son paquet compilé,
            // donc son empreinte, et le contenu publié est immuable : une
            // correction passe par une NOUVELLE version, qui est un acte du
            // fondateur et non un effet de bord d'une amélioration du
            // compilateur. Le test `immutabilite-des-lecons-publiees` existe
            // pour attraper exactement cela, et il l'a fait.
            //
            // L'unité 1 garde donc son comportement strict jusqu'à ce qu'elle
            // soit re-versionnée. Voir `docs/qa/politique-de-saisie-2026-08-14`.
            ...(estPubliee
              ? {}
              : {
                  ...(extrait.politique?.ignorerCasse === true
                    ? { ignoreCase: true }
                    : {}),
                  ...(extrait.politique?.ignorerTons === true
                    ? { ignoreToneMarks: true }
                    : {}),
                  ...(extrait.politique?.ignorerPointMedian === true
                    ? { ignoreMiddleDot: true }
                    : {}),
                }),
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
  if (
    extrait.libelles.length > 6 ||
    extrait.tirages.some((tirage) => (tirage.libelles?.length ?? 0) > 6)
  ) {
    throw new Error("jeu d'écoute supérieur à 6 options");
  }
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
    const libellesTirage = tirage.libelles;
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
  const itemsLocaux = compiles as ItemCompile[];
  const itemsAutorat = indexGlobalDesItems();
  const itemsPourResolution = new Map<string, ItemCompile>();
  for (const item of itemsLocaux) {
    itemsPourResolution.set(item.thaiRaw.normalize("NFC"), item);
  }
  for (const [graphie, item] of itemsAutorat) {
    // La porte anti-fabrication doit aussi s'appliquer aux cartes réutilisées.
    // Une référence d'exercice mal recopiée ne doit pas faire entrer dans le
    // paquet une graphie que cette source ne porte nulle part.
    if (
      !itemsPourResolution.has(graphie) &&
      source.normalize("NFC").includes(graphie)
    ) {
      itemsPourResolution.set(graphie, item);
    }
  }
  if (itemsPourResolution.size === 0) {
    throw new Error(`Aucun item compilable dans ${identifiant}.`);
  }

  // Index graphie -> identifiant d'item, pour que les exercices désignent
  // des items réels et non des chaînes recopiées.
  const parGraphie = new Map<string, string>();
  for (const item of itemsPourResolution) parGraphie.set(item[0], item[1].id);
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
      monterBloc(
        extrait,
        poolId,
        [...itemsPourResolution.values()],
        identifiant,
        exercises,
        pools,
        signaturePour(identifiant)?.publier === true,
      );
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
  const itemIdsUtilises = new Set<string>();
  const releverItemIds = (valeur: unknown): void => {
    if (Array.isArray(valeur)) {
      for (const enfant of valeur) releverItemIds(enfant);
      return;
    }
    if (valeur === null || typeof valeur !== "object") return;
    for (const [cle, enfant] of Object.entries(valeur)) {
      if (cle === "itemId" && typeof enfant === "string") {
        itemIdsUtilises.add(enfant);
      } else if (cle === "pairs" || cle === "itemId") {
        releverItemIds(enfant);
      }
    }
  };
  releverItemIds(exercises);
  const items = [
    ...itemsLocaux,
    ...[...itemsPourResolution.values()].filter(
      (item) =>
        itemIdsUtilises.has(item.id) &&
        !itemsLocaux.some((local) => local.id === item.id),
    ),
  ];
  if (items.length === 0) {
    throw new Error(`Aucun item utilisable dans ${identifiant}.`);
  }

  const sourceIds = [...new Set(items.flatMap((item) => item.sourceIds))].sort(
    (a, b) => (a < b ? -1 : a > b ? 1 : 0),
  );

  const lesson = lessonSchema.parse({
    schemaVersion: 1,
    languagePackId: DEFAULT_LANGUAGE_PACK_ID,
    targetLocale: thaiFrLanguagePack.targetLocale,
    lessonId: uuidStable("lecon", identifiant),
    versionId,
    revision: 1,
    // Une leçon ne devient publique que si une signature humaine la couvre ET
    // demande explicitement la publication. Signer sans publier reste
    // possible, par exemple pendant qu'une voix se termine.
    ...(signaturePour(identifiant)?.publier === true
      ? {
          workflowStatus: "published" as const,
          visibility: "public" as const,
          publishedAt: signaturePour(identifiant)?.signeLe ?? null,
        }
      : {
          workflowStatus: "draft" as const,
          visibility: "internal" as const,
          publishedAt: null,
        }),
    locale: "fr-FR",
    titleFr: (lecon.meta.titreFr ?? identifiant).slice(0, 160).trim(),
    objectiveFr: (lecon.meta.objectifFr ?? identifiant).slice(0, 400).trim(),
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
  // Les cartes réutilisées portent leur propre provenance et ont déjà passé
  // la porte anti-fabrication dans leur fichier d'origine. La porte de cette
  // source vérifie les items locaux et tous les exercices (dont les graphies
  // doivent apparaître ici), mais ne traite pas le bloc de métadonnées d'une
  // carte importée comme s'il avait été réécrit dans la leçon courante.
  const fabriquees = graphiesFabriquees(
    { ...lesson, items: itemsLocaux },
    source,
  );
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

if (
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
