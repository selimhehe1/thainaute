import { readFixtureBundle } from "@thainaute/content";
import Link from "next/link";

import { TodayExperience } from "./today-experience";

export const metadata = { title: "Aujourd’hui" };

export default function TodayPage() {
  const { lesson } = readFixtureBundle();
  const exercise = lesson.exercises[0];

  return (
    <main className="lessonShell">
      <header className="lessonHeader">
        <Link className="brand" href="/" aria-label="Thaïnaute, accueil">
          <span aria-hidden="true" className="brandMark">
            ท
          </span>
          <span>Thaïnaute</span>
        </Link>
        <Link className="button buttonSmall buttonGhost" href="/account">
          Compte
        </Link>
      </header>
      {exercise === undefined ? (
        <section className="todayPanel" aria-labelledby="today-empty-title">
          <p className="eyebrow">Aujourd’hui</p>
          <h1 id="today-empty-title">La session est indisponible.</h1>
          <p className="todayLede">
            La fixture doit être validée avant de pouvoir préparer cette
            démonstration locale.
          </p>
        </section>
      ) : (
        <TodayExperience
          lesson={{
            versionId: lesson.versionId,
            exerciseId: exercise.id,
            title: lesson.titleFr,
            objective: lesson.objectiveFr,
          }}
        />
      )}
    </main>
  );
}
