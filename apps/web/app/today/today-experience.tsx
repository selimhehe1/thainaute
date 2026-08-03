"use client";

import type { AnalyticsSink } from "@thainaute/analytics";
import {
  beginLocalOnboarding,
  completeLocalOnboarding,
  updateLocalOnboarding,
  type LocalExperienceSnapshot,
  type LocalOnboardingSelection,
} from "@thainaute/sync";
import Link from "next/link";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";

import {
  LocalExperienceStorageError,
  WebLocalExperienceStore,
} from "@/lib/client/local-experience-store";
import { useWebAnalyticsConsent } from "@/lib/client/analytics-consent";
import { ToneCurve } from "@/components/brand/tone-curve";
import { buttonClass } from "@/components/ui/button";

import styles from "./today.module.css";

interface TodayLesson {
  readonly versionId: string;
  readonly exerciseId: string;
  readonly title: string;
  readonly objective: string;
}

interface TodayExperienceProps {
  readonly lesson: TodayLesson;
  readonly analytics?: AnalyticsSink;
}

const GOAL_OPTIONS = [
  { id: "five_minutes", label: "5 minutes" },
  { id: "ten_minutes", label: "10 minutes" },
] as const;
const MOTIVATION_OPTIONS = [
  { id: "travel", label: "Préparer un séjour" },
  { id: "close_relationships", label: "Échanger avec mes proches" },
  { id: "daily_life", label: "Communiquer au quotidien" },
] as const;
const EXPERIENCE_OPTIONS = [
  { id: "beginner", label: "Je débute" },
  { id: "some_basics", label: "J’ai quelques bases" },
  { id: "returning", label: "Je reprends après une pause" },
] as const;

type GoalOptionId = (typeof GOAL_OPTIONS)[number]["id"];
type MotivationOptionId = (typeof MOTIVATION_OPTIONS)[number]["id"];
type ExperienceOptionId = (typeof EXPERIENCE_OPTIONS)[number]["id"];

function knownOptionId<Options extends readonly { readonly id: string }[]>(
  options: Options,
  optionId: string | null,
): Options[number]["id"] | null {
  return options.find(({ id }) => id === optionId)?.id ?? null;
}

