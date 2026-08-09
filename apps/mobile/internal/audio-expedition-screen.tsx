// Aperçu éditorial conservé hors du graphe Expo public.
import type { AnalyticsSink } from "@thainaute/analytics";
import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import {
  attemptSubmissionSchema,
  createAttemptOutboxSnapshot,
  MAX_ATTEMPT_DURATION_MS,
  type AttemptOutboxSnapshot,
  type LocalExperienceSnapshot,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import { useAudioPlayer } from "expo-audio";
import { randomUUID } from "expo-crypto";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MobileAttemptOutboxStore } from "../lib/attempt-outbox-store";
import { useMobileAnalytics } from "../lib/analytics-provider";
import {
  getMobileUnit01AudioExpeditionConfig,
  type AudioExpeditionConfig,
  type AudioExpeditionExerciseConfig,
} from "../lib/embedded-audio-expedition-config";
import {
  getProjectionForExercise,
  ingestAudioExpeditionOutbox,
  nextAudioExpeditionExercise,
} from "../lib/audio-expedition-state";
import { MobileLocalExperienceStore } from "../lib/mobile-local-experience-store";
import { THAI_FONT_REGULAR, THAI_FONT_SEMIBOLD } from "../lib/typography";

type Stage = "intro" | "question" | "celebration" | "recap";
type StorageStatus = "loading" | "ready" | "error";
type Rating = 0 | 1;

interface Celebration {
  readonly dueAt: string | null | undefined;
  readonly exerciseId: string;
  readonly masteryScore: number;
  readonly rating: Rating;
}

function submissionsAreEqual(
  left: ValidatedAttemptSubmission,
  right: ValidatedAttemptSubmission,
): boolean {
  return (
    left.eventId === right.eventId &&
    left.deviceId === right.deviceId &&
    left.exerciseId === right.exerciseId &&
    left.selectedOptionId === right.selectedOptionId &&
    left.answeredAt === right.answeredAt &&
    left.durationMs === right.durationMs &&
    left.contentVersionId === right.contentVersionId &&
    left.algorithmVersion === right.algorithmVersion
  );
}

function outboxContainsSubmission(
  outbox: AttemptOutboxSnapshot,
  submission: ValidatedAttemptSubmission,
): boolean {
  return outbox.entries.some(
    ({ status, submission: candidate }) =>
      status !== "rejected" && submissionsAreEqual(candidate, submission),
  );
}

function durationBucket(
  durationMs: number,
): "under_10s" | "10_to_30s" | "over_30s" {
  if (durationMs < 10_000) return "under_10s";
  if (durationMs <= 30_000) return "10_to_30s";
  return "over_30s";
}

function safeCapture(
  analytics: AnalyticsSink,
  event: Parameters<AnalyticsSink["capture"]>[0],
): void {
  try {
    analytics.capture(event);
  } catch {
    // L'analytics facultative ne bloque jamais une progression locale.
  }
}

function dueAtText(dueAt: string | null | undefined): string {
  if (dueAt === null || dueAt === undefined) return "\u00c0 calculer";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dueAt));
}

function feedbackText(
  exercise: AudioExpeditionExerciseConfig,
  rating: Rating,
): string {
  return rating === 1
    ? exercise.exercise.feedback.correctFr
    : exercise.exercise.feedback.incorrectFr;
}

function ExpeditionHeader({ step }: { readonly step: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.logo}>
        <Text style={styles.logoThai} accessibilityLanguage="th-TH">
          ไ
        </Text>
      </View>
      <Text style={styles.brand}>{"Tha\u00efnaute"}</Text>
      <Text style={styles.step}>{step}</Text>
    </View>
  );
}

function ExpeditionBanner({
  config,
  pendingAttempts,
  storageStatus,
}: {
  readonly config: AudioExpeditionConfig;
  readonly pendingAttempts: number;
  readonly storageStatus: StorageStatus;
}) {
  const storageText =
    storageStatus === "loading"
      ? "Pr\u00e9paration du journal local\u2026"
      : storageStatus === "error"
        ? "Journal local indisponible"
        : `${pendingAttempts} tentative${pendingAttempts > 1 ? "s" : ""} conserv\u00e9e${pendingAttempts > 1 ? "s" : ""} localement`;

  return (
    <View style={styles.banner}>
      <Text style={styles.bannerTitle}>{config.bannerTitle}</Text>
      <Text style={styles.bannerText}>
        {config.bannerText} {"\u00b7"} {storageText}
      </Text>
    </View>
  );
}

