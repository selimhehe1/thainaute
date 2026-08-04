#!/usr/bin/env node
// Extraction du contour de frequence fondamentale (F0) d'un WAV, et
// classement du ton thai correspondant.
//
// Pourquoi ce script existe
// -------------------------
// Pour verifier qu'une voix synthetique respecte le ton, un modele de
// reconnaissance vocale est un mauvais juge : il possede son propre modele
// de langue et « corrige » vers le mot le plus probable, ce qui masque
// exactement l'erreur que l'on cherche. La hauteur, elle, est une grandeur
// physique du signal. On la mesure, on ne la devine pas.
//
// Ce script n'utilise aucune dependance et aucun appel reseau.
//
// Usage
//   node scripts/verification/f0-contour.mjs fichier.wav [...]
//   node scripts/verification/f0-contour.mjs --json dossier/*.wav

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { pathToFileURL } from "node:url";

// ---------------------------------------------------------------------------
// Lecture WAV (PCM 16 bits, mono ou stereo)
// ---------------------------------------------------------------------------

function lireWav(tampon) {
  if (tampon.toString("ascii", 0, 4) !== "RIFF") {
    throw new Error("Ce n'est pas un fichier RIFF/WAV.");
  }
  let position = 12;
  let format = null;
  let donnees = null;

  // Un WAV est une suite de blocs nommes. On ne suppose pas leur ordre :
  // certains encodeurs inserent des blocs LIST ou fact avant les donnees.
  while (position + 8 <= tampon.length) {
    const nom = tampon.toString("ascii", position, position + 4);
    const taille = tampon.readUInt32LE(position + 4);
    const debut = position + 8;

    if (nom === "fmt ") {
      format = {
        codec: tampon.readUInt16LE(debut),
        canaux: tampon.readUInt16LE(debut + 2),
        frequence: tampon.readUInt32LE(debut + 4),
        bits: tampon.readUInt16LE(debut + 14),
      };
    } else if (nom === "data") {
      donnees = tampon.subarray(debut, debut + taille);
    }
    // Les blocs sont alignes sur un nombre pair d'octets.
    position = debut + taille + (taille % 2);
  }

  if (format === null || donnees === null) {
    throw new Error("Blocs fmt ou data introuvables.");
  }
  if (format.codec !== 1 || format.bits !== 16) {
    throw new Error(
      `Attendu PCM 16 bits, recu codec ${format.codec} / ${format.bits} bits.`,
    );
  }
  // Ce script lira aussi des enregistrements d'apprenants, dont on ne
  // controle pas la provenance. Un en-tete absurde doit lever une erreur
  // explicite, pas produire un Float32Array de taille Infinity (canaux a
  // zero) ni un pas d'analyse nul, qui bloquerait la boucle indefiniment.
  if (format.canaux < 1 || format.canaux > 8) {
    throw new Error(`Nombre de canaux invalide : ${format.canaux}.`);
  }
  if (format.frequence < 8000 || format.frequence > 192_000) {
    throw new Error(
      `Frequence d'echantillonnage hors plage : ${format.frequence} Hz.`,
    );
  }

  // Melange en mono et normalisation dans [-1, 1].
  const nEchantillons = Math.floor(donnees.length / 2 / format.canaux);
  const signal = new Float32Array(nEchantillons);
  for (let i = 0; i < nEchantillons; i += 1) {
    let somme = 0;
    for (let c = 0; c < format.canaux; c += 1) {
      somme += donnees.readInt16LE((i * format.canaux + c) * 2);
    }
    signal[i] = somme / format.canaux / 32768;
  }
  return { signal, frequence: format.frequence };
}

// ---------------------------------------------------------------------------
// Detection de hauteur par autocorrelation normalisee
// ---------------------------------------------------------------------------

const F0_MIN = 60;
const F0_MAX = 400;
const FENETRE_MS = 45;
const PAS_MS = 10;
// En dessous de ce pic d'autocorrelation, la trame est jugee non voisee
// (silence, consonne sourde, souffle) et n'a donc pas de hauteur.
const SEUIL_VOISEMENT = 0.35;

