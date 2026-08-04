// Extraction déterministe des blocs d'exercice d'autorat.
//
// Pourquoi déterministe
// ---------------------
// Le corpus emploie dix-huit formulations différentes pour décrire un
// tirage, et 38 % des lignes n'entrent dans aucun motif régulier. Cela ne
// veut pas dire qu'il faut un modèle pour TOUT : cela veut dire qu'il en
// faudra un pour le reste.
//
// Ce module traite les motifs réguliers, sans aucun modèle, donc sans le
// moindre risque de fabrication. Il REFUSE tout le reste en le nommant,
// plutôt que de l'approcher. La porte anti-fabrication reste branchée
// derrière, pour le jour où un chemin assisté couvrira les irréguliers.

import { champ } from "./parse-authoring.mjs";
import { extraireReading } from "./extraire-reading.mjs";
import { extraireRecall } from "./extraire-recall.mjs";
import { extraireWordOrder } from "./extraire-word-order.mjs";

/** Ligne numérotée d'un bloc, « 1. ... ». */
const LIGNE_TIRAGE = /^\s*(\d+)\.\s+(.+?)\s*$/u;
/** Texte entre guillemets français, le porteur habituel des libellés. */
const ENTRE_GUILLEMETS = /«\s*([^»]+?)\s*»/gu;
/** Suite thaïe. */
const THAI = /[฀-๿]+/gu;

function lignesTirage(corps) {
  const sortie = [];
  for (const ligne of corps.split("\n")) {
    const trouve = ligne.match(LIGNE_TIRAGE);
    if (trouve !== null) {
      sortie.push({ rang: Number(trouve[1]), texte: trouve[2] });
    }
  }
  return sortie;
}

/**
 * Les libellés d'option écrits en prose dans le champ `Options`.
 * « … : « à plat au milieu (moyen) », « posé en bas (bas) », … »
 */
function optionsDeclarees(corps) {
  const brut = champ(corps, "Options");
  if (brut === undefined) return null;
  const libelles = [...brut.matchAll(ENTRE_GUILLEMETS)].map((t) => t[1]);
  return libelles.length >= 2 ? libelles : null;
}

function feedbackDuBloc(corps) {
  const lire = (nom) => {
    const brut = champ(corps, nom);
    if (brut === undefined) return null;
    // Le texte utile est entre guillemets quand il y en a ; sinon la ligne.
    const cite = brut.match(/«\s*([^»]+?)\s*»/u);
    return (cite?.[1] ?? brut).trim().slice(0, 280);
  };
  const correctFr = lire("Feedback correct");
  const incorrectFr = lire("Feedback incorrect");
  if (correctFr === null || incorrectFr === null) return null;
  return { correctFr, incorrectFr, variants: [] };
}

function consigneDuBloc(corps) {
  const brut = champ(corps, "Consigne");
  if (brut === undefined) return null;
  const cite = brut.match(/«\s*([^»]+?)\s*»/u);
  return (cite?.[1] ?? brut).trim().slice(0, 280);
}

/**
 * Association : « N. Audio <thaï> ↔ carte « <libellé> » ».
 *
 * Le schéma veut `pairs: [{ id, itemId, labelFr }]`. La graphie thaïe sert
 * à retrouver l'item compilé ; on ne la recopie pas dans le libellé, le
 * côté thaï s'affichant depuis l'item référencé.
 */
function extraireAssociation(bloc, resoudreItem) {
  const paires = [];
  for (const { rang, texte } of lignesTirage(bloc.corps)) {
    const cote = texte.split("↔");
    if (cote.length !== 2) {
      return { erreur: `tirage ${rang} : pas de séparateur ↔ unique` };
    }
    const graphies = [...cote[0].matchAll(THAI)].map((t) => t[0]);
    if (graphies.length !== 1) {
      return {
        erreur: `tirage ${rang} : ${graphies.length} graphies à gauche`,
      };
    }
    const libelle = cote[1].match(/«\s*([^»]+?)\s*»/u)?.[1];
    if (libelle === undefined) {
      return { erreur: `tirage ${rang} : libellé non cité à droite` };
    }
    const itemId = resoudreItem(graphies[0]);
    if (itemId === null) {
      return {
        erreur: `tirage ${rang} : item introuvable pour ${graphies[0]}`,
      };
    }
    paires.push({ rang, itemId, labelFr: libelle.slice(0, 120) });
  }
  if (paires.length < 2) return { erreur: "moins de deux paires" };
  return { paires };
}

/**
 * Écoute : « N. Audio <thaï> : réponse « <libellé> » », avec des options
 * fixes déclarées une fois pour le bloc.
 */
/**
 * Options ecrites DANS la ligne de tirage, forme rencontree en 1D et
 * ailleurs : « Audio หมา (mǎa). Options : Montant / Haut. Réponse : Montant. »
 *
 * Le corpus alterne entre options declarees une fois pour le bloc et
 * options repetees a chaque tirage. Les deux sont legitimes : la premiere
 * quand les cartes ne bougent pas, la seconde quand elles dependent du mot.
 */
function optionsDuTirage(texte) {
  const brut = texte.match(/Options\s*:\s*([^.]+?)\s*\.\s*R[ée]ponse/u)?.[1];
  if (brut === undefined) return null;
  const libelles = brut
    .split(/\s*\/\s*/u)
    .map((part) => part.trim())
    .filter(Boolean);
  return libelles.length >= 2 ? libelles : null;
}

