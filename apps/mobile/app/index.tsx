import { fixtureLesson } from "@thainaute/content/fixture";
import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import {
  attemptSubmissionSchema,
  createAttemptOutboxSnapshot,
  ingestAttemptBatch,
  MAX_ATTEMPT_DURATION_MS,
  type AttemptOutboxSnapshot,
} from "@thainaute/sync";
import { useAudioPlayer } from "expo-audio";
import { randomUUID } from "expo-crypto";
import { StatusBar } from "expo-status-bar";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  findNodeHandle,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  MobileAttemptOutboxStorageError,
  MobileAttemptOutboxStore,
} from "../lib/attempt-outbox-store";

const lesson = fixtureLesson;

function requiredFixtureValue<T>(value: T | undefined, label: string): T {
  if (value === undefined)
    throw new Error(`Fixture invalide : ${label} absent.`);
  return value;
}

const exercise = requiredFixtureValue(lesson.exercises[0], "exercice");
const item = requiredFixtureValue(lesson.items[0], "item");

type Stage = "intro" | "question" | "result";

export default function DemoScreen() {
  const database = useSQLiteContext();
  const outboxStore = useMemo(
    () => new MobileAttemptOutboxStore(database),
    [database],
  );
  const player = useAudioPlayer(require("../assets/audio/fixture-tone.wav"));
  const [stage, setStage] = useState<Stage>("intro");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [outbox, setOutbox] = useState<AttemptOutboxSnapshot>(() =>
    createAttemptOutboxSnapshot(),
  );
  const [storageStatus, setStorageStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [storageRetryToken, setStorageRetryToken] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [latestRating, setLatestRating] = useState<0 | 1 | null>(null);
  const submissionInFlight = useRef(false);
  const resultHeading = useRef<Text>(null);

  useEffect(() => {
    let active = true;

    void outboxStore
      .migrateLegacyJournal()
      .then((snapshot) => {
        if (!active) return;
        setOutbox(snapshot);
        setStorageStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setStorageStatus("error");
      });

    return () => {
      active = false;
    };
  }, [outboxStore, storageRetryToken]);

  const localIngestion = useMemo(
    () =>
      ingestAttemptBatch({
        existingEvents: [],
        submissions: outbox.entries
          .filter(({ status }) => status !== "rejected")
          .map(({ submission }) => submission),
        answerKeys: [
          {
            exerciseId: exercise.id,
            itemId: item.id,
            correctOptionId: exercise.correctOptionId,
            skill: "listening",
            contentVersionId: lesson.versionId,
          },
        ],
        authenticatedUserId: null,
      }),
    [outbox],
  );
  const projection = localIngestion.projections.find(
    ({ state }) => state.itemId === item.id,
  )?.state;

  function playSignal() {
    setMessage("");
    void player
      .seekTo(0)
      .then(() => player.play())
      .catch(() =>
        setMessage("Le signal audio est indisponible. Vous pouvez continuer."),
      );
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

    let deviceId: string;
    try {
      deviceId = await outboxStore.getOrCreateDeviceId(randomUUID);
    } catch (error) {
      setMessage(
        error instanceof MobileAttemptOutboxStorageError
          ? error.message
          : "Le journal local est indisponible.",
      );
      return;
    }

    const submission = attemptSubmissionSchema.parse({
      eventId: randomUUID(),
      deviceId,
      exerciseId: exercise.id,
      selectedOptionId,
      answeredAt: new Date().toISOString(),
      durationMs: Math.min(
        MAX_ATTEMPT_DURATION_MS,
        Math.max(0, Date.now() - startedAt),
      ),
      contentVersionId: lesson.versionId,
      algorithmVersion: SRS_ALGORITHM_VERSION,
    });
    const result = ingestAttemptBatch({
      existingEvents: localIngestion.events,
      submissions: [submission],
      answerKeys: [
        {
          exerciseId: exercise.id,
          itemId: item.id,
          correctOptionId: exercise.correctOptionId,
          skill: "listening",
          contentVersionId: lesson.versionId,
        },
      ],
      authenticatedUserId: null,
    });

    const acceptedId = result.acceptedEventIds[0];
    const accepted = result.events.find(
      ({ eventId }) => eventId === acceptedId,
    );
    if (accepted === undefined) {
      setMessage("La tentative locale n’a pas pu être évaluée.");
      return;
    }

    try {
      setOutbox(await outboxStore.enqueue(submission));
    } catch (error) {
      setMessage(
        error instanceof MobileAttemptOutboxStorageError
          ? error.message
          : "La tentative n’a pas pu être conservée hors ligne.",
      );
      return;
    }
    setLatestRating(accepted.rating);
    setStage("result");
    AccessibilityInfo.announceForAccessibility(
      accepted.rating === 1
        ? exercise.feedback.correctFr
        : exercise.feedback.incorrectFr,
    );
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

  useEffect(() => {
    if (stage !== "result") return;
    const node = findNodeHandle(resultHeading.current);
    if (node !== null) AccessibilityInfo.setAccessibilityFocus(node);
  }, [stage]);

  const pendingAttempts = outbox.entries.filter(
    ({ status }) => status === "pending",
  ).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={styles.logo}
        >
          <Text style={styles.logoThai}>ท</Text>
        </View>
        <Text style={styles.brand}>Thaïnaute</Text>
        <Text style={styles.step}>1 exercice</Text>
      </View>
      <View style={styles.fixtureBanner} accessibilityRole="summary">
        <Text style={styles.fixtureTitle}>Donnée fictive — non publiable</Text>
        <Text style={styles.fixtureText}>Chaîne technique uniquement</Text>
        <Text style={styles.fixtureText} accessibilityLiveRegion="polite">
          {storageStatus === "loading"
            ? "Préparation du journal local…"
            : storageStatus === "error"
              ? "Journal local indisponible"
              : `${pendingAttempts} tentative${pendingAttempts > 1 ? "s" : ""} en attente`}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {stage === "intro" && (
          <View style={styles.screen}>
            <Text style={styles.eyebrow}>TRANCHE VERTICALE LOCALE</Text>
            <Text style={styles.title}>{lesson.titleFr}</Text>
            <Text style={styles.body}>{lesson.objectiveFr}</Text>
            <Text style={styles.glyph} accessibilityLanguage="th-TH">
              {item.thaiRaw}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: storageStatus === "loading" }}
              disabled={storageStatus === "loading"}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
                storageStatus === "loading" && styles.disabled,
              ]}
              onPress={() => {
                if (storageStatus === "error") {
                  setStorageStatus("loading");
                  setStorageRetryToken((current) => current + 1);
                  return;
                }
                setStartedAt(Date.now());
                setStage("question");
              }}
            >
              <Text style={styles.primaryButtonText}>
                {storageStatus === "error"
                  ? "Réessayer le stockage"
                  : "Commencer"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.secondaryButton}
              onPress={playSignal}
            >
              <Text style={styles.secondaryButtonText}>Écouter le signal</Text>
            </Pressable>
          </View>
        )}

        {stage === "question" && (
          <View style={styles.screen}>
            <Text style={styles.eyebrow}>ÉCOUTE · DONNÉE TECHNIQUE</Text>
            <Text style={styles.title}>{exercise.promptFr}</Text>
            <Pressable
              accessibilityLabel="Réécouter le signal"
              accessibilityRole="button"
              style={styles.audioButton}
              onPress={playSignal}
            >
              <Text accessible={false} style={styles.audioButtonText}>
                ▶ Réécouter le signal
              </Text>
            </Pressable>
            <View accessibilityRole="radiogroup" style={styles.answers}>
              {exercise.options.map((option) => {
                const selected = option.id === selectedOptionId;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    key={option.id}
                    style={[styles.answer, selected && styles.answerSelected]}
                    onPress={() => {
                      setSelectedOptionId(option.id);
                      setMessage("");
                    }}
                  >
                    <View
                      style={[styles.radio, selected && styles.radioSelected]}
                    />
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
              onPress={handleSubmitAnswer}
            >
              <Text style={styles.primaryButtonText}>
                {isSaving ? "Enregistrement…" : "Valider"}
              </Text>
            </Pressable>
          </View>
        )}

        {stage === "result" && (
          <View style={styles.screen} accessibilityLiveRegion="polite">
            <Text style={styles.eyebrow}>TENTATIVE CONSERVÉE HORS LIGNE</Text>
            <Text
              ref={resultHeading}
              style={styles.title}
              accessibilityRole="header"
            >
              {latestRating === 1
                ? exercise.feedback.correctFr
                : exercise.feedback.incorrectFr}
            </Text>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>MAÎTRISE ESTIMÉE</Text>
              <Text style={styles.metricValue}>
                {projection?.masteryScore ?? 0} ‰
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>PROCHAINE RÉVISION</Text>
              <Text style={styles.metricDate}>
                {projection?.dueAt === null || projection?.dueAt === undefined
                  ? "À calculer"
                  : new Intl.DateTimeFormat("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(projection.dueAt))}
              </Text>
            </View>
            <Text style={styles.privacy}>
              Progression conservée sur cet appareil. Après création du compte,
              le serveur la recalculera sans faire confiance à la note locale.
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.primaryButton}
              onPress={() => {
                setStage("intro");
                setSelectedOptionId(null);
                setLatestRating(null);
              }}
            >
              <Text style={styles.primaryButtonText}>Terminer</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fbfaf7" },
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
  logoThai: { color: "white", fontSize: 23, lineHeight: 34 },
  brand: { marginLeft: 10, color: "#283450", fontSize: 18, fontWeight: "800" },
  step: { marginLeft: "auto", color: "#6b7486", fontSize: 12 },
  fixtureBanner: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    backgroundColor: "#fff3cf",
  },
  fixtureTitle: { color: "#684c0d", fontSize: 13, fontWeight: "800" },
  fixtureText: { marginTop: 2, color: "#7f6528", fontSize: 12 },
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
    color: "#43a283",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    color: "#283450",
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "800",
    letterSpacing: -1.5,
  },
  body: { marginTop: 18, color: "#5e6980", fontSize: 17, lineHeight: 27 },
  glyph: {
    marginVertical: 36,
    color: "#283450",
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
  metricValue: { color: "#43a283", fontSize: 28, fontWeight: "800" },
  metricDate: { color: "#283450", fontSize: 19, fontWeight: "700" },
  privacy: { marginTop: 20, color: "#697389", fontSize: 13, lineHeight: 20 },
});
