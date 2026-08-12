import {
  authoringCatalog,
  readCompiledLessonBundle,
  readFiveMechanicsFixtureBundle,
} from "@thainaute/content";
import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { buttonClass } from "@/components/ui/button";
import panel from "@/components/ui/panel.module.css";

import styles from "./practice.module.css";

export const metadata = {
  title: "Pratiquer",
  robots: { index: false, follow: false },
};

/**
 * Ce que la personne peut ouvrir MAINTENANT.
 *
 * La porte est la même que celle de `/learn/lecon/[lecon]` : une leçon
 * n'apparaît que si elle est `published` ET `public`. Le catalogue d'autorat
 * sert uniquement à annoncer ce qui vient, sans jamais révéler le contenu
 * d'un brouillon : ni titre thaï, ni exercice, seulement un nombre.
 */
function leconsPubliees() {
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

export default function PracticePage() {
  const publiees = leconsPubliees();
  const { lesson: fixture } = readFiveMechanicsFixtureBundle();
  const aVenir = authoringCatalog.length - publiees.length;

  return (
    <main className={panel.shell}>
      <SiteHeader navLabel="Navigation de la pratique">
        <Link href="/progress">Progrès</Link>
      </SiteHeader>

      <section className={panel.panel}>
        <p className={panel.eyebrow}>Pratiquer</p>
        <h1>
          {publiees.length === 0
            ? "Le premier cours arrive."
            : "Choisissez votre séance."}
        </h1>

        {publiees.length === 0 ? (
          <p className={panel.lede}>
            Aucun cours n’est publié pour l’instant. La boucle technique
            ci-dessous permet déjà d’éprouver les cinq mécaniques d’exercice,
            sans enseigner de thaï.
          </p>
        ) : (
          <p className={panel.lede}>
            {publiees.length} leçon{publiees.length > 1 ? "s" : ""} disponible
            {publiees.length > 1 ? "s" : ""}, gratuitement et sans compte.
          </p>
        )}

        <ul className={styles.lessons}>
          {publiees.map((lesson) => (
            <li className={styles.lesson} key={lesson.lessonId}>
              <p className={styles.lessonTitle}>{lesson.titleFr}</p>
              <p className={styles.lessonObjective}>{lesson.objectiveFr}</p>
              <p className={styles.lessonMeta}>
                {lesson.exerciseCount} exercice
                {lesson.exerciseCount > 1 ? "s" : ""}
              </p>
              <Link
                className={buttonClass("primary")}
                href={`/learn/lecon/${lesson.lessonId}`}
              >
                Ouvrir la leçon
              </Link>
            </li>
          ))}

          <li className={`${styles.lesson} ${styles.technique}`}>
            <p className={styles.badge}>Donnée fictive, non publiable</p>
            <p className={styles.lessonTitle}>{fixture.titleFr}</p>
            <p className={styles.lessonObjective}>
              Éprouve les cinq mécaniques d’exercice sans enseigner de contenu
              thaï.
            </p>
            <p className={styles.lessonMeta}>
              {fixture.exercises.length} exercices
            </p>
            <Link className={buttonClass("secondary")} href="/learn/demo">
              Ouvrir la boucle technique
            </Link>
          </li>
        </ul>

        {aVenir > 0 && (
          <p className={panel.note}>
            {aVenir} leçon{aVenir > 1 ? "s" : ""} {aVenir > 1 ? "sont" : "est"}{" "}
            rédigée{aVenir > 1 ? "s" : ""} et attend
            {aVenir > 1 ? "ent" : ""} {aVenir > 1 ? "leur" : "sa"} relecture
            avant publication. Revue par un locuteur natif : en attente.
          </p>
        )}
      </section>
    </main>
  );
}
