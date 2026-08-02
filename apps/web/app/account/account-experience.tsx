"use client";

import type { AnalyticsSink } from "@thainaute/analytics";
import { buttonClass } from "@/components/ui/button";
import panel from "@/components/ui/panel.module.css";
import styles from "./account.module.css";
import Link from "next/link";
import {
  type FormEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  discardWebAnonymousProgress,
  purgeWebAccountData,
  readWebAccountLocalState,
  synchronizeWebAccount,
} from "@/lib/client/account-sync";
import { assertNoPendingWebAccountDeletion } from "@/lib/client/account-deletion";
import { useWebAnalyticsConsent } from "@/lib/client/analytics-consent";
import { useWebAuthSession } from "@/lib/client/auth-session";

import { AccountDeletionSection } from "./account-deletion-section";
import { AccountExportSection } from "./account-export-section";

type LocalState = Awaited<ReturnType<typeof readWebAccountLocalState>>;

interface SignedOutAccountPanelProps {
  readonly busy: boolean;
  readonly code: string;
  readonly codeRequested: boolean;
  readonly email: string;
  readonly message: string;
  readonly onCodeChange: (code: string) => void;
  readonly onEmailChange: (email: string) => void;
  readonly onRequestCode: (event: FormEvent) => void;
  readonly onResetCodeRequest: () => void;
  readonly onVerifyCode: (event: FormEvent) => void;
}

function SignedOutAccountPanel({
  busy,
  code,
  codeRequested,
  email,
  message,
  onCodeChange,
  onEmailChange,
  onRequestCode,
  onResetCodeRequest,
  onVerifyCode,
}: SignedOutAccountPanelProps) {
  return (
    <div className={styles.panel}>
      <p className={panel.eyebrow}>Après une première réussite</p>
      <h1>Retrouver sa progression partout.</h1>
      <p className={panel.lede}>
        Un code à six chiffres suffit. La progression locale ne sera jamais
        fusionnée sans votre accord explicite.
      </p>
      <p className={styles.message}>
        Après une expiration distante, toute progression non synchronisée reste
        verrouillée jusqu’à la reconnexion au même compte.
      </p>
      {!codeRequested ? (
        <form className={styles.form} onSubmit={onRequestCode}>
          <label htmlFor="account-email">Adresse email</label>
          <input
            autoComplete="email"
            id="account-email"
            inputMode="email"
            required
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
          />
          <button
            className={buttonClass("primary")}
            disabled={busy}
            type="submit"
          >
            {busy ? "Envoi…" : "Recevoir mon code"}
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={onVerifyCode}>
          <label htmlFor="account-code">Code reçu par email</label>
          <input
            autoComplete="one-time-code"
            id="account-code"
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]{6}"
            required
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
          />
          <button
            className={buttonClass("primary")}
            disabled={busy}
            type="submit"
          >
            {busy ? "Vérification…" : "Me connecter"}
          </button>
          <button
            className={buttonClass("ghost")}
            type="button"
            onClick={onResetCodeRequest}
          >
            Changer d’email
          </button>
        </form>
      )}
      {message !== "" && (
        <p className={panel.inlineError}>
          <output>{message}</output>
        </p>
      )}
    </div>
  );
}

interface SignedInAccountSummary {
  readonly accountPending: number;
  readonly activeFusionForAnotherAccount: boolean;
  readonly activeFusionForCurrent: boolean;
  readonly anonymousCount: number;
  readonly anonymousImportableCount: number;
  readonly anonymousRejectedCount: number;
  readonly contentReportPending: number;
  readonly stateCount: number;
}

function summarizeSignedInAccount(
  currentLocalState: LocalState | null,
  userId: string | null,
): SignedInAccountSummary {
  const anonymousEntries = currentLocalState?.anonymousSnapshot.entries ?? [];
  const anonymousCount = anonymousEntries.length;
  const anonymousImportableCount = anonymousEntries.filter(
    ({ status }) => status !== "rejected",
  ).length;
  const fusionMarker = currentLocalState?.fusionMarker;
  const activeFusion = fusionMarker?.status === "awaiting_server_ack";
  const normalizedUserId = userId?.toLowerCase();

  return {
    accountPending:
      currentLocalState?.accountSnapshot.entries.filter(
        ({ status }) => status === "pending",
      ).length ?? 0,
    activeFusionForAnotherAccount:
      activeFusion && fusionMarker.targetUserId !== normalizedUserId,
    activeFusionForCurrent:
      activeFusion && fusionMarker.targetUserId === normalizedUserId,
    anonymousCount,
    anonymousImportableCount,
    anonymousRejectedCount: anonymousCount - anonymousImportableCount,
    contentReportPending:
      currentLocalState?.contentReportOutbox.entries.length ?? 0,
    stateCount:
      currentLocalState?.accountSnapshot.authoritativeStates.length ?? 0,
  };
}

