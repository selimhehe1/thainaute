import { readFixtureBundle } from "@thainaute/content";
import Link from "next/link";

import { LessonHeader } from "@/components/layout/lesson-header";
import { buttonClass } from "@/components/ui/button";
import panel from "@/components/ui/panel.module.css";

import { DemoExperience } from "./demo-experience";
import styles from "./lesson.module.css";

export const metadata = { title: "Leçon fictive" };

export default function DemoLessonPage() {
  const { lesson } = readFixtureBundle();
  const exercise = lesson.exercises[0];
  const item = lesson.items[0];

  if (exercise?.type !== "audio_choice" || item === undefined) {
    return (
      <main className={styles.shell}>
        <section className={panel.panel}>
          <h1>La fixture est indisponible.</h1>
          <p className={panel.lede}>
            La validation de contenu doit être relancée avant cette
            démonstration.
          </p>
          <div className={panel.actions}>
            <Link className={buttonClass("ghost")} href="/">
              Retour à l’accueil
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <LessonHeader step="Tranche verticale · 1 exercice" />
      <DemoExperience
        lesson={{
          versionId: lesson.versionId,
          title: lesson.titleFr,
          objective: lesson.objectiveFr,
          itemId: item.id,
          thaiRaw: item.thaiRaw,
          exercise: {
            id: exercise.id,
            prompt: exercise.promptFr,
            options: exercise.options,
            correctOptionId: exercise.correctOptionId,
            feedback: exercise.feedback,
          },
        }}
      />
    </main>
  );
}
