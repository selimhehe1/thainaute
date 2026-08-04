#!/usr/bin/env node
// Comparaison de moteurs de synthese vocale sur la restitution des cinq
// tons thais, jugee par mesure acoustique et non par reconnaissance vocale.
//
// Pourquoi ce script existe
// -------------------------
// Choisir un moteur « parce qu'il est le plus recent » n'est pas une
// decision, c'est un reflexe. Ce banc genere la meme serie de paires
// minimales tonales avec plusieurs moteurs et plusieurs voix, mesure le
// contour F0 de chaque enregistrement (voir f0-contour.mjs), puis verifie
// que les cinq tons sortent effectivement distincts et dans le bon ordre.
//
// Le juge est physique : aucun modele de langue n'intervient, donc aucun
// modele ne peut « corriger » vers le mot attendu et masquer l'erreur.
//
// Usage
//   node scripts/verification/tts-engine-compare.mjs            (mode sec)
//   node scripts/verification/tts-engine-compare.mjs --run --out <dossier>

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { analyserTon, contourF0 } from "./f0-contour.mjs";

// Serie verifiee en lecon 1A : cinq tons, meme segmental /kʰaa/.
const SERIE = [
  { thai: "คา", ton: "moyen", cle: "moyen" },
  { thai: "ข่า", ton: "bas", cle: "bas" },
  { thai: "ค่า", ton: "descendant", cle: "descendant" },
  { thai: "ค้า", ton: "haut", cle: "haut" },
  { thai: "ขา", ton: "montant", cle: "montant" },
];

// Deux familles d'API : l'endpoint speech, et les modeles audio pleine
// taille qui passent par chat/completions.
const MOTEURS = [
  { id: "tts-1-hd", api: "speech", voix: ["onyx", "shimmer"] },
  { id: "gpt-4o-mini-tts", api: "speech", voix: ["onyx", "coral"] },
  { id: "gpt-4o-mini-tts-2025-12-15", api: "speech", voix: ["onyx", "coral"] },
  { id: "gpt-audio-1.5", api: "chat", voix: ["alloy", "coral"] },
];

const CONSIGNE =
  "Prononce ce mot thai seul, clairement et lentement, sur un ton neutre " +
  "d'enseignant. Respecte exactement le ton lexical ecrit.";

function lireCle() {
  const env = readFileSync(new URL("../../.env", import.meta.url), "utf8");
  const trouve = env.match(/^OPENAI_API_KEY=(.+)$/mu);
  if (trouve === null) throw new Error("OPENAI_API_KEY absent de .env");
  return trouve[1].trim();
}

async function genererSpeech(cle, modele, voix, texte) {
  const reponse = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cle}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modele,
      voice: voix,
      input: texte,
      response_format: "wav",
      // tts-1 n'accepte pas instructions : on ne l'envoie qu'aux modeles
      // qui le comprennent, sinon l'appel echoue.
      ...(modele.startsWith("gpt-") ? { instructions: CONSIGNE } : {}),
    }),
  });
  if (!reponse.ok) throw new Error(`${reponse.status} ${await reponse.text()}`);
  return Buffer.from(await reponse.arrayBuffer());
}

async function genererChat(cle, modele, voix, texte) {
  const reponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cle}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modele,
      modalities: ["text", "audio"],
      audio: { voice: voix, format: "wav" },
      messages: [
        {
          role: "system",
          content:
            "Tu es une voix de reference pour un cours de thai. Tu prononces " +
            "exactement le mot demande, seul, sans rien ajouter, sans le " +
            "traduire et sans le commenter. Le ton lexical doit etre exact.",
        },
        { role: "user", content: `Prononce ce mot thai : ${texte}` },
      ],
    }),
  });
  if (!reponse.ok) throw new Error(`${reponse.status} ${await reponse.text()}`);
  const corps = await reponse.json();
  const donnees = corps.choices?.[0]?.message?.audio?.data;
  if (donnees === undefined) {
    throw new Error(
      `Pas d'audio dans la reponse : ${JSON.stringify(corps).slice(0, 300)}`,
    );
  }
  return Buffer.from(donnees, "base64");
}

// ---------------------------------------------------------------------------
// Notation
// ---------------------------------------------------------------------------

