"use client";

import type { AnalyticsSink } from "@thainaute/analytics";
import type { Lesson, LessonExercise } from "@thainaute/content";
import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import {
  abandonLocalExpeditionForVersionChange,
  abandonLocalLessonForVersionChange,
  attemptSubmissionSchema,
  clearCompletedLocalExpedition,
  confirmLocalLessonResult,
  createAttemptOutboxSnapshot,
  finishLocalLesson,
  ingestAttemptBatch,
  localAnswerKeysForLesson,
  MAX_ATTEMPT_DURATION_MS,
  openLocalLessonQuestion,
  prepareLocalLessonSubmission,
  recordLocalExpeditionResult,
  saveLocalLessonDraft,
  selectLocalLessonOption,
  startLocalExpedition,
  startLocalLesson,
  type AttemptOutboxSnapshot,
  type LocalDraftAnswer,
  type LocalExperienceSnapshot,
} from "@thainaute/sync";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { ExpeditionTrail } from "@/components/brand/expedition-trail";
import { BrandCurve, ToneCurve } from "@/components/brand/tone-curve";
import { buttonClass } from "@/components/ui/button";
import {
  AttemptOutboxStorageError,
  WebAttemptOutboxStore,
  startLegacyDemoFixtureMigration,
  type LegacyDemoFixtureMigrationOperation,
} from "@/lib/client/attempt-outbox-store";
import { useWebAnalyticsConsent } from "@/lib/client/analytics-consent";
import { useWebAuthSession } from "@/lib/client/auth-session";
import { browserSha256Hex } from "@/lib/client/sha256";
import {
  LocalExperienceStorageError,
  WebLocalExperienceStore,
} from "@/lib/client/local-experience-store";
import {
  LocalStorageDeadlineError,
  withLocalStorageDeadline,
} from "@/lib/client/local-storage-deadline";

import { ContentReportPanel } from "./content-report-panel";
import { LocalVoiceComparison } from "./local-voice-comparison";
import styles from "./lesson.module.css";

/** Les cinq contours que `ToneCurve` sait dessiner. */
const TONS_DESSINABLES = ["mid", "low", "falling", "high", "rising"] as const;
type TonDessinable = (typeof TONS_DESSINABLES)[number];

/**
 * Ton d'un item, quand il en porte un ET que ce ton est dessinable.
 *
 * Renvoie `null` sinon : une association qui ne porte pas sur les tons
 * garde ses cartes de texte, sans qu'on lui invente une courbe.
 */
function toneOfPair(
  itemsById: ReadonlyMap<
    string,
    { syllables: readonly { tone: string | null }[] }
  >,
  itemId: string,
): TonDessinable | null {
  const tone = itemsById.get(itemId)?.syllables[0]?.tone ?? null;
  return TONS_DESSINABLES.includes(tone as TonDessinable)
    ? (tone as TonDessinable)
    : null;
}

interface ExpeditionProps {
  readonly lesson: Lesson;
  /**
   * Adresse publique de chaque asset audio, par identifiant. Fournie par la
   * page, qui la derive du manifeste cote serveur : le lecteur ne devine
   * aucun chemin et ne code aucune URL en dur.
   */
  readonly audioSources?: Readonly<Record<string, string>> | undefined;
  /**
   * La voix de cette leçon est-elle synthétique ? Dérivée du manifeste par
   * la page, jamais devinée ici : le jour où une voix humaine remplacera la
   * synthèse, une constante écrite en dur mentirait sans que rien n'échoue.
   */
  readonly voixSynthetique?: boolean | undefined;
  readonly analytics?: AnalyticsSink | undefined;
  /**
   * Où sont journalisées les tentatives de l'apprenant.
   *
   * RUPTURE CORRIGÉE : ce composant sert à la fois la démonstration
   * technique et les vraies leçons du curriculum, et il ouvrait dans les
   * deux cas la base `thainaute-demo-v1`. Or la synchronisation de compte
   * ne lit que `thainaute-learning-v1`, et la base de démonstration est
   * délibérément mise en quarantaine à la fusion. Toute la progression du
   * cours réel était donc écrite dans un endroit dont personne ne la
   * relèverait jamais.
   *
   * Le choix appartient à l'appelant, parce que lui seul sait s'il rend une
   * leçon réelle ou une démonstration. Le défaut reste `demo` pour que la
   * page de démonstration ne se mette pas à polluer la progression réelle.
   */
  readonly attemptStorage?: "demo" | "learning" | undefined;
  /** Délai injectable pour les tests de reprise ; la production garde 8 s. */
  readonly storageHydrationTimeoutMs?: number | undefined;
  /** L'hydratation possède et ferme explicitement les handles de migration. */
  readonly storageMigrationFactory?:
    (() => LegacyDemoFixtureMigrationOperation) | undefined;
}

interface Celebration {
  readonly exerciseId: string;
  readonly correct: boolean;
  readonly feedback: string;
}

interface StorageGeneration {
  readonly experience: WebLocalExperienceStore;
  readonly key: string;
  readonly outbox: WebAttemptOutboxStore;
}

const MECHANIC_LABELS: Record<LessonExercise["type"], string> = {
  audio_choice: "Écoute",
  association: "Association",
  word_order: "Ordre des mots",
  recall: "Rappel",
  reading: "Lecture",
};

type TeachingBlock =
  | { readonly kind: "paragraph"; readonly lines: readonly string[] }
  | { readonly kind: "quote"; readonly lines: readonly string[] }
  | { readonly kind: "list"; readonly lines: readonly string[] };

