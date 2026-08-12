// Aperçu éditorial conservé hors du graphe Expo public.
import { useMobileAnalytics } from "../lib/analytics-provider";
import { mobileUnit01Lesson1aConfig } from "../lib/embedded-lesson-config";

import { LessonExperience } from "../app/lesson";

/** Extrait interne de la première vraie leçon, en attendant la release native. */
export default function PilotLessonRoute() {
  const { analytics } = useMobileAnalytics();
  return (
    <LessonExperience
      analytics={analytics}
      config={mobileUnit01Lesson1aConfig}
    />
  );
}