function IntroStage({
  config,
  message,
  onPlaySignal,
  onRetryStorage,
  onStart,
  storageStatus,
}: {
  readonly config: AudioExpeditionConfig;
  readonly message: string;
  readonly onPlaySignal: () => void;
  readonly onRetryStorage: () => void;
  readonly onStart: () => void;
  readonly storageStatus: StorageStatus;
}) {
  const loading = storageStatus === "loading";
  const error = storageStatus === "error";
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>{config.introEyebrow}</Text>
      <Text accessibilityRole="header" style={styles.title}>
        {config.lesson.titleFr}
      </Text>
      <Text style={styles.body}>{config.lesson.objectiveFr}</Text>
      <Text style={styles.body}>
        {
          "Six \u00e9coutes courtes. \u00c9coutez d'abord, choisissez ensuite. Chaque r\u00e9ponse est conserv\u00e9e localement pour calculer votre prochaine r\u00e9vision, m\u00eame hors connexion."
        }
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: loading }}
        disabled={loading}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
          loading && styles.disabled,
        ]}
        onPress={error ? onRetryStorage : onStart}
      >
        <Text style={styles.primaryButtonText}>
          {error ? "R\u00e9essayer le stockage" : "Commencer l'exp\u00e9dition"}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        style={styles.secondaryButton}
        onPress={onPlaySignal}
      >
        <Text style={styles.secondaryButtonText}>
          {"\u00c9couter le premier signal"}
        </Text>
      </Pressable>
      {message !== "" && (
        <Text accessibilityRole="alert" style={styles.error}>
          {message}
        </Text>
      )}
    </View>
  );
}

function QuestionStage({
  current,
  index,
  isSaving,
  message,
  onPlaySignal,
  onSelectOption,
  onSubmit,
  selectedOptionId,
  total,
}: {
  readonly current: AudioExpeditionExerciseConfig;
  readonly index: number;
  readonly isSaving: boolean;
  readonly message: string;
  readonly onPlaySignal: () => void;
  readonly onSelectOption: (optionId: string) => void;
  readonly onSubmit: () => void;
  readonly selectedOptionId: string | null;
  readonly total: number;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>
        {"\u00c9COUTE \u00b7 "}
        {index + 1}/{total}
      </Text>
      <Text style={styles.exercisePrompt}>{current.exercise.promptFr}</Text>
      <Pressable
        accessibilityLabel={"R\u00e9\u00e9couter le signal"}
        accessibilityRole="button"
        style={styles.audioButton}
        onPress={onPlaySignal}
      >
        <Text accessible={false} style={styles.audioButtonText}>
          {"\u25b6 R\u00e9\u00e9couter le signal"}
        </Text>
      </Pressable>
      <View accessibilityRole="radiogroup" style={styles.answers}>
        {current.exercise.options.map((option) => {
          const selected = option.id === selectedOptionId;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled: isSaving }}
              disabled={isSaving}
              key={option.id}
              style={[
                styles.answer,
                selected && styles.answerSelected,
                isSaving && styles.disabled,
              ]}
              onPress={() => onSelectOption(option.id)}
            >
              <View style={[styles.radio, selected && styles.radioSelected]} />
              <Text style={styles.answerText}>{option.labelFr}</Text>
            </Pressable>
          );
        })}
      </View>
      {message !== "" && (
        <Text accessibilityRole="alert" style={styles.error}>
          {message}
        </Text>
      )}
      <Pressable
        accessibilityLabel={isSaving ? "Enregistrement en cours" : "Valider"}
        accessibilityRole="button"
        accessibilityState={{ disabled: isSaving }}
        disabled={isSaving}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
          isSaving && styles.disabled,
        ]}
        onPress={onSubmit}
      >
        <Text style={styles.primaryButtonText}>
          {isSaving ? "Enregistrement\u2026" : "Valider"}
        </Text>
      </Pressable>
    </View>
  );
}

