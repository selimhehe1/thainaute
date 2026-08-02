"use client";

import { projectFixtureLearningPath } from "@thainaute/sync";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { WebLocalExperienceStore } from "@/lib/client/local-experience-store";

interface PathLesson {
  readonly versionId: string;
  readonly exerciseId: string;
  readonly title: string;
  readonly objective: string;
}

interface PathExperienceProps {
  readonly lesson: PathLesson;
}

type PathProjection = ReturnType<typeof projectFixtureLearningPath>;

interface PathPresentation {
  readonly statusLabel: string;
  readonly statusDescription: string;
  readonly actionLabel: string;
  readonly actionHref: "/today" | "/learn/demo";
}

function subscribeToNetworkStatus(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function presentationFor(projection: PathProjection): PathPresentation {
  switch (projection.status) {
    case "onboarding_required":
      return {
        statusLabel: "Préférences à choisir",
        statusDescription:
          "Le parcours local attend l’onboarding court avant d’ouvrir cette démonstration.",
        actionLabel: "Configurer ma session",
        actionHref: "/today",
      };
    case "available":
      return {
        statusLabel: "Prête à commencer",
        statusDescription:
          "La fixture est disponible sur cet appareil et aucune tentative n’est encore ouverte.",
        actionLabel: "Préparer la session",
        actionHref: "/today",
      };
    case "in_progress": {
      const statusLabel =
        projection.lessonPhase === "intro"
          ? "Présentation ouverte"
          : projection.lessonPhase === "question"
            ? "Exercice en cours"
            : "Tentative locale à finaliser";
      return {
        statusLabel,
        statusDescription:
          "Le checkpoint local permet de reprendre exactement cette étape technique.",
        actionLabel: "Reprendre la démonstration",
        actionHref: "/learn/demo",
      };
    }
    case "result_ready":
      return {
        statusLabel: "Résultat prêt à consulter",
        statusDescription:
          "La tentative est durable localement ; son résultat reste à afficher avant la clôture.",
        actionLabel: "Consulter le résultat",
        actionHref: "/learn/demo",
      };
    case "completed":
      return {
        statusLabel: "Étape technique terminée",
        statusDescription:
          "Cette validation locale est terminée. Elle ne constitue pas une maîtrise linguistique.",
        actionLabel: "Revoir la démonstration",
        actionHref: "/learn/demo",
      };
    case "version_conflict":
      return {
        statusLabel: "Version précédente détectée",
        statusDescription:
          "Un autre checkpoint est conservé. Il doit être traité explicitement sans être remplacé.",
        actionLabel: "Traiter la version précédente",
        actionHref: "/learn/demo",
      };
  }
}

export function PathExperience({ lesson }: PathExperienceProps) {
  const [snapshot, setSnapshot] = useState<Awaited<
    ReturnType<WebLocalExperienceStore["read"]>
  > | null>(null);
  const [storageStatus, setStorageStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [readRevision, setReadRevision] = useState(0);
  const requestRevisionRef = useRef(0);
  const errorHeadingRef = useRef<HTMLHeadingElement>(null);
  const online = useSyncExternalStore(
    subscribeToNetworkStatus,
    () => navigator.onLine,
    () => true,
  );

  const requestRead = useCallback(() => {
    // Invalide d'abord toute promesse en vol, avant le prochain rendu React.
    requestRevisionRef.current += 1;
    setSnapshot(null);
    setStorageStatus("loading");
    setReadRevision((current) => current + 1);
  }, []);

  useEffect(() => {
    const handleFocus = () => requestRead();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") requestRead();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [requestRead]);

  useEffect(() => {
    let active = true;
    const store = new WebLocalExperienceStore();
    const requestRevision = requestRevisionRef.current + 1;
    requestRevisionRef.current = requestRevision;

    void store
      .read()
      .then((current) => {
        if (!active || requestRevisionRef.current !== requestRevision) {
          return;
        }
        setSnapshot(current);
        setStorageStatus("ready");
      })
      .catch(() => {
        if (!active || requestRevisionRef.current !== requestRevision) {
          return;
        }
        setStorageStatus("error");
      });

    return () => {
      active = false;
      store.close();
    };
  }, [readRevision]);

  useEffect(() => {
    if (storageStatus === "error") errorHeadingRef.current?.focus();
  }, [storageStatus]);

  if (storageStatus === "error") {
    return (
      <section
        className="pathPanel pathNotice"
        aria-labelledby="path-error-title"
      >
        <p className="eyebrow">Stockage local indisponible</p>
        <h1 id="path-error-title" ref={errorHeadingRef} tabIndex={-1}>
          Votre parcours existant reste intact.
        </h1>
        <p className="pathLede">
          Thaïnaute n’écrase pas une progression illisible. Vérifiez que le
          stockage du navigateur est autorisé, puis réessayez.
        </p>
        <button
          className="button buttonPrimary pathPrimaryAction"
          type="button"
          onClick={requestRead}
        >
          Réessayer
        </button>
      </section>
    );
  }

  if (storageStatus === "loading" || snapshot === null) {
    return (
      <section
        className="pathPanel pathNotice"
        aria-busy="true"
        aria-live="polite"
        aria-labelledby="path-loading-title"
      >
        <p className="eyebrow">Parcours technique</p>
        <h1 id="path-loading-title">Lecture de votre progression locale…</h1>
        <p className="pathLede">
          Aucune donnée existante n’est modifiée pendant ce chargement.
        </p>
      </section>
    );
  }

  const projection = projectFixtureLearningPath(snapshot, {
    lessonVersionId: lesson.versionId,
    exerciseId: lesson.exerciseId,
  });
  const presentation = presentationFor(projection);

  return (
    <section className="pathPanel" aria-labelledby="path-title">
      <div className="networkStatus" aria-live="polite">
        <span
          className={online ? "statusDot online" : "statusDot"}
          aria-hidden="true"
        />
        {online
          ? "En ligne · progression locale chargée"
          : "Hors ligne · progression lue sur cet appareil"}
      </div>

      <div className="pathContent">
        <aside className="pathFixtureWarning" aria-label="Statut du contenu">
          <strong>DONNÉE FICTIVE · NON PUBLIABLE</strong>
          <span>Aucune valeur pédagogique ou linguistique.</span>
        </aside>

        <p className="eyebrow">Parcours technique local</p>
        <h1 id="path-title">Votre progression, sans faux contenu.</h1>
        <p className="pathLede">
          Cette carte rend visible une seule unité de test. Elle vérifie la
          reprise du produit, pas l’apprentissage du thaï.
        </p>

        <section className="pathProgress" aria-labelledby="path-progress-title">
          <div>
            <h2 id="path-progress-title">Progression de la fixture</h2>
            <span>{projection.progressPercent} %</span>
          </div>
          <progress
            aria-label="Progression de l’unité technique"
            max={100}
            value={projection.progressPercent}
          >
            {projection.progressPercent} %
          </progress>
          <p>
            Étapes techniques terminées : {projection.completedSteps} sur{" "}
            {projection.totalSteps}.
          </p>
        </section>

        <article className="pathUnit" aria-labelledby="path-unit-title">
          <div className="pathUnitHeading">
            <div>
              <span className="pathUnitIndex">
                Unité technique · prototype local
              </span>
              <h2 id="path-unit-title">{lesson.title}</h2>
            </div>
            <span
              className={`pathUnitStatus pathUnitStatus-${projection.status}`}
            >
              {presentation.statusLabel}
            </span>
          </div>
          <p className="pathUnitObjective">{lesson.objective}</p>
          <p className="pathUnitDescription">
            {presentation.statusDescription}
          </p>

          {!online && (
            <p className="offlineNote" role="status">
              La lecture de cet état fonctionne hors ligne. La démonstration
              suivante exige que ses ressources aient déjà été chargées.
            </p>
          )}

          <Link
            className="button buttonPrimary pathPrimaryAction"
            href={presentation.actionHref}
          >
            {presentation.actionLabel}
          </Link>
        </article>

        <section className="pathFuture" aria-labelledby="path-future-title">
          <span className="pathFutureStatus">Suite volontairement bloquée</span>
          <h2 id="path-future-title">
            Les prochaines unités ne sont pas inventées.
          </h2>
          <p>
            Le vrai parcours attend les décisions produit et pédagogiques, puis
            du contenu sourcé, audité et autorisé à la publication.
          </p>
        </section>
      </div>
    </section>
  );
}
