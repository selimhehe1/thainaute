/**
 * Préchauffage des routes avant les scénarios Playwright.
 *
 * Le serveur de test est `next dev` : il compile chaque route à sa PREMIÈRE
 * requête. Playwright, lui, n'attend que la racine avant de lancer les
 * spécifications. Une première navigation vers une route lourde comme
 * `/learn/connected` court donc contre sa propre compilation, et
 * `toBeVisible` expire à 5 secondes sans que rien ne soit cassé.
 *
 * C'est la cause du job `database` rouge par intermittence depuis la PR #11.
 * Allonger le délai d'attente masquerait le problème et rendrait les vraies
 * régressions plus lentes à détecter. On paie la compilation une fois, avant
 * de mesurer quoi que ce soit.
 *
 * Le statut de la réponse est ignoré : une route qui répond 404 ou 503 selon
 * la configuration a tout de même fini de compiler, et c'est la seule chose
 * que ce module cherche à obtenir.
 */

/** Routes visitées par les spécifications, y compris connectées. */
export const PREWARMED_ROUTES: readonly string[] = [
  "/",
  "/today",
  "/path",
  "/account",
  "/privacy",
  "/studio",
  "/learn/demo",
  "/learn/connected",
  "/learn/mecaniques",
];

export interface PrewarmOptions {
  readonly origin: string;
  readonly routes?: readonly string[];
  readonly fetchImpl?: typeof fetch;
  /** Budget total, compilation initiale de Next comprise. */
  readonly timeoutMs?: number;
  readonly sleep?: (ms: number) => Promise<void>;
}

const DEFAULT_TIMEOUT_MS = 180_000;
const RETRY_DELAY_MS = 500;

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Demande chaque route jusqu'à ce qu'elle réponde, puis rend la liste de
 * celles qui ont répondu.
 *
 * Une erreur réseau signifie que le serveur n'écoute pas encore : on
 * réessaie. Le dépassement du budget est une VRAIE erreur, pas un
 * avertissement : continuer laisserait la course en place et rendrait
 * l'échec suivant incompréhensible.
 */
export async function prewarmRoutes({
  origin,
  routes = PREWARMED_ROUTES,
  fetchImpl = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  sleep = defaultSleep,
}: PrewarmOptions): Promise<readonly string[]> {
  const deadline = Date.now() + timeoutMs;
  const warmed: string[] = [];
  for (const route of routes) {
    let lastError: unknown = null;
    let responded = false;
    while (!responded) {
      if (Date.now() >= deadline) {
        throw new Error(
          `Préchauffage abandonné sur ${route} : le serveur de test n'a pas répondu dans le budget imparti. Dernière erreur : ${String(lastError)}`,
        );
      }
      try {
        // `redirect: "manual"` : une redirection compte comme une réponse,
        // et suivre la chaîne préchaufferait une route non demandée.
        await fetchImpl(new URL(route, origin), { redirect: "manual" });
        responded = true;
      } catch (error) {
        lastError = error;
        await sleep(RETRY_DELAY_MS);
      }
    }
    warmed.push(route);
  }
  return warmed;
}
