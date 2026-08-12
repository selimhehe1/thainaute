import { colors } from "@thainaute/design-tokens";
import {
  ingestAttemptBatch,
  isOptionAttempt,
  type AttemptOutboxSnapshot,
} from "@thainaute/sync";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MobileAttemptOutboxStore } from "../lib/attempt-outbox-store";
import { fixtureLessonConfig } from "../lib/lesson-config";
import { MobileLocalExperienceStore } from "../lib/mobile-local-experience-store";
import { MobilePrimaryNavigation } from "../lib/mobile-primary-navigation";

const { exercise, item, lesson } = fixtureLessonConfig;

type ScreenStatus = "loading" | "ready" | "error";

function dueAtFromOutbox(outbox: AttemptOutboxSnapshot): string | null {
  const projection = ingestAttemptBatch({
    existingEvents: [],
    submissions: outbox.entries
      .filter(({ status }) => status !== "rejected")
      .map(({ submission }) => submission)
      .filter(isOptionAttempt),
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
  }).projections.find(({ state }) => state.itemId === item.id)?.state;
  return projection?.dueAt ?? null;
}

function formatDueAt(dueAt: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dueAt));
}

function provisionalGoalLabel(optionId: string): string {
  if (optionId === "prototype_goal_short") return "5 minutes";
  if (optionId === "prototype_goal_regular") return "10 minutes";
  return "rythme provisoire";
}

