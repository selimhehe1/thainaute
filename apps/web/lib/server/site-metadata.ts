import type { Metadata } from "next";

import { diagnoseRuntime } from "./runtime-config";
import { getActiveWebLanguagePack } from "../language-pack";

type Environment = Readonly<Record<string, string | undefined>>;

export function createSiteMetadata(
  environment: Environment = process.env,
): Metadata {
  const languagePack = getActiveWebLanguagePack(environment);
  const diagnostic = diagnoseRuntime(environment);
  const indexingAllowed =
    diagnostic.ready &&
    diagnostic.publicIndexing &&
    diagnostic.syncMode === "supabase";

  return {
    title: {
      default: languagePack.app.seoTitleFr,
      template: `%s · ${languagePack.app.displayName}`,
    },
    description: languagePack.app.descriptionFr,
    ...(diagnostic.publicOrigin === null
      ? {}
      : {
          metadataBase: new URL(diagnostic.publicOrigin),
          alternates: { canonical: "/" },
        }),
    robots: { index: indexingAllowed, follow: indexingAllowed },
  };
}
