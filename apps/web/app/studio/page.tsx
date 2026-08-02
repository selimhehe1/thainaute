import Link from "next/link";
import { notFound } from "next/navigation";

import { readContentStudioConfiguration } from "@/lib/server/content-studio/runtime";

import { SiteHeader } from "@/components/layout/site-header";
import { buttonClass } from "@/components/ui/button";

import { ContentReviewStudio } from "./content-review-studio";
import styles from "./studio.module.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Studio de prépublication",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  if (readContentStudioConfiguration() === null) notFound();

  return (
    <main className={styles.shell}>
      <SiteHeader navLabel="Navigation du studio">
        <Link className={buttonClass("ghost")} href="/account">
          Revenir au compte
        </Link>
      </SiteHeader>
      <ContentReviewStudio />
    </main>
  );
}
