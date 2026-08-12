import type { AnalyticsSink } from "@thainaute/analytics";
import { colors } from "@thainaute/design-tokens";
import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import {
  attemptSubmissionSchema,
  createAttemptOutboxSnapshot,
  ingestAttemptBatch,
  isOptionAttempt,
  MAX_ATTEMPT_DURATION_MS,
  type AttemptOutboxSnapshot,
  type LocalExperienceSnapshot,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import { useAudioPlayer } from "expo-audio";
import { randomUUID } from "expo-crypto";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MobileContentReportPanel } from "../components/content-report-panel";
import {
  MobileAttemptOutboxStorageError,
  MobileAttemptOutboxStore,
} from "../lib/attempt-outbox-store";
import { useMobileAuthSession } from "../lib/auth-session";
import { useMobileAnalytics } from "../lib/analytics-provider";
import { MobileLocalExperienceStore } from "../lib/mobile-local-experience-store";
import {
  fixtureLessonConfig,
  type LessonExperienceConfig,
} from "../lib/lesson-config";
import { THAI_FONT_REGULAR, THAI_FONT_SEMIBOLD } from "../lib/typography";
import { useLocalVoicePractice } from "../lib/use-local-voice-practice";

function ingestLessonOutbox(
  outbox: AttemptOutboxSnapshot,
  config: LessonExperienceConfig,
) {
  return ingestAttemptBatch({
    existingEvents: [],
    submissions: outbox.entries
      .filter(({ status }) => status !== "rejected")
      .map(({ submission }) => submission)
      .filter(isOptionAttempt),
    answerKeys: [
      {
        exerciseId: config.exercise.id,
        itemId: config.item.id,
        correctOptionId: config.exercise.correctOptionId,
        skill: "listening",
        contentVersionId: config.lesson.versionId,
      },
    ],
    authenticatedUserId: null,
  });
}

function safeCapture(
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
  if (durationMs <= 30_000) return "10_to_30s";
  return "over_30s";
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

type Stage = "intro" | "question" | "result";
type StorageStatus = "loading" | "ready" | "error";
type ExerciseRating = 0 | 1 | null;
type VoicePractice = ReturnType<typeof useLocalVoicePractice>;
type PlaybackTarget = "model" | "recording";

interface PlaybackCopy {
  idleAccessibilityLabel: string;
  idleText: string;
  pauseAccessibilityLabel: string;
  pauseText: string;
  resumeAccessibilityLabel: string;
  resumeText: string;
}

const playbackCopy: Record<PlaybackTarget, PlaybackCopy> = {
  model: {
    idleAccessibilityLabel: "A, écouter le modèle",
    idleText: "A · Écouter le modèle",
    pauseAccessibilityLabel: "Mettre le modèle en pause",
    pauseText: "Pause modèle",
    resumeAccessibilityLabel: "Reprendre le modèle",
    resumeText: "Reprendre le modèle",
  },
  recording: {
    idleAccessibilityLabel: "B, écouter ma voix",
    idleText: "B · Écouter ma voix",
    pauseAccessibilityLabel: "Mettre ma voix en pause",
    pauseText: "Pause ma voix",
    resumeAccessibilityLabel: "Reprendre ma voix",
    resumeText: "Reprendre ma voix",
  },
};

function getStorageSummary(
  storageStatus: StorageStatus,
  pendingAttempts: number,
): string {
  if (storageStatus === "loading") return "Préparation du journal local…";
  if (storageStatus === "error") return "Journal local indisponible";

  const plural = pendingAttempts > 1 ? "s" : "";
  return `${pendingAttempts} tentative${plural} conservée${plural} localement`;
}

function getQuestionMessage(
  message: string,
  stage: Stage,
  voiceError: string,
): string {
  if (message !== "") return message;
  if (stage === "question") return voiceError;
  return "";
}

function getPlaybackButtonCopy(
  target: PlaybackTarget,
  active: boolean,
  paused: boolean,
): { accessibilityLabel: string; text: string } {
  const copy = playbackCopy[target];
  if (!active) {
    return {
      accessibilityLabel: copy.idleAccessibilityLabel,
      text: copy.idleText,
    };
  }
  if (paused) {
    return {
      accessibilityLabel: copy.resumeAccessibilityLabel,
      text: copy.resumeText,
    };
  }
  return {
    accessibilityLabel: copy.pauseAccessibilityLabel,
    text: copy.pauseText,
  };
}

function getRecordButtonText(voicePractice: VoicePractice): string {
  if (voicePractice.isRecording) {
    return `Arrêter · ${voicePractice.remainingSeconds} s max.`;
  }
  if (voicePractice.isBusy) return "Préparation…";
  if (voicePractice.hasRecording) return "Refaire mon essai";
  return "M’enregistrer";
}

function getRecordButtonAccessibilityLabel(
  voicePractice: VoicePractice,
): string {
  if (voicePractice.isRecording) {
    return `Arrêter mon enregistrement, ${voicePractice.remainingSeconds} secondes restantes au maximum`;
  }
  return "M’enregistrer sur cet appareil";
}

function getDueAtText(dueAt: string | null | undefined): string {
  if (dueAt === null || dueAt === undefined) return "À calculer";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dueAt));
}

