import type { FullConfig } from "@playwright/test";

import { prewarmRoutes } from "./prewarm";

/**
 * Paie la compilation des routes de `next dev` avant la première mesure.
 * Voir `prewarm.ts` pour la raison.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const origin = config.projects[0]?.use.baseURL;
  if (origin === undefined) return;
  const warmed = await prewarmRoutes({ origin });
  console.log(`Routes préchauffées : ${warmed.length}.`);
}
