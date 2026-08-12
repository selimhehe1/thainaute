import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createPlaywrightConfig } from "../playwright.config";
import {
  EXTERNAL_ORIGIN_ENV,
  isCanonicalLoopbackOrigin,
  resolveWebOrigin,
} from "../e2e/origin";

const E2E_DIRECTORY = join(import.meta.dirname, "..", "e2e");
const CONNECTED_SPECS = [
  "connected-sync.spec.ts",
  "connected-learning-ui.spec.ts",
  "connected-content-report.spec.ts",
];

describe("origine des scénarios Playwright", () => {
  /**
   * L'invariant qui a coûté un job rouge : la configuration servait
   * `127.0.0.1` pendant que les spécifications ouvraient `localhost`. Les
   * deux désignent la même machine et jamais le même `localStorage`, donc la
   * session capturée par `storageState` disparaissait du second contexte.
   */
  it("sert exactement l'origine que les spécifications ouvrent", () => {
    const config = createPlaywrightConfig({});
    expect(config.use?.baseURL).toBe(resolveWebOrigin({}));
  });

  it("interdit à une spécification connectée de coder son origine en dur", () => {
    for (const spec of CONNECTED_SPECS) {
      const source = readFileSync(join(E2E_DIRECTORY, spec), "utf8");
      expect(source).not.toMatch(/https?:\/\/(?:localhost|127\.0\.0\.1):3000/u);
      expect(source).toContain("resolveWebOrigin()");
    }
  });

  it("laisse imposer une origine loopback, et refuse tout le reste", () => {
    expect(
      resolveWebOrigin({ [EXTERNAL_ORIGIN_ENV]: "http://localhost:4000" }),
    ).toBe("http://localhost:4000");
    expect(() =>
      resolveWebOrigin({ [EXTERNAL_ORIGIN_ENV]: "https://exemple.test" }),
    ).toThrow(/loopback canonique/u);
    expect(isCanonicalLoopbackOrigin("http://10.0.0.1:3000")).toBe(false);
    expect(isCanonicalLoopbackOrigin("http://127.0.0.1:3000/")).toBe(false);
  });

  it("ne démarre son propre serveur que sans origine imposée", () => {
    expect(createPlaywrightConfig({}).webServer).toBeDefined();
    expect(
      createPlaywrightConfig({ [EXTERNAL_ORIGIN_ENV]: "http://127.0.0.1:3000" })
        .webServer,
    ).toBeUndefined();
  });
});
