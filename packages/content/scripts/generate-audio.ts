#!/usr/bin/env tsx
// Produit l'audio thaï d'une leçon compilée, et son manifeste.
//
// Moteur : `gpt-audio-1.5` (ADR-0025), choisi sur mesure acoustique et non
// sur son nom. Chaque fichier produit passe le contrôle de ton par mesure
// du contour F0 : en thaï, un ton faux n'est pas un accent approximatif,
// c'est un autre mot.
//
// Ce que ce script calcule, là où rien ne le faisait
// -------------------------------------------------
// `sha256`, `byteLength` et `durationMs` étaient jusqu'ici saisis à la
// main dans les manifestes. Ils sont désormais dérivés du fichier réel,
// ce qui rend `validateBundle` capable de détecter une divergence.
//
// Budget
// ------
// Plafond dur, arrêt au-delà. Aucun appel facturé n'est lancé sans `--run`.
//
// Usage :
//   pnpm --filter @thainaute/content content:audio -- <lecon.md>
//   ... -- <lecon.md> --run
//   ... -- <lecon.md> --run --retry-failed
//   ... -- <lecon.md> --run --retry-failed --voice=alloy

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { audioManifestSchema } from "../src/schemas";

import {
  analyserTon,
  contourF0,
  type AnalyseTon,
} from "../../../scripts/verification/f0-contour.mjs";

import { compilerLeconComplete } from "./compile-lesson";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const MODELE_CHAT = "gpt-audio-1.5";
const VOIX_DEFAUT = "coral";
const VOIX_AUTORISEES = new Set(["alloy", "ash", "coral"]);

/** Plafond dur, très au-dessus du coût estimé de la série. */
const PLAFOND_APPELS = 60;

const CONSIGNE =
  "Tu es une voix de reference pour un cours de thai destine a des " +
  "francophones. Tu prononces exactement le mot demande, seul, clairement " +
  "et posement, sans rien ajouter, sans le traduire et sans le commenter. " +
  "Le ton lexical doit etre exact.";

/**
 * Description du contour attendu, ajoutee aux essais de reprise.
 *
 * Ce n'est pas de la fabrication : le ton est deja ecrit dans la lecon et
 * derive de son IPA. On decrit a la voix ce que la graphie exige deja,
 * parce que la premiere passe l'a manifestement rate.
 */
const CONTOUR_DECRIT: Record<string, string> = {
  mid:
    "ton moyen : la voix reste parfaitement plate, au milieu, de l'attaque " +
    "jusqu'à la fin nasale, sans chute finale, montée ni intonation de phrase. " +
    "En thaï : วรรณยุกต์สามัญ, ระดับเสียงกลางคงที่, ไม่ตกและไม่ขึ้น. " +
    "Prends ยาง (yaang) comme repère de hauteur moyenne, mais ne prononce jamais ce repère. " +
    "In English: keep a steady mid-level pitch from onset through the final nasal; do not fall or rise",
  low: "ton bas : la voix se pose en bas et y reste, sans tomber",
  falling: "ton descendant : la voix part haut et tombe franchement",
  high: "ton haut : la voix reste perchee et se tend vers le haut, elle ne tombe jamais",
  rising:
    "ton montant : la voix part du bas et GRIMPE jusqu'en haut, elle ne descend jamais",
};

/** Essais successifs avant de renoncer et de consigner l'echec. */
const ESSAIS_MAX = 3;

/** Formes de contour acceptables par ton, alignées sur `SHAPES_ATTENDUES`. */
const FORMES_ATTENDUES: Record<string, readonly string[]> = {
  mid: ["level"],
  low: ["level", "falling"],
  falling: ["falling", "peaking"],
  high: ["rising", "peaking"],
  rising: ["rising", "dipping"],
};

/** Le module de mesure décrit en français ; le schéma attend l'anglais. */
const FORME_FR_VERS_EN: Record<string, string> = {
  plat: "level",
  montant: "rising",
  descendant: "falling",
  "cloche (monte puis descend)": "peaking",
  "creux (descend puis remonte)": "dipping",
};

function lireCle(): string {
  const env = readFileSync(join(RACINE, ".env"), "utf8");
  const trouve = env.match(/^OPENAI_API_KEY=(.+)$/mu)?.[1];
  if (trouve === undefined) throw new Error("OPENAI_API_KEY absent de .env");
  return trouve.trim();
}

