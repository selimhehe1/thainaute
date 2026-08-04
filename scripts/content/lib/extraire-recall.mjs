// Extraction déterministe des blocs d'exercice de mécanique « recall ».
//
// Pourquoi un module séparé
// -------------------------
// `extraire-exercices.mjs` traite `association` et `listening`, dont les
// tirages tiennent chacun sur UNE ligne et suivent un gabarit unique. Le
// rappel, lui, est la mécanique la plus bavarde du corpus : la clé de
// correction y est parfois une liste de variantes, parfois une règle de
// normalisation écrite en prose, parfois une tolérance déclarée dans la
// politique de saisie et jamais énumérée. Mesuré le 2026-08-04 sur les
// 65 leçons : 51 blocs `recall`, et une dizaine de façons différentes
// d'introduire la réponse.
//
// Ce module traite les motifs RÉGULIERS et refuse tout le reste en le
// nommant. Aucun modèle, aucune heuristique de proximité : uniquement des
// expressions régulières et du découpage de chaînes. Un exercice de rappel
// mal extrait ne se contente pas d'être moche, il compte FAUSSE une réponse
// que la leçon déclare juste. C'est la seule mécanique où une extraction
// approximative punit directement l'apprenant.
//
// Les six pièges du corpus, tous rencontrés pour de vrai
// ------------------------------------------------------
// 1. Le mot « réponse » apparaît DANS l'énoncé de certains tirages
//    (`u11-l11d` : « Cette réponse seule, pas ce qu'elle enchaîne ensuite. »).
//    Chercher le marqueur de clé sans masquer les citations coupe le tirage
//    au mauvais endroit. D'où `masquer()`.
// 2. Un tirage déborde sur les lignes suivantes, parfois jusqu'à la
//    COLONNE ZÉRO quand la coupure tombe à l'intérieur d'un span entre
//    accents graves (`u08-l8e`, `u11-l11a`, `u12-l12d`). Ne lire que la
//    première ligne perd des variantes, donc rétrécit la clé.
// 3. D'autres champs du bloc portent eux aussi des listes numérotées :
//    `u11-l11e` et `u12-l12d` numérotent leurs « planchers mesurés » 1., 2.,
//    3. Un balayage du corps entier les prendrait pour des tirages. La
//    lecture est donc bornée au seul champ « Tirages et réponses ».
// 4. Le nom du champ de politique porte parfois une incise avant les
//    deux-points (« Politique de saisie, écrite parce qu'elle décide ce qui
//    est mesuré : »). `champ()` de `parse-authoring.mjs` ne la reconnaît pas
//    et rend `undefined` ; ce module lit donc ses champs par lignes.
// 5. La politique déclare des tolérances (ton facultatif, point médian
//    facultatif, forme lexicale acceptée) dont les conséquences ne sont PAS
//    énumérées dans les tirages. Publier la liste énumérée comme clé serait
//    alors plus étroit que ce que la leçon promet à l'écran. Ces blocs sont
//    refusés.
// 6. Certains tirages ne portent aucune graphie thaïe (situation en français,
//    réponse en transcription). `resoudreItem` n'a alors rien à résoudre :
//    `itemId` vaut `null`, ce qui est un fait et non une approximation.

/** Bloc thaï de l'Unicode. Même classe que dans `extraire-exercices.mjs`. */
const THAI = /[฀-๿]+/gu;

/** Ligne numérotée « 1. ... » de la liste des tirages. */
const LIGNE_TIRAGE = /^\s*(\d+)\.\s+(.+?)\s*$/u;

/** Puce de premier niveau, non indentée : elle ferme le champ courant. */
const PUCE_NIVEAU_1 = /^[-*] /u;

/** Titre markdown : il ferme lui aussi le champ courant. */
const TITRE = /^#{1,6} /u;

/**
 * En-tête du champ portant les tirages.
 *
 * PIÈGE : `u10-l10e` porte AUSSI un champ « Tirage écarté et motif », et
 * `u03-l3d` un champ « Le tirage 6 est le seul endroit... ». L'en-tête exige
 * donc la forme complète « Tirages et réponses », ou « Questions », seule
 * autre variante relevée (`u01-l1d`).
 */
