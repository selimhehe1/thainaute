// Mesure empirique des NEUF cases vivantes du tableau des tons, sur VOLUBILIS.
//
// POURQUOI CE SCRIPT EXISTE. `u04-l4a` a mesuré empiriquement deux cases du
// tableau, moyenne et haute SANS marque, sur 429 entrées, et a écrit son
// protocole en toutes lettres dans son dossier. Les sept autres cases,
// installées par `u06-l6a`, `u07-l7a` et `u08-l8a`, n'ont jamais reçu la même
// mesure : elles reposent sur l'énoncé normatif du RID et sur une poignée
// d'IPA relevés à la main. `u10-l10a`, qui RÉCAPITULE le tableau entier et
// n'enseigne rien de neuf, avait besoin de le vérifier en entier plutôt que
// de le recopier. Le protocole de 4A est donc repris et ÉTENDU ici, et rendu
// recomputable par un tiers, ce qu'exige l'amendement v1.2 des conventions.
//
// CE QUE LE SCRIPT MESURE, ET CE QU'IL NE MESURE PAS. Il compte, sur les
// entrées monosyllabiques de VOLUBILIS dont la forme de syllabe est VIVANTE et
// l'attaque simple, le marqueur de ton de la colonne `ThaiPhon`, croisé avec
// la classe de la consonne initiale et la marque éventuellement écrite. Il ne
// mesure RIEN des syllabes mortes, qu'aucune leçon du parcours n'enseigne au
// 2026-08-04, ni des formes en ไ, ใ, เ◌า et ◌ำ, que la page 8 de `u04-l4a`
// met explicitement hors du domaine de la règle, ni des mots à consonne de
// tête, que la page 10 de `u07-l7a` met dehors elle aussi.
//
// FILTRES, et le motif de chacun.
//   - graphie sans espace, `ThaiPhon` sans espace : écarte les syntagmes dont
//     les colonnes sont désalignées. Filtre repris tel quel de `u04-l4a`.
//   - aucun ◌๊, ◌๋ ni ◌์ : les deux premières marques ne se rencontrent en
//     syllabe vivante que sur une consonne moyenne (page 9 de `u08-l8a`) et
//     feraient une case à trois entrées ; la troisième éteint une lettre et
//     changerait la forme de syllabe.
//   - au plus UNE marque écrite.
//   - la graphie doit correspondre à l'une des formes de syllabe vivante
//     listées ci-dessous, attaque simple, ce qui écarte les groupes et les
//     attaques ambiguës.
//   - attaque ห ou อ suivie immédiatement d'une consonne : écartée, c'est la
//     consonne de tête, hors tableau.
//   - EXACTEMENT un marqueur de ton dans `ThaiPhon`. Ce filtre a été ajouté
//     après une première passe : sans lui, des mots comme แสม, โสน et แถง,
//     que VOLUBILIS lit sa·maē, sa·nō et ta·ngaē, entraient dans la mesure
//     comme monosyllabes et en ressortaient comme contre-exemples. Ce sont
//     précisément les « deux consonnes qui ne forment pas un groupe » dont la
//     page 14 de `u08-l8a` dit qu'on ne peut pas les deviner à l'œil.
//
// Usage :
//   node scripts/verification/table-des-tons.mjs <VOLUBILIS_Database.xlsx>
//
// Sortie : une ligne par case, avec l'effectif et la répartition observée des
// tons, puis la liste des divergences. Une divergence n'est PAS un
// contre-exemple tant qu'elle n'a pas été ouverte sur une troisième autorité :
// la colonne `ThaiPhon` est une transcription d'auteur, et les divergences
// relevées le 2026-08-04 se sont toutes révélées être des erreurs de cette
// colonne.
//
// PIÈGE ÉVITÉ, hérité de `volubilis-lookup.mjs` : ne jamais faire transiter le
// XML par la sortie standard de PowerShell, qui détruit silencieusement le
// thaï. Les entrées du zip sont extraites vers des fichiers, puis lues en UTF-8.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [archivePath] = process.argv.slice(2);

