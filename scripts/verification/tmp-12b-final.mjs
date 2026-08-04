// Contrôles finaux de consolidation de 12B : fidélité des réemplois,
// transcription v1.1, décodabilité. Fichier de travail, non versionné.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");
const F = join(AUTHORING, "unite-12", "lecon-12b.md");
const txt = readFileSync(F, "utf8");

function lessonFiles(a, b) {
  const out = [];
  for (let u = a; u <= b; u += 1) {
    const d = join(AUTHORING, `unite-${String(u).padStart(2, "0")}`);
    let names;
    try {
      names = readdirSync(d);
    } catch {
      continue;
    }
    for (const n of names.sort())
      if (/^lecon-.*\.md$/.test(n)) out.push(join(d, n));
  }
  return out;
}
function entriesOf(text) {
  const lines = text.split(/\r?\n/);
  const res = [];
  let inI = false;
  let block = [];
  const field = (j, n) => {
    const m = j.match(
      new RegExp(`^-\\s*\`?${n}\`?\\s*:\\s*(\\S.*?)\\s*$`, "m"),
    );
    return m ? m[1] : null;
  };
  const flush = () => {
    if (!block.length) return;
    const j = block.join("\n");
    const th = field(j, "thai");
    if (th && /^-\s*`?ton`?\s*:/m.test(j))
      res.push({ thai: th, transcription: field(j, "transcription") });
    block = [];
  };
  for (const l of lines) {
    if (/^##\s/.test(l)) {
      flush();
      inI = /^##\s+Items\s*$/.test(l);
      continue;
    }
    if (!inI) continue;
    if (/^#{3,}\s/.test(l)) {
      flush();
      continue;
    }
    block.push(l);
  }
  flush();
  return res;
}

const corpus = new Map();
for (const f of lessonFiles(1, 11))
  for (const e of entriesOf(readFileSync(f, "utf8"))) {
    if (!e.transcription) continue;
    if (!corpus.has(e.thai)) corpus.set(e.thai, new Set());
    corpus.get(e.thai).add(e.transcription.replace(/`/g, "").trim());
  }

// Tableau de la partie 2 : graphie | leçon | transcription.
const re = /^\|\s*([฀-๿]+)\s*\|\s*`([^`]+)`([^|]*)\|\s*`([^`]+)`\s*\|$/gm;
let m;
let n = 0;
let ecarts = 0;
let absentes = 0;
while ((m = re.exec(txt))) {
  n += 1;
  const [, g, , , tr] = m;
  const pub = corpus.get(g);
  if (!pub) {
    absentes += 1;
    console.log(`ABSENTE   ${g}`);
    continue;
  }
  if (!pub.has(tr)) {
    ecarts += 1;
    console.log(`ÉCART     ${g} : cité ${tr}, publié ${[...pub].join(" | ")}`);
  }
}
console.log(
  `tableau partie 2 : ${n} lignes, ${absentes} graphie(s) non publiée(s), ${ecarts} écart(s) de transcription`,
);

// Décodabilité : toute chaîne thaïe des écrans est publiée comme item,
// ou déclarée à la partie 2 comme chaîne hors matériel.
const lines = txt.split(/\r?\n/);
const cut = lines.findIndex((l) => l === "## Dossier de production");
const ecrans = lines.slice(0, cut).join("\n");
const RUN = /[฀-๿]+/g;
const surEcran = new Set();
for (const x of ecrans.matchAll(RUN)) surEcran.add(x[0]);
const declarees = new Set([
  "ได้ไหม",
  "ได้",
  "ไม่",
  "ดุ",
  "ดู",
  "น้า",
  "อ้า",
  "อก",
  "ออ",
  "่",
  "้",
  "ห",
  "ข",
  "ป",
  "ส",
  "ง",
  "น",
  "ม",
  "ย",
  "ร",
  "ว",
  "ไ",
]);
const orphelines = [...surEcran].filter(
  (g) => !corpus.has(g) && !declarees.has(g),
);
console.log(
  `décodabilité : ${surEcran.size} chaînes d'écran, ${orphelines.length} non rattachée(s) ${orphelines.join(" ")}`,
);

// Blocs d'affichage des pages : « > **graphie** · transcription · glose ».
let nb = 0;
let mauvais = 0;
for (const x of txt.matchAll(/^> \*\*([฀-๿]+)\*\* · ([^ ·]+) ·/gm)) {
  nb += 1;
  const pub = corpus.get(x[1]);
  if (!pub) {
    mauvais += 1;
    console.log(`AFFICHÉ NON PUBLIÉ ${x[1]}`);
  } else if (!pub.has(x[2])) {
    mauvais += 1;
    console.log(
      `AFFICHÉ ÉCART ${x[1]} : ${x[2]} contre ${[...pub].join(" | ")}`,
    );
  }
}
console.log(`blocs d'affichage : ${nb}, écarts : ${mauvais}`);

// Réponses de l'exercice 4.
const ex4 = [...txt.matchAll(/→ `([^`]+)`\./g)].map((x) => x[1]);
console.log(
  `réponses ex.4 : ${ex4.length}, distinctes : ${new Set(ex4).size} — ${ex4.join(" ")}`,
);

// Transcription v1.1 : formes proscrites dans les transcriptions citées.
const trs = [...txt.matchAll(/`([a-zA-Zàâáǎèêéěìîíǐòôóǒùûúǔ·̀-̌ ]{2,})`/g)]
  .map((x) => x[1])
  .filter((s) => /[a-z]/.test(s));
const suspects = trs.filter((s) => /(é|è|ê|eu|oû|û)/.test(s));
console.log(
  `transcriptions citées entre accents graves : ${trs.length}, formes v1.0 résiduelles : ${suspects.length} ${[...new Set(suspects)].join(" ")}`,
);
