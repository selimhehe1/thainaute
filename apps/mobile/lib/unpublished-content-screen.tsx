import { colors } from "@thainaute/design-tokens";
import { useRouter, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  MobilePrimaryNavigation,
  type MobilePrimaryRoute,
} from "./mobile-primary-navigation";

interface UnpublishedContentScreenProps {
  readonly actionHref: Href;
  readonly actionLabel: string;
  readonly activeRoute?: MobilePrimaryRoute;
  readonly title: string;
}

/**
 * Frontière fail-closed des routes qui accueilleront un jour du contenu réel.
 * Aucun module d'autorat, JSON linguistique ou média de cours ne doit être
 * importé depuis ce composant ou depuis ses wrappers sous `app/`.
 */
export function UnpublishedContentScreen({
  actionHref,
  actionLabel,
  activeRoute,
  title,
}: UnpublishedContentScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.content} accessibilityLiveRegion="polite">
        <Text style={styles.eyebrow}>CONTENU NON PUBLIÉ</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.body}>
          Aucun cours linguistique n&apos;est distribué dans cette version. Il
          apparaîtra ici seulement après validation de ses sources, de ses
          audits et de ses médias.
        </Text>
        <Pressable
          accessibilityRole="button"
          style={styles.primaryButton}
          onPress={() => router.replace(actionHref)}
        >
          <Text style={styles.primaryText}>{actionLabel}</Text>
        </Pressable>
      </View>
      {activeRoute !== undefined && (
        <MobilePrimaryNavigation activeRoute={activeRoute} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.jasmine },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    justifyContent: "center",
    padding: 28,
  },
  eyebrow: {
    color: colors.coralDeep,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 12,
    color: colors.ink,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800",
  },
  body: {
    marginTop: 14,
    color: colors.inkSoft,
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    minHeight: 52,
    marginTop: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.ink,
  },
  primaryText: { color: "white", fontSize: 16, fontWeight: "800" },
});
