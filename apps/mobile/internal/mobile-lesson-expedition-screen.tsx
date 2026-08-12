// Aperçu éditorial conservé hors du graphe Expo public.
import type { AnalyticsSink } from "@thainaute/analytics";
import { colors } from "@thainaute/design-tokens";
import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import {
  attemptSubmissionSchema,
  attemptSubmissionsAreEqual,
  createAttemptOutboxSnapshot,
  MAX_ATTEMPT_DURATION_MS,
  type AttemptOutboxSnapshot,
  type LocalDraftAnswer,
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
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MobileContentReportPanel } from "../components/content-report-panel";
import { MobileAttemptOutboxStore } from "../lib/attempt-outbox-store";
import { useMobileAnalytics } from "../lib/analytics-provider";
import {
  getMobileUnit01MixedExpeditionConfig,
  type MobileLessonExpeditionConfig,
  type MobileLessonExerciseConfig,
} from "../lib/mobile-lesson-expedition-config";
import {
  getMobileLessonEvent,
  getProjectionForMobileLessonExercise,
  nextMobileLessonExercise,
} from "../lib/mobile-lesson-expedition-state";
import { MobileLocalExperienceStore } from "../lib/mobile-local-experience-store";
import { THAI_FONT_REGULAR, THAI_FONT_SEMIBOLD } from "../lib/typography";
import type { MobileMechanicsExercise } from "../lib/embedded-mechanics-expedition-config";

type Stage = "intro" | "question" | "celebration" | "recap";
type StorageStatus = "loading" | "ready" | "error";
type Rating = 0 | 1;
type LessonItem = MobileLessonExpeditionConfig["lesson"]["items"][number];
type AudioLessonExerciseConfig = Extract<
  MobileLessonExerciseConfig,
  { exercise: { type: "audio_choice" } }
>;
type AssociationLessonExerciseConfig = {
  readonly exercise: Extract<MobileMechanicsExercise, { type: "association" }>;
  readonly item: LessonItem;
};
type WordOrderLessonExerciseConfig = {
  readonly exercise: Extract<MobileMechanicsExercise, { type: "word_order" }>;
  readonly item: LessonItem;
};
type RecallLessonExerciseConfig = {
  readonly exercise: Extract<MobileMechanicsExercise, { type: "recall" }>;
  readonly item: LessonItem;
};
type ReadingLessonExerciseConfig = {
  readonly exercise: Extract<MobileMechanicsExercise, { type: "reading" }>;
  readonly item: LessonItem;
};

function isAudioLessonExerciseConfig(
  current: MobileLessonExerciseConfig | undefined,
): current is AudioLessonExerciseConfig {
  return current?.exercise.type === "audio_choice";
}

function isWordOrderLessonExerciseConfig(
  current: MobileLessonExerciseConfig | undefined,
): current is WordOrderLessonExerciseConfig {
  return current?.exercise.type === "word_order";
}

function isAssociationLessonExerciseConfig(
  current: MobileLessonExerciseConfig | undefined,
): current is AssociationLessonExerciseConfig {
  return current?.exercise.type === "association";
}

function isRecallLessonExerciseConfig(
  current: MobileLessonExerciseConfig | undefined,
): current is RecallLessonExerciseConfig {
  return current?.exercise.type === "recall";
}

function isReadingLessonExerciseConfig(
  current: MobileLessonExerciseConfig | undefined,
): current is ReadingLessonExerciseConfig {
  return current?.exercise.type === "reading";
}

interface Celebration {
  readonly dueAt: string | null | undefined;
  readonly exerciseId: string;
  readonly masteryScore: number;
  readonly rating: Rating;
}

function safeCapture(
  analytics: AnalyticsSink,
  event: Parameters<AnalyticsSink["capture"]>[0],
): void {
  try {
    analytics.capture(event);
  } catch {
    // L'analytics facultative ne bloque jamais une séance locale.
  }
}

function dueAtText(dueAt: string | null | undefined): string {
  if (dueAt === null || dueAt === undefined) return "À calculer";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dueAt));
}

function durationBucket(
  durationMs: number,
): "under_10s" | "10_to_30s" | "over_30s" {
  if (durationMs < 10_000) return "under_10s";
  if (durationMs <= 30_000) return "10_to_30s";
  return "over_30s";
}

function outboxContainsSubmission(
  outbox: AttemptOutboxSnapshot,
  submission: ValidatedAttemptSubmission,
): boolean {
  return outbox.entries.some(
    ({ status, submission: candidate }) =>
      status !== "rejected" &&
      attemptSubmissionsAreEqual(candidate, submission),
  );
}

function Header({ step }: { readonly step: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.logo}>
        <Text style={styles.logoThai} accessibilityLanguage="th-TH">
          ไ
        </Text>
      </View>
      <Text style={styles.brand}>Thaïnaute</Text>
      <Text style={styles.step}>{step}</Text>
    </View>
  );
}

function Banner({
  config,
  pendingAttempts,
  storageStatus,
}: {
  readonly config: MobileLessonExpeditionConfig;
  readonly pendingAttempts: number;
  readonly storageStatus: StorageStatus;
}) {
  const storageText =
    storageStatus === "loading"
      ? "Préparation du journal local…"
      : storageStatus === "error"
        ? "Journal local indisponible"
        : `${pendingAttempts} tentative${pendingAttempts > 1 ? "s" : ""} conservée${pendingAttempts > 1 ? "s" : ""} localement`;
  return (
    <View style={styles.banner} accessibilityRole="summary">
      <Text style={styles.bannerTitle}>{config.bannerTitle}</Text>
      <Text style={styles.bannerText}>
        {config.bannerText} · {storageText}
      </Text>
    </View>
  );
}

