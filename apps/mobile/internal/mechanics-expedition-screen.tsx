// Aperçu éditorial conservé hors du graphe Expo public.
import type { AnalyticsSink } from "@thainaute/analytics";
import { SRS_ALGORITHM_VERSION, libelleMaitrise } from "@thainaute/domain";
import {
  attemptSubmissionSchema,
  attemptSubmissionsAreEqual,
  createAttemptOutboxSnapshot,
  MAX_ATTEMPT_DURATION_MS,
  type AttemptOutboxSnapshot,
  type LocalExperienceSnapshot,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
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
  getMobileUnit01MechanicsExpeditionConfig,
  type MechanicsExpeditionConfig,
  type MechanicsExpeditionExerciseConfig,
} from "../lib/embedded-mechanics-expedition-config";
import {
  getMechanicsEvent,
  getProjectionForMechanicsExercise,
  nextMechanicsExpeditionExercise,
} from "../lib/mechanics-expedition-state";
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
  readonly config: MechanicsExpeditionConfig;
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
  message,
  onRetry,
  onStart,
  storageStatus,
}: {
  readonly config: MechanicsExpeditionConfig;
  readonly message: string;
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
        Assemblez la réponse à votre rythme. Chaque geste est conservé sur
        l&apos;appareil, sans réseau ni compte obligatoire.
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
      {message !== "" && (
        <Text accessibilityRole="alert" style={styles.error}>
          {message}
        </Text>
      )}
    </View>
  );
}