const ENTETE_TIRAGES = /^[-*] ?\*{0,2}(?:Tirages? et réponses|Questions)\b/u;

/** En-tête du champ de politique : « Politique de saisie », « Politique Unicode ». */
const ENTETE_POLITIQUE = /^[-*] ?\*{0,2}Politique\b/u;

/**
 * Découpe un champ à partir de son en-tête, jusqu'à la puce de premier
 * niveau suivante, au titre suivant, à la première ligne vide ou à la fin.
 *
 * La ligne vide est une butée : elle ferme une liste markdown, et le corpus
 * fait suivre certains blocs d'une prose sans puce (`u09-l9b`).
 */
function sectionDeChamp(corps, entete) {
  const lignes = corps.split("\n");
  const debut = lignes.findIndex((ligne) => entete.test(ligne));
  if (debut < 0) return null;
  const sortie = [lignes[debut]];
  for (let i = debut + 1; i < lignes.length; i += 1) {
    const ligne = lignes[i];
    if (PUCE_NIVEAU_1.test(ligne) || TITRE.test(ligne)) break;
    if (ligne.trim() === "") break;
    sortie.push(ligne);
  }
  return sortie;
}

/**
 * Lit le champ de politique en texte plat.
 *
 * On ne passe PAS par `champ()` : le corpus écrit « Politique de saisie,
 * écrite parce qu'elle décide ce qui est mesuré : » (`u08-l8d`, `u09-l9d`,
 * `u12-l12d`) et « Politique de saisie, reprise de `u08-l8e` exercice 3 et
 * resserrée par une règle simple : » (`u09-l9e`). Le qualificatif accepté par
 * `champ()` est une parenthèse, pas une incise à virgule, et ces politiques
 * seraient donc lues comme ABSENTES, c'est-à-dire remplacées par la politique
 * de repli, la plus permissive. Un champ de politique lu comme absent est
 * exactement le genre de silence qui fait publier une clé fausse.
 */
function texteDePolitique(corps) {
  const section = sectionDeChamp(corps, ENTETE_POLITIQUE);
  if (section === null) return null;
  return section.join(" ").replace(/\s+/gu, " ").trim();
}

/**
 * Rassemble les tirages, lignes de continuation comprises.
 *
 * Une ligne qui ne commence pas par « N. » et qui suit un tirage est une
 * continuation de ce tirage. Elle est recollée par une espace simple, ce qui
 * est exactement ce que fait le rendu markdown d'une coupure de ligne, y
 * compris à l'intérieur d'un span entre accents graves.
 */
function lignesDeTirage(corps) {
  const section = sectionDeChamp(corps, ENTETE_TIRAGES);
  if (section === null) return null;
  const brut = [];
  for (const ligne of section) {
    const trouve = ligne.match(LIGNE_TIRAGE);
    if (trouve !== null) {
      brut.push({ rang: Number(trouve[1]), morceaux: [trouve[2]] });
      continue;
    }
    // Avant le premier « N. », ce sont les lignes de présentation du champ
    // (« 8 au total, cinq portant sur le souffle initial... »). On les jette.
    if (brut.length === 0) continue;
    if (ligne.trim() === "") continue;
    brut[brut.length - 1].morceaux.push(ligne.trim());
  }
  return brut.map((tirage) => ({
    rang: tirage.rang,
    texte: tirage.morceaux.join(" ").replace(/\s+/gu, " ").trim(),
  }));
}

/** Caractère de remplissage du masque, absent du corpus. */
const REMPLISSAGE = "\u0001";

/**
 * Neutralise le contenu des citations « … » et des spans `…`, en conservant
 * la longueur exacte de la chaîne pour que les index restent utilisables sur
 * l'original. On remplace donc caractère par caractère au lieu de supprimer.
 *
 * PIÈGE qui a motivé cette fonction : `u11-l11d` écrit « นก répond qu'elle va
 * bien. Cette réponse seule, pas ce qu'elle enchaîne ensuite. » → `…`. Le mot
 * « réponse » y est dans l'ÉNONCÉ. Sans masque, la clé serait cherchée au
 * milieu de la phrase française et le corrigé thaï serait perdu.
 */
