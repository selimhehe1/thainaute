#!/usr/bin/env tsx
// Valide un paquet de contenu compilé, fichiers audio compris.
//
// C'est le contrôle terminal : il rouvre chaque fichier audio déclaré,
// recalcule son empreinte et sa taille, et les confronte au manifeste. Un
// manifeste juste sur un fichier absent ou modifié échoue ici, et nulle
// part ailleurs.
//
// Usage :
//   pnpm --filter @thainaute/content content:verify -- u01-l1a

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { contentBundleSchema } from "../src/schemas";
import { validateBundle } from "../src/repository";
import { getPublicationBlockers } from "../src/audit";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function sansNotes(brut: unknown): unknown {
  return Object.fromEntries(
    Object.entries(brut as Record<string, unknown>).filter(
      ([cle]) => !cle.startsWith("$"),
    ),
  );
}

async function main(): Promise<void> {
  const identifiant = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (identifiant === undefined) {
    console.error("usage: content:verify -- <identifiant-lecon>");
    process.exitCode = 2;
    return;
  }

  const lesson: unknown = JSON.parse(
    readFileSync(
      join(RACINE, "packages/content/data/lessons", `${identifiant}.v1.json`),
      "utf8",
    ),
  );
  const audioManifest: unknown = JSON.parse(
    readFileSync(
      join(RACINE, "packages/content/data/audio", `${identifiant}.v1.json`),
      "utf8",
    ),
  );
  const registre = JSON.parse(
    readFileSync(join(RACINE, "content/sources-registry.json"), "utf8"),
  ) as { sources: unknown[] };

  const utilisees = (lesson as { provenance: { sourceIds: string[] } })
    .provenance.sourceIds;
  const sources = registre.sources
    .map(sansNotes)
    .filter((s) => utilisees.includes((s as { sourceId: string }).sourceId));

  const bundle = contentBundleSchema.parse({ lesson, audioManifest, sources });
  await validateBundle(bundle);

  console.log(`${identifiant} : paquet VALIDE`);
  console.log(
    `  ${bundle.lesson.items.length} items, ${bundle.lesson.exercises.length} exercices, ${bundle.audioManifest.entries.length} audios`,
  );
  console.log("  fichiers audio rouverts, empreintes conformes");

  const controleTon = bundle.audioManifest.entries.map((entree) => ({
    ton: entree.toneCheck?.expectedTone ?? "?",
    ok: entree.toneCheck?.consistent ?? false,
  }));
  const conformes = controleTon.filter((c) => c.ok).length;
  console.log(
    `  contrôle de ton : ${conformes}/${controleTon.length} conformes` +
      (conformes === controleTon.length
        ? ""
        : ` (non conformes : ${controleTon
            .filter((c) => !c.ok)
            .map((c) => c.ton)
            .join(", ")})`),
  );

  const codes = getPublicationBlockers(bundle).map(({ code }) => code);
  console.log(`  porte de publication : ${codes.join(", ")}`);
}

await main();
