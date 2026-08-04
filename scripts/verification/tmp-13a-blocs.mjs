// Contre-audit de `u13-l13a` : contrôle ligne à ligne du tableau « Blocs
// réemployés, et leur leçon de publication ».
//
// POURQUOI CE SCRIPT EXISTE. `lecon-13a.md` écrit, à son état des audits,
// « Réemploi : vérifié par relecture manuelle, 40 lignes de blocs comparées à
// leur leçon d'origine le 2026-08-04, 0 écart de transcription ». Le tableau
// n'est comparable par aucun script du dépôt : `item-fields-check.mjs` ne suit
// que la référence portée dans le TITRE d'un item, jamais les lignes d'un
// tableau de dossier. Les 40 lignes sont donc recopiées ici telles qu'elles
// sont écrites dans le fichier, puis confrontées au champ `transcription` et au
// numéro d'item réels de la leçon citée.
//
// Usage :
//   node scripts/verification/tmp-13a-blocs.mjs
//
// Sortie : une ligne par écart, puis un décompte. Aucun réseau, aucune
// dépendance.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");

// MISE À JOUR DE CONSOLIDATION, 2026-08-04. Les lignes ci-dessous suivent le
// tableau CORRIGÉ, de sorte que ce script reste un contrôle vivant du fichier
// et non l'archive d'un état révolu. Deux lignes ont changé, et ce sont les
// deux findings que ce script avait rendus :
//   - « สบายดี / สบายดีไหม » citait `sà·baai·dii / sà·baai·dii·mǎi` alors que
//     `u02-l2e` item 11 publie `sà·baai dii / sà·baai dii mǎi`, avec des
//     ESPACES. C'était le seul écart des 41 contrôles, et l'état des audits le
//     donnait pour inexistant. Le tableau porte désormais la valeur publiée ;
//     le désaccord de corpus sous-jacent, `u02-l2b` écrivant `sà·baai·dii`,
//     part à l'arbitrage 11 de la leçon ;
//   - « ไหม » citait `u01-l1d` item 9, c'est-à-dire la SOIE, pour une ligne qui
//     porte la particule. Le tableau porte désormais DEUX lignes, la particule
//     sur `u02-l2e` item 10 et la soie sur `u01-l1d` item 9, cette dernière
//     servant la paire de tons du tirage 11 de l'exercice 1.
// Le décompte attendu est donc maintenant : 42 contrôles, 0 écart.
//
// Les 41 lignes du tableau, recopiées telles quelles : graphie, leçon citée,
// numéro d'item cité, transcription citée.
const LIGNES = [
  ["ครับ", "u01-l1e", 2, "khráp"],
  ["ค่ะ", "u01-l1e", 3, "khâ"],
  ["คะ", "u02-l2e", 1, "khá"],
  ["ไหม", "u02-l2e", 10, "mǎi"],
  ["ไหม", "u01-l1d", 9, "mǎi"],
  ["ไม้", "u01-l1d", 10, "máai"],
  ["ไม่", "u04-l4d", 1, "mâi"],
  ["ปา", "u01-l1c", 1, "paa"],
  ["ป่า", "u01-l1c", 2, "pàa"],
  ["ปู", "u01-l1c", 3, "pouu"],
  ["แล้วเจอกัน", "u01-l1e", 5, "láeew·joee·kan"],
  ["สวัสดีครับ", "u02-l2b", 2, "sà·wàt·dii khráp"],
  ["สวัสดีค่ะ", "u02-l2b", 3, "sà·wàt·dii khâ"],
  ["สบายดีไหมครับ", "u02-l2b", 4, "sà·baai·dii·mǎi khráp"],
  ["สบายดีไหมคะ", "u02-l2b", 5, "sà·baai·dii·mǎi khá"],
  ["สบายดีครับ", "u02-l2b", 6, "sà·baai·dii khráp"],
  ["สบายดีค่ะ", "u02-l2b", 7, "sà·baai·dii khâ"],
  ["สบายดี / สบายดีไหม", "u02-l2e", 11, "sà·baai dii / sà·baai dii mǎi"],
  ["ขอบคุณครับ", "u02-l2c", 1, "khàwwp·khoun khráp"],
  ["ไม่เป็นไร", "u02-l2c", 3, "mâi·pen·rai"],
  ["ไป", "u05-l5b", 1, "pai"],
  ["ห้องน้ำ", "u05-l5c", 5, "hâwng·náam"],
  ["อยู่", "u05-l5c", 1, "yòuu"],
  ["ที่ไหน", "u05-l5c", 2, "thîi·nǎi"],
  ["ห้องน้ำอยู่ที่ไหนครับ", "u05-l5c", 7, "hâwng·náam yòuu thîi·nǎi khráp"],
  ["ตลาดอยู่ที่ไหน", "u05-l5e", 7, "tà·làat yòuu thîi·nǎi"],
  ["แล้วคุณล่ะ", "u06-l6e", 2, "láeew khoun lâ"],
  ["ล่ะ", "u06-l6e", 1, "lâ"],
  ["คุณ", "u02-l2d", 4, "khoun"],
  ["มี", "u06-l6b", 7, "mii"],
  ["ยา", "u01-l1c", 9, "yaa"],
  [
    "มียาไหมครับ / มียาไหมคะ",
    "u09-l9d",
    5,
    "mii yaa mǎi khráp / mii yaa mǎi khá",
  ],
  ["แล้ว", "u09-l9d", 6, "láeew"],
  [
    "กี่วันแล้วครับ / กี่วันแล้วคะ",
    "u09-l9d",
    7,
    "kìi wan láeew khráp / kìi wan láeew khá",
  ],
  ["สองวันแล้ว", "u09-l9d", 8, "sǎwwng wan láeew"],
  ["ปวดหัว", "u09-l9b", 3, "pòuat·hǒua"],
  ["ผมปวดหัวครับ", "u09-l9b", 7, "phǒm pòuat·hǒua khráp"],
  [
    "ปวดหัวไหมครับ / ปวดหัวไหมคะ",
    "u09-l9e",
    9,
    "pòuat·hǒua mǎi khráp / pòuat·hǒua mǎi khá",
  ],
  ["ไปหาหมอ", "u09-l9e", 2, "pai hǎa mǎww"],
  [
    "ไปหาหมอไหมครับ / ไปหาหมอไหมคะ",
    "u09-l9e",
    8,
    "pai hǎa mǎww mǎi khráp / pai hǎa mǎww mǎi khá",
  ],
  ["ไปครับ / ไปค่ะ", "u09-l9e", 10, "pai khráp / pai khâ"],
  ["ผมไม่สบายครับ", "u09-l9e", 3, "phǒm mâi sà·baai khráp"],
];

