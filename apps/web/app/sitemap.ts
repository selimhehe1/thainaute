import type { MetadataRoute } from "next";

import { diagnoseRuntime } from "@/lib/server/runtime-config";

/**
 * Les pages qu'un moteur peut légitimement lister, et elles seules.
 *
 * Vide tant que le site n'est pas indexable : annoncer des URL qu'on
 * demande par ailleurs de ne pas indexer serait se contredire. Les leçons
 * n'y figurent pas encore, aucune n'étant publiée.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const diagnostic = diagnoseRuntime();
  const indexable =
    diagnostic.ready &&
    diagnostic.publicIndexing &&
    diagnostic.syncMode === "supabase";
  if (!indexable || diagnostic.publicOrigin === null) return [];

  const origine = diagnostic.publicOrigin;
  return [
    "/",
    "/mentions-legales",
    "/conditions",
    "/confidentialite",
    "/cookies",
  ].map((chemin) => ({
    url: new URL(chemin, origine).toString(),
    lastModified: new Date(),
  }));
}
