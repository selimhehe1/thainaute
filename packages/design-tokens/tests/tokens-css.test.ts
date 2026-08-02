import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { buildTokensCss } from "../src/generate-css";
import { colors, toneCurves } from "../src/index";

describe("tokens.css", () => {
  it("reste synchronisé avec la source de vérité TypeScript", () => {
    const committed = readFileSync(
      fileURLToPath(new URL("../src/tokens.css", import.meta.url)),
      "utf8",
    );
    expect(committed).toBe(buildTokensCss());
  });

  it("expose la palette du brief sans altération", () => {
    expect(colors.jasmine).toBe("#fbfaf7");
    expect(colors.ink).toBe("#283450");
    expect(colors.coral).toBe("#e9615c");
    expect(colors.jade).toBe("#43a283");
    expect(colors.saffron).toBe("#f1b84b");
    expect(colors.mist).toBe("#eef1f4");
  });

  it("fournit un tracé pour chacun des cinq tons", () => {
    const names = Object.keys(toneCurves).sort();
    expect(names).toEqual(["falling", "high", "low", "mid", "rising"]);
    for (const path of Object.values(toneCurves)) {
      expect(path).toMatch(/^M10,\d+ C /u);
    }
  });
});
