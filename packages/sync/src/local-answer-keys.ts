// Volontairement `@thainaute/content/schemas` et non la racine du paquet :
// `repository.ts` y expose des helpers `node:fs` que le bundle mobile ne doit
// pas voir. Ce module ne veut que des types.
import type { Lesson, LessonExercise } from "@thainaute/content/schemas";
import type { AnyExerciseAnswerKey } from "@thainaute/domain";

/**
 * Dérive la clé de correction d'un exercice pour la notation LOCALE.
 *
 * En ligne, la clé autoritaire appartient au serveur (ADR-0009) et le client
 * n'en reçoit aucune : le DTO public de `@thainaute/content/public` ne porte
 * ni `correctOptionId`, ni `correctOrder`, ni `acceptedAnswers`. Ce module ne
 * sert donc qu'aux séances jouées sur un paquet complet déjà présent sur
 * l'appareil, où la correction doit rester possible sans réseau.
 *
 * Il existe parce que web et mobile en avaient besoin tous les deux. Une
 * seconde implémentation aurait suffi à faire diverger la notation entre les
 * deux plateformes, alors que le brief exige une progression identique.
 *
 * Renvoie `null` pour un type d'exercice inconnu plutôt que d'inventer une
 * clé : un exercice non notable doit rester non noté, pas être noté au
 * hasard.
 */
export function localAnswerKeyForExercise(
  exercise: LessonExercise,
  contentVersionId: string,
): AnyExerciseAnswerKey | null {
  if (exercise.type === "association") {
    // Une association porte plusieurs items. La projection SRS en vise un
    // seul : le premier, comme le fait déjà le mobile.
    const itemId = exercise.pairs[0]?.itemId;
    if (itemId === undefined) return null;
    return {
      kind: "association",
      exerciseId: exercise.id,
      itemId,
      skill: exercise.skill,
      contentVersionId,
      pairIds: exercise.pairs.map(({ id }) => id),
    };
  }
  if (exercise.type === "word_order") {
    return {
      kind: "word_order",
      exerciseId: exercise.id,
      itemId: exercise.itemId,
      skill: exercise.skill,
      contentVersionId,
      validTokenIds: exercise.tokens.map(({ id }) => id),
      correctOrder: exercise.correctOrder,
    };
  }
  if (exercise.type === "recall") {
    return {
      kind: "recall",
      exerciseId: exercise.id,
      itemId: exercise.itemId,
      skill: exercise.skill,
      contentVersionId,
      acceptedAnswers: exercise.acceptedAnswers.map(({ value }) => value),
      answerPolicy: exercise.answerPolicy,
    };
  }
  // L'écoute et la lecture choisissent une option : leur tentative continue
  // de passer par `selectedOptionId`, sans réponse typée.
  if (exercise.type === "audio_choice" || exercise.type === "reading") {
    return {
      exerciseId: exercise.id,
      itemId: exercise.itemId,
      correctOptionId: exercise.correctOptionId,
      skill: exercise.skill,
      contentVersionId,
    };
  }
  return null;
}

/** Clés de tous les exercices notables d'une leçon, dans l'ordre du plan. */
export function localAnswerKeysForLesson(
  lesson: Pick<Lesson, "exercises" | "versionId">,
): readonly AnyExerciseAnswerKey[] {
  return lesson.exercises.flatMap((exercise) => {
    const key = localAnswerKeyForExercise(exercise, lesson.versionId);
    return key === null ? [] : [key];
  });
}