function fichier(ref) {
  const m = ref.match(/^u(\d\d)-l(\d)([a-e])$/);
  return join(AUTHORING, "unite-" + m[1], "lecon-" + m[2] + m[3] + ".md");
}

// Même lecture de champ que `item-fields-check.mjs`, sans le drapeau `m`.
function champ(bloc, nom) {
  const re = new RegExp(
    "(?:^|\\n)- `" + nom + "` ?: ?([\\s\\S]*?)(?=\\n- `|\\n#|\\n\\n|$)",
  );
  const m = bloc.match(re);
  return m ? m[1].replace(/\s+/g, " ").trim() : undefined;
}

let ecarts = 0;
let moities = 0;

for (const [graphie, ref, numero, transcription] of LIGNES) {
  const texte = readFileSync(fichier(ref), "utf8");
  const blocs = texte.split(/^#{3,4} /m).slice(1);

  let bloc = blocs.find((b) => champ(b, "thai") === graphie);
  let partiel = false;
  if (bloc === undefined) {
    // Le tableau cite parfois une MOITIÉ d'un champ `thai` à deux graphies.
    bloc = blocs.find((b) => {
      const t = champ(b, "thai");
      return (
        t !== undefined &&
        t
          .split(/\s+\/\s+|\s+·\s+/)
          .some((g) => g.replace(/\s*\(.*?\)\s*/g, "").trim() === graphie)
      );
    });
    partiel = bloc !== undefined;
  }

  if (bloc === undefined) {
    ecarts += 1;
    console.log(`!! ${graphie} : introuvable comme champ \`thai\` dans ${ref}`);
    continue;
  }
  if (partiel) moities += 1;

  const titre = bloc.split("\n")[0].trim();
  const mnum = titre.match(/Item (\d+)/);
  const numeroReel = mnum ? Number(mnum[1]) : undefined;
  const trReel = champ(bloc, "transcription");

  if (numeroReel !== numero) {
    ecarts += 1;
    console.log(
      `~~ ${graphie} [${ref}] numéro d'item cité ${numero}, réel ${numeroReel}`,
    );
  }
  if (!partiel && trReel !== transcription) {
    ecarts += 1;
    console.log(`~~ ${graphie} [${ref}] transcription`);
    console.log(`     citée par 13A : ${transcription}`);
    console.log(`     publiée par ${ref} : ${trReel}`);
  }
  if (partiel && trReel !== undefined && !trReel.includes(transcription)) {
    ecarts += 1;
    console.log(`~~ ${graphie} [${ref}] transcription (moitié de champ)`);
    console.log(`     citée par 13A : ${transcription}`);
    console.log(`     publiée par ${ref} : ${trReel}`);
  }
}

console.log(`\nlignes contrôlées   : ${LIGNES.length}`);
console.log(`dont moitiés de champ : ${moities}`);
console.log(`écarts               : ${ecarts}`);