export default function TodayScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const experienceStore = useMemo(
    () => new MobileLocalExperienceStore(database),
    [database],
  );
  const outboxStore = useMemo(
    () => new MobileAttemptOutboxStore(database, undefined, "demo"),
    [database],
  );
  const [status, setStatus] = useState<ScreenStatus>("loading");
  const [retryRevision, setRetryRevision] = useState(0);
  const [snapshot, setSnapshot] = useState<Awaited<
    ReturnType<MobileLocalExperienceStore["read"]>
  > | null>(null);
  const [outbox, setOutbox] = useState<AttemptOutboxSnapshot | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [replacementConfirmation, setReplacementConfirmation] = useState(false);
  const requestedRevisionRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const handledRevision = retryRevision;
      setStatus("loading");
      void Promise.all([
        experienceStore.read(),
        outboxStore.migrateLegacyFixtureAttemptsToDemo(),
      ])
        .then(async ([experience]) => {
          const currentOutbox = await outboxStore.read();
          let recoveredExperience = experience;
          let recoveredOutbox = currentOutbox;
          if (experience.lesson?.phase === "submitting") {
            recoveredOutbox = await outboxStore.enqueue(
              experience.lesson.submission,
            );
            recoveredExperience = await experienceStore.confirmLessonResult(
              recoveredOutbox,
              new Date().toISOString(),
            );
          }
          if (!active || requestedRevisionRef.current !== handledRevision) {
            return;
          }
          setSnapshot(recoveredExperience);
          setOutbox(recoveredOutbox);
          setReplacementConfirmation(false);
          setStatus("ready");
        })
        .catch(() => {
          if (!active || requestedRevisionRef.current !== handledRevision) {
            return;
          }
          setStatus("error");
        });
      return () => {
        active = false;
      };
    }, [experienceStore, outboxStore, retryRevision]),
  );

  useEffect(() => {
    if (status !== "ready" || snapshot === null) return;
    if (snapshot.onboarding.status !== "completed") {
      router.replace("/onboarding");
    }
  }, [router, snapshot, status]);

  async function openLesson(): Promise<void> {
    if (snapshot === null || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const currentLesson = snapshot.lesson;
      if (currentLesson === null) {
        const next = await experienceStore.startLesson({
          lessonVersionId: lesson.versionId,
          exerciseId: exercise.id,
          startedAt: new Date().toISOString(),
        });
        setSnapshot(next);
      } else if (
        currentLesson.lessonVersionId !== lesson.versionId ||
        currentLesson.exerciseId !== exercise.id
      ) {
        setReplacementConfirmation(true);
        return;
      }
      router.push("/lesson");
    } catch {
      setMessage(
        "La séance n’a pas pu être préparée. Vos données existantes sont conservées.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function replaceOldLessonVersion(): Promise<void> {
    const expectedCheckpoint = snapshot?.lesson;
    if (
      expectedCheckpoint === undefined ||
      expectedCheckpoint === null ||
      outbox === null ||
      busy
    ) {
      return;
    }
    if (
      expectedCheckpoint.lessonVersionId === lesson.versionId &&
      expectedCheckpoint.exerciseId === exercise.id
    ) {
      setReplacementConfirmation(false);
      setMessage(
        "La séance locale a changé. Relisez son état avant de continuer.",
      );
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const next = await experienceStore.replaceLessonVersion(
        expectedCheckpoint,
        {
          lessonVersionId: lesson.versionId,
          exerciseId: exercise.id,
          startedAt: new Date().toISOString(),
        },
        outbox,
      );
      setSnapshot(next);
      setReplacementConfirmation(false);
      router.push("/lesson");
    } catch {
      setMessage(
        "L’ancienne session n’a pas été abandonnée. Vos données existantes sont conservées.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (status === "error") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered} accessibilityLiveRegion="assertive">
          <Text style={styles.title}>Parcours local indisponible</Text>
          <Text style={styles.body}>
            Rien n’a été effacé. Réessayez pour relire le stockage de cet
            appareil.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={() => {
              setStatus("loading");
              setMessage("");
              setRetryRevision((revision) => {
                const nextRevision = revision + 1;
                requestedRevisionRef.current = nextRevision;
                return nextRevision;
              });
            }}
          >
            <Text style={styles.primaryText}>Réessayer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (status === "loading" || snapshot === null || outbox === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered} accessibilityLiveRegion="polite">
          <ActivityIndicator color="#283450" size="large" />
          <Text style={styles.loadingText}>Préparation d’Aujourd’hui…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (snapshot.onboarding.status !== "completed") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered} accessibilityLiveRegion="polite">
          <ActivityIndicator color="#283450" />
          <Text style={styles.loadingText}>Ouverture de l’onboarding…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const lessonPhase = snapshot.lesson?.phase ?? null;
  const hasOlderVersion =
    snapshot.lesson !== null &&
    (snapshot.lesson.lessonVersionId !== lesson.versionId ||
      snapshot.lesson.exerciseId !== exercise.id);
  const actionLabel = hasOlderVersion
    ? "Abandonner cette ancienne session"
    : lessonPhase === "question"
      ? "Reprendre l’exercice"
      : lessonPhase === "result"
        ? "Voir mon résultat"
        : lessonPhase === "submitting"
          ? "Finaliser ma tentative"
          : lessonPhase === "intro"
            ? "Commencer la séance"
            : lessonPhase === "completed"
              ? "Revoir l’extrait local"
              : "Commencer l’extrait local";
  const pendingAttempts = outbox.entries.filter(
    ({ status: entryStatus }) => entryStatus === "pending",
  ).length;
  const dueAt = dueAtFromOutbox(outbox);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View testID="today-header" style={styles.header}>
        <Text style={styles.brand}>Thaïnaute</Text>
        <View testID="today-header-actions" style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            style={styles.pathButton}
            onPress={() => router.push("/path")}
          >
            <Text style={styles.headerActionText}>Parcours</Text>
          </Pressable>
          <Link href="/account" asChild>
            <Pressable accessibilityRole="button" style={styles.accountButton}>
              <Text style={styles.headerActionText}>Compte</Text>
            </Pressable>
          </Link>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>AUJOURD’HUI</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Une petite écoute, à votre rythme.
        </Text>
        <Text style={styles.body}>
          Objectif choisi :{" "}
          {provisionalGoalLabel(snapshot.onboarding.goalOptionId)}
        </Text>

        <View style={styles.offlineCard} accessibilityRole="summary">
          <Text style={styles.offlineTitle}>Disponible hors connexion</Text>
          <Text style={styles.offlineBody}>
            La démonstration technique et son signal audio sont déjà sur cet
            appareil. Aucun réseau n’est nécessaire pour vérifier la boucle.
          </Text>
        </View>

        <View style={styles.lessonCard}>
          <Text style={styles.fixtureLabel}>
            DONNÉE FICTIVE · NON PUBLIABLE
          </Text>
          <Text style={styles.lessonTitle}>{lesson.titleFr}</Text>
          <Text style={styles.body}>{lesson.objectiveFr}</Text>
          <Text style={styles.localStatus} accessibilityLiveRegion="polite">
            {pendingAttempts} tentative{pendingAttempts > 1 ? "s" : ""} dans le
            journal technique local
          </Text>
          {dueAt !== null && (
            <Text style={styles.localStatus}>
              Prochaine révision calculée : {formatDueAt(dueAt)}
            </Text>
          )}
          {hasOlderVersion && replacementConfirmation ? (
            <View style={styles.replacementConfirmation}>
              <Text accessibilityRole="alert" style={styles.warningText}>
                Deuxième confirmation : abandonner ce point de reprise et
                démarrer la version actuellement chargée ? Une tentative déjà
                soumise reste dans le journal durable.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ busy, disabled: busy }}
                disabled={busy}
                style={[styles.primaryButton, busy && styles.disabled]}
                onPress={() => void replaceOldLessonVersion()}
              >
                <Text style={styles.primaryText}>
                  {busy ? "Remplacement…" : "Confirmer l’abandon et démarrer"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: busy }}
                disabled={busy}
                style={[styles.secondaryButton, busy && styles.disabled]}
                onPress={() => setReplacementConfirmation(false)}
              >
                <Text style={styles.secondaryText}>
                  Conserver l’ancienne session
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy, disabled: busy }}
              disabled={busy}
              style={[styles.primaryButton, busy && styles.disabled]}
              onPress={() => void openLesson()}
            >
              <Text style={styles.primaryText}>
                {busy ? "Préparation…" : actionLabel}
              </Text>
            </Pressable>
          )}
        </View>

        {message !== "" && (
          <Text accessibilityRole="alert" style={styles.error}>
            {message}
          </Text>
        )}
      </ScrollView>
      <MobilePrimaryNavigation activeRoute="/" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.jasmine },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 16,
  },
  loadingText: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  header: {
    minHeight: 68,
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    rowGap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  brand: {
    flexGrow: 1,
    flexShrink: 1,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  headerActions: {
    maxWidth: "100%",
    marginLeft: "auto",
    flexDirection: "row",
    flexWrap: "wrap",
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  pathButton: {
    minWidth: 88,
    minHeight: 44,
    paddingHorizontal: 10,
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  accountButton: {
    minWidth: 72,
    minHeight: 44,
    paddingHorizontal: 10,
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActionText: {
    flexShrink: 1,
    color: colors.ink,
    fontWeight: "700",
    textAlign: "center",
  },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 56,
  },
  eyebrow: {
    color: colors.jadeInk,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    marginTop: 12,
    color: colors.ink,
    fontSize: 36,
    lineHeight: 43,
    fontWeight: "800",
  },
  body: { marginTop: 12, color: colors.inkSoft, fontSize: 16, lineHeight: 24 },
  offlineCard: {
    marginTop: 24,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.jadePale,
    borderRadius: 18,
    backgroundColor: colors.jadePale,
    shadowColor: colors.ink,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
  offlineTitle: { color: colors.jadeInk, fontSize: 16, fontWeight: "800" },
  offlineBody: {
    marginTop: 6,
    color: colors.jadeInk,
    fontSize: 14,
    lineHeight: 21,
  },
  lessonCard: {
    marginTop: 20,
    padding: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderLeftWidth: 4,
    borderLeftColor: colors.coral,
    borderRadius: 24,
    backgroundColor: "white",
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  fixtureLabel: {
    color: colors.coralDeep,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  lessonTitle: {
    marginTop: 10,
    color: colors.ink,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
  },
  localStatus: {
    marginTop: 14,
    color: colors.inkSoft,
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 52,
    marginTop: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.coral,
  },
  primaryText: { color: "white", fontSize: 16, fontWeight: "800" },
  replacementConfirmation: { marginTop: 18 },
  warningText: { color: "#7b2f2b", fontSize: 15, lineHeight: 22 },
  secondaryButton: {
    minHeight: 48,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#aab2c0",
    borderRadius: 999,
  },
  secondaryText: { color: "#283450", fontWeight: "700" },
  disabled: { opacity: 0.5 },
  error: { marginTop: 18, color: "#9b3732", fontSize: 14, lineHeight: 21 },
});
