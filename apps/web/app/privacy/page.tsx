import Link from "next/link";

import { PrivacyExperience } from "./privacy-experience";

export const metadata = { title: "Confidentialité et mesure d’audience" };

export default function PrivacyPage() {
  return (
    <main className="lessonShell">
      <header className="lessonHeader">
        <Link className="brand" href="/" aria-label="Thaïnaute, accueil">
          <span aria-hidden="true" className="brandMark">
            ท
          </span>
          <span>Thaïnaute</span>
        </Link>
        <Link className="button buttonSmall buttonGhost" href="/">
          Retour à l’accueil
        </Link>
      </header>
      <PrivacyExperience />
    </main>
  );
}
