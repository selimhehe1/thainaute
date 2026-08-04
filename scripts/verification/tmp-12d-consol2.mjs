// Contrôles complémentaires de consolidation de `lecon-12d.md`, 2026-08-04.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");

function lessonFiles(a, b) {
  const f = [];
  for (let u = a; u <= b; u += 1) {
    const d = join(AUTHORING, `unite-${String(u).padStart(2, "0")}`);
    let n;
    try {
      n = readdirSync(d);
    } catch {
      continue;
    }
    for (const x of n.sort()) if (/^lecon-.*\.md$/.test(x)) f.push(join(d, x));
  }
  return f;
}

const short = (f) => f.replace(ROOT, "").split("\\").join("/");
const PART = /kh(ráp|â|á)(?![a-zà-ÿ·])/g;

console.log(
  "# 1. Corrigés recall (unités 1-11) : chaînes backtickées à >=2 particules",
);
let n = 0;
let nbRecall = 0;
for (const f of lessonFiles(1, 11)) {
  const t = readFileSync(f, "utf8");
  for (const sec of t.split(/^### /m)) {
    if (!/Mécanique\s*:\s*`recall`/.test(sec)) continue;
    nbRecall += 1;
    const titre = sec.split("\n")[0];
    for (const m of sec.matchAll(/`([^`\n]{4,200})`/g)) {
      const s = m[1];
      const c = (s.match(PART) ?? []).length;
      if (c >= 2) {
        n += 1;
        console.log(`${short(f)}\t${titre.slice(0, 38)}\t${c}\t${s}`);
      }
    }
  }
}
console.log(
  `exercices recall balayés : ${nbRecall} ; corrigés a >=2 particules : ${n}`,
);

console.log(
  "\n# 2. Tirages word_order des unités 1-11 portant >=2 blocs-particules",
);
const partThai = /^(ครับ|ค่ะ|คะ|ค่ะ\/ครับ|ครับ\/ค่ะ)$/;
const tally = new Map();
for (const f of lessonFiles(1, 11)) {
  const t = readFileSync(f, "utf8");
  for (const sec of t.split(/^### /m)) {
    if (!/Mécanique\s*:\s*`word_order`/.test(sec)) continue;
    const titre = sec.split("\n")[0];
    for (const line of sec.split(/\r?\n/)) {
      const blocs = [...line.matchAll(/\[([^\]]+)\]/g)].map((x) => x[1].trim());
      if (blocs.length === 0) continue;
      const nb = blocs.filter((b) => partThai.test(b)).length;
      tally.set(nb, (tally.get(nb) ?? 0) + 1);
      if (nb >= 2) {
        console.log(
          `${short(f)}\t${titre.slice(0, 34)}\tparticules ${nb}\t${line.trim().slice(0, 150)}`,
        );
      }
    }
  }
}
console.log(
  "repartition (particules -> nb de lignes) :",
  [...tally.entries()].sort(),
);

console.log(
  "\n# 3. Lignes de section Dialogue des unités 1-11 portant >=3 particules",
);
const partAny = /(ครับ|ค่ะ|คะ)(?=\s|$|\|)/g;
for (const f of lessonFiles(1, 11)) {
  const t = readFileSync(f, "utf8");
  let inDia = false;
  for (const line of t.split(/\r?\n/)) {
    if (/^##\s/.test(line)) inDia = /^##\s+Dialogue\s*$/.test(line);
    if (!inDia) continue;
    const c = (line.match(partAny) ?? []).length;
    if (c >= 3) console.log(`${short(f)}\t${c}\t${line.trim().slice(0, 170)}`);
  }
}

// 4. Relevé morceau par morceau du dialogue de 12D contre les formes publiées
//    par les unités 1 à 11, formes doubles `X / Y` éclatées. Appuie la partie 4.
function entriesOf(text) {
  const lines = text.split(/\r?\n/);
  const e = [];
  let inI = false;
  let b = [];
  const flush = () => {
    if (!b.length) return;
    const j = b.join("\n");
    const t = j.match(/^-\s*`?thai`?\s*:\s*(\S.*?)\s*$/m);
    if (t && /^-\s*`?ton`?\s*:/m.test(j)) e.push(t[1]);
    b = [];
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
    b.push(l);
  }
  flush();
  return e;
}

const publiees = new Set();
for (const f of lessonFiles(1, 11)) {
  for (const g of entriesOf(readFileSync(f, "utf8"))) {
    for (const p of g.split(/\s*\/\s*/)) publiees.add(p.trim());
  }
}

// Les onze répliques distinctes, découpées en morceaux à l'espace. La réplique 4
// est donnée découpée à la main : son ๆ est précédé d'une espace de graphie.
const repliques = {
  1: ["สวัสดีค่ะ", "คุณต้น", "วันนี้สบายดีไหมคะ"],
  2: ["ไม่สบายครับ", "ปวดหัวมากครับ"],
  "3 et 5": ["กี่วันแล้วคะ", "ไปหาหมอไหมคะ"],
  4: ["ขอโทษครับ", "ไม่เข้าใจครับ", "พูดช้า ๆ ได้ไหมครับ"],
  6: ["สองวันแล้วครับ", "ไม่ไปหาหมอครับ", "ร้านขายยาอยู่ที่ไหนครับ"],
  7: ["ร้านขายยาอยู่ที่ตลาดค่ะ", "ตรงไปค่ะ", "ไม่ไกลค่ะ"],
  8: ["เข้าใจแล้วครับ", "ผมไปตลาดทุกวันครับ", "แล้วคุณล่ะครับ"],
  9: ["ดิฉันไปตลาดตอนเช้าค่ะ", "ดิฉันทำงานที่บ้านทุกวันค่ะ"],
  10: ["ผมมีพี่ชายและน้องสาวครับ", "พี่ชายไปตลาดทุกวันครับ"],
  11: ["ข้าวผัดหมูอร่อยแต่แพงเกินไปค่ะ"],
  12: ["แพงเกินไปผมก็ไม่เอาครับ", "ขอบคุณครับ", "แล้วเจอกันครับ"],
};

// Morceaux qui n'ajoutent qu'une particule polie à un bloc publié : le critère
// écrit en tête de la partie 4 les exclut de la déclaration d'assemblage.
const particuleSeule = new Set([
  "ไม่สบายครับ",
  "ไม่เข้าใจครับ",
  "สองวันแล้วครับ",
  "ตรงไปค่ะ",
  "ไม่ไกลค่ะ",
  "แล้วคุณล่ะครับ",
  "แล้วเจอกันครับ",
]);

console.log(
  `\n# 4. Morceaux du dialogue 12D contre ${publiees.size} formes publiées`,
);
let nPub = 0;
let nPart = 0;
let nComp = 0;
for (const [n, morceaux] of Object.entries(repliques)) {
  for (const m of morceaux) {
    let etat;
    if (publiees.has(m)) {
      etat = "PUBLIÉ TEL QUEL";
      nPub += 1;
    } else if (particuleSeule.has(m)) {
      etat = "particule polie ";
      nPart += 1;
    } else {
      etat = "ASSEMBLAGE     ";
      nComp += 1;
    }
    console.log(`R${n}\t${etat}\t${m}`);
  }
}
console.log(
  `total ${nPub + nPart + nComp} morceaux : ${nPub} publiés, ${nPart} adjonctions de particule, ${nComp} assemblages à déclarer`,
);
