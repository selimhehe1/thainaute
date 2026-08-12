// Projection éditoriale conservée hors du graphe Expo public.
import { colors } from "@thainaute/design-tokens";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMobileAuthSession } from "../lib/auth-session";
import { mobileUnit01MixedExpeditionConfigs } from "../lib/mobile-lesson-expedition-config";
import {
  readMobileLocalProgress,
  refreshMobileAccountProgress,
  type MobileProgressSource,
} from "../lib/mobile-account-progress";
import { MobileLocalExperienceStore } from "../lib/mobile-local-experience-store";
import { MobilePrimaryNavigation } from "../lib/mobile-primary-navigation";
import {
  projectMobileLearningProgress,
  type MobileLearningProgress,
  type MobileProgressConfigs,
} from "../lib/mobile-progress";

type ScreenStatus = "loading" | "ready" | "error";

const mobileUnit01ProgressConfigs: MobileProgressConfigs = {
  ...mobileUnit01MixedExpeditionConfigs,
};

function formatReviewDate(value: string | null): string {
  if (value === null) return "Pas encore révisé";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function masteryLabel(progress: number): string {
  if (progress >= 750) return "Repères confirmés";
  if (progress > 0) return "En apprentissage";
  return "À découvrir";
}

function ProgressSummary({
  progress,
  source,
  userId,
}: {
  readonly progress: MobileLearningProgress;
  readonly source: MobileProgressSource;
  readonly userId: string | null;
}) {
  const masteryPercent = Math.round(progress.masteryPermille / 10);
  const eyebrow =
    source === "server"
      ? "MAÎTRISE SYNCHRONISÉE"
      : userId === null
        ? "MAÎTRISE LOCALE"
        : "MAÎTRISE LOCALE · HORS CONNEXION";
  return (
    <View style={styles.summaryCard} accessibilityRole="summary">
      <Text style={styles.cardEyebrow}>{eyebrow}</Text>
      <Text style={styles.summaryTitle}>
        {progress.reviewedItems === 0
          ? "Votre carte commence ici."
          : `${masteryPercent} % de maîtrise moyenne`}
      </Text>
      <Text style={styles.cardBody}>
        {progress.reviewedItems === 0
          ? "Les essais des aperçus locaux alimenteront cette vue sans réseau."
          : `${progress.confirmedItems} repère${progress.confirmedItems > 1 ? "s" : ""} confirmé${progress.confirmedItems > 1 ? "s" : ""} sur ${progress.reviewedItems} révisé${progress.reviewedItems > 1 ? "s" : ""}.`}
      </Text>
      <View
        accessibilityLabel="Maîtrise moyenne"
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: masteryPercent,
          text: `${masteryPercent} pour cent`,
        }}
        style={styles.progressTrack}
      >
        <View style={[styles.progressFill, { width: `${masteryPercent}%` }]} />
      </View>
      <View style={styles.metricsRow}>
        <Metric label="Essais" value={String(progress.attemptedCount)} />
        <Metric label="Réussites" value={String(progress.successfulAttempts)} />
        <Metric label="À revoir" value={String(progress.dueCount)} />
      </View>
    </View>
  );
}

