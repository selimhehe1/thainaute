import Constants from "expo-constants";

import {
  DEFAULT_LANGUAGE_PACK_ID,
  requireLanguagePack,
  type LanguagePack,
} from "@thainaute/content/language-packs";

interface ExpoLanguagePackExtra {
  readonly languagePackId?: unknown;
}

function configuredPackId(): string {
  const extra = Constants.expoConfig?.extra as
    ExpoLanguagePackExtra | undefined;
  return typeof extra?.languagePackId === "string"
    ? extra.languagePackId
    : DEFAULT_LANGUAGE_PACK_ID;
}

export function getActiveMobileLanguagePack(): LanguagePack {
  return requireLanguagePack(configuredPackId());
}

/**
 * Le nom historique du pack thaï est conservé pour ne pas perdre les données
 * locales déjà présentes sur les appareils. Les packs suivants obtiennent
 * une base SQLite distincte dès leur première installation.
 */
export function getMobileDatabaseName(packId = configuredPackId()): string {
  if (packId === DEFAULT_LANGUAGE_PACK_ID) return "thainaute-local.db";
  const safePackId = packId.replace(/[^a-z0-9-]/giu, "-");
  return `thainaute-local-${safePackId}.db`;
}
