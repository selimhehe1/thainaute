#!/usr/bin/env tsx
// Compile les items d'une leçon d'autorat vers `itemSchema`.
//
// Ce que ce script garantit
// -------------------------
// Rien n'est inventé. Chaque champ produit vient d'un champ écrit, ou se
// dérive mécaniquement de lui avec un contrôle qui le vérifie :
//
//   thaiRaw           <- champ `thai`, décoration retirée et signalée
//   unicodeCodePoints <- RECALCULÉ depuis thaiRaw, puis comparé au champ
//                        `codepoints` écrit ; un désaccord arrête tout
//   translationFr     <- champ `fr`
//   transcription     <- champ `transcription`, version lue dans `## Méta`
//   syllables         <- DÉRIVÉES de `ipa` (voir ipa-thai.mjs), le
//                        découpage étant refusé s'il ne se reconstitue pas
//   register          <- champ `registre`
//   sourceIds         <- appariés au registre `content/sources-registry.json`
//   id                <- empreinte stable du chemin logique de l'item
//
// Un item que le script ne sait pas représenter fidèlement n'est pas
// approché : il est refusé, compté et nommé.
//
// Usage :
//   pnpm --filter @thainaute/content content:compile -- --unite 1
//   pnpm --filter @thainaute/content content:compile -- --unite 1 --json

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { itemSchema } from "../src/schemas";

// Modules JavaScript partagés avec scripts/verification, typés par les
// fichiers `.d.mts` posés à côté d'eux.
import {
  analyserLecon,
  graphies,
  sequencePointsDeCode,
  type ItemAutorat,
} from "../../../scripts/content/lib/parse-authoring.mjs";
import {
  decouperItem,
  formesDuChamp,
} from "../../../scripts/content/lib/ipa-thai.mjs";
import { uuidStable } from "../../../scripts/content/lib/identite.mjs";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const AUTHORING = join(RACINE, "content", "authoring");

const REGISTRE = JSON.parse(
  readFileSync(join(RACINE, "content", "sources-registry.json"), "utf8"),
) as { sources: { sourceId: string }[] };

const SOURCES_CONNUES = new Set(
  REGISTRE.sources.map((source) => source.sourceId),
);

// Motifs de reconnaissance des citations en prose. Ils ne DÉDUISENT aucune
// licence : ils désignent une entrée du registre, qui, elle, est relue et
// assumée par un humain.
const MOTIFS_SOURCE: readonly (readonly [RegExp, string])[] = [
  [/en\.wiktionary\.org/u, "WIKTIONARY-EN"],
  [/th\.wiktionary\.org/u, "WIKTIONARY-TH"],
  [/dictionary\.orst\.go\.th|\bRID\b/u, "RID-2554"],
  [/volubilis/iu, "VOLUBILIS-26-2"],
  [/unicode/iu, "UNICODE-17"],
];

/**
 * Ordre total, déterministe et INDÉPENDANT DE LA LOCALE.
 *
 * `Array.prototype.sort()` sans comparateur est ambigu à la relecture, et
 * les outils d'analyse le signalent à juste titre. Leur conseil habituel
 * est pourtant `String.localeCompare`, qui serait ici un mauvais choix :
 * il dépend de la locale et des données ICU de la machine, si bien que
 * deux compilations sur deux postes pourraient ordonner différemment.
 *
 * Or la reproductibilité octet pour octet est justement la propriété que
 * ce compilateur garantit. On compare donc par point de code, ce qui est
 * stable partout et suffisant pour des identifiants ASCII.
 */
function ordreStable(gauche: string, droite: string): number {
  if (gauche < droite) return -1;
  if (gauche > droite) return 1;
  return 0;
}

function sourcesDeLItem(champSources: string | undefined): string[] {
  const trouvees = new Set<string>();
  for (const [motif, sourceId] of MOTIFS_SOURCE) {
    if (motif.test(champSources ?? "")) trouvees.add(sourceId);
  }
  for (const sourceId of trouvees) {
    if (!SOURCES_CONNUES.has(sourceId)) {
      throw new Error(`Source ${sourceId} absente du registre.`);
    }
  }
  return [...trouvees].sort(ordreStable);
}

// La convention de transcription est définie une fois pour tout le projet
// par content/authoring/CONVENTIONS.md (« Transcription pédagogique
// Thaïnaute (thainaute-fr-v1) », amendement v1.1 du 3 août 2026). Une seule
// leçon de l'unité 1 la redéclare dans son en-tête ; les autres n'en
// parlent pas.
//
// Elle est donc une CONSTANTE, pas un champ par leçon. La déduire de
// l'en-tête faisait retomber quatre leçons sur cinq sur une valeur sans
// version, silencieusement, ce qui perdait l'information au lieu de la
// signaler.
//
// Le point de « v1.1 » devient un tiret : `identifier` n'accepte que
// [A-Za-z0-9_-].
const TRANSCRIPTION_VERSION = "thainaute-fr-v1-1";

const TONS_FR_VERS_EN: Record<string, string> = {
  moyen: "mid",
  bas: "low",
  descendant: "falling",
  haut: "high",
  montant: "rising",
};

type Refus = { ok: false; motif: string; titre: string };
type Succes = { ok: true; item: unknown };

