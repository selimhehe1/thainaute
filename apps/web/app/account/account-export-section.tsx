"use client";

import { noOpAnalytics, type AnalyticsSink } from "@thainaute/analytics";
import { buttonClass } from "@/components/ui/button";
import styles from "./account.module.css";
import {
  SyncHttpApiError,
  SyncHttpAuthenticationError,
  SyncHttpProtocolError,
} from "@thainaute/sync";
import { useLayoutEffect, useRef, useState } from "react";

import {
  deliverWebAccountExport,
  requestWebAccountExport,
} from "@/lib/client/account-export";

interface AccountExportSectionProps {
  readonly expectedUserId: string;
  readonly sessionBoundaryRevision: number;
  readonly pendingAttemptCount: number;
  readonly anonymousAttemptCount: number;
  readonly fusionPending: boolean;
  readonly analytics?: AnalyticsSink;
}

type ExportState =
  | { readonly phase: "idle"; readonly message: "" }
  | { readonly phase: "loading"; readonly message: string }
  | { readonly phase: "success" | "error"; readonly message: string };

function exportFailureMessage(error: unknown): string {
  if (
    error instanceof SyncHttpAuthenticationError ||
    (error instanceof SyncHttpApiError && error.code === "unauthorized")
  ) {
    return "Votre session a expiré. Reconnectez-vous puis réessayez.";
  }
  if (error instanceof SyncHttpProtocolError) {
    return "L’export reçu est invalide. Aucun fichier n’a été créé.";
  }
  if (error instanceof SyncHttpApiError) {
    if (error.code === "export_capacity_exceeded") {
      return "Cet export dépasse la capacité actuelle. Vos données n’ont pas été modifiées.";
    }
    if (error.code === "concurrent_update") {
      return "Vos données ont changé pendant l’export. Réessayez dans un instant.";
    }
  }
  return "L’export est momentanément indisponible. Vos données n’ont pas été modifiées.";
}

export function AccountExportSection({
  expectedUserId,
  sessionBoundaryRevision,
  pendingAttemptCount,
  anonymousAttemptCount,
  fusionPending,
  analytics = noOpAnalytics,
}: AccountExportSectionProps) {
  const subjectKey = `${expectedUserId.toLowerCase()}:${sessionBoundaryRevision}`;
  const subjectKeyRef = useRef(subjectKey);
  const epochRef = useRef(0);
  const operationRef = useRef<
    { readonly controller: AbortController; readonly epoch: number } | undefined
  >(undefined);
  const [exportState, setExportState] = useState<ExportState>({
    phase: "idle",
    message: "",
  });

  useLayoutEffect(() => {
    if (subjectKeyRef.current === subjectKey) return;
    subjectKeyRef.current = subjectKey;
    epochRef.current += 1;
    const boundaryEpoch = epochRef.current;
    const operation = operationRef.current;
    operationRef.current = undefined;
    operation?.controller.abort();

    let active = true;
    queueMicrotask(() => {
      if (
        !active ||
        subjectKeyRef.current !== subjectKey ||
        epochRef.current !== boundaryEpoch
      ) {
        return;
      }
      setExportState(
        operation === undefined
          ? { phase: "idle", message: "" }
          : {
              phase: "error",
              message: "Votre session a changé. Aucun fichier n’a été créé.",
            },
      );
    });
    return () => {
      active = false;
    };
  }, [subjectKey]);

  useLayoutEffect(
    () => () => {
      epochRef.current += 1;
      operationRef.current?.controller.abort();
      operationRef.current = undefined;
    },
    [],
  );

  async function exportAccount() {
    try {
      analytics.capture({
        name: "account_export_requested",
        platform: "web",
      });
    } catch {
      // Une mesure non essentielle ne bloque jamais l’accès aux données.
    }
    const controller = new AbortController();
    const epoch = epochRef.current + 1;
    epochRef.current = epoch;
    operationRef.current?.controller.abort();
    operationRef.current = { controller, epoch };
    const startingSubjectKey = subjectKeyRef.current;
    setExportState({
      phase: "loading",
      message: "Préparation du fichier…",
    });

    try {
      const exportDocument = await requestWebAccountExport({
        expectedUserId,
        signal: controller.signal,
      });
      if (
        controller.signal.aborted ||
        epochRef.current !== epoch ||
        subjectKeyRef.current !== startingSubjectKey
      ) {
        return;
      }
      deliverWebAccountExport(exportDocument);
      if (epochRef.current !== epoch) return;
      setExportState({
        phase: "success",
        message: "Le téléchargement de votre export JSON a été lancé.",
      });
    } catch (error) {
      if (epochRef.current !== epoch) return;
      setExportState({
        phase: "error",
        message: controller.signal.aborted
          ? "Votre session a changé. Aucun fichier n’a été créé."
          : exportFailureMessage(error),
      });
    } finally {
      if (operationRef.current?.epoch === epoch) {
        operationRef.current = undefined;
      }
    }
  }

  const isLoading = exportState.phase === "loading";
  const hasLocalWarnings =
    pendingAttemptCount > 0 || anonymousAttemptCount > 0 || fusionPending;

  return (
    <section
      aria-busy={isLoading}
      aria-labelledby="account-export-title"
      className={styles.subPanel}
    >
      <h2 id="account-export-title">Exporter les données de mon compte</h2>
      <p>
        Téléchargez une copie JSON des données enregistrées pour votre compte en
        ligne : identité, appareils, tentatives, progression synchronisée et
        signalements linguistiques déjà reçus.
      </p>
      <p>
        Les tentatives ou signalements encore locaux, la progression anonyme et
        vos prises de voix ne sont pas inclus. Les voix restent uniquement sur
        cet appareil.
      </p>
      <p className={styles.message} id="account-export-personal-warning">
        Ce fichier peut contenir des données personnelles. Conservez-le dans un
        emplacement sûr.
      </p>

      {hasLocalWarnings && (
        <ul className={styles.warnings}>
          {pendingAttemptCount > 0 && (
            <li>
              {pendingAttemptCount} tentative
              {pendingAttemptCount > 1 ? "s" : ""} de ce compte encore locale
              {pendingAttemptCount > 1 ? "s" : ""}{" "}
              {pendingAttemptCount > 1 ? "ne figureront" : "ne figurera"} dans
              l’export qu’après synchronisation.
            </li>
          )}
          {anonymousAttemptCount > 0 && (
            <li>
              La progression anonyme locale n’appartient pas encore au compte et
              sera exclue.
            </li>
          )}
          {fusionPending && (
            <li>
              Terminez la fusion et la synchronisation pour obtenir une copie
              complète des données serveur.
            </li>
          )}
        </ul>
      )}

      <button
        aria-busy={isLoading}
        aria-describedby="account-export-personal-warning"
        className={buttonClass("ghost")}
        disabled={isLoading}
        onClick={() => void exportAccount()}
        type="button"
      >
        {isLoading ? "Préparation du fichier…" : "Télécharger mon export JSON"}
      </button>
      {exportState.message !== "" && (
        <output
          aria-atomic="true"
          className={
            exportState.phase === "error"
              ? "accountExportStatus inlineError"
              : "accountExportStatus"
          }
        >
          {exportState.message}
        </output>
      )}
    </section>
  );
}
