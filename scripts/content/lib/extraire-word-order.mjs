// Extraction déterministe des blocs d'exercice « word_order ».
//
// Pourquoi un module séparé
// -------------------------
// `extraire-exercices.mjs` traite `association` et `listening`, dont le
// corpus décrit chaque tirage sur une ligne d'un seul modèle. `word_order`
// est d'un autre ordre de désordre. Relevé sur les 65 leçons le
// 2026-08-04 : 49 blocs, deux familles de mise en page incompatibles,
// six façons de séparer les jetons, quatre façons d'annoncer la réponse et
// des intrus tantôt listés, tantôt déclarés en prose. Mélanger tout cela
// dans le module existant rendrait les deux illisibles.
//
// Philosophie identique, et non négociable : aucun modèle, aucune
// approximation. Ce module traite les motifs réguliers et REFUSE le reste
// en NOMMANT le motif du refus. Un tirage mal extrait enseignerait un
// ordre de mots faux, c'est-à-dire exactement la faute que cette mécanique
// est censée corriger. Mieux vaut refuser dix blocs qu'en approcher un.
//
// Principe central de l'extraction
// --------------------------------
// On ne fait jamais confiance à l'ordre d'écriture des jetons, ni à une
// segmentation devinée de la réponse. On lit deux choses indépendantes,
// le VIVIER de jetons et la RÉPONSE, puis on cherche par quelle suite de
// jetons la réponse se reconstitue exactement. Si aucune ne convient, on
// refuse. Si plusieurs conviennent, on refuse aussi : une reconstitution
// ambiguë publierait un corrigé au hasard.

/**
 * Bloc thaï de l'Unicode. Même classe que `extraire-exercices.mjs`, et
 * elle contient déjà les chiffres thaïs ๐-๙, employés par l'unité 10, ainsi
 * que ๆ (mai yamok).
 */
const THAI = "฀-๿";
/** Une suite thaïe, éventuellement prolongée par un ๆ détaché (ช้า ๆ). */
const SUITE_THAIE = `[${THAI}]+(?:\\s+ๆ)*`;

/**
 * Réponse écrite : une suite de thaï et d'espaces. La butée est le premier
 * caractère qui n'est ni thaï ni espace, ce qui suffit à couper toutes les
 * queues de phrase observées : « ป่า ปา (le ton bas d'abord… », « ขอ …
 * ครับ, l'élément ค่ะ devant être retiré. », « ไม่ไปค่ะ. **Tirage de
 * contrôle** … ».
 */
const REPONSE_ECRITE = `([${THAI}][${THAI}\\s]*)`;

// ---------------------------------------------------------------------
// 1. Repérage du vivier de jetons
// ---------------------------------------------------------------------

/**
 * Les mots par lesquels le corpus introduit un vivier. Ils sont tous
 * relevés sur les 49 blocs, aucun n'est supposé : blocs, bloc, tuiles,
 * tuile, jetons, jeton, cartes, étiquettes, éléments.
 */
const MOTS_VIVIER =
  "(?:blocs?|tuiles?|jetons?|cartes?|étiquettes?|etiquettes?|éléments?|elements?)";

/**
 * L'ancre saute la qualification qui suit le mot (« proposés », « fournis
 * et en désordre », « (ordre mélangé) : ») jusqu'au premier jeton.
 *
 * PIÈGE : ce saut ne doit JAMAIS franchir une fin de phrase. Sans les
 * butées `.`, `;`, `→` et les guillemets, « Deux blocs à retirer, et la
 * ligne demandée ne commence pas par ข้าวผัด » (10C) serait lu comme un
 * vivier d'un jeton, et « jeton à retirer ขอ » (9C) comme un second
 * vivier. Quarante caractères suffisent à la plus longue qualification
 * observée, « proposés, dans un ordre mélangé : » (33).
 *
 * PIÈGE : `\b` ne convient pas devant « étiquettes », dont la première
 * lettre n'est pas un caractère de mot au sens de JavaScript. D'où le
 * regard arrière explicite.
 */
