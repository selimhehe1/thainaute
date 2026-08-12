import { UnpublishedContentScreen } from "../lib/unpublished-content-screen";

export default function PilotLessonRoute() {
  return (
    <UnpublishedContentScreen
      actionHref="/lesson"
      actionLabel="Ouvrir la démonstration technique"
      title="Cet aperçu n’est pas distribué."
    />
  );
}
