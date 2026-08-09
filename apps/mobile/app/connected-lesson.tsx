import type { PublicAudioAsset, PublicLesson } from "@thainaute/content/public";
import type {
  AttemptOutboxEntry,
  LessonExerciseProgress,
} from "@thainaute/sync";
import { useAudioPlayer } from "expo-audio";
import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MobileContentReportPanel } from "../components/content-report-panel";
import { useMobileAuthSession } from "../lib/auth-session";
import { useMobileAnalytics } from "../lib/analytics-provider";
import { ensureExpoPublicAudioCached } from "../lib/expo-public-audio-cache";
import {
  enqueueConnectedMobileAttempt,
  readLatestConnectedMobileAttempt,
  synchronizeConnectedMobileAttempt,
} from "../lib/mobile-connected-learning";
import {
  loadCurrentMobileConnectedPublicLesson,
  type MobileConnectedPublicLesson,
} from "../lib/mobile-connected-public-lesson";
import { readMobileLessonProgress } from "../lib/mobile-lesson-progress";

type Phase =
  | "loading"
  | "ready"
  | "submitting"
  | "pending"
  | "result"
  | "rejected"
  | "error";

type PublicAudioChoiceExercise = Extract<
  PublicLesson["exercises"][number],
  { type: "audio_choice" }
>;

function isAudioChoiceExercise(
  exercise: PublicLesson["exercises"][number] | undefined,
): exercise is PublicAudioChoiceExercise {
  return exercise?.type === "audio_choice";
}

function matchingAudio(
  connected: MobileConnectedPublicLesson,
): PublicAudioAsset | null {
  const exercise = connected.lesson.response.lesson.exercises[0];
  if (!isAudioChoiceExercise(exercise)) return null;
  return (
    connected.lesson.response.lesson.audioAssets.find(
      ({ assetId }) => assetId === exercise.audioAssetId,
    ) ?? null
  );
}

