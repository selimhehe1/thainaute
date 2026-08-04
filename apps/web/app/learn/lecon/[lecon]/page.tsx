import {
  compiledLessonIds,
  publicAudioSources,
  readCompiledLessonBundle,
} from "@thainaute/content";
import { notFound } from "next/navigation";

import { LessonHeader } from "@/components/layout/lesson-header";

import { ExpeditionExperience } from "../../demo/expedition-experience";
import styles from "../../demo/lesson.module.css";

/**
 * Une leçon réelle du curriculum, par identifiant.
 *
 * Les identifiants sont connus à la compilation : on les pré-rend tous
 * plutôt que d'ouvrir la route à n'importe quelle chaîne, et un
 * identifiant inconnu rend une 404 au lieu d'un écran vide.
 */
export function generateStaticParams(): { lecon: string }[] {
  return compiledLessonIds().map((lecon) => ({ lecon }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lecon: string }>;
}) {
  const { lecon } = await params;
  const bundle = readCompiledLessonBundle(lecon);
  return { title: bundle?.lesson.titleFr ?? "Leçon introuvable" };
}

export default async function LeconPage({
  params,
}: {
  params: Promise<{ lecon: string }>;
}) {
  const { lecon } = await params;
  const bundle = readCompiledLessonBundle(lecon);
  if (bundle === null) notFound();

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
