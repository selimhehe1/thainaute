import { readFixtureBundle } from "@thainaute/content";
import Link from "next/link";

import { PathExperience } from "./path-experience";

export const metadata = {
  title: "Parcours technique",
  robots: { index: false, follow: false },
};

export default function PathPage() {
  const { lesson } = readFixtureBundle();
  const exercise = lesson.exercises[0];

  return (
    <main className="lessonShell pathShell">
      <header className="lessonHeader">
        <Link className="brand" href="/" aria-label="Thaïnaute, accueil">
          <span aria-hidden="true" className="brandMark">
            ท
          </span>
          <span>Thaïnaute</span>
        </Link>
        <nav className="pathHeaderNav" aria-label="Navigation du parcours">
          <Link className="pathHeaderOptional" href="/account">
            Compte
          </Link>
          <Link className="button buttonSmall buttonGhost" href="/today">
            Aujourd’hui
          </Link>
        </nav>
      </header>

      {exercise === undefined ? (
        <section
          className="pathPanel pathNotice"
          aria-labelledby="path-empty-title"
        >
          <p className="eyebrow">Parcours technique</p>
          <h1 id="path-empty-title">Aucune unité technique disponible.</h1>
          <p className="pathLede">
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