function subscribeToNetworkStatus(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function captureSafely(
  analytics: AnalyticsSink,
  event: Parameters<AnalyticsSink["capture"]>[0],
) {
  try {
    analytics.capture(event);
  } catch {
    // La mesure optionnelle ne bloque jamais le parcours local.
  }
}

export function TodayExperience({
  lesson,
  analytics: analyticsOverride,
}: TodayExperienceProps) {
  const { analytics: consentAwareAnalytics } = useWebAnalyticsConsent();
  const analytics = analyticsOverride ?? consentAwareAnalytics;
  const [store, setStore] = useState<WebLocalExperienceStore | null>(null);
  const [snapshot, setSnapshot] = useState<LocalExperienceSnapshot | null>(
    null,
  );
  const [storageStatus, setStorageStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [retryToken, setRetryToken] = useState(0);
  const [goalOptionId, setGoalOptionId] = useState<GoalOptionId | null>(null);
  const [motivationOptionId, setMotivationOptionId] =
    useState<MotivationOptionId | null>(null);
  const [experienceOptionId, setExperienceOptionId] =
    useState<ExperienceOptionId | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const online = useSyncExternalStore(
    subscribeToNetworkStatus,
    () => navigator.onLine,
    () => true,
  );

  useEffect(() => {
    let active = true;
    const instance = new WebLocalExperienceStore();
    let didStartOnboarding = false;

    queueMicrotask(() => {
      if (!active) return;
      setStore(instance);
      setSnapshot(null);
      setStorageStatus("loading");
      setMessage("");
    });

    void instance
      .update((current) => {
        if (current.onboarding.status !== "not_started") return current;
        didStartOnboarding = true;
        return beginLocalOnboarding(current, new Date().toISOString());
      })
      .then((current) => {
        if (!active) return;
        setSnapshot(current);
        setStorageStatus("ready");
        if (current.onboarding.status === "in_progress") {
          setGoalOptionId(
            knownOptionId(GOAL_OPTIONS, current.onboarding.goalOptionId),
          );
          setMotivationOptionId(
            knownOptionId(
              MOTIVATION_OPTIONS,
              current.onboarding.motivationOptionId,
            ),
          );
          setExperienceOptionId(
            knownOptionId(
              EXPERIENCE_OPTIONS,
              current.onboarding.experienceOptionId,
            ),
          );
        }
        if (didStartOnboarding) {
          captureSafely(analytics, {
            name: "onboarding_started",
            platform: "web",
          });
        }
      })
      .catch(() => {
        if (!active) return;
        setStorageStatus("error");
      });

    return () => {
      active = false;
      instance.close();
    };
  }, [analytics, retryToken]);

  async function completeOnboarding(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (
      store === null ||
      goalOptionId === null ||
      motivationOptionId === null ||
      experienceOptionId === null
    ) {
      setMessage("Choisissez une réponse dans chaque groupe.");
      return;
    }

    setIsSaving(true);
    setMessage("");
    try {
      const next = await store.update((current) =>
        completeLocalOnboarding(
          current,
          { goalOptionId, motivationOptionId, experienceOptionId },
          new Date().toISOString(),
        ),
      );
      setSnapshot(next);
      captureSafely(analytics, {
        name: "onboarding_completed",
        platform: "web",
      });
    } catch (error) {
      setMessage(
        error instanceof LocalExperienceStorageError
          ? error.message
          : "Vos choix n’ont pas pu être conservés sur cet appareil.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function persistOnboardingChoice(
    update: Partial<LocalOnboardingSelection>,
  ): void {
    if (store === null || storageStatus !== "ready") return;
    const updatedAt = new Date().toISOString();
    void store
      .update((current) => updateLocalOnboarding(current, update, updatedAt))
      .then(setSnapshot)
      .catch((error) => {
        setMessage(
          error instanceof LocalExperienceStorageError
            ? error.message
            : "Ce choix n’a pas pu être conservé sur cet appareil.",
        );
      });
  }

  if (storageStatus === "error") {
    return (
      <section className={styles.panel} aria-labelledby="today-error-title">
        <p className={styles.eyebrow}>Stockage local indisponible</p>
        <h1 id="today-error-title">Vos données existantes sont conservées.</h1>
        <p className={styles.lede}>
          Thaïnaute n’écrase pas un parcours illisible. Réessayez après avoir
          vérifié que le stockage du navigateur est autorisé.
        </p>
        <div className={styles.actionRow}>
          <button
            className={buttonClass("primary")}
            type="button"
            onClick={() => setRetryToken((current) => current + 1)}
          >
            Réessayer
          </button>
        </div>
      </section>
    );
  }

  if (storageStatus === "loading" || snapshot === null) {
    return (
      <section className={styles.panel} aria-busy="true" aria-live="polite">
        <p className={styles.eyebrow}>Aujourd’hui</p>
        <h1>Préparation de votre parcours local…</h1>
        <p className={styles.lede}>
          Aucune création de compte n’est nécessaire.
        </p>
      </section>
    );
  }

  if (snapshot.onboarding.status !== "completed") {
    const canSubmit =
      goalOptionId !== null &&
      motivationOptionId !== null &&
      experienceOptionId !== null &&
      !isSaving;

    return (
      <section className={styles.panel} aria-labelledby="onboarding-title">
        <div className={styles.networkStatus} aria-live="polite">
          <span
            className={
              online
                ? `${styles.statusDot} ${styles.statusDotOnline}`
                : styles.statusDot
            }
            aria-hidden="true"
          />
          {online
            ? "Parcours local prêt"
            : "Hors ligne · vos choix restent sur cet appareil"}
        </div>
        <p className={styles.eyebrow}>Bienvenue · moins d’une minute</p>
        <h1 id="onboarding-title">Préparons votre première session.</h1>
        <p className={styles.lede}>
          Ces préférences restent locales et ne modifient pas encore le parcours
          pédagogique.
        </p>

        <form className={styles.form} onSubmit={completeOnboarding}>
          <fieldset>
            <legend>Quel rythme vous convient aujourd’hui ?</legend>
            <div className={styles.choices}>
              {GOAL_OPTIONS.map((option) => (
                <label key={option.id}>
                  <input
                    type="radio"
                    name="daily-goal"
                    value={option.id}
                    checked={goalOptionId === option.id}
                    onChange={() => {
                      setGoalOptionId(option.id);
                      setMessage("");
                      persistOnboardingChoice({ goalOptionId: option.id });
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Qu’est-ce qui vous motive ?</legend>
            <div className={styles.choices}>
              {MOTIVATION_OPTIONS.map((option) => (
                <label key={option.id}>
                  <input
                    type="radio"
                    name="motivation"
                    value={option.id}
                    checked={motivationOptionId === option.id}
                    onChange={() => {
                      setMotivationOptionId(option.id);
                      setMessage("");
                      persistOnboardingChoice({
                        motivationOptionId: option.id,
                      });
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Où en êtes-vous avec le thaï ?</legend>
            <div className={styles.choices}>
              {EXPERIENCE_OPTIONS.map((option) => (
                <label key={option.id}>
                  <input
                    type="radio"
                    name="experience"
                    value={option.id}
                    checked={experienceOptionId === option.id}
                    onChange={() => {
                      setExperienceOptionId(option.id);
                      setMessage("");
                      persistOnboardingChoice({
                        experienceOptionId: option.id,
                      });
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {message && (
            <p className={styles.inlineError} role="alert">
              {message}
            </p>
          )}
          <button
            className={`${buttonClass("primary")} ${styles.primaryAction}`}
            type="submit"
            aria-busy={isSaving}
            disabled={!canSubmit}
          >
            {isSaving ? "Enregistrement…" : "Préparer ma session"}
          </button>
        </form>
      </section>
    );
  }

  const completedOnboarding = snapshot.onboarding;
  const storedCheckpoint = snapshot.lesson;
  const checkpoint =
    storedCheckpoint?.lessonVersionId === lesson.versionId
      ? storedCheckpoint
      : null;
  const expedition =
    snapshot.expedition?.lessonVersionId === lesson.versionId
      ? snapshot.expedition
      : null;
  const hasOlderVersion =
    (storedCheckpoint !== null && checkpoint === null) ||
    (snapshot.expedition !== null && expedition === null);
  const expeditionDone =
    expedition !== null &&
    expedition.results.length === expedition.exerciseIds.length;
  const actionLabel = hasOlderVersion
    ? "Traiter l’ancienne session"
    : expedition !== null
      ? expeditionDone
        ? "Revoir le récapitulatif"
        : "Reprendre l’expédition"
      : checkpoint === null || checkpoint.phase === "intro"
        ? "Commencer la session"
        : checkpoint.phase === "question" || checkpoint.phase === "submitting"
          ? "Reprendre la session"
          : "Revoir mon résultat";
  const sessionStatus = hasOlderVersion
    ? "Ancienne version à confirmer"
    : expedition !== null
      ? expeditionDone
        ? "Expédition terminée"
        : `Expédition en cours · ${expedition.results.length} sur ${expedition.exerciseIds.length}`
      : checkpoint === null || checkpoint.phase === "intro"
        ? "Prête à commencer"
        : checkpoint.phase === "question"
          ? "Session en cours"
          : checkpoint.phase === "submitting"
            ? "Tentative locale à finaliser"
            : checkpoint.phase === "result"
              ? "Résultat à consulter"
              : "Session terminée";
  const goalLabel =
    GOAL_OPTIONS.find(({ id }) => id === completedOnboarding.goalOptionId)
      ?.label ?? "session courte";

  return (
    <section className={styles.panel} aria-labelledby="today-title">
      <ToneCurve
        className={styles.panelCurve}
        tone="rising"
        width={120}
        height={64}
        strokeWidth={7}
      />
      <div className={styles.networkStatus} aria-live="polite">
        <span
          className={
            online
              ? `${styles.statusDot} ${styles.statusDotOnline}`
              : styles.statusDot
          }
          aria-hidden="true"
        />
        {online
          ? "En ligne · parcours local prêt"
          : "Hors ligne · les données déjà chargées restent locales"}
      </div>
      <p className={styles.eyebrow}>Aujourd’hui · objectif local</p>
      <h1 id="today-title">Une seule étape, bien comprise.</h1>
      <p className={styles.lede}>
        Objectif choisi : {goalLabel}. Cette fixture valide la reprise technique
        sans enseigner de contenu thaï.
      </p>

      <article className={styles.session} aria-labelledby="today-session-title">
        <div>
          <span className={styles.sessionStatus}>{sessionStatus}</span>
          <h2 id="today-session-title">{lesson.title}</h2>
          <p>{lesson.objective}</p>
        </div>
        <span className={styles.fixtureBadge}>Fixture · non publiable</span>
      </article>

      {!online && (
        <p className={styles.offlineNote} role="status">
          Aucun démarrage à froid hors ligne n’est garanti. Continuez seulement
          si les ressources de cette fixture sont déjà chargées.
        </p>
      )}

      <div className={styles.actionRow}>
        <Link className={buttonClass("primary")} href="/learn/demo">
          {actionLabel}
        </Link>
      </div>
    </section>
  );
}
