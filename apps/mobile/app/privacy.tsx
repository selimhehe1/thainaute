import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMobileAnalytics } from "../lib/analytics-provider";

function decisionLabel(decision: "unknown" | "denied" | "granted"): string {
  if (decision === "granted") return "Autorisée";
  if (decision === "denied") return "Refusée";
  return "Aucun choix";
}

export default function PrivacyScreen() {
  const consent = useMobileAnalytics();
  const busy = consent.status === "loading" || consent.status === "saving";
  const displayedDecision =
    consent.status === "loading"
      ? "Lecture de la préférence…"
      : consent.status === "saving"
        ? "Enregistrement du choix…"
        : decisionLabel(consent.decision);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Link href="/account" style={styles.backLink}>
          ‹ Compte
        </Link>
        <Text style={styles.eyebrow}>CONFIDENTIALITÉ</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Mesure facultative
        </Text>
        <Text style={styles.body}>
          Thaïnaute peut mesurer des étapes techniques comme le démarrage d’une
          leçon ou sa fin. Le choix reste sur cet appareil, n’est pas lié à
          votre compte et ne bloque jamais l’apprentissage.
        </Text>

        <View style={styles.card} accessibilityRole="summary">
          <Text style={styles.cardLabel}>ÉTAT SUR CET APPAREIL</Text>
          <Text accessibilityLiveRegion="polite" style={styles.cardValue}>
            {displayedDecision}
          </Text>
          <Text style={styles.cardBody}>
            Cette version n’active aucun fournisseur distant. Elle prépare la
            porte de consentement avant une future bêta.
          </Text>
        </View>

        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Ce qui n’est jamais mesuré
        </Text>
        <Text style={styles.body}>
          Aucun email, token, réponse libre, texte thaï saisi, audio,
          transcription ou identifiant de compte. Les permissions microphone et
          le marketing restent des choix séparés.
        </Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy, disabled: busy }}
            disabled={busy}
            style={[styles.choiceButton, busy && styles.disabled]}
            onPress={() => void consent.decide("granted")}
          >
            <Text style={styles.choiceText}>
              Autoriser la mesure facultative
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy, disabled: busy }}
            disabled={busy}
            style={[styles.choiceButton, busy && styles.disabled]}
            onPress={() => void consent.decide("denied")}
          >
            <Text style={styles.choiceText}>Refuser ou retirer la mesure</Text>
          </Pressable>
        </View>

        {consent.message !== "" && (
          <Text
            accessibilityLiveRegion={
              consent.status === "error" ? "assertive" : "polite"
            }
            accessibilityRole={consent.status === "error" ? "alert" : "text"}
            style={[styles.message, consent.status === "error" && styles.error]}
          >
            {consent.message}
          </Text>
        )}
        {consent.status === "error" && (
          <Pressable
            accessibilityRole="button"
            style={styles.retryButton}
            onPress={consent.retry}
          >
            <Text style={styles.secondaryText}>
              Réessayer l’opération locale
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fbfaf7" },
  container: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 64,
  },
  backLink: {
    minHeight: 44,
    paddingVertical: 12,
    color: "#283450",
    fontWeight: "800",
  },
  eyebrow: {
    marginTop: 18,
    color: "#236b58",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 10,
    color: "#283450",
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900",
  },
  sectionTitle: {
    marginTop: 30,
    color: "#283450",
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "900",
  },
  body: { marginTop: 12, color: "#536078", fontSize: 16, lineHeight: 24 },
  card: {
    marginTop: 26,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#eff9f5",
  },
  cardLabel: { color: "#496b62", fontSize: 11, fontWeight: "900" },
  cardValue: {
    marginTop: 7,
    color: "#225c4a",
    fontSize: 23,
    fontWeight: "900",
  },
  cardBody: { marginTop: 9, color: "#496b62", fontSize: 14, lineHeight: 21 },
  actions: { marginTop: 26 },
  choiceButton: {
    minHeight: 52,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#283450",
    borderRadius: 999,
    backgroundColor: "white",
  },
  choiceText: {
    color: "#283450",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  retryButton: {
    minHeight: 48,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: "#283450",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  disabled: { opacity: 0.5 },
  message: { marginTop: 18, color: "#225c4a", fontSize: 14, lineHeight: 21 },
  error: { color: "#8e332e", fontWeight: "700" },
});
