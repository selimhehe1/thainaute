// Que sait-on RÉELLEMENT lire, mesuré sur le vocabulaire publié du parcours.
//
// POURQUOI CE SCRIPT EXISTE. L'unité 12 doit dire à l'apprenant où il en est
// sans jamais promettre un niveau, un nombre d'heures ni une équivalence.
// La seule façon honnête de le faire est de compter : sur les graphies que le
// parcours a réellement publiées, combien la méthode de lecture des unités 4 à
// 10 permet-elle de décoder, et combien laisse-t-elle dehors, et pour quel
// motif. `u10-l10a` a mesuré le TABLEAU des tons sur VOLUBILIS avec
// `table-des-tons.mjs` ; ce script-ci mesure la PORTÉE de la méthode sur le
// corpus du dépôt, ce qu'aucun outil ne faisait.
//
// CE QU'IL MESURE. Pour chaque graphie publiée d'une seule syllabe, il applique
// les quatre questions telles que les leçons les enseignent, dans leur ordre :
//   1. la consonne INITIALE et sa CLASSE (`u04-l4a` page 6, `u06-l6a`,
//      `u07-l7a` page 4, listes de lettres du RID relevées par `u10-l10a`) ;
//   2. la MARQUE de ton éventuelle (`u07-l7a`, `u08-l8a`) ;
//   3. la FINALE, c'est-à-dire ce qui ferme la syllabe (`u09-l9a`, familles
//      มาตรา relevées par `u05-l5a`) ;
//   4. le TYPE de syllabe, vivante ou morte, que la finale et la longueur de la
//      voyelle décident (RID, entrées « คำเป็น » et « คำตาย »).
// Puis il compare le ton PRÉDIT par le tableau au ton PUBLIÉ par la leçon
// d'origine. Un écart n'est pas une erreur de la leçon : c'est un point à
// ouvrir à la main sur une troisième autorité.
//
// CE QU'IL NE MESURE PAS, et c'est déclaré plutôt que masqué.
//   - Les graphies de plusieurs syllabes. Le champ `ton` du contrat d'item les
//     désigne lui-même, en nommant un ton PAR syllabe : une graphie dont le
//     champ `ton` nomme deux tons ou plus est mise de côté, sans jugement.
//     Segmenter une graphie thaïe en syllabes est un problème que ce script ne
//     prétend pas résoudre.
//   - Les formes écrites avec ไ, ใ, เ◌า et ◌ำ, que la page 8 de `u04-l4a` met
//     hors du domaine de la règle, et que la page 10 de `u07-l7a` redit.
//   - Les mots à consonne de tête, reconnus par le critère de CONTACT de la
//     page 5 de `u05-l5a` : un ห suivi immédiatement de ง, น, ม, ย, ว ou ร sans
//     signe posé sur lui, et un อ suivi de ย.
//   - Les graphies portant ◌์, qui éteint une lettre.
// Tout ce que le script ne sait pas trancher tombe dans un compartiment
// `non classé` qui est IMPRIMÉ, jamais absorbé dans un autre.
//
// CONVENTION D'ENTRÉE. La fonction `entriesOf` est reprise SANS MODIFICATION de
// `repo-thai-scan.mjs`, à l'ajout près du champ `ton`, dont ce script a besoin
// comme valeur et non comme simple présence. Les deux outils comptent donc
// exactement les mêmes graphies, ce qui est vérifiable en comparant le total
// imprimé ici au « graphies distinctes » de `repo-thai-scan.mjs`.
//
// Usage :
//   node scripts/verification/lecture-corpus.mjs <unite-min> <unite-max>
//   node scripts/verification/lecture-corpus.mjs <min> <max> --detail
//
// Les chemins sont résolus depuis la racine du dépôt.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");

// Classes des consonnes : RID, entrées « อักษรกลาง » (9), « อักษรสูง » (11) et
// « อักษรต่ำ » (24) ; corroborées lettre par lettre par la colonne `Class` de
// l'annexe « Appendix:Thai script » d'en.wiktionary. Mêmes trois ensembles que
// `table-des-tons.mjs`, recopiés ici volontairement pour que les deux outils
// restent lisibles séparément.
const HAUTE = new Set([..."ขฃฉฐถผฝศษสห"]);
const MOYENNE = new Set([..."กจฎฏดตบปอ"]);
const BASSE = new Set([..."คฅฆงชซฌญฑฒณทธนพฟภมยรลวฬฮ"]);

// Familles de finale, มาตรา. RID, entrées de lettres, relevé de `u05-l5a`.
// กก, กด, กบ ferment sur k, t, p et rendent la syllabe MORTE ; กง, กน, กม,
// เกย, เกอว la laissent VIVANTE.
const FIN_MORTE = new Set([..."กขคฅฆจฉชซฌฎฏฐฑฒดตถทธศษสบปพฟภ"]);
const FIN_VIVE = new Set([..."งญณนรลฬมยว"]);