function masquer(texte) {
  let sortie = "";
  let citation = false;
  let code = false;
  for (let i = 0; i < texte.length; i += 1) {
    const caractere = texte[i];
    if (!code && caractere === "«") {
      citation = true;
      sortie += caractere;
      continue;
    }
    if (!code && caractere === "»") {
      citation = false;
      sortie += caractere;
      continue;
    }
    if (!citation && caractere === "`") {
      code = !code;
      sortie += caractere;
      continue;
    }
    sortie += citation || code ? REMPLISSAGE : caractere;
  }
  return sortie;
}

/**
 * Marqueurs de clé relevés sur le corpus, du plus spécifique au plus large :
 *  - « Réponse canonique : » (`u04-l4d`), qui annonce une clé donnée par une
 *    règle de normalisation et non par une liste ;
 *  - « : réponse », « . Réponse : », « Réponse : » ;
 *  - « → », employé par les unités 11 à 13.
 */
const MARQUEUR_CANONIQUE =
  /(?:\s*[:.]\s*|\s+)r[ée]ponses?\s+canoniques?\s*:?\s+/iu;
const MARQUEUR_REPONSE = /(?:\s*[:.]\s*|\s+)r[ée]ponses?\s*:?\s+/iu;
const MARQUEUR_FLECHE = /\s*→\s*/u;

function couperSurMarqueur(texte) {
  const masque = masquer(texte);
  const candidats = [];
  for (const [nom, motif] of [
    ["canonique", MARQUEUR_CANONIQUE],
    ["reponse", MARQUEUR_REPONSE],
    ["fleche", MARQUEUR_FLECHE],
  ]) {
    const trouve = masque.match(motif);
    if (trouve !== null) {
      candidats.push({
        nom,
        debut: trouve.index,
        fin: trouve.index + trouve[0].length,
      });
    }
  }
  if (candidats.length === 0) return null;
  // Le plus à gauche gagne ; à égalité, « canonique » l'emporte sur
  // « reponse », dont il partage le début.
  candidats.sort((a, b) => a.debut - b.debut || b.fin - a.fin);
  const retenu = candidats[0];
  return {
    nom: retenu.nom,
    stimulus: texte.slice(0, retenu.debut).trim(),
    cle: texte.slice(retenu.fin).trim(),
  };
}

/** Citation française, employée aussi bien pour un énoncé que pour un mot. */
const CITATION = /«([^»]*)»/gu;

/**
 * Graphies thaïes qui servent réellement de stimulus.
 *
 * PIÈGE : `u11-l11d` décrit ses tirages en français en NOMMANT les
 * personnages du dialogue en thaï (« ต้น demande à นก si elle a des frères et
 * sœurs. »). Ces deux graphies sont des noms propres dans une phrase
 * française, pas la cible du tirage : les résoudre en items serait un
 * contresens, et les compter ferait refuser un bloc par ailleurs régulier.
 *
 * Une citation n'apporte donc une graphie que si elle est ENTIÈREMENT thaïe,
 * ce qui est la forme des stimuli sonores (« Audio « แล้วคุณล่ะคะ » »). Hors
 * citation, tout le thaï compte : c'est le cas de l'annotation
 * « (ข้าว affiché) » de l'unité 1 et des mots présentés seuls (« บ้าน »).
 */
function graphiesDuStimulus(stimulus) {
  const utile = stimulus.replace(CITATION, (tout, contenu) =>
    TOUT_THAI.test(contenu.trim()) ? contenu : " ",
  );
  return [...utile.matchAll(THAI)].map((trouve) => trouve[0]);
}

/** Préfixe « Audio » d'un tirage à stimulus sonore. */
const PREFIXE_AUDIO = /^audio\s*:?\s*/iu;
/** Annotation « (ข้าว affiché) » de l'unité 1 : la graphie montrée à l'écran. */
const ANNOTATION_AFFICHEE = /\s*\([฀-๿][^)]*\s+affich[ée]e?\)\s*$/u;
/** Énoncé entièrement cité, sans rien avant ni après. */
const CITATION_SEULE = /^«\s*([^»]*?)\s*»$/u;

