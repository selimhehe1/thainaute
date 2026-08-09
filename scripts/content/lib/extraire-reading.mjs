// Extraction déterministe des blocs d'exercice « reading ».
//
// Pourquoi un module séparé
// -------------------------
// `extraire-exercices.mjs` traite `association` et `listening`, dont les
// tirages tiennent sur une ligne d'un seul gabarit. La mécanique `reading`
// n'a pas cette chance : relevé sur les 65 leçons le 2026-08-04, elle
// compte 57 blocs et au moins onze notations de tirage différentes. Les
// mêler au module voisin l'aurait rendu illisible et fragile.
//
// Ce module traite les notations RÉGULIÈRES et refuse tout le reste en le
// NOMMANT. Aucun modèle, aucune heuristique de repêchage : un exercice mal
// extrait enseignerait une faute, et mieux vaut refuser dix blocs que d'en
// approcher un.
//
// Ce qu'est un tirage de lecture, et ce qui en découle
// ----------------------------------------------------
// Le schéma `readingExerciseSchema` demande un `itemId`, des `options` et
// l'option correcte. L'`itemId` y désigne la graphie AFFICHÉE, celle que
// l'apprenant lit. Deux conséquences, toutes deux appliquées ici :
//
//   1. un tirage dont le stimulus est un AUDIO ne peut pas devenir un
//      exercice de lecture, puisque rien n'y est affiché. Prendre la bonne
//      réponse comme item afficherait le corrigé. C'est le cas des tirages
//      1 à 6 de `u01-l1a`, écrits « Audio « kaww kài » : options ก อ จ ».
//      Ils sont refusés, pas repêchés ;
//   2. un tirage dont le stimulus est une consigne française et dont les
//      options sont thaïes (`u04-l4b`, `u05-l5b`) mesure le rappel, pas la
//      lecture. Il est refusé pour le même motif.
//
// Forme rendue, et pourquoi les deux existent
// -------------------------------------------
// Le corpus se partage à peu près également entre deux façons d'écrire les
// options, et aucune n'est marginale :
//
//   - options déclarées UNE fois pour le bloc (« A « … » ; B « … » »,
//     ou une liste citée, ou une liste numérotée) : 9 blocs au moins,
//     dont toute l'unité 13 ;
//   - options réécrites à CHAQUE tirage (« ; options X / Y : réponse X »,
//     ou « : « bon libellé ». Distracteurs : … ») : autant de blocs.
//
// Rendre une seule des deux formes obligerait à recopier les libellés
// partagés dans chaque tirage, ou à inventer un jeu commun là où il n'y en
// a pas. Le module rend donc `libelles` au niveau du bloc quand ils sont
// réellement partagés, et `libelles` par tirage sinon. L'appelant teste la
// présence de `resultat.libelles` : c'est l'unique discriminant.

/** Ligne numérotée « 1. … » d'une liste. */
const LIGNE_NUMEROTEE = /^\s*(\d+)\.\s+(.*)$/u;
/** Puce de premier niveau : elle ferme le champ précédent. */
const PUCE_PREMIER_NIVEAU = /^[-*] /u;
/** Texte entre guillemets français, porteur habituel des libellés. */
const ENTRE_GUILLEMETS = /«\s*([^»]+?)\s*»/gu;
/**
 * Graphie thaïe affichée.
 *
 * PIÈGE MESURÉ : une graphie peut porter des espaces internes, soit à
 * cause de ๆ (พูดช้า ๆ ได้ไหมคะ), soit parce que le support affiché tient
 * en deux blocs (เสื้อ ๙๐ บาท, ข้าวผัดสองจาน ไม่เผ็ด). Prendre la première
 * suite thaïe seule couperait ces graphies en deux et ferait résoudre un
 * item qui n'est pas celui qu'on affiche. On prend donc la suite maximale
 * de runs thaïs séparés par UN espace.
 */
