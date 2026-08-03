import { readFiveMechanicsFixtureBundle } from "@thainaute/content";

import { LessonHeader } from "@/components/layout/lesson-header";

import { ExpeditionExperience } from "./expedition-experience";
import styles from "./lesson.module.css";

export const metadata = { title: "Leçon fictive" };

export default function DemoLessonPage() {
  const { lesson } = readFiveMechanicsFixtureBundle();

  return (
    <main className={styles.shell}>
      <LessonHeader
        step={`Expédition · ${lesson.exercises.length} exercices`}
      />
      <ExpeditionExperience lesson={lesson} />
    </main>
  );
}
