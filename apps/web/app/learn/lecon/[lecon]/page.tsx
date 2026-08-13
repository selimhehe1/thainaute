import { readAuthoringDraft, publicAudioSources } from "@thainaute/content";
import { notFound } from "next/navigation";

import { lireCours, lireCoursPublie } from "@/lib/lecons-publiees";
import { readContentStudioConfiguration } from "@/lib/server/content-studio/runtime";

import { LessonHeader } from "@/components/layout/lesson-header";

import { ExpeditionExperience } from "../../demo/expedition-experience";
import styles from "../../demo/lesson.module.css";

import { EditorLessonPreview } from "./editor-lesson-preview";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

// La lecture des paquets vit dans `@/lib/lecons-publiees`, pour que cette
// route et la liste des leçons publiées voient exactement la même chose.
// Elles interrogeaient auparavant deux registres différents, si bien qu'une
// leçon signée absente du registre écrit à la main aurait été ouvrable par
// son adresse et invisible partout ailleurs.
const readCourseBundle = lireCours;
const readPublishedCourseBundle = lireCoursPublie;

/**
 * La leçon fait-elle entendre une voix entièrement synthétique ?
 *
 * Un manifeste vide ne fait entendre aucune voix : dire « voix synthétique »
 * dans ce cas serait un avertissement inventé. La réponse se lit dans le
 * manifeste, seule source qui porte `voiceKind`.
 */
function voixEntierementSynthetique(bundle: {
  audioManifest: { entries: ReadonlyArray<{ voiceKind: string }> };
}): boolean {
  const { entries } = bundle.audioManifest;
  return (
    entries.length > 0 &&
    entries.every(({ voiceKind }) => voiceKind === "synthetic_tts")
  );
}

/**
 * Les brouillons ne sont jamais pré-rendus ni placés dans les métadonnées.
 * Une future version réellement publiée pourra conserver son titre public.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lecon: string }>;
}) {
  const { lecon } = await params;
  const bundle = readPublishedCourseBundle(lecon);
  return {
    title: bundle?.lesson.titleFr ?? "Leçon introuvable",
    robots: { index: false, follow: false },
  };
}

export default async function LeconPage({
  params,
}: {
  params: Promise<{ lecon: string }>;
}) {
  const { lecon } = await params;
  const published = readPublishedCourseBundle(lecon);
  if (published !== null) {
    return (
      <main className={styles.shell}>
        <LessonHeader
          step={`Expédition · ${published.lesson.exercises.length} exercices`}
        />
        <ExpeditionExperience
          lesson={published.lesson}
          audioSources={publicAudioSources(published)}
          voixSynthetique={voixEntierementSynthetique(published)}
          attemptStorage="learning"
        />
      </main>
    );
  }

  // Le mode Studio est un interrupteur serveur explicite. En son absence,
  // un brouillon est strictement indistinguable d'une route inconnue.
  if (readContentStudioConfiguration() === null) notFound();

  const internalBundle = readCourseBundle(lecon);
  const internalDraft =
    internalBundle === null ? readAuthoringDraft(lecon) : null;
  if (internalBundle === null && internalDraft === null) notFound();

  // Aucun contenu interne n'est sérialisé ici. Le client ne reçoit que
  // l'identifiant puis passe la porte content_editor du endpoint preview.
  return <EditorLessonPreview lessonId={lecon} />;
}