// Groupes de consonnes attestés à l'initiale, อักษรควบแท้. Un groupe compte
// pour UNE initiale et c'est la PREMIÈRE lettre qui commande le ton
// (`u08-l8a` page 14, `u10-l10a` page 3).
const GROUPES = new Set([
  "กร",
  "กล",
  "กว",
  "ขร",
  "ขล",
  "ขว",
  "คร",
  "คล",
  "คว",
  "ตร",
  "ปร",
  "ปล",
  "ผล",
  "พร",
  "พล",
]);

const PRE = new Set([..."เแโ"]);
const MARQUES = new Set([..."่้๊๋"]);
const CONS = (c) => c !== undefined && c >= "ก" && c <= "ฮ";

// Noyaux de syllabe OUVERTE relevés sur le corpus publié, écrits en toutes
// lettres plutôt que devinés par un test de longueur générique. `reste` est ce
// qui suit l'unité initiale, marques de ton retirées.
const OUVERTE_LONGUE = new Set(["า", "ี", "ื", "ู", "อ", "ัว", "ีย", "ือ"]);
const OUVERTE_BREVE = new Set(["ะ", "ิ", "ึ", "ุ"]);

const TONS = ["moyen", "bas", "descendant", "haut", "montant"];

// Le tableau tel que le parcours l'enseigne, pour les syllabes VIVANTES :
// `u04-l4a` page 6, `u07-l7a` pages 4 et 5, `u08-l8a` page 11, récapitulé par
// `u10-l10a` page 2. Les syllabes MORTES n'y figurent pas, et c'est le fait que
// ce script sert à mesurer.
const TABLE = {
  "moyenne|rien": "moyen",
  "haute|rien": "montant",
  "basse|rien": "moyen",
  "moyenne|่": "bas",
  "haute|่": "bas",
  "basse|่": "descendant",
  "moyenne|้": "descendant",
  "haute|้": "descendant",
  "basse|้": "haut",
  "moyenne|๊": "haut",
  "moyenne|๋": "montant",
};

const classeDe = (lettre) =>
  HAUTE.has(lettre)
    ? "haute"
    : MOYENNE.has(lettre)
      ? "moyenne"
      : BASSE.has(lettre)
        ? "basse"
        : null;

function lessonFiles(minUnit, maxUnit) {
  const files = [];
  for (let unit = minUnit; unit <= maxUnit; unit += 1) {
    const dir = join(AUTHORING, `unite-${String(unit).padStart(2, "0")}`);
    let names;
    try {
      names = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of names.sort()) {
      if (/^lecon-.*\.md$/.test(name)) files.push(join(dir, name));
    }
  }
  return files;
}

// Reprise de `repo-thai-scan.mjs`, au champ `ton` près, rendu comme valeur.
function entriesOf(text) {
  const lines = text.split(/\r?\n/);
  const entries = [];
  let inItems = false;
  let block = [];

  const flush = () => {
    if (block.length === 0) return;
    const joined = block.join("\n");
    const thai = joined.match(/^-\s*`?thai`?\s*:\s*(\S.*?)\s*$/m);
    const ton = joined.match(/^-\s*`?ton`?\s*:\s*(\S.*?)\s*$/m);
    const longueur = joined.match(/^-\s*`?longueur`?\s*:\s*(\S.*?)\s*$/m);
    if (thai && ton)
      entries.push({
        thai: thai[1],
        ton: ton[1],
        longueur: longueur?.[1] ?? "",
      });
    block = [];
  };

  for (const line of lines) {
    if (/^##\s/.test(line)) {
      flush();
      inItems = /^##\s+Items\s*$/.test(line);
      continue;
    }
    if (!inItems) continue;
    if (/^#{3,}\s/.test(line)) {
      flush();
      continue;
    }
    block.push(line);
  }
  flush();
  return entries;
}

// Nombre de noms de ton présents dans le champ `ton`. Le contrat d'item impose
// un ton PAR syllabe : deux noms ou plus signalent une graphie polysyllabique.
const nombreDeTons = (champ) =>
  TONS.reduce((n, nom) => n + (champ.split(nom).length - 1), 0);