async function synthetiser(
  cle: string,
  texte: string,
  ipa: string | null,
  tone: string,
  insistance: string | null,
  voix: string,
): Promise<Buffer> {
  const repereTon =
    CONTOUR_DECRIT[tone] ?? "respecte le ton lexical indiqué par l'IPA";
  const repereIpa = ipa === null ? "" : ` La référence phonétique est ${ipa}.`;
  const consigne = `${CONSIGNE} ${repereTon}.${repereIpa}`;
  const reponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cle}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODELE_CHAT,
      modalities: ["text", "audio"],
      audio: { voice: voix, format: "wav" },
      messages: [
        {
          role: "system",
          content: insistance === null ? consigne : `${consigne} ${insistance}`,
        },
        { role: "user", content: `Prononce ce mot thai : ${texte}` },
      ],
    }),
  });
  if (!reponse.ok) {
    throw new Error(`${reponse.status} ${await reponse.text()}`);
  }
  const resultat = (await reponse.json()) as {
    choices?: { message?: { audio?: { data?: string } } }[];
  };
  const donnees = resultat.choices?.[0]?.message?.audio?.data;
  if (donnees === undefined) throw new Error("Pas d'audio dans la réponse.");
  return Buffer.from(donnees, "base64");
}

/** Durée lue dans l'en-tête WAV, jamais estimée. */
function dureeMs(wav: Buffer): number {
  const { frequence, octetsDonnees, canaux, bits } = enTeteWav(wav);
  const octetsParEchantillon = (bits / 8) * canaux;
  return Math.round((octetsDonnees / octetsParEchantillon / frequence) * 1000);
}

