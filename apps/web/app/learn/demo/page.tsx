import { readFixtureBundle } from "@thainaute/content";
import Link from "next/link";

import { DemoExperience } from "./demo-experience";

export const metadata = { title: "Leçon fictive" };

export default function DemoLessonPage() {
  const { lesson } = readFixtureBundle();
  const exercise = lesson.exercises[0];
  const item = lesson.items[0];

  if (exercise === undefined || item === undefined) {
    return (
      <main className="lessonShell lessonEmpty">
        <h1>La fixture est indisponible.</h1>
        <p>
          La validation de contenu doit être relancée avant cette démonstration.
        </p>
        <Link className="button buttonGhost" href="/">
          Retour à l’accueil
        </Link>
      </main>
    );
  }

  return (
    <main className="lessonShell">
      <header className="lessonHeader">
        <Link className="brand" href="/" aria-label="Thaïnaute, accueil">
          <span aria-hidden="true" className="brandMark">
            ท
          </span>
          <span>Thaïnaute</span>
        </Link>
        <span className="lessonStep">Tranche verticale · 1 exercice</span>
      </header>
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
