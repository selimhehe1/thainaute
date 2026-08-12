import { ARenseigner, LegalPage } from "@/components/layout/legal-page";

export const metadata = {
  title: "Mentions légales",
  robots: { index: false, follow: false },
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      eyebrow="Mentions légales"
      lede="Qui édite Thaïnaute, qui l’héberge, et comment nous joindre."
      title="Mentions légales"
      updatedAt="2026-08-13"
    >
      <h2 id="editeur">Éditeur du site</h2>
      <p>
        <ARenseigner>
          nom ou raison sociale, forme juridique, capital le cas échéant,
          adresse du siège, numéro d’immatriculation et numéro de TVA
          intracommunautaire s’il existe
        </ARenseigner>
      </p>
      <p>
        Directeur de la publication :{" "}
        <ARenseigner>nom du directeur de la publication</ARenseigner>
      </p>
      <p>
        Contact : <ARenseigner>adresse électronique de contact</ARenseigner>
      </p>

      <h2 id="hebergeur">Hébergeur</h2>
      <p>
        Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA
        91789, États-Unis. Les pages sont servies depuis la région de Paris
        (cdg1).
      </p>
      <p>
        Les données de compte et de progression, lorsqu’elles existent, sont
        hébergées par Supabase dans l’Union européenne.{" "}
        <ARenseigner>
          confirmer la région exacte du projet de production avant ouverture des
          comptes
        </ARenseigner>
      </p>

      <h2 id="propriete">Propriété intellectuelle</h2>
      <p>
        Les textes pédagogiques, les explications et les exercices de Thaïnaute
        sont écrits pour ce produit. Ils s’appuient sur des sources identifiées,
        citées dans le registre de contenu, sans reproduire leurs formulations
        protégées.
      </p>
      <p>
        Les polices de caractères sont distribuées sous licences ouvertes,
        reproduites dans le dépôt du projet : Manrope et Noto Sans Thai sous SIL
        Open Font License 1.1.
      </p>

      <h2 id="etat">État du service</h2>
      <p>
        Thaïnaute est en cours de construction. Aucun cours de thaï n’est publié
        à ce jour, et la revue par un locuteur natif n’a pas encore eu lieu. Le
        produit l’indique à chaque endroit où cela compte, plutôt que de laisser
        croire à une validation qui n’existe pas.
      </p>
    </LegalPage>
  );
}
