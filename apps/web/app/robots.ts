import type { MetadataRoute } from "next";

import { diagnoseRuntime } from "@/lib/server/runtime-config";

/**
 * Le site n'avait aucun `robots.txt` : il comptait sur la seule balise
 * `meta robots` du layout. Un fichier explicite dit la même chose plus tôt,
 * avant même que la page soit rendue.
 *
 * La règle est celle de `site-metadata.ts`, volontairement recopiée depuis
 * le même diagnostic : tant que le service n'est pas prêt, que l'indexation
 * n'est pas ouverte ou que la synchronisation est fermée, RIEN n'est
 * indexable. Un site qui ne peut pas conserver une progression n'a pas à
 * être référencé.
 */
export default function robots(): MetadataRoute.Robots {
  const diagnostic = diagnoseRuntime();
  const indexable =
    diagnostic.ready &&
    diagnostic.publicIndexing &&
    diagnostic.syncMode === "supabase";

  if (!indexable) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Ces routes ne sont pas du contenu public : un écran de compte ou
        // un studio éditorial n'a rien à faire dans un index.
        disallow: ["/account", "/studio", "/learn/", "/api/"],
      },
    ],
    ...(diagnostic.publicOrigin === null
      ? {}
      : {
          sitemap: new URL("/sitemap.xml", diagnostic.publicOrigin).toString(),
        }),
  };
}
