import {
  publicAudioSources,
  readFiveMechanicsFixtureBundle,
} from "@thainaute/content";

import { LessonHeader } from "@/components/layout/lesson-header";

import { ExpeditionExperience } from "../demo/expedition-experience";
import styles from "../demo/lesson.module.css";

/**
 * Page technique de vérification des cinq mécaniques d'exercice.
 *
 * Elle sert la fixture, et le dit. Elle existe parce que la leçon réelle
 * de l'unité 1 n'emploie que deux mécaniques : sans cette page, la
 * couverture de bout en bout des trois autres disparaîtrait le jour où le
 * lecteur a cessé d'afficher une fixture.
 *
 * Ce n'est pas un écran de produit : elle n'est pas indexée et n'est
 * atteignable par aucune navigation.
 */
export const metadata = {
  title: "Vérification des cinq mécaniques",
  robots: { index: false, follow: false },
};

export default function MecaniquesFixturePage() {
  const bundle = readFiveMechanicsFixtureBundle();

  return (
    <main className={styles.shell}>
      <LessonHeader
        step={`Vérification · ${bundle.lesson.exercises.length} mécaniques`}
      />
      <ExpeditionExperience
        lesson={bundle.lesson}
        audioSources={publicAudioSources(bundle)}
      />
    </main>
  );
}