function CelebrationStage({
  current,
  celebration,
  onContinue,
}: {
  readonly current: AudioExpeditionExerciseConfig;
  readonly celebration: Celebration;
  readonly onContinue: () => void;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>
        {"R\u00c9PONSE CONSERV\u00c9E HORS LIGNE"}
      </Text>
      <Text accessibilityRole="header" style={styles.title}>
        {feedbackText(current, celebration.rating)}
      </Text>
      <Text style={styles.glyph} accessibilityLanguage="th-TH">
        {current.item.thaiRaw}
      </Text>
      <Text style={styles.translation}>{current.item.translationFr}</Text>
      <View style={styles.metric}>
        <Text style={styles.metricLabel}>{"MA\u00ceTRISE ESTIM\u00c9E"}</Text>
        <Text style={styles.metricValue}>
          {celebration.masteryScore} {"\u2030"}
        </Text>
      </View>
      <View style={styles.metric}>
        <Text style={styles.metricLabel}>{"PROCHAINE R\u00c9VISION"}</Text>
        <Text style={styles.metricDate}>{dueAtText(celebration.dueAt)}</Text>
      </View>
      <Text style={styles.body}>
        {
          "L'exercice suivant vous attend. Vous pouvez continuer sans r\u00e9seau ; l'envoi serveur reprendra plus tard avec le m\u00eame \u00e9v\u00e9nement."
        }
      </Text>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
        ]}
        onPress={onContinue}
      >
        <Text style={styles.primaryButtonText}>Continuer</Text>
      </Pressable>
    </View>
  );
}

