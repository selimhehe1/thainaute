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

import { champ, champsPrefixes } from "./parse-authoring.mjs";
import { extraireReading } from "./extraire-reading.mjs";
import { extraireRecall } from "./extraire-recall.mjs";
import { extraireWordOrder } from "./extraire-word-order.mjs";

/** Ligne numérotée d'un bloc, « 1. ... ». */
const LIGNE_TIRAGE = /^\s*(\d+)\.\s+(.+?)\s*$/u;
/** Texte entre guillemets français, le porteur habituel des libellés. */
const ENTRE_GUILLEMETS = /«\s*([^»]+?)\s*»/gu;
/** Suite thaïe. */
const THAI = /[฀-๿]+/gu;
/** Idem, sans le drapeau global : pour un `match` ponctuel. */
const THAI_UNE = /[฀-๿]+/u;
/** Plafond du schéma : `CONTENT_SCHEMA_LIMITS.feedbackVariantsPerExercise`. */
const LIMITE_VARIANTES = 8;

/**
 * Les tirages numérotés d'un bloc, lignes repliées recollées.
 *
 * PIÈGE MESURÉ : le corpus est enveloppé à 72 colonnes, et un tirage tient
 * très souvent sur deux ou trois lignes physiques :
 *
 *     1. Audio ข้าว, options เข้า (khâo, entrer) / ข้าว (khâao, riz) :
 *        réponse ข้าว.
 *
 * En ne lisant que la première ligne, l'extraction perdait la réponse, puis
 * refusait le bloc pour « réponse illisible » ou « options non lisibles ».
 * La faute n'était pas dans les motifs mais en amont, dans le découpage.
 *
 * Une continuation est une ligne indentée qui n'ouvre pas un nouveau
 * tirage. Une puce non indentée referme le tirage : c'est le champ suivant.
 */
