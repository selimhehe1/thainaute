import { noOpAnalytics, type AnalyticsSink } from "@thainaute/analytics";
import {
  SyncHttpApiError,
  SyncHttpProtocolError,
  SyncHttpTransportError,
} from "@thainaute/sync";
import type { SQLiteDatabase } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  createMobileAccountDeletionOperation,
  MobileAccountDeletionError,
  readMobileAccountDeletionOperation,
  resumeMobileAccountDeletion,
  type MobileAccountDeletionOperation,
} from "./mobile-account-deletion";

export type MobileAccountDeletionStatus =
  | "checking"
  | "idle"
  | "confirming"
  | "sending_code"
  | "awaiting_code"
  | "deleting"
  | "success"
  | "error";

export interface MobileAccountDeletionState {
  readonly status: MobileAccountDeletionStatus;
  readonly isBusy: boolean;
  readonly message: string;
  readonly hasPendingOperation: boolean;
  readonly pendingTargetsCurrentUser: boolean;
  readonly canReauthenticate: boolean;
  readonly needsReauthentication: boolean;
  readonly retryable: boolean;
  readonly beginConfirmation: () => void;
  readonly cancelConfirmation: () => void;
  readonly requestReauthenticationCode: () => Promise<void>;
  readonly verifyCodeAndDelete: (code: string) => Promise<void>;
  readonly retry: () => Promise<void>;
}

interface ViewState {
  readonly status: MobileAccountDeletionStatus;
  readonly message: string;
  readonly hasPendingOperation: boolean;
  readonly pendingExpectedUserId: string | null;
  readonly needsReauthentication: boolean;
  readonly retryable: boolean;
}

const INITIAL_STATE: ViewState = {
  status: "checking",
  message: "Vérification d’une éventuelle suppression à reprendre…",
  hasPendingOperation: false,
  pendingExpectedUserId: null,
  needsReauthentication: false,
  retryable: false,
};

function errorPresentation(
  error: unknown,
): Pick<ViewState, "message" | "needsReauthentication" | "retryable"> {
  if (error instanceof SyncHttpApiError) {
    switch (error.code) {
      case "unauthorized":
      case "reauthentication_required":
        return {
          message:
            "La session doit être confirmée à nouveau avant la suppression.",
          needsReauthentication: true,
          retryable: false,
        };
      case "idempotency_key_reused":
        return {
          message:
            "La commande sécurisée est incohérente. N’effacez pas les données de l’application et contactez le support.",
          needsReauthentication: false,
          retryable: false,
        };
      case "deletion_in_progress":
        return {
          message:
            "La suppression est encore en cours sur le serveur. Vous pouvez la reprendre sans créer une nouvelle commande.",
          needsReauthentication: false,
          retryable: true,
        };
      case "auth_unavailable":
      case "storage_unavailable":
      case "database_unavailable":
      case "internal_error":
        return {
          message:
            "Le service de suppression est momentanément indisponible. La commande sécurisée reste sur cet appareil.",
          needsReauthentication: false,
          retryable: true,
        };
      default:
        return {
          message:
            "La suppression a été refusée. La commande sécurisée reste sur cet appareil.",
          needsReauthentication: false,
          retryable: error.retryable,
        };
    }
  }

  if (
    error instanceof SyncHttpTransportError ||
    error instanceof SyncHttpProtocolError
  ) {
    return {
      message:
        "La réponse du serveur n’a pas été reçue. La même commande sera rejouée sans risque de double suppression.",
      needsReauthentication: false,
      retryable: true,
    };
  }

  if (error instanceof MobileAccountDeletionError) {
    switch (error.code) {
      case "api_unconfigured":
        return {
          message:
            "L’API de suppression n’est pas configurée dans cette build.",
          needsReauthentication: false,
          retryable: false,
        };
      case "deletion_in_progress":
        return {
          message:
            "La suppression en attente doit être terminée avant toute autre opération sur ce compte.",
          needsReauthentication: false,
          retryable: true,
        };
      case "operation_corrupt":
        return {
          message:
            "La commande locale est illisible. Elle est conservée afin de ne pas perdre sa possibilité de reprise.",
          needsReauthentication: false,
          retryable: false,
        };
      case "pending_subject_changed":
        return {
          message:
            "Une suppression d’un autre compte attend déjà sur cet appareil. Le compte actuel reste intact.",
          needsReauthentication: true,
          retryable: false,
        };
      case "operation_storage_unavailable":
        return {
          message:
            "Le trousseau sécurisé est indisponible. Réessayez sans réinstaller l’application.",
          needsReauthentication: false,
          retryable: true,
        };
      case "secure_random_unavailable":
        return {
          message:
            "La commande sécurisée n’a pas pu être créée et rien n’a été envoyé au serveur. Recommencez la confirmation.",
          needsReauthentication: false,
          retryable: false,
        };
    }
  }

  return {
    message:
      "Le compte peut déjà être supprimé en ligne, mais le nettoyage local n’est pas terminé. Réessayez sans réinstaller l’application.",
    needsReauthentication: false,
    retryable: true,
  };
}