// On ne verifie pas des valeurs absolues (chaque voix a son registre) mais
// des relations : ordre des hauteurs et signe des pentes. Les six controles
// ci-dessous sont volontairement grossiers. Le but n'est pas de noter
// finement une prononciation, c'est de reperer une forme categoriquement
// fausse, par exemple un ton montant realise descendant.
function noter(mesures) {
  // mesures : { cle -> analyse } pour une voix donnee.
  const presentes = Object.entries(mesures).filter(
    ([, m]) => m?.verdict === "mesure",
  );
  if (presentes.length < 4) {
    return {
      note: null,
      motif: `seulement ${presentes.length} tons mesurables`,
    };
  }

  const hauteurs = Object.fromEntries(
    presentes.map(([cle, m]) => [cle, m.hauteurMediane]),
  );
  const pentes = Object.fromEntries(
    presentes.map(([cle, m]) => [cle, m.pente]),
  );
  const moyenneHauteur =
    Object.values(hauteurs).reduce((a, b) => a + b, 0) /
    Object.values(hauteurs).length;

  const controles = [];
  const ajouter = (nom, ok, detail) => controles.push({ nom, ok, detail });

  // 1. Le ton bas doit etre plus bas que le ton moyen. C'est la
  //    distinction la plus fragile et la plus couteuse quand elle tombe.
  if (hauteurs.bas !== undefined && hauteurs.moyen !== undefined) {
    const ecart = 12 * Math.log2(hauteurs.moyen / hauteurs.bas);
    ajouter(
      "bas < moyen",
      ecart > 0.7,
      `${ecart.toFixed(2)} demi-tons d'ecart`,
    );
  }
  // 2. Le ton descendant doit franchement descendre.
  if (pentes.descendant !== undefined) {
    ajouter(
      "descendant chute",
      pentes.descendant < -2.5,
      `pente ${pentes.descendant}`,
    );
  }
  // 3. Le ton montant doit finir plus haut qu'il ne commence, ou creuser.
  if (mesures.montant?.verdict === "mesure") {
    const m = mesures.montant;
    ajouter(
      "montant remonte",
      m.pente > 0.5 || m.forme.startsWith("creux"),
      `pente ${m.pente}, forme ${m.forme}`,
    );
  }
  // 4. Le ton haut ne doit pas etre plat ni descendre.
  if (mesures.haut?.verdict === "mesure") {
    ajouter(
      "haut ne chute pas",
      mesures.haut.pente > -0.5,
      `pente ${mesures.haut.pente}, forme ${mesures.haut.forme}`,
    );
  }
  // 5. Le ton moyen doit rester relativement plat.
  if (mesures.moyen?.verdict === "mesure") {
    ajouter(
      "moyen reste plat",
      Math.abs(mesures.moyen.pente) < 2.5,
      `pente ${mesures.moyen.pente}`,
    );
  }
  // 6. Les cinq hauteurs medianes ne doivent pas s'ecraser : si tout le
  //    monde se retrouve au meme endroit, la voix ne distingue rien.
  const etendue =
    12 *
    Math.log2(
      Math.max(...Object.values(hauteurs)) /
        Math.min(...Object.values(hauteurs)),
    );
  ajouter("registre deploye", etendue > 2, `${etendue.toFixed(2)} demi-tons`);

  const reussis = controles.filter((c) => c.ok).length;
  return {
    note: `${reussis}/${controles.length}`,
    ratio: reussis / controles.length,
    mesurables: presentes.length,
    moyenneHauteur: Math.round(moyenneHauteur),
    controles,
  };
}

// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const lance = args.includes("--run");
  const i = args.indexOf("--out");
  const dossier = i >= 0 ? args[i + 1] : "./tts-engines-out";

  const total = MOTEURS.reduce((n, m) => n + m.voix.length * SERIE.length, 0);
  console.log("Comparaison de moteurs, juge acoustique (F0)");
  for (const m of MOTEURS) {
    console.log(
      `  ${m.id.padEnd(28)} ${m.api.padEnd(7)} voix : ${m.voix.join(", ")}`,
    );
  }
  console.log(`  appels TTS : ${total}\n`);
  if (!lance) {
    console.log("Mode sec : aucun appel lance. Relancer avec --run.");
    return;
  }

  const cle = lireCle();
  mkdirSync(dossier, { recursive: true });
  const rapport = [];

  for (const moteur of MOTEURS) {
    for (const voix of moteur.voix) {
      const mesures = {};
      const echecs = [];
      for (const mot of SERIE) {
        const nom = `${moteur.id}__${voix}__${mot.cle}.wav`;
        try {
          const audio =
            moteur.api === "speech"
              ? await genererSpeech(cle, moteur.id, voix, mot.thai)
              : await genererChat(cle, moteur.id, voix, mot.thai);
          writeFileSync(join(dossier, nom), audio);
          mesures[mot.cle] = analyserTon(contourF0(audio));
        } catch (erreur) {
          echecs.push(`${mot.cle} : ${String(erreur).slice(0, 160)}`);
          mesures[mot.cle] = { verdict: "echec" };
        }
      }

      const note = noter(mesures);
      rapport.push({ moteur: moteur.id, voix, note, mesures, echecs });

      console.log(`${moteur.id} / ${voix}`);
      if (echecs.length > 0) {
        for (const e of echecs) console.log(`   ECHEC ${e}`);
      }
      if (note.note === null) {
        console.log(`   non notable : ${note.motif}`);
      } else {
        console.log(`   note ${note.note}`);
        for (const c of note.controles) {
          console.log(
            `     ${c.ok ? "ok  " : "RATE"} ${c.nom.padEnd(20)} ${c.detail}`,
          );
        }
      }
      console.log("");
    }
  }

  const chemin = join(dossier, "comparaison.json");
  writeFileSync(
    chemin,
    JSON.stringify({ genereLe: new Date().toISOString(), rapport }, null, 2),
    "utf8",
  );

  console.log("=== CLASSEMENT ===");
  const classement = rapport
    .filter((r) => r.note.ratio !== undefined)
    .sort((a, b) => b.note.ratio - a.note.ratio);
  for (const r of classement) {
    console.log(
      `${r.note.note.padStart(5)}  ${r.moteur} / ${r.voix}` +
        `  (${r.note.mesurables}/5 tons mesurables)`,
    );
  }
  console.log(`\nRapport : ${chemin}`);
}

main().catch((erreur) => {
  console.error(erreur);
  process.exitCode = 1;
});