const ANCRE_VIVIER = new RegExp(
  `(?<![a-zà-öø-ÿ])${MOTS_VIVIER}[^${THAI}\\n.;→«»]{0,40}?(?=[${THAI}[\`])`,
  "giu",
);

/** Jeton entre crochets : [สบายดี], la forme des unités 1 à 5 et 11 à 13. */
const JETON_CROCHET = new RegExp(
  `^\\[\\s*([${THAI}][${THAI}\\s]*?)\\s*\\]`,
  "u",
);
/** Jeton entre accents graves : `แปด`, la forme des leçons 10D et 10E. */
const JETON_ACCENT = new RegExp(`^\`\\s*([${THAI}][${THAI}\\s]*?)\\s*\``, "u");
/** Jeton nu, éventuellement suivi d'une annotation entre parenthèses. */
const JETON_NU = new RegExp(`^(${SUITE_THAIE})\\s*(?:\\(([^)]*)\\))?`, "u");

/**
 * Séparateurs de liste nue, dans l'ordre d'essai. Ils sont disjoints, donc
 * cet ordre ne change rien ; il est fixé pour que le module reste
 * reproductible.
 *
 * PIÈGE : le séparateur est VERROUILLÉ sur le premier rencontré. Sans ce
 * verrou, « blocs fournis : ครับ · แพง · เกินไป · อันนี้ ; réponse … »
 * (8C) verrait le `;` de fin de proposition comme un séparateur et
 * avalerait la réponse dans le vivier.
 */
const SEPARATEURS_NUS = [
  { nom: "·", re: /^\s*·\s*/u },
  { nom: "/", re: /^\s*\/\s*/u },
  { nom: ",", re: /^,\s+/u },
  { nom: ";", re: /^\s*;\s*/u },
];

/**
 * Une annotation entre parenthèses ne devient une transcription que si
 * elle en a la forme : un seul mot latin, sans espace. Cela retient
 * « (pàa) » et le premier segment de « (pòuu, intrus non entendu) », et
 * écarte « (en trop) », « (un homme parle) », « (Je veux aller au marché,
 * dit par un homme) ». Toutes ces formes sont attestées dans le corpus.
 */
