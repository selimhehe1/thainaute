"use client";

import {
  CONTENT_REPORT_CATEGORIES,
  countPendingContentReports,
  type ContentReportCategory,
  type ContentReportOutboxRejection,
} from "@thainaute/sync";
import { buttonClass } from "@/components/ui/button";
import lessonStyles from "./lesson.module.css";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { useWebAuthSession } from "@/lib/client/auth-session";
import {
  discardRejectedWebContentReport,
  readWebContentReports,
  submitWebContentReport,
  synchronizeWebContentReports,
} from "@/lib/client/content-report";
import type { AnalyticsSink } from "@thainaute/analytics";

const CATEGORY_LABELS: Readonly<Record<ContentReportCategory, string>> = {
  orthography: "Orthographe",
  meaning: "Sens ou traduction",
  pronunciation: "Prononciation",
  tone: "Ton",
  vowel_length: "Longueur vocalique",
  register: "Registre",
  naturalness: "Naturalité",
  audio: "Audio",
};

type ReportStatus =
  "idle" | "loading" | "submitting" | "queued" | "rejected" | "sent" | "error";

function rejectedMessage(rejection: ContentReportOutboxRejection): string {
  return rejection.reason === "invalid_request"
    ? "Ce signalement a été refusé définitivement : le contenu ou sa version n’est plus accepté. Il reste conservé jusqu’à votre retrait explicite."
    : "Ce signalement a été refusé définitivement à cause d’un conflit de reprise. Il reste conservé jusqu’à votre retrait explicite.";
}

function captureReported(analytics: AnalyticsSink, count = 1): void {
  try {
    for (let index = 0; index < count; index += 1) {
      analytics.capture({ name: "content_reported", platform: "web" });
    }
  } catch {
    // La mesure consentie reste facultative et ne bloque jamais l'acquittement.
  }
}