function IntroStage({
  config,
  hasFirstAudio,
  message,
  onPlaySignal,
  onRetry,
  onStart,
  storageStatus,
}: {
  readonly config: MobileLessonExpeditionConfig;
  readonly hasFirstAudio: boolean;
  readonly message: string;
  readonly onPlaySignal: () => void;
  readonly onRetry: () => void;
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
        Écoutez, associez, rappelez puis lisez à votre rythme. Chaque réponse
        reste conservée localement et la leçon peut continuer hors connexion.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: loading }}
        disabled={loading}
        style={[styles.primaryButton, loading && styles.disabled]}
        onPress={error ? onRetry : onStart}
      >
        <Text style={styles.primaryButtonText}>
          {error ? "Réessayer le stockage" : "Commencer la leçon"}
        </Text>
      </Pressable>
      {hasFirstAudio && (
        <Pressable
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={onPlaySignal}
        >
          <Text style={styles.secondaryButtonText}>
            Écouter le premier signal
          </Text>
        </Pressable>
      )}
      {message !== "" && (
        <Text accessibilityRole="alert" style={styles.error}>
          {message}
        </Text>
      )}
    </View>
  );
}

function AudioQuestion({
  current,
  index,
  isSaving,
  message,
  onPlay,
  onSelect,
  onSubmit,
  selectedOptionId,
  total,
}: {
  readonly current: AudioLessonExerciseConfig;
  readonly index: number;
  readonly isSaving: boolean;
  readonly message: string;
  readonly onPlay: () => void;
  readonly onSelect: (optionId: string) => void;
  readonly onSubmit: () => void;
  readonly selectedOptionId: string | null;
  readonly total: number;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>
        ÉCOUTE · {index + 1}/{total}
      </Text>
      <Text accessibilityRole="header" style={styles.exercisePrompt}>
        {current.exercise.promptFr}
      </Text>
      <Pressable
        accessibilityLabel="Réécouter le signal"
        accessibilityRole="button"
        style={styles.audioButton}
        onPress={onPlay}
      >
        <Text style={styles.audioButtonText}>▶ Réécouter le signal</Text>
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
              style={[styles.answer, selected && styles.answerSelected]}
              onPress={() => onSelect(option.id)}
            >
              <View style={[styles.radio, selected && styles.radioSelected]} />
              <Text style={styles.answerText}>{option.labelFr}</Text>
            </Pressable>
          );
        })}
      </View>
      <QuestionMessage message={message} />
      <SubmitButton
        disabled={isSaving || selectedOptionId === null}
        isSaving={isSaving}
        label="Valider l'écoute"
        onPress={onSubmit}
      />
    </View>
  );
}

function WordOrderQuestion({
  current,
  draftTokenIds,
  isSaving,
  message,
  onAdd,
  onRemove,
  onSubmit,
}: {
  readonly current: WordOrderLessonExerciseConfig;
  readonly draftTokenIds: readonly string[];
  readonly isSaving: boolean;
  readonly message: string;
  readonly onAdd: (tokenId: string) => void;
  readonly onRemove: (tokenId: string) => void;
  readonly onSubmit: () => void;
}) {
  const selected = new Set(draftTokenIds);
  const tokenById = new Map(
    current.exercise.tokens.map((token) => [token.id, token] as const),
  );
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>ORDRE DES MOTS</Text>
      <Text accessibilityRole="header" style={styles.exercisePrompt}>
        {current.exercise.promptFr}
      </Text>
      <Text style={styles.helper}>
        Touchez les jetons dans l&apos;ordre. Vous pouvez retirer un jeton déjà
        posé pour corriger votre phrase.
      </Text>
      <View style={styles.answerTray} accessibilityLabel="Réponse construite">
        {draftTokenIds.length === 0 ? (
          <Text style={styles.trayPlaceholder}>
            Votre phrase apparaîtra ici.
          </Text>
        ) : (
          draftTokenIds.map((tokenId) => (
            <Pressable
              accessibilityLabel={`Retirer ${tokenById.get(tokenId)?.thaiRaw ?? "le jeton"}`}
              accessibilityRole="button"
              disabled={isSaving}
              key={tokenId}
              style={styles.tokenSelected}
              onPress={() => onRemove(tokenId)}
            >
              <Text style={styles.tokenThai} accessibilityLanguage="th-TH">
                {tokenById.get(tokenId)?.thaiRaw ?? "?"}
              </Text>
            </Pressable>
          ))
        )}
      </View>
      <View style={styles.tokenPool}>
        {current.exercise.tokens.map((token) => (
          <Pressable
            accessibilityLabel={`Ajouter ${token.thaiRaw}`}
            accessibilityRole="button"
            accessibilityState={{
              disabled: isSaving || selected.has(token.id),
            }}
            disabled={isSaving || selected.has(token.id)}
            key={token.id}
            style={[styles.token, selected.has(token.id) && styles.tokenUsed]}
            onPress={() => onAdd(token.id)}
          >
            <Text style={styles.tokenThai} accessibilityLanguage="th-TH">
              {token.thaiRaw}
            </Text>
            <Text style={styles.tokenLatin}>{token.transcription ?? ""}</Text>
          </Pressable>
        ))}
      </View>
      <QuestionMessage message={message} />
      <SubmitButton
        disabled={isSaving || draftTokenIds.length === 0}
        isSaving={isSaving}
        label="Valider l'ordre"
        onPress={onSubmit}
      />
    </View>
  );
}