export function compilerItem(
  item: ItemAutorat,
  identifiantLecon: string,
  versionTranscription: string,
): Refus | Succes {
  const refus = (motif: string): Refus => ({
    ok: false,
    motif,
    titre: item.titre,
  });

  const parts = graphies(item.thai ?? "");
  const seule = parts.length === 1 ? parts[0] : undefined;
  if (seule === undefined) {
    return refus(`${parts.length} graphies dans un seul item`);
  }
  if (!seule.propre) return refus("graphie décorée");
  const thaiRaw: string = seule.sansGlose.normalize("NFC");

  const { famille, formes } = formesDuChamp(item.ipa);
  if (formes.length !== 1) {
    return refus(
      `champ ipa de famille « ${famille} », ${formes.length} formes`,
    );
  }
  const syllabes = decouperItem(formes[0]);
  if (syllabes === null) return refus("découpage phonétique refusé");

  // `syllableSchema.thaiRaw` exige la graphie de CHAQUE syllabe. Le corpus
  // ne segmente pas la graphie thaïe, et la segmentation syllabique du thaï
  // n'est pas triviale : la deviner reviendrait à inventer une donnée que
  // l'apprenant lirait comme vérifiée. Les mots de plus d'une syllabe sont
  // donc refusés tant que le corpus ne porte pas cette segmentation.
  if (syllabes.length > 1) {
    return refus(`${syllabes.length} syllabes, graphie non segmentée`);
  }

  // Le contrôle qui rend la compilation digne de confiance : les points de
  // code sont RECALCULÉS depuis la graphie, puis confrontés à ce que la
  // leçon déclare. Le champ écrit n'est jamais recopié.
  const recalcules: string[] = sequencePointsDeCode(thaiRaw).split(" ");
  const declares = [
    ...(item.codepoints ?? "").matchAll(/U\+[0-9A-F]{4,6}/gu),
  ].map((trouve) => trouve[0]);
  if (declares.length > 0 && declares.join(" ") !== recalcules.join(" ")) {
    return refus("points de code déclarés différents du recalcul");
  }

  const sourceIds = sourcesDeLItem(item.sources);
  if (sourceIds.length === 0) return refus("aucune source reconnue");

  const compile = {
    id: uuidStable("item", identifiantLecon, thaiRaw),
    thaiRaw,
    unicodeCodePoints: recalcules,
    translationFr: item.fr ?? null,
    transcription: {
      systemVersion: versionTranscription,
      value: item.transcription ?? null,
    },
    syllables: syllabes.map((syllabe) => ({
      // Un monosyllabe porte la graphie entière. Le cas polysyllabique
      // a été refusé plus haut, faute de segmentation dans le corpus.
      thaiRaw,
      ipa: syllabe.ipa,
      tone: syllabe.tone,
      vowelLength: syllabe.vowelLength,
      initial: syllabe.initial,
      final: syllabe.final,
    })),
    register: item.registre ?? null,
    sourceIds,
  };

  const verdict = itemSchema.safeParse(compile);
  if (!verdict.success) {
    return refus(`schéma refusé : ${verdict.error.issues[0]?.message}`);
  }

  // Contrôle croisé : le ton dérivé de l'IPA doit dire la même chose que le
  // champ `ton` écrit. Deux chemins indépendants vers le même fait, ce qui
  // transforme une dérivation en vérification.
  const tonEcrit = TONS_FR_VERS_EN[(item.ton ?? "").trim()];
  const unique = syllabes[0];
  if (tonEcrit !== undefined && unique !== undefined) {
    if (unique.tone !== tonEcrit) {
      return refus(
        `ton dérivé « ${unique.tone} » contre ton écrit « ${item.ton} »`,
      );
    }
  }

  return { ok: true, item: verdict.data };
}

export function compilerLecon(chemin: string) {
  const lecon = analyserLecon(chemin);
  const identifiant: string =
    lecon.meta.identifiant ?? relative(RACINE, chemin);
  const version: string = TRANSCRIPTION_VERSION;

  const compiles: unknown[] = [];
  const refuses: Refus[] = [];
  for (const item of lecon.items) {
    const resultat = compilerItem(item, identifiant, version);
    if (resultat.ok) compiles.push(resultat.item);
    else refuses.push(resultat);
  }
  return { identifiant, version, compiles, refuses };
}

function fichiers(args: string[]): string[] {
  const index = args.indexOf("--unite");
  if (index >= 0) {
    const dossier = join(
      AUTHORING,
      `unite-${String(args[index + 1]).padStart(2, "0")}`,
    );
    return readdirSync(dossier)
      .filter((nom) => /^lecon-.*\.md$/u.test(nom))
      .map((nom) => join(dossier, nom));
  }
  return args.filter((a) => !a.startsWith("--")).map((a) => join(RACINE, a));
}

function main(): void {
  const args = process.argv.slice(2);
  const cibles = fichiers(args);
  if (cibles.length === 0) {
    console.error(
      "usage: content:compile -- <lecon.md> | --unite <n> [--json]",
    );
    process.exitCode = 2;
    return;
  }

  const tout: unknown[] = [];
  let totalCompiles = 0;
  let totalRefuses = 0;

  for (const chemin of cibles) {
    const { identifiant, version, compiles, refuses } = compilerLecon(chemin);
    totalCompiles += compiles.length;
    totalRefuses += refuses.length;
    tout.push({ identifiant, version, items: compiles });

    if (!args.includes("--json")) {
      console.log(
        `${identifiant.padEnd(10)} ${String(compiles.length).padStart(3)} compilés, ${String(refuses.length).padStart(2)} refusés   (transcription ${version})`,
      );
      for (const refus of refuses) {
        console.log(`    refus : ${refus.titre}`);
        console.log(`            ${refus.motif}`);
      }
    }
  }

  if (args.includes("--json")) {
    console.log(JSON.stringify(tout, null, 2));
    return;
  }
  console.log(
    `\nTOTAL : ${totalCompiles} items compilés, ${totalRefuses} refusés.`,
  );
}

main();
