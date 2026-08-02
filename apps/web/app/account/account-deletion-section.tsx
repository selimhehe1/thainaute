"use client";

import { noOpAnalytics, type AnalyticsSink } from "@thainaute/analytics";
import {
  SyncHttpApiError,
  SyncHttpProtocolError,
  SyncHttpTransportError,
} from "@thainaute/sync";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  WEB_ACCOUNT_DELETION_STORAGE_KEY,
  WebAccountDeletionCorruptStateError,
  WebAccountDeletionLocalStateError,
  WebAccountDeletionSubjectConflictError,
  WebAccountDeletionTombstonedError,
  createPendingWebAccountDeletion,
  isDeletedWebAccountTombstoned,
  readPendingWebAccountDeletion,
  type PendingWebAccountDeletion,
} from "@/lib/client/account-deletion";
import { resumePendingWebAccountDeletion } from "@/lib/client/account-deletion-bootstrap";
import { useWebAuthSession } from "@/lib/client/auth-session";

interface AccountDeletionSectionProps {
  readonly analytics?: AnalyticsSink;
  readonly expectedUserId: string | null;
}

type DeletionPhase =
  | "checking"
  | "idle"
  | "requesting_code"
  | "code_sent"
  | "deleting"
  | "reauthentication"
  | "retry"
  | "blocked"
  | "success";

interface DeletionViewState {
  readonly phase: DeletionPhase;
  readonly message: string;
}

function deletionFailure(error: unknown): DeletionViewState {
  if (error instanceof SyncHttpApiError) {
    if (
      error.code === "reauthentication_required" ||
      error.code === "unauthorized"
    ) {
      return {
        phase: "reauthentication",
        message:
          "Reconnectez le m\u00eame compte, puis confirmez-le avec un nouveau code email.",
      };
    }
    if (error.code === "idempotency_key_reused") {
      const reference =
        error.requestId === undefined ? "" : ` Référence : ${error.requestId}.`;
      return {
        phase: "blocked",
        message:
          "La reprise a \u00e9t\u00e9 refus\u00e9e car ses identifiants ne correspondent plus. N'effacez pas les donn\u00e9es du navigateur et contactez le support." +
          reference,
      };
    }
    if (error.code === "deletion_in_progress") {
      return {
        phase: "retry",
        message:
          "La suppression est encore en cours. Attendez quelques secondes puis reprenez la m\u00eame demande.",
      };
    }
    if (
      error.code === "auth_unavailable" ||
      error.code === "storage_unavailable" ||
      error.code === "database_unavailable" ||
      error.status >= 500
    ) {
      return {
        phase: "retry",
        message:
          "Le service est momentan\u00e9ment indisponible. La reprise s\u00e9curis\u00e9e reste sur cet appareil.",
      };
    }
  }
  if (
    error instanceof SyncHttpTransportError ||
    error instanceof SyncHttpProtocolError
  ) {
    return {
      phase: "retry",
      message:
        "La r\u00e9ponse n'a pas pu \u00eatre confirm\u00e9e. Reprenez exactement la m\u00eame demande ; elle ne sera pas ex\u00e9cut\u00e9e deux fois.",
    };
  }
  if (error instanceof WebAccountDeletionSubjectConflictError) {
    return {
      phase: "retry",
      message:
        "Une suppression pr\u00e9c\u00e9dente doit \u00eatre reprise avant d'en commencer une autre.",
    };
  }
  if (error instanceof WebAccountDeletionCorruptStateError) {
    return {
      phase: "blocked",
      message:
        "La reprise locale est illisible. N'effacez pas les donn\u00e9es du navigateur et contactez le support afin de ne pas perdre sa capacit\u00e9 de reprise.",
    };
  }
  if (error instanceof WebAccountDeletionTombstonedError) {
    return {
      phase: "success",
      message:
        "Ce compte a d\u00e9j\u00e0 \u00e9t\u00e9 supprim\u00e9 et ses donn\u00e9es locales ont \u00e9t\u00e9 purg\u00e9es de cet appareil.",
    };
  }
  if (error instanceof WebAccountDeletionLocalStateError) {
    return {
      phase: "retry",
      message:
        "La reprise ou la purge locale n'a pas abouti. Elle a \u00e9t\u00e9 conserv\u00e9e sans effacer la progression anonyme.",
    };
  }
  return {
    phase: "retry",
    message:
      "La suppression n'a pas pu \u00eatre confirm\u00e9e. La reprise reste disponible sur cet appareil.",
  };
}