function extraireEcoute(bloc, resoudreItem) {
  const libellesBloc = optionsDeclarees(bloc.corps);

  // Sans options de bloc, on tente les options par tirage avant de refuser.
  if (libellesBloc === null) {
    return extraireEcouteParTirage(bloc, resoudreItem);
  }
  const libelles = libellesBloc;

  const tirages = [];
  for (const { rang, texte } of lignesTirage(bloc.corps)) {
    const graphies = [...texte.matchAll(THAI)].map((t) => t[0]);
    if (graphies.length !== 1) {
      return { erreur: `tirage ${rang} : ${graphies.length} graphies` };
    }
    const reponse = texte.match(/réponse\s*«\s*([^»]+?)\s*»/u)?.[1];
    if (reponse === undefined) {
      return { erreur: `tirage ${rang} : réponse non citée` };
    }
    // La réponse doit désigner une des options déclarées. On apparie sur
    // l'étiquette entre parenthèses, ou sur le libellé entier.
    const indice = libelles.findIndex(
      (libelle) =>
        libelle === reponse ||
        libelle.match(/\(([^)]+)\)\s*$/u)?.[1] === reponse,
    );
    if (indice < 0) {
      return { erreur: `tirage ${rang} : réponse « ${reponse} » hors options` };
    }
    const itemId = resoudreItem(graphies[0]);
    if (itemId === null) {
      return {
        erreur: `tirage ${rang} : item introuvable pour ${graphies[0]}`,
      };
    }
    tirages.push({ rang, itemId, indiceCorrect: indice });
  }
  if (tirages.length === 0) return { erreur: "aucun tirage lisible" };
  return { libelles, tirages };
}

/** Variante ou chaque tirage porte ses propres options et sa reponse. */
function extraireEcouteParTirage(bloc, resoudreItem) {
  const lignes = lignesTirage(bloc.corps);
  if (lignes.length === 0) {
    return { erreur: "options du bloc non déclarées, et aucun tirage lisible" };
  }

  let reference = null;
  const tirages = [];
  for (const { rang, texte } of lignes) {
    const libelles = optionsDuTirage(texte);
    if (libelles === null) {
      return { erreur: `tirage ${rang} : options du tirage non lisibles` };
    }
    // Le schema porte les options par exercice ; on exige donc qu'elles
    // soient les memes d'un tirage a l'autre, plutot que d'en perdre en
    // silence.
    if (reference === null) reference = libelles;
    else if (reference.join("|") !== libelles.join("|")) {
      return { erreur: `tirage ${rang} : options différentes des précédentes` };
    }

    const reponse = texte.match(/R[ée]ponse\s*:\s*([^.;]+)/u)?.[1]?.trim();
    if (reponse === undefined) {
      return { erreur: `tirage ${rang} : réponse illisible` };
    }
    const indice = libelles.findIndex((libelle) => libelle === reponse);
    if (indice < 0) {
      return { erreur: `tirage ${rang} : réponse « ${reponse} » hors options` };
    }

    const graphies = [...texte.matchAll(THAI)].map((trouve) => trouve[0]);
    if (graphies.length !== 1) {
      return { erreur: `tirage ${rang} : ${graphies.length} graphies` };
    }
    const itemId = resoudreItem(graphies[0]);
    if (itemId === null) {
      return {
        erreur: `tirage ${rang} : item introuvable pour ${graphies[0]}`,
      };
    }
    tirages.push({ rang, itemId, indiceCorrect: indice });
  }
  return { libelles: reference, tirages };
}

/**
 * Analyse un bloc et rend soit une description structurée, soit le motif
 * précis du refus. Jamais une approximation.
 */
export function extraireBloc(bloc, resoudreItem) {
  const consigne = consigneDuBloc(bloc.corps);
  if (consigne === null) return { ok: false, motif: "consigne absente" };
  const feedback = feedbackDuBloc(bloc.corps);
  if (feedback === null) {
    return { ok: false, motif: "feedback correct ou incorrect absent" };
  }

  if (bloc.mecanique === "association") {
    const resultat = extraireAssociation(bloc, resoudreItem);
    if (resultat.erreur !== undefined) {
      return { ok: false, motif: resultat.erreur };
    }
    return { ok: true, type: "association", consigne, feedback, ...resultat };
  }
  if (bloc.mecanique === "listening") {
    const resultat = extraireEcoute(bloc, resoudreItem);
    if (resultat.erreur !== undefined) {
      return { ok: false, motif: resultat.erreur };
    }
    return { ok: true, type: "audio_choice", consigne, feedback, ...resultat };
  }

  // Les trois mécaniques suivantes vivent dans leurs propres modules : le
  // corpus les écrit de façons trop differentes pour tenir dans une seule
  // grammaire lisible.
  const delegues = {
    reading: [extraireReading, "reading"],
    recall: [extraireRecall, "recall"],
    word_order: [extraireWordOrder, "word_order"],
  };
  const delegue = delegues[bloc.mecanique];
  if (delegue !== undefined) {
    const [extraire, type] = delegue;
    const resultat = extraire(bloc, resoudreItem);
    if (resultat.erreur !== undefined) {
      return { ok: false, motif: resultat.erreur };
    }
    return { ok: true, type, consigne, feedback, ...resultat };
  }

  return { ok: false, motif: `mécanique « ${bloc.mecanique} » non traitée` };
}