const GROUPE_THAI = /[฀-๿]+(?: [฀-๿]+)*/gu;
/** Préfixes d'affichage admis devant la graphie d'un tirage. */
const PREFIXE_AFFICHAGE = /^(?:Spécimen|Affiché|Lettre affichée)\s*:?\s*/u;
/** Nombres écrits en toutes lettres, tels que le corpus annonce ses options. */
const NOMBRES_ECRITS = {
  deux: 2,
  trois: 3,
  quatre: 4,
  cinq: 5,
  six: 6,
  sept: 7,
  huit: 8,
};
/** Bornes du schéma : `options` accepte de 2 à 6 entrées, pas plus. */
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

/**
 * Lit un champ de premier niveau en CONSERVANT ses retours à la ligne.
 *
 * `champ()` de `parse-authoring.mjs` écrase les blancs, ce qui convient à
 * un champ de prose mais détruit les listes numérotées dont cette
 * mécanique dépend entièrement. D'où ce lecteur séparé.
 *
 * PIÈGE CONSERVÉ : le nom de champ peut porter une précision avant les
 * deux-points (« - Options, identiques aux 4 tirages : »), que le lecteur
 * du module voisin ne prévoit pas. Cette précision ne peut pas contenir de
 * deux-points, sans quoi elle avalerait le début de la valeur.
 */
function champLignes(corps, nom) {
  const entete = new RegExp("^[-*] ?`?" + nom + "`?[^:\\n]*:(.*)$", "u");
  const lignes = corps.split("\n");
  for (let i = 0; i < lignes.length; i += 1) {
    const trouve = lignes[i].match(entete);
    if (trouve === null) continue;
    const valeur = [trouve[1]];
    for (let j = i + 1; j < lignes.length; j += 1) {
      if (PUCE_PREMIER_NIVEAU.test(lignes[j])) break;
      if (lignes[j].startsWith("#")) break;
      valeur.push(lignes[j]);
    }
    return valeur;
  }
  return null;
}

/** Le même champ, blancs écrasés, pour les valeurs de prose. */
function champPlat(corps, nom) {
  const lignes = champLignes(corps, nom);
  if (lignes === null) return null;
  return lignes.join(" ").replace(/\s+/gu, " ").trim();
}

/**
 * Découpe une liste numérotée écrite à plat, « 1. a 2. b 3. c ».
 *
 * Rend `null` dès que la numérotation n'est pas 1, 2, 3 … : une liste
 * trouée signale qu'on a ramassé autre chose qu'un jeu d'options.
 */
function listeNumerotee(texte) {
  const reperes = [...texte.matchAll(/(?:^|\s)(\d+)\.\s+/gu)];
  if (reperes.length < MIN_OPTIONS) return null;
  const libelles = [];
  for (let i = 0; i < reperes.length; i += 1) {
    if (Number(reperes[i][1]) !== i + 1) return null;
    const debut = reperes[i].index + reperes[i][0].length;
    const fin = i + 1 < reperes.length ? reperes[i + 1].index : texte.length;
    libelles.push(sansPointFinal(texte.slice(debut, fin)));
  }
  return libelles;
}

function sansPointFinal(texte) {
  return texte.trim().replace(/\.$/u, "").trim();
}

/** Retire les guillemets français d'un libellé, s'il en porte. */
function deciter(texte) {
  const cite = texte.trim().match(/^«\s*([^»]*?)\s*»$/u);
  return cite === null ? null : cite[1];
}

/**
 * Groupes thaïs d'un texte, un groupe étant une graphie affichable.
 * Voir `GROUPE_THAI` pour le piège des espaces internes.
 */
function groupesThais(texte) {
  return [...texte.matchAll(GROUPE_THAI)].map((trouve) => trouve[0]);
}

/**
 * Options déclarées une fois pour tout le bloc.
 *
 * Trois notations sont reconnues, et une seule doit s'appliquer :
 *   - `cle`     : « A « … » ; B « … » ; C « … » », clés contiguës depuis A ;
 *   - `index`   : liste numérotée, la réponse désigne un rang ;
 *   - `libelle` : liste citée sans clé, la réponse recopie le libellé.
 *
 * PIÈGE MESURÉ : le champ `Options` porte souvent de la prose APRÈS les
 * libellés, et cette prose cite parfois des libellés entre guillemets.
 * `u11-l11e` annonce quatre options et son champ en cite sept, les trois
 * dernières venant d'une note de contre-audit. Le nombre annoncé en toutes
 * lettres sert donc de contrôle croisé, vérifié au moment de l'emploi.
 */
