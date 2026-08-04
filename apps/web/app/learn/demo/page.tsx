import {
  publicAudioSources,
  readUnite01Lecon1aBundle,
} from "@thainaute/content";

import { LessonHeader } from "@/components/layout/lesson-header";

import { ExpeditionExperience } from "./expedition-experience";
import styles from "./lesson.module.css";

export const metadata = { title: "Écouter le thaï pour la première fois" };

export default function DemoLessonPage() {
  // Premiere lecon reelle du curriculum. La lecture reste cote serveur :
  // `repository.ts` ouvre des fichiers, il n'est pas embarquable au client.
  const bundle = readUnite01Lecon1aBundle();
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
