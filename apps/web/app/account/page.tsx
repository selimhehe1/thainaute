import Link from "next/link";

import { AccountExperience } from "./account-experience";

export const metadata = { title: "Compte" };

export default function AccountPage() {
  return (
    <main className="lessonShell">
      <header className="lessonHeader">
        <Link className="brand" href="/" aria-label="Thaïnaute, accueil">
          <span aria-hidden="true" className="brandMark">
            ท
          </span>
          <span>Thaïnaute</span>
        </Link>
        <Link className="button buttonSmall buttonGhost" href="/learn/demo">
          Revenir à la leçon
        </Link>
      </header>
      <AccountExperience />
    </main>
  );
}
