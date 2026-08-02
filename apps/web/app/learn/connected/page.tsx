import { LessonHeader } from "@/components/layout/lesson-header";

import { ConnectedExperience } from "./connected-experience";
import styles from "./connected.module.css";

export const metadata = { title: "Preview connectée" };

export default function ConnectedLessonPage() {
  return (
    <main className={styles.shell}>
      <LessonHeader step="Preview technique · compte requis" />
      <ConnectedExperience />
    </main>
  );
}
