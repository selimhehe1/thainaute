import { UnpublishedContentScreen } from "../lib/unpublished-content-screen";

export default function ProgressRoute() {
  return (
    <UnpublishedContentScreen
      actionHref="/path"
      actionLabel="Voir le parcours technique"
      activeRoute="/progress"
      title="Aucun progrès linguistique à afficher."
    />
  );
}
