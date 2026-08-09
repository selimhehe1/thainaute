// Catalogue éditorial conservé hors du graphe Expo public.
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  formatMobileUnit01ExerciseCount,
  getMobileUnit01BlockedReasonText,
  mobileUnit01Catalog,
} from "../lib/mobile-unit01-catalog";

export default function MobileUnit01Screen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          style={styles.backButton}
          onPress={() => router.replace("/path")}
        >
          <Text style={styles.backText}>Aujourd&apos;hui</Text>
        </Pressable>
        <Text style={styles.headerLabel}>PARCOURS RÉEL</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>UNITÉ 1 · CONTENU INTERNE</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Les premiers repères du thaï
        </Text>
        <Text style={styles.body}>
          Les six leçons sont compilées dans l&apos;application. Les aperçus
          disponibles utilisent uniquement les médias vérifiés et embarqués.
        </Text>

        <View style={styles.list}>
          {mobileUnit01Catalog.map((item, index) => {
            const isPreview = item.availability === "preview";
            return (
              <View
                key={item.key}
                testID={`unit01-lesson-${item.key}`}
                style={[styles.card, isPreview && styles.previewCard]}
              >
                <View style={styles.cardTopline}>
                  <Text style={styles.lessonNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                  <Text
                    style={[
                      styles.availability,
                      isPreview ? styles.previewAvailability : styles.blocked,
                    ]}
                  >
                    {isPreview ? "APERÇU DISPONIBLE" : "EN PRÉPARATION"}
                  </Text>
                </View>
                <Text style={styles.lessonTitle}>{item.lessonTitle}</Text>
                <Text style={styles.objective}>{item.objective}</Text>
                {isPreview ? (
                  <>
                    <Text style={styles.meta}>
                      Expédition mixte ·{" "}
                      {formatMobileUnit01ExerciseCount(item.exerciseCount)}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      style={styles.primaryButton}
                      onPress={() => {
                        router.push(
                          `/mobile-lesson-expedition?lessonId=${item.key}` as import("expo-router").Href,
                        );
                      }}
                    >
                      <Text style={styles.primaryText}>
                        Commencer l&apos;aperçu
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
                    <Text style={styles.blockedText}>
                      Cette leçon reste visible, mais l&apos;application ne
                      lance pas encore un exercice incomplet.
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fbfaf7" },
  header: {
    minHeight: 68,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#cbd0d8",
  },
  backButton: {
    minWidth: 100,
    minHeight: 44,
    justifyContent: "center",
  },
  backText: { color: "#283450", fontWeight: "800" },
  headerLabel: {
    marginLeft: "auto",
    color: "#687287",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
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
    letterSpacing: 1.3,
  },
  title: {
    marginTop: 12,
    color: "#283450",
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "800",
  },
  body: { marginTop: 12, color: "#5e6980", fontSize: 16, lineHeight: 24 },
  list: { marginTop: 24, gap: 14 },
  card: {
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#cbd0d8",
    borderRadius: 22,
    backgroundColor: "#f4f3ef",
  },
  previewCard: { borderColor: "#b7d8ca", backgroundColor: "white" },
  cardTopline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  lessonNumber: { color: "#687287", fontSize: 12, fontWeight: "800" },
  availability: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  previewAvailability: { color: "#236b58" },
  blocked: { color: "#9b514d" },
  lessonTitle: {
    marginTop: 12,
    color: "#283450",
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
  },
  objective: { marginTop: 8, color: "#5e6980", fontSize: 15, lineHeight: 22 },
  meta: { marginTop: 16, color: "#236b58", fontSize: 13, fontWeight: "800" },
  primaryButton: {
    minHeight: 48,
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#283450",
  },
  primaryText: { color: "white", fontSize: 15, fontWeight: "800" },
  blockedNote: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#ebe9e4",
  },
  blockedTitle: { color: "#7f4744", fontSize: 14, fontWeight: "800" },
  blockedText: { marginTop: 6, color: "#687287", fontSize: 13, lineHeight: 19 },
});