async function pendingOperationAfterFailure(): Promise<MobileAccountDeletionOperation | null> {
  try {
    return await readMobileAccountDeletionOperation();
  } catch {
    return null;
  }
}

export function useMobileAccountDeletion(input: {
  readonly analytics?: AnalyticsSink;
  readonly database: SQLiteDatabase;
  readonly platform: "ios" | "android";
  readonly currentUserId: string | null;
  readonly clearDeletedSession: (expectedUserId: string) => Promise<void>;
  readonly requestReauthenticationCode: (
    expectedUserId: string,
  ) => Promise<void>;
  readonly verifyReauthenticationCode: (
    expectedUserId: string,
    code: string,
  ) => Promise<void>;
}): MobileAccountDeletionState {
  const {
    database,
    clearDeletedSession,
    requestReauthenticationCode: requestReauthenticationCodeForUser,
    verifyReauthenticationCode,
  } = input;
  const currentUserId = input.currentUserId?.toLowerCase() ?? null;
  const [view, setView] = useState<ViewState>(INITIAL_STATE);
  const mountedRef = useRef(true);
  const inFlightRef = useRef(false);

  const setIfMounted = useCallback((next: ViewState) => {
    if (mountedRef.current) setView(next);
  }, []);

  const completeResume = useCallback(async () => {
    const operation = await readMobileAccountDeletionOperation();
    if (operation === null) {
      setIfMounted({
        status: "idle",
        message: "",
        hasPendingOperation: false,
        pendingExpectedUserId: null,
        needsReauthentication: false,
        retryable: false,
      });
      return;
    }

    setIfMounted({
      status: "deleting",
      message:
        operation.status === "server_deleted"
          ? "Compte supprimé en ligne. Nettoyage sécurisé de cet appareil…"
          : "Suppression sécurisée en cours…",
      pendingExpectedUserId: operation.expectedUserId,
      hasPendingOperation: true,
      needsReauthentication: false,
      retryable: false,
    });
    const result = await resumeMobileAccountDeletion({
      database,
      clearDeletedSession,
    });
    if (result.status === "idle") return;

    setIfMounted({
      status: "success",
      message:
        "Le compte visé et ses données locales liées ont été supprimés. La progression anonyme et l’onboarding de cet appareil sont conservés ; tout autre compte connecté reste intact.",
      pendingExpectedUserId: null,
      hasPendingOperation: false,
      needsReauthentication: false,
      retryable: false,
    });
  }, [clearDeletedSession, database, setIfMounted]);

  const recoverFailure = useCallback(
    async (error: unknown) => {
      const pending = await pendingOperationAfterFailure();
      const presentation = errorPresentation(error);
      const operationStateIsUncertain =
        error instanceof MobileAccountDeletionError &&
        (error.code === "operation_corrupt" ||
          error.code === "operation_storage_unavailable");
      setIfMounted({
        status: "error",
        ...presentation,
        hasPendingOperation: pending !== null || operationStateIsUncertain,
        pendingExpectedUserId: pending?.expectedUserId ?? null,
      });
    },
    [setIfMounted],
  );

  const resume = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      await completeResume();
    } catch (error) {
      await recoverFailure(error);
    } finally {
      inFlightRef.current = false;
    }
  }, [completeResume, recoverFailure]);

  useEffect(() => {
    mountedRef.current = true;
    void resume();
    return () => {
      mountedRef.current = false;
    };
  }, [resume]);

  const beginConfirmation = useCallback(() => {
    if (currentUserId === null || inFlightRef.current) return;
    setView({
      status: "confirming",
      message:
        "Cette action efface définitivement le compte en ligne et sa progression synchronisée.",
      pendingExpectedUserId: null,
      hasPendingOperation: false,
      needsReauthentication: false,
      retryable: false,
    });
  }, [currentUserId]);

  const cancelConfirmation = useCallback(() => {
    if (inFlightRef.current) return;
    if (view.hasPendingOperation) {
      setView({
        status: "error",
        message:
          "La commande de suppression reste protégée sur cet appareil et devra être reprise.",
        pendingExpectedUserId: view.pendingExpectedUserId,
        hasPendingOperation: true,
        needsReauthentication: true,
        retryable: false,
      });
      return;
    }
    setView({
      status: "idle",
      message: "",
      pendingExpectedUserId: null,
      hasPendingOperation: false,
      needsReauthentication: false,
      retryable: false,
    });
  }, [view.hasPendingOperation, view.pendingExpectedUserId]);

  const requestReauthenticationCode = useCallback(async () => {
    const expectedUserId = currentUserId;
    if (expectedUserId === null || inFlightRef.current) return;
    if (
      view.pendingExpectedUserId !== null &&
      view.pendingExpectedUserId !== expectedUserId
    ) {
      setView({
        ...view,
        status: "error",
        message:
          "Reconnectez le compte concerné pour confirmer cette ancienne suppression. Le compte actuel reste intact.",
        needsReauthentication: true,
        retryable: false,
      });
      return;
    }

    inFlightRef.current = true;
    setView({
      status: "sending_code",
      message: "Envoi du code de sécurité…",
      pendingExpectedUserId: view.pendingExpectedUserId,
      hasPendingOperation: view.hasPendingOperation,
      needsReauthentication: false,
      retryable: false,
    });
    try {
      await requestReauthenticationCodeForUser(expectedUserId);
      setIfMounted({
        status: "awaiting_code",
        message:
          "Saisissez le code à six chiffres envoyé à l’adresse exacte de ce compte.",
        pendingExpectedUserId: view.pendingExpectedUserId,
        hasPendingOperation: view.hasPendingOperation,
        needsReauthentication: false,
        retryable: false,
      });
    } catch (error) {
      setIfMounted({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Le code de sécurité n’a pas pu être envoyé.",
        pendingExpectedUserId: view.pendingExpectedUserId,
        hasPendingOperation: view.hasPendingOperation,
        needsReauthentication: true,
        retryable: false,
      });
    } finally {
      inFlightRef.current = false;
    }
  }, [currentUserId, requestReauthenticationCodeForUser, setIfMounted, view]);

  const verifyCodeAndDelete = useCallback(
    async (code: string) => {
      const expectedUserId = currentUserId;
      if (expectedUserId === null || inFlightRef.current) return;
      if (!/^\d{6}$/u.test(code)) {
        setView({
          ...view,
          status: "awaiting_code",
          message: "Le code doit contenir exactement six chiffres.",
        });
        return;
      }

      inFlightRef.current = true;
      setView({
        status: "deleting",
        message: "Vérification du code puis suppression sécurisée…",
        pendingExpectedUserId: view.pendingExpectedUserId,
        hasPendingOperation: view.hasPendingOperation,
        needsReauthentication: false,
        retryable: false,
      });
      try {
        try {
          await verifyReauthenticationCode(expectedUserId, code);
        } catch (error) {
          setIfMounted({
            status: "awaiting_code",
            message:
              error instanceof Error
                ? error.message
                : "Le code de sécurité est invalide ou a expiré.",
            pendingExpectedUserId: view.pendingExpectedUserId,
            hasPendingOperation: view.hasPendingOperation,
            needsReauthentication: false,
            retryable: false,
          });
          return;
        }
        await createMobileAccountDeletionOperation(expectedUserId, {
          onCreated: () =>
            (input.analytics ?? noOpAnalytics).capture({
              name: "account_deletion_requested",
              platform: input.platform,
            }),
        });
        await completeResume();
      } catch (error) {
        await recoverFailure(error);
      } finally {
        inFlightRef.current = false;
      }
    },
    [
      completeResume,
      currentUserId,
      input.analytics,
      input.platform,
      recoverFailure,
      setIfMounted,
      verifyReauthenticationCode,
      view,
    ],
  );

  const pendingTargetsCurrentUser =
    view.pendingExpectedUserId !== null &&
    currentUserId === view.pendingExpectedUserId;
  const canReauthenticate =
    currentUserId !== null &&
    (view.pendingExpectedUserId === null || pendingTargetsCurrentUser);

  return {
    status: view.status,
    isBusy:
      view.status === "checking" ||
      view.status === "sending_code" ||
      view.status === "deleting",
    message: view.message,
    hasPendingOperation: view.hasPendingOperation,
    pendingTargetsCurrentUser,
    canReauthenticate,
    needsReauthentication: view.needsReauthentication,
    retryable: view.retryable,
    beginConfirmation,
    cancelConfirmation,
    requestReauthenticationCode,
    verifyCodeAndDelete,
    retry: resume,
  };
}