function hauteurTrame(trame, frequence) {
  const n = trame.length;
  let energie = 0;
  for (let i = 0; i < n; i += 1) energie += trame[i] * trame[i];
  const rms = Math.sqrt(energie / n);
  if (rms < 0.005) return { f0: null, force: 0, rms };

  // Un lag de zero donnerait une autocorrelation de 1 par construction et
  // une hauteur infinie : le decalage minimal est donc toujours d'au moins
  // un echantillon.
  const lagMin = Math.max(1, Math.floor(frequence / F0_MAX));
  const lagMax = Math.min(Math.floor(frequence / F0_MIN), n - 1);

  let meilleurLag = -1;
  let meilleureValeur = 0;

  for (let lag = lagMin; lag <= lagMax; lag += 1) {
    let produit = 0;
    let normeA = 0;
    let normeB = 0;
    for (let i = 0; i + lag < n; i += 1) {
      produit += trame[i] * trame[i + lag];
      normeA += trame[i] * trame[i];
      normeB += trame[i + lag] * trame[i + lag];
    }
    const denominateur = Math.sqrt(normeA * normeB);
    if (denominateur === 0) continue;
    const valeur = produit / denominateur;
    if (valeur > meilleureValeur) {
      meilleureValeur = valeur;
      meilleurLag = lag;
    }
  }

  if (meilleurLag < 0 || meilleureValeur < SEUIL_VOISEMENT) {
    return { f0: null, force: meilleureValeur, rms };
  }
  return { f0: frequence / meilleurLag, force: meilleureValeur, rms };
}

export function contourF0(cheminOuTampon) {
  const tampon =
    typeof cheminOuTampon === "string"
      ? readFileSync(cheminOuTampon)
      : cheminOuTampon;
  const { signal, frequence } = lireWav(tampon);

  const tailleFenetre = Math.round((FENETRE_MS / 1000) * frequence);
  const pas = Math.round((PAS_MS / 1000) * frequence);
  const trames = [];

  for (let debut = 0; debut + tailleFenetre <= signal.length; debut += pas) {
    const trame = signal.subarray(debut, debut + tailleFenetre);
    const { f0, force, rms } = hauteurTrame(trame, frequence);
    trames.push({ temps: debut / frequence, f0, force, rms });
  }

  // Un saut brutal d'une octave est presque toujours une erreur de
  // detection (l'autocorrelation accroche un multiple de la periode).
  // On corrige les octaves isolees plutot que de jeter la trame.
  const voisees = trames.filter((t) => t.f0 !== null);
  if (voisees.length >= 3) {
    const median = mediane(voisees.map((t) => t.f0));
    for (const trame of trames) {
      if (trame.f0 === null) continue;
      if (trame.f0 > median * 1.7) trame.f0 /= 2;
      else if (trame.f0 < median / 1.7) trame.f0 *= 2;
    }
  }

  return { trames, frequence, duree: signal.length / frequence };
}

function mediane(valeurs) {
  const tri = [...valeurs].sort((a, b) => a - b);
  const milieu = Math.floor(tri.length / 2);
  return tri.length % 2 === 0
    ? (tri[milieu - 1] + tri[milieu]) / 2
    : tri[milieu];
}

// ---------------------------------------------------------------------------
// Classement du ton
// ---------------------------------------------------------------------------