function optionsDuBloc(corps) {
  const lignes = champLignes(corps, "Options");
  if (lignes === null) return null;
  const plat = lignes.join(" ").replace(/\s+/gu, " ").trim();
  const annonce = plat.match(/^(deux|trois|quatre|cinq|six|sept|huit)\b/iu);
  const nombreAnnonce =
    annonce === null ? null : NOMBRES_ECRITS[annonce[1].toLowerCase()];

  const cites = [...plat.matchAll(ENTRE_GUILLEMETS)].map((t) => t[1]);
  const aClef = [...plat.matchAll(/(?:^|[\s;,.])([A-Z])\s+«\s*([^»]+?)\s*»/gu)];
  if (aClef.length > 0) {
    if (aClef.length !== cites.length) {
      return {
        erreur:
          "champ Options mixte : " +
          aClef.length +
          " libellés à clé pour " +
          cites.length +
          " libellés cités",
      };
    }
    const cles = aClef.map((t) => t[1]);
    const attendues = cles.map((_, i) => String.fromCharCode(65 + i));
    if (cles.join("") !== attendues.join("")) {
      return {
        erreur: `clés d'options non contiguës depuis A : ${cles.join("")}`,
      };
    }
    return {
      mode: "cle",
      cles,
      libelles: aClef.map((t) => t[2]),
      nombreAnnonce,
    };
  }

  const numerotes = listeNumerotee(plat);
  if (numerotes !== null) {
    return { mode: "index", libelles: numerotes, nombreAnnonce };
  }
  if (cites.length >= MIN_OPTIONS) {
    return { mode: "libelle", libelles: cites, nombreAnnonce };
  }
  return { erreur: "champ Options d'une notation non reconnue" };
}

/** Contrôle commun à tout jeu de libellés destiné au schéma. */
function libellesValides(libelles) {
  if (libelles.length < MIN_OPTIONS) return `${libelles.length} option(s)`;
  if (libelles.length > MAX_OPTIONS) {
    return `${libelles.length} options, le schéma en accepte ${MAX_OPTIONS}`;
  }
  if (new Set(libelles).size !== libelles.length) {
    return "deux options identiques";
  }
  return null;
}

/**
 * Options partagées, vérifiées contre le nombre annoncé en toutes lettres.
 * Rend une chaîne de refus, ou `null` si tout va bien.
 */
function partageeUtilisable(options) {
  if (options === null) return "champ Options absent";
  if (options.erreur !== undefined) return options.erreur;
  if (
    options.nombreAnnonce !== null &&
    options.nombreAnnonce !== options.libelles.length
  ) {
    return (
      "champ Options : " +
      options.nombreAnnonce +
      " annoncées, " +
      options.libelles.length +
      " lues"
    );
  }
  return libellesValides(options.libelles);
}

/**
 * Sépare la graphie affichée du reste de la ligne de tirage.
 * Rend `null` quand la ligne ne commence pas par une graphie, ce qui est
 * le refus de fond de cette mécanique : sans graphie affichée, il n'y a
 * rien à lire.
 */
function graphieEnTete(texte) {
  const sansPrefixe = texte.replace(PREFIXE_AFFICHAGE, "");
  const trouve = sansPrefixe.match(/^[฀-๿]+(?: [฀-๿]+)*/u);
  if (trouve === null) return null;
  // Le corpus glisse parfois la leçon d'origine juste après la graphie,
  // « ผมไม่สบายครับ (`u09-l9e`) → A. » dans tout `u12-l12d`. C'est une note
  // de provenance, pas une partie du stimulus : un identifiant de leçon
  // entre backticks et parenthèses est reconnaissable sans ambiguïté, on
  // le retire. Une parenthèse de prose, « ถัง (mot nouveau, « le seau ») »,
  // ne correspond pas à ce gabarit et reste donc en place.
  const reste = sansPrefixe
    .slice(trouve[0].length)
    .replace(/^\s*\(`[a-z0-9-]+`\)/u, "");
  return { graphie: trouve[0], reste };
}

