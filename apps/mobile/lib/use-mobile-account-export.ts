import { noOpAnalytics, type AnalyticsSink } from "@thainaute/analytics";
import {
  SyncHttpApiError,
  SyncHttpAuthenticationError,
  SyncHttpProtocolError,
  SyncHttpTransportError,
} from "@thainaute/sync";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import {
  MobileAccountExportError,
  prepareMobileAccountExportDelivery,
  purgeMobileAccountExportCache,
  requestMobileAccountExport,
  shareMobileAccountExport,
} from "./mobile-account-export";

export type MobileAccountExportStatus =
  "idle" | "preparing" | "success" | "error";

export interface MobileAccountExportState {
  readonly status: MobileAccountExportStatus;
  readonly isBusy: boolean;
  readonly message: string;
  readonly exportAccount: () => Promise<void>;
}

interface ExportViewState {
  readonly status: MobileAccountExportStatus;
  readonly message: string;
}

const IDLE_STATE: ExportViewState = { status: "idle", message: "" };
const PREPARING_STATE: ExportViewState = {
  status: "preparing",
  message: "Préparation sécurisée du fichier JSON…",
};
const SESSION_CHANGED_MESSAGE =
  "La session a changé. L’export en cours a été annulé ; aucune copie temporaire ne reste accessible dans l’application.";
const CLEANUP_FAILED_MESSAGE =
  "La copie temporaire de l’export n’a pas pu être supprimée du cache privé. L’export reste bloqué jusqu’à ce nettoyage.";

function errorMessage(error: unknown): string {
  if (error instanceof MobileAccountExportError) {
    switch (error.code) {
      case "cache_cleanup_failed":
        return CLEANUP_FAILED_MESSAGE;
      case "cache_write_failed":
        return "Le fichier temporaire n’a pas pu être créé. Aucune copie n’a été partagée.";
      case "session_changed":
        return SESSION_CHANGED_MESSAGE;
      case "sharing_failed":
        return "La feuille de partage n’a pas pu être ouverte. La copie temporaire a été supprimée.";
      case "sharing_unavailable":
        return "Le partage de fichiers n’est pas disponible sur cet appareil.";
    }
  }

  if (error instanceof SyncHttpAuthenticationError) {
    return "Votre session a expiré. Reconnectez-vous puis réessayez.";
  }
  if (error instanceof SyncHttpApiError) {
    switch (error.code) {
      case "unauthorized":
        return "Votre session a expiré. Reconnectez-vous puis réessayez.";
      case "concurrent_update":
        return "La progression change encore. Attendez la fin de la synchronisation puis réessayez.";
      case "export_capacity_exceeded":
        return "Ce compte contient trop de données pour l’export immédiat. Aucun fichier partiel n’a été créé.";
      default:
        return "L’export est momentanément indisponible. Vos données n’ont pas été modifiées.";
    }
  }
  if (
    error instanceof SyncHttpProtocolError ||
    error instanceof SyncHttpTransportError
  ) {
    return "L’export est momentanément indisponible. Aucun fichier n’a été créé.";
  }

  return "L’export n’a pas abouti. Aucun fichier n’a été créé.";
}

export function useMobileAccountExport(input: {
  readonly expectedUserId: string | null;
  readonly sessionBoundaryRevision: number;
  readonly platform: "ios" | "android";
  readonly analytics?: AnalyticsSink;
}): MobileAccountExportState {
  const [viewState, setViewState] = useState<ExportViewState>(IDLE_STATE);
  const controllerRef = useRef<AbortController | null>(null);
  const epochRef = useRef(0);
  const inFlightRef = useRef(false);

  useLayoutEffect(() => {
    const nextEpoch = epochRef.current + 1;
    epochRef.current = nextEpoch;
    const hadActiveExport = inFlightRef.current;
    inFlightRef.current = false;
    controllerRef.current?.abort();
    controllerRef.current = null;

    let boundaryMessage = hadActiveExport ? SESSION_CHANGED_MESSAGE : "";
    try {
      purgeMobileAccountExportCache();
    } catch {
      boundaryMessage = CLEANUP_FAILED_MESSAGE;
    }

    const timeout = setTimeout(() => {
      if (epochRef.current !== nextEpoch) return;
      setViewState(
        boundaryMessage === ""
          ? IDLE_STATE
          : { status: "error", message: boundaryMessage },
      );
    }, 0);
    return () => clearTimeout(timeout);
  }, [input.expectedUserId, input.sessionBoundaryRevision]);

  useLayoutEffect(() => {
    return () => {
      epochRef.current += 1;
      inFlightRef.current = false;
      controllerRef.current?.abort();
      controllerRef.current = null;
      try {
        purgeMobileAccountExportCache();
      } catch {
        // L’export suivant recommence par cette purge et reste fail-closed.
      }
    };
  }, []);

  const exportAccount = useCallback(async () => {
    const expectedUserId = input.expectedUserId?.toLowerCase() ?? null;
    if (expectedUserId === null || inFlightRef.current) return;

    try {
      (input.analytics ?? noOpAnalytics).capture({
        name: "account_export_requested",
        platform: input.platform,
      });
    } catch {
      // Une mesure non essentielle ne bloque jamais l’accès aux données.
    }

    const operationEpoch = epochRef.current + 1;
    epochRef.current = operationEpoch;
    const controller = new AbortController();
    controllerRef.current?.abort();
    controllerRef.current = controller;
    inFlightRef.current = true;
    setViewState(PREPARING_STATE);

    const isCurrent = () =>
      epochRef.current === operationEpoch &&
      controllerRef.current === controller &&
      !controller.signal.aborted;

    try {
      await prepareMobileAccountExportDelivery();
      if (!isCurrent()) return;

      const document = await requestMobileAccountExport({
        expectedUserId,
        signal: controller.signal,
      });
      if (!isCurrent()) return;

      await shareMobileAccountExport({
        document,
        signal: controller.signal,
      });
      if (!isCurrent()) return;

      setViewState({
        status: "success",
        message:
          "La feuille de partage a été refermée. La copie temporaire a été supprimée de l’application.",
      });
    } catch (error) {
      if (!isCurrent()) return;
      setViewState({ status: "error", message: errorMessage(error) });
    } finally {
      if (epochRef.current === operationEpoch) {
        inFlightRef.current = false;
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    }
  }, [input.analytics, input.expectedUserId, input.platform]);

  return {
    status: viewState.status,
    isBusy: viewState.status === "preparing",
    message: viewState.message,
    exportAccount,
  };
}