// Les quatre questions, appliquées à une graphie d'une seule syllabe.
function decode(graphie) {
  const G = graphie.normalize("NFC");

  if (!/^[฀-๿]+$/.test(G))
    return { sort: "hors mesure : pas une graphie simple" };
  if (/[๐-๙ๆๅ฿]/.test(G))
    return { sort: "hors mesure : pas une graphie simple" };
  if (/์/.test(G)) return { sort: "hors domaine : lettre éteinte par ◌์" };
  if (/[ไใำ]/.test(G) || /^เ.*า$/.test(G))
    return { sort: "hors domaine : forme en ไ, ใ, เ◌า ou ◌ำ" };

  // Question 1 : la consonne initiale. Une voyelle pré-posée s'écrit AVANT
  // elle et ne compte pas.
  let i = 0;
  const pre = PRE.has(G[0]) ? G[0] : null;
  if (pre) i = 1;

  // Consonne de tête, critère de contact de `u05-l5a` page 5.
  if (G[i] === "ห" && "งนมยวร".includes(G[i + 1] ?? ""))
    return { sort: "hors domaine : consonne de tête" };
  if (G[i] === "อ" && G[i + 1] === "ย")
    return { sort: "hors domaine : consonne de tête" };

  const initiale = G[i];
  if (!CONS(initiale)) return { sort: "non classé : initiale introuvable" };
  const classe = classeDe(initiale);
  if (classe === null)
    return { sort: "non classé : lettre hors des trois classes" };

  // Question 2 : la marque de ton.
  const marques = [...G].filter((c) => MARQUES.has(c));
  if (marques.length > 1) return { sort: "non classé : deux marques" };
  const marque = marques[0] ?? "rien";

  // Fin de l'unité initiale : un groupe attesté compte pour une seule initiale,
  // à condition qu'il reste quelque chose après lui.
  let fin = i;
  if (
    CONS(G[fin + 1]) &&
    GROUPES.has(initiale + G[fin + 1]) &&
    fin + 2 < G.length
  ) {
    fin += 1;
  }
  const reste = [...G.slice(fin + 1)].filter((c) => !MARQUES.has(c)).join("");

  // Question 3 : la finale. Une lettre-consonne en dernière position n'est pas
  // toujours une finale : อ, le ว de ◌ัว et le ย de เ◌ีย appartiennent à la
  // voyelle.
  const dernier = reste[reste.length - 1] ?? "";
  const avant = reste[reste.length - 2] ?? "";
  let finale = null;
  if (CONS(dernier)) {
    const estVoyelle =
      dernier === "อ" ||
      (dernier === "ว" && avant === "ั") ||
      (dernier === "ย" && avant === "ี" && pre === "เ");
    if (!estVoyelle) finale = dernier;
  }

  // Question 4 : vivante ou morte.
  let type = null;
  if (finale !== null) {
    if (FIN_MORTE.has(finale)) type = "morte";
    else if (FIN_VIVE.has(finale)) type = "vivante";
  } else if (OUVERTE_LONGUE.has(reste)) type = "vivante";
  else if (OUVERTE_BREVE.has(reste)) type = "morte";
  else if (reste === "" && pre) type = "vivante"; // เ◌, แ◌, โ◌ : voyelles longues
  if (type === null)
    return { sort: "non classé : forme de syllabe non reconnue" };

  return {
    sort: type === "vivante" ? "vivante" : "morte",
    classe,
    marque,
    finale,
    predit: TABLE[`${classe}|${marque}`] ?? null,
  };
}

const [a, b, ...reste] = process.argv.slice(2);
const detail = reste.includes("--detail");
const min = Number(a);
const max = Number(b);
if (!Number.isInteger(min) || !Number.isInteger(max)) {
  console.error(
    "usage: node scripts/verification/lecture-corpus.mjs <unite-min> <unite-max> [--detail]",
  );
  process.exit(2);
}

const premiere = new Map();
const files = lessonFiles(min, max);
let nbEntrees = 0;
for (const file of files) {
  for (const e of entriesOf(readFileSync(file, "utf8"))) {
    nbEntrees += 1;
    if (!premiere.has(e.thai)) premiere.set(e.thai, { ...e, file });
  }
}

const seaux = new Map();
const range = (cle, ligne) => {
  if (!seaux.has(cle)) seaux.set(cle, []);
  seaux.get(cle).push(ligne);
};

