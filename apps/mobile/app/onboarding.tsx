import { noOpAnalytics, type AnalyticsSink } from "@thainaute/analytics";
import {
  type LocalOnboardingSelection,
  type LocalOnboardingState,
} from "@thainaute/sync";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MobileLocalExperienceStore } from "../lib/mobile-local-experience-store";

type Status = "loading" | "ready" | "error";

const goalOptions = [
  { value: "prototype_goal_short", label: "5 minutes" },
  { value: "prototype_goal_regular", label: "10 minutes" },
] as const;

const motivationOptions = [
  { value: "prototype_motivation_travel", label: "Voyager" },
  {
    value: "prototype_motivation_relationships",
    label: "Échanger avec mes proches",
  },
  {
    value: "prototype_motivation_daily_life",
    label: "Mieux vivre le quotidien",
  },
] as const;

const experienceOptions = [
  { value: "prototype_experience_new", label: "Je débute" },
  { value: "prototype_experience_basics", label: "J’ai quelques bases" },
  { value: "prototype_experience_returning", label: "Je reprends le thaï" },
] as const;

function knownOptionValue<
  Options extends readonly { readonly value: string }[],
>(
  options: Options,
  optionId: string | null,
): Options[number]["value"] | undefined {
  return options.find(({ value }) => value === optionId)?.value;
}

function selectionFromOnboarding(
  onboarding: Extract<LocalOnboardingState, { status: "in_progress" }>,
): Partial<LocalOnboardingSelection> {
  const goalOptionId = knownOptionValue(goalOptions, onboarding.goalOptionId);
  const motivationOptionId = knownOptionValue(
    motivationOptions,
    onboarding.motivationOptionId,
  );
  const experienceOptionId = knownOptionValue(
    experienceOptions,
    onboarding.experienceOptionId,
  );
  return {
    ...(goalOptionId === undefined ? {} : { goalOptionId }),
    ...(motivationOptionId === undefined ? {} : { motivationOptionId }),
    ...(experienceOptionId === undefined ? {} : { experienceOptionId }),
  };
}

function safeCapture(
  analytics: AnalyticsSink,
  event: Parameters<AnalyticsSink["capture"]>[0],
): void {
  try {
    analytics.capture(event);
  } catch {
    // La mesure optionnelle ne bloque jamais le parcours local.
  }
}

