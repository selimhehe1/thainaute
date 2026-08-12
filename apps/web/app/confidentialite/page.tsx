import Link from "next/link";

import { ARenseigner, LegalPage } from "@/components/layout/legal-page";

export const metadata = {
  title: "Confidentialité",
  robots: { index: false, follow: false },
};

/**
 * Écrite d'après ce que le produit fait RÉELLEMENT, et vérifiable dans le
 * dépôt : consentement analytics local, voix jamais envoyée, export et
 * suppression implémentés. Un modèle générique décrirait des traitements qui
 * n'existent pas, ce qui est aussi faux que d'en cacher un.
 */
export default function ConfidentialitePage() {
  return (
    <LegalPage
      eyebrow="Confidentialité"
      lede="Ce que Thaïnaute enregistre, où, pendant combien de temps, et comment tout reprendre ou tout effacer."
      title="Politique de confidentialité"
      updatedAt="2026-08-13"
    >
      <h2 id="principe">Le principe</h2>
      <p>
        Thaïnaute fonctionne sans compte. Tant que vous n’en créez pas, votre
        progression reste dans votre navigateur et ne part nulle part.
      </p>

      <h2 id="responsable">Responsable du traitement</h2>
      <p>
        <ARenseigner>
          identité et coordonnées du responsable de traitement, identiques à
          celles des mentions légales
        </ARenseigner>
      </p>

      <h2 id="donnees">Ce qui est enregistré, et où</h2>
      <h3>Dans votre navigateur, toujours</h3>
      <ul>
        <li>
          vos réponses aux exercices, la maîtrise estimée et les prochaines
          révisions ;
        </li>
        <li>
          vos préférences d’onboarding, comme le rythme que vous vous fixez ;
        </li>
        <li>votre choix concernant la mesure d’audience.</li>
      </ul>
      <p>
        Ces données restent locales. Effacer les données du site dans votre
        navigateur les supprime définitivement.
      </p>

      <h3>Sur nos serveurs, uniquement si vous créez un compte</h3>
      <ul>
        <li>votre adresse électronique, qui sert à vous identifier ;</li>
        <li>
          vos tentatives d’exercice et votre progression, pour les retrouver sur
          un autre appareil ;
        </li>
        <li>
          les appareils que vous enregistrez, limités à vingt par compte ;
        </li>
        <li>vos signalements de contenu, lorsque vous en envoyez un.</li>
      </ul>

      <h3>Votre voix</h3>
      <p>
        L’enregistrement de prononciation reste sur votre appareil. Il n’est
        jamais envoyé à un serveur, n’entraîne aucun modèle, et disparaît
        lorsque vous le supprimez ou changez de compte.
      </p>

      <h2 id="mesure">Mesure d’audience</h2>
      <p>
        Aucune mesure n’est active tant que vous ne l’acceptez pas
        explicitement, depuis le{" "}
        <Link href="/privacy">centre de confidentialité</Link>. Le refus est
        l’état par défaut, et rien n’est envoyé rétroactivement si vous acceptez
        plus tard.
      </p>
      <p>
        Aucun événement de mesure ne contient d’audio, de transcription,
        d’adresse électronique, de jeton ni de texte libre.
      </p>

      <h2 id="droits">Vos droits</h2>
      <p>
        Vous pouvez exporter l’intégralité de vos données depuis l’écran Compte,
        dans un format lisible et portable. Vous pouvez également supprimer
        votre compte : la suppression efface vos données, y compris vos
        enregistrements vocaux et vos signalements.
      </p>
      <p>
        Pour toute question relative à vos données :{" "}
        <ARenseigner>adresse électronique de contact</ARenseigner>
      </p>

      <h2 id="conservation">Durées de conservation</h2>
      <p>
        <ARenseigner>
          durées exactes de conservation des tentatives, des reçus de
          suppression et des registres d’idempotence, et politique concernant
          les personnes mineures. Ces deux décisions restent ouvertes et doivent
          être arrêtées avant l’ouverture des comptes.
        </ARenseigner>
      </p>

      <h2 id="sous-traitants">Sous-traitants</h2>
      <ul>
        <li>Vercel, pour l’hébergement du site ;</li>
        <li>
          Supabase, pour la base de données et l’authentification, lorsque les
          comptes sont ouverts ;
        </li>
        <li>
          OpenAI, uniquement pour produire les voix de synthèse du cours, hors
          de toute donnée personnelle.
        </li>
      </ul>
    </LegalPage>
  );
}
