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
  // On travaille LIGNE PAR LIGNE, jamais sur le document entier.
  // `String.replace` avec une chaine ne remplace que la premiere
  // occurrence : deux items portant la meme IPA verraient le second
  // reecrire la ligne du premier, en silence.
  const lignes = texte.split("\n");
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

    // La ligne visée est celle qui déclare CE champ `ipa` avec CETTE
    // valeur. On exige qu'il n'y en ait qu'une : deux candidates
    // signifieraient que le fichier est ambigu, et corriger au hasard
    // serait pire que refuser.
    const candidates = lignes
      .map((ligne, index) => ({ ligne, index }))
      .filter(
        ({ ligne }) =>
          /^\s*[-*] ?`?ipa`? ?:/u.test(ligne) && ligne.includes(item.ipa),
      );
    if (candidates.length !== 1) {
      erreurs += 1;
      console.log(
        `REFUS ${item.titre} : ${candidates.length} lignes candidates`,
      );
      continue;
    }
    const cible = candidates[0];
    lignes[cible.index] = cible.ligne.replace(item.ipa, resultat.valeur);
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
    writeFileSync(chemin, lignes.join("\n"), "utf8");
    console.log(`Écrit : ${chemin}`);
  } else if (corriges > 0) {
    console.log("Essai à blanc. Relancer avec --ecrire pour appliquer.");
  }
}

main();
