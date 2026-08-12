/**
 * Origine unique des scénarios Playwright.
 *
 * POURQUOI CE MODULE EXISTE : la configuration servait `127.0.0.1` pendant
 * que les trois spécifications connectées ouvraient leur second navigateur
 * sur `localhost`. Deux origines, donc deux `localStorage` : la session
 * Supabase capturée par `storageState` n'était pas visible du second
 * contexte, qui affichait l'écran déconnecté. L'assertion échouait sur
 * « element(s) not found », sans rapport avec un délai.
 *
 * `localhost` et `127.0.0.1` désignent la même machine et jamais le même
 * espace de stockage. Une seule fonction décide donc, pour la configuration
 * comme pour les spécifications.
 */

const DEFAULT_ORIGIN = "http://127.0.0.1:3000";
export const EXTERNAL_ORIGIN_ENV = "THAINAUTE_PLAYWRIGHT_EXTERNAL_ORIGIN";

type PlaywrightEnvironment = Readonly<Record<string, string | undefined>>;

export function isCanonicalLoopbackOrigin(value: string): boolean {
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

/** Origine réellement servie, éventuellement imposée par l'environnement. */
export function resolveWebOrigin(
  environment: PlaywrightEnvironment = process.env,
): string {
  const configured = environment[EXTERNAL_ORIGIN_ENV];
  if (configured === undefined) return DEFAULT_ORIGIN;
  if (!isCanonicalLoopbackOrigin(configured)) {
    throw new Error(
      `${EXTERNAL_ORIGIN_ENV} doit être une origine HTTP loopback canonique.`,
    );
  }
  return configured;
}

/** `null` quand aucune origine externe n'est imposée, donc à nous de servir. */
export function resolveExternalOrigin(
  environment: PlaywrightEnvironment = process.env,
): string | null {
  const configured = environment[EXTERNAL_ORIGIN_ENV];
  if (configured === undefined) return null;
  return resolveWebOrigin(environment);
}
