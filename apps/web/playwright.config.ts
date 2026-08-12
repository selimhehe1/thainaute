import { defineConfig, devices } from "@playwright/test";

import { resolveExternalOrigin, resolveWebOrigin } from "./e2e/origin";

type PlaywrightEnvironment = Readonly<Record<string, string | undefined>>;

export function createPlaywrightConfig(
  environment: PlaywrightEnvironment = process.env,
) {
  const externalOrigin = resolveExternalOrigin(environment);
  const origin = resolveWebOrigin(environment);
  const sharedConfig = defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    // `next dev` compile chaque route à sa première requête, et Playwright
    // n'attend que la racine. Sans ce préchauffage, la première navigation
    // vers une route lourde court contre sa propre compilation.
    globalSetup: "./e2e/global-setup.ts",
    // Les scénarios connectés ouvrent un second contexte navigateur, sans
    // aucun cache HTTP : il retélécharge tous les modules de `next dev`, non
    // minifiés, avant d'hydrater React. Ce budget n'affaiblit aucune
    // assertion, un élément qui n'apparaît jamais échoue toujours, et les
    // nouvelles tentatives restent à zéro.
    expect: { timeout: 20_000 },
    use: {
      baseURL: origin,
      launchOptions: {
        args: [
          "--use-fake-device-for-media-stream",
          "--use-fake-ui-for-media-stream",
        ],
      },
      permissions: ["microphone"],
      trace: "on-first-retry",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  });
  if (externalOrigin !== null) return sharedConfig;
  return defineConfig({
    ...sharedConfig,
    webServer: {
      command: "pnpm exec next dev --hostname 127.0.0.1 --port 3000",
      env: { THAINAUTE_STUDIO_MODE: "disabled" },
      url: origin,
      reuseExistingServer: false,
    },
  });
}

export default createPlaywrightConfig();
