import type { Metadata } from "next";

import { diagnoseRuntime } from "./runtime-config";

type Environment = Readonly<Record<string, string | undefined>>;

export function createSiteMetadata(
  environment: Environment = process.env,
): Metadata {
  const diagnostic = diagnoseRuntime(environment);
  const indexingAllowed =
    diagnostic.ready &&
    diagnostic.publicIndexing &&
    diagnostic.syncMode === "supabase";

  return {
    title: {
      default: "Thaïnaute — Le thaï, pensé en français",
      template: "%s · Thaïnaute",
    },
    description:
      "Prototype local d'une méthode de thaï conçue pour les francophones.",
    ...(diagnostic.publicOrigin === null
      ? {}
      : {
          metadataBase: new URL(diagnostic.publicOrigin),
          alternates: { canonical: "/" },
        }),
    robots: { index: indexingAllowed, follow: indexingAllowed },
  };
}