function RecapStage({
  config,
  outbox,
  onFinish,
}: {
  readonly config: AudioExpeditionConfig;
  readonly onFinish: () => void;
  readonly outbox: AttemptOutboxSnapshot;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>{"EXP\u00c9DITION TERMIN\u00c9E"}</Text>
      <Text accessibilityRole="header" style={styles.title}>
        {"Six \u00e9coutes. Une premi\u00e8re trace de m\u00e9moire."}
      </Text>
      <Text style={styles.body}>
        {
          "Chaque ligne correspond \u00e0 une tentative locale et \u00e0 une prochaine r\u00e9vision calcul\u00e9e par le m\u00eame moteur."
        }
      </Text>
      <View style={styles.recapList}>
        {config.exercises.map((exercise, index) => {
          const projection = getProjectionForExercise(outbox, config, exercise);
          return (
            <View key={exercise.exercise.id} style={styles.recapRow}>
              <Text style={styles.recapIndex}>{index + 1}</Text>
              <View style={styles.recapCopy}>
                <Text style={styles.recapThai} accessibilityLanguage="th-TH">
                  {exercise.item.thaiRaw}
                </Text>
                <Text style={styles.recapTranslation}>
                  {exercise.item.translationFr}
                </Text>
              </View>
              <View style={styles.recapScore}>
                <Text style={styles.recapScoreValue}>
                  {projection?.masteryScore ?? 0} {"\u2030"}
                </Text>
                <Text style={styles.recapDue}>
                  {dueAtText(projection?.dueAt)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
        ]}
        onPress={onFinish}
      >
        <Text style={styles.primaryButtonText}>
          {"Retour \u00e0 l'unit\u00e9 1"}
        </Text>
      </Pressable>
    </View>
  );
}

function UnavailableAudioExpedition({
  lessonId,
}: {
  readonly lessonId: string;
}) {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.screen}>
          <Text style={styles.eyebrow}>CONTENU MOBILE</Text>
          <Text accessibilityRole="header" style={styles.title}>
            {"Cette exp\u00e9dition n'est pas encore disponible."}
          </Text>
          <Text style={styles.body}>
            {`La le\u00e7on ${lessonId} reste bloqu\u00e9e tant que ses audio et sa m\u00e9canique ne sont pas pr\u00eats localement.`}
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={() => router.push("/unit-01")}
          >
            <Text style={styles.primaryButtonText}>
              {"Retour \u00e0 l'unit\u00e9 1"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function AudioExpeditionExperience({
  analytics,
  config,
}: {
  readonly analytics: AnalyticsSink;
  readonly config: AudioExpeditionConfig;
}) {
  const database = useSQLiteContext();
  const router = useRouter();
  const player = useAudioPlayer();
  const outboxStore = useMemo(
    () =>
      new MobileAttemptOutboxStore(database, undefined, config.outboxNamespace),
    [config.outboxNamespace, database],
  );
  const demoOutboxStore = useMemo(
    () => new MobileAttemptOutboxStore(database, undefined, "demo"),
    [database],
  );
  const experienceStore = useMemo(
    () => new MobileLocalExperienceStore(database),
    [database],
  );
  const [stage, setStage] = useState<Stage>("intro");
  const [storageStatus, setStorageStatus] = useState<StorageStatus>("loading");
  const [storageRetryToken, setStorageRetryToken] = useState(0);
  const [outbox, setOutbox] = useState<AttemptOutboxSnapshot>(() =>
    createAttemptOutboxSnapshot(),
  );
  const [experienceSnapshot, setExperienceSnapshot] =
    useState<LocalExperienceSnapshot | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const submissionInFlight = useRef(false);
  const checkpointInFlight = useRef(false);
  const finishInFlight = useRef(false);

  useEffect(() => {
    let active = true;

    void Promise.all([outboxStore.read(), experienceStore.read()])
      .then(async ([storedOutbox, storedExperience]) => {
        if (storedExperience.onboarding.status !== "completed") {
          if (active) router.replace("/");
          return;
        }

        let recoveredOutbox = storedOutbox;
        let recoveredExperience = storedExperience;
        const storedExpedition = storedExperience.expedition;

        if (
          storedExpedition !== null &&
          storedExpedition.lessonVersionId !== config.lesson.versionId
        ) {
          throw new Error(
            "Une autre exp\u00e9dition est d\u00e9j\u00e0 conserv\u00e9e. Reprenez-la avant d'en commencer une nouvelle.",
          );
        }

        if (storedExpedition === null && storedExperience.lesson !== null) {
          const checkpoint = storedExperience.lesson;
          let lessonOutbox = recoveredOutbox;
          let lessonOutboxStore = outboxStore;
          if (
            checkpoint.phase !== "intro" &&
            checkpoint.phase !== "question" &&
            !outboxContainsSubmission(lessonOutbox, checkpoint.submission)
          ) {
            const demoOutbox = await demoOutboxStore.read();
            if (outboxContainsSubmission(demoOutbox, checkpoint.submission)) {
              lessonOutbox = demoOutbox;
              lessonOutboxStore = demoOutboxStore;
            }
          }
          if (checkpoint.phase === "intro" || checkpoint.phase === "question") {
            recoveredExperience = await experienceStore.discardLessonQuestion();
          } else {
            if (checkpoint.phase === "submitting") {
              lessonOutbox = await lessonOutboxStore.enqueue(
                checkpoint.submission,
              );
              recoveredExperience = await experienceStore.confirmLessonResult(
                lessonOutbox,
                new Date().toISOString(),
              );
              if (lessonOutboxStore === outboxStore) {
                recoveredOutbox = lessonOutbox;
              }
            }
            const recoveredCheckpoint = recoveredExperience.lesson;
            if (
              recoveredCheckpoint === null ||
              (recoveredCheckpoint.phase !== "result" &&
                recoveredCheckpoint.phase !== "completed")
            ) {
              throw new Error(
                "La session locale pr\u00e9c\u00e9dente doit \u00eatre reprise.",
              );
            }
            recoveredExperience = await experienceStore.finishLesson(
              lessonOutbox,
              new Date().toISOString(),
            );
            const checkpointToAbandon = recoveredExperience.lesson;
            if (checkpointToAbandon === null) {
              throw new Error(
                "Le checkpoint pr\u00e9c\u00e9dent est introuvable.",
              );
            }
            const replacementExercise = config.exercises.find(
              ({ exercise }) => exercise.id !== checkpoint.exerciseId,
            );
            if (replacementExercise === undefined) {
              throw new Error(
                "La nouvelle exp\u00e9dition n'a pas de cible distincte.",
              );
            }
            recoveredExperience =
              await experienceStore.abandonLessonForVersionChange(
                checkpointToAbandon,
                config.lesson.versionId,
                replacementExercise.exercise.id,
                lessonOutbox,
              );
          }
        }

        if (recoveredExperience.expedition !== null) {
          const expeditionBeforeLesson = recoveredExperience.expedition;
          const checkpoint = recoveredExperience.lesson;
          if (checkpoint !== null) {
            if (
              !recoveredExperience.expedition.exerciseIds.includes(
                checkpoint.exerciseId,
              )
            ) {
              throw new Error("Le checkpoint ne correspond pas au plan audio.");
            }
            if (checkpoint.phase === "submitting") {
              recoveredOutbox = await outboxStore.enqueue(
                checkpoint.submission,
              );
              recoveredExperience = await experienceStore.confirmLessonResult(
                recoveredOutbox,
                new Date().toISOString(),
              );
            }
            const recoveredCheckpoint = recoveredExperience.lesson;
            if (
              recoveredCheckpoint !== null &&
              (recoveredCheckpoint.phase === "result" ||
                recoveredCheckpoint.phase === "completed")
            ) {
              const durableEntry = recoveredOutbox.entries.find(
                ({ submission }) =>
                  submission.eventId === recoveredCheckpoint.submission.eventId,
              );
              if (
                durableEntry === undefined ||
                durableEntry.status === "rejected" ||
                !submissionsAreEqual(
                  durableEntry.submission,
                  recoveredCheckpoint.submission,
                )
              ) {
                throw new Error(
                  "Le r\u00e9sultat local ne correspond plus au journal.",
                );
              }
              if (recoveredCheckpoint.phase === "result") {
                recoveredExperience = await experienceStore.finishLesson(
                  recoveredOutbox,
                  new Date().toISOString(),
                );
              }
              const accepted = ingestAudioExpeditionOutbox(
                recoveredOutbox,
                config,
              ).events.find(
                ({ eventId }) =>
                  eventId === recoveredCheckpoint.submission.eventId,
              );
              if (accepted === undefined) {
                throw new Error(
                  "La tentative audio n'a pas pu \u00eatre \u00e9valu\u00e9e.",
                );
              }
              if (
                !expeditionBeforeLesson.results.some(
                  ({ exerciseId }) =>
                    exerciseId === recoveredCheckpoint.exerciseId,
                )
              ) {
                recoveredExperience =
                  await experienceStore.recordExpeditionResult({
                    exerciseId: recoveredCheckpoint.exerciseId,
                    rating: accepted.rating,
                    answeredAt: recoveredCheckpoint.submission.answeredAt,
                  });
              }
            }
          }
        }

        if (recoveredExperience.expedition === null) {
          if (active) {
            setStage("intro");
            setExperienceSnapshot(recoveredExperience);
            setOutbox(recoveredOutbox);
            setStorageStatus("ready");
          }
          return;
        }

        if (!active) return;
        const activeExpedition = recoveredExperience.expedition;
        if (activeExpedition === null) {
          throw new Error(
            "L'exp\u00e9dition locale a disparu pendant la reprise.",
          );
        }
        setOutbox(recoveredOutbox);
        setExperienceSnapshot(recoveredExperience);
        const complete =
          activeExpedition.results.length ===
          activeExpedition.exerciseIds.length;
        const current = nextAudioExpeditionExercise(
          config,
          recoveredExperience,
        );
        setSelectedOptionId(
          recoveredExperience.lesson?.phase === "question"
            ? recoveredExperience.lesson.selectedOptionId
            : null,
        );
        setStartedAt(
          recoveredExperience.lesson === null
            ? Date.now()
            : Date.parse(recoveredExperience.lesson.sessionStartedAt),
        );
        setStage(complete ? "recap" : "question");
        if (current === undefined && !complete) {
          throw new Error("L'exercice audio suivant est introuvable.");
        }
        setStorageStatus("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setStorageStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Le parcours audio local n'a pas pu \u00eatre repris.",
        );
      });

    return () => {
      active = false;
    };
  }, [
    config,
    demoOutboxStore,
    experienceStore,
    outboxStore,
    router,
    storageRetryToken,
  ]);

  const current = nextAudioExpeditionExercise(config, experienceSnapshot);
  const currentIndex =
    current === undefined ? -1 : config.exercises.indexOf(current);

  function playSignal(): void {
    const target =
      stage === "intro"
        ? config.exercises[0]
        : celebration !== null
          ? config.exercises.find(
              ({ exercise }) => exercise.id === celebration.exerciseId,
            )
          : current;
    if (target === undefined) return;
    setMessage("");
    player.pause();
    player.replace(target.modelAudioSource);
    player.play();
  }

  async function submitAnswer(): Promise<void> {
    if (current === undefined || selectedOptionId === null) {
      setMessage("Choisissez une option avant de valider.");
      return;
    }
    if (storageStatus !== "ready") {
      setMessage("Le journal local n'est pas encore disponible.");
      return;
    }
    const currentExperience = experienceSnapshot;
    const currentLesson = currentExperience?.lesson;
    if (
      currentExperience?.expedition === null ||
      currentExperience?.expedition === undefined ||
      currentLesson === null ||
      currentLesson === undefined ||
      (currentLesson.phase !== "question" &&
        currentLesson.phase !== "submitting")
    ) {
      setMessage(
        "La question doit d'abord \u00eatre conserv\u00e9e localement.",
      );
      return;
    }

    let exactSubmission: ValidatedAttemptSubmission;
    try {
      if (currentLesson.phase === "submitting") {
        exactSubmission = currentLesson.submission;
      } else {
        const deviceId = await outboxStore.getOrCreateDeviceId(randomUUID);
        const answeredAt = new Date().toISOString();
        const candidate = attemptSubmissionSchema.parse({
          eventId: randomUUID(),
          deviceId,
          exerciseId: current.exercise.id,
          selectedOptionId,
          answeredAt,
          durationMs: Math.min(
            MAX_ATTEMPT_DURATION_MS,
            Math.max(0, Date.now() - startedAt),
          ),
          contentVersionId: config.lesson.versionId,
          algorithmVersion: SRS_ALGORITHM_VERSION,
        });
        const prepared = await experienceStore.prepareLessonSubmission(
          candidate,
          answeredAt,
        );
        if (prepared.lesson?.phase !== "submitting") {
          throw new Error(
            "La tentative n'a pas \u00e9t\u00e9 r\u00e9serv\u00e9e.",
          );
        }
        exactSubmission = prepared.lesson.submission;
        setExperienceSnapshot(prepared);
      }

      const durableOutbox = await outboxStore.enqueue(exactSubmission);
      setOutbox(durableOutbox);
      const confirmed = await experienceStore.confirmLessonResult(
        durableOutbox,
        new Date().toISOString(),
      );
      if (confirmed.lesson?.phase !== "result") {
        throw new Error(
          "Le r\u00e9sultat local n'a pas \u00e9t\u00e9 confirm\u00e9.",
        );
      }
      await experienceStore.finishLesson(
        durableOutbox,
        new Date().toISOString(),
      );
      const accepted = ingestAudioExpeditionOutbox(
        durableOutbox,
        config,
      ).events.find(({ eventId }) => eventId === exactSubmission.eventId);
      if (accepted === undefined) {
        throw new Error(
          "La tentative audio n'a pas pu \u00eatre \u00e9valu\u00e9e.",
        );
      }
      const recorded = await experienceStore.recordExpeditionResult({
        exerciseId: current.exercise.id,
        rating: accepted.rating,
        answeredAt: exactSubmission.answeredAt,
      });
      const projection = getProjectionForExercise(
        durableOutbox,
        config,
        current,
      );
      setExperienceSnapshot(recorded);
      setCelebration({
        dueAt: projection?.dueAt,
        exerciseId: current.exercise.id,
        masteryScore: projection?.masteryScore ?? 0,
        rating: accepted.rating,
      });
      setSelectedOptionId(null);
      setStage("celebration");
      safeCapture(analytics, {
        name: "exercise_answered",
        lessonVersionId: config.lesson.versionId,
        exerciseType: "audio_choice",
        correct: accepted.rating === 1,
        durationBucket: durationBucket(exactSubmission.durationMs),
        platform: Platform.OS === "ios" ? "ios" : "android",
      });
      AccessibilityInfo.announceForAccessibility(
        accepted.rating === 1
          ? current.exercise.feedback.correctFr
          : current.exercise.feedback.incorrectFr,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "La tentative reste locale et sera reprise sans doublon.",
      );
    }
  }

  function handleSubmit(): void {
    if (submissionInFlight.current) return;
    submissionInFlight.current = true;
    setIsSaving(true);
    setMessage("");
    void submitAnswer().finally(() => {
      submissionInFlight.current = false;
      setIsSaving(false);
    });
  }

  function handleStart(): void {
    if (checkpointInFlight.current || storageStatus !== "ready") return;
    checkpointInFlight.current = true;
    setIsSaving(true);
    setMessage("");
    const started = new Date().toISOString();
    void experienceStore
      .startExpedition({
        lessonVersionId: config.lesson.versionId,
        exerciseIds: config.exercises.map(({ exercise }) => exercise.id),
        startedAt: started,
      })
      .then((next) => {
        setExperienceSnapshot(next);
        setStartedAt(Date.now());
        setStage("question");
        safeCapture(analytics, {
          name: "lesson_started",
          lessonVersionId: config.lesson.versionId,
          platform: Platform.OS === "ios" ? "ios" : "android",
        });
      })
      .catch((error: unknown) => {
        setMessage(
          error instanceof Error
            ? error.message
            : "L'exp\u00e9dition n'a pas pu d\u00e9marrer. R\u00e9essayez.",
        );
      })
      .finally(() => {
        checkpointInFlight.current = false;
        setIsSaving(false);
      });
  }

  function handleSelectOption(optionId: string): void {
    if (
      current === undefined ||
      checkpointInFlight.current ||
      storageStatus !== "ready"
    ) {
      return;
    }
    checkpointInFlight.current = true;
    setIsSaving(true);
    setMessage("");
    const previousSelectedOptionId = selectedOptionId;
    setSelectedOptionId(optionId);
    const started = startedAt === 0 ? Date.now() : startedAt;
    const now = new Date().toISOString();
    void experienceStore
      .selectExpeditionOption({
        lessonVersionId: config.lesson.versionId,
        exerciseId: current.exercise.id,
        startedAt: new Date(started).toISOString(),
        selectedOptionId: optionId,
        now,
      })
      .then((next) => {
        setExperienceSnapshot(next);
        setStartedAt(started);
        setSelectedOptionId(optionId);
      })
      .catch((error: unknown) => {
        setSelectedOptionId(previousSelectedOptionId);
        setMessage(
          error instanceof Error
            ? error.message
            : "Ce choix n'a pas pu \u00eatre conserv\u00e9. R\u00e9essayez.",
        );
      })
      .finally(() => {
        checkpointInFlight.current = false;
        setIsSaving(false);
      });
  }

  function handleContinue(): void {
    setCelebration(null);
    setMessage("");
    const completed =
      experienceSnapshot?.expedition?.results.length ===
      config.exercises.length;
    setStage(completed ? "recap" : "question");
    setStartedAt(Date.now());
  }

  function handleFinish(): void {
    if (finishInFlight.current || storageStatus !== "ready") return;
    if (
      experienceSnapshot?.expedition === null ||
      experienceSnapshot?.expedition === undefined ||
      experienceSnapshot.expedition.results.length !== config.exercises.length
    ) {
      setMessage("Terminez les six exercices avant de cl\u00f4turer.");
      return;
    }
    finishInFlight.current = true;
    setMessage("");
    void experienceStore
      .clearCompletedExpedition(new Date().toISOString())
      .then((next) => {
        setExperienceSnapshot(next);
        safeCapture(analytics, {
          name: "lesson_completed",
          lessonVersionId: config.lesson.versionId,
          platform: Platform.OS === "ios" ? "ios" : "android",
        });
        router.push("/unit-01");
      })
      .catch((error: unknown) => {
        setMessage(
          error instanceof Error
            ? error.message
            : "L'exp\u00e9dition reste conserv\u00e9e localement.",
        );
      })
      .finally(() => {
        finishInFlight.current = false;
      });
  }

  function retryStorage(): void {
    setStorageStatus("loading");
    setMessage("");
    setStorageRetryToken((value) => value + 1);
  }

  const pendingAttempts = outbox.entries.filter(
    ({ status }) => status === "pending",
  ).length;
  const completed =
    experienceSnapshot?.expedition?.results.length === config.exercises.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ExpeditionHeader step={config.headerStep} />
      <ExpeditionBanner
        config={config}
        pendingAttempts={pendingAttempts}
        storageStatus={storageStatus}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {stage === "intro" && (
          <IntroStage
            config={config}
            message={message}
            onPlaySignal={playSignal}
            onRetryStorage={retryStorage}
            onStart={handleStart}
            storageStatus={storageStatus}
          />
        )}
        {stage === "question" && current !== undefined && (
          <QuestionStage
            current={current}
            index={currentIndex}
            isSaving={isSaving}
            message={message}
            onPlaySignal={playSignal}
            onSelectOption={handleSelectOption}
            onSubmit={handleSubmit}
            selectedOptionId={selectedOptionId}
            total={config.exercises.length}
          />
        )}
        {stage === "celebration" &&
          celebration !== null &&
          config.exercises.find(
            ({ exercise }) => exercise.id === celebration.exerciseId,
          ) !== undefined && (
            <CelebrationStage
              celebration={celebration}
              current={
                config.exercises.find(
                  ({ exercise }) => exercise.id === celebration.exerciseId,
                ) as AudioExpeditionExerciseConfig
              }
              onContinue={handleContinue}
            />
          )}
        {stage === "recap" && completed && (
          <RecapStage config={config} onFinish={handleFinish} outbox={outbox} />
        )}
        {storageStatus === "error" && stage !== "intro" && (
          <View style={styles.storageError}>
            <Text accessibilityRole="alert" style={styles.error}>
              {message}
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.secondaryButton}
              onPress={retryStorage}
            >
              <Text style={styles.secondaryButtonText}>
                {"R\u00e9essayer le stockage"}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function AudioExpeditionRoute() {
  const { analytics } = useMobileAnalytics();
  const params = useLocalSearchParams<{ lessonId?: string }>();
  const rawLessonId = params.lessonId;
  const lessonId = Array.isArray(rawLessonId) ? rawLessonId[0] : rawLessonId;
  const config =
    lessonId === undefined
      ? undefined
      : getMobileUnit01AudioExpeditionConfig(lessonId);

  if (lessonId === undefined || config === undefined) {
    return <UnavailableAudioExpedition lessonId={lessonId ?? "inconnue"} />;
  }
  return (
    <AudioExpeditionExperience
      key={lessonId}
      analytics={analytics}
      config={config}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fbfaf7" },
  header: {
    minHeight: 72,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#cbd0d8",
  },
  logo: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#283450",
  },
  logoThai: {
    color: "white",
    fontFamily: THAI_FONT_SEMIBOLD,
    fontSize: 23,
    lineHeight: 34,
  },
  brand: { marginLeft: 10, color: "#283450", fontSize: 18, fontWeight: "800" },
  step: { marginLeft: "auto", color: "#6b7486", fontSize: 12 },
  banner: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    backgroundColor: "#fff3cf",
  },
  bannerTitle: { color: "#684c0d", fontSize: 13, fontWeight: "800" },
  bannerText: { marginTop: 2, color: "#7f6528", fontSize: 12 },
  content: { flexGrow: 1 },
  screen: {
    flex: 1,
    minHeight: 620,
    paddingHorizontal: 24,
    paddingVertical: 42,
    alignItems: "stretch",
  },
  eyebrow: {
    marginBottom: 16,
    color: "#236b58",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    color: "#283450",
    fontSize: 36,
    lineHeight: 43,
    fontWeight: "800",
    letterSpacing: -1.5,
  },
  exercisePrompt: {
    color: "#283450",
    fontSize: 22,
    lineHeight: 31,
    fontWeight: "800",
  },
  body: { marginTop: 18, color: "#5e6980", fontSize: 17, lineHeight: 27 },
  glyph: {
    marginTop: 28,
    color: "#283450",
    fontFamily: THAI_FONT_REGULAR,
    fontSize: 74,
    lineHeight: 104,
    textAlign: "center",
  },
  translation: { color: "#687287", fontSize: 15, textAlign: "center" },
  primaryButton: {
    minHeight: 52,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#283450",
  },
  primaryButtonText: { color: "white", fontSize: 16, fontWeight: "800" },
  secondaryButton: {
    minHeight: 48,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#cbd0d8",
    borderRadius: 999,
  },
  secondaryButtonText: { color: "#283450", fontWeight: "700" },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.5 },
  audioButton: {
    minHeight: 48,
    marginVertical: 26,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#eef1f4",
  },
  audioButtonText: { color: "#283450", fontWeight: "700" },
  answers: { gap: 12 },
  answer: {
    minHeight: 68,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#eef1f4",
    borderRadius: 18,
    backgroundColor: "white",
  },
  answerSelected: { borderColor: "#43a283", backgroundColor: "#eff9f5" },
  radio: {
    width: 20,
    height: 20,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#8b94a4",
    borderRadius: 10,
  },
  radioSelected: { borderWidth: 6, borderColor: "#43a283" },
  answerText: { color: "#283450", fontSize: 16, fontWeight: "700" },
  error: { marginTop: 16, color: "#a23d38", fontWeight: "600" },
  storageError: { paddingHorizontal: 24, paddingBottom: 28 },
  metric: {
    minHeight: 106,
    marginTop: 14,
    padding: 20,
    justifyContent: "space-between",
    borderRadius: 18,
    backgroundColor: "#eef1f4",
  },
  metricLabel: {
    color: "#687287",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  metricValue: { color: "#236b58", fontSize: 28, fontWeight: "800" },
  metricDate: { color: "#283450", fontSize: 19, fontWeight: "700" },
  recapList: { marginTop: 22, gap: 10 },
  recapRow: {
    minHeight: 78,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#eef1f4",
  },
  recapIndex: { width: 24, color: "#687287", fontWeight: "800" },
  recapCopy: { flex: 1 },
  recapThai: {
    color: "#283450",
    fontFamily: THAI_FONT_REGULAR,
    fontSize: 20,
  },
  recapTranslation: { marginTop: 2, color: "#687287", fontSize: 12 },
  recapScore: { maxWidth: 116, alignItems: "flex-end" },
  recapScoreValue: { color: "#236b58", fontSize: 17, fontWeight: "800" },
  recapDue: {
    marginTop: 3,
    color: "#687287",
    fontSize: 10,
    textAlign: "right",
  },
});
