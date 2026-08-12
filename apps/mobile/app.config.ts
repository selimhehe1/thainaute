import type { ConfigContext, ExpoConfig } from "expo/config";

import {
  getLanguagePackFromEnvironment,
  type LanguagePack,
} from "@thainaute/content/language-packs";

function applyLanguagePack(
  config: ConfigContext["config"],
  pack: LanguagePack,
): ExpoConfig {
  return {
    ...config,
    name: pack.app.name,
    slug: pack.app.slug,
    version: pack.app.version,
    scheme: pack.app.scheme,
    extra: {
      ...config.extra,
      languagePackId: pack.id,
      targetLocale: pack.targetLocale,
      microphonePermissionFr: pack.app.microphonePermissionFr,
    },
    ios: {
      ...config.ios,
      bundleIdentifier: pack.native.iosBundleIdentifier,
    },
    android: {
      ...config.android,
      package: pack.native.androidPackage,
    },
  };
}

export default function appConfig({ config }: ConfigContext): ExpoConfig {
  return applyLanguagePack(config, getLanguagePackFromEnvironment(process.env));
}