/**
 * Découpe la liste d'options écrite dans la ligne même.
 *
 * Deux séparateurs, et deux seulement :
 *   - « X / Y / Z », la notation courante depuis l'unité 2 ;
 *   - « ก อ จ », uniquement quand TOUS les jetons sont des suites thaïes,
 *     ce qui est la notation de `u01-l1a`. Restreindre l'espace à ce cas
 *     évite de couper « 3, 5, 8, 9 » ou une phrase française en morceaux.
 */
function optionsEnLigne(segment) {
  const brut = segment.trim();
  if (brut === "") return { erreur: "liste d'options vide" };
  const parBarre = brut
    .split(" / ")
    .map((morceau) => morceau.trim())
    .filter((morceau) => morceau !== "");
  const parVirgule = /^\d+(?:\s*,\s*\d+)+$/u.test(brut)
    ? brut.split(/\s*,\s*/u).map((morceau) => morceau.trim())
    : [];
  const jetons =
    parBarre.length >= MIN_OPTIONS
      ? parBarre
      : parVirgule.length >= MIN_OPTIONS
        ? parVirgule
        : brut.split(/\s+/u).every((jeton) => /^[฀-๿]+$/u.test(jeton))
          ? brut.split(/\s+/u)
          : null;
  if (jetons === null || jetons.length < MIN_OPTIONS) {
    return { erreur: `options non séparables : « ${brut} »` };
  }
  const decites = jetons.map(deciter);
  const cites = decites.filter((valeur) => valeur !== null).length;
  if (cites !== 0 && cites !== jetons.length) {
    return { erreur: "options mixtes, citées et nues, dans le même tirage" };
  }
  return {
    libelles: cites === 0 ? jetons : decites,
    citees: cites !== 0,
  };
}

/**
 * Rang de la bonne réponse dans un jeu de libellés.
 *
 * PIÈGE MESURÉ : `u03-l3b` écrit « options 3, 5, 8, 9 : réponse 5 », où le
 * 5 est une VALEUR d'option et non un rang. Une réponse numérique n'est
 * donc lue comme un rang que si aucune option n'est elle-même un nombre.
 */
function rangDeLaReponse(brutReponse, libelles) {
  const cite = brutReponse.trim().match(/^«\s*([^»]+?)\s*»/u);
  const valeur =
    cite !== null ? cite[1] : sansPointFinal(brutReponse.split(".")[0] ?? "");
  if (valeur === "") return { erreur: "réponse vide" };
  const exact = libelles.indexOf(valeur);
  if (exact >= 0) return { indice: exact };
  if (/^\d+$/u.test(valeur)) {
    if (libelles.some((libelle) => /^\d+$/u.test(libelle))) {
      return {
        erreur: `réponse « ${valeur} » ambiguë : les options sont elles-mêmes des nombres`,
      };
    }
    const rang = Number(valeur);
    if (rang >= 1 && rang <= libelles.length) return { indice: rang - 1 };
    return {
      erreur: `rang de réponse ${rang} hors des ${libelles.length} options`,
    };
  }
  return { erreur: `réponse « ${valeur} » hors des options` };
}

// Notations de ligne de tirage reconnues. Chacune est essayée dans l'ordre,
// et la première qui s'applique décide : elles ne se recouvrent pas.

/** « <graphie> → A. » avec des options à clé déclarées pour le bloc. */
const FLECHE = /^\s*→\s*([A-Z])(?![A-Za-zÀ-ÿ])/u;
/** « <graphie> : « bon libellé ». Distracteurs : a, b, c. » */
const DISTRACTEURS =
  /^\s*:\s*«\s*([^»]+?)\s*»\s*\.\s*Distracteurs\s*:\s*(.+?)\s*\.?\s*$/u;
