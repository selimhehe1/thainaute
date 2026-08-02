"use client";

import { useWebAnalyticsConsent } from "@/lib/client/analytics-consent";
import { ToneCurve } from "@/components/brand/tone-curve";
import { buttonClass } from "@/components/ui/button";
import panel from "@/components/ui/panel.module.css";

export function PrivacyExperience() {
  const { accept, refuse, retry, status, withdraw } = useWebAnalyticsConsent();

  return (
    <section className={panel.panel} aria-labelledby="privacy-title">
      <ToneCurve
        className={panel.panelCurve}
        tone="mid"
        width={120}
        height={64}
        strokeWidth={7}
      />
      <p className={panel.eyebrow}>Confidentialité</p>
      <h1 id="privacy-title">Vous décidez de la mesure d’audience.</h1>
      <p className={panel.lede}>
        Thaïnaute peut mesurer des étapes générales du parcours pour améliorer
        le produit. Ces mesures sont facultatives et restent désactivées tant
        que vous ne les avez pas acceptées.
      </p>
      <p className={panel.note}>
        Aucun email, texte libre, enregistrement, transcription ou token n’est
        joint aux événements. Aucun événement survenu avant votre accord n’est
        conservé pour être envoyé plus tard. Aucun SDK de mesure distant n’est
        actif dans cette version.
      </p>

      {status === "loading" && (
        <p className={panel.statusLine} aria-live="polite">
          Lecture de votre préférence…
        </p>
      )}

      {status === "error" && (
        <div role="alert">
          <p className={panel.inlineError}>
            Votre préférence ne peut pas être lue ou enregistrée. La mesure
            d’audience reste désactivée par sécurité.
          </p>
          <div className={panel.actions}>
            <button
              className={buttonClass("secondary")}
              onClick={retry}
              type="button"
            >
              Réessayer
            </button>
            <button
              className={buttonClass("ghost")}
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
          <p className={panel.statusLine} role="status">
            Aucune préférence n’est enregistrée sur ce navigateur.
          </p>
          <div
            className={panel.actions}
            aria-label="Choix de mesure d’audience"
          >
            <button
              className={buttonClass("secondary")}
              onClick={accept}
              type="button"
            >
              Accepter la mesure facultative
            </button>
            <button
              className={buttonClass("secondary")}
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
          <p className={panel.statusLine} role="status">
            La mesure facultative est autorisée sur ce navigateur.
          </p>
          <div className={panel.actions}>
            <button
              className={buttonClass("danger")}
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
          <p className={panel.statusLine} role="status">
            La mesure facultative est refusée sur ce navigateur.
          </p>
          <div className={panel.actions}>
            <button
              className={buttonClass("secondary")}
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