const TRANSCRIPTION = /^[a-zà-öø-ÿ][a-zà-öø-ÿ0-9'’·ˈ-]*$/iu;

function transcriptionDeLAnnotation(annotation) {
  if (annotation === undefined) return null;
  const premierSegment = annotation.split(",")[0].trim();
  if (premierSegment.length < 2) return null;
  return TRANSCRIPTION.test(premierSegment) ? premierSegment : null;
}

/**
 * Lit une liste de jetons à partir de `depart`. Rend la liste et l'indice
 * de fin, ou `null` si aucun jeton ne commence là.
 *
 * Les trois formes sont exclusives et se reconnaissent au premier
 * caractère : crochet, accent grave, ou thaï nu. La liste s'arrête dès
 * qu'un couple « séparateur puis jeton » ne se présente plus, et rien
 * n'est consommé dans ce cas : le texte qui suit reste disponible pour la
 * lecture de la réponse.
 */
function lireListeJetons(texte, depart) {
  const reste = () => texte.slice(position);
  let position = depart;

  const premier = texte[depart];
  const forme = premier === "[" ? "crochet" : premier === "`" ? "accent" : "nu";
  const modele =
    forme === "crochet"
      ? JETON_CROCHET
      : forme === "accent"
        ? JETON_ACCENT
        : JETON_NU;

  const lireJeton = () => {
    const trouve = reste().match(modele);
    if (trouve === null) return null;
    position += trouve[0].length;
    return {
      thai: trouve[1].replace(/\s+/gu, " ").trim(),
      transcription:
        forme === "nu" ? transcriptionDeLAnnotation(trouve[2]) : null,
    };
  };

  const premierJeton = lireJeton();
  if (premierJeton === null) return null;
  const jetons = [premierJeton];

  // Les formes délimitées se suivent par une simple espace ; la forme nue
  // impose de découvrir puis de verrouiller son séparateur.
  let separateur =
    forme === "crochet"
      ? { nom: "espace", re: /^\s+(?=\[)/u }
      : forme === "accent"
        ? { nom: "espace", re: /^\s+(?=`)/u }
        : null;

  for (;;) {
    if (separateur === null) {
      let trouve = null;
      for (const candidat of SEPARATEURS_NUS) {
        const saut = reste().match(candidat.re);
        if (saut === null) continue;
        if (!modele.test(reste().slice(saut[0].length))) continue;
        trouve = candidat;
        break;
      }
      if (trouve === null) break;
      separateur = trouve;
    }
    const saut = reste().match(separateur.re);
    if (saut === null) break;
    const apres = position + saut[0].length;
    if (!modele.test(texte.slice(apres))) break;
    position = apres;
    const jeton = lireJeton();
    if (jeton === null) break;
    jetons.push(jeton);
  }

  return { jetons, fin: position };
}

/**
 * Intrus déclaré en queue de liste plutôt que dans la liste : « Blocs :
 * ผม · มี · … · ครับ, plus แต่ en trop. » (11C, huit tirages sur huit).
 *
 * Cette forme est ajoutée au vivier parce qu'elle DIT que le jeton en est
 * un, ce qui n'est pas une devinette. Sans elle, ces tirages perdraient
 * silencieusement leur distracteur et deviendraient un autre exercice.
 */
const INTRUS_EN_QUEUE = new RegExp(`plus\\s+(${SUITE_THAIE})\\s+en trop`, "gu");

// ---------------------------------------------------------------------
// 2. Repérage de la réponse
// ---------------------------------------------------------------------

/**
 * Trois ancres, essayées dans cet ordre, qui n'est pas indifférent.
 *
 * PIÈGE : « Réponse » passe avant « → ». En 10D le tirage s'écrit
 * « ๐๘.๓๐ น. → jetons `แปด` … . Réponse : แปด นาฬิกา … », où la flèche
 * introduit le VIVIER et non la réponse.
 *
 * PIÈGE : « Cible » passe en dernier. En 10B et 3B la cible est
 * française ou chiffrée (« Cible 30. »), et c'est « Réponse » qui porte le
 * thaï. En 8B, 7C, 5D, 4C, 11C et 6C, à l'inverse, la cible EST la
 * réponse et rien d'autre ne la donne.
 */
const ANCRES_REPONSE = [
  new RegExp(`[Rr]éponses?\\s*(?:correctes?\\s*)?:?\\s*${REPONSE_ECRITE}`, "u"),
  new RegExp(`→\\s*${REPONSE_ECRITE}`, "u"),
  new RegExp(
    `[Cc]ibles?\\s*(?:française\\s*)?:?\\s*(?:«[^»]*»\\s*[,.]?\\s*)?${REPONSE_ECRITE}`,
    "u",
  ),
];

function lireReponse(texte) {
  for (const ancre of ANCRES_REPONSE) {
    const trouve = texte.match(ancre);
    if (trouve === null) continue;
    const brute = trouve[1].replace(/\s+/gu, " ").trim();
    if (brute.length > 0) return brute;
  }
  return null;
}

// ---------------------------------------------------------------------
// 3. Reconstitution de la réponse à partir du vivier
// ---------------------------------------------------------------------

/** Forme comparable : NFC, sans aucune espace. */
function compacter(graphie) {
  return graphie.normalize("NFC").replace(/\s+/gu, "");
}

/**
 * Cherche par quelles valeurs de jetons, et dans quel ordre, la réponse se
 * reconstitue exactement. On raisonne sur les VALEURS et non sur les
 * indices : trois ครับ dans un même tirage (12D) donneraient sinon six
 * solutions qui sont la même.
 *
 * Rend `[]` si aucune suite ne convient, une liste de deux éléments dès
 * que l'ambiguïté est prouvée, sinon la solution unique.
 */
function reconstituer(valeurs, compte, cible) {
  const solutions = [];
  const restant = new Map(compte);
  const chemin = [];

  const explorer = (position) => {
    if (solutions.length >= 2) return;
    if (position === cible.length) {
      solutions.push([...chemin]);
      return;
    }
    for (const valeur of valeurs) {
      const disponible = restant.get(valeur) ?? 0;
      if (disponible === 0) continue;
      if (!cible.startsWith(valeur, position)) continue;
      restant.set(valeur, disponible - 1);
      chemin.push(valeur);
      explorer(position + valeur.length);
      chemin.pop();
      restant.set(valeur, disponible);
      if (solutions.length >= 2) return;
    }
  };

  explorer(0);
  return solutions;
}

/** Traduit une suite de valeurs en indices de jetons, sans réemploi. */
function indicesDesValeurs(jetonsCompacts, suite) {
  const pris = new Set();
  const indices = [];
  for (const valeur of suite) {
    const indice = jetonsCompacts.findIndex(
      (compact, rang) => compact === valeur && !pris.has(rang),
    );
    if (indice < 0) return null;
    pris.add(indice);
    indices.push(indice);
  }
  return indices;
}

// ---------------------------------------------------------------------
// 4. Garde-fous sur les intrus et sur le nombre de jetons
// ---------------------------------------------------------------------

/**
 * Le corpus déclare presque toujours s'il reste des jetons à écarter.
 * Comparer cette déclaration au nombre de jetons inutilisés attrape les
 * viviers mal lus sans avoir à interpréter la prose.
 */
const AUCUN_INTRUS =
  /aucun[e]?\s+(?:[a-zà-öø-ÿ']+\s+){0,3}?(?:en trop|à retirer|n'est à retirer)/iu;
const INTRUS_DECLARE = /en trop|à retirer|retiré|retirée|retirés|retirées/iu;

function intrusAttendus(texte) {
  if (AUCUN_INTRUS.test(texte)) return "aucun";
  if (INTRUS_DECLARE.test(texte)) return "auMoinsUn";
  return null;
}

/**
 * Nombre de tuiles annoncé en toutes lettres : « Cinq tuiles », « quatre
 * jetons seulement ».
 *
 * Ce compte ne sert QUE dans le repli 11D, où la réponse n'est pas écrite
 * séparément et où il est donc la seule vérification disponible. Il a
 * d'abord été appliqué à tous les tirages, et la mesure a montré que cette
 * généralisation était fausse : « Les deux blocs utiles sont des items
 * publiés » (10B tirage 4) n'annonce pas un vivier de deux tuiles, et le
 * tirage était refusé à tort. Partout ailleurs, la reconstitution de la
 * réponse vérifie déjà le vivier, et mieux.
 *
 * PIÈGE conservé : « Deux blocs à retirer » (10C) est un compte d'INTRUS.
 */
const NOMBRES_FR = new Map([
  ["deux", 2],
  ["trois", 3],
  ["quatre", 4],
  ["cinq", 5],
  ["six", 6],
  ["sept", 7],
  ["huit", 8],
  ["neuf", 9],
]);
const COMPTE_ANNONCE =
  /\b(deux|trois|quatre|cinq|six|sept|huit|neuf)\s+(?:tuiles|jetons|blocs|cartes|étiquettes|éléments)\b(?!\s+(?:à retirer|en trop))/iu;

function compteAnnonce(texte) {
  const trouve = texte.match(COMPTE_ANNONCE);
  if (trouve === null) return null;
  return NOMBRES_FR.get(trouve[1].toLowerCase()) ?? null;
}

// ---------------------------------------------------------------------
// 5. Lecture d'un tirage complet
// ---------------------------------------------------------------------

/** Liste de jetons introduite par la flèche, sans mot de vivier (11D). */
const FLECHE = /→/u;

function viviersDuTexte(texte) {
  const viviers = [];
  ANCRE_VIVIER.lastIndex = 0;
  for (const ancre of texte.matchAll(ANCRE_VIVIER)) {
    const lu = lireListeJetons(texte, ancre.index + ancre[0].length);
    if (lu === null || lu.jetons.length < 2) continue;
    viviers.push(lu);
  }
  return viviers;
}

/**
 * Analyse le texte d'un tirage et rend `{ jetons, ordreCorrect, reponse }`
 * ou `{ erreur }`. La réponse brute est remontée parce qu'elle sert
 * ensuite à retrouver l'item, et qu'elle est la seule graphie que le
 * corpus donne telle que publiée.
 */
function lireTirage(texte) {
  const viviers = viviersDuTexte(texte);
  if (viviers.length > 1) {
    return { erreur: `${viviers.length} viviers de jetons déclarés` };
  }

  if (viviers.length === 0) {
    // Repli 11D : « « … ? » → สวัสดีครับ · วันนี้ · … . Cinq tuiles. »
    // La flèche donne les tuiles DANS L'ORDRE de la réponse. On ne
    // l'accepte qu'avec le compte annoncé, seule vérification disponible
    // faute d'une réponse écrite séparément.
    const fleche = texte.match(FLECHE);
    if (fleche === null) return { erreur: "vivier de jetons non déclaré" };
    const lu = lireListeJetons(texte, fleche.index + fleche[0].length + 1);
    if (lu === null || lu.jetons.length < 2) {
      return { erreur: "vivier de jetons non déclaré" };
    }
    const annonce = compteAnnonce(texte);
    if (annonce === null) {
      return { erreur: "vivier donné en ordre de réponse sans compte annoncé" };
    }
    if (annonce !== lu.jetons.length) {
      return {
        erreur: `${lu.jetons.length} jetons lus contre ${annonce} annoncés`,
      };
    }
    if (intrusAttendus(texte) === "auMoinsUn") {
      return { erreur: "intrus déclaré dans un vivier donné en ordre" };
    }
    return {
      jetons: lu.jetons,
      ordreCorrect: lu.jetons.map((_, rang) => rang),
      reponse: lu.jetons.map((jeton) => jeton.thai).join(" "),
    };
  }

  const jetons = [...viviers[0].jetons];
  // Un intrus peut être déclaré après la liste plutôt que dedans.
  INTRUS_EN_QUEUE.lastIndex = 0;
  for (const trouve of texte.matchAll(INTRUS_EN_QUEUE)) {
    const thai = trouve[1].replace(/\s+/gu, " ").trim();
    const compact = compacter(thai);
    if (jetons.some((jeton) => compacter(jeton.thai) === compact)) continue;
    jetons.push({ thai, transcription: null });
  }

  const reponse = lireReponse(texte);
  if (reponse === null) return { erreur: "réponse non déclarée" };

  const cible = compacter(reponse);
  const jetonsCompacts = jetons.map((jeton) => compacter(jeton.thai));
  const compte = new Map();
  for (const compact of jetonsCompacts) {
    compte.set(compact, (compte.get(compact) ?? 0) + 1);
  }
  const valeurs = [...compte.keys()];

  const solutions = reconstituer(valeurs, compte, cible);
  if (solutions.length === 0) {
    return { erreur: `réponse « ${reponse} » non reconstituable` };
  }
  if (solutions.length > 1) {
    return { erreur: `réponse « ${reponse} » reconstituable de deux façons` };
  }

  const ordreCorrect = indicesDesValeurs(jetonsCompacts, solutions[0]);
  if (ordreCorrect === null) {
    return { erreur: `réponse « ${reponse} » non rattachable aux jetons` };
  }
  if (ordreCorrect.length < 2) return { erreur: "réponse d'un seul jeton" };

  const inutilises = jetons.length - ordreCorrect.length;
  const attendus = intrusAttendus(texte);
  if (attendus === "aucun" && inutilises > 0) {
    return { erreur: `${inutilises} jetons inutilisés alors qu'aucun intrus` };
  }
  if (attendus === "auMoinsUn" && inutilises === 0) {
    return { erreur: "intrus déclaré mais absent du vivier lu" };
  }

  return { jetons, ordreCorrect, reponse };
}

// ---------------------------------------------------------------------
// 6. Découpage du bloc en tirages, deux familles
// ---------------------------------------------------------------------

/**
 * Famille « lignes numérotées » : 33 blocs, unités 3 à 13.
 *
 * PIÈGE MESURÉ : les lignes numérotées ne sont pas toutes des tirages. Le
 * champ « Planchers mesurés » de 12D, 11D et 11E porte lui aussi une liste
 * numérotée, de prose statistique. La lecture est donc bornée au champ des
 * tirages, seul nom sous lequel le corpus les range : « Tirages »,
 * « Tirages et réponses », « Assemblages ».
 *
 * PIÈGE MESURÉ : un tirage se poursuit sur les lignes suivantes plus
 * indentées, sans quoi 13B perdrait la fin de ses tirages 5 et 6 et 12D la
 * moitié de ses viviers.
 */
const CHAMP_TIRAGES = /^[-*] \*{0,2}(?:Tirages|Assemblages)\b/u;
const AUTRE_CHAMP = /^[-*] /u;
const LIGNE_NUMEROTEE = /^\s{2,}(\d+)\.\s+(.*)$/u;

function tiragesNumerotes(corps) {
  const sortie = [];
  let dedans = false;
  let courant = null;
  const fermer = () => {
    if (courant !== null) sortie.push(courant);
    courant = null;
  };
  for (const ligne of corps.split("\n")) {
    if (AUTRE_CHAMP.test(ligne)) {
      fermer();
      dedans = CHAMP_TIRAGES.test(ligne);
      continue;
    }
    if (!dedans) continue;
    const debut = ligne.match(LIGNE_NUMEROTEE);
    if (debut !== null) {
      fermer();
      courant = { rang: Number(debut[1]), texte: debut[2] };
      continue;
    }
    if (courant === null) continue;
    if (ligne.trim() === "") {
      fermer();
      continue;
    }
    courant.texte += " " + ligne.trim();
  }
  fermer();
  return sortie;
}

/**
 * Famille « champs répétés » : 16 blocs, unités 1 à 9, dont les DEUX blocs
 * de l'unité 1. Un tirage y est un couple de puces, « Éléments proposés »
 * puis « Réponse correcte ». Les puces peuvent être imbriquées sous un
 * « - Tirage 1 » (6E, 7E, 8E, 9E), et un même bloc en répète jusqu'à
 * quatre couples (5C).
 *
 * `champ()` de `parse-authoring.mjs` ne convient pas ici : il rend la
 * PREMIÈRE occurrence d'un nom, donc un seul tirage sur quatre.
 */
const PUCE = /^(\s*)[-*] (.*)$/u;
const NOM_VIVIER =
  /^\*{0,2}\s*(?:Éléments|Elements|Jetons|Blocs|Tuiles|Cartes|Étiquettes)\b/iu;
const NOM_REPONSE = /^\*{0,2}\s*Réponses?\b/iu;

function puces(corps) {
  const sortie = [];
  let courante = null;
  for (const ligne of corps.split("\n")) {
    const debut = ligne.match(PUCE);
    if (debut !== null) {
      if (courante !== null) sortie.push(courante);
      courante = { indentation: debut[1].length, texte: debut[2] };
      continue;
    }
    if (courante === null) continue;
    if (ligne.trim() === "") {
      sortie.push(courante);
      courante = null;
      continue;
    }
    courante.texte += " " + ligne.trim();
  }
  if (courante !== null) sortie.push(courante);
  return sortie;
}

function tiragesParChamps(corps) {
  const couples = [];
  let vivierEnAttente = null;
  for (const puce of puces(corps)) {
    const separateur = puce.texte.indexOf(":");
    const nom = separateur < 0 ? puce.texte : puce.texte.slice(0, separateur);
    if (NOM_VIVIER.test(nom)) {
      // Deux viviers de suite : le second écraserait le premier en
      // silence. On garde la trace du défaut plutôt que de choisir.
      if (vivierEnAttente !== null) return null;
      vivierEnAttente = puce.texte;
      continue;
    }
    if (NOM_REPONSE.test(nom)) {
      if (vivierEnAttente === null) continue;
      couples.push(vivierEnAttente + " " + puce.texte);
      vivierEnAttente = null;
    }
  }
  if (vivierEnAttente !== null) return null;
  return couples.map((texte, rang) => ({ rang: rang + 1, texte }));
}

// ---------------------------------------------------------------------
// 7. Rattachement à un item publié
// ---------------------------------------------------------------------

/**
 * `itemId` vaut l'item qui porte EXACTEMENT la suite reconstituée, et
 * `null` quand le corpus ne publie pas cette suite comme item.
 *
 * MESURE QUI COMMANDE CE CHOIX, faite le 2026-08-04 sur les 49 blocs avec
 * l'index de `compile-lesson.ts`, c'est-à-dire les items de la leçon
 * courante : la réponse d'un tirage n'est un item publié que dans 4 blocs
 * sur 46 analysés. C'est normal et voulu : les items d'une leçon sont les
 * BRIQUES (ครับ, ขอบคุณ, สบายดี), et `word_order` mesure précisément
 * l'assemblage de briques en une phrase que la leçon ne publie pas comme
 * item. L'unité 1 le montre en deux lignes : 1E publie ขอบคุณ et ครับ, et
 * l'exercice fait produire ขอบคุณ ครับ.
 *
 * Refuser ces 42 blocs reviendrait à jeter l'extraction entière pour une
 * donnée que l'autorat n'écrit nulle part. Inventer l'item, par exemple en
 * prenant celui du premier jeton, serait une devinette : le corpus ne dit
 * jamais à quel item un tirage se rattache. Le module rend donc `null` et
 * laisse la POLITIQUE d'attribution au compilateur, qui est le seul à
 * savoir ce qu'il en fait (révision espacée, statistiques, choix d'un
 * item représentatif). Un `null` qui casse bruyamment vaut mieux qu'un
 * identifiant plausible et faux.
 *
 * Deux graphies sont essayées, et ce ne sont pas deux devinettes : ce sont
 * les deux façons dont le corpus écrit la MÊME graphie. La forme compacte
 * (« ผมไปตลาดครับ ») est la règle ; la forme espacée est nécessaire quand
 * la graphie publiée porte une espace, ce que 12A documente explicitement
 * pour พูดช้า ๆ ได้ไหมครับ, où l'espace autour de ๆ appartient à l'entrée
 * du dictionnaire.
 */
function rattacherItem(reponse, resoudreItem) {
  const compact = compacter(reponse);
  return (
    resoudreItem(compact) ?? resoudreItem(reponse.normalize("NFC")) ?? null
  );
}

// ---------------------------------------------------------------------
// 8. Entrée publique
// ---------------------------------------------------------------------

/**
 * Analyse un bloc `word_order` et rend soit ses tirages, soit le motif
 * précis du refus. Jamais une approximation.
 *
 * @param bloc `{ ordre, titre, mecanique, corps }` rendu par
 *   `analyserBlocsExercice`.
 * @param resoudreItem `(graphieThai) => identifiantItem | null`.
 */
export function extraireWordOrder(bloc, resoudreItem) {
  if (bloc.mecanique !== "word_order") {
    return { erreur: `mécanique « ${bloc.mecanique} » et non word_order` };
  }

  let bruts = tiragesNumerotes(bloc.corps);
  if (bruts.length === 0) {
    const parChamps = tiragesParChamps(bloc.corps);
    if (parChamps === null) {
      return { erreur: "vivier sans réponse appariée" };
    }
    bruts = parChamps;
  }
  if (bruts.length === 0) return { erreur: "aucun tirage lisible" };

  const tirages = [];
  for (const { rang, texte } of bruts) {
    const lu = lireTirage(texte);
    if (lu.erreur !== undefined) {
      return { erreur: `tirage ${rang} : ${lu.erreur}` };
    }
    tirages.push({
      rang,
      itemId: rattacherItem(lu.reponse, resoudreItem),
      jetons: lu.jetons,
      ordreCorrect: lu.ordreCorrect,
    });
  }

  return { tirages };
}
