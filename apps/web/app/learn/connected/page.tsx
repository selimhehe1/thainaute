import Link from "next/link";

import { ConnectedExperience } from "./connected-experience";

export const metadata = { title: "Preview connectée" };

export default function ConnectedLessonPage() {
  return (
    <main className="lessonShell connectedLessonShell">
      <header className="lessonHeader">
        <Link className="brand" href="/" aria-label="Thaïnaute, accueil">
          <span aria-hidden="true" className="brandMark">
            ท
          </span>
          <span>Thaïnaute</span>
        </Link>
        <span className="lessonStep">Preview technique · compte requis</span>
      </header>
      <ConnectedExperience />
    </main>
  );
}
