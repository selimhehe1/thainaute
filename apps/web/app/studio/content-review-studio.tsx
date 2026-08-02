"use client";

import type { ContentReviewResponse } from "@thainaute/content/studio";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  ContentStudioClientError,
  requestFixtureContentReview,
} from "@/lib/client/content-studio";
import { useWebAuthSession } from "@/lib/client/auth-session";

const AUDIT_LABELS = {
  orthography: "Orthographe",
  meaning: "Sens",
  pronunciation: "Prononciation",
  tone: "Ton",
  vowel_length: "Longueur vocalique",
  register: "Registre",
  naturalness: "Naturalité",
} as const;

const AUDIT_STATUS_LABELS = {
  pending: "À contrôler",
  passed: "Validé",
  failed: "Échec",
  conflict: "Conflit",
} as const;

const SOURCE_KIND_LABELS = {
  synthetic_fixture: "Fixture synthétique",
  official: "Source officielle",
  academic: "Publication universitaire",
  licensed_corpus: "Corpus licencié",
} as const;

const CONFIDENCE_LABELS = {
  low: "faible",
  medium: "moyenne",
  high: "élevée",
} as const;

function clientErrorMessage(error: unknown): string {
  if (error instanceof ContentStudioClientError) {
    if (error.kind === "session_expired") {
      return "La session a expiré. Reconnectez-vous avant de relancer la revue.";
    }
    if (error.kind === "access_denied") {
      return "Le studio n’est pas disponible pour ce compte.";
    }
  }
  return "La revue est indisponible. Aucun contenu n’a été modifié.";
}

function BooleanGate({ value }: Readonly<{ value: boolean }>) {
  return (
    <span className={value ? "studioGate studioGatePass" : "studioGate"}>
      {value ? "oui" : "non"}
    </span>
  );
}

function TruncationNotice({
  label,
  shown,
  total,
  truncated,
}: Readonly<{
  label: string;
  shown: number;
  total: number;
  truncated: boolean;
}>) {
  if (!truncated) return null;
  return (
    <p className="studioTruncationNote">
      Affichage limité à {shown} {label} sur {total}.
    </p>
  );
}

