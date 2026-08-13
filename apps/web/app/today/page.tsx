import { readFiveMechanicsFixtureBundle } from "@thainaute/content";
import Link from "next/link";

import { PrimaryNavigation } from "@/components/layout/primary-navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { paquetsPublies } from "@/lib/lecons-publiees";
import type { SeanceProposable } from "@/lib/seance-du-jour";

import { TodayExperience } from "./today-experience";
import styles from "./today.module.css";

export const metadata = { title: "Aujourd’hui" };

/**
 * Les séances ouvrables, dans l'ordre du parcours.
 *
 * RUPTURE CORRIGÉE : cette page servait la fixture technique et envoyait
 * vers `/learn/demo`. Le chemin par défaut d'un nouvel arrivant, l'accueil
 * puis Aujourd'hui, ne rencontrait donc jamais un cours : les cinq leçons
 * publiées n'étaient atteignables que par Pratiquer.
 *
 * La boucle technique reste en dernier recours, pour que l'écran ait
 * toujours quelque chose d'honnête à proposer si rien n'est publié. C'est
 * le navigateur qui tranche entre les deux, parce que lui seul connaît la
 * progression locale.
 */
function seancesProposables(): readonly SeanceProposable[] {
  const reelles = paquetsPublies().flatMap(({ slug, lesson }) => {
    const exercice = lesson.exercises[0];
    if (exercice === undefined) return [];
    return [
      {
        versionId: lesson.versionId,
        exerciseId: exercice.id,
        title: lesson.titleFr,
        objective: lesson.objectiveFr,
        // Le slug d'autorat, pas `lesson.lessonId` qui est l'UUID canonique
        // et donnerait une route introuvable.
        href: `/learn/lecon/${slug}`,
        estFixture: false,
      },
    ];
  });

  const { lesson: fixture } = readFiveMechanicsFixtureBundle();
  const exerciceFixture = fixture.exercises[0];
  const technique =
    exerciceFixture === undefined
      ? []
      : [
          {
            versionId: fixture.versionId,
            exerciseId: exerciceFixture.id,
            title: fixture.titleFr,
            objective: fixture.objectiveFr,
            href: "/learn/demo",
            estFixture: true,
          },
        ];

  return [...reelles, ...technique];
}

export default function TodayPage() {
  return (
    <main className={styles.shell}>
      <SiteHeader navLabel="Navigation de la session">
        <PrimaryNavigation active="/today" />
        <Link href="/path">Parcours</Link>
        <Link href="/account">Compte</Link>
      </SiteHeader>
      <TodayExperience proposables={seancesProposables()} />
    </main>
  );
}
