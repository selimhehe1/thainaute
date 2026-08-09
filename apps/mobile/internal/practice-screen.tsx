// Catalogue éditorial conservé hors du graphe Expo public.
import { colors } from "@thainaute/design-tokens";
import { useFocusEffect, useRouter } from "expo-router";
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

import {
  getMobileUnit01BlockedReasonText,
  mobileUnit01Catalog,
} from "../lib/mobile-unit01-catalog";
import { MobileLocalExperienceStore } from "../lib/mobile-local-experience-store";
import { MobilePrimaryNavigation } from "../lib/mobile-primary-navigation";

type ScreenStatus = "loading" | "ready" | "error";

export default function PracticeScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const store = useMemo(
    () => new MobileLocalExperienceStore(database),
    [database],
  );
  const [status, setStatus] = useState<ScreenStatus>("loading");
  const [retryRevision, setRetryRevision] = useState(0);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Le compteur force une nouvelle lecture après une erreur récupérable.
      void retryRevision;
      let active = true;
      setStatus("loading");
      void store
        .read()
        .then((snapshot) => {
          if (!active) return;
          setOnboardingCompleted(snapshot.onboarding.status === "completed");
          setStatus("ready");
        })
        .catch(() => {
          if (!active) return;
          setStatus("error");
        });
      return () => {
        active = false;
      };
    }, [retryRevision, store]),
  );

  if (status === "error") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.centered} accessibilityLiveRegion="assertive">
          <Text accessibilityRole="header" style={styles.title}>
            Pratique indisponible
          </Text>
          <Text style={styles.body}>
            Le stockage local n&apos;a pas pu être relu. Vos données existantes
            sont conservées.
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
        <MobilePrimaryNavigation activeRoute="/practice" />
      </SafeAreaView>
    );
  }

  if (status === "loading") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.centered} accessibilityLiveRegion="polite">
          <ActivityIndicator color="#283450" size="large" />
          <Text style={styles.loadingText}>Préparation de la pratique…</Text>
        </View>
        <MobilePrimaryNavigation activeRoute="/practice" />
      </SafeAreaView>
    );
  }

  if (!onboardingCompleted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.centered}>
          <Text accessibilityRole="header" style={styles.title}>
            Commencez par vous situer.
          </Text>
          <Text style={styles.body}>
            Quelques choix dans Aujourd&apos;hui suffisent pour préparer votre
            première séance locale.
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
        <MobilePrimaryNavigation activeRoute="/practice" />
      </SafeAreaView>
    );
  }

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
        <Text style={styles.eyebrow}>PRATIQUER</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Entraîner l&apos;oreille, sans pression.
        </Text>
        <Text style={styles.body}>
          Choisissez un aperçu adapté à la mécanique de la leçon. Les contenus
          encore incomplets restent visibles, mais ne sont jamais lancés.
        </Text>

        <View style={styles.voiceCard}>
          <Text style={styles.cardEyebrow}>PRATIQUE VOCALE OPTIONNELLE</Text>
          <Text style={styles.cardTitle}>Comparer votre voix au modèle</Text>
          <Text style={styles.cardBody}>
            Dans une leçon audio, vous pouvez enregistrer jusqu&apos;à 20
            secondes et supprimer la prise à tout moment. Rien n&apos;est envoyé
            par défaut.
          </Text>
        </View>

        <View style={styles.list}>
          {mobileUnit01Catalog.map((item, index) => {
            const available = item.availability === "preview";
            return (
              <View
                key={item.key}
                testID={`practice-lesson-${item.key}`}
                style={[styles.lessonCard, available && styles.availableCard]}
              >
                <View style={styles.cardTopline}>
                  <Text style={styles.lessonNumber}>
                    UNITÉ 1 · {String(index + 1).padStart(2, "0")}
                  </Text>
                  <Text
                    style={[
                      styles.availability,
                      available ? styles.availableText : styles.blockedText,
                    ]}
                  >
                    {available ? "DISPONIBLE" : "EN PRÉPARATION"}
                  </Text>
                </View>
                <Text style={styles.lessonTitle}>{item.lessonTitle}</Text>
                <Text style={styles.lessonBody}>{item.objective}</Text>
                {available ? (
                  <>
                    <Text style={styles.meta}>
                      Expédition mixte · {item.exerciseCount} exercices locaux
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      style={styles.secondaryButton}
                      onPress={() => {
                        router.push(
                          `/mobile-lesson-expedition?lessonId=${item.key}` as import("expo-router").Href,
                        );
                      }}
                    >
                      <Text style={styles.secondaryText}>
                        Ouvrir l&apos;aperçu
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <View style={styles.blockedNote}>
                    <Text style={styles.blockedTitle}>
                      {item.blockedReason === null
                        ? "Contenu en préparation"
                        : getMobileUnit01BlockedReasonText(item.blockedReason)}
                    </Text>
                    <Text style={styles.blockedBody}>
                      Cette leçon reste visible jusqu&apos;à ce que toutes ses
                      portes de contenu soient franchies.
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
      <MobilePrimaryNavigation activeRoute="/practice" />
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
  voiceCard: {
    marginTop: 24,
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.jadePale,
  },
  cardEyebrow: {
    color: colors.jadeInk,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  cardTitle: {
    marginTop: 8,
    color: colors.ink,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
  },
  cardBody: {
    marginTop: 6,
    color: colors.jadeInk,
    fontSize: 14,
    lineHeight: 21,
  },
  list: { marginTop: 18, gap: 14 },
  lessonCard: {
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: 22,
    backgroundColor: "#f4f3ef",
  },
  availableCard: {
    borderColor: colors.jade,
    borderLeftWidth: 4,
    borderLeftColor: colors.coral,
    backgroundColor: "white",
  },
  cardTopline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  lessonNumber: { color: colors.inkSoft, fontSize: 12, fontWeight: "800" },
  availability: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  availableText: { color: colors.jadeInk },
  blockedText: { color: colors.coralDeep },
  lessonTitle: {
    marginTop: 12,
    color: colors.ink,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
  },
  lessonBody: {
    marginTop: 8,
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    marginTop: 16,
    color: colors.jadeInk,
    fontSize: 13,
    fontWeight: "800",
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
    backgroundColor: colors.ink,
  },
  secondaryText: { color: "white", fontSize: 15, fontWeight: "800" },
  blockedNote: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.mist,
  },
  blockedTitle: { color: colors.coralDeep, fontSize: 14, fontWeight: "800" },
  blockedBody: {
    marginTop: 6,
    color: colors.inkSoft,
    fontSize: 13,
    lineHeight: 19,
  },
});