/**
 * Texte montré à l'apprenant.
 *
 * Trois formes régulières :
 *  - une citation seule → son contenu (« comprendre », « Vous entrez dans une
 *    boutique et vous saluez. Vous êtes un homme. ») ;
 *  - une citation suivie d'une précision qui DÉCIDE la réponse (« J'y vais. »,
 *    un homme répond) → la chaîne entière, guillemets compris. Amputer la
 *    précision rendrait le tirage insoluble, la particule finale dépendant
 *    d'elle ;
 *  - une graphie thaïe seule (`บ้าน`) → elle-même.
 *
 * LIMITE ASSUMÉE : la forme rendue ne dit pas si le stimulus est entendu ou
 * lu. Le marqueur « Audio » est retiré parce qu'il est de l'autorat et non du
 * produit, et la forme demandée pour cette mécanique n'a pas de champ où
 * consigner le canal. L'appelant doit lire la consigne du bloc, qui le dit
 * toujours (« Écoutez le mot... » contre « Lisez le mot... »).
 */
function inviteDuStimulus(stimulus) {
  const sansAudio = stimulus.replace(PREFIXE_AUDIO, "").trim();
  const sansAnnotation = sansAudio.replace(ANNOTATION_AFFICHEE, "").trim();
  const citee = sansAnnotation.match(CITATION_SEULE);
  return (citee?.[1] ?? sansAnnotation).trim();
}

/** Valeur entre accents graves : la notation majoritaire du corpus. */
const VALEUR_CODE = /^`([^`]+)`/u;
/** Valeur nue : l'unité 1 écrit ses réponses sans accents graves. */
const VALEUR_NUE = /^([\p{L}\p{M}\p{Nd}][\p{L}\p{M}\p{Nd}·'’-]*)/u;

function lireUneValeur(texte, style) {
  if (style !== "nue") {
    const code = texte.match(VALEUR_CODE);
    if (code !== null) {
      return {
        valeur: code[1].trim(),
        style: "code",
        reste: texte.slice(code[0].length),
      };
    }
  }
  if (style !== "code") {
    const nue = texte.match(VALEUR_NUE);
    if (nue !== null) {
      return {
        valeur: nue[1],
        style: "nue",
        reste: texte.slice(nue[0].length),
      };
    }
  }
  return null;
}

/** Introduction d'une liste de variantes. */
const ANNONCE_VARIANTES = /^[;,.]?\s*variantes?\s+accept[ée]e?s?\s*:?\s*/iu;
/** Séparateur à l'intérieur d'une liste de variantes. */
const SEPARATEUR_VARIANTE = /^(?:,\s*(?:et\s+)?|\s*et\s+)/u;

/**
 * Clauses que l'on peut ignorer sans rétrécir la clé, et pourquoi :
 *  - « Refusé : ... » n'ajoute rien à une liste FERMÉE, qui refuse déjà tout
 *    ce qui n'y figure pas. On vérifie tout de même qu'aucune valeur acceptée
 *    n'est citée dans la clause de refus : ce serait une contradiction du
 *    corpus, et il faut alors refuser le bloc plutôt que de choisir un camp ;
 *  - « Publié par `u05-l5c` item 7. » est une note de provenance.
 * Toute autre prose résiduelle fait refuser le tirage, en la citant.
 */
const CLAUSE_REFUS = /^\*{0,2}refus[ée]e?s?\*{0,2}\s*:\s*/iu;
const CLAUSE_PROVENANCE = /^(?:bloc\s+)?publi[ée]e?s?\s+(?:par|de|dans)\b/iu;
/**
 * Troisième forme de provenance, propre à `u13-l13d`, qui rappelle entre
 * parenthèses la graphie thaïe de la réponse et la leçon qui l'a publiée :
 * « → `phǒm` (ผม, `u02-l2d` item 1) », ou « (même item) » quand le tirage
 * précédent l'a déjà nommée. Elle ne dit rien de la clé.
 */
const CLAUSE_ITEM_SOURCE =
  /^\((?:[฀-๿][^)]*`u\d{2}-l\d{1,2}[a-z]`[^)]*|même item)\)\s*\.?$/u;

function extrait(texte) {
  const propre = texte.replace(/\s+/gu, " ").trim();
  return propre.length > 60 ? `${propre.slice(0, 57)}...` : propre;
}

function normaliserComparaison(valeur) {
  return valeur.normalize("NFC").toLowerCase().trim();
}

/**
 * Analyse la partie clé d'un tirage : réponse canonique, puis liste éventuelle
 * de variantes énumérées.
 *
 * Règle de style, et elle porte tout le reste : les variantes doivent employer
 * la MÊME notation que la réponse canonique. Sans elle, `u11-l11c` tirage 7,
 * « variantes acceptées avec `kâww` et avec points médians », ferait lire le
 * mot français « avec » comme une variante nue. Un corrigé contenant « avec »
 * serait publié, et l'apprenant invité à l'écrire.
 */
function lireCle(cle) {
  const premier = lireUneValeur(cle, null);
  if (premier === null) return { erreur: "réponse canonique illisible" };
  const valeurs = [premier.valeur];
  const style = premier.style;
  let reste = premier.reste.trim();

  const annonce = reste.match(ANNONCE_VARIANTES);
  if (annonce !== null) {
    reste = reste.slice(annonce[0].length);
    for (;;) {
      const suivante = lireUneValeur(reste, style);
      if (suivante === null) {
        return {
          erreur: `liste de variantes non énumérable : « ${extrait(reste)} »`,
        };
      }
      valeurs.push(suivante.valeur);
      reste = suivante.reste.trim();
      const separateur = reste.match(SEPARATEUR_VARIANTE);
      if (separateur === null) break;
      // « et » ne poursuit une énumération que s'il précède une valeur. Sans
      // ce contrôle, « et toute combinaison sans signes de ton » de `u06-l6d`
      // serait avalé comme s'il énumérait quelque chose.
      const apres = reste.slice(separateur[0].length);
      if (lireUneValeur(apres, style) === null) break;
      reste = apres;
    }
  }

  reste = reste.replace(/^\s*[.;]\s*/u, "").trim();
  if (reste === "") return { valeurs };

  const refus = reste.match(CLAUSE_REFUS);
  if (refus !== null) {
    const cites = [...reste.slice(refus[0].length).matchAll(/`([^`]+)`/gu)].map(
      (trouve) => normaliserComparaison(trouve[1]),
    );
    const collision = valeurs.find((valeur) =>
      cites.includes(normaliserComparaison(valeur)),
    );
    if (collision !== undefined) {
      return { erreur: `« ${collision} » est à la fois accepté et refusé` };
    }
    return { valeurs };
  }
  if (CLAUSE_PROVENANCE.test(reste)) return { valeurs };
  if (CLAUSE_ITEM_SOURCE.test(reste)) return { valeurs };

  return { erreur: `prose résiduelle après la clé : « ${extrait(reste)} »` };
}