function AccountMetrics({
  accountPending,
  anonymousCount,
  contentReportPending,
  stateCount,
}: Pick<
  SignedInAccountSummary,
  "accountPending" | "anonymousCount" | "contentReportPending" | "stateCount"
>) {
  return (
    <div className={styles.metrics} aria-live="polite">
      <div data-testid="account-metric-synced-states">
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
      <div>
        <strong>{contentReportPending}</strong>
        <span>signalements en attente</span>
      </div>
    </div>
  );
}

function ForeignFusionNotice({ active }: Readonly<{ active: boolean }>) {
  if (!active) return null;
  return (
    <section className={styles.choice} aria-labelledby="foreign-fusion-title">
      <h2 id="foreign-fusion-title">Fusion locale déjà engagée</h2>
      <p>
        Reconnectez le compte qui l’a commencée pour la terminer. Ce compte peut
        continuer à synchroniser sa propre progression.
      </p>
    </section>
  );
}

function RejectedAnonymousAttempts({ count }: Readonly<{ count: number }>) {
  if (count === 0) return null;
  const plural = count > 1;
  return (
    <p className={styles.message}>
      {count} tentative{plural ? "s" : ""} non importable{plural ? "s" : ""}{" "}
      reste{plural ? "nt" : ""} locale{plural ? "s" : ""} jusqu’à suppression.
    </p>
  );
}

interface AnonymousProgressChoiceProps {
  readonly activeFusionForAnotherAccount: boolean;
  readonly activeFusionForCurrent: boolean;
  readonly anonymousCount: number;
  readonly anonymousImportableCount: number;
  readonly anonymousRejectedCount: number;
  readonly busy: boolean;
  readonly deletionConfirmationPending: boolean;
  readonly onDiscard: () => void;
  readonly onKeep: () => void;
  readonly onSynchronize: () => void;
}

function AnonymousProgressChoice({
  activeFusionForAnotherAccount,
  activeFusionForCurrent,
  anonymousCount,
  anonymousImportableCount,
  anonymousRejectedCount,
  busy,
  deletionConfirmationPending,
  onDiscard,
  onKeep,
  onSynchronize,
}: AnonymousProgressChoiceProps) {
  if (
    anonymousCount === 0 ||
    activeFusionForCurrent ||
    activeFusionForAnotherAccount
  ) {
    return null;
  }

  return (
    <section className={styles.choice} aria-labelledby="fusion-title">
      <h2 id="fusion-title">Que faire de la progression locale ?</h2>
      <p>
        La fusion conserve les heures et identifiants des tentatives, puis
        laisse le serveur recalculer la maîtrise.
      </p>
      <div className={panel.actions}>
        {anonymousImportableCount > 0 && (
          <button
            className={buttonClass("primary")}
            disabled={busy}
            onClick={onSynchronize}
            type="button"
          >
            Fusionner et synchroniser
          </button>
        )}
        <button
          className={buttonClass("ghost")}
          disabled={busy}
          onClick={onKeep}
          type="button"
        >
          Garder pour plus tard
        </button>
        <button
          className={buttonClass("danger")}
          disabled={busy}
          onClick={onDiscard}
          type="button"
        >
          {deletionConfirmationPending
            ? "Confirmer la suppression locale"
            : "Supprimer la progression locale"}
        </button>
      </div>
      <RejectedAnonymousAttempts count={anonymousRejectedCount} />
    </section>
  );
}

