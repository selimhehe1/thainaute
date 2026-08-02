import Link from "next/link";
import { notFound } from "next/navigation";

import { readContentStudioConfiguration } from "@/lib/server/content-studio/runtime";

import { ContentReviewStudio } from "./content-review-studio";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Studio de prépublication",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  if (readContentStudioConfiguration() === null) notFound();

  return (
    <main className="lessonShell studioShell">
      <header className="lessonHeader">
        <Link className="brand" href="/" aria-label="Thaïnaute, accueil">
          <span aria-hidden="true" className="brandMark">
            ท
          </span>
          <span>Thaïnaute</span>
        </Link>
        <Link className="button buttonSmall buttonGhost" href="/account">
          Revenir au compte
        </Link>
      </header>
      <ContentReviewStudio />
    </main>
  );
}
