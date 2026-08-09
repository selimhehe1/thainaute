import { describe, expect, it } from "vitest";

import {
  getActiveWebLanguagePack,
  getWebExperienceDatabaseName,
  getWebLearningDatabaseName,
} from "../lib/language-pack";

describe("profil de langue web", () => {
  it("utilise le pack thaï par défaut et garde les noms historiques", () => {
    const environment = {
      THAINAUTE_LANGUAGE_PACK: undefined,
      NEXT_PUBLIC_THAINAUTE_LANGUAGE_PACK: undefined,
    };

    expect(getActiveWebLanguagePack(environment).id).toBe("thai-fr");
    expect(getWebLearningDatabaseName(environment)).toBe(
      "thainaute-learning-v1",
    );
    expect(getWebExperienceDatabaseName(environment)).toBe(
      "thainaute-local-experience-v1",
    );
  });

  it("fait primer la valeur publique quand elle est fournie", () => {
    expect(
      getActiveWebLanguagePack({
        THAINAUTE_LANGUAGE_PACK: "thai-fr",
        NEXT_PUBLIC_THAINAUTE_LANGUAGE_PACK: "thai-fr",
      }).targetLocale,
    ).toBe("th-TH");
  });
});
