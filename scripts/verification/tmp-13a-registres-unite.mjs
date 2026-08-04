// Contre-audit de `u13-l13a` : premier mot du champ `registre` de chaque item
// de l'unité 13, fichier par fichier.
//
// POURQUOI CE SCRIPT EXISTE. La Méta de `lecon-13a.md` écrit : « Contrôle fait
// sur les trois fichiers sœurs le 2026-08-04, après leur apparition : leurs
// champs `registre` disent tous, en propres termes, qu'aucune étiquette n'a été
// trouvée sur les entrées consultées. » L'unité en compte QUATRE, et le
// quatrième affirme « familier » sept fois. Ce script rend le relevé en une
// commande.
//
// Usage :
//   node scripts/verification/tmp-13a-registres-unite.mjs [unite]

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");
const unite = String(process.argv[2] ?? 13).padStart(2, "0");
const dir = join(AUTHORING, "unite-" + unite);

function champ(bloc, nom) {
  const re = new RegExp(
    "(?:^|\\n)- `" + nom + "` ?: ?([\\s\\S]*?)(?=\\n- `|\\n#|\\n\\n|$)",
  );
  const m = bloc.match(re);
  return m ? m[1].replace(/\s+/g, " ").trim() : undefined;
}

for (const nom of readdirSync(dir).sort()) {
  if (!/^lecon-.*\.md$/.test(nom)) continue;
  const texte = readFileSync(join(dir, nom), "utf8");
  const section = texte.split(/^## /m).find((s) => s.startsWith("Items"));
  if (section === undefined) continue;
  console.log(`\n===== ${nom} =====`);
  for (const bloc of section.split(/^#{3,4} /m).slice(1)) {
    const thai = champ(bloc, "thai");
    if (thai === undefined || champ(bloc, "ton") === undefined) continue;
    const reg = (champ(bloc, "registre") ?? "(absent)").slice(0, 110);
    console.log(`  ${thai}\n     registre : ${reg}`);
  }
}