function WordOrderQuestion({
  current,
  draftTokenIds,
  isSaving,
  message,
  onAddToken,
  onRemoveToken,
  onSubmit,
}: {
  readonly current: Extract<
    MechanicsExpeditionExerciseConfig["exercise"],
    { type: "word_order" }
  >;
  readonly draftTokenIds: readonly string[];
  readonly isSaving: boolean;
  readonly message: string;
  readonly onAddToken: (tokenId: string) => void;
  readonly onRemoveToken: (tokenId: string) => void;
  readonly onSubmit: () => void;
}) {
  const selected = new Set(draftTokenIds);
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>ORDRE DES MOTS</Text>
      <Text accessibilityRole="header" style={styles.exercisePrompt}>
        {current.promptFr}
      </Text>
      <Text style={styles.helper}>
        Touchez les jetons dans l&apos;ordre. Touchez une réponse pour la
        retirer et la corriger.
      </Text>
      <View style={styles.answerTray} accessibilityRole="list">
        {draftTokenIds.length === 0 ? (
          <Text style={styles.emptyTray}>Votre réponse apparaîtra ici.</Text>
        ) : (
          draftTokenIds.map((tokenId, index) => {
            const token = current.tokens.find(({ id }) => id === tokenId);
            return (
              <Pressable
                accessibilityLabel={`Retirer le jeton ${token?.thaiRaw ?? index + 1}`}
                accessibilityRole="button"
                key={tokenId}
                style={styles.selectedToken}
                onPress={() => onRemoveToken(tokenId)}
              >
                <Text style={styles.selectedTokenIndex}>{index + 1}</Text>
                <Text style={styles.tokenThai} accessibilityLanguage="th-TH">
                  {token?.thaiRaw ?? "?"}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>
      <View style={styles.tokenBank} accessibilityRole="list">
        {current.tokens.map((token) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled: isSaving || selected.has(token.id),
            }}
            disabled={isSaving || selected.has(token.id)}
            key={token.id}
            style={[styles.token, selected.has(token.id) && styles.tokenUsed]}
            onPress={() => onAddToken(token.id)}
          >
            <Text style={styles.tokenThai} accessibilityLanguage="th-TH">
              {token.thaiRaw}
            </Text>
            {token.transcription !== null && (
              <Text style={styles.tokenTranscription}>
                {token.transcription}
              </Text>
            )}
          </Pressable>
        ))}
      </View>
      {message !== "" && (
        <Text accessibilityRole="alert" style={styles.error}>
          {message}
        </Text>
      )}
      <Pressable
        accessibilityLabel={
          isSaving ? "Enregistrement en cours" : "Valider l'ordre"
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: isSaving }}
        disabled={isSaving}
        style={[styles.primaryButton, isSaving && styles.disabled]}
        onPress={onSubmit}
      >
        <Text style={styles.primaryButtonText}>
          {isSaving ? "Enregistrement…" : "Valider l&apos;ordre"}
        </Text>
      </Pressable>
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
  readonly current: Extract<
    MechanicsExpeditionExerciseConfig["exercise"],
    { type: "association" }
  >;
  readonly items: MechanicsExpeditionConfig["lesson"]["items"];
  readonly isSaving: boolean;
  readonly matchedPairIds: readonly string[];
  readonly message: string;
  readonly onSelectLabel: (pairId: string) => void;
  readonly onSelectPrompt: (pairId: string) => void;
  readonly onSubmit: () => void;
  readonly selectedPairId: string | null;
}) {
  const itemById = new Map(items.map((item) => [item.id, item] as const));
  const labels = [...current.pairs].sort((left, right) =>
    left.labelFr.localeCompare(right.labelFr),
  );
  const complete = matchedPairIds.length === current.pairs.length;
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>ASSOCIATION</Text>
      <Text accessibilityRole="header" style={styles.exercisePrompt}>
        {current.promptFr}
      </Text>
      <Text style={styles.helper}>
        Touchez un mot thaï, puis sa fiche française. Les erreurs restent
        comptées, sans vous retirer de vie.
      </Text>
      <View style={styles.associationColumns}>
        <View
          accessibilityRole="list"
          accessibilityLabel="Mots thaïs"
          style={styles.associationColumn}
        >
          {current.pairs.map((pair) => {
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
          accessibilityRole="list"
          accessibilityLabel="Fiches françaises"
          style={styles.associationColumn}
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
      {message !== "" && (
        <Text accessibilityRole="alert" style={styles.error}>
          {message}
        </Text>
      )}
      <Pressable
        accessibilityLabel={
          isSaving
            ? "Enregistrement en cours"
            : complete
              ? "Valider l'association"
              : "Associez toutes les cartes"
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: isSaving || !complete }}
        disabled={isSaving || !complete}
        style={[
          styles.primaryButton,
          (isSaving || !complete) && styles.disabled,
        ]}
        onPress={onSubmit}
      >
        <Text style={styles.primaryButtonText}>
          {isSaving ? "Enregistrement…" : "Valider l'association"}
        </Text>
      </Pressable>
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
  readonly current: Extract<
    MechanicsExpeditionExerciseConfig["exercise"],
    { type: "recall" }
  >;
  readonly isSaving: boolean;
  readonly message: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly value: string;
}) {
  const hasValue = value.trim().length > 0;
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>RAPPEL</Text>
      <Text accessibilityRole="header" style={styles.exercisePrompt}>
        {current.promptFr}
      </Text>
      <Text style={styles.helper}>
        Écrivez votre réponse thaïe. La correction applique la politique de
        normalisation de cette leçon, pas une interprétation approximative.
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
      {message !== "" && (
        <Text accessibilityRole="alert" style={styles.error}>
          {message}
        </Text>
      )}
      <Pressable
        accessibilityLabel={
          isSaving ? "Enregistrement en cours" : "Valider le rappel"
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: isSaving || !hasValue }}
        disabled={isSaving || !hasValue}
        style={[
          styles.primaryButton,
          (isSaving || !hasValue) && styles.disabled,
        ]}
        onPress={onSubmit}
      >
        <Text style={styles.primaryButtonText}>
          {isSaving ? "Enregistrement…" : "Valider le rappel"}
        </Text>
      </Pressable>
    </View>
  );
}