function Metric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const database = useSQLiteContext();
  const auth = useMobileAuthSession();
  const router = useRouter();
  const userId =
    auth.status === "signed_in"
      ? (auth.session?.user.id.toLowerCase() ?? null)
      : null;
  const experienceStore = useMemo(
    () => new MobileLocalExperienceStore(database),
    [database],
  );
  const [status, setStatus] = useState<ScreenStatus>("loading");
  const [retryRevision, setRetryRevision] = useState(0);
  const [progress, setProgress] = useState<MobileLearningProgress | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [progressSource, setProgressSource] =
    useState<MobileProgressSource>("local");

  useFocusEffect(
    useCallback(() => {
      // Le compteur force une nouvelle lecture après une erreur récupérable.
      void retryRevision;
      let active = true;
      setStatus("loading");
      setProgressSource("local");

      async function readProgress() {
        try {
          const [experience, localOutbox] = await Promise.all([
            experienceStore.read(),
            readMobileLocalProgress({ database, userId }),
          ]);
          if (!active) return;
          setOnboardingCompleted(experience.onboarding.status === "completed");
          setProgress(
            projectMobileLearningProgress({
              configs: mobileUnit01ProgressConfigs,
              experience,
              now: new Date().toISOString(),
              outbox: localOutbox,
            }),
          );
          setStatus("ready");

          if (userId === null) return;
          try {
            await refreshMobileAccountProgress({ database, userId });
            const serverOutbox = await readMobileLocalProgress({
              database,
              userId,
            });
            if (!active) return;
            setProgress(
              projectMobileLearningProgress({
                configs: mobileUnit01ProgressConfigs,
                experience,
                now: new Date().toISOString(),
                outbox: serverOutbox,
              }),
            );
            setProgressSource("server");
          } catch {
            // La projection locale déjà affichée reste la réponse hors ligne.
          }
        } catch {
          if (!active) return;
          setStatus("error");
        }
      }

      if (auth.status !== "loading") void readProgress();
      return () => {
        active = false;
      };
    }, [auth.status, database, experienceStore, retryRevision, userId]),
  );

  if (status === "error") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.centered} accessibilityLiveRegion="assertive">
          <Text accessibilityRole="header" style={styles.title}>
            Progrès indisponibles
          </Text>
          <Text style={styles.body}>
            Le journal local n&apos;a pas pu être relu. Rien n&apos;a été
            effacé.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={() => {
              setStatus("loading");
              setRetryRevision((revision) => revision + 1);
            }}
          >
            <Text style={styles.primaryText}>Réessayer</Text>
          </Pressable>
        </View>
        <MobilePrimaryNavigation activeRoute="/progress" />
      </SafeAreaView>
    );
  }

  if (status === "loading" || progress === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.centered} accessibilityLiveRegion="polite">
          <ActivityIndicator color="#283450" size="large" />
          <Text style={styles.loadingText}>Lecture de vos progrès…</Text>
        </View>
        <MobilePrimaryNavigation activeRoute="/progress" />
      </SafeAreaView>
    );
  }

  if (!onboardingCompleted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.centered}>
          <Text accessibilityRole="header" style={styles.title}>
            Votre carte apparaîtra après le démarrage.
          </Text>
          <Text style={styles.body}>
            Configurez Aujourd&apos;hui pour créer votre premier point de
            reprise.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={() => router.push("/")}
          >
            <Text style={styles.primaryText}>
              Configurer depuis Aujourd&apos;hui
            </Text>
          </Pressable>
        </View>
        <MobilePrimaryNavigation activeRoute="/progress" />
      </SafeAreaView>
    );
  }

  const hasActivity =
    progress.attemptedCount > 0 || progress.activeExpedition !== null;
  const activeExpedition = progress.activeExpedition;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.brand}>Thaïnaute</Text>
        <Pressable
          accessibilityRole="button"
          style={styles.headerButton}
          onPress={() => router.push("/account")}
        >
          <Text style={styles.headerButtonText}>Compte</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>PROGRÈS</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Voir ce qui s&apos;installe, séance après séance.
        </Text>
        <Text style={styles.body}>
          {progressSource === "server"
            ? "Cette carte reprend la progression autoritaire du compte, quel que soit l’appareil utilisé."
            : userId === null
              ? "Cette carte repose sur les tentatives locales évaluées par le même SRS que les prochaines révisions."
              : "Le réseau est momentanément indisponible : la dernière projection locale reste affichée, sans perte de tentative."}
        </Text>

        <ProgressSummary
          progress={progress}
          source={progressSource}
          userId={userId}
        />

        {progress.activeExpedition !== null && (
          <View style={styles.activeCard}>
            <Text style={styles.cardEyebrow}>SÉANCE EN COURS</Text>
            <Text style={styles.cardTitle}>
              Expédition{" "}
              {progress.activeExpedition.key.replace("u01-", "").toUpperCase()}
            </Text>
            <Text style={styles.cardBody}>
              {progress.activeExpedition.completedCount} exercice
              {progress.activeExpedition.completedCount > 1 ? "s" : ""} sur{" "}
              {progress.activeExpedition.totalCount} terminé
              {progress.activeExpedition.totalCount > 1 ? "s" : ""}.
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.secondaryButton}
              onPress={() => {
                if (activeExpedition === null) return;
                router.push(
                  `/mobile-lesson-expedition?lessonId=${activeExpedition.key}` as Href,
                );
              }}
            >
              <Text style={styles.secondaryText}>Reprendre la séance</Text>
            </Pressable>
          </View>
        )}

        {!hasActivity && (
          <View style={styles.emptyCard}>
            <Text style={styles.cardTitle}>Aucun repère à afficher</Text>
            <Text style={styles.cardBody}>
              Commencez un aperçu audio dans Pratiquer ; chaque réponse
              alimentera ensuite cette vue.
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.secondaryButton}
              onPress={() => router.push("/practice")}
            >
              <Text style={styles.secondaryText}>Aller pratiquer</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.lessonList}>
          {progress.lessons.map((lesson) => {
            const masteryPercent = Math.round(lesson.masteryPermille / 10);
            return (
              <View key={lesson.key} style={styles.lessonCard}>
                <View style={styles.cardTopline}>
                  <Text style={styles.cardEyebrow}>
                    {lesson.key.replace("u01-", "").toUpperCase()}
                  </Text>
                  <Text style={styles.statusText}>
                    {masteryLabel(lesson.masteryPermille)}
                  </Text>
                </View>
                <Text style={styles.cardTitle}>{lesson.lessonTitle}</Text>
                <View
                  accessibilityLabel={`Progression de ${lesson.lessonTitle}`}
                  accessibilityRole="progressbar"
                  accessibilityValue={{
                    min: 0,
                    max: 100,
                    now: masteryPercent,
                    text: `${masteryPercent} pour cent`,
                  }}
                  style={styles.progressTrack}
                >
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${masteryPercent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.lessonMeta}>
                  {lesson.reviewedItems}/{lesson.exerciseCount} repères révisés
                  · {lesson.attemptedCount} essai
                  {lesson.attemptedCount > 1 ? "s" : ""}
                </Text>
                <Text style={styles.lessonMeta}>
                  {lesson.dueCount > 0
                    ? `${lesson.dueCount} révision${lesson.dueCount > 1 ? "s" : ""} à faire`
                    : `Prochaine révision : ${formatReviewDate(lesson.nextReviewAt)}`}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <MobilePrimaryNavigation activeRoute="/progress" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.jasmine },
  centered: {
    flex: 1,
    alignItems: "stretch",
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
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  brand: {
    flex: 1,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  headerButton: {
    minWidth: 72,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonText: { color: colors.ink, fontWeight: "700" },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 40,
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
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
  },
  body: { marginTop: 12, color: colors.inkSoft, fontSize: 16, lineHeight: 24 },
  summaryCard: {
    marginTop: 24,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: 22,
    backgroundColor: "white",
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  activeCard: {
    marginTop: 14,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.coral,
    borderRadius: 22,
    backgroundColor: colors.jadePale,
  },
  emptyCard: {
    marginTop: 14,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: 22,
    backgroundColor: colors.mist,
  },
  cardEyebrow: {
    color: colors.jadeInk,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  summaryTitle: {
    marginTop: 9,
    color: colors.ink,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "800",
  },
  cardTitle: {
    marginTop: 9,
    color: "#283450",
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
  },
  cardBody: {
    marginTop: 7,
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  progressTrack: {
    height: 10,
    marginTop: 18,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: colors.mist,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.jade,
  },
  metricsRow: {
    marginTop: 20,
    flexDirection: "row",
    gap: 8,
  },
  metric: { flex: 1, alignItems: "center" },
  metricValue: { color: colors.ink, fontSize: 21, fontWeight: "800" },
  metricLabel: { marginTop: 3, color: colors.inkSoft, fontSize: 12 },
  lessonList: { marginTop: 14, gap: 14 },
  lessonCard: {
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: 22,
    backgroundColor: "white",
    shadowColor: colors.ink,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
  cardTopline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  statusText: { color: colors.inkSoft, fontSize: 12, fontWeight: "800" },
  lessonMeta: {
    marginTop: 10,
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
  secondaryButton: {
    minHeight: 48,
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#283450",
  },
  secondaryText: { color: "white", fontSize: 15, fontWeight: "800" },
});
