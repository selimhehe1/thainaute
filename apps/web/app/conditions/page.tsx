import Link from "next/link";

import { ARenseigner, LegalPage } from "@/components/layout/legal-page";

export const metadata = {
  title: "Conditions d’utilisation",
  robots: { index: false, follow: false },
};

export default function ConditionsPage() {
  return (
    <LegalPage
      eyebrow="Conditions"
      lede="Ce que Thaïnaute vous propose, ce qu’il ne promet pas, et ce que vous acceptez en l’utilisant."
      title="Conditions d’utilisation"
      updatedAt="2026-08-13"
    >
      <h2 id="service">Le service</h2>
      <p>
        Thaïnaute est un service d’apprentissage du thaï conçu pour des
        francophones. Il fonctionne sans compte : la création d’un compte sert
        uniquement à retrouver votre progression sur plusieurs appareils.
      </p>

      <h2 id="etat">État de développement</h2>
      <p>
        Le service est en construction. À ce jour, une première unité de cours
        est publiée et la suite du parcours reste interne. La revue par un
        locuteur natif thaï n’a eu lieu sur aucune leçon : chaque leçon publiée
        l’indique. Les contenus qui ne sont pas des cours, comme la boucle de
        démonstration des mécaniques d’exercice, restent explicitement marqués
        comme techniques et non publiables. Le service peut évoluer, être
        interrompu ou modifié sans préavis pendant cette phase.
      </p>

      <h2 id="usage">Usage attendu</h2>
      <ul>
        <li>
          un usage personnel d’apprentissage, sans revente ni redistribution du
          contenu ;
        </li>
        <li>
          aucune tentative de contourner les limites techniques, notamment
          celles qui protègent les données des autres personnes ;
        </li>
        <li>
          des signalements de contenu sincères, sans texte injurieux ni donnée
          personnelle d’un tiers.
        </li>
      </ul>

      <h2 id="compte">Votre compte</h2>
      <p>
        L’identification se fait par un code envoyé à votre adresse
        électronique. Vous êtes responsable de l’accès à cette boîte. Vous
        pouvez exporter vos données ou supprimer votre compte à tout moment
        depuis l’écran Compte.
      </p>

      <h2 id="gratuite">Gratuité et Premium</h2>
      <p>
        Le parcours fondamental est gratuit et le restera. Aucun paiement n’est
        possible aujourd’hui : la facturation est désactivée et aucune
        fonctionnalité n’est réservée.
      </p>
      <p>
        <ARenseigner>
          prix, durée d’essai, pays de vente et traitement fiscal, avant toute
          ouverture des paiements
        </ARenseigner>
      </p>

      <h2 id="responsabilite">Limites de responsabilité</h2>
      <p>
        Thaïnaute est un outil d’apprentissage, pas une autorité linguistique.
        Les contenus sont produits avec l’aide de modèles d’intelligence
        artificielle, vérifiés contre des sources identifiées, mais cette chaîne
        ne remplace pas la relecture d’un locuteur natif, qui reste à venir. Les
        erreurs peuvent être signalées depuis le lecteur de leçon.
      </p>

      <h2 id="donnees">Données personnelles</h2>
      <p>
        Le traitement de vos données est décrit dans la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>

      <h2 id="droit">Droit applicable</h2>
      <p>
        <ARenseigner>
          droit applicable et juridiction compétente, cohérents avec le pays
          d’établissement de l’éditeur
        </ARenseigner>
      </p>
    </LegalPage>
  );
}
