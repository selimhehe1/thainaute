import Link from "next/link";

import { Logotype } from "@/components/brand/logotype";

import styles from "./lesson-header.module.css";

interface LessonHeaderProps {
  readonly step: string;
}

/** Header minimal des pages de leçon : marque à gauche, étiquette d'étape
 * à droite, sans landmark de navigation. */
export function LessonHeader({ step }: LessonHeaderProps) {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Thaïnaute, accueil">
        <Logotype />
      </Link>
      <span className={styles.step}>{step}</span>
    </header>
  );
}