function ReadingQuestion({
  current,
  itemThai,
  isSaving,
  message,
  onSelect,
  onSubmit,
  selectedOptionId,
}: {
  readonly current: Extract<
    MechanicsExpeditionExerciseConfig["exercise"],
    { type: "reading" }
  >;
  readonly itemThai: string;
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
        {current.promptFr}
      </Text>
      <Text style={styles.readingStimulus} accessibilityLanguage="th-TH">
        {itemThai}
      </Text>
      <View accessibilityRole="radiogroup" style={styles.answers}>
        {current.options.map((option) => {
          const selected = selectedOptionId === option.id;
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
      {message !== "" && (
        <Text accessibilityRole="alert" style={styles.error}>
          {message}
        </Text>
      )}
      <Pressable
        accessibilityLabel={
          isSaving ? "Enregistrement en cours" : "Valider la lecture"
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: isSaving }}
        disabled={isSaving}
        style={[styles.primaryButton, isSaving && styles.disabled]}
        onPress={onSubmit}
      >
        <Text style={styles.primaryButtonText}>
          {isSaving ? "Enregistrement…" : "Valider la lecture"}
        </Text>
      </Pressable>
    </View>
  );
}

function CelebrationStage({
  current,
  celebration,
  itemText,
  onContinue,
}: {
  readonly current: MechanicsExpeditionExerciseConfig;
  readonly celebration: Celebration;
  readonly itemText: string;
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
        {itemText}
      </Text>
      <Text style={styles.translation}>{current.item.translationFr}</Text>
      <View style={styles.metric}>
        <Text style={styles.metricLabel}>MAÎTRISE ESTIMÉE</Text>
        <Text style={styles.metricValue}>
          {libelleMaitrise(celebration.masteryScore)}
        </Text>
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
  readonly config: MechanicsExpeditionConfig;
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
          const projection = getProjectionForMechanicsExercise(
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
                  {libelleMaitrise(projection?.state.masteryScore ?? 0)}
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

function UnavailableMechanicsExpedition({
  lessonId,
}: {
  readonly lessonId: string;
}) {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <Text style={styles.eyebrow}>CONTENU MOBILE</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Cette leçon n&apos;est pas encore disponible.
        </Text>
        <Text style={styles.body}>
          La leçon {lessonId} attend encore une mécanique mobile compatible.
        </Text>
        <Pressable
          accessibilityRole="button"
          style={styles.primaryButton}
          onPress={() => router.push("/unit-01")}
        >
          <Text style={styles.primaryButtonText}>Retour à l&apos;unité 1</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export function MechanicsExpeditionExperience({
  analytics,
  config,
}: {
  readonly analytics: AnalyticsSink;
  readonly config: MechanicsExpeditionConfig;
}) {
  const database = useSQLiteContext();
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
  const [stage, setStage] = useState<Stage>("intro");
  const [storageStatus, setStorageStatus] = useState<StorageStatus>("loading");
  const [storageRetryToken, setStorageRetryToken] = useState(0);
  const [outbox, setOutbox] = useState<AttemptOutboxSnapshot>(() =>
    createAttemptOutboxSnapshot(),
  );
  const [experienceSnapshot, setExperienceSnapshot] =
    useState<LocalExperienceSnapshot | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<readonly string[]>([]);
  const [draftTokenIds, setDraftTokenIds] = useState<readonly string[]>([]);
  const [recallValue, setRecallValue] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const checkpointInFlight = useRef(false);
  const submissionInFlight = useRef(false);
  const finishInFlight = useRef(false);
  const recallDraftWrite = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;
    void Promise.all([outboxStore.read(), experienceStore.read()])
      .then(async ([storedOutbox, storedExperience]) => {
        if (storedExperience.onboarding.status !== "completed") {
          router.replace("/");
          return;
        }
        let recoveredOutbox = storedOutbox;
        let recoveredExperience = storedExperience;
        const expedition = recoveredExperience.expedition;
        if (
          expedition !== null &&
          expedition.lessonVersionId !== config.lesson.versionId
        ) {
          throw new Error(
            "Une autre expédition est déjà conservée sur cet appareil.",
          );
        }

        const checkpoint = recoveredExperience.lesson;
        if (expedition === null && checkpoint !== null) {
          if (checkpoint.phase === "intro" || checkpoint.phase === "question") {
            recoveredExperience = await experienceStore.discardLessonQuestion();
          } else {
            throw new Error(
              "Une tentative précédente doit être reprise avant cette leçon.",
            );
          }
        }

        const activeExpedition = recoveredExperience.expedition;
        const activeCheckpoint = recoveredExperience.lesson;
        if (activeExpedition !== null && activeCheckpoint !== null) {
          if (activeCheckpoint.phase === "submitting") {
            recoveredOutbox = await outboxStore.enqueue(
              activeCheckpoint.submission,
            );
            recoveredExperience = await experienceStore.confirmLessonResult(
              recoveredOutbox,
              new Date().toISOString(),
            );
          }
          const resultCheckpoint = recoveredExperience.lesson;
          if (
            resultCheckpoint !== null &&
            (resultCheckpoint.phase === "result" ||
              resultCheckpoint.phase === "completed")
          ) {
            const durable = recoveredOutbox.entries.find(
              ({ submission }) =>
                submission.eventId === resultCheckpoint.submission.eventId,
            );
            if (
              durable === undefined ||
              durable.status === "rejected" ||
              !attemptSubmissionsAreEqual(
                durable.submission,
                resultCheckpoint.submission,
              )
            ) {
              throw new Error(
                "Le résultat local ne correspond plus au journal.",
              );
            }
            if (resultCheckpoint.phase === "result") {
              recoveredExperience = await experienceStore.finishLesson(
                recoveredOutbox,
                new Date().toISOString(),
              );
            }
            const event = getMechanicsEvent(
              recoveredOutbox,
              config,
              resultCheckpoint.submission.eventId,
            );
            if (event === undefined)
              throw new Error("La tentative locale n'a pas pu être évaluée.");
            if (
              !activeExpedition.results.some(
                ({ exerciseId }) => exerciseId === resultCheckpoint.exerciseId,
              )
            ) {
              recoveredExperience =
                await experienceStore.recordExpeditionResult({
                  exerciseId: resultCheckpoint.exerciseId,
                  rating: event.rating,
                  answeredAt: resultCheckpoint.submission.answeredAt,
                });
            }
          }
        }

        if (!active) return;
        setOutbox(recoveredOutbox);
        setExperienceSnapshot(recoveredExperience);
        const currentCheckpoint = recoveredExperience.lesson;
        setSelectedOptionId(
          currentCheckpoint?.phase === "question"
            ? currentCheckpoint.selectedOptionId
            : null,
        );
        setSelectedPairId(null);
        setMatchedPairIds(
          currentCheckpoint?.phase === "question" &&
            currentCheckpoint.draftAnswer?.kind === "association"
            ? currentCheckpoint.draftAnswer.pairs.map(
                ({ promptPairId }) => promptPairId,
              )
            : [],
        );
        setDraftTokenIds(
          currentCheckpoint?.phase === "question" &&
            currentCheckpoint.draftAnswer?.kind === "word_order"
            ? currentCheckpoint.draftAnswer.tokenIds
            : [],
        );
        setRecallValue(
          currentCheckpoint?.phase === "question" &&
            currentCheckpoint.draftAnswer?.kind === "recall"
            ? currentCheckpoint.draftAnswer.value
            : "",
        );
        setStartedAt(
          currentCheckpoint === null
            ? Date.now()
            : Date.parse(currentCheckpoint.sessionStartedAt),
        );
        const complete =
          recoveredExperience.expedition !== null &&
          recoveredExperience.expedition.results.length ===
            config.exercises.length;
        setStage(
          recoveredExperience.expedition === null
            ? "intro"
            : complete
              ? "recap"
              : "question",
        );
        setStorageStatus("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setStorageStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Le parcours local n'a pas pu être repris.",
        );
      });
    return () => {
      active = false;
    };
  }, [config, experienceStore, outboxStore, router, storageRetryToken]);

  const current = nextMechanicsExpeditionExercise(config, experienceSnapshot);

  async function ensureQuestion(
    exerciseId: string,
  ): Promise<LocalExperienceSnapshot> {
    if (
      experienceSnapshot?.expedition === null ||
      experienceSnapshot?.expedition === undefined
    ) {
      throw new Error("La leçon doit d'abord être démarrée.");
    }
    let next = experienceSnapshot;
    if (next.lesson === null) {
      next = await experienceStore.startLesson({
        lessonVersionId: config.lesson.versionId,
        exerciseId,
        startedAt: new Date(startedAt || Date.now()).toISOString(),
      });
    }
    if (next.lesson?.phase === "intro") {
      next = await experienceStore.openLessonQuestion(new Date().toISOString());
    }
    if (next.lesson?.exerciseId !== exerciseId) {
      throw new Error("Une autre question locale est encore active.");
    }
    setExperienceSnapshot(next);
    return next;
  }

  async function saveWordOrderDraft(
    nextTokenIds: readonly string[],
    missedOnce = false,
  ): Promise<void> {
    if (current?.exercise.type !== "word_order") return;
    const next = await ensureQuestion(current.exercise.id);
    const previousMissed =
      next.lesson?.phase === "question" ? next.lesson.missedOnce : false;
    const snapshot = await experienceStore.saveLessonDraft(
      {
        answer: { kind: "word_order", tokenIds: [...nextTokenIds] },
        missedOnce: previousMissed || missedOnce,
      },
      new Date().toISOString(),
    );
    setExperienceSnapshot(snapshot);
    setDraftTokenIds([...nextTokenIds]);
  }

  async function saveAssociationDraft(
    nextPairIds: readonly string[],
    missedOnce = false,
  ): Promise<void> {
    if (current?.exercise.type !== "association") return;
    const next = await ensureQuestion(current.exercise.id);
    const previousMissed =
      next.lesson?.phase === "question" ? next.lesson.missedOnce : false;
    const snapshot = await experienceStore.saveLessonDraft(
      {
        answer: {
          kind: "association",
          pairs: nextPairIds.map((pairId) => ({
            promptPairId: pairId,
            chosenPairId: pairId,
          })),
        },
        missedOnce: previousMissed || missedOnce,
      },
      new Date().toISOString(),
    );
    setExperienceSnapshot(snapshot);
    setMatchedPairIds([...nextPairIds]);
  }

  async function saveRecallDraft(value: string): Promise<void> {
    if (current?.exercise.type !== "recall") return;
    const next = await ensureQuestion(current.exercise.id);
    const snapshot = await experienceStore.saveLessonDraft(
      { answer: { kind: "recall", value } },
      new Date().toISOString(),
    );
    setExperienceSnapshot(snapshot);
    if (next.lesson?.phase !== "question") {
      throw new Error("Le brouillon de rappel n'est pas disponible.");
    }
  }

  function changeRecall(value: string): void {
    setRecallValue(value);
    setMessage("");
    if (current?.exercise.type !== "recall" || storageStatus !== "ready") {
      return;
    }
    recallDraftWrite.current = recallDraftWrite.current
      .catch(() => undefined)
      .then(() => saveRecallDraft(value))
      .catch((error: unknown) =>
        setMessage(
          error instanceof Error
            ? error.message
            : "La réponse n'a pas pu être conservée.",
        ),
      );
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
    if (selected !== labelPairId) {
      checkpointInFlight.current = true;
      setIsSaving(true);
      void saveAssociationDraft(matchedPairIds, true)
        .catch((error: unknown) =>
          setMessage(
            error instanceof Error
              ? error.message
              : "L'erreur n'a pas pu être conservée.",
          ),
        )
        .finally(() => {
          checkpointInFlight.current = false;
          setIsSaving(false);
        });
      setMessage(current.exercise.feedback.incorrectFr);
      return;
    }
    const nextPairIds = [...matchedPairIds, labelPairId];
    checkpointInFlight.current = true;
    setIsSaving(true);
    void saveAssociationDraft(nextPairIds)
      .catch((error: unknown) =>
        setMessage(
          error instanceof Error
            ? error.message
            : "La paire n'a pas pu être conservée.",
        ),
      )
      .finally(() => {
        checkpointInFlight.current = false;
        setIsSaving(false);
      });
  }

  function changeWordOrder(tokenId: string, add: boolean): void {
    if (checkpointInFlight.current || isSaving) return;
    const next = add
      ? [...draftTokenIds, tokenId]
      : draftTokenIds.filter((candidate) => candidate !== tokenId);
    checkpointInFlight.current = true;
    setIsSaving(true);
    void saveWordOrderDraft(next)
      .catch((error: unknown) =>
        setMessage(
          error instanceof Error
            ? error.message
            : "La réponse n'a pas pu être conservée.",
        ),
      )
      .finally(() => {
        checkpointInFlight.current = false;
        setIsSaving(false);
      });
  }

  function selectReading(optionId: string): void {
    if (
      current?.exercise.type !== "reading" ||
      checkpointInFlight.current ||
      isSaving
    )
      return;
    checkpointInFlight.current = true;
    setIsSaving(true);
    void ensureQuestion(current.exercise.id)
      .then(() =>
        experienceStore.selectLessonOption(optionId, new Date().toISOString()),
      )
      .then((next) => {
        setExperienceSnapshot(next);
        setSelectedOptionId(optionId);
        setMessage("");
      })
      .catch((error: unknown) =>
        setMessage(
          error instanceof Error
            ? error.message
            : "La réponse n'a pas pu être conservée.",
        ),
      )
      .finally(() => {
        checkpointInFlight.current = false;
        setIsSaving(false);
      });
  }

  async function submitAnswer(): Promise<void> {
    if (current === undefined || storageStatus !== "ready") return;
    if (
      current.exercise.type === "association" &&
      matchedPairIds.length !== current.exercise.pairs.length
    ) {
      setMessage("Associez toutes les cartes avant de valider.");
      return;
    }
    if (current.exercise.type === "word_order" && draftTokenIds.length === 0) {
      setMessage("Choisissez les jetons avant de valider.");
      return;
    }
    if (current.exercise.type === "recall" && recallValue.trim().length === 0) {
      setMessage("Saisissez votre réponse avant de valider.");
      return;
    }
    if (current.exercise.type === "reading" && selectedOptionId === null) {
      setMessage("Choisissez une réponse avant de valider.");
      return;
    }
    if (current.exercise.type === "recall") {
      await recallDraftWrite.current;
    }
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
      if (snapshot.lesson?.phase !== "submitting")
        throw new Error("La tentative n'a pas été réservée.");
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
    const event = getMechanicsEvent(
      durableOutbox,
      config,
      exactSubmission.eventId,
    );
    if (event === undefined)
      throw new Error("La tentative n'a pas pu être évaluée localement.");
    const recorded = await experienceStore.recordExpeditionResult({
      exerciseId: current.exercise.id,
      rating: event.rating,
      answeredAt: exactSubmission.answeredAt,
    });
    const projection = getProjectionForMechanicsExercise(
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
    setSelectedPairId(null);
    setMatchedPairIds([]);
    setDraftTokenIds([]);
    setRecallValue("");
    setStage("celebration");
    safeCapture(analytics, {
      name: "exercise_answered",
      lessonVersionId: config.lesson.versionId,
      exerciseType: current.exercise.type,
      correct: event.rating === 1,
      durationBucket: durationBucket(
        durationMsForSubmission(exactSubmission, startedAt),
      ),
      platform: Platform.OS === "ios" ? "ios" : "android",
    });
    AccessibilityInfo.announceForAccessibility(
      event.rating === 1
        ? current.exercise.feedback.correctFr
        : current.exercise.feedback.incorrectFr,
    );
  }

  function durationMsForSubmission(
    submission: ValidatedAttemptSubmission,
    fallbackStartedAt: number,
  ): number {
    return submission.durationMs || Math.max(0, Date.now() - fallbackStartedAt);
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
  const currentItemText = current?.item.thaiRaw ?? "";

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
            message={message}
            onRetry={retryStorage}
            onStart={handleStart}
            storageStatus={storageStatus}
          />
        )}
        {stage === "question" && current?.exercise.type === "word_order" && (
          <WordOrderQuestion
            current={current.exercise}
            draftTokenIds={draftTokenIds}
            isSaving={isSaving}
            message={message}
            onAddToken={(tokenId) => changeWordOrder(tokenId, true)}
            onRemoveToken={(tokenId) => changeWordOrder(tokenId, false)}
            onSubmit={handleSubmit}
          />
        )}
        {stage === "question" && current?.exercise.type === "association" && (
          <AssociationQuestion
            current={current.exercise}
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
        {stage === "question" && current?.exercise.type === "recall" && (
          <RecallQuestion
            current={current.exercise}
            isSaving={isSaving}
            message={message}
            onChange={changeRecall}
            onSubmit={handleSubmit}
            value={recallValue}
          />
        )}
        {stage === "question" && current?.exercise.type === "reading" && (
          <ReadingQuestion
            current={current.exercise}
            itemThai={current.item.thaiRaw}
            isSaving={isSaving}
            message={message}
            onSelect={selectReading}
            onSubmit={handleSubmit}
            selectedOptionId={selectedOptionId}
          />
        )}
        {stage === "celebration" && celebration !== null && (
          <CelebrationStage
            current={
              config.exercises.find(
                ({ exercise }) => exercise.id === celebration.exerciseId,
              ) ?? config.exercises[0]!
            }
            celebration={celebration}
            itemText={
              config.exercises.find(
                ({ exercise }) => exercise.id === celebration.exerciseId,
              )?.item.thaiRaw ?? currentItemText
            }
            onContinue={handleContinue}
          />
        )}
        {stage === "recap" && complete && (
          <RecapStage config={config} onFinish={handleFinish} outbox={outbox} />
        )}
        {stage !== "intro" && storageStatus === "error" && (
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

export default function MechanicsExpeditionRoute() {
  const { analytics } = useMobileAnalytics();
  const params = useLocalSearchParams<{ lessonId?: string }>();
  const rawLessonId = params.lessonId;
  const lessonId = Array.isArray(rawLessonId) ? rawLessonId[0] : rawLessonId;
  const config =
    lessonId === undefined
      ? undefined
      : getMobileUnit01MechanicsExpeditionConfig(lessonId);
  if (lessonId === undefined || config === undefined) {
    return <UnavailableMechanicsExpedition lessonId={lessonId ?? "inconnue"} />;
  }
  return (
    <MechanicsExpeditionExperience
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
    fontSize: 23,
    lineHeight: 31,
    fontWeight: "800",
  },
  body: { marginTop: 18, color: "#5e6980", fontSize: 17, lineHeight: 27 },
  helper: { marginTop: 14, color: "#687287", fontSize: 15, lineHeight: 23 },
  answerTray: {
    minHeight: 112,
    marginTop: 22,
    padding: 12,
    gap: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    borderRadius: 18,
    backgroundColor: "#e8f4ef",
  },
  emptyTray: { padding: 10, color: "#687287", fontSize: 14 },
  selectedToken: {
    minHeight: 52,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 14,
    backgroundColor: "white",
  },
  selectedTokenIndex: { color: "#43a283", fontSize: 12, fontWeight: "900" },
  tokenBank: { marginTop: 18, gap: 10, flexDirection: "row", flexWrap: "wrap" },
  token: {
    minHeight: 64,
    minWidth: 92,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d5dbe3",
    borderRadius: 16,
    backgroundColor: "white",
  },
  tokenUsed: { opacity: 0.35 },
  tokenThai: { color: "#283450", fontFamily: THAI_FONT_REGULAR, fontSize: 23 },
  tokenTranscription: { marginTop: 2, color: "#687287", fontSize: 11 },
  associationColumns: {
    marginTop: 22,
    gap: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  associationColumn: { flex: 1, gap: 10 },
  associationTile: {
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d5dbe3",
    borderRadius: 16,
    backgroundColor: "white",
  },
  associationTileSelected: {
    borderWidth: 2,
    borderColor: "#43a283",
    backgroundColor: "#eff9f5",
  },
  associationTileDone: { opacity: 0.45, backgroundColor: "#eef1f4" },
  associationThai: {
    color: "#283450",
    fontFamily: THAI_FONT_REGULAR,
    fontSize: 23,
    textAlign: "center",
  },
  associationLabel: {
    color: "#283450",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
    textAlign: "center",
  },
  recallInput: {
    minHeight: 64,
    marginTop: 26,
    paddingHorizontal: 18,
    color: "#283450",
    fontFamily: THAI_FONT_REGULAR,
    fontSize: 23,
    borderWidth: 2,
    borderColor: "#d5dbe3",
    borderRadius: 18,
    backgroundColor: "white",
  },
  readingStimulus: {
    marginTop: 26,
    color: "#283450",
    fontFamily: THAI_FONT_REGULAR,
    fontSize: 42,
    lineHeight: 60,
    textAlign: "center",
  },
  answers: { marginTop: 24, gap: 12 },
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
  disabled: { opacity: 0.5 },
  error: { marginTop: 16, color: "#a23d38", fontWeight: "600" },
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
  glyph: {
    marginTop: 28,
    color: "#283450",
    fontFamily: THAI_FONT_REGULAR,
    fontSize: 64,
    lineHeight: 90,
    textAlign: "center",
  },
  translation: { color: "#687287", fontSize: 15, textAlign: "center" },
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
  recapThai: { color: "#283450", fontFamily: THAI_FONT_REGULAR, fontSize: 20 },
  recapTranslation: { marginTop: 2, color: "#687287", fontSize: 12 },
  recapScore: { maxWidth: 116, alignItems: "flex-end" },
  recapScoreValue: { color: "#236b58", fontSize: 17, fontWeight: "800" },
  recapDue: {
    marginTop: 3,
    color: "#687287",
    fontSize: 10,
    textAlign: "right",
  },
  storageError: { paddingHorizontal: 24, paddingBottom: 28 },
});
