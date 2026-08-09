import { useFonts } from "expo-font";
import { Navigator, Slot } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { colors } from "@thainaute/design-tokens";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { MobileAccountDeletionBootstrap } from "../lib/account-deletion-bootstrap";
import { MobileAnalyticsBootstrap } from "../lib/analytics-provider";
import { MobileAuthSessionProvider } from "../lib/auth-session";
import { embeddedThaiFonts } from "../lib/embedded-thai-fonts";
import { initializeDatabase } from "../lib/initialize-database";
import { purgeMobileAccountExportCache } from "../lib/mobile-account-export";
import {
  getActiveMobileLanguagePack,
  getMobileDatabaseName,
} from "../lib/mobile-language-pack";

function DatabaseReady({ onReady }: { readonly onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

type DatabaseStatus = "loading" | "ready" | "error";

function MobileDatabaseContent({ children }: { readonly children: ReactNode }) {
  const languagePack = getActiveMobileLanguagePack();
  const targetFonts =
    languagePack.typography.targetFontFamily === "thai"
      ? embeddedThaiFonts
      : {};
  const [thaiFontsLoaded, thaiFontError] = useFonts(targetFonts);

  if (thaiFontError !== null) {
    return (
      <View style={styles.fallback} accessibilityLiveRegion="assertive">
        <Text style={styles.fallbackTitle}>Ressources locales incomplètes</Text>
        <Text style={styles.fallbackBody}>
          La police thaï embarquée n&apos;a pas pu être chargée. Mettez
          l&apos;application à jour avant de commencer une leçon.
        </Text>
      </View>
    );
  }

  if (!thaiFontsLoaded) {
    return (
      <View style={styles.loading} accessibilityLiveRegion="polite">
        <ActivityIndicator color={colors.coral} size="large" />
        <Text style={styles.loadingText}>
          Préparation des ressources locales…
        </Text>
      </View>
    );
  }

  return (
    <MobileAnalyticsBootstrap>
      <MobileAuthSessionProvider>
        <MobileAccountDeletionBootstrap />
        {children}
      </MobileAuthSessionProvider>
    </MobileAnalyticsBootstrap>
  );
}

function MobileRouteProviders({ children }: { readonly children: ReactNode }) {
  const [providerKey, setProviderKey] = useState(0);
  const [databaseStatus, setDatabaseStatus] =
    useState<DatabaseStatus>("loading");
  const errorQueued = useRef(false);

  const handleReady = useCallback(() => {
    errorQueued.current = false;
    setDatabaseStatus("ready");
  }, []);

  const handleError = useCallback((_error: Error) => {
    if (errorQueued.current) return;
    errorQueued.current = true;
    setTimeout(() => setDatabaseStatus("error"), 0);
  }, []);

  if (databaseStatus === "error") {
    return (
      <View style={styles.fallback} accessibilityLiveRegion="assertive">
        <Text style={styles.fallbackTitle}>Stockage local indisponible</Text>
        <Text style={styles.fallbackBody}>
          Vos données existantes n&apos;ont pas été effacées. Réessayez ou
          mettez l&apos;application à jour si le problème persiste.
        </Text>
        <Pressable
          accessibilityRole="button"
          style={styles.retryButton}
          onPress={() => {
            errorQueued.current = false;
            setDatabaseStatus("loading");
            setProviderKey((current) => current + 1);
          }}
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SQLiteProvider
        key={providerKey}
        databaseName={getMobileDatabaseName()}
        onError={handleError}
        onInit={initializeDatabase}
      >
        <DatabaseReady onReady={handleReady} />
        <MobileDatabaseContent>{children}</MobileDatabaseContent>
      </SQLiteProvider>
      {databaseStatus === "loading" && (
        <View style={styles.loading} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.coral} size="large" />
          <Text style={styles.loadingText}>
            Préparation des ressources locales…
          </Text>
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    try {
      purgeMobileAccountExportCache();
    } catch {
      // La purge ciblee sera retentee au prochain export.
    }
  }, []);

  return (
    <Navigator screenOptions={{ headerShown: false }}>
      <Navigator.Screen name="account" />
      <Navigator.Screen name="audio-expedition" />
      <Navigator.Screen name="connected-lesson" />
      <Navigator.Screen name="index" />
      <Navigator.Screen name="lesson" />
      <Navigator.Screen name="mechanics-expedition" />
      <Navigator.Screen name="mobile-lesson-expedition" />
      <Navigator.Screen name="onboarding" />
      <Navigator.Screen name="path" />
      <Navigator.Screen name="practice" />
      <Navigator.Screen name="pilot-lesson" />
      <Navigator.Screen name="privacy" />
      <Navigator.Screen name="progress" />
      <Navigator.Screen name="unit-01" />
      <MobileRouteProviders>
        <Slot />
      </MobileRouteProviders>
    </Navigator>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.jasmine },
  loading: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: colors.jasmine,
  },
  loadingText: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  fallback: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    padding: 28,
    backgroundColor: colors.jasmine,
  },
  fallbackTitle: { color: colors.ink, fontSize: 28, fontWeight: "800" },
  fallbackBody: {
    marginTop: 14,
    color: colors.inkSoft,
    fontSize: 16,
    lineHeight: 24,
  },
  retryButton: {
    minHeight: 52,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.coral,
  },
  retryText: { color: "white", fontSize: 16, fontWeight: "800" },
});