for (const [graphie, e] of premiere) {
  if (nombreDeTons(e.ton) !== 1) {
    range("hors mesure : plusieurs syllabes", graphie);
    continue;
  }
  const d = decode(graphie);
  const publie = TONS.find((t) => e.ton.includes(t)) ?? "?";
  if (d.sort !== "vivante" && d.sort !== "morte") {
    range(
      d.sort,
      `${graphie}\t${publie}\t${e.file.split(/[\\/]/).slice(-2).join("/")}`,
    );
    continue;
  }
  const juste = d.predit === publie;
  const ligne = `${graphie}\t${d.classe}|${d.marque}\tfinale=${d.finale ?? "aucune"}\ttableau=${d.predit}\tpublié=${publie}`;
  if (d.sort === "vivante") {
    range(juste ? "VIVANTE, tableau juste" : "VIVANTE, ÉCART", ligne);
    continue;
  }
  range(juste ? "morte, tableau juste" : "morte, tableau FAUX", ligne);

  // Contrôle SÉPARÉ, qui ne sert AUCUN écran d'apprenant : la règle de ton des
  // syllabes mortes est écrite dans les trois entrées de classe du RID
  // (« อักษรกลาง », « อักษรสูง », « อักษรต่ำ »), mais le parcours ne l'enseigne
  // pas, faute d'une seconde autorité (`u10-l10a`, incertitude 1). Ce compteur
  // mesure si le corpus publié la contredit, rien de plus. Il n'est appliqué
  // qu'aux mortes SANS marque écrite : les entrées du RID énoncent un « ton de
  // base », donc le cas non marqué.
  if (d.marque !== "rien") continue;
  const l = e.longueur ?? "";
  const longue = /long/i.test(l);
  const breve = /court|brèv|brev/i.test(l);
  if (longue === breve) {
    range(
      "mortes, longueur non déclarée",
      `${graphie}\t${d.classe}\tlongueur=« ${l} »`,
    );
    continue;
  }
  const attendu =
    d.classe === "basse" ? (breve ? "haut" : "descendant") : "bas";
  range(
    attendu === publie
      ? "mortes sans marque, RID confirmé"
      : "mortes sans marque, RID CONTREDIT",
    `${graphie}\t${d.classe}\t${breve ? "brève" : "longue"}\tRID=${attendu}\tpublié=${publie}`,
  );
}

const n = (cle) => (seaux.get(cle) ?? []).length;

console.log(`# unités ${min} à ${max}`);
console.log(`fichiers lecon-*.md      : ${files.length}`);
console.log(`entrées (thai + ton)     : ${nbEntrees}`);
console.log(`graphies distinctes      : ${premiere.size}\n`);

const ordre = [
  "VIVANTE, tableau juste",
  "VIVANTE, ÉCART",
  "morte, tableau FAUX",
  "morte, tableau juste",
  "hors domaine : forme en ไ, ใ, เ◌า ou ◌ำ",
  "hors domaine : consonne de tête",
  "hors domaine : lettre éteinte par ◌์",
  "hors mesure : plusieurs syllabes",
  "hors mesure : pas une graphie simple",
  "non classé : initiale introuvable",
  "non classé : lettre hors des trois classes",
  "non classé : deux marques",
  "non classé : forme de syllabe non reconnue",
];
// Compteurs de CONTRÔLE, qui portent sur des graphies déjà comptées plus haut
// et n'entrent donc pas dans le total.
const CONTROLE = [
  "mortes sans marque, RID confirmé",
  "mortes sans marque, RID CONTREDIT",
  "mortes, longueur non déclarée",
];
let total = 0;
for (const cle of ordre) {
  total += n(cle);
  console.log(`${cle.padEnd(42)} ${String(n(cle)).padStart(4)}`);
}
for (const cle of seaux.keys()) {
  if (!ordre.includes(cle) && !CONTROLE.includes(cle)) {
    total += n(cle);
    console.log(
      `${cle.padEnd(42)} ${String(n(cle)).padStart(4)}  <- compartiment imprévu`,
    );
  }
}
console.log(`${"TOTAL".padEnd(42)} ${String(total).padStart(4)}`);
if (total !== premiere.size) {
  console.log(
    "\nATTENTION : le total ne retombe pas sur le nombre de graphies.",
  );
  process.exitCode = 1;
}

console.log("\n# contrôle séparé, n'entre pas dans le total ci-dessus");
console.log(
  "# la règle de ton des syllabes MORTES n'est enseignée nulle part ;",
);
console.log("# ce compteur mesure seulement si le corpus publié la contredit.");
for (const cle of CONTROLE)
  console.log(`${cle.padEnd(42)} ${String(n(cle)).padStart(4)}`);

console.log(
  "\nLes ÉCARTS de la colonne VIVANTE sont à ouvrir un par un sur une",
);
console.log(
  "troisième autorité. Les MORTES ne sont pas des écarts : le tableau",
);
console.log("ne parle pas d'elles, et le parcours enseigne de s'y arrêter.\n");

for (const cle of [
  "VIVANTE, ÉCART",
  "non classé : forme de syllabe non reconnue",
  "mortes sans marque, RID CONTREDIT",
  "mortes, longueur non déclarée",
]) {
  if (n(cle) === 0) continue;
  console.log(`--- ${cle} ---`);
  for (const l of seaux.get(cle)) console.log("  " + l);
  console.log("");
}

if (detail) {
  for (const cle of [...ordre, ...CONTROLE]) {
    if (n(cle) === 0) continue;
    console.log(`--- ${cle} (${n(cle)}) ---`);
    for (const l of seaux.get(cle)) console.log("  " + l);
    console.log("");
  }
}
