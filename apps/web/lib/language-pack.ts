import {
  DEFAULT_LANGUAGE_PACK_ID,
  LANGUAGE_PACK_ENV,
  getLanguagePackFromEnvironment,
  type LanguagePack,
} from "@thainaute/content/language-packs";

// Keeping the public lookup explicit lets Next inline the variable in client
// bundles while the server can still use the private build variable.
const PUBLIC_LANGUAGE_PACK_ENV = "NEXT_PUBLIC_THAINAUTE_LANGUAGE_PACK";

export function getActiveWebLanguagePack(
  environment?: Readonly<Record<string, string | undefined>>,
): LanguagePack {
  const requested =
    environment === undefined
      ? (process.env.NEXT_PUBLIC_THAINAUTE_LANGUAGE_PACK ??
        process.env["THAINAUTE_LANGUAGE_PACK"])
      : (environment[PUBLIC_LANGUAGE_PACK_ENV] ??
        environment[LANGUAGE_PACK_ENV]);
  return getLanguagePackFromEnvironment({
    [LANGUAGE_PACK_ENV]: requested ?? DEFAULT_LANGUAGE_PACK_ID,
  });
}

function scopedDatabaseName(base: string, packId: string): string {
  if (packId === DEFAULT_LANGUAGE_PACK_ID) return base;
  const safePackId = packId.replace(/[^a-z0-9-]/giu, "-");
  return `${base.replace(/-v1$/u, "")}-${safePackId}-v1`;
}

export function getWebLearningDatabaseName(
  environment?: Readonly<Record<string, string | undefined>>,
): string {
  return scopedDatabaseName(
    "thainaute-learning-v1",
    getActiveWebLanguagePack(environment).id,
  );
}

export function getWebDemoDatabaseName(
  environment?: Readonly<Record<string, string | undefined>>,
): string {
  return scopedDatabaseName(
    "thainaute-demo-v1",
    getActiveWebLanguagePack(environment).id,
  );
}

export function getWebExperienceDatabaseName(
  environment?: Readonly<Record<string, string | undefined>>,
): string {
  return scopedDatabaseName(
    "thainaute-local-experience-v1",
    getActiveWebLanguagePack(environment).id,
  );
}

export function getWebPublicContentCacheDatabaseName(
  environment?: Readonly<Record<string, string | undefined>>,
): string {
  return scopedDatabaseName(
    "thainaute-public-content-v1",
    getActiveWebLanguagePack(environment).id,
  );
}
