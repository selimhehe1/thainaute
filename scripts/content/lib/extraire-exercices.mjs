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
 * Les libellés d'option déclarés au niveau du bloc.
 *
 * PIÈGE MESURÉ, le même que pour le feedback et la consigne : le corpus
 * qualifie massivement son étiquette par une virgule.
 *
 *     - Options, identiques à tous les tirages, ordre aléatoire : un taxi /
 *       un bus / un bateau / un véhicule (le mot général).
 *
 * `champ()` ne lit qu'une étiquette nue, donc il ne voyait rien, et le bloc
 * partait vers le chemin par tirage où ses tirages, qui ne portent pas
 * d'options puisqu'elles sont déclarées ici, étaient refusés. Le correctif
 * est celui déjà appliqué ailleurs : `champsPrefixes`.
 *
 * Deux notations sont lues. Les libellés cités entre guillemets, forme la
 * plus explicite, et à défaut la liste séparée par des barres obliques.
 * Une prose non énumérable rend `null` : le bloc est alors refusé plutôt
 * qu'approché. Et quelle que soit la notation, l'appariement de la réponse
 * en aval reste le juge : un découpage faux ne trouve pas sa réponse et
 * refuse le bloc, au lieu de compiler un corrigé faux.
 */
function optionsDeclarees(corps) {
  const champs = champsPrefixes(corps, "Options");
  const brut = champs[0]?.valeur ?? champ(corps, "Options");
  if (brut === undefined || brut === "") return null;

  const cites = [...brut.matchAll(ENTRE_GUILLEMETS)].map((t) => t[1]);
  if (cites.length >= 2) return cites;

  // Une sous-liste à puces emploie la barre oblique POUR SÉPARER LES FACES
  // d'une même option (« 15 bahts / สิบห้าบาท / sìp·hâa bàat »), pas les
  // options entre elles. La découper donnerait des options fantômes : on
  // laisse ce cas au refus tant qu'il n'est pas traité pour lui-même.
  if (/(?:^|\s)-\s/u.test(brut)) return null;

  const barres = brut
    .replace(/\s*\.\s*$/u, "")
    .split(/\s+\/\s+/u)
    .map((part) => part.trim())
    .filter(Boolean);
  return barres.length >= 2 ? barres : null;
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
  const collecte = (prefixe, motifSecours) => {
    const nettoyer = (liste) =>
      liste
        .map((c) => ({
          qualificatif: qualificatifLisible(c.qualificatif),
          texte: texteUtile(c.valeur),
        }))
        .filter((c) => c.texte !== "");
    const direct = nettoyer(champsPrefixes(corps, prefixe));
    // Même secours que pour la consigne : un exercice en plusieurs manches
    // écrit « Manche 1, feedback correct : … » ou l'indente sous sa manche,
    // et l'étiquette ne commence alors plus par « Feedback ».
    return direct.length > 0
      ? direct
      : nettoyer(lignesEtiquetees(corps, motifSecours));
  };

  const corrects = collecte("Feedback correct", "feedbacks? corrects?");
  const incorrects = collecte("Feedback incorrect", "feedbacks? incorrects?");
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
/**
 * Consigne écrite autrement qu'en champ de premier niveau.
 *
 * PIÈGE MESURÉ : `champsPrefixes` exige une puce NON INDENTÉE, et c'est
 * volontaire, sa butée de fin de champ en dépend. Or le corpus écrit sa
 * consigne en sous-puce quand un exercice se joue en plusieurs manches :
 *
 *     - Manche 1, consigne : « Reliez chaque mot à ce qu'il désigne. »
 *       - Consigne : « Qui pose cette question ? »
 *
 * Relâcher `champsPrefixes` casserait la lecture des champs à sous-puces
 * comme `sources`. On cherche donc ici, et seulement ici, une ligne de
 * consigne où qu'elle soit, en dernier recours.
 */
function lignesEtiquetees(corps, motifEtiquette) {
  const re = new RegExp(
    `^\\s*[-*]\\s+([^:\\n]*?)\\b(${motifEtiquette})\\b([^:\\n]*):\\s*(.+)$`,
    "iu",
  );
  const sorties = [];
  for (const ligne of String(corps).split("\n")) {
    const trouve = ligne.match(re);
    const valeur = trouve?.[4]?.trim();
    if (valeur === undefined || valeur === "") continue;
    sorties.push({
      qualificatif: `${trouve[1] ?? ""}${trouve[3] ?? ""}`.trim(),
      valeur,
    });
  }
  return sorties;
}

function consigneDuBloc(corps) {
  const trouves = champsPrefixes(corps, "Consigne").filter(
    (c) => c.valeur.trim() !== "",
  );
  if (trouves.length > 0) {
    const retenu = trouves.find((c) => c.qualificatif === "") ?? trouves[0];
    return texteUtile(retenu.valeur);
  }
  const secours = lignesEtiquetees(corps, "consignes?")[0];
  return secours === undefined ? null : texteUtile(secours.valeur);
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
    // La réponse doit désigner une des options déclarées. `reponseParmi`
    // lit les trois notations du corpus : graphie thaïe, libellé cité,
    // libellé nu. L'ancienne version n'acceptait que la forme citée, et
    // refusait « Réponse : un bateau. » pour « réponse non citée » alors
    // que la ligne était parfaitement claire.
    const indice = reponseParmi(texte, libelles);
    if (indice === null) {
      return {
        erreur: `tirage ${rang} : réponse absente des options du bloc`,
      };
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

/**
 * Un tirage qui ne réécrit pas ses options mais renvoie à un jeu déjà posé.
 *
 * POURQUOI CE CHEMIN EXISTE
 * -------------------------
 * C'était la première cause de refus du corpus, 51 blocs. Une leçon de
 * paires minimales introduit une paire, la fait entendre deux fois, passe à
 * la suivante, puis revient sur la première pour mélanger. Personne
 * n'écrit six fois les mêmes deux options : on écrit « mêmes options », ou
 * « options de la paire 1 ». C'est de la prose parfaitement claire, que
 * l'extraction ne savait pas lire.
 *
 * `rangJeu === null` désigne le jeu du tirage précédent. Un nombre désigne
 * le n-ième jeu DISTINCT rencontré, parce que « la paire 2 » nomme la
 * deuxième paire entendue, pas le deuxième tirage.
 */
function renvoiVersUnJeuConnu(texte) {
  const numerote = texte.match(
    /\boptions?\s+(?:de\s+la\s+paire|du\s+tirage|de\s+la\s+série)\s+(\d+)/iu,
  );
  if (numerote !== null) return { rangJeu: Number(numerote[1]) };
  return /\b(?:les\s+)?m[êe]mes\s+options\b/iu.test(texte)
    ? { rangJeu: null }
    : null;
}

/**
 * Indice de l'option que la réponse d'un tirage désigne, ou `null`.
 *
 * Le corpus désigne sa réponse de trois façons : par la graphie thaïe
 * (« réponse พา »), par un libellé cité (« réponse « la voix tombe » »), ou
 * par le libellé nu (« Réponse : une eau plate »). Les trois sont ici, parce
 * qu'un renvoi peut apparaître dans n'importe laquelle.
 */
/**
 * Les lectures possibles de ce qui suit « réponse », de la plus courte à la
 * plus longue.
 *
 * PIÈGE MESURÉ : une ligne de tirage ne s'arrête pas à sa réponse. Elle
 * continue souvent en prose d'intention, sur la même ligne repliée :
 *
 *     4. Audio รถ. Réponse : un véhicule (le mot général). Ce tirage et le
 *        tirage 3 partagent la même cible.
 *
 * Prendre tout ce qui suit « Réponse » donne alors un libellé introuvable.
 * On essaie donc chaque fin de phrase avant la ligne entière.
 */
function candidatsDeReponse(brut) {
  const nettoyer = (valeur) => valeur.replace(/\s*[.;,]\s*$/u, "").trim();
  const sorties = [];
  for (const fin of brut.matchAll(/\.\s/gu)) {
    const candidat = nettoyer(brut.slice(0, fin.index));
    if (candidat !== "") sorties.push(candidat);
  }
  const entier = nettoyer(brut);
  if (entier !== "") sorties.push(entier);
  return sorties;
}

function reponseParmi(texte, libelles) {
  const brut = texte.match(/R[ée]ponse\s*:?\s*(.+)$/iu)?.[1]?.trim();
  if (brut === undefined) return null;

  for (const candidat of candidatsDeReponse(brut)) {
    const graphie = candidat.match(THAI_UNE)?.[0];
    if (graphie !== undefined) {
      const parGraphie = libelles.findIndex(
        (libelle) => libelle.match(THAI_UNE)?.[0] === graphie,
      );
      if (parGraphie >= 0) return parGraphie;
    }

    const cite = candidat.match(/«\s*([^»]+?)\s*»/u)?.[1]?.trim() ?? candidat;
    const parLibelle = libelles.findIndex(
      (libelle) =>
        libelle === cite || libelle.match(/\(([^)]+)\)\s*$/u)?.[1] === cite,
    );
    if (parLibelle >= 0) return parLibelle;
  }
  return null;
}

function extraireEcouteParTirage(bloc, resoudreItem) {
  const lignes = lignesTirage(bloc.corps);
  if (lignes.length === 0) {
    return { erreur: "options du bloc non déclarées, et aucun tirage lisible" };
  }

  let reference = null;
  let optionsVarient = false;
  const tirages = [];
  // Les jeux d'options DISTINCTS, dans leur ordre d'apparition. C'est à eux
  // que « la paire 2 » renvoie, pas au deuxième tirage : le corpus introduit
  // une paire, la fait entendre deux fois, puis introduit la suivante.
  const jeuxDistincts = [];
  let jeuPrecedent = null;

  for (const { rang, texte } of lignes) {
    const paire = tirageEnPaireMinimale(texte);
    const renvoi = renvoiVersUnJeuConnu(texte);

    let libelles;
    let indice;
    let graphieAudio;

    if (paire !== null) {
      ({ libelles, indiceCorrect: indice, graphieAudio } = paire);
    } else if (renvoi !== null) {
      libelles =
        renvoi.rangJeu === null
          ? jeuPrecedent
          : (jeuxDistincts[renvoi.rangJeu - 1] ?? null);
      if (libelles === null) {
        return {
          erreur: `tirage ${rang} : renvoie à un jeu d'options qui n'existe pas`,
        };
      }
      const trouve = reponseParmi(texte, libelles);
      if (trouve === null) {
        // Le garde-fou de tout ce chemin : la réponse écrite DOIT se
        // retrouver dans le jeu vers lequel le renvoi pointe. Si notre
        // lecture du renvoi était fausse, elle échoue ici au lieu de
        // compiler un corrigé faux, ce qui serait bien pire qu'un refus.
        return {
          erreur: `tirage ${rang} : réponse absente du jeu d'options auquel il renvoie`,
        };
      }
      indice = trouve;
      graphieAudio = texte.match(/\bAudio\s*:?\s*([ก-๿]+)/u)?.[1] ?? null;
      if (graphieAudio === null) {
        return {
          erreur: `tirage ${rang} : aucune graphie audio après le renvoi`,
        };
      }
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

    const empreinte = libelles.join("|");
    if (!jeuxDistincts.some((jeu) => jeu.join("|") === empreinte)) {
      jeuxDistincts.push(libelles);
    }
    jeuPrecedent = libelles;

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