export function ContentReportPanel({
  analytics,
  contentVersionId,
  exerciseId,
  online,
}: {
  readonly analytics: AnalyticsSink;
  readonly contentVersionId: string;
  readonly exerciseId: string;
  readonly online: boolean;
}) {
  const auth = useWebAuthSession();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ContentReportCategory | "">("");
  const [status, setStatus] = useState<ReportStatus>("idle");
  const [message, setMessage] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedHead, setRejectedHead] =
    useState<ContentReportOutboxRejection | null>(null);
  const operationRevision = useRef(0);
  const userId =
    auth.status === "signed_in" ? (auth.session?.user.id ?? null) : null;

  useEffect(() => {
    operationRevision.current += 1;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setOpen(false);
      setCategory("");
      setMessage("");
      setPendingCount(0);
      setRejectedHead(null);
      setStatus("idle");
    });
    return () => {
      active = false;
    };
  }, [auth.sessionBoundaryRevision, userId]);

  useEffect(() => {
    if (userId === null) return;
    const expectedUserId = userId;
    let active = true;
    const revision = operationRevision.current;

    async function resumeDurableReports(): Promise<void> {
      setStatus("loading");
      try {
        const persisted = await readWebContentReports(expectedUserId);
        if (!active || revision !== operationRevision.current) return;
        setPendingCount(countPendingContentReports(persisted));
        setRejectedHead(persisted.rejection);
        if (persisted.entries.length === 0) {
          setStatus("idle");
          return;
        }
        if (persisted.rejection !== null) {
          setStatus("rejected");
          setMessage(rejectedMessage(persisted.rejection));
          return;
        }
        if (!online) {
          setStatus("queued");
          setMessage(
            `${persisted.entries.length} signalement${persisted.entries.length > 1 ? "s" : ""} conservé${persisted.entries.length > 1 ? "s" : ""} hors ligne.`,
          );
          return;
        }

        const synchronized = await synchronizeWebContentReports(expectedUserId);
        if (!active || revision !== operationRevision.current) return;
        setPendingCount(synchronized.pendingCount);
        setRejectedHead(synchronized.rejectedHead);
        captureReported(
          analytics,
          synchronized.acknowledgedIdempotencyKeys.length,
        );
        if (synchronized.rejectedHead !== null) {
          setStatus("rejected");
          setMessage(rejectedMessage(synchronized.rejectedHead));
        } else {
          setStatus(synchronized.pendingCount === 0 ? "sent" : "queued");
          setMessage(
            synchronized.pendingCount === 0
              ? "Les signalements en attente ont été envoyés. Merci."
              : "Certains signalements restent conservés sur cet appareil.",
          );
        }
      } catch {
        if (!active || revision !== operationRevision.current) return;
        setStatus("error");
        setMessage(
          "Les signalements conservés n’ont pas encore pu être envoyés. Réessayez sans les ressaisir.",
        );
      }
    }

    void resumeDurableReports();
    return () => {
      active = false;
    };
  }, [analytics, auth.sessionBoundaryRevision, online, userId]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (userId === null || category === "") return;
    const revision = ++operationRevision.current;
    setStatus("submitting");
    setMessage(online ? "Envoi du signalement…" : "Conservation hors ligne…");
    try {
      const result = await submitWebContentReport({
        expectedUserId: userId,
        body: {
          contentVersionId,
          exerciseId,
          category,
          platform: "web",
        },
        online,
      });
      if (revision !== operationRevision.current) return;
      setPendingCount(result.pendingCount);
      if (result.status === "sent") {
        setRejectedHead(null);
        captureReported(analytics);
        setStatus("sent");
        setMessage("Signalement envoyé. Merci d’aider à améliorer Thaïnaute.");
        setCategory("");
      } else if (result.status === "rejected") {
        setRejectedHead(result.rejectedHead);
        setStatus("rejected");
        setMessage(rejectedMessage(result.rejectedHead));
      } else if (result.reason === "offline") {
        setRejectedHead(null);
        setStatus("queued");
        setMessage(
          "Signalement conservé hors ligne. Il sera renvoyé avec ce compte après reconnexion.",
        );
      } else {
        if (result.reason === "blocked_by_rejected") {
          setRejectedHead(result.rejectedHead);
          setStatus("rejected");
          setMessage(rejectedMessage(result.rejectedHead));
        } else {
          setRejectedHead(null);
          setStatus("error");
          setMessage(
            "Signalement conservé, mais l’envoi a échoué. Réessayez sans le ressaisir.",
          );
        }
      }
    } catch {
      if (revision !== operationRevision.current) return;
      setStatus("error");
      setMessage(
        "Le signalement n’a pas pu être conservé. Vérifiez la session et réessayez.",
      );
    }
  }

  async function retry(): Promise<void> {
    if (userId === null || !online) return;
    const revision = ++operationRevision.current;
    setStatus("loading");
    setMessage("Nouvelle tentative d’envoi…");
    try {
      const synchronized = await synchronizeWebContentReports(userId);
      if (revision !== operationRevision.current) return;
      setPendingCount(synchronized.pendingCount);
      setRejectedHead(synchronized.rejectedHead);
      captureReported(
        analytics,
        synchronized.acknowledgedIdempotencyKeys.length,
      );
      if (synchronized.rejectedHead !== null) {
        setStatus("rejected");
        setMessage(rejectedMessage(synchronized.rejectedHead));
      } else {
        setStatus(synchronized.pendingCount === 0 ? "sent" : "queued");
        setMessage(
          synchronized.pendingCount === 0
            ? "Signalement envoyé. Merci d’aider à améliorer Thaïnaute."
            : "Des signalements restent conservés sur cet appareil.",
        );
      }
    } catch {
      if (revision !== operationRevision.current) return;
      setStatus("error");
      setMessage(
        "L’envoi n’a pas abouti. Le signalement reste conservé sur cet appareil.",
      );
    }
  }

  async function discardRejected(): Promise<void> {
    if (userId === null || rejectedHead === null) return;
    const revision = ++operationRevision.current;
    setStatus("loading");
    setMessage("Retrait explicite du signalement refusé…");
    try {
      const synchronized = await discardRejectedWebContentReport({
        expectedUserId: userId,
        rejection: rejectedHead,
        online,
      });
      if (revision !== operationRevision.current) return;
      setPendingCount(synchronized.pendingCount);
      setRejectedHead(synchronized.rejectedHead);
      captureReported(
        analytics,
        synchronized.acknowledgedIdempotencyKeys.length,
      );
      if (synchronized.rejectedHead !== null) {
        setStatus("rejected");
        setMessage(rejectedMessage(synchronized.rejectedHead));
      } else {
        setStatus(synchronized.pendingCount === 0 ? "sent" : "queued");
        setMessage(
          synchronized.pendingCount === 0
            ? "Le signalement refusé a été retiré. La file est à jour."
            : "Le signalement refusé a été retiré. Les suivants restent conservés pour une prochaine tentative.",
        );
      }
    } catch {
      if (revision !== operationRevision.current) return;
      setStatus("rejected");
      setMessage(
        "Le retrait n’a pas abouti. Le signalement refusé reste conservé sans modification.",
      );
    }
  }

  const busy = status === "loading" || status === "submitting";

  return (
    <section className="contentReport" aria-label="Signalement linguistique">
      <button
        className={buttonClass("ghost")}
        type="button"
        aria-expanded={open}
        aria-controls="content-report-panel"
        onClick={() => setOpen((current) => !current)}
      >
        Signaler une erreur
      </button>

      {open && (
        <div className="contentReportPanel" id="content-report-panel">
          <h2 id="content-report-title">Quel type d’erreur avez-vous vu ?</h2>
          <p>
            Choisissez une catégorie. Aucun texte libre, réponse ou audio n’est
            joint au signalement.
          </p>

          {userId === null ? (
            <div className="contentReportSignedOut">
              <p role="status">
                Connectez un compte permanent pour conserver et suivre ce
                signalement sur le bon contenu.
              </p>
              <Link className={buttonClass("ghost")} href="/account">
                Me connecter
              </Link>
            </div>
          ) : (
            <form className="contentReportForm" onSubmit={submit}>
              <label htmlFor="content-report-category">Catégorie</label>
              <select
                id="content-report-category"
                required
                value={category}
                disabled={status === "submitting" || status === "loading"}
                onChange={(event) =>
                  setCategory(event.target.value as ContentReportCategory | "")
                }
              >
                <option value="">Choisir une catégorie</option>
                {CONTENT_REPORT_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
              <button
                className={buttonClass("ghost")}
                type="submit"
                aria-busy={status === "submitting"}
                disabled={
                  category === "" ||
                  status === "submitting" ||
                  status === "loading"
                }
              >
                {status === "submitting"
                  ? online
                    ? "Envoi…"
                    : "Conservation…"
                  : online
                    ? "Envoyer le signalement"
                    : "Conserver le signalement"}
              </button>
            </form>
          )}

          {message !== "" && (
            <p
              className={
                status === "error"
                  ? lessonStyles.inlineError
                  : lessonStyles.note
              }
              role={
                status === "error" || status === "rejected" ? "alert" : "status"
              }
            >
              {message}
              {rejectedHead !== null && pendingCount > 0
                ? ` ${pendingCount} autre${pendingCount > 1 ? "s" : ""} attend${pendingCount > 1 ? "ent" : ""} derrière ce refus.`
                : rejectedHead === null && pendingCount > 0
                  ? ` ${pendingCount} en attente sur cet appareil.`
                  : ""}
            </p>
          )}
          {userId !== null && rejectedHead !== null && !busy && (
            <button
              className={buttonClass("ghost")}
              type="button"
              onClick={() => void discardRejected()}
            >
              Retirer le signalement refusé et reprendre
            </button>
          )}
          {userId !== null &&
            pendingCount > 0 &&
            rejectedHead === null &&
            online &&
            status !== "loading" &&
            status !== "submitting" && (
              <button
                className={buttonClass("ghost")}
                type="button"
                onClick={() => void retry()}
              >
                Réessayer l’envoi
              </button>
            )}
        </div>
      )}
    </section>
  );
}
