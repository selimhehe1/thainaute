import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
const AUTH = "C:/Users/Selim/Documents/Thainaute/content/authoring";
const cible = join(AUTH, "unite-12", "lecon-12e.md");
const texte = readFileSync(cible, "utf8");
const lignes = texte.split(/\r?\n/);
const iDossier = lignes.findIndex((l) =>
  /^## Dossier de production\s*$/.test(l),
);
console.log("ligne '## Dossier de production' :", iDossier + 1);
console.log("lignes d'écran (avant) :", iDossier);
const ecrans = lignes.slice(0, iDossier).join("\n");

// graphies publiées, unités 1 à 11 et 1 à 12
function fichiers(a, b) {
  const o = [];
  for (let u = a; u <= b; u++) {
    const d = join(AUTH, "unite-" + String(u).padStart(2, "0"));
    let n;
    try {
      n = readdirSync(d);
    } catch {
      continue;
    }
    for (const f of n.sort()) if (/^lecon-.*\.md$/.test(f)) o.push(join(d, f));
  }
  return o;
}
function itemsSec(t) {
  const L = t.split(/\r?\n/);
  let d = false;
  const o = [];
  for (const l of L) {
    if (/^##\s/.test(l)) {
      d = /^##\s+Items\s*$/.test(l);
      continue;
    }
    if (d) o.push(l);
  }
  return o.join("\n");
}
function graphies(a, b) {
  const s = new Set();
  for (const f of fichiers(a, b)) {
    const sec = itemsSec(readFileSync(f, "utf8"));
    for (const bl of sec.split(/^#{3,4} /m)) {
      const th = bl.match(/^-\s*`?thai`?\s*:\s*(\S.*?)\s*$/m);
      if (th && /^-\s*`?ton`?\s*:/m.test(bl)) s.add(th[1]);
    }
  }
  return s;
}
const G11 = graphies(1, 11);
// éclatement des cellules composites et retrait des gloses parenthésées
const atomes = new Set();
for (const g of G11) {
  for (let p of g.split(/\s+\/\s+|\s+·\s+/)) {
    p = p.replace(/\([^)]*\)/g, "").trim();
    if (p) atomes.add(p);
    for (const m of p.matchAll(/[\u0E00-\u0E7F]+(?:[ \u0020]ๆ)?/g))
      atomes.add(m[0]);
  }
}
// graphies affichées par les écrans de 12E
const affichees = new Map();
for (const m of ecrans.matchAll(
  /[\u0E00-\u0E7F]+(?:\s+ๆ)?(?:\s+[\u0E00-\u0E7F]+)*/g,
)) {
  const s = m[0].trim();
  if (!s) continue;
  affichees.set(s, (affichees.get(s) || 0) + 1);
}
console.log("\nséquences thaïes distinctes sur les écrans :", affichees.size);
const inconnues = [];
for (const s of affichees.keys()) {
  if (atomes.has(s)) continue;
  // tolérance : suite de mots dont chaque mot est publié
  const mots = s.split(/\s+/).filter((x) => x !== "ๆ");
  if (mots.every((w) => atomes.has(w))) continue;
  inconnues.push(s);
}
console.log(
  "séquences NON couvertes par une graphie publiée 1-11 :",
  inconnues.length,
);
inconnues.forEach((s) => console.log("   «" + s + "»"));

// contrôles de forme
const cadratin = (texte.match(/[—–]/g) || []).length;
console.log("\ntirets cadratin/demi-cadratin (fichier entier) :", cadratin);
const apoDroite = (texte.match(/'/g) || []).length;
const apoEcran = (ecrans.match(/'/g) || []).length;
console.log("apostrophes droites : fichier", apoDroite, "| écrans", apoEcran);
console.log("lignes du fichier :", lignes.length);

// balayage des motifs interdits, sur les écrans, insensible à la casse
const motifs = {
  "CECR/niveaux": /\bA1\b|\bA2\b|\bB1\b|\bB2\b|\bC1\b|\bC2\b|CECR/gi,
  "cadre européen": /cadre européen/gi,
  heures: /heures|heure d’apprentissage/gi,
  délai: /en [0-9]+ (mois|semaines|jours)|d’ici|dans un mois|en quelques/gi,
  équivalence: /équivalen|équivaut|correspond à un niveau/gi,
  "vous serez": /vous serez|vous saurez|vous parlerez|vous pourrez/gi,
  qualification: /bilingue|fluide|couramment|à l’aise/gi,
  effort: /rapidement|facilement|sans effort|en un rien de temps/gi,
  garantie: /garanti|assuré|promis|il suffit de/gi,
  francophone:
    /une bouche française|un francophone|l’oreille française|francophone/gi,
  niveau: /niveau/gi,
  maîtrise: /maîtrise|maîtriser/gi,
};
console.log("\n== balayage des écrans ==");
for (const [nom, re] of Object.entries(motifs)) {
  const hits = [...ecrans.matchAll(re)];
  console.log(`${nom} : ${hits.length}`);
  if (hits.length)
    hits.forEach((h) => {
      const i = h.index;
      const avant = ecrans.lastIndexOf("\n", i);
      const numLigne = ecrans.slice(0, i).split("\n").length;
      console.log(
        `    L${numLigne} …${ecrans.slice(Math.max(0, i - 60), i + 40).replace(/\n/g, " ")}…`,
      );
    });
}
// motifs SUPPLÉMENTAIRES non balayés par 12E
const extra = {
  "capable de": /capable de|vous êtes capable|vous savez faire/gi,
  "vous savez": /vous savez|vous avez appris|vous maîtrisez/gi,
  débutant: /débutant|intermédiaire|avancé/gi,
  "en X temps":
    /en (une|deux|trois|quelques|[0-9]+) (an|ans|mois|semaine|semaines|jour|jours|minutes?)/gi,
  autonome: /autonome|vous débrouiller|vous en sortir/gi,
  "prêt à": /prêt à|prête à|vous pouvez partir/gi,
};
console.log("\n== motifs NON balayés par 12E ==");
for (const [nom, re] of Object.entries(extra)) {
  const hits = [...ecrans.matchAll(re)];
  console.log(`${nom} : ${hits.length}`);
  hits.slice(0, 12).forEach((h) => {
    const numLigne = ecrans.slice(0, h.index).split("\n").length;
    console.log(
      `    L${numLigne} …${ecrans.slice(Math.max(0, h.index - 70), h.index + 60).replace(/\n/g, " ")}…`,
    );
  });
}