function dueAtLabel(value: string | null): string {
  if (value === null) return "Après la première correction";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ConnectedLessonScreen() {
  const database = useSQLiteContext();
  const auth = useMobileAuthSession();
  const { analytics } = useMobileAnalytics();
  const player = useAudioPlayer();
  const userId =
    auth.status === "signed_in" ? (auth.session?.user.id ?? null) : null;
  const subjectKey = `${auth.sessionBoundaryRevision}:${userId ?? "signed-out"}`;
  const subjectKeyRef = useRef("");

  const [connected, setConnected] =
    useState<MobileConnectedPublicLesson | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<AttemptOutboxEntry | null>(null);
  const [progress, setProgress] = useState<LessonExerciseProgress | null>(null);
  const [message, setMessage] = useState("");
  const [audioMessage, setAudioMessage] = useState("");
  const [audioBusy, setAudioBusy] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const startedAt = useRef(0);
  const audioController = useRef<AbortController | null>(null);
  const audioOperationRevision = useRef(0);
  const syncInFlight = useRef(new Set<string>());

  useLayoutEffect(() => {
    subjectKeyRef.current = subjectKey;
  }, [subjectKey]);

  const loadProgress = useCallback(
    async (expectedUserId: string, lesson: MobileConnectedPublicLesson) => {
      try {
        const response = await readMobileLessonProgress({
          userId: expectedUserId,
          versionId: lesson.lesson.response.lesson.versionId,
        });
        const exerciseId = lesson.lesson.response.lesson.exercises[0]?.id;
        return (
          response.exercises.find(
            (exercise) => exercise.exerciseId === exerciseId,
          ) ?? null
        );
      } catch {
        return null;
      }
    },
    [],
  );

  const applyEntry = useCallback(
    async (
      entry: AttemptOutboxEntry,
      lesson: MobileConnectedPublicLesson,
      expectedUserId: string,
      expectedSubjectKey: string,
    ) => {
      if (subjectKeyRef.current !== expectedSubjectKey) return;
      setAttempt(entry);
      setSelectedOptionId(entry.submission.selectedOptionId ?? null);
      if (entry.status === "pending") {
        setPhase("pending");
        setMessage(
          "Réponse enregistrée sur cet appareil. La correction arrivera après reconnexion.",
        );
        return;
      }
      if (entry.status === "rejected") {
        setPhase("rejected");
        setMessage(
          "Le serveur a refusé cette tentative. Elle reste conservée et ne produit aucune maîtrise.",
        );
        return;
      }
      setPhase("result");
      setMessage(
        entry.feedbackFr ??
          "Correction serveur enregistrée sans détail explicatif dans cet ancien snapshot.",
      );
      const nextProgress = await loadProgress(expectedUserId, lesson);
      if (subjectKeyRef.current !== expectedSubjectKey) return;
      setProgress(nextProgress);
      void AccessibilityInfo.announceForAccessibility(
        `Correction autoritaire. ${entry.feedbackFr ?? "Résultat synchronisé."}`,
      );
    },
    [loadProgress],
  );

  const synchronize = useCallback(
    async (
      entry: AttemptOutboxEntry,
      lesson: MobileConnectedPublicLesson,
      expectedUserId: string,
      expectedSubjectKey: string,
    ) => {
      if (entry.status !== "pending") return;
      const synchronizationKey = `${expectedSubjectKey}:${entry.submission.eventId}`;
      if (subjectKeyRef.current === expectedSubjectKey) {
        setPhase("pending");
        setMessage("Réponse enregistrée. Correction par le serveur en cours…");
      }
      if (syncInFlight.current.has(synchronizationKey)) return;
      syncInFlight.current.add(synchronizationKey);
      try {
        const result = await synchronizeConnectedMobileAttempt({
          database,
          userId: expectedUserId,
          eventId: entry.submission.eventId,
        });
        await applyEntry(result, lesson, expectedUserId, expectedSubjectKey);
      } catch {
        if (subjectKeyRef.current !== expectedSubjectKey) return;
        setPhase("pending");
        setMessage(
          "Réponse enregistrée sur cet appareil. La correction sera reprise avec ce même événement.",
        );
      } finally {
        syncInFlight.current.delete(synchronizationKey);
      }
    },
    [applyEntry, database],
  );

  useEffect(() => {
    let active = true;
    const expectedSubjectKey = subjectKey;
    audioController.current?.abort();
    audioController.current = null;
    audioOperationRevision.current += 1;
    player.pause();
    player.replace(null);
    const reset = new Promise<void>((resolve) => {
      setTimeout(() => {
        if (active) {
          setConnected(null);
          setPhase("loading");
          setSelectedOptionId(null);
          setAttempt(null);
          setProgress(null);
          setMessage("");
          setAudioMessage("");
          setAudioBusy(false);
          setAudioReady(false);
        }
        resolve();
      }, 0);
    });

    void (async () => {
      await reset;
      if (!active) return;
      try {
        const lesson = await loadCurrentMobileConnectedPublicLesson({
          database,
        });
        if (!active || subjectKeyRef.current !== expectedSubjectKey) return;
        setConnected(lesson);
        startedAt.current = Date.now();
        const exercise = lesson.lesson.response.lesson.exercises[0];
        if (exercise === undefined) throw new Error("empty");
        if (userId === null) {
          setPhase("ready");
          return;
        }
        const persisted = await readLatestConnectedMobileAttempt({
          database,
          userId,
          contentVersionId: lesson.lesson.response.lesson.versionId,
          exerciseId: exercise.id,
        });
        if (!active || subjectKeyRef.current !== expectedSubjectKey) return;
        if (persisted === null) {
          setPhase("ready");
          const initialProgress = await loadProgress(userId, lesson);
          if (!active || subjectKeyRef.current !== expectedSubjectKey) return;
          setProgress(initialProgress);
          return;
        }
        await applyEntry(persisted, lesson, userId, expectedSubjectKey);
        if (persisted.status === "pending") {
          await synchronize(persisted, lesson, userId, expectedSubjectKey);
        }
      } catch {
        if (!active || subjectKeyRef.current !== expectedSubjectKey) return;
        setPhase("error");
        setMessage(
          "La preview connectée n'est pas activée ou son contenu vérifié est indisponible.",
        );
      }
    })();

    return () => {
      active = false;
      audioController.current?.abort();
      audioController.current = null;
      audioOperationRevision.current += 1;
      player.pause();
    };
  }, [
    applyEntry,
    database,
    loadProgress,
    player,
    retryToken,
    subjectKey,
    synchronize,
    userId,
  ]);

  const prepareAudio = useCallback(async () => {
    if (connected === null || audioBusy || audioController.current !== null) {
      return;
    }
    const asset = matchingAudio(connected);
    if (asset === null) {
      setAudioMessage("Le signal annoncé est introuvable.");
      return;
    }
    setAudioBusy(true);
    setAudioMessage("");
    const expectedSubjectKey = subjectKeyRef.current;
    const expectedVersionId = connected.lesson.response.lesson.versionId;
    const controller = new AbortController();
    const audioRevision = ++audioOperationRevision.current;
    audioController.current = controller;
    try {
      const cached = await ensureExpoPublicAudioCached({
        asset,
        signal: controller.signal,
        url: connected.audioUrl(asset.assetId),
      });
      if (
        controller.signal.aborted ||
        audioRevision !== audioOperationRevision.current ||
        subjectKeyRef.current !== expectedSubjectKey ||
        connected.lesson.response.lesson.versionId !== expectedVersionId
      ) {
        return;
      }
      player.replace({ uri: cached.uri });
      player.play();
      setAudioReady(true);
      setAudioMessage("Signal vérifié et lu depuis le cache privé de l’app.");
    } catch {
      if (
        controller.signal.aborted ||
        audioRevision !== audioOperationRevision.current ||
        subjectKeyRef.current !== expectedSubjectKey
      ) {
        return;
      }
      setAudioReady(false);
      setAudioMessage(
        "Le signal n'a pas pu être vérifié. L'exercice reste bloqué par prudence.",
      );
    } finally {
      if (audioController.current === controller) {
        audioController.current = null;
      }
      if (
        audioRevision === audioOperationRevision.current &&
        subjectKeyRef.current === expectedSubjectKey
      ) {
        setAudioBusy(false);
      }
    }
  }, [audioBusy, connected, player]);

  const submit = useCallback(async () => {
    const exercise = connected?.lesson.response.lesson.exercises[0];
    if (
      connected === null ||
      exercise === undefined ||
      userId === null ||
      selectedOptionId === null ||
      phase === "submitting" ||
      phase === "pending"
    ) {
      return;
    }
    const expectedSubjectKey = subjectKeyRef.current;
    setPhase("submitting");
    setMessage("Enregistrement durable de la réponse…");
    try {
      const durable = await enqueueConnectedMobileAttempt({
        database,
        userId,
        contentVersionId: connected.lesson.response.lesson.versionId,
        exerciseId: exercise.id,
        selectedOptionId,
        durationMs: Date.now() - startedAt.current,
      });
      if (subjectKeyRef.current !== expectedSubjectKey) return;
      setAttempt(durable);
      await synchronize(durable, connected, userId, expectedSubjectKey);
    } catch {
      if (subjectKeyRef.current !== expectedSubjectKey) return;
      setPhase("error");
      setMessage(
        "La réponse n'a pas pu être conservée. Rien n'a été envoyé ni effacé.",
      );
    }
  }, [connected, database, phase, selectedOptionId, synchronize, userId]);

  if (phase === "loading" || auth.status === "loading") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center} accessibilityLiveRegion="polite">
          <Text accessibilityRole="header" style={styles.title}>
            Chargement de la boucle connectée…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (connected === null) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center} accessibilityLiveRegion="assertive">
          <Text style={styles.eyebrow}>PREVIEW FERMÉE PAR DÉFAUT</Text>
          <Text accessibilityRole="header" style={styles.title}>
            Boucle connectée indisponible
          </Text>
          <Text style={styles.body}>{message}</Text>
          <Pressable
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={() => setRetryToken((current) => current + 1)}
          >
            <Text style={styles.primaryButtonText}>Réessayer</Text>
          </Pressable>
          <Link href="/" style={styles.linkButton}>
            Retour à l’accueil
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  const lesson = connected.lesson.response.lesson;
  const exercise = lesson.exercises[0];
  if (exercise === undefined) return null;
  if (!isAudioChoiceExercise(exercise)) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center} accessibilityLiveRegion="polite">
          <Text style={styles.eyebrow}>CONTENU TYPÉ</Text>
          <Text accessibilityRole="header" style={styles.title}>
            Cette leçon attend son lecteur dédié.
          </Text>
          <Text style={styles.body}>
            La boucle connectée conserve encore uniquement les exercices audio à
            choix. Les exercices typés sont disponibles dans le parcours local
            adapté à leur mécanique.
          </Text>
          <Link href="/lesson" style={styles.linkButton}>
            Ouvrir le parcours local
          </Link>
        </View>
      </SafeAreaView>
    );
  }
  const optionDisabled =
    !audioReady || phase === "submitting" || phase === "pending";
  const result = attempt?.status === "synced" ? attempt : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Link href="/account" style={styles.backLink}>
            ‹ Compte
          </Link>
          <Text style={styles.headerMeta}>PREVIEW CONNECTÉE</Text>
        </View>
        <View style={styles.banner} accessibilityRole="summary">
          <Text style={styles.bannerText}>
            Fixture technique · aucune valeur pédagogique · non publiable
          </Text>
        </View>
        <Text style={styles.eyebrow}>
          RELEASE {lesson.releaseVersion} · CONTENU GRATUIT
        </Text>
        <Text accessibilityRole="header" style={styles.title}>
          {lesson.titleFr}
        </Text>
        <Text style={styles.body}>{lesson.objectiveFr}</Text>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            1. Vérifier le signal
          </Text>
          <Text style={styles.body}>
            Taille et SHA-256 sont contrôlés avant la lecture locale.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: audioBusy, disabled: audioBusy }}
            disabled={audioBusy}
            style={[styles.secondaryButton, audioBusy && styles.disabled]}
            onPress={() => void prepareAudio()}
          >
            <Text style={styles.secondaryButtonText}>
              {audioBusy
                ? "Vérification…"
                : audioReady
                  ? "Réécouter le signal"
                  : "Télécharger et écouter"}
            </Text>
          </Pressable>
          {audioMessage !== "" && (
            <Text style={styles.statusText} accessibilityLiveRegion="polite">
              {audioMessage}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            2. {exercise.promptFr}
          </Text>
          <View accessibilityRole="radiogroup" style={styles.options}>
            {exercise.options.map((option) => (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityState={{
                  checked: selectedOptionId === option.id,
                  disabled: optionDisabled,
                }}
                disabled={optionDisabled}
                style={[
                  styles.option,
                  selectedOptionId === option.id && styles.optionSelected,
                  optionDisabled && styles.disabled,
                ]}
                onPress={() => setSelectedOptionId(option.id)}
              >
                <Text style={styles.optionText}>{option.labelFr}</Text>
              </Pressable>
            ))}
          </View>

          {userId === null ? (
            <View style={styles.accountGate}>
              <Text style={styles.body}>
                La correction serveur exige un compte permanent. La démo sans
                compte reste disponible.
              </Text>
              <Link href="/account" style={styles.primaryLink}>
                Me connecter
              </Link>
              <Link href="/lesson" style={styles.linkButton}>
                Ouvrir la démo locale
              </Link>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                busy: phase === "submitting",
                disabled:
                  !audioReady ||
                  selectedOptionId === null ||
                  phase === "submitting" ||
                  phase === "pending",
              }}
              disabled={
                !audioReady ||
                selectedOptionId === null ||
                phase === "submitting" ||
                phase === "pending"
              }
              style={[
                styles.primaryButton,
                (!audioReady ||
                  selectedOptionId === null ||
                  phase === "submitting" ||
                  phase === "pending") &&
                  styles.disabled,
              ]}
              onPress={() => void submit()}
            >
              <Text style={styles.primaryButtonText}>
                {phase === "submitting"
                  ? "Conservation…"
                  : phase === "pending"
                    ? "Correction en attente"
                    : "Valider ma réponse"}
              </Text>
            </Pressable>
          )}
        </View>

        {message !== "" && (
          <View
            style={[
              styles.status,
              phase === "result" && styles.statusSuccess,
              (phase === "error" || phase === "rejected") && styles.statusError,
            ]}
            accessibilityLiveRegion={
              phase === "result" ? "polite" : "assertive"
            }
          >
            {phase === "result" && (
              <>
                <Text style={styles.eyebrow}>
                  {result?.rating === 1 ? "RÉPONSE VALIDÉE" : "À RETRAVAILLER"}
                </Text>
                <Text accessibilityRole="header" style={styles.sectionTitle}>
                  Correction autoritaire
                </Text>
              </>
            )}
            <Text style={styles.body}>{message}</Text>
            {phase === "pending" &&
              attempt?.status === "pending" &&
              userId !== null && (
                <Pressable
                  accessibilityRole="button"
                  style={styles.secondaryButton}
                  onPress={() =>
                    void synchronize(
                      attempt,
                      connected,
                      userId,
                      subjectKeyRef.current,
                    )
                  }
                >
                  <Text style={styles.secondaryButtonText}>
                    Reprendre la correction
                  </Text>
                </Pressable>
              )}
          </View>
        )}

        {progress !== null && (
          <View style={styles.section}>
            <Text style={styles.eyebrow}>PROJECTION SERVEUR PROVISOIRE</Text>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Maîtrise et prochaine révision
            </Text>
            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>MAÎTRISE TECHNIQUE</Text>
                <Text style={styles.metricValue}>
                  {Math.round(progress.masteryPermille / 10)} %
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>TENTATIVES</Text>
                <Text style={styles.metricValue}>{progress.attemptCount}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>ÉTAT</Text>
                <Text style={styles.metricValue}>{progress.status}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>PROCHAINE RÉVISION</Text>
                <Text style={styles.metricValue}>
                  {dueAtLabel(progress.dueAt)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <MobileContentReportPanel
          analytics={analytics}
          contentVersionId={lesson.versionId}
          exerciseId={exercise.id}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fbfaf7" },
  container: { padding: 22, paddingBottom: 80 },
  center: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    padding: 28,
  },
  header: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backLink: { paddingVertical: 12, color: "#283450", fontWeight: "800" },
  headerMeta: { color: "#687286", fontSize: 11, fontWeight: "800" },
  banner: {
    marginTop: 18,
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#fff6dc",
  },
  bannerText: { color: "#684c0d", fontWeight: "800", lineHeight: 20 },
  eyebrow: {
    marginTop: 24,
    color: "#8b5d16",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  title: {
    marginTop: 10,
    color: "#283450",
    fontSize: 39,
    fontWeight: "900",
    lineHeight: 43,
  },
  body: { marginTop: 12, color: "#536078", fontSize: 16, lineHeight: 24 },
  section: {
    marginTop: 32,
    paddingTop: 28,
    borderTopColor: "#dde1e7",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    color: "#283450",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 31,
  },
  options: { marginTop: 20, gap: 12 },
  option: {
    minHeight: 56,
    justifyContent: "center",
    paddingHorizontal: 17,
    borderWidth: 1,
    borderColor: "#dde1e7",
    borderRadius: 16,
    backgroundColor: "white",
  },
  optionSelected: { borderColor: "#283450", backgroundColor: "#f1f3f6" },
  optionText: { color: "#283450", fontSize: 17, fontWeight: "700" },
  primaryButton: {
    minHeight: 54,
    marginTop: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#283450",
  },
  primaryButtonText: { color: "white", fontSize: 16, fontWeight: "900" },
  secondaryButton: {
    minHeight: 52,
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#cdd3dc",
    borderRadius: 999,
  },
  secondaryButtonText: { color: "#283450", fontSize: 16, fontWeight: "800" },
  linkButton: {
    minHeight: 48,
    marginTop: 14,
    paddingVertical: 14,
    color: "#283450",
    textAlign: "center",
    fontWeight: "800",
  },
  primaryLink: {
    minHeight: 52,
    marginTop: 18,
    paddingVertical: 16,
    borderRadius: 999,
    overflow: "hidden",
    color: "white",
    backgroundColor: "#283450",
    textAlign: "center",
    fontWeight: "900",
  },
  disabled: { opacity: 0.5 },
  accountGate: { marginTop: 18 },
  statusText: { marginTop: 13, color: "#536078", lineHeight: 21 },
  status: {
    marginTop: 28,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#f1f3f6",
  },
  statusSuccess: { backgroundColor: "#e8f4ef" },
  statusError: { backgroundColor: "#fff0ef" },
  metrics: { marginTop: 18, gap: 10 },
  metric: { padding: 16, borderRadius: 14, backgroundColor: "#f1f3f6" },
  metricLabel: { color: "#687286", fontSize: 11, fontWeight: "900" },
  metricValue: {
    marginTop: 6,
    color: "#283450",
    fontSize: 18,
    fontWeight: "900",
  },
});