if (archivePath === undefined) {
  console.error(
    "usage: node scripts/verification/table-des-tons.mjs <VOLUBILIS_Database.xlsx>",
  );
  process.exit(2);
}

const bytes = readFileSync(archivePath);
console.log(
  `fichier : ${archivePath}\noctets  : ${bytes.length}\nsha256  : ${createHash("sha256").update(bytes).digest("hex")}\n`,
);

const workDir = mkdtempSync(join(tmpdir(), "table-des-tons-"));
let rows = [];
try {
  execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Add-Type -AssemblyName System.IO.Compression.FileSystem;` +
        `[System.IO.Compression.ZipFile]::ExtractToDirectory(` +
        `'${archivePath.replaceAll("'", "''")}','${workDir.replaceAll("'", "''")}')`,
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );

  const shared = [];
  const sharedXml = readFileSync(
    join(workDir, "xl", "sharedStrings.xml"),
    "utf8",
  );
  for (const item of sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    shared.push(
      [...(item[1] ?? "").matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
        .map((match) => match[1] ?? "")
        .join("")
        .replaceAll("&amp;", "&")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">"),
    );
  }

  const sheetXml = readFileSync(
    join(workDir, "xl", "worksheets", "sheet1.xml"),
    "utf8",
  );
  const cells = new Map();
  for (const cell of sheetXml.matchAll(
    /<c r="([A-Z]+)(\d+)"([^>]*)>(?:<v>([\s\S]*?)<\/v>)?/g,
  )) {
    const [, column, row, attributes, raw] = cell;
    if (raw === undefined) continue;
    const value = /t="s"/.test(attributes ?? "")
      ? (shared[Number(raw)] ?? "")
      : raw;
    const key = Number(row);
    if (!cells.has(key)) cells.set(key, {});
    cells.get(key)[column] = value;
  }
  // Colonne E : graphie thaïe. Colonne C : ThaiPhon, dont le premier caractère
  // est le marqueur de ton de la première syllabe (feuille `Codes`, clé TONES).
  rows = [...cells.entries()].map(([n, c]) => ({
    n,
    tha: c.E ?? "",
    phon: c.C ?? "",
  }));
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

// Classes des consonnes : RID, entrées « อักษรกลาง » (9 lettres),
// « อักษรสูง » (11) et « อักษรต่ำ » (24), relevées le 2026-08-04 ; corroborées
// lettre par lettre par la colonne `Class` de l'annexe « Appendix:Thai script »
// d'en.wiktionary.
const HAUTE = new Set([..."ขฃฉฐถผฝศษสห"]);
const MOYENNE = new Set([..."กจฎฏดตบปอ"]);
const BASSE = new Set([..."คฅฆงชซฌญฑฒณทธนพฟภมยรลวฬฮ"]);

const EK = "่";
const THO = "้";
const SONANTE = "[งนมยว]";
const PRE = "[เแโ]"; // ใ et ไ sont EXCLUS : hors domaine, page 8 de `u04-l4a`.
const CONSONNE = "[ก-ฮ]";

// Formes de syllabe VIVANTE, attaque simple, portant EXACTEMENT une marque.
const FORMES_MARQUEES = [
  new RegExp(`^(${CONSONNE})[${EK}${THO}]า$`),
  new RegExp(`^(${CONSONNE})[ีูื][${EK}${THO}]$`),
  new RegExp(`^(${CONSONNE})[${EK}${THO}]า${SONANTE}$`),
  new RegExp(`^(${CONSONNE})ั[${EK}${THO}]${SONANTE}$`),
  new RegExp(`^(${CONSONNE})[${EK}${THO}]อ${SONANTE}?$`),
  new RegExp(`^${PRE}(${CONSONNE})[${EK}${THO}]${SONANTE}?$`),
  new RegExp(`^(${CONSONNE})[ีูื][${EK}${THO}]${SONANTE}$`),
];

// Les mêmes formes, sans aucune marque.
const FORMES_NUES = [
  new RegExp(`^(${CONSONNE})า$`),
  new RegExp(`^(${CONSONNE})[ีูื]$`),
  new RegExp(`^(${CONSONNE})า${SONANTE}$`),
  new RegExp(`^(${CONSONNE})ั${SONANTE}$`),
  new RegExp(`^(${CONSONNE})อ${SONANTE}?$`),
  new RegExp(`^${PRE}(${CONSONNE})${SONANTE}?$`),
  new RegExp(`^(${CONSONNE})[ีูื]${SONANTE}$`),
];

const classeDe = (lettre) =>
  HAUTE.has(lettre)
    ? "haute"
    : MOYENNE.has(lettre)
      ? "moyenne"
      : BASSE.has(lettre)
        ? "basse"
        : null;

// Feuille `Codes` du classeur, clé TONES.
const TON = {
  "-": "moyen",
  _: "bas",
  "\\": "descendant",
  "¯": "haut",
  "/": "montant",
};

// Le tableau tel que le parcours l'enseigne : `u04-l4a` page 6 pour la colonne
// sans marque, `u07-l7a` pages 4 et 5 pour les deux marques, `u08-l8a` page 11
// pour la synthèse. Les deux cases de ◌๊ et ◌๋ ne sont pas mesurées ici.
const ATTENDU = {
  "moyenne|rien": "moyen",
  "haute|rien": "montant",
  "basse|rien": "moyen",
  "moyenne|ek": "bas",
  "haute|ek": "bas",
  "basse|ek": "descendant",
  "moyenne|tho": "descendant",
  "haute|tho": "descendant",
  "basse|tho": "haut",
};

const compte = new Map();
const divergences = [];
let retenues = 0;

for (const { n, tha, phon } of rows) {
  const graphie = (tha || "").normalize("NFC").trim();
  if (graphie === "" || /\s/.test(graphie) || /\s/.test(phon || "")) continue;
  if (/[๊๋์]/.test(graphie)) continue;

  const marques = [...graphie].filter((c) => c === EK || c === THO);
  if (marques.length > 1) continue;

  let initiale = null;
  for (const forme of marques.length === 1 ? FORMES_MARQUEES : FORMES_NUES) {
    const trouve = graphie.match(forme);
    if (trouve) {
      initiale = trouve[1];
      break;
    }
  }
  if (initiale === null) continue;

  const sansPreposee = graphie.replace(new RegExp(`^${PRE}`), "");
  if (/^[หอ][ก-ฮ]/.test(sansPreposee)) continue;

  const classe = classeDe(initiale);
  if (classe === null) continue;

  const marqueursPhon = [...(phon || "")].filter((c) => c in TON).length;
  if (marqueursPhon !== 1) continue;

  const ton = TON[(phon || "")[0]];
  if (ton === undefined) continue;

  retenues += 1;
  const cle = `${classe}|${marques.length === 0 ? "rien" : marques[0] === EK ? "ek" : "tho"}`;
  if (!compte.has(cle)) compte.set(cle, new Map());
  const sous = compte.get(cle);
  sous.set(ton, (sous.get(ton) ?? 0) + 1);
  if (ton !== ATTENDU[cle]) divergences.push({ n, graphie, phon, cle, ton });
}

console.log(`lignes du classeur : ${rows.length}`);
console.log(`entrées retenues   : ${retenues}\n`);

for (const cle of Object.keys(ATTENDU)) {
  const sous = compte.get(cle) ?? new Map();
  const total = [...sous.values()].reduce((a, b) => a + b, 0);
  const detail = [...sous.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([ton, n]) => `${ton}=${n}`)
    .join(" ");
  console.log(
    `${cle.padEnd(14)} attendu ${ATTENDU[cle].padEnd(11)} n=${String(total).padStart(4)}  ${detail}`,
  );
}

console.log(`\ndivergences de la colonne ThaiPhon : ${divergences.length}`);
for (const d of divergences) {
  console.log(`  ligne ${d.n}\t${d.graphie}\t${d.phon}\t${d.cle} -> ${d.ton}`);
}
console.log(
  "\nUne divergence n'est pas un contre-exemple : l'ouvrir sur une troisième" +
    "\nautorité avant toute conclusion.",
);
