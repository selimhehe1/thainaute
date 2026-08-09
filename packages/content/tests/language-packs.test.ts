import { describe, expect, it } from "vitest";

import {
  DEFAULT_LANGUAGE_PACK_ID,
  getLanguagePack,
  getLanguagePackFromEnvironment,
  requireLanguagePack,
} from "../src/language-packs";
import { readFixtureBundle } from "../src/repository";
import { targetTextOf } from "../src/target-text";
import { lessonSchema } from "../src/schemas";

describe("registre des packs de langue", () => {
  it("retourne le pack thaï par défaut", () => {
    const pack = getLanguagePackFromEnvironment({});

    expect({
      id: pack.id,
      sourceLocale: pack.sourceLocale,
      targetLocale: pack.targetLocale,
      app: {
        displayName: pack.app.displayName,
        name: pack.app.name,
        slug: pack.app.slug,
        scheme: pack.app.scheme,
        version: pack.app.version,
        microphonePermissionFr: pack.app.microphonePermissionFr,
      },
      native: pack.native,
    }).toEqual({
      id: DEFAULT_LANGUAGE_PACK_ID,
      sourceLocale: "fr-FR",
      targetLocale: "th-TH",
      app: {
        displayName: "Thaïnaute",
        name: "Thaïnaute",
        slug: "thainaute",
        scheme: "thainaute",
        version: "0.1.0",
        microphonePermissionFr:
          "Autorisez Thaïnaute à utiliser le microphone pour enregistrer votre voix. La réécoute reste locale sur cet appareil.",
      },
      native: {
        iosBundleIdentifier: "com.thainaute.app",
        androidPackage: "com.thainaute.app",
      },
    });
    expect(pack.content.lessonIds).toHaveLength(6);
  });

  it("refuse fermé un profil non enregistré", () => {
    expect(getLanguagePack("italian-fr")).toBeUndefined();
    expect(() => requireLanguagePack("italian-fr")).toThrow(
      /Profil de pack de langue inconnu/u,
    );
    expect(() =>
      getLanguagePackFromEnvironment({ THAINAUTE_LANGUAGE_PACK: "italian-fr" }),
    ).toThrow(/italian-fr/u);
  });

  it("expose l'identité cible et l'alias générique sans réécrire le corpus thaï", () => {
    const lesson = readFixtureBundle().lesson;
    expect(lesson.languagePackId).toBe("thai-fr");
    expect(lesson.targetLocale).toBe("th-TH");
    expect(targetTextOf({ thaiRaw: "ขา" })).toBe("ขา");
    expect(targetTextOf({ targetText: "ciao", thaiRaw: null })).toBe("ciao");
    expect(
      lessonSchema.safeParse({ ...lesson, targetLocale: "it-IT" }).success,
    ).toBe(false);
  });
});