/** « <graphie> ; options X / Y : réponse Z. » et sa variante inversée. */
const OPTIONS_ET_REPONSE =
  /[;:]\s*(mêmes options|options)\s*:?\s*(.*?)\s*[;:]\s*réponse\s*:?\s*(.*)$/iu;
/** « <graphie> : réponse « Z ». » avec des options partagées. */
const REPONSE_SEULE = /[;:]\s*réponse\s*:?\s*(.*)$/iu;
/** « Spécimen <graphie>. Réponse correcte : 1. » */
const REPONSE_CORRECTE = /(?:^|[.;])\s*Réponse correcte\s*:\s*(\d+)/u;
/** « <graphie> : libellé exact d'une option partagée. » */
const LIBELLE_NU = /^\s*:\s*(.+)$/u;

/**
 * Analyse une ligne de tirage déjà recollée.
 * Rend `{ libelles, indiceCorrect, partagees }` ou `{ erreur }`.
 */
function analyserTirage(texte, options, precedentes) {
  // PIÈGE MESURÉ, et il coûte le bloc le plus régulier du corpus.
  // `u13-l13d` tire ไอ้ puis ไอ้ …, อี puis อี …, วะ puis … วะ : le
  // caractère de suspension NOTE LA PLACE du mot, avant ou après ce qu'il
  // accompagne, et c'est une seconde information de lecture. Le schéma de
  // lecture ne porte qu'un `itemId` et aucun texte de stimulus : compiler
  // ces tirages en donnerait deux identiques et perdrait silencieusement
  // la place. `u06-l6e` tronque de même son spécimen, « ไกลมาก… ».
  if (texte.includes("…")) {
    return {
      erreur: "notation de place « … » : le stimulus déborde la graphie seule",
    };
  }
  const tete = graphieEnTete(texte);
  if (tete === null) {
    return {
      erreur: `aucune graphie thaïe affichée en tête, « ${texte.slice(0, 60)} »`,
    };
  }
  const { graphie, reste } = tete;

  const fleche = reste.match(FLECHE);
  if (fleche !== null) {
    const refus = partageeUtilisable(options);
    if (refus !== null) return { erreur: refus };
    if (options.mode !== "cle") {
      return {
        erreur: `réponse « ${fleche[1]} » alors que les options du bloc n'ont pas de clé`,
      };
    }
    const indice = options.cles.indexOf(fleche[1]);
    if (indice < 0) {
      return {
        erreur: `clé de réponse « ${fleche[1]} » hors des options du bloc`,
      };
    }
    return {
      graphie,
      libelles: options.libelles,
      indiceCorrect: indice,
      partagees: true,
    };
  }

  const distracteurs = reste.match(DISTRACTEURS);
  if (distracteurs !== null) {
    if (options === null) return { erreur: "champ Options absent" };
    if (options.erreur !== undefined) return { erreur: options.erreur };
    if (options.mode !== "libelle") {
      return {
        erreur: "distracteurs annoncés sans jeu de libellés cité pour le bloc",
      };
    }
    const libelles = [
      distracteurs[1],
      ...distracteurs[2].split(",").map((morceau) => sansPointFinal(morceau)),
    ];
    const hors = libelles.filter(
      (libelle) => !options.libelles.includes(libelle),
    );
    if (hors.length > 0) {
      return {
        erreur: `libellé « ${hors[0]} » hors du jeu déclaré par le bloc`,
      };
    }
    if (
      options.nombreAnnonce !== null &&
      options.nombreAnnonce !== libelles.length
    ) {
      return {
        erreur:
          "tirage à " +
          libelles.length +
          " options alors que le bloc en annonce " +
          options.nombreAnnonce,
      };
    }
    const refus = libellesValides(libelles);
    if (refus !== null) return { erreur: refus };
    return { graphie, libelles, indiceCorrect: 0, partagees: false };
  }

  const enLigne = texte.match(OPTIONS_ET_REPONSE);
  if (enLigne !== null) {
    const memes = enLigne[1].toLowerCase() === "mêmes options";
    let libelles;
    if (memes) {
      if (precedentes === null) {
        return { erreur: "« mêmes options » sans tirage précédent" };
      }
      libelles = precedentes;
    } else {
      const lues = optionsEnLigne(enLigne[2]);
      if (lues.erreur !== undefined) return { erreur: lues.erreur };
      libelles = lues.libelles;
    }
    const refus = libellesValides(libelles);
    if (refus !== null) return { erreur: refus };
    const rang = rangDeLaReponse(enLigne[3], libelles);
    if (rang.erreur !== undefined) return { erreur: rang.erreur };
    return { graphie, libelles, indiceCorrect: rang.indice, partagees: false };
  }

  const reponseSeule = reste.match(REPONSE_SEULE);
  if (reponseSeule !== null) {
    const refus = partageeUtilisable(options);
    if (refus !== null) return { erreur: refus };
    const rang = rangDeLaReponse(reponseSeule[1], options.libelles);
    if (rang.erreur !== undefined) return { erreur: rang.erreur };
    return {
      graphie,
      libelles: options.libelles,
      indiceCorrect: rang.indice,
      partagees: true,
    };
  }

  const correcte = reste.match(REPONSE_CORRECTE);
  if (correcte !== null) {
    const refus = partageeUtilisable(options);
    if (refus !== null) return { erreur: refus };
    const rang = Number(correcte[1]);
    if (rang < 1 || rang > options.libelles.length) {
      return {
        erreur: `rang de réponse ${rang} hors des ${options.libelles.length} options`,
      };
    }
    return {
      graphie,
      libelles: options.libelles,
      indiceCorrect: rang - 1,
      partagees: true,
    };
  }

  const nu = reste.match(LIBELLE_NU);
  if (nu !== null) {
    const refus = partageeUtilisable(options);
    if (refus !== null) return { erreur: refus };
    // Exact, jamais préfixe : `u09-l9a` écrit « เสีย : aucune consonne ne
    // ferme ce mot, le ย appartenant au graphème เ◌ีย. Item publié … », où
    // le libellé est suivi d'une glose. Rogner cette glose pour faire
    // coller le libellé serait une approximation, donc un refus.
    const valeur = sansPointFinal(nu[1]);
    const indice = options.libelles.indexOf(valeur);
    if (indice < 0)
      return { erreur: `libellé « ${valeur} » hors des options du bloc` };
    return {
      graphie,
      libelles: options.libelles,
      indiceCorrect: indice,
      partagees: true,
    };
  }

  return {
    erreur: `notation de réponse non reconnue, « ${reste.trim().slice(0, 60)} »`,
  };
}