function lignesTirage(corps) {
  const sortie = [];
  let courant = null;
  for (const ligne of corps.split("\n")) {
    const trouve = ligne.match(LIGNE_TIRAGE);
    if (trouve !== null) {
      courant = { rang: Number(trouve[1]), texte: trouve[2] };
      sortie.push(courant);
      continue;
    }
    if (courant === null) continue;
    if (ligne.trim() === "" || !/^\s/u.test(ligne)) {
      courant = null;
      continue;
    }
    courant.texte = `${courant.texte} ${ligne.trim()}`;
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

/** Le texte utile est entre guillemets quand il y en a ; sinon la ligne. */
function texteUtile(brut) {
  const cite = brut.match(/«\s*([^»]+?)\s*»/u);
  return (cite?.[1] ?? brut).trim().slice(0, 280);
}

/** Un qualificatif d'étiquette, débarrassé de sa virgule d'attache. */
function qualificatifLisible(brut) {
  return brut.replace(/^[,\s]+/u, "").trim();
}

/**
 * Retours pédagogiques d'un bloc, retours qualifiés compris.
 *
 * PIÈGE MESURÉ : le corpus écrit couramment plusieurs retours par bloc,
 * indexés par tirage (« Feedback correct, tirage 4 ») ou par type d'erreur
 * (« Feedback incorrect, accent absent »). L'ancien détecteur n'acceptait
 * que l'étiquette nue, et refusait donc 153 blocs pour « feedback absent »
 * alors que la leçon en contenait plusieurs.
 *
 * Le retour principal est celui qui ne porte pas de qualificatif ; à défaut,
 * le premier écrit. Les autres partent en variantes, que
 * `feedbackVariantSchema` sait porter depuis ADR-0026 : son champ `labelFr`
 * y est décrit comme « condition lisible, reprise du markdown source », et
 * `selectedOptionId` y est nullable.
 *
 * Un bloc reste refusé s'il n'a AUCUN retour correct ou AUCUN retour
 * incorrect : le contrat de leçon du brief exige une correction
 * explicative, et l'inventer serait pire que refuser le bloc.
 */
function feedbackDuBloc(corps) {
  const collecte = (prefixe) =>
    champsPrefixes(corps, prefixe)
      .map((c) => ({
        qualificatif: qualificatifLisible(c.qualificatif),
        texte: texteUtile(c.valeur),
      }))
      .filter((c) => c.texte !== "");

  const corrects = collecte("Feedback correct");
  const incorrects = collecte("Feedback incorrect");
  if (corrects.length === 0 || incorrects.length === 0) return null;

  const principal = (liste) =>
    liste.find((c) => c.qualificatif === "") ?? liste[0];
  const cPrincipal = principal(corrects);
  const iPrincipal = principal(incorrects);

  // L'étiquette de la variante dit de quel côté elle tombe : sans ça, un
  // « tirage 4 » ne permettrait pas de savoir s'il récompense ou corrige.
  const variantes = [];
  for (const [cote, liste, retenu] of [
    ["correct", corrects, cPrincipal],
    ["incorrect", incorrects, iPrincipal],
  ]) {
    for (const candidat of liste) {
      if (candidat === retenu || candidat.qualificatif === "") continue;
      variantes.push({
        selectedOptionId: null,
        labelFr: `${cote}, ${candidat.qualificatif}`.slice(0, 120),
        textFr: candidat.texte,
      });
    }
  }

  return {
    correctFr: cPrincipal.texte,
    incorrectFr: iPrincipal.texte,
    variants: variantes.slice(0, LIMITE_VARIANTES),
  };
}

/**
 * Consigne d'un bloc, qualificatif toléré.
 *
 * Le corpus écrit tantôt « Consigne », tantôt « Consigne générale », tantôt
 * « Consigne (tirages 1 à 6) ». Les trois disent la même chose à
 * l'apprenant, et seule la première était lue.
 */
function consigneDuBloc(corps) {
  const trouves = champsPrefixes(corps, "Consigne").filter(
    (c) => c.valeur.trim() !== "",
  );
  if (trouves.length === 0) return null;
  const retenu = trouves.find((c) => c.qualificatif === "") ?? trouves[0];
  return texteUtile(retenu.valeur);
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
  let erreurNumerotee = null;
  for (const { rang, texte } of lignesTirage(bloc.corps)) {
    const cote = texte.split("↔");
    if (cote.length !== 2) {
      erreurNumerotee = `tirage ${rang} : pas de séparateur ↔ unique`;
      break;
    }
    const graphies = [...cote[0].matchAll(THAI)].map((t) => t[0]);
    if (graphies.length !== 1) {
      erreurNumerotee = `tirage ${rang} : ${graphies.length} graphies à gauche`;
      break;
    }
    const libelle = cote[1].match(/«\s*([^»]+?)\s*»/u)?.[1];
    if (libelle === undefined) {
      erreurNumerotee = `tirage ${rang} : libellé non cité à droite`;
      break;
    }
    const itemId = resoudreItem(graphies[0]);
    if (itemId === null) {
      erreurNumerotee = `tirage ${rang} : item introuvable pour ${graphies[0]}`;
      break;
    }
    paires.push({ rang, itemId, labelFr: libelle.slice(0, 120) });
  }
  if (erreurNumerotee === null && paires.length >= 2) return { paires };

  // Plusieurs dossiers écrivent les manches comme une liste de prose, par
  // exemple « A ↔ « sens » ; B ↔ « sens » », ou comme deux graphies
  // thaïes (« ค ↔ ข »). Ces deux formes sont explicites : on les extrait
  // sans déduire de sens. Pour la seconde, la graphie de droite devient la
  // carte partenaire affichée, ce qui conserve exactement le jeu de lettres
  // écrit par l'auteur.
  const pairesCitees = [];
  const motifCite = new RegExp(
    `(${THAI.source}(?:[ \\t]+${THAI.source})*)[ \\t]*↔[ \\t]*«\\s*([^»]+?)\\s*»`,
    "gu",
  );
  for (const trouve of bloc.corps.matchAll(motifCite)) {
    const itemId = resoudreItem(trouve[1]);
    if (itemId !== null) {
      pairesCitees.push({
        rang: pairesCitees.length + 1,
        itemId,
        labelFr: trouve[2].trim().slice(0, 120),
      });
    }
  }
  if (pairesCitees.length >= 2) return { paires: pairesCitees };

  const pairesGraphies = [];
  const motifGraphies = new RegExp(
    `(${THAI.source}(?:[ \\t]+${THAI.source})*)[ \\t]*↔[ \\t]*(${THAI.source}(?:[ \\t]+${THAI.source})*)`,
    "gu",
  );
  for (const trouve of bloc.corps.matchAll(motifGraphies)) {
    const itemId = resoudreItem(trouve[1]);
    if (itemId !== null) {
      pairesGraphies.push({
        rang: pairesGraphies.length + 1,
        itemId,
        labelFr: trouve[2].trim().slice(0, 120),
      });
    }
  }
  if (pairesGraphies.length >= 2) return { paires: pairesGraphies };

  return { erreur: erreurNumerotee ?? "moins de deux paires" };
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
  const trouve = texte.match(
    /\bOptions?\s*:?\s*(.+?)\s*[.:;]\s*R[ée]ponse\s*:?\s*(.+?)\s*\.?\s*$/iu,
  );
  if (trouve === null) return null;
  const brut = trouve[1].trim();
  const libelles = (
    /^\d+(?:\s*,\s*\d+)+$/u.test(brut)
      ? brut.split(/\s*,\s*/u)
      : brut.split(/\s*\/\s*/u)
  )
    .map((part) => part.trim())
    .filter(Boolean);
  return libelles.length >= 2 ? libelles : null;
}

function extraireEcoute(bloc, resoudreItem) {
  const libellesBloc = optionsDeclarees(bloc.corps);

  // Quand chaque ligne « Audio … ; options … ; réponse … » porte son
  // propre jeu, les options du champ introductif ne sont pas le jeu réel.
  // Prioriser la forme par tirage évite notamment d'englober les graphies
  // citées dans les notes de production de la même ligne numérotée.
  if (/^\s*\d+\.\s+Audio\b.*\boptions?\b/imu.test(bloc.corps)) {
    return extraireEcouteParTirage(bloc, resoudreItem);
  }

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
/**
 * Tirage écrit sous forme de PAIRE MINIMALE, la plus répandue du corpus :
 *
 *   « 1. Audio ข้าว, options เข้า (khâo, entrer) / ข้าว (khâao, riz) :
 *      réponse ข้าว. »
 *   « 1. Audio พา ; options ปา (paa, lancer) / พา (phaa, emmener) :
 *      réponse พา. »
 *
 * Elle échappait à l'ancien chemin pour deux raisons cumulées : son mot
 * « options » est en minuscules et n'est pas suivi d'un point avant
 * « réponse », et surtout la ligne porte QUATRE graphies thaïes là où le
 * chemin d'origine en exigeait exactement une.
 *
 * Ici, chaque tirage porte ses propres options : dans une leçon de paires
 * minimales, la paire change à chaque écoute. La bonne réponse est
 * désignée par sa graphie, qu'on retrouve dans l'un des deux libellés.
 */
function tirageEnPaireMinimale(texte) {
  const audio = texte.match(/Audio\s+([฀-๿]+)/u)?.[1];
  if (audio === undefined) return null;

  const segment = texte.match(
    /\boptions?\s*:?\s*(.+?)\s*:\s*r[ée]ponse\s*:?\s*(.+?)\s*\.?\s*$/iu,
  );
  if (segment === null) return null;

  const libelles = segment[1]
    .split(/\s*\/\s*/u)
    .map((part) => part.trim())
    .filter(Boolean);
  if (libelles.length < 2) return null;

  // La réponse est citée par sa graphie ; on la relie au libellé qui la
  // porte, plutôt que par une comparaison de chaînes entières qui échouerait
  // sur la glose entre parenthèses.
  const graphieReponse = segment[2].match(THAI_UNE)?.[0];
  if (graphieReponse === undefined) return null;
  const indiceCorrect = libelles.findIndex(
    (libelle) => libelle.match(THAI_UNE)?.[0] === graphieReponse,
  );
  if (indiceCorrect < 0) return null;

  return { graphieAudio: audio, libelles, indiceCorrect };
}

function extraireEcouteParTirage(bloc, resoudreItem) {
  const lignes = lignesTirage(bloc.corps);
  if (lignes.length === 0) {
    return { erreur: "options du bloc non déclarées, et aucun tirage lisible" };
  }

  let reference = null;
  let optionsVarient = false;
  const tirages = [];
  for (const { rang, texte } of lignes) {
    const paire = tirageEnPaireMinimale(texte);

    let libelles;
    let indice;
    let graphieAudio;

    if (paire !== null) {
      ({ libelles, indiceCorrect: indice, graphieAudio } = paire);
    } else {
      libelles = optionsDuTirage(texte);
      if (libelles === null) {
        return { erreur: `tirage ${rang} : options du tirage non lisibles` };
      }
      const reponse = texte.match(/R[ée]ponse\s*:?\s*([^.;]+)/iu)?.[1]?.trim();
      if (reponse === undefined) {
        return { erreur: `tirage ${rang} : réponse illisible` };
      }
      indice = libelles.findIndex((libelle) => libelle === reponse);
      if (indice < 0) {
        return {
          erreur: `tirage ${rang} : réponse « ${reponse} » hors options`,
        };
      }
      graphieAudio = texte.match(/\bAudio\s+([ก-๿]+)/u)?.[1] ?? null;
      if (graphieAudio === null) {
        const graphies = [...texte.matchAll(THAI)].map((trouve) => trouve[0]);
        if (graphies.length !== 1) {
          return { erreur: `tirage ${rang} : ${graphies.length} graphies` };
        }
        graphieAudio = graphies[0];
      }
    }

    if (reference === null) reference = libelles;
    else if (reference.join("|") !== libelles.join("|")) optionsVarient = true;

    const itemId = resoudreItem(graphieAudio);
    if (itemId === null) {
      return {
        erreur: `tirage ${rang} : item introuvable pour ${graphieAudio}`,
      };
    }
    tirages.push({ rang, itemId, indiceCorrect: indice, libelles });
  }

  // Quand les options ne bougent pas, on ne les répète pas par tirage : la
  // compilation conserve alors ses identifiants d'option historiques, et la
  // sortie des leçons déjà écrites reste octet pour octet identique.
  if (!optionsVarient) {
    for (const tirage of tirages) delete tirage.libelles;
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
