import {
  authoringCatalog,
  readAuthoringCompiledLessonBundle,
  readCompiledLessonBundle,
} from "@thainaute/content";
import type { ContentBundle } from "@thainaute/content";
import type { Lesson } from "@thainaute/content/schemas";

/**
 * Un paquet de cours, quel que soit le registre qui le porte.
 *
 * POURQUOI CETTE FONCTION EXISTE : le dépôt tient deux registres. Celui de
 * `repository.ts` est écrit à la main et n'en connaît que 24 ; celui de
 * `authoring-compiled.generated.ts` est généré et les connaît toutes. La
 * route `/learn/lecon/[lecon]` interrogeait déjà les deux, la liste des
 * leçons publiées un seul. Une leçon signée absente du registre manuel
 * aurait donc été ouvrable par son adresse et invisible partout ailleurs.
 *
 * La publication est gardée par la signature et le statut, pas par
 * l'appartenance à un registre : les deux lectures doivent voir la même
 * chose.
 */
export function lireCours(slug: string): ContentBundle | null {
  return (
    readCompiledLessonBundle(slug) ?? readAuthoringCompiledLessonBundle(slug)
  );
}

/** Le paquet, seulement s'il a franchi la porte de publication. */
export function lireCoursPublie(slug: string): ContentBundle | null {
  const bundle = lireCours(slug);
  return bundle?.lesson.workflowStatus === "published" &&
    bundle.lesson.visibility === "public"
    ? bundle
    : null;
}

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
    const bundle = lireCoursPublie(entry.lessonId);
    if (bundle === null) return [];
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
 *
 * PIÈGE : `slug` et `lesson.lessonId` sont deux choses différentes qui
 * portent presque le même nom. Le slug est l'identifiant d'autorat,
 * `u01-l1a`, celui qu'attend la route `/learn/lecon/[lecon]`.
 * `lesson.lessonId` est l'UUID canonique dérivé, que la route ne connaît
 * pas. Les confondre construit un lien qui répond 404.
 */
export function paquetsPublies(): readonly {
  readonly slug: string;
  readonly lesson: Lesson;
}[] {
  return leconsPubliees().flatMap(({ lessonId }) => {
    const bundle = lireCoursPublie(lessonId);
    return bundle === null ? [] : [{ slug: lessonId, lesson: bundle.lesson }];
  });
}
