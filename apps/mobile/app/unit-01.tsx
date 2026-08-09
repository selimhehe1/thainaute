import { UnpublishedContentScreen } from "../lib/unpublished-content-screen";

export default function UnitRoute() {
  return (
    <UnpublishedContentScreen
      actionHref="/path"
      actionLabel="Retour au parcours technique"
      title="Cette unité n’est pas encore publiée."
    />
  );
}
