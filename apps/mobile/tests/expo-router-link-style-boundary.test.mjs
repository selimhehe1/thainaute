import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const mobileRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoots = ["app", "components", "internal", "lib"].map((directory) =>
  join(mobileRoot, directory),
);

function readTypeScriptSources(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = join(directory, entry.name);
    if (entry.isDirectory()) return readTypeScriptSources(target);
    if (
      !entry.isFile() ||
      (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx"))
    ) {
      return [];
    }
    return [
      {
        name: target.slice(mobileRoot.length + 1),
        source: readFileSync(target, "utf8"),
      },
    ];
  });
}

describe("frontière des enfants Link Expo Router", () => {
  it("aplatit les tableaux de styles avant de les passer à un enfant asChild", () => {
    const routeSources = sourceRoots.flatMap(readTypeScriptSources);
    const directChildPattern =
      /<Link\b(?=[^>]*\basChild\b)[^>]*>\s*<[A-Z][A-Za-z0-9.]*\b([\s\S]*?)>/gu;

    for (const { name, source } of routeSources) {
      for (const match of source.matchAll(directChildPattern)) {
        expect(
          match[1],
          `${name}: un enfant direct de Link asChild reçoit un tableau de styles`,
        ).not.toMatch(/\bstyle=\{\s*\[/u);
      }
    }
  });
});
