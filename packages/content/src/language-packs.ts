/**
 * Contrat commun d'un pack de langue.
 *
 * Le français est volontairement fixe dans cette première version : un pack
 * décrit uniquement la langue cible et ses capacités pédagogiques. Le
 * contenu, les comptes, la progression et les entitlements restent donc
 * partagés par l'application.
 */

export const DEFAULT_LANGUAGE_PACK_ID = "thai-fr" as const;
export const LANGUAGE_PACK_ENV = "THAINAUTE_LANGUAGE_PACK" as const;

export const LANGUAGE_PACK_IDS = [DEFAULT_LANGUAGE_PACK_ID] as const;
export type LanguagePackId = (typeof LANGUAGE_PACK_IDS)[number];

export type TargetScript = "thai" | "latin" | "other";
export type TargetFontFamily = "thai" | "latin";

export interface LanguagePack {
  readonly id: LanguagePackId;
  readonly sourceLocale: "fr-FR";
  readonly targetLocale: string;
  readonly targetLanguage: {
    readonly labelFr: string;
    readonly nativeName: string;
    readonly englishName: string;
  };
  readonly app: {
    readonly displayName: string;
    readonly name: string;
    readonly slug: string;
    readonly scheme: string;
    readonly version: string;
    readonly taglineFr: string;
    readonly descriptionFr: string;
    readonly seoTitleFr: string;
    readonly microphonePermissionFr: string;
  };
  readonly native: {
    readonly iosBundleIdentifier: string;
    readonly androidPackage: string;
  };
  readonly typography: {
    readonly targetFontFamily: TargetFontFamily;
    readonly targetScript: TargetScript;
    readonly targetScale: "thai" | "latin";
  };
  readonly capabilities: {
    readonly toneContours: boolean;
    readonly vowelLength: boolean;
    readonly transcriptionSystemVersion: string;
  };
  readonly content: {
    readonly registryKey: string;
    readonly lessonIds: readonly string[];
  };
}

export const thaiFrLanguagePack: LanguagePack = {
  id: DEFAULT_LANGUAGE_PACK_ID,
  sourceLocale: "fr-FR",
  targetLocale: "th-TH",
  targetLanguage: {
    labelFr: "thaï",
    nativeName: "ภาษาไทย",
    englishName: "Thai",
  },
  app: {
    displayName: "Thaïnaute",
    name: "Thaïnaute",
    slug: "thainaute",
    scheme: "thainaute",
    version: "0.1.0",
    taglineFr: "Le thaï, pensé en français",
    descriptionFr:
      "Bêta privée d'une méthode de thaï conçue pour les francophones.",
    seoTitleFr: "Thaïnaute · Le thaï, pensé en français",
    microphonePermissionFr:
      "Autorisez Thaïnaute à utiliser le microphone pour enregistrer votre voix. La réécoute reste locale sur cet appareil.",
  },
  native: {
    iosBundleIdentifier: "com.thainaute.app",
    androidPackage: "com.thainaute.app",
  },
  typography: {
    targetFontFamily: "thai",
    targetScript: "thai",
    targetScale: "thai",
  },
  capabilities: {
    toneContours: true,
    vowelLength: true,
    transcriptionSystemVersion: "thainaute-rtgs-v1",
  },
  content: {
    registryKey: "thai-fr",
    lessonIds: [
      "u01-l1a",
      "u01-l1b",
      "u01-l1c",
      "u01-l1d",
      "u01-l1e",
      "u01-l1f",
    ],
  },
};

const LANGUAGE_PACK_REGISTRY: Readonly<Record<LanguagePackId, LanguagePack>> = {
  [DEFAULT_LANGUAGE_PACK_ID]: thaiFrLanguagePack,
};

export function getLanguagePack(
  id: string | undefined,
): LanguagePack | undefined {
  if (id === undefined) return undefined;
  return Object.hasOwn(LANGUAGE_PACK_REGISTRY, id)
    ? LANGUAGE_PACK_REGISTRY[id as LanguagePackId]
    : undefined;
}

export function requireLanguagePack(id: string | undefined): LanguagePack {
  const pack = getLanguagePack(id);
  if (pack !== undefined) return pack;
  const requested = id === undefined || id.length === 0 ? "<absent>" : id;
  throw new Error(
    `Profil de pack de langue inconnu: ${requested}. ` +
      `Valeurs disponibles: ${LANGUAGE_PACK_IDS.join(", ")}.`,
  );
}

export function getLanguagePackFromEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
): LanguagePack {
  return requireLanguagePack(
    environment[LANGUAGE_PACK_ENV] ?? DEFAULT_LANGUAGE_PACK_ID,
  );
}
