"use client";

import { useWebAnalyticsConsent } from "@/lib/client/analytics-consent";

export function PrivacyExperience() {
  const { accept, refuse, retry, status, withdraw } = useWebAnalyticsConsent();

  return (
    <section className="accountPanel" aria-labelledby="privacy-title">
      <p className="eyebrow">Confidentialité</p>
      <h1 id="privacy-title">Vous décidez de la mesure d’audience.</h1>
      <p className="lede accountLede">
        Thaïnaute peut mesurer des étapes générales du parcours pour améliorer
        le produit. Ces mesures sont facultatives et restent désactivées tant
        que vous ne les avez pas acceptées.
      </p>
      <p className="privacyNote">
        Aucun email, texte libre, enregistrement, transcription ou token n’est
        joint aux événements. Aucun événement survenu avant votre accord n’est
        conservé pour être envoyé plus tard. Aucun SDK de mesure distant n’est
        actif dans cette version.
      </p>

      {status === "loading" && (
        <p aria-live="polite">Lecture de votre préférence…</p>
      )}

      {status === "error" && (
        <div role="alert">
          <p className="inlineError">
            Votre préférence ne peut pas être lue ou enregistrée. La mesure
            d’audience reste désactivée par sécurité.
          </p>
          <div className="lessonActions accountActions">
            <button
              className="button buttonGhost"
              onClick={retry}
              type="button"
            >
              Réessayer
            </button>
            <button
              className="button buttonGhost"
              onClick={refuse}
              type="button"
            >
              Réinitialiser en refusant
            </button>
          </div>
        </div>
      )}

      {status === "unknown" && (
        <div>
          <p role="status">
            Aucune préférence n’est enregistrée sur ce navigateur.
          </p>
          <div
            className="lessonActions accountActions"
            aria-label="Choix de mesure d’audience"
          >
            <button
              className="button buttonGhost"
              onClick={accept}
              type="button"
            >
              Accepter la mesure facultative
            </button>
            <button
              className="button buttonGhost"
              onClick={refuse}
              type="button"
            >
              Refuser la mesure facultative
            </button>
          </div>
        </div>
      )}

      {status === "granted" && (
        <div>
          <p role="status">
            La mesure facultative est autorisée sur ce navigateur.
          </p>
          <div className="lessonActions accountActions">
            <button
              className="button accountDanger"
              onClick={withdraw}
              type="button"
            >
              Retirer mon consentement
            </button>
          </div>
        </div>
      )}

      {status === "denied" && (
        <div>
          <p role="status">
            La mesure facultative est refusée sur ce navigateur.
          </p>
          <div className="lessonActions accountActions">
            <button
              className="button buttonGhost"
              onClick={accept}
              type="button"
            >
              Autoriser la mesure facultative
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