function ChoiceGroup<T extends string | number>(props: {
  readonly label: string;
  readonly options: readonly {
    readonly value: T;
    readonly label: string;
  }[];
  readonly selected: T | null;
  readonly disabled: boolean;
  readonly onSelect: (value: T) => void;
}) {
  return (
    <View style={styles.group} accessibilityRole="radiogroup">
      <Text style={styles.groupTitle}>{props.label}</Text>
      <View style={styles.choiceList}>
        {props.options.map((option) => {
          const checked = props.selected === option.value;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked, disabled: props.disabled }}
              disabled={props.disabled}
              key={String(option.value)}
              style={[
                styles.choice,
                checked && styles.choiceSelected,
                props.disabled && styles.disabled,
              ]}
              onPress={() => props.onSelect(option.value)}
            >
              <View style={[styles.radio, checked && styles.radioSelected]} />
              <Text style={styles.choiceText}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function OnboardingScreen({
  analytics = noOpAnalytics,
}: {
  readonly analytics?: AnalyticsSink;
}) {
  const database = useSQLiteContext();
  const router = useRouter();
  const store = useMemo(
    () => new MobileLocalExperienceStore(database),
    [database],
  );
  const [status, setStatus] = useState<Status>("loading");
  const [retryRevision, setRetryRevision] = useState(0);
  const [selection, setSelection] = useState<Partial<LocalOnboardingSelection>>(
    {},
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void store
      .read()
      .then(async (current) => {
        const startsNow = current.onboarding.status === "not_started";
        const snapshot = startsNow
          ? await store.beginOnboarding(new Date().toISOString())
          : current;
        if (!active) return;
        if (snapshot.onboarding.status === "completed") {
          router.replace("/");
          return;
        }
        if (snapshot.onboarding.status !== "in_progress") {
          throw new Error("État d’onboarding inattendu.");
        }
        setSelection(selectionFromOnboarding(snapshot.onboarding));
        setStatus("ready");
        if (startsNow) {
          safeCapture(analytics, {
            name: "onboarding_started",
            platform: Platform.OS === "ios" ? "ios" : "android",
          });
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [analytics, retryRevision, router, store]);

  async function updateSelection(
    update: Partial<LocalOnboardingSelection>,
  ): Promise<void> {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const snapshot = await store.updateOnboarding(
        update,
        new Date().toISOString(),
      );
      if (snapshot.onboarding.status !== "in_progress") return;
      setSelection(selectionFromOnboarding(snapshot.onboarding));
    } catch {
      setMessage("Ce choix n’a pas pu être enregistré. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  async function complete(): Promise<void> {
    if (
      busy ||
      selection.goalOptionId === undefined ||
      selection.motivationOptionId === undefined ||
      selection.experienceOptionId === undefined
    ) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await store.completeOnboarding(
        {
          goalOptionId: selection.goalOptionId,
          motivationOptionId: selection.motivationOptionId,
          experienceOptionId: selection.experienceOptionId,
        },
        new Date().toISOString(),
      );
      safeCapture(analytics, {
        name: "onboarding_completed",
        platform: Platform.OS === "ios" ? "ios" : "android",
      });
      router.replace("/");
    } catch {
      setMessage(
        "L’onboarding reste sur cet appareil, mais n’a pas pu être finalisé.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered} accessibilityLiveRegion="polite">
          <ActivityIndicator color="#283450" size="large" />
          <Text style={styles.loadingText}>Préparation de votre parcours…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === "error") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered} accessibilityLiveRegion="assertive">
          <Text accessibilityRole="header" style={styles.title}>
            Stockage local indisponible
          </Text>
          <Text style={styles.body}>
            Rien n’a été effacé. Réessayez avant de commencer.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={() => {
              setStatus("loading");
              setMessage("");
              setRetryRevision((revision) => revision + 1);
            }}
          >
            <Text style={styles.primaryText}>Réessayer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const completeDisabled =
    busy ||
    selection.goalOptionId === undefined ||
    selection.motivationOptionId === undefined ||
    selection.experienceOptionId === undefined;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>BIENVENUE</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Un départ simple, pensé pour vous.
        </Text>
        <Text style={styles.body}>
          Ces trois choix restent sur cet appareil. Ils ne changent pas le
          contenu et ne nécessitent aucun compte.
        </Text>

        <ChoiceGroup
          disabled={busy}
          label="Mon objectif quotidien"
          options={goalOptions}
          selected={selection.goalOptionId ?? null}
          onSelect={(goalOptionId) => void updateSelection({ goalOptionId })}
        />
        <ChoiceGroup
          disabled={busy}
          label="Ma motivation principale"
          options={motivationOptions}
          selected={selection.motivationOptionId ?? null}
          onSelect={(motivationOptionId) =>
            void updateSelection({ motivationOptionId })
          }
        />
        <ChoiceGroup
          disabled={busy}
          label="Mon expérience du thaï"
          options={experienceOptions}
          selected={selection.experienceOptionId ?? null}
          onSelect={(experienceOptionId) =>
            void updateSelection({ experienceOptionId })
          }
        />

        {message !== "" && (
          <Text accessibilityRole="alert" style={styles.error}>
            {message}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy, disabled: completeDisabled }}
          disabled={completeDisabled}
          style={[styles.primaryButton, completeDisabled && styles.disabled]}
          onPress={() => void complete()}
        >
          <Text style={styles.primaryText}>
            {busy ? "Enregistrement…" : "Voir ma séance du jour"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function OnboardingRoute() {
  return <OnboardingScreen />;
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
  group: { marginTop: 28 },
  groupTitle: { color: "#283450", fontSize: 18, fontWeight: "800" },
  choiceList: { marginTop: 10, gap: 9 },
  choice: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e6eb",
    borderRadius: 16,
    backgroundColor: "white",
  },
  choiceSelected: { borderColor: "#43a283", backgroundColor: "#eff9f5" },
  radio: {
    width: 20,
    height: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#8992a3",
    borderRadius: 10,
  },
  radioSelected: { borderWidth: 6, borderColor: "#43a283" },
  choiceText: { flex: 1, color: "#283450", fontSize: 15, fontWeight: "700" },
  primaryButton: {
    minHeight: 52,
    marginTop: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#283450",
  },
  primaryText: { color: "white", fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  error: { marginTop: 18, color: "#9b3732", fontSize: 14, lineHeight: 21 },
});