/**
 * Recolle les lignes numérotées d'une section et leurs continuations.
 *
 * Les tirages de lecture débordent presque tous sur deux ou trois lignes,
 * ce que le module voisin n'a pas à gérer. Une continuation est toute
 * ligne non vide qui ne rouvre pas de numéro.
 */
function tiragesNumerotes(lignes) {
  const sortie = [];
  for (const ligne of lignes) {
    const trouve = ligne.match(LIGNE_NUMEROTEE);
    if (trouve !== null) {
      sortie.push({ rang: Number(trouve[1]), texte: trouve[2].trim() });
      continue;
    }
    if (sortie.length > 0 && ligne.trim() !== "") {
      sortie[sortie.length - 1].texte += " " + ligne.trim();
    }
  }
  return sortie;
}

/**
 * Bloc à tirage unique : un affichage, un jeu d'options numérotées, un
 * rang de bonne réponse. Sept blocs du corpus sont écrits ainsi.
 */
function tirageUnique(corps, options, resoudreItem) {
  const affichage = champPlat(corps, "Affichage");
  if (affichage === null) {
    return { erreur: "ni tirages numérotés ni champ Affichage" };
  }
  const groupes = groupesThais(affichage);
  if (groupes.length !== 1) {
    return {
      erreur: `${groupes.length} graphies affichées, une seule attendue`,
    };
  }
  const refus = partageeUtilisable(options);
  if (refus !== null) return { erreur: refus };

  const brut = champPlat(corps, "Réponse correcte");
  if (brut === null) return { erreur: "champ Réponse correcte absent" };
  const rang = brut.match(/^(\d+)/u);
  if (rang === null)
    return { erreur: `réponse correcte non numérotée : « ${brut}` };
  const indice = Number(rang[1]) - 1;
  if (indice < 0 || indice >= options.libelles.length) {
    return {
      erreur: `rang de réponse ${rang[1]} hors des ${options.libelles.length} options`,
    };
  }
  // Contrôle croisé gratuit : le corpus redit souvent le libellé entre
  // parenthèses (« Réponse correcte : 1 (Merci) »). Un désaccord entre le
  // rang et ce rappel signale une dérive d'autorat, et fait refuser.
  const rappel = brut.match(/^\d+\s*\((.+)\)\s*$/u);
  if (rappel !== null) {
    const attendu = sansPointFinal(options.libelles[indice]);
    if (sansPointFinal(rappel[1]) !== attendu) {
      return {
        erreur: `réponse ${rang[1]} annoncée « ${sansPointFinal(rappel[1])} », option « ${attendu} »`,
      };
    }
  }

  const itemId = resoudreItem(groupes[0]);
  if (itemId === null) {
    return { erreur: `item introuvable pour ${groupes[0]}` };
  }
  return {
    libelles: options.libelles,
    tirages: [{ rang: 1, itemId, indiceCorrect: indice }],
  };
}