function getFeedbackText(
  rating: ExerciseRating,
  exercise: LessonExperienceConfig["exercise"],
): string {
  if (rating === 1) return exercise.feedback.correctFr;
  return exercise.feedback.incorrectFr;
}

function LessonHeader({ step }: { readonly step: string }) {
  return (
    <View style={styles.header}>
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={styles.logo}
      >
        <Text style={styles.logoThai}>ท</Text>
      </View>
      <Text style={styles.brand}>Thaïnaute</Text>
      <Text style={styles.step}>{step}</Text>
    </View>
  );
}

function LessonBanner({
  text,
  title,
  pendingAttempts,
  storageStatus,
}: {
  readonly text: string;
  readonly title: string;
  readonly pendingAttempts: number;
  readonly storageStatus: StorageStatus;
}) {
  return (
    <View style={styles.fixtureBanner} accessibilityRole="summary">
      <Text style={styles.fixtureTitle}>{title}</Text>
      <Text style={styles.fixtureText}>{text}</Text>
      <Text style={styles.fixtureText} accessibilityLiveRegion="polite">
        {getStorageSummary(storageStatus, pendingAttempts)}
      </Text>
    </View>
  );
}

interface IntroStageProps {
  readonly config: LessonExperienceConfig;
  readonly error: string;
  readonly onPlaySignal: () => void;
  readonly onRetryStorage: () => void;
  readonly onStart: () => void;
  readonly storageStatus: StorageStatus;
}

