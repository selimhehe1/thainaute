import { readFiveMechanicsFixtureBundle } from "@thainaute/content";
import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { buttonClass } from "@/components/ui/button";
import panel from "@/components/ui/panel.module.css";

import { PathExperience } from "./path-experience";
import styles from "./path.module.css";

export const metadata = {
  title: "Parcours technique",
  robots: { index: false, follow: false },
};

export default function PathPage() {
  const { lesson } = readFiveMechanicsFixtureBundle();
  const exercise = lesson.exercises[0];

  return (
    <main className={panel.shell}>
      <SiteHeader navLabel="Navigation du parcours">
        <Link className={styles.optional} href="/account">
          Compte
        </Link>
        <Link className={buttonClass("ghost")} href="/today">
          Aujourd’hui
        </Link>
      </SiteHeader>

      {exercise === undefined ? (
        <section className={panel.panel} aria-labelledby="path-empty-title">
          <p className={panel.eyebrow}>Parcours technique</p>
          <h1 id="path-empty-title">Aucune unité technique disponible.</h1>
          <p className={panel.lede}>
            La fixture doit rester valide avant d’être affichée. Aucun contenu
            de remplacement n’est inventé.
          </p>
        </section>
      ) : (
        <PathExperience
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