/**
 * Analyse un bloc « reading » et rend soit sa description structurée, soit
 * le motif précis du refus. Jamais une approximation.
 *
 * @param {{ordre:number, titre:string, mecanique:string|null, corps:string}} bloc
 * @param {(graphie:string) => string|null} resoudreItem
 */
export function extraireReading(bloc, resoudreItem) {
  if (bloc.mecanique !== "reading") {
    return { erreur: `mécanique « ${bloc.mecanique} » au lieu de « reading »` };
  }
  const options = optionsDuBloc(bloc.corps);
  const section = champLignes(bloc.corps, "Tirages?");
  if (section === null) return tirageUnique(bloc.corps, options, resoudreItem);

  const lignes = tiragesNumerotes(section);
  if (lignes.length === 0) {
    // Refus utile : `u10-l10d` range ses dix tirages SOUS la puce des
    // planchers, numérotés 3 à 12 à la suite des deux stratégies. Le champ
    // `Tirages` y est donc vide, et le signaler vaut mieux que d'aller
    // ramasser des lignes numérotées ailleurs dans le bloc.
    return { erreur: "champ Tirages sans ligne de tirage numérotée" };
  }
  const rangs = lignes.map((ligne) => ligne.rang);
  const attendus = lignes.map((_, index) => index + 1);
  if (rangs.join(",") !== attendus.join(",")) {
    return {
      erreur: `tirages numérotés ${rangs.join(",")} au lieu de 1 à ${lignes.length}`,
    };
  }

  const tirages = [];
  let partageTotal = true;
  let precedentes = null;
  for (const { rang, texte } of lignes) {
    const lu = analyserTirage(texte, options, precedentes);
    if (lu.erreur !== undefined) {
      return { erreur: `tirage ${rang} : ${lu.erreur}` };
    }
    const itemId = resoudreItem(lu.graphie);
    if (itemId === null) {
      return { erreur: `tirage ${rang} : item introuvable pour ${lu.graphie}` };
    }
    precedentes = lu.libelles;
    if (!lu.partagees) partageTotal = false;
    tirages.push({
      rang,
      itemId,
      libelles: lu.libelles,
      indiceCorrect: lu.indiceCorrect,
    });
  }

  if (partageTotal) {
    return {
      libelles: tirages[0].libelles,
      tirages: tirages.map(({ rang, itemId, indiceCorrect }) => ({
        rang,
        itemId,
        indiceCorrect,
      })),
    };
  }
  return { tirages };
}
