import { authoringCatalog, readCompiledLessonBundle } from "@thainaute/content";
import type { Lesson } from "@thainaute/content/schemas";

/**
 * Les leçons qu'une personne peut réellement ouvrir aujourd'hui.
 *
 * La porte est celle de `/learn/lecon/[lecon]` : `published` ET `public`,
 * c'est-à-dire couverte par une signature humaine versionnée. Le catalogue
 * d'autorat sert uniquement à énumérer les identifiants ; il ne décide de
 * rien et ne laisse fuiter aucun brouillon.
 *
 * Ce module existe pour que le nombre annoncé sur la page d'accueil et la
 * liste servie par Pratiquer ne puissent pas diverger. Une page qui compte
 * elle-même finit toujours par mentir après une publication.
 */
export type LeconPubliee = {
  readonly lessonId: string;
  readonly titleFr: string;
  readonly objectiveFr: string;
  readonly exerciseCount: number;
};

export function leconsPubliees(): readonly LeconPubliee[] {
  return authoringCatalog.flatMap((entry) => {
    const bundle = readCompiledLessonBundle(entry.lessonId);
    if (bundle === null) return [];
    if (
      bundle.lesson.workflowStatus !== "published" ||
      bundle.lesson.visibility !== "public"
    ) {
      return [];
    }
    return [
      {
        lessonId: entry.lessonId,
        titleFr: bundle.lesson.titleFr,
        objectiveFr: bundle.lesson.objectiveFr,
        exerciseCount: bundle.lesson.exercises.length,
      },
    ];
  });
}

/** Nombre de leçons rédigées qui attendent encore leur signature. */
export function leconsEnAttente(publiees: number): number {
  return authoringCatalog.length - publiees;
}

/**
 * Les paquets complets des leçons publiées, pour qui a besoin du contenu et
 * pas seulement du résumé : la projection de progression, par exemple, doit
 * connaître les exercices pour savoir ce qui reste à faire.
 */
export function paquetsPublies(): readonly Lesson[] {
  return leconsPubliees().flatMap(({ lessonId }) => {
    const bundle = readCompiledLessonBundle(lessonId);
    return bundle === null ? [] : [bundle.lesson];
  });
}
