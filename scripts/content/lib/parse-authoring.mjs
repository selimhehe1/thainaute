// Analyse des fichiers d'autorat `content/authoring/unite-NN/lecon-NNx.md`.
//
// Pourquoi ce module existe
// -------------------------
// Plusieurs outils lisent ces markdown : les contrôles de vérification et,
// désormais, le compilateur vers les schémas de contenu. Deux analyses
// séparées divergeraient, et l'une des deux finirait par mentir.
//
// Le bug qui a motivé l'extraction
// --------------------------------
// `item-fields-check.mjs` exigeait des backticks autour du nom de champ
// (`` - `thai` : ``). L'unité 1, écrite avant que cette convention ne
// s'installe, emploie `- thai :`. Ses items étaient donc INVISIBLES pour
// l'outil, qui annonçait « 0 faute » sur un ensemble vide. Mesuré le
// 2026-08-04 : 546 items vus sur 570, les 24 manquants tous dans l'unité 1.
//
// Un outil de vérification qui ne trouve rien doit le dire. Ce module
// renvoie donc toujours le compte de ce qu'il a vu, et l'appelant doit
// l'afficher.

import { readFileSync } from "node:fs";

/**
 * Coupe un bloc au prochain champ de premier niveau, au prochain titre, à
 * la première ligne vide ou à la fin.
 *
 * PIÈGE CONSERVÉ de l'implémentation d'origine : ne pas employer le drapeau
 * `m`, sans quoi le `$` signifierait « fin de LIGNE » et tronquerait
 * silencieusement tout champ écrit sur deux lignes, ce qui est le cas de
 * presque tous les champs `codepoints`.
 *
 * PIÈGE AJOUTÉ : la butée doit viser une puce NON INDENTÉE. Le champ
 * `sources` porte des sous-puces indentées qu'il faut garder.
 *
 * PIÈGE AJOUTÉ : un nom de champ peut porter une précision entre
 * parenthèses avant les deux-points, comme `` - `codepoints` (NFC) : ``.
 * Sans elle dans la butée, le champ précédent avale tout le bloc suivant.
 * Mesuré sur le corpus : 7 items concernés, tous à graphies multiples.
 */
// Nom de champ : backticks facultatifs, précision entre parenthèses
// facultative, puis les deux-points.
const QUALIFICATIF = "`?\\s*(?:\\([^)\\n]*\\))?\\s*:";
const PROCHAIN_CHAMP = "\\n[-*] ?`?[^`:\\n(]+" + QUALIFICATIF;

export function champ(bloc, nom) {
  const re = new RegExp(
    "(?:^|\\n)[-*] ?`?" +
      nom +
      QUALIFICATIF +
      " ?([\\s\\S]*?)(?=" +
      PROCHAIN_CHAMP +
      "|\\n#|\\n\\n|$)",
  );
  const trouve = bloc.match(re);
  return trouve ? trouve[1].replace(/\s+/gu, " ").trim() : undefined;
}

/**
 * Tous les champs dont l'étiquette COMMENCE par `prefixe`, avec ce qui
 * suit le préfixe conservé comme qualificatif.
 *
 * PIÈGE MESURÉ : `champ()` ne lit qu'une étiquette exacte. Or le corpus
 * qualifie massivement ses étiquettes par une virgule :
 *
 *     - Feedback incorrect, accent absent : « … »
 *     - Feedback correct, tirages 1 et 2 : « … »
 *     - Consigne générale : « … »
 *
 * Sur les 297 blocs d'exercices du corpus, 283 déclarent une mécanique mais
 * seulement 124 portent un « Feedback incorrect » nu. Les autres écrivent
 * un ou plusieurs retours qualifiés, que l'extraction ne voyait pas : 153
 * blocs étaient refusés pour « feedback absent » alors que la leçon en
 * contenait plusieurs, et 35 pour « consigne absente ».
 *
 * Rend un tableau dans l'ordre d'écriture, vide si rien ne correspond. Le
 * qualificatif est rendu brut, appel à l'appelant de le nettoyer.
 */
export function champsPrefixes(bloc, prefixe) {
  const re = new RegExp(
    "(?:^|\\n)[-*] ?`?" +
      prefixe +
      "([^`:\\n]*)" +
      QUALIFICATIF +
      " ?([\\s\\S]*?)(?=" +
      PROCHAIN_CHAMP +
      "|\\n#|\\n\\n|$)",
    "gu",
  );
  const trouves = [];
  for (const m of String(bloc).matchAll(re)) {
    trouves.push({
      qualificatif: m[1].replace(/\s+/gu, " ").trim(),
      valeur: m[2].replace(/\s+/gu, " ").trim(),
    });
  }
  return trouves;
}

/** Séquence de points de code d'une graphie, en NFC. */
export function sequencePointsDeCode(graphie) {
  return [...graphie.normalize("NFC")]
    .map(
      (caractere) =>
        "U+" +
        caractere.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"),
    )
    .join(" ");
}

/**
 * Le champ `thai` n'est PAS toujours une graphie propre.
 *
 * Relevé sur le corpus le 2026-08-04, il peut porter :
 *  - un ou plusieurs séparateurs ` / ` ou ` · ` (plusieurs graphies) ;
 *  - un caractère de remplacement `…` (ขอ … หน่อย) ;
 *  - une glose française entre parenthèses
 *    (คุณชื่ออะไรคะ (une femme demande)) ;
 *  - une liste séparée par des espaces (๐ ๑ ๒ ๓ …).
 *
 * Un compilateur qui prendrait ce champ pour un `thaiRaw` publierait donc
 * des parenthèses françaises dans du contenu thaï. `graphies()` sépare ce
 * qui est séparable et signale ce qui ne l'est pas, plutôt que de deviner.
 */