function StudioReport({ report }: Readonly<{ report: ContentReviewResponse }>) {
  const summary = report.summary;
  if (summary === null) {
    return (
      <section className="studioReport" aria-labelledby="studio-result-title">
        <p className="studioVerdict studioVerdictBlocked">Schéma refusé</p>
        <h2 id="studio-result-title" tabIndex={-1}>
          Le document ne peut pas être contrôlé.
        </h2>
        <ul className="studioIssueList">
          {report.issues.map((issue, index) => (
            <li key={`${issue.code}-${index}`}>
              <strong>{issue.path.join(" › ") || "document"}</strong>
              <span>{issue.message}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="studioReport" aria-labelledby="studio-result-title">
      <p
        className={
          report.publishable
            ? "studioVerdict studioVerdictPass"
            : "studioVerdict studioVerdictBlocked"
        }
      >
        {report.publishable ? "Préflight sans blocage" : "Publication refusée"}
      </p>
      <h2 id="studio-result-title" tabIndex={-1}>
        {summary.lesson.titleFr}
      </h2>
      <p className="studioSafetyNote">
        Rapport seulement : aucune écriture, aucune release et aucune
        publication n’ont été effectuées.
      </p>

      <dl className="studioMetrics">
        <div>
          <dt>Workflow</dt>
          <dd>{summary.lesson.workflowStatus}</dd>
        </div>
        <div>
          <dt>Visibilité</dt>
          <dd>{summary.lesson.visibility}</dd>
        </div>
        <div>
          <dt>Audits validés</dt>
          <dd>
            {summary.audits.passed}/{summary.audits.total}
          </dd>
        </div>
        <div>
          <dt>Findings bloquants</dt>
          <dd>{summary.findings.openBlocking}</dd>
        </div>
      </dl>

      <section
        className="studioSection"
        aria-labelledby="studio-blockers-title"
      >
        <h3 id="studio-blockers-title">Portes de publication</h3>
        {report.blockers.length === 0 ? (
          <p>Aucune cause de refus détectée par le préflight.</p>
        ) : (
          <ol className="studioBlockerList">
            {report.blockers.map((blocker) => (
              <li key={blocker.code}>
                <code>{blocker.code}</code>
                <span>{blocker.detail}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="studioSection" aria-labelledby="studio-audits-title">
        <h3 id="studio-audits-title">Sept contrôles linguistiques</h3>
        <ul className="studioAuditGrid">
          {summary.audits.entries.map((audit) => (
            <li key={audit.dimension}>
              <span>{AUDIT_LABELS[audit.dimension]}</span>
              <strong
                className={`studioAuditStatus studioAuditStatus-${audit.status}`}
              >
                {AUDIT_STATUS_LABELS[audit.status]}
              </strong>
              <small>
                Auditeur {audit.auditorKind === "human" ? "humain" : "IA"}
              </small>
            </li>
          ))}
        </ul>
      </section>

      <section className="studioSection" aria-labelledby="studio-sources-title">
        <h3 id="studio-sources-title">Sources et droits</h3>
        <TruncationNotice
          label="sources"
          shown={summary.sources.entries.length}
          total={summary.sources.total}
          truncated={summary.sources.truncated}
        />
        <div
          aria-label="Tableau des sources et droits"
          className="studioTableScroll"
          role="region"
          tabIndex={0}
        >
          <table className="studioTable">
            <thead>
              <tr>
                <th scope="col">Source</th>
                <th scope="col">Licence</th>
                <th scope="col">Commercial</th>
                <th scope="col">Redistribution</th>
                <th scope="col">Autorisation</th>
              </tr>
            </thead>
            <tbody>
              {summary.sources.entries.map((source) => (
                <tr key={source.sourceId}>
                  <th scope="row">
                    {source.label}
                    <small>{SOURCE_KIND_LABELS[source.kind]}</small>
                    <small>
                      Confiance {CONFIDENCE_LABELS[source.confidence]} ·
                      consultée le {source.consultedAt.slice(0, 10)}
                    </small>
                  </th>
                  <td>
                    {source.license}
                    <small>{source.versionSource}</small>
                  </td>
                  <td>
                    <BooleanGate value={source.commercialUse} />
                  </td>
                  <td>
                    <BooleanGate value={source.redistribution} />
                  </td>
                  <td>
                    <BooleanGate value={source.publicationAuthorized} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="studioSection" aria-labelledby="studio-unicode-title">
        <h3 id="studio-unicode-title">Unicode thaï</h3>
        <TruncationNotice
          label="éléments"
          shown={summary.items.entries.length}
          total={summary.items.total}
          truncated={summary.items.truncated}
        />
        <ul className="studioUnicodeList">
          {summary.items.entries.map((item) => (
            <li key={item.itemId}>
              <span className="studioThai" lang="th">
                {item.thaiRaw}
              </span>
              <code>{item.actualCodePoints.join(" ")}</code>
              <strong>{item.exactMatch ? "Exact" : "Altéré"}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="studioSection"
        aria-labelledby="studio-findings-title"
      >
        <h3 id="studio-findings-title">Findings</h3>
        <TruncationNotice
          label="findings"
          shown={summary.findings.entries.length}
          total={summary.findings.total}
          truncated={summary.findings.truncated}
        />
        {summary.findings.entries.length === 0 ? (
          <p>Aucun finding enregistré.</p>
        ) : (
          <ul className="studioFindingList">
            {summary.findings.entries.map((finding) => (
              <li key={finding.code}>
                <code>{finding.code}</code>
                <span>
                  {finding.status === "open" ? "Ouvert" : "Résolu"}
                  {finding.blocking ? " · bloquant" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="studioSection" aria-labelledby="studio-audio-title">
        <h3 id="studio-audio-title">Audio</h3>
        <TruncationNotice
          label="assets audio détaillés"
          shown={summary.audio.entries.length}
          total={summary.audio.total}
          truncated={summary.audio.truncated}
        />
        <p>
          {summary.audio.total} asset(s), {summary.audio.nativeHuman} voix
          humaine(s), {summary.audio.missingConsent} consentement(s)
          manquant(s).
        </p>
      </section>
    </section>
  );
}

export function ContentReviewStudio() {
  const auth = useWebAuthSession();
  const [online, setOnline] = useState(true);
  const [busySubjectId, setBusySubjectId] = useState<string | null>(null);
  const [ownedMessage, setOwnedMessage] = useState<{
    readonly subjectId: string;
    readonly text: string;
  } | null>(null);
  const [ownedReport, setOwnedReport] = useState<{
    readonly subjectId: string;
    readonly report: ContentReviewResponse;
  } | null>(null);
  const [reportRevision, setReportRevision] = useState(0);
  const activeRequest = useRef<{
    readonly controller: AbortController;
    readonly subjectId: string;
  } | null>(null);
  const activeSubjectId = useRef<string | null>(null);
  const previousSessionBoundaryRevision = useRef(auth.sessionBoundaryRevision);
  const resultContainer = useRef<HTMLDivElement | null>(null);
  const sessionFocusTarget = useRef<HTMLHeadingElement | null>(null);
  const currentSubjectId =
    auth.status === "signed_in"
      ? (auth.session?.user.id.toLowerCase() ?? null)
      : null;
  const previousSubjectId = useRef(currentSubjectId);
  const busy = currentSubjectId !== null && busySubjectId === currentSubjectId;
  const message =
    ownedMessage?.subjectId === currentSubjectId ? ownedMessage.text : "";
  const report =
    ownedReport?.subjectId === currentSubjectId ? ownedReport.report : null;

  useLayoutEffect(() => {
    activeSubjectId.current = currentSubjectId;
  }, [currentSubjectId]);

  useEffect(() => {
    const update = () => {
      const nextOnline = window.navigator.onLine;
      setOnline(nextOnline);
      if (!nextOnline) activeRequest.current?.controller.abort();
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const boundaryChanged =
      previousSessionBoundaryRevision.current !== auth.sessionBoundaryRevision;
    const subjectChanged = previousSubjectId.current !== currentSubjectId;
    previousSessionBoundaryRevision.current = auth.sessionBoundaryRevision;
    previousSubjectId.current = currentSubjectId;
    if (!boundaryChanged && !subjectChanged) return;
    activeRequest.current?.controller.abort();
    activeRequest.current = null;
    queueMicrotask(() => {
      if (!active) return;
      setBusySubjectId(null);
      setOwnedReport(null);
      setOwnedMessage(
        boundaryChanged && currentSubjectId !== null
          ? {
              subjectId: currentSubjectId,
              text: "Session changée. Lancez une nouvelle revue pour ce compte.",
            }
          : null,
      );
      if (boundaryChanged) sessionFocusTarget.current?.focus();
    });
    return () => {
      active = false;
    };
  }, [auth.sessionBoundaryRevision, currentSubjectId]);

  useEffect(
    () => () => {
      activeRequest.current?.controller.abort();
    },
    [],
  );

  useLayoutEffect(() => {
    if (report === null) return;
    resultContainer.current
      ?.querySelector<HTMLElement>("#studio-result-title")
      ?.focus();
  }, [report, reportRevision]);

  const reviewFixture = useCallback(async () => {
    const accessToken = auth.session?.access_token;
    const expectedSubjectId = currentSubjectId;
    if (
      accessToken === undefined ||
      expectedSubjectId === null ||
      busy ||
      !online
    ) {
      return;
    }

    const controller = new AbortController();
    const request = { controller, subjectId: expectedSubjectId };
    activeRequest.current?.controller.abort();
    activeRequest.current = request;
    setBusySubjectId(expectedSubjectId);
    setOwnedMessage(null);
    setOwnedReport(null);

    try {
      const nextReport = await requestFixtureContentReview({
        accessToken,
        signal: controller.signal,
      });
      if (
        activeRequest.current !== request ||
        activeSubjectId.current !== expectedSubjectId ||
        controller.signal.aborted
      ) {
        return;
      }
      setOwnedReport({ subjectId: expectedSubjectId, report: nextReport });
      setOwnedMessage({
        subjectId: expectedSubjectId,
        text: nextReport.publishable
          ? "Préflight terminé. Aucune publication n’a été effectuée."
          : `${nextReport.blockers.length} cause(s) bloquent la publication.`,
      });
      setReportRevision((revision) => revision + 1);
    } catch (error) {
      if (
        activeRequest.current !== request ||
        activeSubjectId.current !== expectedSubjectId ||
        controller.signal.aborted
      ) {
        return;
      }
      setOwnedMessage({
        subjectId: expectedSubjectId,
        text: clientErrorMessage(error),
      });
    } finally {
      if (activeRequest.current === request) {
        activeRequest.current = null;
        setBusySubjectId(null);
      }
    }
  }, [auth.session?.access_token, busy, currentSubjectId, online]);

  if (auth.status === "loading") {
    return <p aria-live="polite">Vérification de l’accès au studio…</p>;
  }

  if (auth.status === "unconfigured") {
    return (
      <section className="studioNotice" role="status">
        <h1 ref={sessionFocusTarget} tabIndex={-1}>
          Studio indisponible.
        </h1>
        <p>Auth n’est pas configuré sur cet environnement.</p>
      </section>
    );
  }

  if (auth.status === "signed_out") {
    return (
      <section className="studioNotice">
        <p className="eyebrow">Surface privée</p>
        <h1 ref={sessionFocusTarget} tabIndex={-1}>
          Connectez un compte autorisé.
        </h1>
        <p>
          Le studio ne révèle aucun dossier avant la vérification serveur du
          rôle éditorial.
        </p>
        <Link className="button buttonPrimary" href="/account">
          Ouvrir le compte
        </Link>
      </section>
    );
  }

  return (
    <div className="studioPanel">
      <p className="eyebrow">Prépublication · fixture uniquement</p>
      <h1 ref={sessionFocusTarget} tabIndex={-1}>
        Voir chaque porte avant toute publication.
      </h1>
      <p className="studioLede">
        Le serveur relit la fixture technique versionnée et produit un rapport
        sans enregistrer, corriger ou publier quoi que ce soit.
      </p>
      <aside className="fixtureBanner studioFixtureBanner" role="note">
        <strong>Contenu technique non pédagogique</strong>
        <span>
          Aucun vrai mot, aucune source autorisée et aucun audit validé ne sont
          ajoutés.
        </span>
      </aside>

      {!online && (
        <p className="offlineNote" role="status">
          Le studio exige une vérification Auth en ligne. La revue pourra être
          relancée après la reconnexion.
        </p>
      )}

      <button
        className="button buttonPrimary studioPrimaryAction"
        disabled={busy || !online}
        type="button"
        onClick={() => void reviewFixture()}
      >
        {busy ? "Vérification…" : "Vérifier la publication"}
      </button>

      <p className="studioStatus" aria-live="polite">
        {message}
      </p>
      {report !== null && (
        <div ref={resultContainer}>
          <StudioReport report={report} />
        </div>
      )}
    </div>
  );
}
