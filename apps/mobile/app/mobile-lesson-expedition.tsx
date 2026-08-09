import { UnpublishedContentScreen } from "../lib/unpublished-content-screen";

export default function MobileLessonExpeditionRoute() {
  return (
    <UnpublishedContentScreen
      actionHref="/lesson"
      actionLabel="Ouvrir la démonstration technique"
      title="Cette leçon n’est pas distribuée."
    />
  );
}
