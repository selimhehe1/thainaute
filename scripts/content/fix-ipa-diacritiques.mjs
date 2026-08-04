#!/usr/bin/env node
// Remplace les diacritiques de ton par les barres de hauteur dans les
// champs `ipa` d'une leçon d'autorat.
//
// Pourquoi ce script existe
// -------------------------
// Le compilateur d'items a refusé dix items de `u01-l1d` avec le motif
// « ton dérivé null contre ton écrit montant ». Diagnostic : cette leçon
// écrit ses IPA avec un diacritique sur la voyelle (`/kʰǎː/`) alors que les
// 512 autres items du corpus emploient les barres de ton (`/kʰaː˩˩˦/`).
//
// `CONVENTIONS.md` réserve les diacritiques à la TRANSCRIPTION pédagogique.
// Les employer dans un champ `ipa` mélange deux systèmes de notation dans
// un même corpus, ce qui rend le champ inexploitable mécaniquement.
//
// La correction n'est pas une réécriture éditoriale : le champ `ton` de
// chaque item dit déjà quel ton était visé, et il concorde avec le
// diacritique sur les dix items. Le script REFUSE de corriger dès que les
// deux se contredisent, plutôt que de trancher à la place d'un humain.
//
// Usage :
//   node scripts/content/fix-ipa-diacritiques.mjs <lecon.md> [--ecrire]

import { readFileSync, writeFileSync } from "node:fs";

import { analyserItems } from "./lib/parse-authoring.mjs";

// Diacritique combinant -> nom du ton en français, tel qu'écrit dans le
// champ `ton`, et barres de hauteur correspondantes.
const DIACRITIQUES = [
  ["̌", "montant", "˩˩˦"],
  ["́", "haut", "˦˥"],
  ["̀", "bas", "˨˩"],
  ["̂", "descendant", "˥˩"],
];

function corrigerIpa(champIpa, tonEcrit) {
  const decompose = champIpa.normalize("NFD");
  const trouve = DIACRITIQUES.find(([marque]) => decompose.includes(marque));
  if (trouve === undefined) return { change: false, valeur: champIpa };

  const [marque, tonAttendu, barres] = trouve;
  const tonNettoye = (tonEcrit ?? "").trim().toLowerCase();
  if (tonNettoye !== tonAttendu) {
    return {
      erreur: `diacritique « ${tonAttendu} » contre ton écrit « ${tonEcrit} »`,
    };
  }

  // On retire le diacritique et on pose les barres juste avant la barre
  // oblique fermante, là où le reste du corpus les écrit.
  const sansMarque = decompose.split(marque).join("").normalize("NFC");
  const valeur = sansMarque.replace(/\/$/u, `${barres}/`);
  return { change: true, valeur };
}

function main() {
  const args = process.argv.slice(2);
  const chemin = args.find((a) => !a.startsWith("--"));
  if (chemin === undefined) {
    console.error("usage: fix-ipa-diacritiques.mjs <lecon.md> [--ecrire]");
    process.exitCode = 2;
    return;
  }

  const texte = readFileSync(chemin, "utf8");
  const items = analyserItems(texte);
  let sortie = texte;
  let corriges = 0;
  let erreurs = 0;

  for (const item of items) {
    if (item.ipa === undefined) continue;
    const resultat = corrigerIpa(item.ipa, item.ton);
    if (resultat.erreur !== undefined) {
      erreurs += 1;
      console.log(`REFUS ${item.titre} : ${resultat.erreur}`);
      continue;
    }
    if (!resultat.change) continue;

    // Remplacement littéral et unique de la valeur écrite.
    const avant = sortie;
    sortie = sortie.replace(item.ipa, resultat.valeur);
    if (sortie === avant) {
      erreurs += 1;
      console.log(`REFUS ${item.titre} : valeur introuvable telle quelle`);
      continue;
    }
    corriges += 1;
    console.log(
      `  ${item.titre.padEnd(10)} ${item.ipa}  ->  ${resultat.valeur}`,
    );
  }

  console.log(`\n${corriges} corrigés, ${erreurs} refusés.`);
  if (erreurs > 0) {
    console.log("Aucune écriture : un refus doit être arbitré d'abord.");
    process.exitCode = 1;
    return;
  }
  if (args.includes("--ecrire") && corriges > 0) {
    writeFileSync(chemin, sortie, "utf8");
    console.log(`Écrit : ${chemin}`);
  } else if (corriges > 0) {
    console.log("Essai à blanc. Relancer avec --ecrire pour appliquer.");
  }
}

main();
