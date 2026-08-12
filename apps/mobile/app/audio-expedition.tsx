import { UnpublishedContentScreen } from "../lib/unpublished-content-screen";

export default function AudioExpeditionRoute() {
  return (
    <UnpublishedContentScreen
      actionHref="/lesson"
      actionLabel="Ouvrir la démonstration technique"
      title="Cette expédition n’est pas distribuée."
    />
  );
}
