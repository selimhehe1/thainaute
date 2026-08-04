#!/usr/bin/env node
// Banc d'essai « le ton survit-il a la synthese vocale ? ».
//
// Pourquoi ce script existe
// -------------------------
// En thai, un ton faux n'est pas un accent approximatif : c'est un autre mot.
// Avant d'accepter une voix synthetique comme audio pedagogique, il faut une
// mesure, pas une impression. Ce banc genere chaque mot d'une serie de paires
// minimales tonales, puis fait relire l'audio produit par des modeles de
// reconnaissance, et compare la graphie rendue a la graphie demandee.
//
// Ce que la mesure prouve, et ce qu'elle ne prouve pas
// ---------------------------------------------------
// Les cinq mots de la serie partagent consonne et voyelle : ils ne different
// que par le ton. Un desaccord est donc une preuve FORTE que la synthese a
// rate le ton. Un accord est une preuve FAIBLE : le transcripteur a son
// propre modele de langue et peut « corriger » vers le mot attendu. Ce banc
// ne remplace donc pas une oreille native, il elimine les voix indefendables.
//
// Usage
//   node scripts/verification/tts-tone-benchmark.mjs --dry-run
//   node scripts/verification/tts-tone-benchmark.mjs --out <dossier>
//
// La cle est lue dans .env (ignore par git). Aucun appel n'est lance sans
// --run explicite : ce script coute de l'argent reel.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Serie verifiee en lecon 1A : cinq tons, meme segmental /kʰaa/.
// Les gloses viennent des entrees Wiktionary citees dans la lecon ; elles
// servent ici a lire le rapport, pas de source.
const SERIE_TONALE = [
  { thai: "คา", ton: "moyen", latin: "khaa", glose: "rester coince" },
  { thai: "ข่า", ton: "bas", latin: "khàa", glose: "galanga" },
  { thai: "ค่า", ton: "descendant", latin: "khâa", glose: "valeur" },
  { thai: "ค้า", ton: "haut", latin: "kháa", glose: "commercer" },
  { thai: "ขา", ton: "montant", latin: "khǎa", glose: "jambe" },
];

const VOIX = ["alloy", "coral", "onyx"];
const MODELE_TTS = "gpt-4o-mini-tts";
const TRANSCRIPTEURS = ["gpt-4o-transcribe", "whisper-1"];

// Une consigne de style neutre et identique pour toutes les voix : on mesure
// la voix, pas la consigne.
const CONSIGNE =
  "Prononce ce mot thai seul, clairement et lentement, sur un ton neutre " +
  "d'enseignant. Respecte exactement le ton lexical ecrit.";

function lireCle() {
  const env = readFileSync(new URL("../../.env", import.meta.url), "utf8");
  const trouve = env.match(/^OPENAI_API_KEY=(.+)$/mu);
  if (trouve === null) {
    throw new Error("OPENAI_API_KEY absent de .env");
  }
  return trouve[1].trim();
}

// NFC : deux graphies thaies visuellement identiques peuvent differer en
// points de code. Comparer sans normaliser produirait de faux desaccords.
const nfc = (valeur) => valeur.normalize("NFC");

// Le transcripteur ajoute souvent ponctuation finale et espaces.
function nettoyer(valeur) {
  return nfc(valeur)
    .replace(/[\s.,!?ๆฯ"'«»]/gu, "")
    .trim();
}

async function synthetiser(cle, texte, voix) {
  const reponse = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cle}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODELE_TTS,
      voice: voix,
      input: texte,
      instructions: CONSIGNE,
      response_format: "wav",
    }),
  });
  if (!reponse.ok) {
    throw new Error(`TTS ${reponse.status} : ${await reponse.text()}`);
  }
  return Buffer.from(await reponse.arrayBuffer());
}