function inlineTeaching(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(`[^`]+`)/gu).map((fragment, index) => {
    if (fragment.startsWith("`") && fragment.endsWith("`")) {
      return (
        <code key={`${keyPrefix}-code-${index}`} className={styles.coursCode}>
          {fragment.slice(1, -1)}
        </code>
      );
    }
    return fragment;
  });
}

/** Rend le petit sous-ensemble Markdown autorisé dans les pages de cours. */
function renderTeachingBody(body: string): ReactNode[] {
  const blocks: TeachingBlock[] = [];
  let current: { kind: TeachingBlock["kind"]; lines: string[] } | null = null;

  const flush = () => {
    if (current !== null && current.lines.length > 0) {
      blocks.push({ kind: current.kind, lines: [...current.lines] });
    }
    current = null;
  };

  for (const rawLine of body.split(/\r?\n/gu)) {
    const trimmed = rawLine.trim();
    if (trimmed === "") {
      flush();
      continue;
    }

    const quote = trimmed.match(/^>\s?(.*)$/u);
    if (quote !== null) {
      if (current?.kind !== "quote") {
        flush();
        current = { kind: "quote", lines: [] };
      }
      current.lines.push(quote[1] ?? "");
      continue;
    }

    if (/^\d+\.\s+/u.test(trimmed)) {
      if (current?.kind !== "list") {
        flush();
        current = { kind: "list", lines: [] };
      }
      for (const item of trimmed.split(/\s+(?=\d+\.\s)/u)) {
        current.lines.push(item.replace(/^\d+\.\s+/u, ""));
      }
      continue;
    }

    if (
      current !== null &&
      (current.kind === "quote" || current.kind === "list") &&
      /^\s/.test(rawLine)
    ) {
      current.lines[current.lines.length - 1] += ` ${trimmed}`;
      continue;
    }

    if (current?.kind !== "paragraph") {
      flush();
      current = { kind: "paragraph", lines: [] };
    }
    current.lines.push(trimmed);
  }
  flush();

  return blocks.map((block, blockIndex) => {
    const keyPrefix = `cours-${blockIndex}`;
    if (block.kind === "quote") {
      return (
        <blockquote className={styles.coursCitation} key={keyPrefix}>
          {block.lines.map((line, lineIndex) => (
            <span
              className={styles.coursCitationLine}
              key={`${keyPrefix}-${lineIndex}`}
            >
              {inlineTeaching(line, `${keyPrefix}-${lineIndex}`)}
            </span>
          ))}
        </blockquote>
      );
    }

    if (block.kind === "list") {
      return (
        <ol className={styles.coursList} key={keyPrefix}>
          {block.lines.map((line, lineIndex) => (
            <li key={`${keyPrefix}-${lineIndex}`}>
              {inlineTeaching(line, `${keyPrefix}-${lineIndex}`)}
            </li>
          ))}
        </ol>
      );
    }

    return (
      <p className={styles.coursTexte} key={keyPrefix}>
        {inlineTeaching(block.lines.join(" "), keyPrefix)}
      </p>
    );
  });
}

function captureSafely(
  analytics: AnalyticsSink,
  event: Parameters<AnalyticsSink["capture"]>[0],
): void {
  try {
    analytics.capture(event);
  } catch {
    // La mesure optionnelle ne bloque jamais la séance locale.
  }
}

function durationBucket(
  durationMs: number,
): "under_10s" | "10_to_30s" | "over_30s" {
  if (durationMs < 10_000) return "under_10s";
  return durationMs <= 30_000 ? "10_to_30s" : "over_30s";
}

function normalizeRecallInput(
  raw: string,
  policy: Extract<LessonExercise, { type: "recall" }>["answerPolicy"],
): string {
  let value = raw.normalize("NFC");
  if (policy.trimWhitespace) value = value.trim();
  if (policy.collapseInnerWhitespace) value = value.replaceAll(/\s+/gu, " ");
  return value;
}

function subscribeToNetworkStatus(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function subscribeToReducedMotion(callback: () => void): () => void {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

/** Lecteur Expédition : une carte par exercice, cinq mécaniques (ADR-0023). */
export function ExpeditionExperience({
  lesson,
  audioSources,
  voixSynthetique = true,
  analytics: analyticsOverride,
  attemptStorage = "demo",
  storageHydrationTimeoutMs,
  storageMigrationFactory = startLegacyDemoFixtureMigration,
}: ExpeditionProps) {
  const router = useRouter();
  const { analytics: consentAwareAnalytics } = useWebAnalyticsConsent();
  const analytics = analyticsOverride ?? consentAwareAnalytics;
  const auth = useWebAuthSession();
  const { sessionBoundaryRevision } = auth;
  // Propriétaire du journal des tentatives. Voir `attemptStorage` : sur une
  // leçon réelle, un apprenant connecté doit écrire dans le magasin de SON
  // compte, sinon sa progression reste anonyme et n'est remontée que par le
  // bouton « Fusionner et synchroniser », jamais par la synchro ordinaire.
  const userId =
    auth.status === "signed_in" ? (auth.session?.user.id ?? null) : null;

  const [storageGeneration, setStorageGeneration] =
    useState<StorageGeneration | null>(null);
  const store = storageGeneration?.outbox ?? null;
  const experienceStore = storageGeneration?.experience ?? null;
  const [snapshot, setSnapshot] = useState<LocalExperienceSnapshot | null>(
    null,
  );
  const [outbox, setOutbox] = useState<AttemptOutboxSnapshot>(() =>
    createAttemptOutboxSnapshot(),
  );
  const [storageStatus, setStorageStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [storageRetryToken, setStorageRetryToken] = useState(0);
  const storageGenerationKey = `${attemptStorage}:${userId ?? "anonymous"}:${sessionBoundaryRevision}:${storageRetryToken}`;
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [abandonConfirmation, setAbandonConfirmation] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [cardStartedAt, setCardStartedAt] = useState(0);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<readonly string[]>([]);
  const [orderedTokenIds, setOrderedTokenIds] = useState<readonly string[]>([]);
  const [recallValue, setRecallValue] = useState("");
  const [hint, setHint] = useState("");
  const missed = useRef(false);
  const submissionInFlight = useRef(false);
  const finishInFlight = useRef(false);
  const tokenButtons = useRef(new Map<string, HTMLButtonElement>());
  const pendingTokenFocus = useRef<string | null>(null);
  const cardHeading = useRef<HTMLHeadingElement>(null);
  const lessonAudio = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState(false);
  /** Page de cours en lecture, avant les exercices. */
  const [pageCours, setPageCours] = useState(0);

  /**
   * Le cours, dans l'ordre voulu par la lecon.
   *
   * Il manquait entierement : la premiere question du parcours demandait a
   * un francophone n'ayant jamais entendu de thai de distinguer cinq
   * contours tonaux, sans lui avoir montre ce qu'est un ton.
   */
  const cours = useMemo(
    () => [...lesson.teaching].sort((a, b) => a.ordre - b.ordre),
    [lesson.teaching],
  );
  const pageActive = cours[pageCours];
  const derniereePage = pageCours >= cours.length - 1;

  /**
   * Avertissement affiche au-dessus du lecteur. Il dit l'etat REEL du
   * contenu : il etait ecrit en dur quand la page ne servait qu'une
   * fixture, et mentirait maintenant qu'elle sert une lecon reelle.
   */
  const avertissement = useMemo(() => {
    if (lesson.visibility === "fixture") return "Donnée fictive, non publiable";
    // Le brief exige que « Revue native : en attente » soit affiche
    // honnetement. Il n'exige pas un encadre de quatre lignes repete a
    // chaque ecran : repetee, une mise en garde devient du papier peint que
    // plus personne ne lit. Une ligne, discrete, qui dit les faits.
    //
    // CORRECTION : la publication faisait disparaitre cette ligne, donc
    // l'avertissement s'effacait exactement au moment ou une personne
    // reelle lisait la lecon. Une signature du fondateur ne vaut pas revue
    // native, et `signatureUniteSchema` refuse meme de laisser ecrire le
    // contraire. Seul « Brouillon » disparait a la publication.
    const faits = [
      lesson.workflowStatus === "published" ? null : "Brouillon",
      "Revue native : en attente",
      voixSynthetique ? "voix synthétique" : null,
    ].filter((fait): fait is string => fait !== null);
    return faits.length === 0 ? null : faits.join(" · ");
  }, [lesson.visibility, lesson.workflowStatus, voixSynthetique]);

  // Le bouton d'accueil fait entendre le premier mot de la lecon, celui de
  // son premier exercice d'ecoute.
  const premierAudioAssetId = useMemo(
    () =>
      lesson.exercises.find((exercice) => exercice.type === "audio_choice")
        ?.audioAssetId ?? null,
    [lesson.exercises],
  );

  const online = useSyncExternalStore(
    subscribeToNetworkStatus,
    () => navigator.onLine,
    () => true,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  const itemsById = useMemo(
    () => new Map(lesson.items.map((item) => [item.id, item])),
    [lesson.items],
  );
  const plan = useMemo(
    () => lesson.exercises.map((exercise) => exercise.id),
    [lesson.exercises],
  );
  const listeningExercise = lesson.exercises.find(
    (exercise) => exercise.type === "audio_choice",
  );

  /**
   * Clés de correction des CINQ mécaniques, dérivées une fois.
   *
   * Elles ne servent qu'à la séance jouée sur un paquet déjà présent sur
   * l'appareil : en ligne, la clé autoritaire appartient au serveur et le
   * DTO public n'en transporte aucune. Elles rendent la note identique à
   * celle du mobile, qui emploie le même module.
   */
  const answerKeys = useMemo(() => localAnswerKeysForLesson(lesson), [lesson]);

  /**
   * Note une tentative depuis le journal DURABLE, jamais depuis l'état React.
   * Une tentative rejouée après un incident doit rendre exactement la même
   * note que la première fois.
   */
  const evaluateDurableAttempt = useCallback(
    (source: AttemptOutboxSnapshot, eventId: string) =>
      ingestAttemptBatch({
        existingEvents: [],
        submissions: source.entries
          .filter(({ status }) => status !== "rejected")
          .map((entry) => entry.submission),
        answerKeys,
        authenticatedUserId: null,
      }).events.find((event) => event.eventId === eventId),
    [answerKeys],
  );

  const stopSignal = useCallback((): void => {
    const audio = lessonAudio.current;
    lessonAudio.current = null;
    if (audio === null) return;
    audio.onended = null;
    audio.onerror = null;
    try {
      audio.pause();
    } catch {
      // Le nettoyage continue sans exposer le détail du navigateur.
    }
    try {
      audio.removeAttribute("src");
      audio.load();
    } catch {
      // Le lecteur détaché sera libéré par le navigateur.
    }
  }, []);

  /**
   * Joue l'audio de l'exercice demande. Sans adresse connue pour cet asset,
   * on ne joue RIEN et on le signale : faire entendre un autre son que le
   * mot attendu serait pire que le silence, puisque l'apprenant croirait
   * avoir entendu ce mot-la.
   */
  const playSignal = useCallback(
    (assetId: string | null): void => {
      stopSignal();
      setAudioError(false);
      const src = assetId === null ? undefined : audioSources?.[assetId];
      if (src === undefined) {
        setAudioError(true);
        return;
      }
      const audio = new Audio(src);
      lessonAudio.current = audio;
      audio.onended = () => {
        if (lessonAudio.current === audio) lessonAudio.current = null;
      };
      audio.onerror = () => {
        if (lessonAudio.current !== audio) return;
        stopSignal();
        setAudioError(true);
      };
      void audio.play().catch(() => {
        if (lessonAudio.current !== audio) return;
        stopSignal();
        setAudioError(true);
      });
    },
    [audioSources, stopSignal],
  );

  useEffect(() => {
    let active = true;
    // Le magasin de démonstration reste toujours anonyme : ses tentatives
    // portent sur une fixture et n'ont rien à faire dans un compte.
    const proprietaire =
      attemptStorage === "learning" && userId !== null
        ? ({ kind: "account", userId } as const)
        : undefined;
    const outboxInstance = new WebAttemptOutboxStore(
      attemptStorage === "learning"
        ? "thainaute-learning-v1"
        : "thainaute-demo-v1",
      proprietaire,
      proprietaire === undefined ? undefined : browserSha256Hex,
    );
    const experienceInstance = new WebLocalExperienceStore();
    const generationKey = storageGenerationKey;
    queueMicrotask(() => {
      if (!active) return;
      setStorageStatus("loading");
      setOutbox(createAttemptOutboxSnapshot());
      setSnapshot(null);
      setStorageGeneration({
        experience: experienceInstance,
        key: generationKey,
        outbox: outboxInstance,
      });
    });
    return () => {
      active = false;
      outboxInstance.close();
      experienceInstance.close();
    };
    // `attemptStorage` et `userId` sont dans les dépendances : un changement
    // de base OU de compte doit rouvrir le magasin, pas continuer d'écrire
    // dans l'ancien. `sessionBoundaryRevision` couvre la reconnexion sur le
    // même identifiant après une bascule.
  }, [
    attemptStorage,
    sessionBoundaryRevision,
    storageGenerationKey,
    storageRetryToken,
    userId,
  ]);

  useEffect(() => {
    const stopOnPageExit = () => stopSignal();
    window.addEventListener("pagehide", stopOnPageExit);
    return () => {
      window.removeEventListener("pagehide", stopOnPageExit);
      stopSignal();
    };
  }, [stopSignal]);

  useEffect(() => {
    if (
      storageGeneration === null ||
      storageGeneration.key !== storageGenerationKey
    ) {
      return;
    }
    let active = true;
    const activeOutboxStore = storageGeneration.outbox;
    const activeExperienceStore = storageGeneration.experience;
    const legacyMigration = storageMigrationFactory();

    async function hydrate(): Promise<void> {
      await legacyMigration.promise;
      if (!active) return;
      let nextOutbox = await activeOutboxStore.read();
      if (!active) return;
      let nextExperience = await activeExperienceStore.read();
      if (!active) return;
      let replayedCelebration: Celebration | null = null;

      // Une tentative réservée avant un crash est re-poussée vers le journal.
      if (nextExperience.lesson?.phase === "submitting") {
        nextOutbox = await activeOutboxStore.enqueue(
          nextExperience.lesson.submission,
        );
        if (!active) return;
        const durableOutbox = nextOutbox;
        nextExperience = await activeExperienceStore.update((current) =>
          confirmLocalLessonResult(
            current,
            durableOutbox,
            new Date().toISOString(),
          ),
        );
        if (!active) return;
      }

      // Un résultat durable interrompu avant sa consignation est rejoué.
      const interrupted = nextExperience.lesson;
      if (
        interrupted !== null &&
        (interrupted.phase === "result" || interrupted.phase === "completed") &&
        interrupted.lessonVersionId === lesson.versionId &&
        nextExperience.expedition !== null &&
        !nextExperience.expedition.results.some(
          ({ exerciseId }) => exerciseId === interrupted.exerciseId,
        )
      ) {
        const durableOutbox = nextOutbox;
        if (interrupted.phase === "result") {
          nextExperience = await activeExperienceStore.update((current) =>
            finishLocalLesson(current, durableOutbox, new Date().toISOString()),
          );
          if (!active) return;
        }
        // Les cinq mécaniques se rejouent, plus seulement l'écoute : une
        // association interrompue laissait auparavant sa tentative dans le
        // journal sans jamais consigner son résultat.
        const answered = lesson.exercises.find(
          (exercise) => exercise.id === interrupted.exerciseId,
        );
        if (answered !== undefined) {
          const evaluated = evaluateDurableAttempt(
            durableOutbox,
            interrupted.submission.eventId,
          );
          if (evaluated !== undefined) {
            nextExperience = await activeExperienceStore.update((current) =>
              recordLocalExpeditionResult(current, {
                exerciseId: answered.id,
                // La tentative durable fait foi : son horodatage est repris
                // tel quel, pour qu'un rejeu reste idempotent.
                rating: evaluated.rating,
                answeredAt: interrupted.submission.answeredAt,
              }),
            );
            if (!active) return;
            // L'exercice a été noté sans que sa correction ait été montrée :
            // on la présente à la reprise plutôt que de la sauter.
            replayedCelebration = {
              exerciseId: answered.id,
              correct: evaluated.rating === 1,
              feedback:
                evaluated.rating === 1
                  ? answered.feedback.correctFr
                  : answered.feedback.incorrectFr,
            };
          }
        }
      }

      if (!active) return;
      setOutbox(nextOutbox);
      setSnapshot(nextExperience);
      // Toute reprise repart d'une carte vierge : un appariement ou une
      // saisie hérités d'avant l'incident laisseraient la carte injouable.
      setSelectedOptionId(
        nextExperience.lesson?.phase === "question" &&
          nextExperience.lesson.lessonVersionId === lesson.versionId
          ? nextExperience.lesson.selectedOptionId
          : null,
      );
      // La réponse en construction et l'erreur déjà commise reviennent du
      // stockage : un rechargement ne doit jamais blanchir une faute.
      const resumed =
        nextExperience.lesson?.phase === "question" &&
        nextExperience.lesson.lessonVersionId === lesson.versionId
          ? nextExperience.lesson
          : null;
      const draft = resumed?.draftAnswer ?? null;
      setSelectedPairId(null);
      setMatchedPairIds(
        draft?.kind === "association"
          ? draft.pairs.map(({ chosenPairId }) => chosenPairId)
          : [],
      );
      setOrderedTokenIds(draft?.kind === "word_order" ? draft.tokenIds : []);
      setRecallValue(draft?.kind === "recall" ? draft.value : "");
      setHint("");
      setAudioError(false);
      // Une correction rejouée s'impose ; sinon on laisse à l'écran celle que
      // l'apprenant est peut-être en train de lire.
      if (replayedCelebration !== null) setCelebration(replayedCelebration);
      missed.current = resumed?.missedOnce ?? false;
      setCardStartedAt(Date.now());
      setErrorMessage("");
      setAbandonConfirmation(false);
      setStorageStatus("ready");
    }

    void withLocalStorageDeadline(hydrate(), storageHydrationTimeoutMs, () => {
      legacyMigration.close();
      activeOutboxStore.close();
      activeExperienceStore.close();
    }).catch((error: unknown) => {
      if (!active) return;
      setErrorMessage(
        error instanceof LocalStorageDeadlineError
          ? "Le stockage local ne répond pas. Fermez les autres onglets Thaïnaute, puis réessayez."
          : "Le stockage local est temporairement indisponible.",
      );
      setStorageStatus("error");
      // Une opération IndexedDB qui se débloquerait après l'échéance ne doit
      // pas remplacer silencieusement l'écran de reprise par un état tardif.
      active = false;
    });

    return () => {
      active = false;
      legacyMigration.close();
    };
  }, [
    evaluateDurableAttempt,
    lesson,
    storageGeneration,
    storageGenerationKey,
    storageHydrationTimeoutMs,
    storageMigrationFactory,
  ]);

  const expedition = snapshot?.expedition ?? null;
  const expeditionMatchesLesson =
    expedition !== null && expedition.lessonVersionId === lesson.versionId;
  const staleExpedition =
    expedition !== null && !expeditionMatchesLesson ? expedition : null;
  const staleLesson =
    snapshot?.lesson != null &&
    snapshot.lesson.lessonVersionId !== lesson.versionId
      ? snapshot.lesson
      : null;

  const results = expeditionMatchesLesson ? expedition.results : [];
  const resolvedIds = new Set(results.map(({ exerciseId }) => exerciseId));
  const celebratedExercise =
    celebration === null
      ? undefined
      : lesson.exercises.find(({ id }) => id === celebration.exerciseId);
  const currentExercise =
    celebratedExercise ??
    lesson.exercises.find(({ id }) => !resolvedIds.has(id));
  const expeditionComplete =
    expeditionMatchesLesson &&
    results.length === plan.length &&
    celebration === null;
  // Le repère d'étape suit l'exercice affiché, pas le nombre de résultats :
  // pendant la correction, le résultat est déjà consigné.
  const currentIndex = plan.indexOf(currentExercise?.id ?? "");
  const currentStep = currentIndex < 0 ? plan.length : currentIndex + 1;

  const stage: "loading" | "error" | "stale" | "intro" | "card" | "recap" =
    storageStatus === "error"
      ? "error"
      : storageStatus === "loading" || snapshot === null
        ? "loading"
        : staleLesson !== null || staleExpedition !== null
          ? "stale"
          : !expeditionMatchesLesson
            ? "intro"
            : expeditionComplete
              ? "recap"
              : "card";

  const registerToken =
    (tokenId: string) =>
    (element: HTMLButtonElement | null): void => {
      if (element === null) tokenButtons.current.delete(tokenId);
      else tokenButtons.current.set(tokenId, element);
    };

  // Un jeton déplacé est démonté puis remonté dans l'autre zone : on rend le
  // focus à sa nouvelle instance juste après le rendu.
  useEffect(() => {
    const tokenId = pendingTokenFocus.current;
    if (tokenId === null) return;
    pendingTokenFocus.current = null;
    tokenButtons.current.get(tokenId)?.focus();
  }, [orderedTokenIds]);

  // Le titre reprend le focus à chaque changement de carte ET au passage en
  // correction : sans cela le bouton validé disparaît et le focus retombe
  // sur le document, ce qui renvoie l'utilisateur clavier tout en haut.
  useEffect(() => {
    stopSignal();
    if (stage === "card" || stage === "recap") {
      queueMicrotask(() => cardHeading.current?.focus());
    }
  }, [stage, currentExercise?.id, celebration?.exerciseId, stopSignal]);

  function resetCardState(): void {
    setSelectedOptionId(null);
    setSelectedPairId(null);
    setMatchedPairIds([]);
    setOrderedTokenIds([]);
    setRecallValue("");
    setHint("");
    missed.current = false;
    setCardStartedAt(Date.now());
  }

  function failStorage(error: unknown): void {
    setStorageStatus("error");
    setErrorMessage(
      error instanceof AttemptOutboxStorageError ||
        error instanceof LocalExperienceStorageError
        ? error.message
        : "La progression locale n'a pas pu être conservée.",
    );
  }

  function beginExpedition(): void {
    if (experienceStore === null || storageStatus !== "ready" || isSaving) {
      return;
    }
    setIsSaving(true);
    const startedAt = new Date().toISOString();
    void experienceStore
      .update((current) =>
        startLocalExpedition(current, {
          lessonVersionId: lesson.versionId,
          exerciseIds: plan,
          startedAt,
        }),
      )
      .then((next) => {
        setSnapshot(next);
        resetCardState();
        captureSafely(analytics, {
          name: "lesson_started",
          lessonVersionId: lesson.versionId,
          platform: "web",
        });
      })
      .catch(failStorage)
      .finally(() => setIsSaving(false));
  }

  /**
   * Conserve la réponse en construction, en ouvrant la sous-session au
   * premier geste. Sans cela, un rechargement effacerait l'erreur déjà
   * commise et transformerait une note 0 en 1.
   */
  function persistDraft(
    exercise: LessonExercise,
    answer: LocalDraftAnswer | null,
    options: { readonly missed?: boolean } = {},
  ): void {
    if (experienceStore === null || storageStatus !== "ready") return;
    const at = new Date().toISOString();
    void experienceStore
      .update((current) => {
        let session = current;
        if (session.lesson === null) {
          session = openLocalLessonQuestion(
            startLocalLesson(session, {
              lessonVersionId: lesson.versionId,
              exerciseId: exercise.id,
              startedAt: at,
            }),
            at,
          );
        }
        return saveLocalLessonDraft(
          session,
          { answer, missedOnce: options.missed ?? false },
          at,
        );
      })
      .then(setSnapshot)
      .catch(() => {
        setErrorMessage(
          "La réponse reste affichée, mais n’a pas pu être conservée.",
        );
      });
  }

  const recordResult = useCallback(
    async (exercise: LessonExercise, rating: 0 | 1): Promise<void> => {
      if (experienceStore === null) return;
      const answeredAt = new Date().toISOString();
      const next = await experienceStore.update((current) =>
        recordLocalExpeditionResult(current, {
          exerciseId: exercise.id,
          rating,
          answeredAt,
        }),
      );
      setSnapshot(next);
      captureSafely(analytics, {
        name: "exercise_answered",
        lessonVersionId: lesson.versionId,
        exerciseType: exercise.type,
        correct: rating === 1,
        durationBucket: durationBucket(
          Math.min(
            MAX_ATTEMPT_DURATION_MS,
            Math.max(0, Date.now() - cardStartedAt),
          ),
        ),
        platform: "web",
      });
      if (next.expedition?.results.length === plan.length) {
        captureSafely(analytics, {
          name: "lesson_completed",
          lessonVersionId: lesson.versionId,
          platform: "web",
        });
      }
    },
    [analytics, cardStartedAt, experienceStore, lesson.versionId, plan.length],
  );

  function celebrate(exercise: LessonExercise, rating: 0 | 1): void {
    stopSignal();
    setCelebration({
      exerciseId: exercise.id,
      correct: rating === 1,
      feedback:
        rating === 1
          ? exercise.feedback.correctFr
          : exercise.feedback.incorrectFr,
    });
  }

  const advance = useCallback((): void => {
    setCelebration(null);
    setSelectedOptionId(null);
    setSelectedPairId(null);
    setMatchedPairIds([]);
    setOrderedTokenIds([]);
    setRecallValue("");
    setHint("");
    missed.current = false;
    setCardStartedAt(Date.now());
  }, []);

  useEffect(() => {
    if (celebration === null || !celebration.correct || reducedMotion) return;
    const timer = window.setTimeout(advance, 800);
    return () => window.clearTimeout(timer);
  }, [advance, celebration, reducedMotion]);

  /**
   * Réponse construite pour les mécaniques qui ne tiennent pas dans une
   * option.
   *
   * L'appelant peut l'imposer. L'association valide dans le MÊME tick que sa
   * dernière paire : relire `matchedPairIds` y rendrait la paire finale
   * absente, et la tentative serait notée fausse alors qu'elle est juste.
   */
  function draftAnswerFor(
    exercise: LessonExercise,
    override?: LocalDraftAnswer,
  ): LocalDraftAnswer | null {
    if (override !== undefined) return override;
    if (exercise.type === "association") {
      return {
        kind: "association",
        pairs: matchedPairIds.map((pairId) => ({
          promptPairId: pairId,
          chosenPairId: pairId,
        })),
      };
    }
    if (exercise.type === "word_order") {
      return { kind: "word_order", tokenIds: [...orderedTokenIds] };
    }
    if (exercise.type === "recall") {
      return { kind: "recall", value: recallValue };
    }
    return null;
  }

  /**
   * Clôt une mécanique, quelle qu'elle soit, en passant par le journal
   * durable.
   *
   * Les quatre mécaniques composées se contentaient auparavant d'un état
   * local : leur résultat ne survivait pas à l'appareil, n'atteignait jamais
   * le serveur, et le récapitulatif affichait « 0 ‰ » pour quatre exercices
   * sur cinq. Le contrat de réponse typée existait pourtant déjà, et le
   * mobile s'en servait.
   *
   * La tentative envoyée est celle qui a été RÉSERVÉE, relue depuis le
   * stockage : `prepareLocalLessonSubmission` refuse toute divergence, et le
   * cliquet d'erreur vit dans le brouillon, pas dans un état React qu'un
   * rechargement effacerait.
   */
  async function settleExercise(
    exercise: LessonExercise,
    answerOverride?: LocalDraftAnswer,
  ): Promise<void> {
    if (store === null || experienceStore === null) return;
    const answersOption =
      exercise.type === "audio_choice" || exercise.type === "reading";
    const chosenOptionId = selectedOptionId;
    if (answersOption && chosenOptionId === null) return;

    const deviceId = await store.getOrCreateDeviceId(() => crypto.randomUUID());
    const stagedAt = new Date().toISOString();
    const staged = await experienceStore.update((current) => {
      let session = current;
      if (session.lesson === null) {
        session = startLocalLesson(session, {
          lessonVersionId: lesson.versionId,
          exerciseId: exercise.id,
          startedAt: stagedAt,
        });
      }
      // Une sous-session ouverte sans question l'attend encore : sans cette
      // ouverture, la réservation refuserait une réponse pourtant donnée.
      if (session.lesson?.phase === "intro") {
        session = openLocalLessonQuestion(session, stagedAt);
      }
      // Une tentative déjà réservée avant un incident se rejoue telle quelle.
      if (session.lesson?.phase !== "question") return session;
      return answersOption
        ? selectLocalLessonOption(session, chosenOptionId ?? "", stagedAt)
        : saveLocalLessonDraft(
            session,
            {
              answer: draftAnswerFor(exercise, answerOverride),
              missedOnce: missed.current,
            },
            stagedAt,
          );
    });

    const stagedLesson = staged.lesson;
    if (stagedLesson === null) {
      throw new LocalExperienceStorageError(
        "La question locale n'a pas pu être ouverte.",
      );
    }

    let exactSubmission;
    if (stagedLesson.phase === "submitting") {
      exactSubmission = stagedLesson.submission;
    } else {
      if (stagedLesson.phase !== "question") {
        throw new LocalExperienceStorageError(
          "La question locale n'est pas prête à recevoir une tentative.",
        );
      }
      const answeredAt = new Date().toISOString();
      const answerInput = answersOption
        ? { selectedOptionId: chosenOptionId }
        : { answer: stagedLesson.draftAnswer };
      const submission = attemptSubmissionSchema.parse({
        eventId: crypto.randomUUID(),
        deviceId,
        exerciseId: exercise.id,
        ...answerInput,
        answeredAt,
        durationMs: Math.min(
          MAX_ATTEMPT_DURATION_MS,
          Math.max(0, Math.round(Date.parse(answeredAt) - cardStartedAt)),
        ),
        contentVersionId: lesson.versionId,
        algorithmVersion: SRS_ALGORITHM_VERSION,
      });
      const prepared = await experienceStore.update((current) =>
        prepareLocalLessonSubmission(current, submission, answeredAt),
      );
      if (prepared.lesson?.phase !== "submitting") {
        throw new LocalExperienceStorageError(
          "La tentative locale n'a pas été réservée.",
        );
      }
      exactSubmission = prepared.lesson.submission;
    }

    const nextOutbox = await store.enqueue(exactSubmission);
    await experienceStore.update((current) =>
      confirmLocalLessonResult(current, nextOutbox, new Date().toISOString()),
    );
    const confirmed = await experienceStore.update((current) =>
      finishLocalLesson(current, nextOutbox, new Date().toISOString()),
    );
    setOutbox(nextOutbox);
    setSnapshot(confirmed);

    const evaluated = evaluateDurableAttempt(
      nextOutbox,
      exactSubmission.eventId,
    );
    if (evaluated === undefined) {
      throw new LocalExperienceStorageError(
        "La tentative locale n'a pas pu être évaluée.",
      );
    }
    await recordResult(exercise, evaluated.rating);
    celebrate(exercise, evaluated.rating);
  }

  /** Enveloppe commune : une seule tentative à la fois, erreurs consignées. */
  function submitExercise(
    exercise: LessonExercise,
    answerOverride?: LocalDraftAnswer,
  ): void {
    if (submissionInFlight.current) return;
    submissionInFlight.current = true;
    setIsSaving(true);
    void settleExercise(exercise, answerOverride)
      .catch(failStorage)
      .finally(() => {
        submissionInFlight.current = false;
        setIsSaving(false);
      });
  }

  /** La sélection d'écoute est durable : elle survit à un rechargement. */
  function persistListeningSelection(
    exercise: Extract<LessonExercise, { type: "audio_choice" }>,
    optionId: string,
  ): void {
    setSelectedOptionId(optionId);
    setHint("");
    if (experienceStore === null || storageStatus !== "ready") return;
    const selectedAt = new Date().toISOString();
    void experienceStore
      .update((current) => {
        let session = current;
        if (session.lesson === null) {
          session = startLocalLesson(session, {
            lessonVersionId: lesson.versionId,
            exerciseId: exercise.id,
            startedAt: selectedAt,
          });
          session = openLocalLessonQuestion(session, selectedAt);
        }
        return selectLocalLessonOption(session, optionId, selectedAt);
      })
      .then(setSnapshot)
      .catch(() => {
        setErrorMessage(
          "Le choix reste affiché, mais n'a pas pu être conservé.",
        );
      });
  }

  function submitListening(
    exercise: Extract<LessonExercise, { type: "audio_choice" }>,
  ): void {
    if (selectedOptionId === null) {
      setHint("Choisissez une option avant de valider.");
      return;
    }
    submitExercise(exercise);
  }

  function chooseMatch(
    exercise: Extract<LessonExercise, { type: "association" }>,
    labelPairId: string,
  ): void {
    if (selectedPairId === null) {
      setHint("Touchez d’abord un caractère thaï, puis son étiquette.");
      return;
    }
    if (selectedPairId === labelPairId) {
      const nextMatched = [...matchedPairIds, labelPairId];
      setMatchedPairIds(nextMatched);
      setSelectedPairId(null);
      setHint("");
      const answer: LocalDraftAnswer = {
        kind: "association",
        pairs: nextMatched.map((pairId) => ({
          promptPairId: pairId,
          chosenPairId: pairId,
        })),
      };
      // Le plateau complet part directement en tentative : la conserver deux
      // fois ferait courir deux écritures pour la même réponse.
      if (nextMatched.length === exercise.pairs.length) {
        submitExercise(exercise, answer);
        return;
      }
      persistDraft(exercise, answer);
      return;
    }
    missed.current = true;
    setSelectedPairId(null);
    setHint("Cette étiquette appartient à un autre caractère. Réessayez.");
    persistDraft(
      exercise,
      {
        kind: "association",
        pairs: matchedPairIds.map((pairId) => ({
          promptPairId: pairId,
          chosenPairId: pairId,
        })),
      },
      { missed: true },
    );
  }

  function submitWordOrder(
    exercise: Extract<LessonExercise, { type: "word_order" }>,
  ): void {
    if (orderedTokenIds.length === 0) {
      setHint("Déplacez les jetons dans la zone de réponse avant de valider.");
      return;
    }
    const expected = exercise.correctOrder;
    const isCorrect =
      orderedTokenIds.length === expected.length &&
      orderedTokenIds.every((tokenId, index) => tokenId === expected[index]);
    if (!isCorrect) {
      missed.current = true;
      setHint(exercise.feedback.incorrectFr);
      persistDraft(
        exercise,
        { kind: "word_order", tokenIds: [...orderedTokenIds] },
        { missed: true },
      );
      return;
    }
    setHint("");
    submitExercise(exercise);
  }

  function submitRecall(
    exercise: Extract<LessonExercise, { type: "recall" }>,
  ): void {
    const normalized = normalizeRecallInput(recallValue, exercise.answerPolicy);
    if (normalized.length === 0) {
      setHint("Saisissez votre réponse avant de valider.");
      return;
    }
    const isCorrect = exercise.acceptedAnswers.some(
      ({ value }) => value === normalized,
    );
    if (!isCorrect) {
      missed.current = true;
      setHint(exercise.feedback.incorrectFr);
      persistDraft(
        exercise,
        { kind: "recall", value: recallValue },
        { missed: true },
      );
      return;
    }
    setHint("");
    submitExercise(exercise);
  }

  function submitReading(
    exercise: Extract<LessonExercise, { type: "reading" }>,
  ): void {
    if (selectedOptionId === null) {
      setHint("Choisissez une option avant de valider.");
      return;
    }
    if (selectedOptionId !== exercise.correctOptionId) {
      missed.current = true;
      setSelectedOptionId(null);
      setHint(exercise.feedback.incorrectFr);
      // La lecture choisit une option : seule l'erreur a besoin d'être
      // durable, la sélection fautive est effacée de l'écran.
      persistDraft(exercise, null, { missed: true });
      return;
    }
    setHint("");
    submitExercise(exercise);
  }

  function abandonStaleState(): void {
    if (experienceStore === null || isSaving) return;
    const expectedLesson = staleLesson;
    const expectedExpedition = staleExpedition;
    const durableOutbox = outbox;
    setIsSaving(true);
    void experienceStore
      .update((current) => {
        let next = current;
        if (expectedLesson !== null) {
          next = abandonLocalLessonForVersionChange(
            next,
            expectedLesson,
            {
              lessonVersionId: lesson.versionId,
              exerciseId: plan[0] ?? lesson.versionId,
            },
            durableOutbox,
          );
        }
        if (expectedExpedition !== null) {
          next = abandonLocalExpeditionForVersionChange(
            next,
            expectedExpedition,
            lesson.versionId,
          );
        }
        return next;
      })
      .then((next) => {
        setSnapshot(next);
        setAbandonConfirmation(false);
        resetCardState();
      })
      .catch(failStorage)
      .finally(() => setIsSaving(false));
  }

  function finishExpedition(): void {
    // La navigation n'est pas instantanée : sans verrou, un second clic
    // tenterait de libérer une expédition déjà libérée et basculerait en
    // erreur juste avant de quitter la page.
    if (experienceStore === null || finishInFlight.current) return;
    finishInFlight.current = true;
    setIsSaving(true);
    void experienceStore
      .update((current) => clearCompletedLocalExpedition(current))
      .then(() => {
        router.push("/today");
      })
      .catch((error: unknown) => {
        finishInFlight.current = false;
        setIsSaving(false);
        failStorage(error);
      });
  }

  /**
   * Maîtrise et prochaine révision des CINQ mécaniques.
   *
   * Le récapitulatif ne savait projeter que l'écoute : les quatre autres
   * exercices affichaient « 0 ‰ » quelle que soit la réponse, ce qui donnait
   * une leçon apparemment ratée aux quatre cinquièmes.
   */
  const projections = useMemo(
    () =>
      ingestAttemptBatch({
        existingEvents: [],
        submissions: outbox.entries
          .filter(({ status }) => status !== "rejected")
          .map((entry) => entry.submission),
        answerKeys,
        authenticatedUserId: null,
      }).projections,
    [answerKeys, outbox.entries],
  );

  const projectionForExercise = useCallback(
    (exercise: LessonExercise) => {
      const key = answerKeys.find(
        ({ exerciseId }) => exerciseId === exercise.id,
      );
      if (key === undefined) return undefined;
      return projections.find(
        ({ state }) => state.itemId === key.itemId && state.skill === key.skill,
      )?.state;
    },
    [answerKeys, projections],
  );

  const listeningProjection =
    listeningExercise === undefined
      ? undefined
      : projectionForExercise(listeningExercise);

  /** La révision la plus proche parmi les cinq, la seule date actionnable. */
  const nextReviewAt = useMemo(() => {
    const dates = projections
      .map(({ state }) => state.dueAt)
      .filter((dueAt): dueAt is string => typeof dueAt === "string")
      .sort();
    return dates[0] ?? null;
  }, [projections]);

  const pendingAttempts = outbox.entries.filter(
    ({ status }) => status === "pending",
  ).length;
  const onboardingCompleted = snapshot?.onboarding.status === "completed";

  /**
   * Ce que le statut a reellement a dire, ou la chaine vide.
   *
   * Quand tout va bien, il ne dit RIEN : une pastille verte permanente
   * annoncant que la connexion fonctionne est du mobilier, pas de
   * l'information.
   */
  const statutVisible = useMemo(() => {
    if (stage === "loading") return "Préparation…";
    if (stage === "error")
      return "Vos réponses ne peuvent pas être enregistrées";
    if (!online) return "Hors ligne · vous pouvez continuer, tout sera gardé";
    if (pendingAttempts > 0) {
      return `${pendingAttempts} réponse${pendingAttempts > 1 ? "s" : ""} à envoyer`;
    }
    return "";
  }, [online, pendingAttempts, stage]);

  const sortedAssociationLabels = (
    exercise: Extract<LessonExercise, { type: "association" }>,
  ) => [...exercise.pairs].sort((a, b) => a.labelFr.localeCompare(b.labelFr));

  const shuffledTokens = (
    exercise: Extract<LessonExercise, { type: "word_order" }>,
  ) => [...exercise.tokens].sort((a, b) => b.id.localeCompare(a.id));

  return (
    <section className={styles.card} aria-labelledby="lesson-title">
      {/* Région d'annonce présente en permanence : une région ajoutée en
          même temps que son contenu n'est pas lue par les lecteurs d'écran. */}
      <p className="srOnly" role="status">
        {celebration === null
          ? ""
          : `${celebration.correct ? "Juste." : "À revoir."} ${celebration.feedback}`}
      </p>
      <div className={styles.pageSpecimen} aria-hidden="true">
        {lesson.items[0]?.thaiRaw}
      </div>
      {avertissement !== null && (
        <p className={styles.draftNote} role="note">
          {avertissement}
        </p>
      )}

      {/* Un statut permanent est du mobilier de tableau de bord : il occupe
          une ligne a chaque ecran pour dire que tout va bien. On ne parle
          que lorsqu'il y a quelque chose a dire, et la pastille disparait
          avec le texte. La region reste dans le DOM, vide, pour que
          l'assistance annonce les changements. */}
      <div className={styles.networkStatus} aria-live="polite">
        {statutVisible !== "" && (
          <>
            <span className={styles.statusDot} aria-hidden="true" />
            {statutVisible}
          </>
        )}
      </div>

      {stage === "error" && (
        <div className={styles.body}>
          <h1 id="lesson-title">
            Vos réponses ne peuvent pas être enregistrées.
          </h1>
          {errorMessage && (
            <p className={styles.inlineError} role="alert">
              {errorMessage}
            </p>
          )}
          <div className={styles.actions}>
            <button
              className={buttonClass("primary")}
              type="button"
              onClick={() => {
                setStorageStatus("loading");
                setStorageRetryToken((current) => current + 1);
              }}
            >
              Réessayer le stockage
            </button>
          </div>
        </div>
      )}

      {stage === "stale" && (
        <div className={styles.body}>
          <p className={styles.eyebrow}>Version locale plus ancienne</p>
          <h1 id="lesson-title">
            Une session précédente est encore conservée.
          </h1>
          <p className={styles.objective}>
            Thaïnaute ne la remplace jamais automatiquement. Une tentative déjà
            soumise reste dans le journal durable ; une progression non terminée
            sera abandonnée avec son point de reprise.
          </p>
          {abandonConfirmation ? (
            <div className={styles.actions}>
              <p className={styles.inlineError} role="alert">
                Deuxième confirmation : abandonner ce point de reprise et
                démarrer la version actuellement chargée ?
              </p>
              <button
                className={buttonClass("primary")}
                type="button"
                aria-busy={isSaving}
                disabled={isSaving}
                onClick={abandonStaleState}
              >
                {isSaving ? "Remplacement…" : "Confirmer l’abandon et démarrer"}
              </button>
              <button
                className={buttonClass("ghost")}
                type="button"
                disabled={isSaving}
                onClick={() => setAbandonConfirmation(false)}
              >
                Conserver l’ancienne session
              </button>
            </div>
          ) : (
            <div className={styles.actions}>
              <button
                className={buttonClass("primary")}
                type="button"
                onClick={() => setAbandonConfirmation(true)}
              >
                Abandonner cette ancienne session
              </button>
              <Link className={buttonClass("ghost")} href="/today">
                Retour à Aujourd’hui
              </Link>
            </div>
          )}
          {errorMessage && (
            <p className={styles.inlineError} role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      )}

      {stage === "intro" && (
        <div className={styles.body}>
          <p className={styles.eyebrow}>Expédition · {plan.length} exercices</p>
          <h1 id="lesson-title">{lesson.titleFr}</h1>
          <p className={styles.objective}>{lesson.objectiveFr}</p>

          {pageActive === undefined ? (
            <div
              className={styles.glyph}
              lang="th"
              role="img"
              aria-label={
                lesson.visibility === "fixture"
                  ? "Graphème thaï fictif de test"
                  : "Premier mot de la leçon"
              }
            >
              {lesson.items[0]?.thaiRaw}
            </div>
          ) : (
            <section className={styles.cours} aria-live="polite">
              <p className={styles.coursRang}>
                {pageCours + 1} sur {cours.length}
              </p>
              <h2 className={styles.coursTitre}>{pageActive.titleFr}</h2>
              {renderTeachingBody(pageActive.bodyFr)}
              {pageActive.specimen !== null && (
                <p className={styles.coursSpecimen} lang="th">
                  {pageActive.specimen}
                </p>
              )}
              <div className={styles.coursNav}>
                <button
                  className={buttonClass("ghost")}
                  type="button"
                  disabled={pageCours === 0}
                  onClick={() => {
                    setPageCours((rang) => Math.max(0, rang - 1));
                  }}
                >
                  Page précédente
                </button>
                {!derniereePage && (
                  <button
                    className={buttonClass("primary")}
                    type="button"
                    onClick={() => {
                      setPageCours((rang) =>
                        Math.min(cours.length - 1, rang + 1),
                      );
                    }}
                  >
                    Page suivante
                  </button>
                )}
              </div>
            </section>
          )}

          <div className={styles.actions}>
            {!onboardingCompleted ? (
              <Link className={buttonClass("primary")} href="/today">
                Préparer mon parcours
              </Link>
            ) : (
              // Le depart n'est offert qu'une fois le cours lu : c'est la
              // « sequence courte d'enseignement PUIS pratique » du brief,
              // et sans elle la premiere question est infaisable.
              derniereePage && (
                <button
                  className={buttonClass("primary")}
                  type="button"
                  aria-busy={isSaving}
                  disabled={isSaving}
                  onClick={beginExpedition}
                >
                  {isSaving ? "Ouverture…" : "Commencer l’expédition"}
                </button>
              )
            )}
            <button
              className={buttonClass("ghost")}
              type="button"
              onClick={() => {
                playSignal(premierAudioAssetId);
              }}
            >
              Écouter le mot
            </button>
          </div>
          {audioError && (
            <p className={styles.inlineError} role="alert">
              Le signal audio est indisponible. Vous pouvez continuer.
            </p>
          )}
          {errorMessage && (
            <p className={styles.inlineError} role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      )}

      {stage === "card" && currentExercise !== undefined && (
        <div className={styles.body}>
          <div className={styles.expeditionProgress}>
            <p className={styles.mechanicName}>
              {MECHANIC_LABELS[currentExercise.type]} · exercice {currentStep}{" "}
              sur {plan.length}
            </p>
            <div
              role="progressbar"
              aria-label="Progression de l’expédition"
              aria-valuemin={0}
              aria-valuemax={plan.length}
              aria-valuenow={results.length}
              aria-valuetext={`${results.length} exercice${results.length > 1 ? "s" : ""} sur ${plan.length}`}
            >
              <ExpeditionTrail total={plan.length} completed={results.length} />
            </div>
          </div>

          {celebration !== null ? (
            <div>
              <div className={styles.stampRow}>
                <div
                  className={
                    celebration.correct
                      ? styles.stamp + " " + styles.stampCorrect
                      : styles.stamp
                  }
                >
                  {celebration.correct ? "Juste" : "À revoir"}
                </div>
                {celebration.correct && (
                  <ToneCurve
                    tone="rising"
                    width={72}
                    height={38}
                    strokeWidth={7}
                    className={styles.stampCurve}
                  />
                )}
              </div>
              <h1 id="lesson-title" ref={cardHeading} tabIndex={-1}>
                {celebration.feedback}
              </h1>
              {/* Toujours offert : l'auto-avance ne doit jamais être la
                  seule façon de continuer, ni précipiter la lecture. */}
              <div className={styles.actions}>
                <button
                  className={buttonClass("primary")}
                  type="button"
                  onClick={advance}
                >
                  Continuer
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 id="lesson-title" ref={cardHeading} tabIndex={-1}>
                {currentExercise.promptFr}
              </h1>

              {currentExercise.type === "audio_choice" && (
                <>
                  <button
                    className={styles.audioControl}
                    type="button"
                    onClick={() => {
                      playSignal(currentExercise.audioAssetId);
                    }}
                  >
                    <span aria-hidden="true">▶</span> Réécouter le mot
                  </button>
                  {audioError && (
                    <p className={styles.inlineError} role="alert">
                      Le signal audio est indisponible. Vous pouvez continuer.
                    </p>
                  )}
                  <fieldset className={styles.answerList}>
                    <legend className="srOnly">Options de réponse</legend>
                    {currentExercise.options.map((option) => (
                      <label
                        className={
                          selectedOptionId === option.id
                            ? styles.answer + " " + styles.answerSelected
                            : styles.answer
                        }
                        key={option.id}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={option.id}
                          checked={selectedOptionId === option.id}
                          disabled={isSaving}
                          onChange={() =>
                            persistListeningSelection(
                              currentExercise,
                              option.id,
                            )
                          }
                        />
                        <span>{option.labelFr}</span>
                        <BrandCurve
                          curve="underline"
                          width={200}
                          height={7}
                          strokeWidth={3.5}
                          className={styles.answerUnderline}
                        />
                      </label>
                    ))}
                  </fieldset>
                  <button
                    className={buttonClass("primary") + " " + styles.submit}
                    type="button"
                    aria-busy={isSaving}
                    disabled={isSaving}
                    onClick={() => submitListening(currentExercise)}
                  >
                    {isSaving ? "Enregistrement…" : "Valider"}
                  </button>
                </>
              )}

              {currentExercise.type === "association" && (
                <div className={styles.matchBoard}>
                  <div
                    className={styles.matchColumn}
                    role="group"
                    aria-label="Caractères thaïs"
                  >
                    {currentExercise.pairs.map((pair) => {
                      const matched = matchedPairIds.includes(pair.id);
                      return (
                        <button
                          key={pair.id}
                          type="button"
                          className={
                            matched
                              ? styles.matchTile + " " + styles.matchTileDone
                              : selectedPairId === pair.id
                                ? styles.matchTile +
                                  " " +
                                  styles.matchTileSelected
                                : styles.matchTile
                          }
                          // aria-disabled et non disabled : une tuile
                          // appariée reste atteignable au clavier, sinon le
                          // focus est éjecté à chaque paire trouvée.
                          aria-disabled={matched}
                          aria-pressed={!matched && selectedPairId === pair.id}
                          onClick={() => {
                            if (matched) return;
                            setSelectedPairId(pair.id);
                            setHint("");
                          }}
                        >
                          <span lang="th">
                            {itemsById.get(pair.itemId)?.thaiRaw}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div
                    className={styles.matchColumn}
                    role="group"
                    aria-label="Étiquettes françaises"
                  >
                    {sortedAssociationLabels(currentExercise).map((pair) => {
                      const matched = matchedPairIds.includes(pair.id);
                      // La consigne demande de relier a la COURBE. La
                      // dessiner quand l'item en porte une : afficher sa
                      // seule description reviendrait a demander d'associer
                      // a un dessin absent.
                      const tone = toneOfPair(itemsById, pair.itemId);
                      return (
                        <button
                          key={pair.id}
                          type="button"
                          className={
                            matched
                              ? styles.matchTile + " " + styles.matchTileDone
                              : styles.matchTile
                          }
                          aria-disabled={matched}
                          onClick={() => {
                            if (matched) return;
                            chooseMatch(currentExercise, pair.id);
                          }}
                        >
                          {tone !== null && (
                            <ToneCurve
                              tone={tone}
                              withScale
                              width={132}
                              height={70}
                              strokeWidth={7}
                              className={styles.matchCurve}
                            />
                          )}
                          <span className={styles.matchLabel}>
                            {pair.labelFr}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentExercise.type === "word_order" && (
                <>
                  <div
                    className={styles.orderAnswer}
                    role="group"
                    aria-label="Votre réponse, dans l'ordre"
                  >
                    {orderedTokenIds.length === 0 ? (
                      <p className={styles.orderPlaceholder}>
                        Touchez les jetons pour construire votre réponse.
                      </p>
                    ) : (
                      orderedTokenIds.map((tokenId) => {
                        const token = currentExercise.tokens.find(
                          ({ id }) => id === tokenId,
                        );
                        return (
                          <button
                            key={tokenId}
                            ref={registerToken(tokenId)}
                            type="button"
                            className={styles.token}
                            aria-label={`Retirer ${token?.thaiRaw ?? ""} de la réponse`}
                            onClick={() => {
                              const next = orderedTokenIds.filter(
                                (id) => id !== tokenId,
                              );
                              setOrderedTokenIds(next);
                              setHint("");
                              persistDraft(currentExercise, {
                                kind: "word_order",
                                tokenIds: next,
                              });
                              // Le jeton change de zone : le focus le suit,
                              // sinon il retombe sur le document.
                              pendingTokenFocus.current = tokenId;
                            }}
                          >
                            <span lang="th">{token?.thaiRaw}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                  <div
                    className={styles.tokenBank}
                    role="group"
                    aria-label="Jetons disponibles"
                  >
                    {shuffledTokens(currentExercise)
                      .filter(({ id }) => !orderedTokenIds.includes(id))
                      .map((token) => (
                        <button
                          key={token.id}
                          ref={registerToken(token.id)}
                          type="button"
                          className={styles.token}
                          aria-label={`Déplacer ${token.thaiRaw} dans la réponse`}
                          onClick={() => {
                            const next = [...orderedTokenIds, token.id];
                            setOrderedTokenIds(next);
                            setHint("");
                            persistDraft(currentExercise, {
                              kind: "word_order",
                              tokenIds: next,
                            });
                            pendingTokenFocus.current = token.id;
                          }}
                        >
                          <span lang="th">{token.thaiRaw}</span>
                        </button>
                      ))}
                  </div>
                  <button
                    className={buttonClass("primary") + " " + styles.submit}
                    type="button"
                    aria-busy={isSaving}
                    disabled={isSaving}
                    onClick={() => submitWordOrder(currentExercise)}
                  >
                    {isSaving ? "Enregistrement…" : "Valider"}
                  </button>
                </>
              )}

              {currentExercise.type === "recall" && (
                <>
                  <label className={styles.recallField}>
                    <span>Votre réponse</span>
                    <input
                      type="text"
                      lang="th"
                      autoComplete="off"
                      spellCheck={false}
                      value={recallValue}
                      onChange={(event) => {
                        setRecallValue(event.target.value);
                        setHint("");
                      }}
                      onBlur={() => {
                        persistDraft(currentExercise, {
                          kind: "recall",
                          value: recallValue,
                        });
                      }}
                    />
                  </label>
                  <button
                    className={buttonClass("primary") + " " + styles.submit}
                    type="button"
                    aria-busy={isSaving}
                    disabled={isSaving}
                    onClick={() => submitRecall(currentExercise)}
                  >
                    {isSaving ? "Enregistrement…" : "Valider"}
                  </button>
                </>
              )}

              {currentExercise.type === "reading" && (
                <>
                  {/* Exercice de lecture : le thaï doit être exposé tel
                      quel, pas remplacé par une étiquette française. */}
                  <p className={styles.glyph} lang="th">
                    {itemsById.get(currentExercise.itemId)?.thaiRaw}
                  </p>
                  <fieldset className={styles.answerList}>
                    <legend className="srOnly">Options de réponse</legend>
                    {currentExercise.options.map((option) => (
                      <label
                        className={
                          selectedOptionId === option.id
                            ? styles.answer + " " + styles.answerSelected
                            : styles.answer
                        }
                        key={option.id}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={option.id}
                          checked={selectedOptionId === option.id}
                          disabled={isSaving}
                          onChange={() => {
                            setSelectedOptionId(option.id);
                            setHint("");
                          }}
                        />
                        <span>{option.labelFr}</span>
                        <BrandCurve
                          curve="underline"
                          width={200}
                          height={7}
                          strokeWidth={3.5}
                          className={styles.answerUnderline}
                        />
                      </label>
                    ))}
                  </fieldset>
                  <button
                    className={buttonClass("primary") + " " + styles.submit}
                    type="button"
                    aria-busy={isSaving}
                    disabled={isSaving}
                    onClick={() => submitReading(currentExercise)}
                  >
                    {isSaving ? "Enregistrement…" : "Valider"}
                  </button>
                </>
              )}

              {hint && (
                <p className={styles.inlineError} role="alert">
                  {hint}
                </p>
              )}
              {errorMessage && (
                <p className={styles.inlineError} role="alert">
                  {errorMessage}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Pas de région live sur le récapitulatif : il prend le focus, et une
          région live imbriquée relirait toute la page. */}
      {stage === "recap" && (
        <div className={styles.body}>
          <p className={styles.eyebrow}>Expédition terminée</p>
          <h1 id="lesson-title" ref={cardHeading} tabIndex={-1}>
            La courbe de la séance est complète.
          </h1>
          <div className={styles.recapTrail}>
            <ExpeditionTrail total={plan.length} completed={plan.length} />
          </div>
          <ul className={styles.recapList}>
            {lesson.exercises.map((exercise) => {
              const result = results.find(
                ({ exerciseId }) => exerciseId === exercise.id,
              );
              const projection = projectionForExercise(exercise);
              return (
                <li
                  key={exercise.id}
                  className={
                    result?.rating === 1
                      ? styles.recapRow + " " + styles.recapRowCorrect
                      : styles.recapRow
                  }
                >
                  <span>{MECHANIC_LABELS[exercise.type]}</span>
                  <strong>{result?.rating === 1 ? "Juste" : "À revoir"}</strong>
                  <span className={styles.recapMastery}>
                    {projection === undefined
                      ? "Maîtrise à calculer"
                      : `Maîtrise ${projection.masteryScore} ‰`}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className={styles.masteryPanel}>
            <div>
              <span>Maîtrise estimée</span>
              <strong>{listeningProjection?.masteryScore ?? 0} ‰</strong>
            </div>
            <div>
              <span>Prochaine révision</span>
              <strong>
                {nextReviewAt === null
                  ? "À calculer"
                  : new Intl.DateTimeFormat("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(nextReviewAt))}
              </strong>
            </div>
          </div>
          <LocalVoiceComparison
            modelAudioSrc="/audio/fixture-tone.wav"
            onBeforeCapture={stopSignal}
            sessionBoundaryRevision={sessionBoundaryRevision}
          />
          <p className={styles.note}>
            Les cinq résultats sont consignés sur cet appareil et rejoignent
            votre compte à la prochaine synchronisation.
          </p>
          <ContentReportPanel
            analytics={analytics}
            contentVersionId={lesson.versionId}
            exerciseId={plan[0] ?? lesson.versionId}
            online={online}
          />
          {errorMessage && (
            <p className={styles.inlineError} role="alert">
              {errorMessage}
            </p>
          )}
          <div className={styles.actions}>
            <button
              className={buttonClass("primary")}
              type="button"
              aria-busy={isSaving}
              disabled={isSaving}
              onClick={finishExpedition}
            >
              {isSaving ? "Clôture…" : "Terminer la séance"}
            </button>
            <Link className={buttonClass("ghost")} href="/account">
              Découvrir le compte
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
