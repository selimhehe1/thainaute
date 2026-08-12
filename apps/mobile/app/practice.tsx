import { UnpublishedContentScreen } from "../lib/unpublished-content-screen";

export default function PracticeRoute() {
  return (
    <UnpublishedContentScreen
      actionHref="/lesson"
      actionLabel="Ouvrir la démonstration technique"
      activeRoute="/practice"
      title="Aucun exercice linguistique n’est publié."
    />
  );
}
