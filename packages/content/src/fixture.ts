import fiveMechanicsLessonJson from "../data/lessons/five-mechanics-fixture.v1.json";
import lessonJson from "../data/lessons/unicode-audio-fixture.v1.json";

import { lessonSchema } from "./schemas";

/** Fixture embarquable, sans accès disque ni données linguistiques publiables. */
export const fixtureLesson = lessonSchema.parse(lessonJson);

/**
 * Même promesse pour la fixture des cinq mécaniques (ADR-0024).
 *
 * `readFiveMechanicsFixtureBundle` de `repository.ts` rend le paquet complet,
 * mais il passe par `node:fs`. Les paquets partagés avec React Native ont
 * besoin de la leçon seule, sans accès disque.
 */
export const fiveMechanicsFixtureLesson = lessonSchema.parse(
  fiveMechanicsLessonJson,
);