export const SEPARATEURS_GRAPHIE = /\s+\/\s+|\s+·\s+/u;

/** Bloc thaï de l'Unicode, sans espace ni ponctuation. */
const THAI_SEUL = /^[฀-๿]+$/u;
/** ๆ, mai yamok : marque de répétition, écrite détachée du mot. */
const MAI_YAMOK = "ๆ";

/**
 * Une graphie propre ne contient que du thaï. Les espaces sont refusés,
 * SAUF quand la graphie emploie ๆ : พูดช้า ๆ est du thaï correct, et non
 * une décoration à arbitrer.
 *
 * Écrit en découpage plutôt qu'en expression régulière imbriquée : la
 * version précédente emboîtait un quantificateur dans un autre, ce qui est
 * difficile à relire et facile à faire dégénérer.
 */
function estGraphiePropre(valeur) {
  const morceaux = valeur.split(" ");
  if (!morceaux.every((morceau) => THAI_SEUL.test(morceau))) return false;
  if (morceaux.length === 1) return true;
  return morceaux.includes(MAI_YAMOK);
}

export function graphies(champThai) {
  const morceaux = champThai
    .split(SEPARATEURS_GRAPHIE)
    .map((part) => part.trim())
    .filter(Boolean);
  return morceaux.map((valeur) => {
    const gloseFr = valeur.match(/\s*\(([^)]*)\)\s*$/u)?.[1] ?? null;
    const sansGlose = valeur.replace(/\s*\([^)]*\)\s*$/u, "").trim();
    return {
      valeur,
      sansGlose,
      gloseFr,
      propre: estGraphiePropre(sansGlose),
    };
  });
}

const CHAMPS_ITEM = [
  "thai",
  "codepoints",
  "ipa",
  "ton",
  "longueur",
  "fr",
  "transcription",
  "registre",
  "note_fr",
  "sources",
  // Discriminant de sens, employé UNIQUEMENT par les homographes. Deux mots
  // sans rapport peuvent partager une graphie : ไหม est la soie, et aussi la
  // particule qui ferme une question. Sans ce champ, la consolidation des
  // cartes en ferait une seule carte enseignant deux mots.
  "sens",
];

/**
 * Découpe le fichier en blocs de titre de niveau 3 ou 4.
 *
 * Les titres du corpus ne suivent pas une convention unique : `### Item N`,
 * `#### Item N`, `#### Spécimen N`, `#### Collocation rattachée à l'item N`,
 * et une numérotation par mot en unité 3. On ne filtre donc pas sur le
 * titre : un bloc est un item s'il porte un champ `thai`, ce qui est le
 * seul critère fiable.
 */
function blocs(texte) {
  return texte.split(/^#{3,4} /mu).slice(1);
}

export function analyserItems(texte) {
  const liste = [];
  let ordre = 0;
  for (const bloc of blocs(texte)) {
    const thai = champ(bloc, "thai");
    if (thai === undefined) continue;
    ordre += 1;
    const item = { ordre, titre: bloc.split("\n")[0].trim(), thai };
    for (const nom of CHAMPS_ITEM) {
      if (nom === "thai") continue;
      item[nom] = champ(bloc, nom);
    }
    liste.push(item);
  }
  return liste;
}

/**
 * Blocs d'exercice. Le corpus les décrit en prose structurée : on n'en
 * extrait donc ici que ce qui est mécaniquement sûr, à savoir le titre, la
 * mécanique déclarée et le corps brut. La conversion en exercices typés est
 * assistée, puis vérifiée contre ce corps.
 */
export function analyserBlocsExercice(texte) {
  const section = texte.split(/^## Exercices\s*$/mu)[1];
  if (section === undefined) return [];
  // On s'arrête à la section suivante de premier niveau.
  const corpsSection = section.split(/^## /mu)[0] ?? "";
  const liste = [];
  let ordre = 0;
  for (const bloc of corpsSection.split(/^### /mu).slice(1)) {
    ordre += 1;
    const titre = bloc.split("\n")[0].trim();
    const mecanique = champ(bloc, "Mécanique") ?? champ(bloc, "Mecanique");
    liste.push({
      ordre,
      titre,
      // La mécanique est écrite entre backticks : `listening`, `recall`...
      mecanique: mecanique?.match(/`([a-z_]+)`/u)?.[1] ?? null,
      corps: bloc,
    });
  }
  return liste;
}

export function analyserMeta(texte) {
  const section = texte.split(/^## Méta\s*$/mu)[1]?.split(/^## /mu)[0] ?? "";
  const lire = (nom) => champ(section, nom);
  return {
    identifiant: lire("Identifiant")?.match(/`([a-z0-9-]+)`/u)?.[1] ?? null,
    titreFr: lire("Titre français") ?? null,
    objectifFr: lire("Objectif observable") ?? null,
    statut: lire("Statut")?.match(/`([a-z]+)`/u)?.[1] ?? null,
    transcription: lire("Transcription") ?? null,
  };
}

export function analyserLecon(chemin) {
  const texte = readFileSync(chemin, "utf8");
  return {
    chemin,
    meta: analyserMeta(texte),
    items: analyserItems(texte),
    blocsExercice: analyserBlocsExercice(texte),
    texte,
  };
}
