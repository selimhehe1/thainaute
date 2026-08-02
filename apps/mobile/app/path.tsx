import { fixtureLesson } from "@thainaute/content/fixture";
import { projectFixtureLearningPath } from "@thainaute/sync";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  findNodeHandle,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MobileLocalExperienceStore } from "../lib/mobile-local-experience-store";

const lesson = fixtureLesson;
const exercise = lesson.exercises[0];
if (exercise === undefined) {
  throw new Error("La fixture mobile doit contenir un exercice.");
}

const fixtureTarget = {
  lessonVersionId: lesson.versionId,
  exerciseId: exercise.id,
} as const;

type LearningPathProjection = ReturnType<typeof projectFixtureLearningPath>;
type ScreenStatus = "loading" | "ready" | "error";

const stateCopy = {
  onboarding_required: {
    action: "Configurer depuis Aujourd’hui",
    detail: "Terminez d’abord les quelques choix de démarrage.",
    label: "Onboarding requis",
    route: "/" as const,
  },
  available: {
    action: "Commencer depuis Aujourd’hui",
    detail: "Cette unité technique est prête à être commencée.",
    label: "Disponible",
    route: "/" as const,
  },
  in_progress: {
    action: "Reprendre la leçon",
    detail: "Votre point de reprise local est conservé sur cet appareil.",
    label: "En cours",
    route: "/lesson" as const,
  },
  result_ready: {
    action: "Voir le résultat",
    detail: "La tentative locale est prête à être relue.",
    label: "Résultat prêt",
    route: "/lesson" as const,
  },
  completed: {
    action: "Revoir la leçon",
    detail: "L’unité technique est terminée sur cet appareil.",
    label: "Terminée",
    route: "/lesson" as const,
  },
  version_conflict: {
    action: "Vérifier depuis Aujourd’hui",
    detail:
      "Un autre checkpoint local existe. Aujourd’hui permet de le conserver ou de le remplacer explicitement.",
    label: "Version à vérifier",
    route: "/" as const,
  },
} satisfies Record<
  LearningPathProjection["status"],
  {
    readonly action: string;
    readonly detail: string;
    readonly label: string;
    readonly route: "/" | "/lesson";
  }
>;

