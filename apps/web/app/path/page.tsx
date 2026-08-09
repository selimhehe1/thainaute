import { readFiveMechanicsFixtureBundle } from "@thainaute/content";
import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { buttonClass } from "@/components/ui/button";
import panel from "@/components/ui/panel.module.css";

import { PathExperience } from "./path-experience";
import styles from "./path.module.css";

export const metadata = {
  title: "Parcours",
  robots: { index: false, follow: false },
};

/**
 * Le parcours public n'énumère aucun brouillon d'autorat. Tant que la
 * première release n'existe pas, il affiche uniquement la boucle technique
 * explicitement marquée comme fictive et non publiable.
 */
export default function PathPage() {
  const { lesson } = readFiveMechanicsFixtureBundle();
  const exercise = lesson.exercises[0];

  return (
    <main className={`${panel.shell} ${styles.page}`}>
      <SiteHeader navLabel="Navigation du parcours">
        <Link className={styles.optional} href="/account">
          Compte
        </Link>
        <Link className={buttonClass("ghost")} href="/today">
          Aujourd’hui
        </Link>
      </SiteHeader>

      <section
        className={`${panel.panel} ${styles.introPanel}`}
        aria-labelledby="path-status-title"
      >
        <span className={styles.introIndex} aria-hidden="true">
          01
        </span>
        <p className={panel.eyebrow}>Tranche de validation</p>
        <h1 className={styles.introTitle} id="path-status-title">
          Le premier parcours linguistique reste en relecture.
        </h1>
        <p className={panel.lede}>
          Les cours internes, leurs notes et leurs exercices ne sont pas
          accessibles avant le passage de toutes les portes éditoriales.
        </p>
      </section>

      {exercise === undefined ? (
        <section className={panel.panel} aria-labelledby="path-empty-title">
          <p className={panel.eyebrow}>Parcours technique</p>
          <h2 id="path-empty-title">Aucune unité technique disponible.</h2>
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
