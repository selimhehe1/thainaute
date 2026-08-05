"use client";

import {
  SyncHttpApiError,
  SyncHttpAuthenticationError,
  SyncHttpConfigurationError,
  SyncHttpProtocolError,
  SyncHttpRequestValidationError,
} from "@thainaute/sync";
import { useEffect } from "react";

import { WEB_ACCOUNT_DELETION_STORAGE_KEY } from "./account-deletion";
import { readPendingWebAccountDeletion } from "./account-deletion";
import {
  readWebAccountLocalState,
  synchronizeWebAccount,
} from "./account-sync";
import { useWebAuthSession } from "./auth-session";

const RETRY_DELAY_MS = 30_000;

/**
 * Mutex de processus : une seule passe de synchronisation à la fois, quel que
 * soit le nombre de déclencheurs qui se réveillent ensemble.
 *
 * Le coordinateur est déjà idempotent (un lot en vol est conservé et rejoué
 * à l'identique), donc ce mutex ne protège pas la correction : il évite
 * seulement de partir trois fois en réseau pour rien quand l'onglet
 * redevient visible pendant un retour en ligne.
 */
let passeEnCours: Promise<unknown> | null = null;

function synchroniserUneSeuleFois(userId: string): Promise<unknown> {
  if (passeEnCours !== null) return passeEnCours;
  passeEnCours = synchronizeWebAccount({
    userId,
    // Jamais de fusion automatique : verser une progression anonyme dans un
    // compte est un acte que l'apprenant doit décider lui-même, depuis
    // l'écran Compte. Ici on ne remonte que ce qui appartient déjà au compte.
    startAnonymousFusion: false,
  }).finally(() => {
    passeEnCours = null;
  });
  return passeEnCours;
}

/**
 * Une erreur mérite-t-elle une nouvelle tentative sans changement de session ?
 *
 * Même classement que la reprise de suppression : ce qui relève de la
 * configuration, de l'authentification ou d'une requête invalide ne
 * s'améliorera pas en réessayant.
 */
function meriteUneNouvelleTentative(erreur: unknown): boolean {
  if (erreur instanceof SyncHttpApiError) return erreur.retryable;
  if (erreur instanceof SyncHttpProtocolError) return erreur.retryable;
  if (
    erreur instanceof SyncHttpAuthenticationError ||
    erreur instanceof SyncHttpConfigurationError ||
    erreur instanceof SyncHttpRequestValidationError
  ) {
    return false;
  }
  return true;
}

/**
 * Remonte la progression dès que c'est possible, sans que l'apprenant ait à
 * cliquer.
 *
 * POURQUOI CE COMPOSANT EXISTE : la synchronisation de la progression n'avait
 * AUCUN déclenchement automatique. Elle ne partait que par deux boutons de
 * l'écran Compte. Un apprenant pouvait donc finir plusieurs leçons, fermer
 * l'onglet, et n'avoir jamais rien envoyé, sans le moindre signal.
 *
 * Le patron est repris de `WebAccountDeletionBootstrap`, qui résolvait déjà
 * exactement ce problème pour la suppression de compte : montage, retour en
 * ligne, onglet redevenu visible, et changement venu d'un autre onglet.
 */
export function WebAttemptSyncBootstrap() {
  const auth = useWebAuthSession();
  const userId =
    auth.status === "signed_in" ? (auth.session?.user.id ?? null) : null;

  useEffect(() => {
    if (userId === null) return;

    let actif = true;
    let minuterie: ReturnType<typeof setTimeout> | undefined;
    let passeLocaleEnCours = false;

    const annulerReprise = () => {
      if (minuterie === undefined) return;
      clearTimeout(minuterie);
      minuterie = undefined;
    };
    const programmerReprise = () => {
      annulerReprise();
      minuterie = setTimeout(() => void tenter(), RETRY_DELAY_MS);
    };

    const tenter = async () => {
      if (!actif || passeLocaleEnCours) return;
      // Hors ligne, on ne consomme rien : l'événement `online` rappellera.
      if (!navigator.onLine) return;
      // Une suppression de compte en cours a la priorité, et la barrière
      // interne de la synchro refuserait de toute façon.
      if (readPendingWebAccountDeletion() !== null) return;

      annulerReprise();
      passeLocaleEnCours = true;
      try {
        // On ne part en réseau que s'il y a réellement quelque chose à
        // envoyer. Sans ce contrôle, chaque retour d'onglet déclencherait un
        // enregistrement d'appareil et un instantané de progression pour
        // rien.
        const local = await readWebAccountLocalState(userId);
        const enAttente = local.accountSnapshot.entries.some(
          ({ status }) => status === "pending",
        );
        const lotEnVol = local.accountSnapshot.inFlight !== null;
        if (!enAttente && !lotEnVol) return;

        if (!actif) return;
        await synchroniserUneSeuleFois(userId);
      } catch (erreur) {
        if (actif && meriteUneNouvelleTentative(erreur)) programmerReprise();
      } finally {
        passeLocaleEnCours = false;
      }
    };

    const tenterSiVisible = () => {
      if (document.visibilityState === "visible") void tenter();
    };
    const tenterApresChangementDistant = (evenement: StorageEvent) => {
      // Un autre onglet vient de lancer ou d'annuler une suppression : notre
      // décision de synchroniser peut avoir changé.
      if (
        evenement.key === WEB_ACCOUNT_DELETION_STORAGE_KEY &&
        (evenement.storageArea === null ||
          evenement.storageArea === localStorage)
      ) {
        void tenter();
      }
    };

    void tenter();
    window.addEventListener("online", tenter);
    window.addEventListener("storage", tenterApresChangementDistant);
    document.addEventListener("visibilitychange", tenterSiVisible);
    return () => {
      actif = false;
      annulerReprise();
      window.removeEventListener("online", tenter);
      window.removeEventListener("storage", tenterApresChangementDistant);
      document.removeEventListener("visibilitychange", tenterSiVisible);
    };
  }, [userId, auth.sessionBoundaryRevision]);

  return null;
}
