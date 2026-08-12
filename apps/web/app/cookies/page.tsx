import Link from "next/link";

import { LegalPage } from "@/components/layout/legal-page";

export const metadata = {
  title: "Cookies et traceurs",
  robots: { index: false, follow: false },
};

/**
 * Cette page est courte parce que le produit l'est : il ne pose aucun cookie
 * de mesure ni de publicité. Gonfler un document pour faire sérieux serait
 * décrire des traitements qui n'existent pas.
 */
export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Cookies"
      lede="Thaïnaute ne dépose aucun cookie de mesure ni de publicité."
      title="Cookies et traceurs"
      updatedAt="2026-08-13"
    >
      <h2 id="mesure">Aucune mesure sans votre accord</h2>
      <p>
        Aucun outil de mesure d’audience n’est actif tant que vous ne l’acceptez
        pas depuis le <Link href="/privacy">centre de confidentialité</Link>. Le
        refus est l’état par défaut, et votre choix est conservé localement,
        dans votre navigateur, pas dans un cookie envoyé à un tiers.
      </p>

      <h2 id="necessaire">Ce qui est stocké malgré tout</h2>
      <p>
        Le produit conserve dans votre navigateur ce qui est nécessaire à son
        fonctionnement : votre progression, vos réponses en cours, vos
        préférences d’apprentissage et, si vous vous connectez, votre session.
        Ces informations ne servent à aucun suivi publicitaire et ne sont
        partagées avec personne.
      </p>
      <p>
        Elles utilisent le stockage local et une base de données du navigateur,
        pas des cookies de suivi. Effacer les données du site les supprime.
      </p>

      <h2 id="tiers">Services tiers</h2>
      <p>
        Aucun traceur tiers n’est chargé sur les pages. Les polices de
        caractères sont servies depuis le site lui-même, sans requête vers un
        service externe.
      </p>
    </LegalPage>
  );
}
