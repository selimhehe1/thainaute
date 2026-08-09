import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getPublicationBlockers } from "./audit";
import {
  authoringCompiledLessonIds,
  readAuthoringCompiledLessonBundle,
} from "./authoring-compiled";
import {
  readCompiledLessonBundle,
  readFixtureBundle,
  validateBundleAudioFiles,
} from "./repository";
import type { ContentBundle } from "./schemas";
import {
  validateBundleAudioReferences,
  validateBundleStructureMetadata,
} from "./validation";

type Command = "audit" | "validate";
type ValidationPhase = "fichiers audio" | "références audio" | "structure";

interface RequestedBundle {
  readonly label: string;
  readonly read: () => ContentBundle;
}

interface CliOptions {
  readonly command: Command;
  readonly release: boolean;
  readonly requested: readonly RequestedBundle[];
}

function parseOptions(args: readonly string[]): CliOptions {
  const cleaned = args.filter((argument) => argument !== "--");
  const command = cleaned[0];
  if (command !== "validate" && command !== "audit") {
    throw new Error(
      "Commande attendue : validate ou audit, avec --all, --release ou un identifiant de leçon.",
    );
  }

  const all = cleaned.includes("--all");
  const release = cleaned.includes("--release");
  const unknownFlags = cleaned.filter(
    (argument, index) =>
      index > 0 &&
      argument.startsWith("--") &&
      !["--all", "--release"].includes(argument),
  );
  if (unknownFlags.length > 0) {
    throw new Error(`Option inconnue : ${unknownFlags.join(", ")}.`);
  }
  if (command === "validate" && release) {
    throw new Error("--release est réservé à la commande audit.");
  }

  const targets = cleaned
    .slice(1)
    .filter((argument) => !argument.startsWith("--"));
  if (targets.length > 1 || (all && targets.length > 0)) {
    throw new Error("Choisir soit --all, soit une seule cible.");
  }

  const targetAll =
    all || (command === "audit" && release && targets.length === 0);
  if (targetAll) {
    return {
      command,
      release,
      requested: authoringCompiledLessonIds().map((lessonId) => ({
        label: lessonId,
        read: () => {
          const bundle = readAuthoringCompiledLessonBundle(lessonId);
          if (bundle === null) {
            throw new Error(`Leçon compilée inconnue : ${lessonId}.`);
          }
          return bundle;
        },
      })),
    };
  }

  const target = targets[0] ?? "fixture";
  return {
    command,
    release,
    requested: [
      target === "fixture"
        ? { label: "fixture", read: readFixtureBundle }
        : {
            label: target,
            read: () => {
              const bundle =
                readAuthoringCompiledLessonBundle(target) ??
                readCompiledLessonBundle(target);
              if (bundle === null) {
                throw new Error(`Leçon compilée inconnue : ${target}.`);
              }
              return bundle;
            },
          },
    ],
  };
}

function errorMessage(error: unknown): string {
  return String(error)
    .replace(/^Error:\s*/u, "")
    .replaceAll("\n", " | ");
}

/** Exécute la CLI sans arrêter au premier paquet ou à la première porte. */
export async function runContentCli(
  args: readonly string[],
  output: Pick<Console, "error" | "log"> = console,
): Promise<number> {
  let options: CliOptions;
  try {
    options = parseOptions(args);
  } catch (error) {
    output.error(errorMessage(error));
    return 2;
  }

  const failures: string[] = [];
  let blockersCount = 0;

  for (const requested of options.requested) {
    let bundle: ContentBundle;
    try {
      bundle = requested.read();
    } catch (error) {
      failures.push(`${requested.label} [lecture] ${errorMessage(error)}`);
      continue;
    }

    const phases: readonly [ValidationPhase, () => void | Promise<void>][] = [
      ["structure", () => validateBundleStructureMetadata(bundle)],
      ["références audio", () => validateBundleAudioReferences(bundle)],
      ["fichiers audio", () => validateBundleAudioFiles(bundle)],
    ];
    for (const [phase, validate] of phases) {
      try {
        await validate();
      } catch (error) {
        failures.push(`${requested.label} [${phase}] ${errorMessage(error)}`);
      }
    }

    if (options.command === "audit") {
      const blockers = getPublicationBlockers(bundle);
      blockersCount += blockers.length;
      if (options.release && blockers.length > 0) {
        failures.push(
          `${requested.label} [publication] ${blockers.map(({ code }) => code).join(", ")}`,
        );
      }
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) output.error(`FAIL ${failure}`);
    output.error(
      `${failures.length} défaut(s) sur ${options.requested.length} paquet(s).`,
    );
    return 1;
  }

  if (options.command === "validate") {
    output.log(
      `Contenu valide : ${options.requested.length} paquet(s), structure, références et fichiers audio vérifiés.`,
    );
  } else if (options.release) {
    output.log(
      `Audit release réussi : ${options.requested.length} paquet(s) publiables.`,
    );
  } else {
    output.log(
      `Porte de publication inspectée : ${options.requested.length} paquet(s), ${blockersCount} bloqueur(s) actif(s).`,
    );
  }
  return 0;
}

const entrypoint = process.argv[1];
if (
  entrypoint !== undefined &&
  resolve(entrypoint) === resolve(fileURLToPath(import.meta.url))
) {
  process.exitCode = await runContentCli(process.argv.slice(2));
}