function AssociationQuestion({
  current,
  items,
  isSaving,
  matchedPairIds,
  message,
  onSelectLabel,
  onSelectPrompt,
  onSubmit,
  selectedPairId,
}: {
  readonly current: AssociationLessonExerciseConfig;
  readonly items: MobileLessonExpeditionConfig["lesson"]["items"];
  readonly isSaving: boolean;
  readonly matchedPairIds: readonly string[];
  readonly message: string;
  readonly onSelectLabel: (pairId: string) => void;
  readonly onSelectPrompt: (pairId: string) => void;
  readonly onSubmit: () => void;
  readonly selectedPairId: string | null;
}) {
  const itemById = new Map(items.map((item) => [item.id, item] as const));
  const labels = [...current.exercise.pairs].sort((left, right) =>
    left.labelFr.localeCompare(right.labelFr),
  );
  const complete = matchedPairIds.length === current.exercise.pairs.length;
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>ASSOCIATION</Text>
      <Text accessibilityRole="header" style={styles.exercisePrompt}>
        {current.exercise.promptFr}
      </Text>
      <Text style={styles.helper}>
        Touchez un mot thaï, puis sa fiche française. Les erreurs comptent dans
        la correction, sans retirer de vie.
      </Text>
      <View style={styles.associationColumns}>
        <View style={styles.associationColumn} accessibilityLabel="Mots thaïs">
          {current.exercise.pairs.map((pair) => {
            const matched = matchedPairIds.includes(pair.id);
            const selected = selectedPairId === pair.id;
            return (
              <Pressable
                accessibilityLabel={`Associer ${itemById.get(pair.itemId)?.thaiRaw ?? "le mot"}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: matched, selected }}
                disabled={isSaving || matched}
                key={pair.id}
                style={[
                  styles.associationTile,
                  selected && styles.associationTileSelected,
                  matched && styles.associationTileDone,
                ]}
                onPress={() => onSelectPrompt(pair.id)}
              >
                <Text
                  style={styles.associationThai}
                  accessibilityLanguage="th-TH"
                >
                  {itemById.get(pair.itemId)?.thaiRaw ?? "?"}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View
          style={styles.associationColumn}
          accessibilityLabel="Fiches françaises"
        >
          {labels.map((pair) => {
            const matched = matchedPairIds.includes(pair.id);
            return (
              <Pressable
                accessibilityLabel={`Associer ${pair.labelFr}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: matched }}
                disabled={isSaving || matched}
                key={pair.id}
                style={[
                  styles.associationTile,
                  matched && styles.associationTileDone,
                ]}
                onPress={() => onSelectLabel(pair.id)}
              >
                <Text style={styles.associationLabel}>{pair.labelFr}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <QuestionMessage message={message} />
      <SubmitButton
        disabled={isSaving || !complete}
        isSaving={isSaving}
        label="Valider l'association"
        onPress={onSubmit}
      />
    </View>
  );
}

function RecallQuestion({
  current,
  isSaving,
  message,
  onChange,
  onSubmit,
  value,
}: {
  readonly current: RecallLessonExerciseConfig;
  readonly isSaving: boolean;
  readonly message: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly value: string;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>RAPPEL</Text>
      <Text accessibilityRole="header" style={styles.exercisePrompt}>
        {current.exercise.promptFr}
      </Text>
      <Text style={styles.helper}>
        Écrivez votre réponse thaïe. La correction applique la politique de la
        leçon, sans interprétation approximative.
      </Text>
      <TextInput
        accessibilityLabel="Votre réponse"
        accessibilityLanguage="th-TH"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSaving}
        placeholder="Votre réponse"
        placeholderTextColor="#8a93a3"
        spellCheck={false}
        style={styles.recallInput}
        value={value}
        onChangeText={onChange}
      />
      <QuestionMessage message={message} />
      <SubmitButton
        disabled={isSaving || value.trim().length === 0}
        isSaving={isSaving}
        label="Valider le rappel"
        onPress={onSubmit}
      />
    </View>
  );
}

function ReadingQuestion({
  current,
  isSaving,
  message,
  onSelect,
  onSubmit,
  selectedOptionId,
}: {
  readonly current: ReadingLessonExerciseConfig;
  readonly isSaving: boolean;
  readonly message: string;
  readonly onSelect: (optionId: string) => void;
  readonly onSubmit: () => void;
  readonly selectedOptionId: string | null;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>LECTURE</Text>
      <Text accessibilityRole="header" style={styles.exercisePrompt}>
        {current.exercise.promptFr}
      </Text>
      <Text style={styles.readingStimulus} accessibilityLanguage="th-TH">
        {current.item.thaiRaw}
      </Text>
      <View accessibilityRole="radiogroup" style={styles.answers}>
        {current.exercise.options.map((option) => {
          const selected = option.id === selectedOptionId;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled: isSaving }}
              disabled={isSaving}
              key={option.id}
              style={[styles.answer, selected && styles.answerSelected]}
              onPress={() => onSelect(option.id)}
            >
              <View style={[styles.radio, selected && styles.radioSelected]} />
              <Text style={styles.answerText}>
                {option.labelFr ??
                  option.thaiRaw ??
                  option.targetText ??
                  "Réponse"}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <QuestionMessage message={message} />
      <SubmitButton
        disabled={isSaving || selectedOptionId === null}
        isSaving={isSaving}
        label="Valider la lecture"
        onPress={onSubmit}
      />
    </View>
  );
}

function QuestionMessage({ message }: { readonly message: string }) {
  return message === "" ? null : (
    <Text accessibilityRole="alert" style={styles.error}>
      {message}
    </Text>
  );
}

function SubmitButton({
  disabled,
  isSaving,
  label,
  onPress,
}: {
  readonly disabled: boolean;
  readonly isSaving: boolean;
  readonly label: string;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={isSaving ? "Enregistrement en cours" : label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={[styles.primaryButton, disabled && styles.disabled]}
      onPress={onPress}
    >
      <Text style={styles.primaryButtonText}>
        {isSaving ? "Enregistrement…" : label}
      </Text>
    </Pressable>
  );
}

function CelebrationStage({
  celebration,
  current,
  onContinue,
}: {
  readonly celebration: Celebration;
  readonly current: MobileLessonExerciseConfig;
  readonly onContinue: () => void;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>RÉPONSE CONSERVÉE HORS LIGNE</Text>
      <Text accessibilityRole="header" style={styles.title}>
        {celebration.rating === 1
          ? current.exercise.feedback.correctFr
          : current.exercise.feedback.incorrectFr}
      </Text>
      <Text style={styles.glyph} accessibilityLanguage="th-TH">
        {current.item.thaiRaw}
      </Text>
      <Text style={styles.translation}>{current.item.translationFr}</Text>
      <View style={styles.metric}>
        <Text style={styles.metricLabel}>MAÎTRISE ESTIMÉE</Text>
        <Text style={styles.metricValue}>{celebration.masteryScore} ‰</Text>
      </View>
      <View style={styles.metric}>
        <Text style={styles.metricLabel}>PROCHAINE RÉVISION</Text>
        <Text style={styles.metricDate}>{dueAtText(celebration.dueAt)}</Text>
      </View>
      <Text style={styles.body}>
        Cette réponse reste locale et pourra être synchronisée plus tard avec le
        même événement.
      </Text>
      <Pressable
        accessibilityRole="button"
        style={styles.primaryButton}
        onPress={onContinue}
      >
        <Text style={styles.primaryButtonText}>Continuer</Text>
      </Pressable>
    </View>
  );
}

function RecapStage({
  config,
  onFinish,
  outbox,
}: {
  readonly config: MobileLessonExpeditionConfig;
  readonly onFinish: () => void;
  readonly outbox: AttemptOutboxSnapshot;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>LEÇON TERMINÉE</Text>
      <Text accessibilityRole="header" style={styles.title}>
        Une nouvelle étape franchie.
      </Text>
      <Text style={styles.body}>{config.completionPrivacy}</Text>
      <View style={styles.recapList}>
        {config.exercises.map((current, index) => {
          const projection = getProjectionForMobileLessonExercise(
            outbox,
            config,
            current,
          );
          return (
            <View key={current.exercise.id} style={styles.recapRow}>
              <Text style={styles.recapIndex}>{index + 1}</Text>
              <View style={styles.recapCopy}>
                <Text style={styles.recapThai} accessibilityLanguage="th-TH">
                  {current.item.thaiRaw}
                </Text>
                <Text style={styles.recapTranslation}>
                  {current.item.translationFr}
                </Text>
              </View>
              <View style={styles.recapScore}>
                <Text style={styles.recapScoreValue}>
                  {projection?.state.masteryScore ?? 0} ‰
                </Text>
                <Text style={styles.recapDue}>
                  {dueAtText(projection?.state.dueAt)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        style={styles.primaryButton}
        onPress={onFinish}
      >
        <Text style={styles.primaryButtonText}>Retour à l&apos;unité 1</Text>
      </Pressable>
    </View>
  );
}

function UnavailableMobileLesson({ lessonId }: { readonly lessonId: string }) {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.screen}>
          <Text style={styles.eyebrow}>CONTENU MOBILE</Text>
          <Text accessibilityRole="header" style={styles.title}>
            Cette leçon n&apos;est pas encore disponible.
          </Text>
          <Text style={styles.body}>
            La leçon {lessonId} reste bloquée tant que toutes ses portes audio
            et linguistiques ne sont pas franchies.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={() => router.push("/unit-01")}
          >
            <Text style={styles.primaryButtonText}>
              Retour à l&apos;unité 1
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function MobileLessonExpeditionExperience({
  analytics,
  config,
}: {
  readonly analytics: AnalyticsSink;
  readonly config: MobileLessonExpeditionConfig;
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
  const [draftTokenIds, setDraftTokenIds] = useState<readonly string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<readonly string[]>([]);
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const [recallValue, setRecallValue] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const submissionInFlight = useRef(false);
  const checkpointInFlight = useRef(false);
  const finishInFlight = useRef(false);
  const recallDraftWrite = useRef(Promise.resolve());

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
            "Une autre expédition est déjà conservée. Reprenez-la avant d'en commencer une nouvelle.",
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
            }
            const recoveredCheckpoint = recoveredExperience.lesson;
            if (
              recoveredCheckpoint === null ||
              (recoveredCheckpoint.phase !== "result" &&
                recoveredCheckpoint.phase !== "completed")
            ) {
              throw new Error(
                "La session locale précédente doit être reprise.",
              );
            }
            recoveredExperience = await experienceStore.finishLesson(
              lessonOutbox,
              new Date().toISOString(),
            );
            const checkpointToAbandon = recoveredExperience.lesson;
            if (checkpointToAbandon === null) {
              throw new Error("Le checkpoint précédent est introuvable.");
            }
            const replacementExercise = config.exercises.find(
              ({ exercise }) => exercise.id !== checkpoint.exerciseId,
            );
            if (replacementExercise === undefined) {
              throw new Error("La nouvelle leçon n'a pas de cible distincte.");
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
              !expeditionBeforeLesson.exerciseIds.includes(
                checkpoint.exerciseId,
              )
            ) {
              throw new Error("Le checkpoint ne correspond pas au plan mixte.");
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
                !attemptSubmissionsAreEqual(
                  durableEntry.submission,
                  recoveredCheckpoint.submission,
                )
              ) {
                throw new Error(
                  "Le résultat local ne correspond plus au journal.",
                );
              }
              if (recoveredCheckpoint.phase === "result") {
                recoveredExperience = await experienceStore.finishLesson(
                  recoveredOutbox,
                  new Date().toISOString(),
                );
              }
              const accepted = getMobileLessonEvent(
                recoveredOutbox,
                config,
                recoveredCheckpoint.submission.eventId,
              );
              if (accepted === undefined) {
                throw new Error("La tentative locale n'a pas pu être évaluée.");
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

        if (!active) return;
        setOutbox(recoveredOutbox);
        setExperienceSnapshot(recoveredExperience);
        const complete =
          recoveredExperience.expedition?.results.length ===
          config.exercises.length;
        const current = nextMobileLessonExercise(config, recoveredExperience);
        const checkpoint = recoveredExperience.lesson;
        const draft =
          checkpoint?.phase === "question" ? checkpoint.draftAnswer : null;
        setSelectedOptionId(
          checkpoint?.phase === "question" ? checkpoint.selectedOptionId : null,
        );
        setDraftTokenIds(draft?.kind === "word_order" ? draft.tokenIds : []);
        setMatchedPairIds(
          draft?.kind === "association"
            ? draft.pairs.map(({ promptPairId }) => promptPairId)
            : [],
        );
        setRecallValue(draft?.kind === "recall" ? draft.value : "");
        setStartedAt(
          checkpoint === null
            ? Date.now()
            : Date.parse(checkpoint.sessionStartedAt),
        );
        setStage(
          recoveredExperience.expedition === null
            ? "intro"
            : complete
              ? "recap"
              : "question",
        );
        if (current === undefined && !complete) {
          throw new Error("L'exercice suivant est introuvable.");
        }
        setStorageStatus("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setStorageStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Le parcours mixte local n'a pas pu être repris.",
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

  const current = nextMobileLessonExercise(config, experienceSnapshot);
  const currentIndex =
    current === undefined ? -1 : config.exercises.indexOf(current);

  function playSignal(target = current): void {
    if (!isAudioLessonExerciseConfig(target)) return;
    setMessage("");
    player.pause();
    player.replace(target.modelAudioSource);
    player.play();
  }

  async function ensureQuestion(
    exerciseId: string,
  ): Promise<LocalExperienceSnapshot> {
    let snapshot = experienceSnapshot ?? (await experienceStore.read());
    if (snapshot.lesson === null) {
      snapshot = await experienceStore.startLesson({
        lessonVersionId: config.lesson.versionId,
        exerciseId,
        startedAt: new Date(startedAt || Date.now()).toISOString(),
      });
    }
    if (snapshot.lesson?.phase === "intro") {
      snapshot = await experienceStore.openLessonQuestion(
        new Date().toISOString(),
      );
    }
    if (
      snapshot.lesson === null ||
      (snapshot.lesson.phase !== "question" &&
        snapshot.lesson.phase !== "submitting")
    ) {
      throw new Error("La question locale n'est pas prête.");
    }
    setExperienceSnapshot(snapshot);
    return snapshot;
  }

  async function saveDraft(
    answer: LocalDraftAnswer | null,
    missedOnce = false,
  ): Promise<void> {
    if (current === undefined) return;
    const next = await ensureQuestion(current.exercise.id);
    const previousMissed =
      next.lesson?.phase === "question" ? next.lesson.missedOnce : false;
    const snapshot = await experienceStore.saveLessonDraft(
      { answer, missedOnce: previousMissed || missedOnce },
      new Date().toISOString(),
    );
    setExperienceSnapshot(snapshot);
  }

  function selectOption(optionId: string): void {
    if (
      current?.exercise.type !== "audio_choice" &&
      current?.exercise.type !== "reading"
    ) {
      return;
    }
    if (checkpointInFlight.current || isSaving || storageStatus !== "ready") {
      return;
    }
    checkpointInFlight.current = true;
    setIsSaving(true);
    setMessage("");
    const previous = selectedOptionId;
    setSelectedOptionId(optionId);
    const started = startedAt === 0 ? Date.now() : startedAt;
    void experienceStore
      .selectExpeditionOption({
        lessonVersionId: config.lesson.versionId,
        exerciseId: current.exercise.id,
        startedAt: new Date(started).toISOString(),
        selectedOptionId: optionId,
        now: new Date().toISOString(),
      })
      .then((next) => {
        setExperienceSnapshot(next);
        setStartedAt(started);
      })
      .catch((error: unknown) => {
        setSelectedOptionId(previous);
        setMessage(
          error instanceof Error
            ? error.message
            : "Ce choix n'a pas pu être conservé.",
        );
      })
      .finally(() => {
        checkpointInFlight.current = false;
        setIsSaving(false);
      });
  }

  function changeWordOrder(tokenId: string, add: boolean): void {
    if (current?.exercise.type !== "word_order") return;
    if (checkpointInFlight.current || isSaving || storageStatus !== "ready")
      return;
    const nextTokenIds = add
      ? [...draftTokenIds, tokenId]
      : draftTokenIds.filter((candidate) => candidate !== tokenId);
    checkpointInFlight.current = true;
    setIsSaving(true);
    setMessage("");
    void saveDraft({ kind: "word_order", tokenIds: nextTokenIds })
      .then(() => setDraftTokenIds(nextTokenIds))
      .catch((error: unknown) =>
        setMessage(
          error instanceof Error
            ? error.message
            : "Le brouillon n'a pas été conservé.",
        ),
      )
      .finally(() => {
        checkpointInFlight.current = false;
        setIsSaving(false);
      });
  }

  function saveAssociationDraft(
    pairIds: readonly string[],
    missedOnce = false,
  ): Promise<void> {
    return saveDraft(
      {
        kind: "association",
        pairs: pairIds.map((pairId) => ({
          promptPairId: pairId,
          chosenPairId: pairId,
        })),
      },
      missedOnce,
    ).then(() => {
      setMatchedPairIds([...pairIds]);
    });
  }

  function selectAssociationPrompt(pairId: string): void {
    if (
      current?.exercise.type !== "association" ||
      checkpointInFlight.current ||
      isSaving ||
      matchedPairIds.includes(pairId)
    ) {
      return;
    }
    setSelectedPairId(pairId);
    setMessage("");
  }

  function selectAssociationLabel(labelPairId: string): void {
    if (current?.exercise.type !== "association" || isSaving) return;
    if (selectedPairId === null) {
      setMessage("Touchez d'abord un mot thaï, puis sa fiche française.");
      return;
    }
    if (matchedPairIds.includes(labelPairId)) return;
    const selected = selectedPairId;
    setSelectedPairId(null);
    checkpointInFlight.current = true;
    setIsSaving(true);
    if (selected !== labelPairId) {
      void saveAssociationDraft(matchedPairIds, true)
        .catch((error: unknown) =>
          setMessage(
            error instanceof Error
              ? error.message
              : "L'erreur n'a pas été conservée.",
          ),
        )
        .finally(() => {
          checkpointInFlight.current = false;
          setIsSaving(false);
        });
      setMessage(current.exercise.feedback.incorrectFr);
      return;
    }
    void saveAssociationDraft([...matchedPairIds, labelPairId])
      .catch((error: unknown) =>
        setMessage(
          error instanceof Error
            ? error.message
            : "La paire n'a pas été conservée.",
        ),
      )
      .finally(() => {
        checkpointInFlight.current = false;
        setIsSaving(false);
      });
  }

  function changeRecall(value: string): void {
    setRecallValue(value);
    setMessage("");
    if (current?.exercise.type !== "recall" || storageStatus !== "ready")
      return;
    recallDraftWrite.current = recallDraftWrite.current
      .catch(() => undefined)
      .then(() => saveDraft({ kind: "recall", value }));
  }

  async function submitAnswer(): Promise<void> {
    if (current === undefined || storageStatus !== "ready") return;
    if (
      current.exercise.type === "audio_choice" ||
      current.exercise.type === "reading"
    ) {
      if (selectedOptionId === null) {
        setMessage("Choisissez une réponse avant de valider.");
        return;
      }
    }
    if (current.exercise.type === "word_order" && draftTokenIds.length === 0) {
      setMessage("Choisissez les jetons avant de valider.");
      return;
    }
    if (
      current.exercise.type === "association" &&
      matchedPairIds.length !== current.exercise.pairs.length
    ) {
      setMessage("Associez toutes les cartes avant de valider.");
      return;
    }
    if (current.exercise.type === "recall" && recallValue.trim().length === 0) {
      setMessage("Saisissez votre réponse avant de valider.");
      return;
    }
    if (current.exercise.type === "recall") await recallDraftWrite.current;

    let snapshot = await ensureQuestion(current.exercise.id);
    if (current.exercise.type === "recall") {
      snapshot = await experienceStore.saveLessonDraft(
        { answer: { kind: "recall", value: recallValue } },
        new Date().toISOString(),
      );
      setExperienceSnapshot(snapshot);
    }
    const lesson = snapshot.lesson;
    if (
      lesson === null ||
      (lesson.phase !== "question" && lesson.phase !== "submitting")
    ) {
      throw new Error("La question locale n'est pas prête.");
    }

    let exactSubmission: ValidatedAttemptSubmission;
    if (lesson.phase === "submitting") {
      exactSubmission = lesson.submission;
    } else {
      const deviceId = await outboxStore.getOrCreateDeviceId(randomUUID);
      const answeredAt = new Date().toISOString();
      const answerInput =
        current.exercise.type === "audio_choice" ||
        current.exercise.type === "reading"
          ? { selectedOptionId }
          : (() => {
              const draftAnswer = lesson.draftAnswer;
              if (
                draftAnswer === null ||
                draftAnswer.kind !== current.exercise.type
              ) {
                throw new Error("La réponse construite n'est plus disponible.");
              }
              return { answer: draftAnswer };
            })();
      const candidate = attemptSubmissionSchema.parse({
        eventId: randomUUID(),
        deviceId,
        exerciseId: current.exercise.id,
        ...answerInput,
        answeredAt,
        durationMs: Math.min(
          MAX_ATTEMPT_DURATION_MS,
          Math.max(0, Date.parse(answeredAt) - startedAt),
        ),
        contentVersionId: config.lesson.versionId,
        algorithmVersion: SRS_ALGORITHM_VERSION,
      });
      snapshot = await experienceStore.prepareLessonSubmission(
        candidate,
        answeredAt,
      );
      if (snapshot.lesson?.phase !== "submitting") {
        throw new Error("La tentative n'a pas été réservée.");
      }
      exactSubmission = snapshot.lesson.submission;
      setExperienceSnapshot(snapshot);
    }

    const durableOutbox = await outboxStore.enqueue(exactSubmission);
    setOutbox(durableOutbox);
    await experienceStore.confirmLessonResult(
      durableOutbox,
      new Date().toISOString(),
    );
    await experienceStore.finishLesson(durableOutbox, new Date().toISOString());
    const event = getMobileLessonEvent(
      durableOutbox,
      config,
      exactSubmission.eventId,
    );
    if (event === undefined) {
      throw new Error("La tentative n'a pas pu être évaluée localement.");
    }
    const recorded = await experienceStore.recordExpeditionResult({
      exerciseId: current.exercise.id,
      rating: event.rating,
      answeredAt: exactSubmission.answeredAt,
    });
    const projection = getProjectionForMobileLessonExercise(
      durableOutbox,
      config,
      current,
    );
    setExperienceSnapshot(recorded);
    setCelebration({
      dueAt: projection?.state.dueAt,
      exerciseId: current.exercise.id,
      masteryScore: projection?.state.masteryScore ?? 0,
      rating: event.rating,
    });
    setSelectedOptionId(null);
    setDraftTokenIds([]);
    setMatchedPairIds([]);
    setSelectedPairId(null);
    setRecallValue("");
    setStage("celebration");
    safeCapture(analytics, {
      name: "exercise_answered",
      lessonVersionId: config.lesson.versionId,
      exerciseType: current.exercise.type,
      correct: event.rating === 1,
      durationBucket: durationBucket(
        exactSubmission.durationMs || Math.max(0, Date.now() - startedAt),
      ),
      platform: Platform.OS === "ios" ? "ios" : "android",
    });
    AccessibilityInfo.announceForAccessibility(
      event.rating === 1
        ? current.exercise.feedback.correctFr
        : current.exercise.feedback.incorrectFr,
    );
  }

  function handleSubmit(): void {
    if (submissionInFlight.current) return;
    submissionInFlight.current = true;
    setIsSaving(true);
    setMessage("");
    void submitAnswer()
      .catch((error: unknown) =>
        setMessage(
          error instanceof Error
            ? error.message
            : "La tentative reste locale et sera reprise.",
        ),
      )
      .finally(() => {
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
        setStartedAt(Date.parse(started));
        setStage("question");
        safeCapture(analytics, {
          name: "lesson_started",
          lessonVersionId: config.lesson.versionId,
          platform: Platform.OS === "ios" ? "ios" : "android",
        });
      })
      .catch((error: unknown) =>
        setMessage(
          error instanceof Error
            ? error.message
            : "La leçon n'a pas pu démarrer.",
        ),
      )
      .finally(() => {
        checkpointInFlight.current = false;
        setIsSaving(false);
      });
  }

  function handleContinue(): void {
    setCelebration(null);
    setMessage("");
    const complete =
      experienceSnapshot?.expedition?.results.length ===
      config.exercises.length;
    setStage(complete ? "recap" : "question");
    setStartedAt(Date.now());
  }

  function handleFinish(): void {
    if (finishInFlight.current || storageStatus !== "ready") return;
    if (
      experienceSnapshot?.expedition?.results.length !== config.exercises.length
    ) {
      setMessage("Terminez tous les exercices avant de clôturer.");
      return;
    }
    finishInFlight.current = true;
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
      .catch((error: unknown) =>
        setMessage(
          error instanceof Error
            ? error.message
            : "La leçon reste conservée localement.",
        ),
      )
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
  const complete =
    experienceSnapshot?.expedition?.results.length === config.exercises.length;
  const celebrationCurrent =
    celebration === null
      ? undefined
      : config.exercises.find(
          ({ exercise }) => exercise.id === celebration.exerciseId,
        );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Header step={config.headerStep} />
      <Banner
        config={config}
        pendingAttempts={pendingAttempts}
        storageStatus={storageStatus}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {stage === "intro" && (
          <IntroStage
            config={config}
            hasFirstAudio={
              config.exercises[0]?.exercise.type === "audio_choice"
            }
            message={message}
            onPlaySignal={() => playSignal(config.exercises[0])}
            onRetry={retryStorage}
            onStart={handleStart}
            storageStatus={storageStatus}
          />
        )}
        {stage === "question" && isAudioLessonExerciseConfig(current) && (
          <AudioQuestion
            current={current}
            index={currentIndex}
            isSaving={isSaving}
            message={message}
            onPlay={() => playSignal(current)}
            onSelect={selectOption}
            onSubmit={handleSubmit}
            selectedOptionId={selectedOptionId}
            total={config.exercises.length}
          />
        )}
        {stage === "question" && isWordOrderLessonExerciseConfig(current) && (
          <WordOrderQuestion
            current={current}
            draftTokenIds={draftTokenIds}
            isSaving={isSaving}
            message={message}
            onAdd={(tokenId) => changeWordOrder(tokenId, true)}
            onRemove={(tokenId) => changeWordOrder(tokenId, false)}
            onSubmit={handleSubmit}
          />
        )}
        {stage === "question" && isAssociationLessonExerciseConfig(current) && (
          <AssociationQuestion
            current={current}
            items={config.lesson.items}
            isSaving={isSaving}
            matchedPairIds={matchedPairIds}
            message={message}
            onSelectLabel={selectAssociationLabel}
            onSelectPrompt={selectAssociationPrompt}
            onSubmit={handleSubmit}
            selectedPairId={selectedPairId}
          />
        )}
        {stage === "question" && isRecallLessonExerciseConfig(current) && (
          <RecallQuestion
            current={current}
            isSaving={isSaving}
            message={message}
            onChange={changeRecall}
            onSubmit={handleSubmit}
            value={recallValue}
          />
        )}
        {stage === "question" && isReadingLessonExerciseConfig(current) && (
          <ReadingQuestion
            current={current}
            isSaving={isSaving}
            message={message}
            onSelect={selectOption}
            onSubmit={handleSubmit}
            selectedOptionId={selectedOptionId}
          />
        )}
        {stage === "celebration" &&
          celebrationCurrent !== undefined &&
          celebration !== null && (
            <CelebrationStage
              celebration={celebration}
              current={celebrationCurrent}
              onContinue={handleContinue}
            />
          )}
        {stage === "recap" && complete && (
          <RecapStage config={config} onFinish={handleFinish} outbox={outbox} />
        )}
        {stage !== "intro" && storageStatus === "error" && (
          <View style={styles.storageError}>
            <QuestionMessage message={message} />
            <Pressable
              accessibilityRole="button"
              style={styles.secondaryButton}
              onPress={retryStorage}
            >
              <Text style={styles.secondaryButtonText}>
                Réessayer le stockage
              </Text>
            </Pressable>
          </View>
        )}
        {current !== undefined && stage === "question" && (
          <MobileContentReportPanel
            analytics={analytics}
            contentVersionId={config.lesson.versionId}
            exerciseId={current.exercise.id}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function MobileLessonExpeditionRoute() {
  const { analytics } = useMobileAnalytics();
  const params = useLocalSearchParams<{ lessonId?: string }>();
  const rawLessonId = params.lessonId;
  const lessonId = Array.isArray(rawLessonId) ? rawLessonId[0] : rawLessonId;
  const config =
    lessonId === undefined
      ? undefined
      : getMobileUnit01MixedExpeditionConfig(lessonId);
  if (lessonId === undefined || config === undefined) {
    return <UnavailableMobileLesson lessonId={lessonId ?? "inconnue"} />;
  }
  return (
    <MobileLessonExpeditionExperience
      key={lessonId}
      analytics={analytics}
      config={config}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.jasmine },
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
    backgroundColor: colors.saffronHalo,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e3d6ad",
  },
  bannerTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  bannerText: { marginTop: 3, color: colors.inkSoft, fontSize: 12 },
  content: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 52,
  },
  screen: { gap: 16 },
  eyebrow: {
    color: colors.jadeInk,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: { color: colors.ink, fontSize: 32, lineHeight: 39, fontWeight: "800" },
  body: { color: colors.inkSoft, fontSize: 16, lineHeight: 24 },
  helper: { color: colors.inkSoft, fontSize: 14, lineHeight: 21 },
  exercisePrompt: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "800",
  },
  primaryButton: {
    minHeight: 52,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.coral,
  },
  primaryButtonText: { color: "white", fontSize: 16, fontWeight: "800" },
  secondaryButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "white",
  },
  secondaryButtonText: { color: colors.ink, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.82 },
  error: { color: colors.coralDeep, fontSize: 14, lineHeight: 21 },
  answers: { gap: 10 },
  answer: {
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: "white",
  },
  answerSelected: {
    borderColor: colors.jadeInk,
    backgroundColor: colors.jadePale,
  },
  answerText: { flex: 1, color: colors.ink, fontSize: 16, lineHeight: 22 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.inkSoft,
  },
  radioSelected: {
    borderColor: colors.jadeInk,
    backgroundColor: colors.jadeInk,
  },
  audioButton: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.ink,
  },
  audioButtonText: { color: "white", fontSize: 16, fontWeight: "800" },
  answerTray: {
    minHeight: 70,
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.jade,
    borderRadius: 16,
    backgroundColor: colors.jadePale,
  },
  trayPlaceholder: { color: colors.inkSoft, fontSize: 14 },
  tokenPool: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  token: {
    minWidth: 82,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: "white",
  },
  tokenSelected: {
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: colors.ink,
  },
  tokenUsed: { opacity: 0.4 },
  tokenThai: {
    color: colors.ink,
    fontFamily: THAI_FONT_REGULAR,
    fontSize: 21,
    lineHeight: 28,
  },
  tokenLatin: { color: colors.inkSoft, fontSize: 11 },
  associationColumns: { flexDirection: "row", gap: 12 },
  associationColumn: { flex: 1, gap: 10 },
  associationTile: {
    minHeight: 58,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: "white",
  },
  associationTileSelected: {
    borderColor: colors.coral,
    backgroundColor: colors.coralPale,
  },
  associationTileDone: {
    borderColor: colors.jade,
    backgroundColor: colors.jadePale,
    opacity: 0.65,
  },
  associationThai: {
    color: colors.ink,
    fontFamily: THAI_FONT_REGULAR,
    fontSize: 20,
    lineHeight: 28,
  },
  associationLabel: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  recallInput: {
    minHeight: 62,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.ink,
    fontFamily: THAI_FONT_REGULAR,
    fontSize: 22,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: "white",
  },
  readingStimulus: {
    padding: 22,
    color: colors.ink,
    fontFamily: THAI_FONT_REGULAR,
    fontSize: 42,
    lineHeight: 62,
    textAlign: "center",
    borderRadius: 18,
    backgroundColor: colors.mist,
  },
  glyph: {
    color: colors.ink,
    fontFamily: THAI_FONT_REGULAR,
    fontSize: 48,
    lineHeight: 70,
  },
  translation: { color: colors.inkSoft, fontSize: 17 },
  metric: { padding: 16, borderRadius: 14, backgroundColor: colors.mist },
  metricLabel: {
    color: colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  metricValue: {
    marginTop: 4,
    color: colors.ink,
    fontSize: 23,
    fontWeight: "800",
  },
  metricDate: {
    marginTop: 4,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  recapList: { gap: 10 },
  recapRow: {
    minHeight: 72,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    backgroundColor: colors.mist,
  },
  recapIndex: { width: 24, color: colors.inkSoft, fontWeight: "800" },
  recapCopy: { flex: 1 },
  recapThai: { color: colors.ink, fontFamily: THAI_FONT_REGULAR, fontSize: 20 },
  recapTranslation: { marginTop: 2, color: colors.inkSoft, fontSize: 13 },
  recapScore: { minWidth: 90, alignItems: "flex-end" },
  recapScoreValue: { color: colors.jadeInk, fontSize: 16, fontWeight: "800" },
  recapDue: {
    marginTop: 2,
    color: colors.inkSoft,
    fontSize: 11,
    textAlign: "right",
  },
  storageError: { marginTop: 18, gap: 10 },
});