// Les cinq tons thais sont decrits par leur contour relatif, pas par des
// hauteurs absolues : chaque locuteur a son registre propre. On exprime donc
// la courbe en demi-tons autour de la mediane de l'enonce, puis on la reduit
// a trois reperes (debut, milieu, fin) sur la portion stable.
export function analyserTon(contour) {
  const voisees = contour.trames.filter((t) => t.f0 !== null);
  if (voisees.length < 5) {
    return { verdict: "insuffisant", nVoisees: voisees.length };
  }

  // On coupe 15 % de chaque bord : attaque consonantique et extinction
  // finale perturbent la mesure sans porter le ton.
  const marge = Math.floor(voisees.length * 0.15);
  const noyau = voisees.slice(marge, voisees.length - marge);
  if (noyau.length < 4) {
    return { verdict: "insuffisant", nVoisees: voisees.length };
  }

  const reference = mediane(noyau.map((t) => t.f0));
  const demiTons = noyau.map((t) => 12 * Math.log2(t.f0 / reference));

  const tiers = Math.max(1, Math.floor(demiTons.length / 3));
  const moyenne = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const debut = moyenne(demiTons.slice(0, tiers));
  const milieu = moyenne(demiTons.slice(tiers, tiers * 2));
  const fin = moyenne(demiTons.slice(-tiers));

  const amplitude = Math.max(...demiTons) - Math.min(...demiTons);
  const pente = fin - debut;

  return {
    verdict: "mesure",
    hauteurMediane: Math.round(reference * 10) / 10,
    debut: arrondi(debut),
    milieu: arrondi(milieu),
    fin: arrondi(fin),
    pente: arrondi(pente),
    amplitude: arrondi(amplitude),
    forme: decrireForme(debut, milieu, fin, amplitude),
    nVoisees: voisees.length,
    dureeVoisee: arrondi(voisees.length * (PAS_MS / 1000)),
  };
}

const arrondi = (x) => Math.round(x * 100) / 100;

// Description qualitative, volontairement prudente : on nomme la forme
// observee sans pretendre nommer le ton lexical, qui depend aussi de la
// duree et du contexte.
function decrireForme(debut, milieu, fin, amplitude) {
  if (amplitude < 1.5) return "plat";
  const monteDebut = milieu - debut > 0.8;
  const monteFin = fin - milieu > 0.8;
  const descendDebut = milieu - debut < -0.8;
  const descendFin = fin - milieu < -0.8;

  if (monteDebut && descendFin) return "cloche (monte puis descend)";
  if (descendDebut && monteFin) return "creux (descend puis remonte)";
  if (monteDebut || monteFin) return "montant";
  if (descendDebut || descendFin) return "descendant";
  return "plat";
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function fichiersDe(chemins) {
  const sortie = [];
  for (const chemin of chemins) {
    if (statSync(chemin).isDirectory()) {
      for (const nom of readdirSync(chemin)) {
        if (nom.toLowerCase().endsWith(".wav")) sortie.push(join(chemin, nom));
      }
    } else {
      sortie.push(chemin);
    }
  }
  return sortie.sort();
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const chemins = args.filter((a) => !a.startsWith("--"));
  if (chemins.length === 0) {
    console.error("Usage : f0-contour.mjs <fichier.wav|dossier> [...]");
    process.exitCode = 1;
    return;
  }

  const rapport = [];
  for (const fichier of fichiersDe(chemins)) {
    try {
      const analyse = analyserTon(contourF0(fichier));
      rapport.push({ fichier: basename(fichier), ...analyse });
    } catch (erreur) {
      rapport.push({
        fichier: basename(fichier),
        verdict: "erreur",
        erreur: String(erreur),
      });
    }
  }

  if (json) {
    console.log(JSON.stringify(rapport, null, 2));
    return;
  }

  console.log(
    "fichier".padEnd(34) +
      "F0 med".padStart(8) +
      "debut".padStart(8) +
      "milieu".padStart(8) +
      "fin".padStart(8) +
      "pente".padStart(8) +
      "  forme",
  );
  for (const ligne of rapport) {
    if (ligne.verdict !== "mesure") {
      console.log(`${ligne.fichier.padEnd(34)}  ${ligne.verdict}`);
      continue;
    }
    console.log(
      ligne.fichier.padEnd(34) +
        String(ligne.hauteurMediane).padStart(8) +
        String(ligne.debut).padStart(8) +
        String(ligne.milieu).padStart(8) +
        String(ligne.fin).padStart(8) +
        String(ligne.pente).padStart(8) +
        "  " +
        ligne.forme,
    );
  }
}

// pathToFileURL gere les specificites Windows (lettre de lecteur, triple
// barre oblique) qu'une concatenation « file:// » manque silencieusement.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
