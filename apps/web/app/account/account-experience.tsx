"use client";

import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useState } from "react";

import {
  discardWebAnonymousProgress,
  purgeWebAccountData,
  readWebAccountLocalState,
  synchronizeWebAccount,
} from "@/lib/client/account-sync";
import { useWebAuthSession } from "@/lib/client/auth-session";

type LocalState = Awaited<ReturnType<typeof readWebAccountLocalState>>;

export function AccountExperience() {
  const auth = useWebAuthSession();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [localState, setLocalState] = useState<LocalState | null>(null);
  const [logoutConfirmationUserId, setLogoutConfirmationUserId] = useState<
    string | null
  >(null);
  const [deletionConfirmationUserId, setDeletionConfirmationUserId] = useState<
    string | null
  >(null);

  const userId = auth.session?.user.id ?? null;
  const currentLocalState =
    userId !== null &&
    localState?.accountSnapshot.owner.kind === "account" &&
    localState.accountSnapshot.owner.userId === userId.toLowerCase()
      ? localState
      : null;
  const refreshLocalState = useCallback(async () => {
    if (userId === null) {
      setLocalState(null);
      return;
    }
    setLocalState(await readWebAccountLocalState(userId));
  }, [userId]);

  useEffect(() => {
    let active = true;
    if (userId === null) return;
    void readWebAccountLocalState(userId)
      .then((next) => {
        if (active) setLocalState(next);
      })
      .catch(() => {
        if (active) setMessage("Le stockage local est indisponible.");
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (auth.status === "loading") return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setEmail("");
      setCode("");
      setCodeRequested(false);
      setLogoutConfirmationUserId(null);
      setDeletionConfirmationUserId(null);
    });
    return () => {
      active = false;
    };
  }, [auth.status, userId]);

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/u.test(email.trim())) {
      setMessage("Saisissez une adresse email valide.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await auth.requestEmailCode(email);
      setCodeRequested(true);
      setMessage("Code envoyé. Il expire rapidement.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Envoi impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/u.test(code.trim())) {
      setMessage("Le code doit contenir exactement six chiffres.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await auth.verifyEmailCode(email, code);
      setEmail("");
      setCode("");
      setCodeRequested(false);
      setMessage("Compte connecté sur cet appareil.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Connexion impossible.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function synchronize(startAnonymousFusion: boolean) {
    if (userId === null) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await synchronizeWebAccount({
        userId,
        startAnonymousFusion,
      });
      await refreshLocalState();
      setMessage(
        result.fusionCompleted && result.fusionRejectedCount > 0
          ? `${result.fusionRejectedCount} tentative${result.fusionRejectedCount > 1 ? "s" : ""} non importable${result.fusionRejectedCount > 1 ? "s" : ""} ${result.fusionRejectedCount > 1 ? "sont conservées" : "est conservée"} localement ; le reste est synchronisé.`
          : result.fusionCompleted
            ? "Progression fusionnée et synchronisée."
            : "Progression du compte synchronisée.",
      );
    } catch {
      setMessage(
        "La synchronisation n’a pas abouti. Les tentatives restent sur cet appareil et pourront être reprises.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function discardAnonymous() {
    if (userId === null) return;
    if (deletionConfirmationUserId !== userId) {
      setDeletionConfirmationUserId(userId);
      setMessage(
        "Confirmez pour supprimer définitivement la progression anonyme.",
      );
      return;
    }
    setBusy(true);
    try {
      await discardWebAnonymousProgress();
      await refreshLocalState();
      setMessage("Progression anonyme supprimée de cet appareil.");
      setDeletionConfirmationUserId(null);
    } catch {
      setMessage("La progression locale n’a pas été supprimée.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (userId === null) return;
    const logoutState = currentLocalState;
    if (logoutState === null) return;
    const pendingCount = logoutState.accountSnapshot.entries.filter(
      ({ status }) => status === "pending",
    ).length;
    const activeFusion =
      logoutState.fusionMarker?.status === "awaiting_server_ack" &&
      logoutState.fusionMarker.targetUserId === userId.toLowerCase();
    if (
      (pendingCount > 0 || activeFusion) &&
      logoutConfirmationUserId !== userId
    ) {
      setLogoutConfirmationUserId(userId);
      setMessage(
        "Des tentatives ne sont pas encore synchronisées. Synchronisez-les ou confirmez leur effacement uniquement sur cet appareil. Votre compte reste en ligne.",
      );
      return;
    }

    setBusy(true);
    let signedOut = false;
    try {
      await auth.signOutLocal(userId);
      signedOut = true;
      const purged = await purgeWebAccountData(userId, {
        snapshot: logoutState.accountSnapshot,
        fusionMarker: logoutState.fusionMarker,
      });
      setLocalState(null);
      setLogoutConfirmationUserId(null);
      setDeletionConfirmationUserId(null);
      setEmail("");
      setCode("");
      setCodeRequested(false);
      setMessage(
        purged
          ? "Vous êtes déconnecté de cet appareil. Les données locales liées à ce compte ont été effacées ; le compte et sa progression synchronisée restent en ligne."
          : "Vous êtes déconnecté de cet appareil. Le journal local a changé pendant l’opération : ses nouvelles données restent verrouillées jusqu’à la reconnexion au même compte.",
      );
    } catch {
      if (signedOut) {
        setLocalState(null);
        setMessage(
          "Vous êtes déconnecté de cet appareil. Les données locales restent verrouillées ; reconnectez le même compte pour les reprendre ou les supprimer.",
        );
      } else {
        setMessage(
          "La session a changé ou la déconnexion a échoué. Aucune donnée locale n’a été supprimée.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  if (auth.status === "loading") {
    return <p aria-live="polite">Vérification de la session…</p>;
  }

  if (auth.status === "unconfigured") {
    return (
      <div className="accountNotice" role="status">
        <h1>Compte non configuré ici</h1>
        <p>
          Cette copie locale ne possède aucune clé publique Supabase. La leçon
          hors ligne reste utilisable sans compte.
        </p>
        <Link className="button buttonPrimary" href="/learn/demo">
          Continuer hors ligne
        </Link>
      </div>
    );
  }

  if (auth.status === "signed_out") {
    return (
      <div className="accountPanel">
        <p className="eyebrow">Après une première réussite</p>
        <h1>Retrouver sa progression partout.</h1>
        <p className="lede accountLede">
          Un code à six chiffres suffit. La progression locale ne sera jamais
          fusionnée sans votre accord explicite.
        </p>
        <p className="accountMessage">
          Après une expiration distante, toute progression non synchronisée
          reste verrouillée jusqu’à la reconnexion au même compte.
        </p>
        {!codeRequested ? (
          <form className="accountForm" onSubmit={requestCode}>
            <label htmlFor="account-email">Adresse email</label>
            <input
              autoComplete="email"
              id="account-email"
              inputMode="email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button
              className="button buttonPrimary"
              disabled={busy}
              type="submit"
            >
              {busy ? "Envoi…" : "Recevoir mon code"}
            </button>
          </form>
        ) : (
          <form className="accountForm" onSubmit={verifyCode}>
            <label htmlFor="account-code">Code reçu par email</label>
            <input
              autoComplete="one-time-code"
              id="account-code"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
            <button
              className="button buttonPrimary"
              disabled={busy}
              type="submit"
            >
              {busy ? "Vérification…" : "Me connecter"}
            </button>
            <button
              className="button buttonGhost"
              type="button"
              onClick={() => {
                setCodeRequested(false);
                setCode("");
                setMessage("");
              }}
            >
              Changer d’email
            </button>
          </form>
        )}
        {message !== "" && (
          <p className="inlineError" role="status">
            {message}
          </p>
        )}
      </div>
    );
  }

  const anonymousEntries = currentLocalState?.anonymousSnapshot.entries ?? [];
  const anonymousCount = anonymousEntries.length;
  const anonymousImportableCount = anonymousEntries.filter(
    ({ status }) => status !== "rejected",
  ).length;
  const anonymousRejectedCount = anonymousCount - anonymousImportableCount;
  const accountPending =
    currentLocalState?.accountSnapshot.entries.filter(
      ({ status }) => status === "pending",
    ).length ?? 0;
  const stateCount =
    currentLocalState?.accountSnapshot.authoritativeStates.length ?? 0;
  const activeFusionForCurrent =
    currentLocalState?.fusionMarker?.status === "awaiting_server_ack" &&
    currentLocalState.fusionMarker.targetUserId === userId?.toLowerCase();
  const activeFusionForAnotherAccount =
    currentLocalState?.fusionMarker?.status === "awaiting_server_ack" &&
    currentLocalState.fusionMarker.targetUserId !== userId?.toLowerCase();

  return (
    <div className="accountPanel">
      <p className="eyebrow">Compte connecté</p>
      <h1>Votre progression, sous votre contrôle.</h1>
      <div className="accountMetrics" aria-live="polite">
        <div>
          <strong>{stateCount}</strong>
          <span>états maîtrisés synchronisés</span>
        </div>
        <div>
          <strong>{accountPending}</strong>
          <span>tentatives compte en attente</span>
        </div>
        <div>
          <strong>{anonymousCount}</strong>
          <span>tentatives anonymes locales</span>
        </div>
      </div>

      {activeFusionForAnotherAccount && (
        <section
          className="accountChoice"
          aria-labelledby="foreign-fusion-title"
        >
          <h2 id="foreign-fusion-title">Fusion locale déjà engagée</h2>
          <p>
            Reconnectez le compte qui l’a commencée pour la terminer. Ce compte
            peut continuer à synchroniser sa propre progression.
          </p>
        </section>
      )}

      {anonymousCount > 0 &&
        !activeFusionForCurrent &&
        !activeFusionForAnotherAccount && (
          <section className="accountChoice" aria-labelledby="fusion-title">
            <h2 id="fusion-title">Que faire de la progression locale ?</h2>
            <p>
              La fusion conserve les heures et identifiants des tentatives, puis
              laisse le serveur recalculer la maîtrise.
            </p>
            <div className="lessonActions">
              {anonymousImportableCount > 0 && (
                <button
                  className="button buttonPrimary"
                  disabled={busy}
                  onClick={() => void synchronize(true)}
                  type="button"
                >
                  Fusionner et synchroniser
                </button>
              )}
              <button
                className="button buttonGhost"
                disabled={busy}
                onClick={() =>
                  setMessage("Progression anonyme conservée pour plus tard.")
                }
                type="button"
              >
                Garder pour plus tard
              </button>
              <button
                className="button accountDanger"
                disabled={busy}
                onClick={() => void discardAnonymous()}
                type="button"
              >
                {deletionConfirmationUserId === userId
                  ? "Confirmer la suppression locale"
                  : "Supprimer la progression locale"}
              </button>
            </div>
            {anonymousRejectedCount > 0 && (
              <p className="accountMessage">
                {anonymousRejectedCount} tentative
                {anonymousRejectedCount > 1 ? "s" : ""} non importable
                {anonymousRejectedCount > 1 ? "s" : ""} reste
                {anonymousRejectedCount > 1 ? "nt" : ""} locale
                {anonymousRejectedCount > 1 ? "s" : ""} jusqu’à suppression.
              </p>
            )}
          </section>
        )}

      <div className="lessonActions accountActions">
        <button
          className="button buttonPrimary"
          disabled={busy}
          onClick={() => void synchronize(false)}
          type="button"
        >
          {busy ? "Synchronisation…" : "Synchroniser maintenant"}
        </button>
        <button
          className={
            logoutConfirmationUserId === userId
              ? "button accountDanger"
              : "button buttonGhost"
          }
          disabled={busy || currentLocalState === null}
          onClick={() => void logout()}
          type="button"
        >
          {logoutConfirmationUserId === userId
            ? "Effacer les données locales liées à ce compte et me déconnecter"
            : "Me déconnecter de cet appareil"}
        </button>
      </div>
      {message !== "" && (
        <p className="accountMessage" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