async function transcrire(cle, audio, modele, nomFichier) {
  const formulaire = new FormData();
  formulaire.append(
    "file",
    new Blob([audio], { type: "audio/wav" }),
    nomFichier,
  );
  formulaire.append("model", modele);
  // L'indice de langue evite que le modele parte sur une autre ecriture.
  formulaire.append("language", "th");

  const reponse = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${cle}` },
      body: formulaire,
    },
  );
  if (!reponse.ok) {
    throw new Error(`STT ${reponse.status} : ${await reponse.text()}`);
  }
  const corps = await reponse.json();
  return corps.text ?? "";
}

// Retrouve quel membre de la serie le transcripteur a entendu. Permet de
// distinguer « confusion tonale » (il a rendu un autre ton de la serie) de
// « hors serie » (il a rendu autre chose, souvent un souci de reconnaissance
// plutot qu'un souci de ton).
function classer(transcriptionNettoyee, attendu) {
  if (transcriptionNettoyee === nfc(attendu.thai)) return "exact";
  const autre = SERIE_TONALE.find(
    ({ thai }) => nfc(thai) === transcriptionNettoyee,
  );
  if (autre !== undefined) return `confusion_ton:${autre.ton}`;
  if (transcriptionNettoyee === "") return "vide";
  return "hors_serie";
}

async function main() {
  const args = process.argv.slice(2);
  const sec = args.includes("--dry-run") || !args.includes("--run");
  const dossierIndex = args.indexOf("--out");
  const dossier =
    dossierIndex >= 0 ? args[dossierIndex + 1] : "./tts-benchmark-out";

  const appelsTts = SERIE_TONALE.length * VOIX.length;
  const appelsStt = appelsTts * TRANSCRIPTEURS.length;

  console.log("Banc d'essai tonal, synthese OpenAI");
  console.log(`  serie      : ${SERIE_TONALE.map((m) => m.thai).join(" ")}`);
  console.log(`  voix       : ${VOIX.join(", ")}`);
  console.log(`  modele TTS : ${MODELE_TTS}`);
  console.log(`  relecture  : ${TRANSCRIPTEURS.join(", ")}`);
  console.log(`  appels     : ${appelsTts} TTS + ${appelsStt} STT`);

  if (sec) {
    console.log("\nMode sec : aucun appel lance. Relancer avec --run.");
    return;
  }

  const cle = lireCle();
  mkdirSync(dossier, { recursive: true });
  const resultats = [];

  for (const mot of SERIE_TONALE) {
    for (const voix of VOIX) {
      const nomFichier = `${voix}-${mot.latin.replace(/[^a-z]/gu, "")}-${mot.ton}.wav`;
      let audio;
      try {
        audio = await synthetiser(cle, mot.thai, voix);
      } catch (erreur) {
        resultats.push({ mot, voix, echec: String(erreur) });
        console.log(`  ${mot.thai} / ${voix} : ECHEC TTS ${erreur}`);
        continue;
      }
      writeFileSync(join(dossier, nomFichier), audio);

      const relectures = {};
      for (const modele of TRANSCRIPTEURS) {
        try {
          const brut = await transcrire(cle, audio, modele, nomFichier);
          const propre = nettoyer(brut);
          relectures[modele] = {
            brut,
            propre,
            verdict: classer(propre, mot),
          };
        } catch (erreur) {
          relectures[modele] = { echec: String(erreur) };
        }
      }

      resultats.push({
        thai: mot.thai,
        ton: mot.ton,
        latin: mot.latin,
        voix,
        fichier: nomFichier,
        octets: audio.length,
        relectures,
      });

      const resume = TRANSCRIPTEURS.map(
        (m) => `${m}=${relectures[m]?.verdict ?? "erreur"}`,
      ).join(" ");
      console.log(`  ${mot.thai} (${mot.ton}) / ${voix} : ${resume}`);
    }
  }

  const rapport = {
    genereLe: new Date().toISOString(),
    modeleTts: MODELE_TTS,
    consigne: CONSIGNE,
    voix: VOIX,
    transcripteurs: TRANSCRIPTEURS,
    serie: SERIE_TONALE,
    resultats,
  };
  const chemin = join(dossier, "rapport.json");
  writeFileSync(chemin, JSON.stringify(rapport, null, 2), "utf8");

  console.log("\n=== SYNTHESE ===");
  for (const modele of TRANSCRIPTEURS) {
    const lus = resultats.filter((r) => r.relectures?.[modele]?.verdict);
    const exacts = lus.filter(
      (r) => r.relectures[modele].verdict === "exact",
    ).length;
    const confusions = lus.filter((r) =>
      r.relectures[modele].verdict.startsWith("confusion_ton"),
    ).length;
    const hors = lus.filter(
      (r) => r.relectures[modele].verdict === "hors_serie",
    ).length;
    console.log(
      `${modele} : ${exacts}/${lus.length} exacts, ` +
        `${confusions} confusions tonales, ${hors} hors serie`,
    );
  }
  console.log(`\nRapport : ${chemin}`);
}

main().catch((erreur) => {
  console.error(erreur);
  process.exitCode = 1;
});
