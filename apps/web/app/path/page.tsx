import {
  compiledLessonIds,
  readCompiledLessonBundle,
  readUnite01Lecon1aBundle,
} from "@thainaute/content";
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
 * Les leçons réellement compilées, dans l'ordre du parcours. Une leçon
 * absente du registre n'apparaît pas : rien n'est annoncé qui n'existe.
 */
function leconsDuParcours() {
  return compiledLessonIds().flatMap((identifiant) => {
    const bundle = readCompiledLessonBundle(identifiant);
    if (bundle === null) return [];
    return [
      {
        identifiant,
        titre: bundle.lesson.titleFr,
        exercices: bundle.lesson.exercises.length,
        avecSon: bundle.audioManifest.entries.length > 0,
      },
    ];
  });
}

export default function PathPage() {
  const { lesson } = readUnite01Lecon1aBundle();
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

      <section className={panel.panel} aria-labelledby="unite-1-titre">
        <p className={panel.eyebrow}>Unité 1</p>
        <h2 id="unite-1-titre">Écouter le thaï pour la première fois</h2>
        <p className={panel.lede}>
          Cinq leçons, des tons aux premières salutations. Chacune se joue
          seule, dans l’ordre que vous voulez.
        </p>
        <ol className={styles.itinerary}>
          {leconsDuParcours().map((lecon) => (
            <li key={lecon.identifiant} className={styles.stop}>
              <Link
                className={styles.leconLien}
                href={`/learn/lecon/${lecon.identifiant}`}
              >
                {lecon.titre}
              </Link>
              <p className={styles.leconDetail}>
                {lecon.exercices} exercice{lecon.exercices > 1 ? "s" : ""}
                {lecon.avecSon ? " · avec audio" : ""}
              </p>
            </li>
          ))}
        </ol>
      </section>

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