export default function LearningPathScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const store = useMemo(
    () => new MobileLocalExperienceStore(database),
    [database],
  );
  const [status, setStatus] = useState<ScreenStatus>("loading");
  const [retryRevision, setRetryRevision] = useState(0);
  const [projection, setProjection] = useState<LearningPathProjection | null>(
    null,
  );
  const errorHeadingRef = useRef<Text>(null);
  const readyHeadingRef = useRef<Text>(null);
  const requestRevisionRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      // La révision rend un nouvel essai observable par ce callback de focus.
      void retryRevision;
      const requestRevision = requestRevisionRef.current + 1;
      requestRevisionRef.current = requestRevision;
      let active = true;
      setStatus("loading");

      void store
        .read()
        .then((snapshot) => projectFixtureLearningPath(snapshot, fixtureTarget))
        .then((nextProjection) => {
          if (!active || requestRevisionRef.current !== requestRevision) {
            return;
          }
          setProjection(nextProjection);
          setStatus("ready");
        })
        .catch(() => {
          if (!active || requestRevisionRef.current !== requestRevision) {
            return;
          }
          setStatus("error");
        });

      return () => {
        active = false;
      };
    }, [retryRevision, store]),
  );

  useEffect(() => {
    const heading =
      status === "error"
        ? errorHeadingRef.current
        : status === "ready" && projection !== null
          ? readyHeadingRef.current
          : null;
    if (heading === null) return;
    const node = findNodeHandle(heading);
    if (node !== null) AccessibilityInfo.setAccessibilityFocus(node);
  }, [projection, status]);

  if (status === "error") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered} accessibilityLiveRegion="assertive">
          <Text
            ref={errorHeadingRef}
            accessibilityRole="header"
            style={styles.errorTitle}
          >
            Parcours local indisponible
          </Text>
          <Text style={styles.body}>
            Rien n’a été effacé. Réessayez pour relire le stockage de cet
            appareil.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={() => {
              requestRevisionRef.current += 1;
              setStatus("loading");
              setRetryRevision((revision) => revision + 1);
            }}
          >
            <Text style={styles.primaryText}>Réessayer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (status === "loading" || projection === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered} accessibilityLiveRegion="polite">
          <ActivityIndicator color="#283450" size="large" />
          <Text style={styles.loadingText}>Lecture du parcours local…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const copy = stateCopy[projection.status];
  const progressText =
    projection.completedSteps === 1
      ? "1 étape technique terminée sur 1"
      : "0 étape technique terminée sur 1";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View testID="path-header" style={styles.header}>
        <Text style={styles.brand}>Thaïnaute</Text>
        <View testID="path-header-actions" style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            style={styles.todayButton}
            onPress={() => router.push("/")}
          >
            <Text style={styles.todayText}>Aujourd’hui</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>PARCOURS</Text>
        <Text
          ref={readyHeadingRef}
          accessibilityRole="header"
          style={styles.title}
        >
          Votre première unité technique
        </Text>
        <Text style={styles.body}>
          Une vue locale de la démonstration, sans réseau ni contenu publié.
        </Text>

        <View style={styles.unitCard}>
          <Text style={styles.fixtureLabel}>
            DONNÉE FICTIVE / NON PUBLIABLE
          </Text>
          <View style={styles.unitHeading}>
            <Text style={styles.unitNumber}>
              UNITÉ TECHNIQUE · PROTOTYPE LOCAL
            </Text>
            <Text style={styles.stateLabel}>{copy.label}</Text>
          </View>
          <Text style={styles.lessonTitle}>{lesson.titleFr}</Text>
          <Text style={styles.body}>{lesson.objectiveFr}</Text>

          <View
            accessibilityLabel="Progression de l’unité technique"
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: projection.totalSteps,
              now: projection.completedSteps,
              text: progressText,
            }}
            style={styles.progressSection}
          >
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${projection.progressPercent}%` as `${number}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progressText}</Text>
          </View>

          <Text style={styles.stateDetail}>{copy.detail}</Text>
          <Pressable
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={() => router.push(copy.route)}
          >
            <Text style={styles.primaryText}>{copy.action}</Text>
          </Pressable>
        </View>

        <View style={styles.futureCard}>
          <Text style={styles.futureEyebrow}>UNITÉS FUTURES · BLOQUÉES</Text>
          <Text style={styles.futureTitle}>
            Le parcours ne prétend pas être complet.
          </Text>
          <Text style={styles.body}>
            Les prochaines unités resteront indisponibles jusqu’à ce que les
            décisions produit soient tranchées et les contenus linguistiques
            audités.
          </Text>
        </View>
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
  errorTitle: {
    color: "#283450",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    textAlign: "center",
  },
  header: {
    minHeight: 68,
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    rowGap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#cbd0d8",
  },
  brand: {
    flexGrow: 1,
    flexShrink: 1,
    color: "#283450",
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
  todayButton: {
    minWidth: 96,
    minHeight: 44,
    paddingHorizontal: 10,
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  todayText: {
    flexShrink: 1,
    color: "#283450",
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
    color: "#236b58",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    marginTop: 12,
    color: "#283450",
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
  },
  body: { marginTop: 12, color: "#5e6980", fontSize: 16, lineHeight: 24 },
  unitCard: {
    marginTop: 24,
    padding: 22,
    borderRadius: 24,
    backgroundColor: "white",
  },
  futureCard: {
    marginTop: 16,
    padding: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#cbd0d8",
    borderRadius: 24,
    backgroundColor: "#f4f3ef",
  },
  futureEyebrow: {
    color: "#687287",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  futureTitle: {
    marginTop: 10,
    color: "#283450",
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
  },
  fixtureLabel: {
    color: "#9b514d",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  unitHeading: {
    marginTop: 16,
    alignItems: "flex-start",
    gap: 8,
  },
  unitNumber: {
    color: "#687287",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  stateLabel: {
    color: "#236b58",
    fontSize: 13,
    fontWeight: "800",
  },
  lessonTitle: {
    marginTop: 12,
    color: "#283450",
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
  },
  progressSection: { marginTop: 22 },
  progressTrack: {
    height: 10,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#e4e8ed",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#43a283",
  },
  progressText: {
    marginTop: 8,
    color: "#5e6980",
    fontSize: 13,
    fontWeight: "700",
  },
  stateDetail: {
    marginTop: 18,
    color: "#46536b",
    fontSize: 15,
    lineHeight: 22,
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
});