export function AccountDeletionSection({
  analytics = noOpAnalytics,
  expectedUserId,
}: AccountDeletionSectionProps) {
  const auth = useWebAuthSession();
  const [operation, setOperation] = useState<PendingWebAccountDeletion | null>(
    null,
  );
  const [view, setView] = useState<DeletionViewState>({
    phase: "checking",
    message: "V\u00e9rification d'une suppression en attente\u2026",
  });
  const [understandsIrreversible, setUnderstandsIrreversible] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [code, setCode] = useState("");
  const runningRef = useRef(false);
  const automaticAttemptKeyRef = useRef<string | null>(null);

  const currentUserId = auth.session?.user.id.toLowerCase() ?? null;

  const runOperation = useCallback(
    async (pending: PendingWebAccountDeletion) => {
      if (runningRef.current) return;
      runningRef.current = true;
      const currentSubjectAtStart = auth.session?.user.id.toLowerCase() ?? null;
      const wasCurrentSubject =
        currentSubjectAtStart === pending.expectedUserId;
      setView({
        phase: "deleting",
        message:
          "Suppression du compte et purge des donn\u00e9es locales associ\u00e9es\u2026",
      });

      try {
        await resumePendingWebAccountDeletion({
          operation: pending,
          clearDeletedSession: auth.clearDeletedSession,
        });
        setOperation(null);
        setCode("");
        setConfirmation("");
        setUnderstandsIrreversible(false);
        setView({
          phase: "success",
          message: wasCurrentSubject
            ? "Votre compte a \u00e9t\u00e9 supprim\u00e9. Les donn\u00e9es locales de ce compte ont \u00e9t\u00e9 effac\u00e9es de cet appareil."
            : currentSubjectAtStart === null
              ? "La suppression en attente a \u00e9t\u00e9 termin\u00e9e. Les donn\u00e9es locales de ce compte ont \u00e9t\u00e9 effac\u00e9es."
              : "La suppression en attente a \u00e9t\u00e9 termin\u00e9e. Le compte actuellement connect\u00e9 n'a pas \u00e9t\u00e9 d\u00e9connect\u00e9.",
        });
      } catch (error) {
        setView(deletionFailure(error));
      } finally {
        runningRef.current = false;
      }
    },
    [auth.clearDeletedSession, auth.session?.user.id],
  );

  const reloadPendingOperation = useCallback(() => {
    try {
      const pending = readPendingWebAccountDeletion();
      setOperation(pending);
      if (pending === null) {
        setView({ phase: "idle", message: "" });
      }
    } catch (error) {
      setView(deletionFailure(error));
    }
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) reloadPendingOperation();
    });
    return () => {
      active = false;
    };
  }, [reloadPendingOperation]);

  useEffect(() => {
    let active = true;
    const reloadAfterRemoteChange = async (event: StorageEvent) => {
      if (
        event.key !== WEB_ACCOUNT_DELETION_STORAGE_KEY ||
        (event.storageArea !== null && event.storageArea !== localStorage)
      ) {
        return;
      }
      try {
        const pending = readPendingWebAccountDeletion();
        if (pending !== null) {
          if (active) setOperation(pending);
          return;
        }
        if (operation === null) {
          if (active) {
            setOperation(null);
            setView({ phase: "idle", message: "" });
          }
          return;
        }

        const tombstoned = await isDeletedWebAccountTombstoned(
          operation.expectedUserId,
        );
        if (!active) return;
        const latestPending = readPendingWebAccountDeletion();
        if (latestPending !== null) {
          setOperation(latestPending);
          return;
        }
        if (tombstoned) {
          setOperation(null);
          setView({
            phase: "success",
            message:
              "La suppression a \u00e9t\u00e9 termin\u00e9e dans un autre onglet et les donn\u00e9es locales de ce compte ont \u00e9t\u00e9 purg\u00e9es.",
          });
        } else {
          setView({
            phase: "blocked",
            message:
              "La reprise locale a disparu sans preuve de suppression ni de purge. Gardez cet onglet ouvert et contactez le support.",
          });
        }
      } catch (error) {
        if (active) setView(deletionFailure(error));
      }
    };
    const onStorage = (event: StorageEvent) => {
      void reloadAfterRemoteChange(event);
    };
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", onStorage);
    };
  }, [operation]);

  useEffect(() => {
    if (operation === null) return;
    const attemptKey = `${operation.idempotencyKey}:${auth.sessionBoundaryRevision}`;
    if (automaticAttemptKeyRef.current === attemptKey) return;
    automaticAttemptKeyRef.current = attemptKey;
    void runOperation(operation);
  }, [auth.sessionBoundaryRevision, operation, runOperation]);

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    const targetUserId = operation?.expectedUserId ?? expectedUserId;
    if (targetUserId === null || currentUserId !== targetUserId.toLowerCase()) {
      setView({
        phase: "reauthentication",
        message:
          "Reconnectez le compte concern\u00e9 avant de demander son code de confirmation.",
      });
      return;
    }
    if (
      operation === null &&
      (!understandsIrreversible || confirmation !== "SUPPRIMER")
    ) {
      setView({
        phase: "idle",
        message:
          "Cochez l'avertissement et saisissez SUPPRIMER avant de continuer.",
      });
      return;
    }

    setView({
      phase: "requesting_code",
      message: "Envoi du code de confirmation\u2026",
    });
    try {
      await auth.requestAccountDeletionCode(targetUserId);
      setView({
        phase: "code_sent",
        message:
          "Code envoy\u00e9 \u00e0 l'adresse exacte du compte. Il expire rapidement.",
      });
    } catch (error) {
      setView({
        phase: "reauthentication",
        message:
          error instanceof Error
            ? error.message
            : "Le code n'a pas pu \u00eatre envoy\u00e9.",
      });
    }
  }

  async function verifyAndDelete(event: FormEvent) {
    event.preventDefault();
    const targetUserId = operation?.expectedUserId ?? expectedUserId;
    if (targetUserId === null || !/^\d{6}$/u.test(code)) {
      setView({
        phase: "code_sent",
        message: "Le code doit contenir exactement six chiffres.",
      });
      return;
    }

    setView({
      phase: "deleting",
      message: "V\u00e9rification du code\u2026",
    });
    try {
      await auth.verifyAccountDeletionCode(targetUserId, code);
    } catch (error) {
      setView({
        phase: "code_sent",
        message:
          error instanceof Error
            ? error.message
            : "Le code n'a pas pu \u00eatre v\u00e9rifi\u00e9.",
      });
      return;
    }

    let pending: PendingWebAccountDeletion;
    try {
      pending =
        operation ??
        (await createPendingWebAccountDeletion(targetUserId, {
          onCreated: () =>
            analytics.capture({
              name: "account_deletion_requested",
              platform: "web",
            }),
        }));
    } catch (error) {
      setView(deletionFailure(error));
      return;
    }
    setOperation(pending);
    automaticAttemptKeyRef.current = `${pending.idempotencyKey}:${auth.sessionBoundaryRevision}`;
    await runOperation(pending);
  }

  if (
    expectedUserId === null &&
    operation === null &&
    (view.phase === "checking" || view.phase === "idle")
  ) {
    return null;
  }

  const busy =
    view.phase === "checking" ||
    view.phase === "requesting_code" ||
    view.phase === "deleting";
  const targetUserId = operation?.expectedUserId ?? expectedUserId;
  const canReauthenticate =
    targetUserId !== null && currentUserId === targetUserId.toLowerCase();
  const showCodeForm = view.phase === "code_sent";
  const showReauthentication = view.phase === "reauthentication";
  const showInitialConfirmation = operation === null && view.phase === "idle";

  return (
    <section
      aria-busy={busy}
      aria-labelledby="account-deletion-title"
      className="accountDeletion"
    >
      <p className="eyebrow">Zone sensible</p>
      <h2 id="account-deletion-title">
        Supprimer d&eacute;finitivement mon compte
      </h2>

      {showInitialConfirmation && (
        <form className="accountDeletionForm" onSubmit={requestCode}>
          <p>
            Cette action est irr&eacute;versible.{" "}
            <a
              className="accountDeletionExportLink"
              href="#account-export-title"
            >
              T&eacute;l&eacute;chargez votre export JSON
            </a>{" "}
            avant de continuer si vous souhaitez conserver une copie de vos
            donn&eacute;es synchronis&eacute;es.
          </p>
          <ul className="accountDeletionWarnings">
            <li>
              Les tentatives locales li&eacute;es &agrave; ce compte seront
              effac&eacute;es, m&ecirc;me si elles n&apos;ont pas encore
              &eacute;t&eacute; synchronis&eacute;es.
            </li>
            <li>
              Les signalements linguistiques conserv&eacute;s localement pour ce
              compte seront aussi effac&eacute;s, y compris ceux en attente ou
              refus&eacute;s. Revenez &agrave; la le&ccedil;on avant de
              continuer si vous souhaitez les envoyer ou r&eacute;soudre un
              refus.
            </li>
            <li>
              Les prises de voix locales ouvertes sur cet appareil seront
              retir&eacute;es de la session.
            </li>
            <li>
              La progression anonyme et l&apos;identit&eacute; de cette
              installation sont conserv&eacute;es.
            </li>
          </ul>
          <label className="accountDeletionCheck">
            <input
              checked={understandsIrreversible}
              disabled={busy}
              type="checkbox"
              onChange={(event) =>
                setUnderstandsIrreversible(event.target.checked)
              }
            />
            <span>
              Je comprends que cette suppression est irr&eacute;versible.
            </span>
          </label>
          <label htmlFor="account-deletion-confirmation">
            Saisissez <strong>SUPPRIMER</strong> pour confirmer
          </label>
          <input
            autoComplete="off"
            disabled={busy}
            id="account-deletion-confirmation"
            spellCheck={false}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
          <button
            className="button accountDanger"
            disabled={
              busy || !understandsIrreversible || confirmation !== "SUPPRIMER"
            }
            type="submit"
          >
            Recevoir le code de suppression
          </button>
        </form>
      )}

      {showCodeForm && (
        <form className="accountDeletionForm" onSubmit={verifyAndDelete}>
          <label htmlFor="account-deletion-code">
            Code &agrave; six chiffres re&ccedil;u par email
          </label>
          <input
            autoComplete="one-time-code"
            autoFocus
            disabled={busy}
            id="account-deletion-code"
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]{6}"
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <button
            className="button accountDanger"
            disabled={busy || !/^\d{6}$/u.test(code)}
            type="submit"
          >
            Supprimer d&eacute;finitivement mon compte
          </button>
        </form>
      )}

      {showReauthentication && canReauthenticate && (
        <button
          className="button accountDanger"
          disabled={busy}
          onClick={(event) => void requestCode(event)}
          type="button"
        >
          Recevoir un nouveau code
        </button>
      )}

      {view.phase === "retry" &&
        (operation !== null ? (
          <button
            className="button buttonGhost"
            disabled={busy}
            onClick={() => void runOperation(operation)}
            type="button"
          >
            Reprendre la m&ecirc;me demande
          </button>
        ) : (
          <button
            className="button buttonGhost"
            disabled={busy}
            onClick={reloadPendingOperation}
            type="button"
          >
            R&eacute;essayer de lire la reprise
          </button>
        ))}

      {view.message !== "" && (
        <p
          aria-atomic="true"
          className={
            view.phase === "retry" ||
            view.phase === "blocked" ||
            view.phase === "reauthentication"
              ? "accountDeletionStatus inlineError"
              : "accountDeletionStatus"
          }
          role="status"
        >
          {view.message}
        </p>
      )}
    </section>
  );
}
