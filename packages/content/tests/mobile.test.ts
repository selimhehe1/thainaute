import { describe, expect, it } from "vitest";

import {
  EMBEDDED_UNITE_01_LESSON_KEYS,
  readEmbeddedUnite01LessonBundle,
  readEmbeddedUnite01LessonBundles,
  readEmbeddedUnite01Lecon1aBundle,
} from "../src/mobile";

describe("contenu embarqué mobile", () => {
  it("expose le premier extrait réel sans dépendance au registre Node", () => {
    const bundle = readEmbeddedUnite01Lecon1aBundle();
    const exercise = bundle.lesson.exercises[0];
    if (exercise?.type !== "audio_choice") {
      throw new Error("Le premier exercice mobile doit être une écoute.");
    }

    expect(bundle.lesson.lessonId).toMatch(/^[0-9a-f-]{36}$/u);
    expect(exercise?.type).toBe("audio_choice");
    expect(bundle.audioManifest.lessonVersionId).toBe(bundle.lesson.versionId);
    expect(
      bundle.audioManifest.entries.some(
        ({ assetId }) => assetId === exercise.audioAssetId,
      ),
    ).toBe(true);
  });
  it("n'embarque que des leçons publiées, dans l'ordre du parcours", () => {
    const bundles = readEmbeddedUnite01LessonBundles();

    // Cinq et non six : `u01-l1e` reste un brouillon, et un brouillon est
    // extractible d'un APK ou d'un IPA. Filtrer à l'affichage ne suffisait
    // pas, son JSON partait quand même dans le bundle.
    expect(bundles).toHaveLength(5);
    expect(
      bundles.every(
        ({ lesson }) =>
          lesson.workflowStatus === "published" &&
          lesson.visibility === "public",
      ),
      "un paquet non publié ne doit jamais entrer dans le bundle mobile",
    ).toBe(true);
    expect(bundles.map(({ lesson }) => lesson.lessonId)).toEqual(
      EMBEDDED_UNITE_01_LESSON_KEYS.map(
        (key) => readEmbeddedUnite01LessonBundle(key).lesson.lessonId,
      ),
    );
    expect(
      bundles.every(
        ({ audioManifest, lesson }) =>
          audioManifest.lessonVersionId === lesson.versionId,
      ),
    ).toBe(true);
  });
});