function IntroStage({
  config,
  error,
  onPlaySignal,
  onRetryStorage,
  onStart,
  storageStatus,
}: IntroStageProps) {
  const storageIsLoading = storageStatus === "loading";
  const primaryButtonText =
    storageStatus === "error" ? "Réessayer le stockage" : "Commencer";

  function handlePrimaryPress(): void {
    if (storageStatus === "error") {
      onRetryStorage();
      return;
    }
    onStart();
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>{config.introEyebrow}</Text>
      <Text style={styles.title}>{config.lesson.titleFr}</Text>
      <Text style={styles.body}>{config.lesson.objectiveFr}</Text>
      <Text style={styles.glyph} accessibilityLanguage="th-TH">
        {config.item.thaiRaw}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: storageIsLoading }}
        disabled={storageIsLoading}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
          storageIsLoading && styles.disabled,
        ]}
        onPress={handlePrimaryPress}
      >
        <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        style={styles.secondaryButton}
        onPress={onPlaySignal}
      >
        <Text style={styles.secondaryButtonText}>Écouter le signal</Text>
      </Pressable>
      {error !== "" && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

interface QuestionStageProps {
  readonly config: LessonExperienceConfig;
  readonly isSaving: boolean;
  readonly message: string;
  readonly onPlaySignal: () => void;
  readonly onSelectOption: (optionId: string) => void;
  readonly onSubmit: () => void;
  readonly selectedOptionId: string | null;
}

function QuestionStage({
  config,
  isSaving,
  message,
  onPlaySignal,
  onSelectOption,
  onSubmit,
  selectedOptionId,
}: QuestionStageProps) {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>{config.questionEyebrow}</Text>
      <Text style={styles.title}>{config.exercise.promptFr}</Text>
      <Pressable
        accessibilityLabel="Réécouter le signal"
        accessibilityRole="button"
        style={styles.audioButton}
        onPress={onPlaySignal}
      >
        <Text accessible={false} style={styles.audioButtonText}>
          ▶ Réécouter le signal
        </Text>
      </Pressable>
      <View accessibilityRole="radiogroup" style={styles.answers}>
        {config.exercise.options.map((option) => {
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
              onPress={() => {
                onSelectOption(option.id);
              }}
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
        accessibilityRole="button"
        accessibilityState={{ disabled: isSaving, busy: isSaving }}
        disabled={isSaving}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
          isSaving && styles.disabled,
        ]}
        onPress={onSubmit}
      >
        <Text style={styles.primaryButtonText}>
          {isSaving ? "Enregistrement…" : "Valider"}
        </Text>
      </Pressable>
    </View>
  );
}

interface PlaybackButtonProps {
  readonly active: boolean;
  readonly disabled: boolean;
  readonly onPause: () => void;
  readonly onPlay: () => void | Promise<void>;
  readonly paused: boolean;
  readonly target: PlaybackTarget;
}

function PlaybackButton({
  active,
  disabled,
  onPause,
  onPlay,
  paused,
  target,
}: PlaybackButtonProps) {
  const copy = getPlaybackButtonCopy(target, active, paused);
  const playing = active && !paused;

  function handlePress(): void {
    if (playing) {
      onPause();
      return;
    }
    void onPlay();
  }

  return (
    <Pressable
      accessibilityLabel={copy.accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.voiceButton,
        active && styles.voiceButtonActive,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
    >
      <Text style={styles.voiceButtonText}>{copy.text}</Text>
    </Pressable>
  );
}

function RecordButton({
  voicePractice,
}: {
  readonly voicePractice: VoicePractice;
}) {
  function handlePress(): void {
    if (voicePractice.isRecording) {
      void voicePractice.stopRecording();
      return;
    }
    void voicePractice.startRecording();
  }

  return (
    <Pressable
      accessibilityLabel={getRecordButtonAccessibilityLabel(voicePractice)}
      accessibilityRole="button"
      accessibilityState={{
        busy: voicePractice.isBusy,
        disabled: voicePractice.isBusy,
      }}
      disabled={voicePractice.isBusy}
      style={({ pressed }) => [
        styles.recordButton,
        voicePractice.isRecording && styles.recordButtonActive,
        pressed && styles.pressed,
        voicePractice.isBusy && styles.disabled,
      ]}
      onPress={handlePress}
    >
      <Text style={styles.recordButtonText}>
        {getRecordButtonText(voicePractice)}
      </Text>
    </Pressable>
  );
}

function VoicePracticeCard({
  voicePractice,
}: {
  readonly voicePractice: VoicePractice;
}) {
  const modelPlayback = voicePractice.playback?.target === "model";
  const recordingPlayback = voicePractice.playback?.target === "recording";
  const playbackPaused = voicePractice.playback?.paused === true;
  const modelDisabled = voicePractice.isRecording || voicePractice.isBusy;
  const recordingDisabled =
    !voicePractice.canPlayRecording ||
    voicePractice.isRecording ||
    voicePractice.isBusy;

  return (
    <View style={styles.voiceCard}>
      <Text style={styles.voiceEyebrow}>PRATIQUE VOCALE OPTIONNELLE</Text>
      <Text style={styles.voiceTitle}>Comparez A et B</Text>
      <Text style={styles.voiceBody}>
        Écoutez le modèle, puis enregistrez jusqu’à 20 secondes pour comparer
        sur cet appareil.
      </Text>

      <View style={styles.voiceActions}>
        <PlaybackButton
          active={modelPlayback}
          disabled={modelDisabled}
          onPause={voicePractice.pausePlayback}
          onPlay={voicePractice.playModel}
          paused={playbackPaused}
          target="model"
        />
        <PlaybackButton
          active={recordingPlayback}
          disabled={recordingDisabled}
          onPause={voicePractice.pausePlayback}
          onPlay={voicePractice.playRecording}
          paused={playbackPaused}
          target="recording"
        />
      </View>

      <RecordButton voicePractice={voicePractice} />

      {voicePractice.hasRecording && (
        <Pressable
          accessibilityLabel="Supprimer cette prise locale"
          accessibilityRole="button"
          accessibilityState={{ disabled: voicePractice.isBusy }}
          disabled={voicePractice.isBusy}
          style={({ pressed }) => [
            styles.deleteVoiceButton,
            pressed && styles.pressed,
            voicePractice.isBusy && styles.disabled,
          ]}
          onPress={() => {
            void voicePractice.deleteRecording();
          }}
        >
          <Text style={styles.deleteVoiceButtonText}>
            Supprimer cette prise locale
          </Text>
        </Pressable>
      )}

      {voicePractice.notice !== "" && (
        <Text accessibilityLiveRegion="polite" style={styles.voiceStatus}>
          {voicePractice.notice}
        </Text>
      )}
      {voicePractice.error !== "" && (
        <Text accessibilityRole="alert" style={styles.error}>
          {voicePractice.error}
        </Text>
      )}
      <Text style={styles.voicePrivacy}>
        Cache local temporaire uniquement. Votre voix n’est ni synchronisée, ni
        envoyée, ni analysée. Elle est supprimable à tout moment et à la
        fermeture normale de cet écran.
      </Text>
    </View>
  );
}

interface ResultStageProps {
  readonly analytics: AnalyticsSink;
  readonly config: LessonExperienceConfig;
  readonly completedReview: boolean;
  readonly dueAt: string | null | undefined;
  readonly latestRating: ExerciseRating;
  readonly masteryScore: number;
  readonly onFinish: () => void;
  readonly voicePractice: VoicePractice;
}

function ResultStage({
  analytics,
  config,
  completedReview,
  dueAt,
  latestRating,
  masteryScore,
  onFinish,
  voicePractice,
}: ResultStageProps) {
  const resultHeading = useRef<Text>(null);
  const finishDisabled = voicePractice.isBusy || voicePractice.isRecording;
  const accountDisabled =
    voicePractice.hasRecording ||
    voicePractice.isRecording ||
    voicePractice.isBusy;
  const finishButtonText = voicePractice.isRecording
    ? "Arrêtez d’abord l’enregistrement"
    : completedReview
      ? "Retour à Aujourd’hui"
      : "Terminer";
  const accountButtonText =
    voicePractice.hasRecording || voicePractice.isRecording
      ? "Supprimez l’essai avant de quitter"
      : "Découvrir le compte";

  useEffect(() => {
    const node = findNodeHandle(resultHeading.current);
    if (node !== null) AccessibilityInfo.setAccessibilityFocus(node);
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>TENTATIVE CONSERVÉE HORS LIGNE</Text>
      <Text ref={resultHeading} style={styles.title} accessibilityRole="header">
        {getFeedbackText(latestRating, config.exercise)}
      </Text>
      <View style={styles.metric}>
        <Text style={styles.metricLabel}>MAÎTRISE ESTIMÉE</Text>
        <Text style={styles.metricValue}>{masteryScore} ‰</Text>
      </View>
      <View style={styles.metric}>
        <Text style={styles.metricLabel}>PROCHAINE RÉVISION</Text>
        <Text style={styles.metricDate}>{getDueAtText(dueAt)}</Text>
      </View>
      <VoicePracticeCard voicePractice={voicePractice} />
      <Text style={styles.privacy}>{config.completionPrivacy}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{
          busy: voicePractice.isBusy,
          disabled: finishDisabled,
        }}
        disabled={finishDisabled}
        style={[styles.primaryButton, finishDisabled && styles.disabled]}
        onPress={onFinish}
      >
        <Text style={styles.primaryButtonText}>{finishButtonText}</Text>
      </Pressable>
      <Link href="/account" asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: accountDisabled }}
          disabled={accountDisabled}
          style={StyleSheet.flatten([
            styles.secondaryButton,
            accountDisabled && styles.disabled,
          ])}
          onPress={voicePractice.pausePlayback}
        >
          <Text style={styles.secondaryButtonText}>{accountButtonText}</Text>
        </Pressable>
      </Link>
      <MobileContentReportPanel
        analytics={analytics}
        contentVersionId={config.lesson.versionId}
        exerciseId={config.exercise.id}
      />
    </View>
  );
}

