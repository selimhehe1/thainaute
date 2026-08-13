import { readFiveMechanicsFixtureBundle } from "@thainaute/content";
import Link from "next/link";

import { PrimaryNavigation } from "@/components/layout/primary-navigation";
import { SiteHeader } from "@/components/layout/site-header";
import panel from "@/components/ui/panel.module.css";
import { paquetsPublies } from "@/lib/lecons-publiees";

import { ProgressExperience } from "./progress-experience";

export const metadata = {
  title: "Progrès",
  robots: { index: false, follow: false },
};

/**
 * La progression réelle de la personne, lue dans son navigateur.
 *
 * RUPTURE CORRIGÉE : cette page lisait `thainaute-demo-v1` et ne projetait
 * que la fixture technique, alors que les leçons réelles journalisent dans
 * `thainaute-learning-v1`. Terminer une vraie leçon de l'unité 1
 * n'apparaissait donc nulle part : la personne travaillait, voyait sa
 * réussite dans le lecteur, puis trouvait un écran de progrès vide.
 *
 * Le défaut avait survécu à sa moitié. Le correctif qui a redirigé la
 * DESTINATION des tentatives n'a pas redirigé leur LECTURE, et rien ne
 * reliait les deux : `lecon-reelle-magasin.test.ts` gelait la destination,
 * personne ne gelait la source.
 *
 * Les deux bases continuent d'exister, et c'est voulu : la démonstration
 * technique reste en quarantaine au moment de la fusion du profil anonyme.
 * Seule cette page se trompait de côté. La boucle technique garde son propre
 * affichage de progression sur `/path`.
 */
export default function ProgressPage() {
  const publiees = paquetsPublies();
  const { lesson: fixture } = readFiveMechanicsFixtureBundle();

  // Sans aucun cours publié, la seule progression honnête reste celle de la
  // boucle technique, que `ProgressExperience` annonce comme fictive.
  return (
    <main className={panel.shell}>
      <SiteHeader navLabel="Navigation des progrès">
        <PrimaryNavigation active="/progress" />
        <Link href="/account">Compte</Link>
      </SiteHeader>
      {publiees.length === 0 ? (
        <ProgressExperience
          lessons={[fixture]}
          storageKey="thainaute-demo-v1"
        />
      ) : (
        <ProgressExperience
          lessons={[...publiees]}
          storageKey="thainaute-learning-v1"
        />
      )}
    </main>
  );
}
