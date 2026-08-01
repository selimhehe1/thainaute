import { getPublicationBlockers } from "./audit";
import { readFixtureBundle, validateBundle } from "./repository";

const command = process.argv[2];
const bundle = readFixtureBundle();

await validateBundle(bundle);

if (command === "validate") {
  console.log(
    "Contenu valide : schémas, références, Unicode et audio vérifiés.",
  );
} else if (command === "audit") {
  const blockers = getPublicationBlockers(bundle);
  if (blockers.length === 0) {
    throw new Error("La fixture devrait être bloquée mais paraît publiable.");
  }
  console.log(
    `Porte de publication active : ${blockers.map(({ code }) => code).join(", ")}.`,
  );
} else {
  throw new Error("Commande attendue : validate ou audit.");
}