interface StageContentProps {
  readonly analytics: AnalyticsSink;
  readonly config: LessonExperienceConfig;
  readonly completedReview: boolean;
  readonly dueAt: string | null | undefined;
  readonly isSaving: boolean;
  readonly latestRating: ExerciseRating;
  readonly masteryScore: number;
  readonly onFinish: () => void;
  readonly onPlaySignal: () => void;
  readonly onRetryStorage: () => void;
  readonly onSelectOption: (optionId: string) => void;
  readonly onStart: () => void;
  readonly onSubmit: () => void;
  readonly questionMessage: string;
  readonly selectedOptionId: string | null;
  readonly stage: Stage;
  readonly storageStatus: StorageStatus;
  readonly voicePractice: VoicePractice;
}

function StageContent(props: StageContentProps) {
  if (props.stage === "intro") {
    return (
      <IntroStage
        config={props.config}
        error={props.voicePractice.error}
        onPlaySignal={props.onPlaySignal}
        onRetryStorage={props.onRetryStorage}
        onStart={props.onStart}
        storageStatus={props.storageStatus}
      />
    );
  }
  if (props.stage === "question") {
    return (
      <QuestionStage
        config={props.config}
        isSaving={props.isSaving}
        message={props.questionMessage}
        onPlaySignal={props.onPlaySignal}
        onSelectOption={props.onSelectOption}
        onSubmit={props.onSubmit}
        selectedOptionId={props.selectedOptionId}
      />
    );
  }
  return (
    <ResultStage
      analytics={props.analytics}
      config={props.config}
      completedReview={props.completedReview}
      dueAt={props.dueAt}
      latestRating={props.latestRating}
      masteryScore={props.masteryScore}
      onFinish={props.onFinish}
      voicePractice={props.voicePractice}
    />
  );
}

