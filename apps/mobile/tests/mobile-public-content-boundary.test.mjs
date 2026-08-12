import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const mobileRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const routeRoot = join(mobileRoot, "app");

const forbiddenRuntimeReferences = [
  "@thainaute/content/mobile",
  "../internal/",
  "embedded-audio-expedition-config",
  "embedded-lesson-config",
  "embedded-mechanics-expedition-config",
  "mobile-lesson-expedition-config",
  "mobile-unit01-catalog",
  "packages/content/assets/audio/u01-",
];

describe("frontière publique du contenu mobile", () => {
  it("garde les routes Expo hors des modules et médias éditoriaux internes", () => {
    const routeSources = readdirSync(routeRoot, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isFile() &&
          (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")),
      )
      .map((entry) => ({
        name: entry.name,
        source: readFileSync(join(routeRoot, entry.name), "utf8"),
      }));

    for (const reference of forbiddenRuntimeReferences) {
      expect(
        routeSources.filter(({ source }) => source.includes(reference)),
        `Référence runtime interdite: ${reference}`,
      ).toEqual([]);
    }
  });

  it("enchaîne le contrôle du bundle après les deux exports publics", () => {
    const packageJson = JSON.parse(
      readFileSync(join(mobileRoot, "package.json"), "utf8"),
    );

    expect(packageJson.scripts?.build).toContain("pnpm run bundle:check");
    expect(packageJson.scripts?.["bundle:check"]).toBe(
      "node scripts/check-public-export.mjs dist/android dist/ios",
    );
  });
});
