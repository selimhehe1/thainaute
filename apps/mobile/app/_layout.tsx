import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { initializeDatabase } from "../lib/initialize-database";

function DatabaseReady({ onReady }: { readonly onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

type DatabaseStatus = "loading" | "ready" | "error";

export default function RootLayout() {
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
          Vos données existantes n’ont pas été effacées. Réessayez ou mettez
          l’application à jour si le problème persiste.
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
        databaseName="thainaute-local.db"
        onError={handleError}
        onInit={initializeDatabase}
      >
        <DatabaseReady onReady={handleReady} />
        <Stack screenOptions={{ headerShown: false }} />
      </SQLiteProvider>
      {databaseStatus === "loading" && (
        <View style={styles.loading} accessibilityLiveRegion="polite">
          <ActivityIndicator color="#283450" size="large" />
          <Text style={styles.loadingText}>Préparation du stockage local…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fbfaf7" },
  loading: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "#fbfaf7",
  },
  loadingText: { color: "#283450", fontSize: 16, fontWeight: "700" },
  fallback: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#fbfaf7",
  },
  fallbackTitle: { color: "#283450", fontSize: 28, fontWeight: "800" },
  fallbackBody: {
    marginTop: 14,
    color: "#5e6980",
    fontSize: 16,
    lineHeight: 24,
  },
  retryButton: {
    minHeight: 52,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#283450",
  },
  retryText: { color: "white", fontSize: 16, fontWeight: "800" },
});
