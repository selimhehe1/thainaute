import { readFixtureBundle } from "@thainaute/content";
import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { buttonClass } from "@/components/ui/button";

import { TodayExperience } from "./today-experience";
import styles from "./today.module.css";

export const metadata = { title: "Aujourd’hui" };

export default function TodayPage() {
  const { lesson } = readFixtureBundle();
  const exercise = lesson.exercises[0];

  return (
    <main className={styles.shell}>
      <SiteHeader navLabel="Navigation de la session">
        <Link href="/path">Parcours</Link>
        <Link className={buttonClass("ghost")} href="/account">
          Compte
        </Link>
      </SiteHeader>
      {exercise === undefined ? (
        <section className={styles.panel} aria-labelledby="today-empty-title">
          <p className={styles.eyebrow}>Aujourd’hui</p>
          <h1 id="today-empty-title">La session est indisponible.</h1>
          <p className={styles.lede}>
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