function enTeteWav(wav: Buffer) {
  let position = 12;
  let format: { canaux: number; frequence: number; bits: number } | null = null;
  let octetsDonnees = 0;
  while (position + 8 <= wav.length) {
    const nom = wav.toString("ascii", position, position + 4);
    const taille = wav.readUInt32LE(position + 4);
    const debut = position + 8;
    if (nom === "fmt ") {
      format = {
        canaux: wav.readUInt16LE(debut + 2),
        frequence: wav.readUInt32LE(debut + 4),
        bits: wav.readUInt16LE(debut + 14),
      };
    } else if (nom === "data") {
      octetsDonnees = Math.min(taille, wav.length - debut);
    }
    position = debut + taille + (taille % 2);
  }
  if (format === null || octetsDonnees === 0) {
    throw new Error("En-tête WAV illisible.");
  }
  return { ...format, octetsDonnees };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const chemin = args.find((a) => !a.startsWith("--"));
  if (chemin === undefined) {
    console.error("usage: content:audio -- <lecon.md> [--run]");
    process.exitCode = 2;
    return;
  }

  const { identifiant, lesson } = compilerLeconComplete(join(RACINE, chemin));
  const distribuerPubliquement =
    lesson.workflowStatus === "published" && lesson.visibility === "public";

  // Un asset par item réellement cité par un exercice d'écoute.
  const aProduireComplete = new Map<
    string,
    { assetId: string; thaiRaw: string; ipa: string | null; tone: string }
  >();
  for (const exercice of lesson.exercises) {
    if (exercice.type !== "audio_choice") continue;
    const item = lesson.items.find(
      (candidat) => candidat.id === exercice.itemId,
    );
    const tone = item?.syllables[0]?.tone;
    if (item === undefined || tone === null || tone === undefined) continue;
    aProduireComplete.set(exercice.audioAssetId, {
      assetId: exercice.audioAssetId,
      thaiRaw: item.thaiRaw,
      ipa: item.syllables[0]?.ipa ?? null,
      tone,
    });
  }

  const cheminManifeste = join(
    RACINE,
    "packages",
    "content",
    "data",
    "audio",
    `${identifiant}.v1.json`,
  );
  const retryFailed = args.includes("--retry-failed");
  const voix =
    args
      .find((argument) => argument.startsWith("--voice="))
      ?.slice("--voice=".length) ?? VOIX_DEFAUT;
  if (!VOIX_AUTORISEES.has(voix)) {
    throw new Error(
      `Voix non autorisee : ${voix}. Choisir ${[...VOIX_AUTORISEES].join(", ")}.`,
    );
  }
  const manifesteExistant = retryFailed
    ? audioManifestSchema.parse(
        JSON.parse(readFileSync(cheminManifeste, "utf8")),
      )
    : null;
  const aProduire = retryFailed
    ? new Map(
        [...aProduireComplete].filter(([assetId]) => {
          const entree = manifesteExistant?.entries.find(
            (candidate) => candidate.assetId === assetId,
          );
          return entree?.toneCheck?.consistent !== true;
        }),
      )
    : aProduireComplete;

  console.log(`${identifiant} : ${aProduire.size} fichiers à produire`);
  console.log(`  moteur ${MODELE_CHAT}, voix ${voix}`);
  for (const { thaiRaw, tone } of aProduire.values()) {
    console.log(`    ${thaiRaw.padEnd(6)} ton attendu ${tone}`);
  }

  if (!args.includes("--run")) {
    console.log("\nMode sec : aucun appel lancé. Relancer avec --run.");
    return;
  }
  if (aProduire.size > PLAFOND_APPELS) {
    throw new Error(`Plafond de ${PLAFOND_APPELS} appels dépassé.`);
  }

  const cle = lireCle();
  const dossierAssets = join(
    RACINE,
    "packages",
    "content",
    "assets",
    "audio",
    identifiant,
  );
  const dossierWeb = join(
    RACINE,
    "apps",
    "web",
    "public",
    "audio",
    identifiant,
  );
  mkdirSync(dossierAssets, { recursive: true });
  if (distribuerPubliquement) mkdirSync(dossierWeb, { recursive: true });

  const entrees: unknown[] = [];
  const echecs: string[] = [];

  for (const { assetId, thaiRaw, ipa, tone } of aProduire.values()) {
    const nom = `${assetId}.wav`;
    let wav: Buffer | null = null;
    let mesure: AnalyseTon | null = null;
    let formeEn: string | null = null;
    let conforme = false;
    let essais = 0;

    // On regenere tant que le contour contredit le ton, en renforcant la
    // consigne a partir du deuxieme essai. La generation etant stochastique,
    // un second tirage suffit souvent.
    while (essais < ESSAIS_MAX && !conforme) {
      essais += 1;
      const insistance =
        essais === 1 ? null : `Attention, ${CONTOUR_DECRIT[tone] ?? ""}.`;
      try {
        wav = await synthetiser(cle, thaiRaw, ipa, tone, insistance, voix);
      } catch (erreur) {
        echecs.push(`${thaiRaw} : ${String(erreur).slice(0, 120)}`);
        break;
      }
      mesure = analyserTon(contourF0(wav));
      formeEn =
        mesure.verdict === "mesure"
          ? (FORME_FR_VERS_EN[mesure.forme] ?? "level")
          : null;
      conforme =
        formeEn !== null && (FORMES_ATTENDUES[tone] ?? []).includes(formeEn);
    }
    if (wav === null) continue;
    if (!conforme) {
      echecs.push(
        `${thaiRaw} (${tone}) : contour ${formeEn} apres ${essais} essais`,
      );
    }

    const chemin = join(dossierAssets, nom);
    writeFileSync(chemin, wav);
    if (distribuerPubliquement) writeFileSync(join(dossierWeb, nom), wav);

    entrees.push({
      assetId,
      itemId: [...lesson.items].find((i) => i.thaiRaw === thaiRaw)?.id,
      variant: "pedagogical",
      canonicalPath: relative(RACINE, chemin).replace(/\\/gu, "/"),
      distributionPaths: distribuerPubliquement
        ? [relative(RACINE, join(dossierWeb, nom)).replace(/\\/gu, "/")]
        : [],
      mimeType: "audio/wav",
      sha256: createHash("sha256").update(wav).digest("hex"),
      byteLength: wav.length,
      durationMs: dureeMs(wav),
      voiceKind: "synthetic_tts",
      consentReference: null,
      synthesis: {
        provider: "openai",
        model: MODELE_CHAT,
        voice: voix,
        sourceText: thaiRaw,
        parameters: { format: "wav", modalities: "text+audio" },
        generatedAt: new Date().toISOString(),
      },
      roundTrip: null,
      toneCheck: {
        method: "f0_contour",
        tool: "scripts/verification/f0-contour.mjs",
        expectedTone: tone,
        observedShape: formeEn ?? "level",
        semitoneSlope: mesure?.verdict === "mesure" ? mesure.pente : 0,
        semitoneRange: mesure?.verdict === "mesure" ? mesure.amplitude : 0,
        consistent: conforme,
        checkedAt: new Date().toISOString(),
      },
    });

    console.log(
      `  ${thaiRaw.padEnd(6)} ${tone.padEnd(8)} mesuré ${String(formeEn).padEnd(8)} ${conforme ? "conforme" : "NON CONFORME"}  ${essais} essai(s), ${wav.length} o`,
    );
  }

  const entreesFinalesBrutes =
    manifesteExistant === null
      ? entrees
      : [
          ...manifesteExistant.entries.filter(
            (entry) => !aProduire.has(entry.assetId),
          ),
          ...entrees,
        ];
  const entreesFinales = distribuerPubliquement
    ? entreesFinalesBrutes
    : entreesFinalesBrutes.map((entry) => {
        const parsedEntry =
          audioManifestSchema.shape.entries.element.parse(entry);
        return {
          ...parsedEntry,
          distributionPaths: parsedEntry.distributionPaths.filter(
            (path) => !path.startsWith("apps/web/public/audio/"),
          ),
        };
      });
  const manifeste = audioManifestSchema.parse({
    schemaVersion: 1,
    manifestId: lesson.audioManifestId,
    lessonVersionId: lesson.versionId,
    entries: entreesFinales,
  });
  writeFileSync(
    cheminManifeste,
    `${JSON.stringify(manifeste, null, 2)}\n`,
    "utf8",
  );
  console.log(`\nmanifeste écrit : ${relative(RACINE, cheminManifeste)}`);
  if (echecs.length > 0) {
    console.log("échecs :");
    for (const e of echecs) console.log(`  ${e}`);
  }
}

await main();