/**
 * Genre d'une réponse.
 *
 * Les chiffres sont refusés explicitement : `u03-l3e` fait écrire un montant
 * en chiffres arabes (« réponse `30` »), ce qui n'est ni du thaï ni de la
 * transcription. La forme demandée n'a que ces deux genres, et en inventer un
 * troisième silencieusement serait un mensonge de type.
 */
const CHIFFRES_SEULS = /^\p{Nd}+$/u;
const TOUT_THAI = /^[฀-๿]+(?:[ ][฀-๿]+)*$/u;
const TOUT_TRANSCRIPTION = /^[\p{Script=Latin}\p{M}·'’ -]+$/u;
const AU_MOINS_UNE_LETTRE = /\p{Script=Latin}/u;

function genreDeValeur(valeur) {
  if (CHIFFRES_SEULS.test(valeur)) return null;
  if (TOUT_THAI.test(valeur)) return "thai";
  if (TOUT_TRANSCRIPTION.test(valeur) && AU_MOINS_UNE_LETTRE.test(valeur)) {
    return "transcription";
  }
  return null;
}

/**
 * Retire les seuls diacritiques que la convention Thaïnaute emploie pour le
 * ton : grave, aigu, circonflexe, caron. Passer par NFD puis NFC évite de
 * dépendre de la forme précomposée choisie par l'auteur.
 */
const COMBINANTS_DE_TON = /[\u0300\u0301\u0302\u030C]/gu;

function sansAccentsDeTon(valeur) {
  return valeur
    .normalize("NFD")
    .replace(COMBINANTS_DE_TON, "")
    .normalize("NFC");
}

// --- Lecture de la politique de saisie -------------------------------------

const POL_ROGNE = /espaces?\s+de\s+d[ée]but\s+et\s+de\s+fin[^.;]{0,60}ignor/iu;
const POL_REDUIT =
  /espaces?[^.;]{0,80}(?:r[ée]duite?s?\b|ramen[ée]e?s?\b|[ée]quivaut\b)/iu;
const POL_TON_OBLIGATOIRE =
  /(?:signes?|accents?)\s+de\s+ton[^.]{0,90}obligatoire/iu;
const POL_TON_FACULTATIF =
  /(?:signes?|accents?)\s+de\s+ton[^.]{0,90}facultati/iu;
const POL_EXCEPTION = /\bSAUF\b|\bexception\b/u;

/**
 * Proposition de la politique qui décide du sort du séparateur de syllabes.
 * Bornée par le point et le point-virgule : `u10-l10c` enchaîne « le
 * séparateur `·` est facultatif partout ; l'espace entre le nombre et บาท au
 * tirage 8 est en revanche exigé », et lire les deux propositions ensemble
 * ferait croire à une équivalence entre le point médian et l'espace.
 */
const PHRASE_SEPARATEUR = /(?:point\s+m[ée]dian|s[ée]parateur)[^.;]{0,200}/iu;
const SEP_EXIGE = /exig|obligatoire/iu;
const SEP_OMISSION = /facultati|omis|absence/iu;
/**
 * L'espace n'est une tolérance que si la phrase la donne comme SUBSTITUT du
 * séparateur. PIÈGE : `u11-l11d` écrit « Le point médian `·` sépare les
 * syllabes d'un même mot polysyllabique et l'espace sépare les mots », qui
 * dit exactement le contraire d'une équivalence. Chercher le seul mot
 * « espace » y voyait une tolérance et faisait refuser un bloc régulier.
 */
const SEP_ESPACE = /espace/iu;
const SEP_SUBSTITUTION =
  /[ée]quivalen|à sa place|remplac|accept|indiff[ée]rem/iu;
const SEP_TOLERANCE_VAGUE = /accept|remplac|[ée]quivalen/iu;

/**
 * Forme entre accents graves que la politique déclare elle-même acceptée,
 * dans la même proposition. `[^.;]` borne la fenêtre à la proposition en
 * cours : sans cela, « leur absence est acceptée avec un rappel, jamais avec
 * une pénalité ; les graphèmes eux-mêmes, `io`... » de `u04-l4b` serait lu
 * comme « `io` est accepté », soit le contraire de ce qui est écrit.
 */
const POL_FORME_ACCEPTEE = [
  /accept[ée]e?s?[^.;]{0,40}?`([^`]+)`/giu,
  /`([^`]+)`[^.;]{0,40}?(?:est|sont)\s+accept[ée]e?s?/giu,
];

/**
 * Politique de repli, employée quand le bloc ne porte aucun champ
 * « Politique ». DIT ICI ET NON DEVINÉ AILLEURS : normalisation NFC, espaces
 * de bordure rognés, espaces internes multiples réduits à un. C'est ce que
 * déclarent la quasi-totalité des politiques écrites du corpus, mais ce n'est
 * pas une lecture du bloc : c'est une valeur de repli, et l'appelant doit la
 * traiter comme telle.
 */
const POLITIQUE_PAR_DEFAUT = {
  normalisation: "nfc",
  rognerEspaces: true,
  reduireEspaces: true,
};

function lirePolitique(texte) {
  if (texte === null) return { ...POLITIQUE_PAR_DEFAUT };
  return {
    normalisation: "nfc",
    rognerEspaces: POL_ROGNE.test(texte),
    reduireEspaces: POL_REDUIT.test(texte),
  };
}

/**
 * Contrôle de fermeture de la clé.
 *
 * Une clé est publiable si l'ensemble des réponses acceptées est ÉNUMÉRÉ. Or
 * la politique déclare parfois des tolérances dont les conséquences ne sont
 * pas dans la liste. Trois cas, tous relevés sur le corpus :
 *
 *  - ton facultatif : `u07-l7c` accepte `tawwn·chaao` par sa politique mais
 *    n'énumère que `tawwn chaao` ;
 *  - séparateur facultatif : `u03-l3b` accepte « `·`, `-` ou l'espace, et son
 *    absence », mais n'énumère que trois des combinaisons ;
 *  - forme lexicale tolérée : `u12-l12d` accepte `kâww` partout où `kâw` est
 *    attendu, sans l'écrire dans aucun corrigé.
 *
 * Dans ces cas, publier la liste énumérée serait publier une clé PLUS ÉTROITE
 * que la promesse affichée à l'apprenant, donc compter fausses des réponses
 * que la leçon déclare justes. On refuse.
 */
function verifierFermeture(politique, tirages) {
  if (politique === null) return null;

  const toutesValeurs = new Set(
    tirages.flatMap((tirage) => tirage.valeurs.map(normaliserComparaison)),
  );

  for (const motif of POL_FORME_ACCEPTEE) {
    motif.lastIndex = 0;
    for (const trouve of politique.matchAll(motif)) {
      const forme = normaliserComparaison(trouve[1]);
      // Les mentions de ponctuation nue (« `·` », « `.` ») ne sont pas des
      // formes de réponse : elles décrivent une tolérance de séparateur, que
      // le contrôle suivant traite pour ce qu'elle est.
      if (!AU_MOINS_UNE_LETTRE.test(forme)) continue;
      if (!toutesValeurs.has(forme)) {
        return `la politique accepte « ${trouve[1]} », qu'aucun corrigé n'énumère`;
      }
    }
  }

  const tonFacultatif =
    POL_TON_FACULTATIF.test(politique) && !POL_TON_OBLIGATOIRE.test(politique);
  if (tonFacultatif && POL_EXCEPTION.test(politique)) {
    // « facultatifs sur tous les mots SAUF sur la particule finale » : la
    // tolérance devient conditionnelle mot par mot, donc non calculable sans
    // savoir découper la réponse en mots ET connaître leur rôle. Refus.
    return "tolérance de ton conditionnelle (clause d'exception), non énumérable";
  }

  // Sort du séparateur de syllabes. Les formes que la politique déclare
  // équivalentes doivent toutes être énumérées, sinon la clé publiée est plus
  // étroite que la promesse. Quand la politique déclare une tolérance sans
  // dire laquelle, on refuse au lieu de choisir à sa place.
  const phrase = politique.match(PHRASE_SEPARATEUR)?.[0] ?? null;
  const separateurExige = phrase !== null && SEP_EXIGE.test(phrase);
  const omissionToleree =
    phrase !== null && !separateurExige && SEP_OMISSION.test(phrase);
  const espaceToleree =
    phrase !== null &&
    !separateurExige &&
    SEP_ESPACE.test(phrase) &&
    SEP_SUBSTITUTION.test(phrase);
  const toleranceVague =
    phrase !== null &&
    !separateurExige &&
    !omissionToleree &&
    !espaceToleree &&
    SEP_TOLERANCE_VAGUE.test(phrase);

  for (const tirage of tirages) {
    const acceptees = new Set(tirage.valeurs.map(normaliserComparaison));
    const canonique = tirage.valeurs[0];
    if (tonFacultatif) {
      const sansTon = sansAccentsDeTon(canonique);
      if (
        sansTon !== canonique &&
        !acceptees.has(normaliserComparaison(sansTon))
      ) {
        return `tirage ${tirage.rang} : ton déclaré facultatif, « ${sansTon} » non énuméré`;
      }
    }
    if (!canonique.includes("·")) continue;
    if (toleranceVague) {
      return `tirage ${tirage.rang} : tolérance de séparateur déclarée sans dire quelles formes elle couvre`;
    }
    if (omissionToleree) {
      const sansSeparateur = canonique.replaceAll("·", "");
      if (!acceptees.has(normaliserComparaison(sansSeparateur))) {
        return `tirage ${tirage.rang} : séparateur déclaré omissible, « ${sansSeparateur} » non énuméré`;
      }
    }
    if (espaceToleree) {
      const avecEspace = canonique.replaceAll("·", " ");
      if (!acceptees.has(normaliserComparaison(avecEspace))) {
        return `tirage ${tirage.rang} : espace déclarée équivalente au séparateur, « ${avecEspace} » non énumérée`;
      }
    }
  }
  return null;
}

/**
 * Analyse un bloc de mécanique `recall`.
 *
 * Rend soit `{ erreur }` en nommant précisément le motif du refus, soit
 * `{ tirages, politique }`.
 *
 * `itemId` vaut `null` quand le tirage ne porte aucune graphie thaïe, ce qui
 * est le cas de la majorité des rappels de production (situation en français,
 * réponse en transcription). Deux graphies ou plus font refuser le tirage :
 * la cible serait ambiguë, et `u03-l3d` (« ปลา สอง … (deux poissons) ») comme
 * `u08-l8b` (« ผม ___ ไปตลาดครับ ») montrent que le corpus s'en sert pour des
 * phrases à trou, qui ne sont pas la même mécanique.
 */
export function extraireRecall(bloc, resoudreItem) {
  if (bloc.mecanique !== "recall") {
    return { erreur: `mécanique « ${bloc.mecanique} » au lieu de « recall »` };
  }

  const lignes = lignesDeTirage(bloc.corps);
  if (lignes === null)
    return { erreur: "champ « Tirages et réponses » absent" };
  if (lignes.length === 0)
    return { erreur: "aucun tirage numéroté dans le champ" };

  const analyses = [];
  for (const { rang, texte } of lignes) {
    const coupe = couperSurMarqueur(texte);
    if (coupe === null) {
      return { erreur: `tirage ${rang} : aucun marqueur de réponse reconnu` };
    }
    if (coupe.nom === "canonique") {
      // `u04-l4d` : « Réponse canonique : `mâi phèt` ; forme normalisée de
      // référence `maiphet`. Exemples de saisies acceptées : ... ». Le bloc
      // écrit lui-même que les formes citées « ne sont que des exemples,
      // jamais la clé » : la clé y est une règle de normalisation, que la
      // forme demandée ici ne sait pas porter.
      return {
        erreur: `tirage ${rang} : clé donnée par une règle de normalisation, pas par une liste`,
      };
    }
    if (coupe.stimulus === "") {
      return { erreur: `tirage ${rang} : énoncé vide devant la réponse` };
    }

    const graphies = graphiesDuStimulus(coupe.stimulus);
    if (graphies.length > 1) {
      return {
        erreur: `tirage ${rang} : ${graphies.length} graphies thaïes dans l'énoncé`,
      };
    }

    const cle = lireCle(coupe.cle);
    if (cle.erreur !== undefined)
      return { erreur: `tirage ${rang} : ${cle.erreur}` };

    const genres = cle.valeurs.map(genreDeValeur);
    const illisible = genres.indexOf(null);
    if (illisible >= 0) {
      return {
        erreur: `tirage ${rang} : « ${cle.valeurs[illisible]} » n'est ni du thaï ni de la transcription`,
      };
    }
    if (new Set(genres).size !== 1) {
      return { erreur: `tirage ${rang} : réponses de genres mélangés` };
    }

    let itemId = null;
    if (graphies.length === 1) {
      itemId = resoudreItem(graphies[0]);
      if (itemId === null) {
        return {
          erreur: `tirage ${rang} : item introuvable pour ${graphies[0]}`,
        };
      }
    }

    const invite = inviteDuStimulus(coupe.stimulus);
    if (invite === "")
      return { erreur: `tirage ${rang} : énoncé vide après nettoyage` };
    if (invite.length > 300) {
      return { erreur: `tirage ${rang} : énoncé de plus de 300 signes` };
    }

    analyses.push({
      rang,
      itemId,
      invite,
      valeurs: cle.valeurs,
      genre: genres[0],
    });
  }

  // Les rangs doivent former 1..n sans trou ni doublon. Un trou signalerait
  // une ligne de continuation prise pour un tirage, ou l'inverse.
  if (analyses.some((analyse, index) => analyse.rang !== index + 1)) {
    return { erreur: "les rangs des tirages ne forment pas une suite 1..n" };
  }

  const politique = texteDePolitique(bloc.corps);
  const defaut = verifierFermeture(politique, analyses);
  if (defaut !== null) return { erreur: defaut };

  return {
    tirages: analyses.map((analyse) => ({
      rang: analyse.rang,
      itemId: analyse.itemId,
      invite: analyse.invite,
      reponses: analyse.valeurs.map((valeur) => ({
        valeur,
        genre: analyse.genre,
      })),
    })),
    politique: lirePolitique(politique),
  };
}
