import { readFiveMechanicsFixtureBundle } from "@thainaute/content";
import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import panel from "@/components/ui/panel.module.css";

import { ProgressExperience } from "./progress-experience";

export const metadata = {
  title: "Progrès",
  robots: { index: false, follow: false },
};

/**
 * La progression réelle de la personne, lue dans son navigateur.
 *
 * Les leçons projetées sont celles que la personne peut effectivement jouer.
 * Tant qu'aucune release n'est publiée, c'est la boucle technique : la page
 * ne prétend donc pas mesurer un apprentissage du thaï, et le dit.
 */
export default function ProgressPage() {
  const { lesson } = readFiveMechanicsFixtureBundle();

  return (
    <main className={panel.shell}>
      <SiteHeader navLabel="Navigation des progrès">
        <Link href="/today">Aujourd’hui</Link>
      </SiteHeader>
      <ProgressExperience lessons={[lesson]} storageKey="thainaute-demo-v1" />
    </main>
  );
}
