import {
  publicAudioSources,
  readFiveMechanicsFixtureBundle,
} from "@thainaute/content";

import { LessonHeader } from "@/components/layout/lesson-header";

import { ExpeditionExperience } from "./expedition-experience";
import styles from "./lesson.module.css";

export const metadata = {
  title: "Démonstration technique",
  robots: { index: false, follow: false },
};

export default function DemoLessonPage() {
  // Cette route publique ne charge aucun brouillon linguistique. La fixture
  // couvre les cinq mécaniques et reste explicitement non publiable.
  const bundle = readFiveMechanicsFixtureBundle();
  const { lesson } = bundle;

  return (
    <main className={styles.shell}>
      <LessonHeader
        step={`Expédition · ${lesson.exercises.length} exercices`}
      />
      <ExpeditionExperience
        lesson={lesson}
        audioSources={publicAudioSources(bundle)}
      />
    </main>
  );
}