interface SignedInAccountActionsProps {
  readonly busy: boolean;
  readonly canLogout: boolean;
  readonly logoutConfirmationPending: boolean;
  readonly onLogout: () => void;
  readonly onOpenConnectedPreview: (
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
  readonly onSynchronize: () => void;
}

function SignedInAccountActions({
  busy,
  canLogout,
  logoutConfirmationPending,
  onLogout,
  onOpenConnectedPreview,
  onSynchronize,
}: SignedInAccountActionsProps) {
  return (
    <div className={panel.actions}>
      <button
        className={buttonClass("primary")}
        disabled={busy}
        onClick={onSynchronize}
        type="button"
      >
        {busy ? "Synchronisation…" : "Synchroniser maintenant"}
      </button>
      <Link
        aria-disabled={busy}
        className={buttonClass("ghost")}
        href="/learn/connected"
        onClick={(event) => {
          if (busy) event.preventDefault();
          else onOpenConnectedPreview(event);
        }}
      >
        Ouvrir la preview connectée
      </Link>
      <button
        className={
          logoutConfirmationPending
            ? "button accountDanger"
            : "button buttonGhost"
        }
        disabled={busy || !canLogout}
        onClick={onLogout}
        type="button"
      >
        {logoutConfirmationPending
          ? "Effacer les données locales liées à ce compte et me déconnecter"
          : "Me déconnecter de cet appareil"}
      </button>
    </div>
  );
}

interface SignedInAccountPanelProps {
  readonly analytics: AnalyticsSink;
  readonly busy: boolean;
  readonly currentLocalState: LocalState | null;
  readonly deletionConfirmationUserId: string | null;
  readonly logoutConfirmationUserId: string | null;
  readonly message: string;
  readonly onDiscardAnonymous: () => void;
  readonly onKeepAnonymous: () => void;
  readonly onLogout: () => void;
  readonly onOpenConnectedPreview: (
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
  readonly onSynchronize: (startAnonymousFusion: boolean) => void;
  readonly sessionBoundaryRevision: number;
  readonly userId: string | null;
}

function SignedInAccountPanel({
  analytics,
  busy,
  currentLocalState,
  deletionConfirmationUserId,
  logoutConfirmationUserId,
  message,
  onDiscardAnonymous,
  onKeepAnonymous,
  onLogout,
  onOpenConnectedPreview,
  onSynchronize,
  sessionBoundaryRevision,
  userId,
}: SignedInAccountPanelProps) {
  const summary = summarizeSignedInAccount(currentLocalState, userId);
  const deletionConfirmationPending = deletionConfirmationUserId === userId;
  const logoutConfirmationPending = logoutConfirmationUserId === userId;

  return (
    <div className={styles.panel}>
      <p className={panel.eyebrow}>Compte connecté</p>
      <h1>Votre progression, sous votre contrôle.</h1>
      <AccountMetrics {...summary} />
      <ForeignFusionNotice active={summary.activeFusionForAnotherAccount} />
      <AnonymousProgressChoice
        activeFusionForAnotherAccount={summary.activeFusionForAnotherAccount}
        activeFusionForCurrent={summary.activeFusionForCurrent}
        anonymousCount={summary.anonymousCount}
        anonymousImportableCount={summary.anonymousImportableCount}
        anonymousRejectedCount={summary.anonymousRejectedCount}
        busy={busy}
        deletionConfirmationPending={deletionConfirmationPending}
        onDiscard={onDiscardAnonymous}
        onKeep={onKeepAnonymous}
        onSynchronize={() => onSynchronize(true)}
      />
      {userId !== null && (
        <AccountExportSection
          analytics={analytics}
          anonymousAttemptCount={summary.anonymousCount}
          expectedUserId={userId}
          fusionPending={
            summary.activeFusionForCurrent ||
            summary.activeFusionForAnotherAccount
          }
          pendingAttemptCount={summary.accountPending}
          sessionBoundaryRevision={sessionBoundaryRevision}
        />
      )}
      <SignedInAccountActions
        busy={busy}
        canLogout={currentLocalState !== null}
        logoutConfirmationPending={logoutConfirmationPending}
        onLogout={onLogout}
        onOpenConnectedPreview={onOpenConnectedPreview}
        onSynchronize={() => onSynchronize(false)}
      />
      {message !== "" && (
        <p className={styles.message}>
          <output>{message}</output>
        </p>
      )}
    </div>
  );
}

function selectCurrentLocalState(
  localState: LocalState | null,
  userId: string | null,
): LocalState | null {
  if (
    userId === null ||
    localState?.accountSnapshot.owner.kind !== "account" ||
    localState.accountSnapshot.owner.userId !== userId.toLowerCase()
  ) {
    return null;
  }
  return localState;
}

export function AccountExperience() {
  const auth = useWebAuthSession();
  const { analytics } = useWebAnalyticsConsent();
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
  const currentLocalState = selectCurrentLocalState(localState, userId);
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
      const progressMessage =
        result.fusionCompleted && result.fusionRejectedCount > 0
          ? `${result.fusionRejectedCount} tentative${result.fusionRejectedCount > 1 ? "s" : ""} non importable${result.fusionRejectedCount > 1 ? "s" : ""} ${result.fusionRejectedCount > 1 ? "sont conservées" : "est conservée"} localement ; le reste est synchronisé.`
          : result.fusionCompleted
            ? "Progression fusionnée et synchronisée."
            : "Progression du compte synchronisée.";
      const sentReportMessage =
        result.contentReportsSent > 0
          ? `${result.contentReportsSent} signalement${result.contentReportsSent > 1 ? "s" : ""} envoyé${result.contentReportsSent > 1 ? "s" : ""}.`
          : "";
      const pendingReportMessage =
        result.contentReportsPending > 0
          ? `${result.contentReportsPending} signalement${result.contentReportsPending > 1 ? "s restent" : " reste"} conservé${result.contentReportsPending > 1 ? "s" : ""} sur cet appareil.`
          : "Aucun signalement en attente.";
      const rejectedReportMessage =
        result.contentReportsRejected > 0
          ? "Un signalement a été refusé définitivement. Revenez à la leçon concernée pour le retirer explicitement et reprendre les suivants."
          : "";
      setMessage(
        [
          progressMessage,
          sentReportMessage,
          rejectedReportMessage,
          pendingReportMessage,
        ]
          .filter((part) => part !== "")
          .join(" "),
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
    const pendingReportCount = logoutState.contentReportOutbox.entries.length;
    const activeFusion =
      logoutState.fusionMarker?.status === "awaiting_server_ack" &&
      logoutState.fusionMarker.targetUserId === userId.toLowerCase();
    if (
      (pendingCount > 0 || pendingReportCount > 0 || activeFusion) &&
      logoutConfirmationUserId !== userId
    ) {
      setLogoutConfirmationUserId(userId);
      setMessage(
        "Des tentatives ou signalements ne sont pas encore synchronisés. Synchronisez-les ou confirmez leur effacement uniquement sur cet appareil. Votre compte reste en ligne.",
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
        contentReportOutbox: logoutState.contentReportOutbox,
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
      <>
        <div className={styles.notice} role="status">
          <h1>Compte non configuré ici</h1>
          <p>
            Cette copie locale ne possède aucune clé publique Supabase. La leçon
            hors ligne reste utilisable sans compte.
          </p>
          <Link className={buttonClass("primary")} href="/learn/demo">
            Continuer hors ligne
          </Link>
        </div>
        <AccountDeletionSection analytics={analytics} expectedUserId={null} />
      </>
    );
  }

  if (auth.status === "signed_out") {
    return (
      <>
        <SignedOutAccountPanel
          busy={busy}
          code={code}
          codeRequested={codeRequested}
          email={email}
          message={message}
          onCodeChange={setCode}
          onEmailChange={setEmail}
          onRequestCode={(event) => void requestCode(event)}
          onResetCodeRequest={() => {
            setCodeRequested(false);
            setCode("");
            setMessage("");
          }}
          onVerifyCode={(event) => void verifyCode(event)}
        />
        <AccountDeletionSection analytics={analytics} expectedUserId={null} />
      </>
    );
  }

  return (
    <>
      <SignedInAccountPanel
        analytics={analytics}
        busy={busy}
        currentLocalState={currentLocalState}
        deletionConfirmationUserId={deletionConfirmationUserId}
        logoutConfirmationUserId={logoutConfirmationUserId}
        message={message}
        onDiscardAnonymous={() => void discardAnonymous()}
        onKeepAnonymous={() =>
          setMessage("Progression anonyme conservée pour plus tard.")
        }
        onLogout={() => void logout()}
        onOpenConnectedPreview={(event) => {
          if (userId === null) {
            event.preventDefault();
            return;
          }
          try {
            assertNoPendingWebAccountDeletion(userId);
          } catch {
            event.preventDefault();
            setMessage(
              "Terminez d’abord la suppression en attente avant d’ouvrir la preview.",
            );
          }
        }}
        onSynchronize={(startAnonymousFusion) =>
          void synchronize(startAnonymousFusion)
        }
        sessionBoundaryRevision={auth.sessionBoundaryRevision}
        userId={userId}
      />
      <AccountDeletionSection analytics={analytics} expectedUserId={userId} />
    </>
  );
}
