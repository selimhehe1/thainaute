import { readFiveMechanicsFixtureBundle } from "@thainaute/content";
import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { buttonClass } from "@/components/ui/button";
import panel from "@/components/ui/panel.module.css";

import { ParcoursReel, unitesDuParcours } from "./parcours-reel";
import { PathExperience } from "./path-experience";
import styles from "./path.module.css";

export const metadata = {
  title: "Parcours",
  robots: { index: false, follow: false },
};

/**
 * Le parcours réel, suivi de la boucle technique.
 *
 * Cette page annonçait « Le premier parcours linguistique reste en
 * relecture » et ne servait que la fixture, ce qui est devenu faux le jour
 * où l'unité 1 a été signée. Elle montre désormais l'itinéraire par unités.
 *
 * Ce qu'elle ne fait toujours pas, et ne doit pas faire : révéler un
 * brouillon. Une leçon non signée n'expose ni titre ni objectif, seulement
 * son existence comme nombre.
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

      <ParcoursReel unites={unitesDuParcours()} />

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
