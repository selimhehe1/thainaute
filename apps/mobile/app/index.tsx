import { fixtureLesson } from "@thainaute/content/fixture";
import {
  ingestAttemptBatch,
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
import { MobileLocalExperienceStore } from "../lib/mobile-local-experience-store";

const lesson = fixtureLesson;
function requiredFixtureValue<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(`La fixture mobile doit contenir ${label}.`);
  }
  return value;
}
const exercise = requiredFixtureValue(lesson.exercises[0], "un exercice");
const item = requiredFixtureValue(lesson.items[0], "un item");

type ScreenStatus = "loading" | "ready" | "error";

function dueAtFromOutbox(outbox: AttemptOutboxSnapshot): string | null {
  const projection = ingestAttemptBatch({
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
  const requestedRevisionRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const handledRevision = retryRevision;
      setStatus("loading");
      void Promise.all([
        experienceStore.read(),
        outboxStore.migrateLegacyJournal(),
      ])
        .then(async ([experience, currentOutbox]) => {
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
      if (currentLesson === null || currentLesson.phase === "completed") {
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
        setMessage(
          "Cette séance locale appartient à une autre version et n’a pas été modifiée.",
        );
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
  const actionLabel =
    lessonPhase === "question"
      ? "Reprendre l’exercice"
      : lessonPhase === "result"
        ? "Voir mon résultat"
        : lessonPhase === "submitting"
          ? "Finaliser ma tentative"
          : lessonPhase === "intro"
            ? "Commencer la séance"
            : lessonPhase === "completed"
              ? "Revoir la démo locale"
              : "Commencer la démo locale";
  const pendingAttempts = outbox.entries.filter(
    ({ status: entryStatus }) => entryStatus === "pending",
  ).length;
  const dueAt = dueAtFromOutbox(outbox);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.brand}>Thaïnaute</Text>
        <Link href="/account" asChild>
          <Pressable accessibilityRole="button" style={styles.accountButton}>
            <Text style={styles.accountText}>Compte</Text>
          </Pressable>
        </Link>
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
            Cette fixture et son signal audio sont déjà sur cet appareil. Aucun
            réseau n’est nécessaire pour cette démonstration.
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
        </View>

        {message !== "" && (
          <Text accessibilityRole="alert" style={styles.error}>
            {message}
          </Text>
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
    padding: 28,
    gap: 16,
  },
  loadingText: { color: "#283450", fontSize: 16, fontWeight: "700" },
  header: {
    minHeight: 68,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#cbd0d8",
  },
  brand: { color: "#283450", fontSize: 18, fontWeight: "800" },
  accountButton: {
    minWidth: 72,
    minHeight: 44,
    marginLeft: "auto",
    alignItems: "center",
    justifyContent: "center",
  },
  accountText: { color: "#283450", fontWeight: "700" },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 56,
  },
  eyebrow: {
    color: "#236b58",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    marginTop: 12,
    color: "#283450",
    fontSize: 36,
    lineHeight: 43,
    fontWeight: "800",
  },
  body: { marginTop: 12, color: "#5e6980", fontSize: 16, lineHeight: 24 },
  offlineCard: {
    marginTop: 24,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#eff9f5",
  },
  offlineTitle: { color: "#325f54", fontSize: 16, fontWeight: "800" },
  offlineBody: {
    marginTop: 6,
    color: "#496b62",
    fontSize: 14,
    lineHeight: 21,
  },
  lessonCard: {
    marginTop: 20,
    padding: 22,
    borderRadius: 24,
    backgroundColor: "white",
  },
  fixtureLabel: {
    color: "#9b514d",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  lessonTitle: {
    marginTop: 10,
    color: "#283450",
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
  },
  localStatus: {
    marginTop: 14,
    color: "#697389",
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 52,
    marginTop: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#283450",
  },
  primaryText: { color: "white", fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  error: { marginTop: 18, color: "#9b3732", fontSize: 14, lineHeight: 21 },
});
