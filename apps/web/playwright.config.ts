import { defineConfig, devices } from "@playwright/test";

const DEFAULT_ORIGIN = "http://127.0.0.1:3000";
const EXTERNAL_ORIGIN_ENV = "THAINAUTE_PLAYWRIGHT_EXTERNAL_ORIGIN";

type PlaywrightEnvironment = Readonly<Record<string, string | undefined>>;

function isCanonicalLoopbackOrigin(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/u.exec(
    parsed.hostname,
  );
  const loopbackHostname =
    parsed.hostname === "localhost" ||
    parsed.hostname === "[::1]" ||
    (ipv4 !== null &&
      Number(ipv4[1]) === 127 &&
      ipv4.slice(1).every((part) => Number(part) <= 255));
  return (
    parsed.protocol === "http:" &&
    loopbackHostname &&
    parsed.username === "" &&
    parsed.password === "" &&
    parsed.pathname === "/" &&
    parsed.search === "" &&
    parsed.hash === "" &&
    value === parsed.origin
  );
}

export function createPlaywrightConfig(
  environment: PlaywrightEnvironment = process.env,
) {
  const configuredExternalOrigin = environment[EXTERNAL_ORIGIN_ENV];
  if (
    configuredExternalOrigin !== undefined &&
    !isCanonicalLoopbackOrigin(configuredExternalOrigin)
  ) {
    throw new Error(
      `${EXTERNAL_ORIGIN_ENV} doit être une origine HTTP loopback canonique.`,
    );
  }
  const externalOrigin = configuredExternalOrigin ?? null;
  const sharedConfig = defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    // `next dev` compile chaque route à sa première requête, et Playwright
    // n'attend que la racine. Sans ce préchauffage, la première navigation
    // vers une route lourde court contre sa propre compilation.
    globalSetup: "./e2e/global-setup.ts",
    // Les scénarios connectés ouvrent un SECOND contexte navigateur pour
    // prouver qu'un autre appareil retrouve la progression. Ce contexte n'a
    // aucun cache HTTP : il retélécharge tous les modules de `next dev`, non
    // minifiés, avant d'hydrater React puis de relire la session. Cinq
    // secondes suffisent sur un poste, pas sur un exécuteur partagé.
    //
    // Ce budget n'affaiblit aucune assertion : un élément qui n'apparaît
    // jamais échoue toujours, simplement plus tard. Les nouvelles tentatives
    // restent à zéro, pour qu'un vrai défaut ne soit jamais masqué.
    expect: { timeout: 20_000 },
    use: {
      baseURL: externalOrigin ?? DEFAULT_ORIGIN,
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
      url: DEFAULT_ORIGIN,
      reuseExistingServer: false,
    },
  });
}

export default createPlaywrightConfig();