export function LessonExperience({
  analytics,
  config = fixtureLessonConfig,
}: {
  readonly analytics: AnalyticsSink;
  readonly config?: LessonExperienceConfig;
}) {
  const { exercise, item, lesson } = config;
  const database = useSQLiteContext();
  const auth = useMobileAuthSession();
  const router = useRouter();
  const outboxStore = useMemo(
    () =>
      new MobileAttemptOutboxStore(database, undefined, config.outboxNamespace),
    [config.outboxNamespace, database],
  );
  const experienceStore = useMemo(
    () => new MobileLocalExperienceStore(database),
    [database],
  );
  const player = useAudioPlayer(config.modelAudioSource);
  const voicePractice = useLocalVoicePractice(
    player,
    auth.sessionBoundaryRevision,
  );
  const [stage, setStage] = useState<Stage>("intro");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [outbox, setOutbox] = useState<AttemptOutboxSnapshot>(() =>
    createAttemptOutboxSnapshot(),
  );
  const [storageStatus, setStorageStatus] = useState<StorageStatus>("loading");
  const [storageRetryToken, setStorageRetryToken] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [latestRating, setLatestRating] = useState<ExerciseRating>(null);
  const [experienceSnapshot, setExperienceSnapshot] =
    useState<LocalExperienceSnapshot | null>(null);
  const submissionInFlight = useRef(false);
  const checkpointInFlight = useRef(false);
  const finishInFlight = useRef(false);

  useEffect(() => {
    let active = true;

    const outboxBootstrap =
      config.outboxNamespace === "demo"
        ? outboxStore.migrateLegacyFixtureAttemptsToDemo()
        : outboxStore.read();

    void Promise.all([outboxBootstrap, experienceStore.read()])
      .then(async ([storedOutbox, storedExperience]) => {
        if (storedExperience.onboarding.status !== "completed") {
          if (active) router.replace("/");
          return;
        }
        let recoveredOutbox = storedOutbox;
        let recoveredExperience = storedExperience;
        let checkpoint = storedExperience.lesson;
        if (
          checkpoint !== null &&
          (checkpoint.lessonVersionId !== lesson.versionId ||
            checkpoint.exerciseId !== exercise.id)
        ) {
          if (config.allowColdStart && checkpoint.phase === "completed") {
            recoveredExperience = await experienceStore.replaceLessonVersion(
              checkpoint,
              {
                lessonVersionId: lesson.versionId,
                exerciseId: exercise.id,
                startedAt: new Date().toISOString(),
              },
              recoveredOutbox,
            );
            checkpoint = recoveredExperience.lesson;
          } else {
            if (active) router.replace("/");
            return;
          }
        }
        if (checkpoint === null) {
          if (!config.allowColdStart) {
            if (active) router.replace("/");
            return;
          }
          recoveredExperience = await experienceStore.startLesson({
            lessonVersionId: lesson.versionId,
            exerciseId: exercise.id,
            startedAt: new Date().toISOString(),
          });
          checkpoint = recoveredExperience.lesson;
        }
        if (checkpoint === null) {
          throw new Error("Le point de reprise mobile est introuvable.");
        }
        if (checkpoint.phase === "submitting") {
          recoveredOutbox = await outboxStore.enqueue(checkpoint.submission);
          recoveredExperience = await experienceStore.confirmLessonResult(
            recoveredOutbox,
            new Date().toISOString(),
          );
        }

        const recoveredCheckpoint = recoveredExperience.lesson;
        if (
          recoveredCheckpoint === null ||
          recoveredCheckpoint.phase === "submitting"
        ) {
          throw new Error("La reprise locale n'a pas pu être confirmée.");
        }
        if (
          recoveredCheckpoint.lessonVersionId !== lesson.versionId ||
          recoveredCheckpoint.exerciseId !== exercise.id
        ) {
          if (active) router.replace("/");
          return;
        }

        let recoveredRating: ExerciseRating = null;
        if (
          recoveredCheckpoint.phase === "result" ||
          recoveredCheckpoint.phase === "completed"
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
              "Le résultat local ne correspond plus au journal durable.",
            );
          }
          recoveredRating =
            ingestLessonOutbox(recoveredOutbox, config).events.find(
              ({ eventId }) =>
                eventId === recoveredCheckpoint.submission.eventId,
            )?.rating ?? null;
          if (recoveredRating === null) {
            throw new Error("Le résultat local durable est introuvable.");
          }
        }

        if (!active) return;
        setOutbox(recoveredOutbox);
        setExperienceSnapshot(recoveredExperience);
        setSelectedOptionId(
          recoveredCheckpoint.phase === "question"
            ? recoveredCheckpoint.selectedOptionId
            : recoveredCheckpoint.phase === "result" ||
                recoveredCheckpoint.phase === "completed"
              ? (recoveredCheckpoint.submission.selectedOptionId ?? null)
              : null,
        );
        setLatestRating(recoveredRating);
        setStartedAt(Date.parse(recoveredCheckpoint.sessionStartedAt));
        setStage(
          recoveredCheckpoint.phase === "completed"
            ? "result"
            : recoveredCheckpoint.phase,
        );
        setStorageStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setStorageStatus("error");
      });

    return () => {
      active = false;
    };
  }, [
    config,
    exercise.id,
    experienceStore,
    lesson.versionId,
    outboxStore,
    router,
    storageRetryToken,
  ]);

  const localIngestion = useMemo(
    () => ingestLessonOutbox(outbox, config),
    [config, outbox],
  );
  const projection = localIngestion.projections.find(
    ({ state }) => state.itemId === item.id,
  )?.state;

  function playSignal() {
    setMessage("");
    void voicePractice.playModel();
  }

  async function submitAnswer(): Promise<void> {
    if (selectedOptionId === null) {
      setMessage("Choisissez une option avant de valider.");
      return;
    }

    if (storageStatus !== "ready") {
      setMessage("Le journal local n’est pas encore disponible.");
      return;
    }

    const currentExperience = experienceSnapshot;
    const currentLesson = currentExperience?.lesson;
    if (
      currentExperience === null ||
      currentLesson === undefined ||
      currentLesson === null ||
      (currentLesson.phase !== "question" &&
        currentLesson.phase !== "submitting")
    ) {
      setMessage("La séance locale doit être reprise avant de répondre.");
      return;
    }

    let exactSubmission: ValidatedAttemptSubmission;
    let preparedExperience = currentExperience;
    try {
      if (currentLesson.phase === "submitting") {
        exactSubmission = currentLesson.submission;
      } else {
        const deviceId = await outboxStore.getOrCreateDeviceId(randomUUID);
        const answeredAt = new Date().toISOString();
        const candidate = attemptSubmissionSchema.parse({
          eventId: randomUUID(),
          deviceId,
          exerciseId: exercise.id,
          selectedOptionId,
          answeredAt,
          durationMs: Math.min(
            MAX_ATTEMPT_DURATION_MS,
            Math.max(0, Date.now() - startedAt),
          ),
          contentVersionId: lesson.versionId,
          algorithmVersion: SRS_ALGORITHM_VERSION,
        });
        preparedExperience = await experienceStore.prepareLessonSubmission(
          candidate,
          answeredAt,
        );
        if (preparedExperience.lesson?.phase !== "submitting") {
          throw new Error("La tentative n'a pas été réservée.");
        }
        exactSubmission = preparedExperience.lesson.submission;
        setExperienceSnapshot(preparedExperience);
      }
    } catch (error) {
      setMessage(
        error instanceof MobileAttemptOutboxStorageError
          ? error.message
          : "La tentative n’a pas pu être préparée localement.",
      );
      return;
    }

    try {
      const durableOutbox = await outboxStore.enqueue(exactSubmission);
      setOutbox(durableOutbox);
      const confirmedExperience = await experienceStore.confirmLessonResult(
        durableOutbox,
        new Date().toISOString(),
      );
      if (confirmedExperience.lesson?.phase !== "result") {
        throw new Error("Le résultat local n'a pas été confirmé.");
      }
      const accepted = ingestLessonOutbox(durableOutbox, config).events.find(
        ({ eventId }) => eventId === exactSubmission.eventId,
      );
      if (accepted === undefined) {
        throw new Error("La tentative locale n’a pas pu être évaluée.");
      }
      setExperienceSnapshot(confirmedExperience);
      setLatestRating(accepted.rating);
      setStage("result");
      safeCapture(analytics, {
        name: "exercise_answered",
        lessonVersionId: lesson.versionId,
        exerciseType: "audio_choice",
        correct: accepted.rating === 1,
        durationBucket: durationBucket(exactSubmission.durationMs),
        platform: Platform.OS === "ios" ? "ios" : "android",
      });
      AccessibilityInfo.announceForAccessibility(
        accepted.rating === 1
          ? exercise.feedback.correctFr
          : exercise.feedback.incorrectFr,
      );
    } catch (error) {
      setMessage(
        error instanceof MobileAttemptOutboxStorageError
          ? error.message
          : "La tentative préparée reste locale et sera reprise sans créer de doublon.",
      );
    }
  }

  function handleSubmitAnswer(): void {
    if (submissionInFlight.current) return;
    submissionInFlight.current = true;
    setIsSaving(true);
    void submitAnswer().finally(() => {
      submissionInFlight.current = false;
      setIsSaving(false);
    });
  }

  function handleFinish(): void {
    if (
      finishInFlight.current ||
      voicePractice.isBusy ||
      voicePractice.isRecording
    ) {
      return;
    }

    finishInFlight.current = true;
    const reviewingCompleted =
      experienceSnapshot?.lesson?.phase === "completed";
    voicePractice.pausePlayback();
    void voicePractice
      .deleteRecording()
      .then(async (deleted) => {
        if (!deleted) return;
        if (reviewingCompleted) {
          router.replace("/");
          return;
        }
        const completed = await experienceStore.finishLesson(
          outbox,
          new Date().toISOString(),
        );
        setExperienceSnapshot(completed);
        safeCapture(analytics, {
          name: "lesson_completed",
          lessonVersionId: lesson.versionId,
          platform: Platform.OS === "ios" ? "ios" : "android",
        });
        router.replace("/");
      })
      .catch(() => {
        setMessage(
          "La séance n’a pas pu être clôturée. Le résultat reste conservé localement.",
        );
      })
      .finally(() => {
        finishInFlight.current = false;
      });
  }

  const pendingAttempts = outbox.entries.filter(
    ({ status }) => status === "pending",
  ).length;
  const questionMessage = getQuestionMessage(
    message,
    stage,
    voicePractice.error,
  );

  function handleRetryStorage(): void {
    setStorageStatus("loading");
    setMessage("");
    setStorageRetryToken((current) => current + 1);
  }

  function handleStart(): void {
    if (checkpointInFlight.current || storageStatus !== "ready") return;
    checkpointInFlight.current = true;
    setIsSaving(true);
    setMessage("");
    void experienceStore
      .openLessonQuestion(new Date().toISOString())
      .then((next) => {
        setExperienceSnapshot(next);
        setStartedAt(Date.now());
        setStage("question");
        safeCapture(analytics, {
          name: "lesson_started",
          lessonVersionId: lesson.versionId,
          platform: Platform.OS === "ios" ? "ios" : "android",
        });
      })
      .catch(() => {
        setMessage("La séance n’a pas pu démarrer. Réessayez.");
      })
      .finally(() => {
        checkpointInFlight.current = false;
        setIsSaving(false);
      });
  }

  function handleSelectOption(optionId: string): void {
    if (checkpointInFlight.current || storageStatus !== "ready") return;
    checkpointInFlight.current = true;
    setIsSaving(true);
    setMessage("");
    void experienceStore
      .selectLessonOption(optionId, new Date().toISOString())
      .then((next) => {
        setExperienceSnapshot(next);
        setSelectedOptionId(optionId);
      })
      .catch(() => {
        setMessage("Ce choix n’a pas pu être conservé. Réessayez.");
      })
      .finally(() => {
        checkpointInFlight.current = false;
        setIsSaving(false);
      });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <LessonHeader step={config.headerStep} />
      <LessonBanner
        text={config.bannerText}
        title={config.bannerTitle}
        pendingAttempts={pendingAttempts}
        storageStatus={storageStatus}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <StageContent
          analytics={analytics}
          config={config}
          completedReview={experienceSnapshot?.lesson?.phase === "completed"}
          dueAt={projection?.dueAt}
          isSaving={isSaving}
          latestRating={latestRating}
          masteryScore={projection?.masteryScore ?? 0}
          onFinish={handleFinish}
          onPlaySignal={playSignal}
          onRetryStorage={handleRetryStorage}
          onSelectOption={handleSelectOption}
          onStart={handleStart}
          onSubmit={handleSubmitAnswer}
          questionMessage={questionMessage}
          selectedOptionId={selectedOptionId}
          stage={stage}
          storageStatus={storageStatus}
          voicePractice={voicePractice}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function LessonRoute() {
  const { analytics } = useMobileAnalytics();
  return <LessonExperience key="fixture" analytics={analytics} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.jasmine },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  header: {
    minHeight: 72,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  logo: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.ink,
  },
  logoThai: {
    color: "white",
    fontFamily: THAI_FONT_SEMIBOLD,
    fontSize: 23,
    lineHeight: 34,
  },
  brand: { marginLeft: 10, color: colors.ink, fontSize: 18, fontWeight: "800" },
  step: { marginLeft: "auto", color: colors.inkSoft, fontSize: 12 },
  fixtureBanner: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    backgroundColor: colors.saffronHalo,
  },
  fixtureTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  fixtureText: { marginTop: 2, color: colors.inkSoft, fontSize: 12 },
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
    color: colors.jadeInk,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    color: colors.ink,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "800",
    letterSpacing: -1.5,
  },
  body: { marginTop: 18, color: colors.inkSoft, fontSize: 17, lineHeight: 27 },
  glyph: {
    marginVertical: 36,
    color: colors.ink,
    fontFamily: THAI_FONT_REGULAR,
    fontSize: 92,
    lineHeight: 126,
    textAlign: "center",
  },
  primaryButton: {
    minHeight: 52,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.coral,
  },
  primaryButtonText: { color: "white", fontSize: 16, fontWeight: "800" },
  secondaryButton: {
    minHeight: 48,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
  },
  secondaryButtonText: { color: colors.ink, fontWeight: "700" },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.5 },
  audioButton: {
    minHeight: 48,
    marginVertical: 26,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.mist,
  },
  audioButtonText: { color: colors.ink, fontWeight: "700" },
  answers: { gap: 12 },
  answer: {
    minHeight: 68,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.mist,
    borderRadius: 18,
    backgroundColor: "white",
  },
  answerSelected: {
    borderColor: colors.jade,
    backgroundColor: colors.jadePale,
  },
  radio: {
    width: 20,
    height: 20,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#8b94a4",
    borderRadius: 10,
  },
  radioSelected: { borderWidth: 6, borderColor: colors.jade },
  answerText: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  error: { marginTop: 16, color: colors.coralDeep, fontWeight: "600" },
  metric: {
    minHeight: 106,
    marginTop: 14,
    padding: 20,
    justifyContent: "space-between",
    borderRadius: 18,
    backgroundColor: colors.mist,
  },
  metricLabel: {
    color: colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  metricValue: { color: colors.jadeInk, fontSize: 28, fontWeight: "800" },
  metricDate: { color: colors.ink, fontSize: 19, fontWeight: "700" },
  voiceCard: {
    marginTop: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#cfe7df",
    borderRadius: 22,
    backgroundColor: "#f2faf7",
  },
  voiceEyebrow: {
    color: "#2d7c66",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  voiceTitle: {
    marginTop: 8,
    color: "#283450",
    fontSize: 24,
    fontWeight: "800",
  },
  voiceBody: {
    marginTop: 8,
    color: "#5e6980",
    fontSize: 15,
    lineHeight: 22,
  },
  voiceActions: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },
  voiceButton: {
    minHeight: 52,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#aeb8c7",
    borderRadius: 14,
    backgroundColor: "white",
  },
  voiceButtonActive: {
    borderColor: "#43a283",
    backgroundColor: "#e3f5ef",
  },
  voiceButtonText: {
    color: "#283450",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  recordButton: {
    minHeight: 52,
    marginTop: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#283450",
  },
  recordButtonActive: { backgroundColor: "#a23d38" },
  recordButtonText: { color: "white", fontSize: 15, fontWeight: "800" },
  deleteVoiceButton: {
    minHeight: 48,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteVoiceButtonText: {
    color: "#8f3834",
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  voiceStatus: {
    marginTop: 12,
    color: "#325f54",
    fontSize: 13,
    lineHeight: 19,
  },
  voicePrivacy: {
    marginTop: 14,
    color: "#687287",
    fontSize: 12,
    lineHeight: 18,
  },
  privacy: { marginTop: 20, color: "#697389", fontSize: 13, lineHeight: 20 },
});
