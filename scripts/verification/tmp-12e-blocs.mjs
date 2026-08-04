// Contrôle adversarial du tableau des blocs réemployés de lecon-12e.md.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = "C:/Users/Selim/Documents/Thainaute";
const AUTH = join(ROOT, "content", "authoring");
const cible = join(AUTH, "unite-12", "lecon-12e.md");
const texte = readFileSync(cible, "utf8");

function fichierDe(ref) {
  const m = ref.match(/^u(\d\d)-l(\d+)([a-e])$/);
  if (!m) return undefined;
  return join(AUTH, "unite-" + m[1], "lecon-" + m[2] + m[3] + ".md");
}

function champ(bloc, nom) {
  const re = new RegExp(
    "(?:^|\\n)- `?" +
      nom +
      "`? ?: ?([\\s\\S]*?)(?=\\n- `?\\w+`? ?:|\\n#|\\n\\n|$)",
  );
  const m = bloc.match(re);
  return m ? m[1].replace(/\s+/g, " ").trim() : undefined;
}

function itemsDe(chemin) {
  const t = readFileSync(chemin, "utf8");
  const blocs = t.split(/^#{3,4} /m).slice(1);
  const liste = [];
  for (const b of blocs) {
    const titre = b.split("\n")[0].trim();
    const thai = champ(b, "thai");
    if (thai === undefined) continue;
    const num = titre.match(/Item\s+([0-9.]+)/i);
    liste.push({
      titre,
      num: num ? num[1] : null,
      thai,
      transcription: champ(b, "transcription"),
      ton: champ(b, "ton"),
      registre: champ(b, "registre"),
      fr: champ(b, "fr"),
    });
  }
  return liste;
}

// lignes de tableau : | graphie | `uXX-lYz` item N | `transcription` |
const lignes = [
  ...texte.matchAll(
    /^\|\s*([^|]+?)\s*\|\s*`(u\d\d-l\d+[a-e])`\s*item\s*([0-9.]+)\s*\|\s*`([^`]+)`\s*\|/gm,
  ),
];

console.log("lignes de tableau simple trouvées :", lignes.length);
let ko = 0;
const vus = [];
for (const l of lignes) {
  const [, graphie, ref, num, trans] = l;
  vus.push(graphie);
  const f = fichierDe(ref);
  if (!f || !existsSync(f)) {
    console.log(`!! ${graphie} : fichier ${ref} introuvable`);
    ko++;
    continue;
  }
  const items = itemsDe(f);
  const parGraphie = items.filter((i) => i.thai === graphie);
  const parNum = items.find((i) => i.num === num);
  if (parGraphie.length === 0) {
    console.log(
      `!! GRAPHIE ABSENTE de ${ref} : « ${graphie} » (annoncée item ${num})` +
        (parNum ? ` ; l'item ${num} de ${ref} porte « ${parNum.thai} »` : ""),
    );
    ko++;
    continue;
  }
  const it = parGraphie[0];
  if (it.num !== num) {
    console.log(
      `~~ NUMERO : ${graphie} dans ${ref} est l'item ${it.num}, 12E dit item ${num}` +
        (parNum ? ` (item ${num} = « ${parNum.thai} »)` : ""),
    );
    ko++;
  }
  if ((it.transcription || "") !== trans) {
    console.log(
      `~~ TRANSCRIPTION : ${graphie} (${ref} item ${it.num}) origine « ${it.transcription}
 » vs 12E « ${trans} »`,
    );
    ko++;
  }
}
console.log("\nécarts sur tableau simple :", ko);

// second tableau : cellules composites
const comp = [
  ...texte.matchAll(
    /^\|\s*([^|]+?)\s*\|\s*`([^`]+)`\s*\|\s*`(u\d\d-l\d+[a-e])`\s*item\s*([0-9.]+)\s*\|/gm,
  ),
];
console.log("\nlignes composites trouvées :", comp.length);
for (const c of comp) {
  const [, affiche, cellule, ref, num] = c;
  const f = fichierDe(ref);
  const items = itemsDe(f);
  const parNum = items.find((i) => i.num === num);
  if (!parNum) {
    console.log(`!! ${affiche} : item ${num} introuvable dans ${ref}`);
    continue;
  }
  const ok = parNum.thai === cellule;
  console.log(
    `${ok ? "OK " : "!! "}${affiche} | annoncé « ${cellule} » | réel ${ref} item ${num} « ${parNum.thai} » | transcription: ${parNum.transcription}`,
  );
}
