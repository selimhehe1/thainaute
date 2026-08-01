import { Pressable, StyleSheet, Text, View } from "react-native";

import type { MobileAccountExportState } from "../lib/use-mobile-account-export";

export function AccountExportSection(props: {
  readonly anonymousAttemptCount: number;
  readonly disabled: boolean;
  readonly exportState: MobileAccountExportState;
  readonly fusionInProgress: boolean;
  readonly pendingAccountAttemptCount: number;
}) {
  const buttonDisabled = props.disabled || props.exportState.isBusy;
  const buttonLabel = props.exportState.isBusy
    ? "Préparation du fichier JSON…"
    : "Enregistrer ou partager mon export JSON";

  return (
    <View style={styles.section} accessibilityLabelledBy="account-export-title">
      <Text
        accessibilityRole="header"
        nativeID="account-export-title"
        style={styles.title}
      >
        Exporter les données de mon compte
      </Text>
      <Text style={styles.body}>
        Le fichier JSON contient l’identité du compte, les appareils
        enregistrés, les tentatives et la progression déjà synchronisées.
      </Text>
      <Text style={styles.body}>
        Il n’inclut ni progression anonyme, ni tentative encore locale, ni prise
        de voix. Vos voix restent uniquement sur cet appareil.
      </Text>
      <Text style={styles.sensitiveNotice}>
        Ce fichier peut contenir votre adresse e-mail ou votre numéro de
        téléphone. Conservez-le dans un emplacement sûr.
      </Text>

      {props.pendingAccountAttemptCount > 0 && (
        <Text style={styles.localWarning}>
          {props.pendingAccountAttemptCount} tentative
          {props.pendingAccountAttemptCount > 1 ? "s" : ""} de ce compte ne
          {props.pendingAccountAttemptCount > 1 ? " figurent" : " figure"} pas
          encore dans l’export. Synchronisez d’abord pour
          {props.pendingAccountAttemptCount > 1
            ? " les inclure."
            : " l’inclure."}
        </Text>
      )}
      {props.anonymousAttemptCount > 0 && (
        <Text style={styles.localWarning}>
          La progression anonyme de cet appareil n’appartient pas encore au
          compte et ne figurera pas dans l’export.
        </Text>
      )}
      {props.fusionInProgress && (
        <Text style={styles.localWarning}>
          Une fusion locale est en cours. Terminez la synchronisation avant
          l’export pour obtenir une copie complète du compte.
        </Text>
      )}

      <Pressable
        accessibilityHint="Prépare un fichier JSON puis ouvre la feuille système pour l’enregistrer ou le partager."
        accessibilityLabel={buttonLabel}
        accessibilityRole="button"
        accessibilityState={{
          busy: props.exportState.isBusy,
          disabled: buttonDisabled,
        }}
        disabled={buttonDisabled}
        style={[styles.button, buttonDisabled && styles.disabled]}
        onPress={() => void props.exportState.exportAccount()}
      >
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </Pressable>

      {props.exportState.message !== "" && (
        <Text
          accessibilityLiveRegion="polite"
          accessibilityRole={
            props.exportState.status === "error" ? "alert" : "text"
          }
          style={[
            styles.status,
            props.exportState.status === "error" && styles.error,
          ]}
        >
          {props.exportState.message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#cbd0d8",
    borderRadius: 18,
    backgroundColor: "#f8f9fa",
  },
  title: { color: "#283450", fontSize: 20, lineHeight: 27, fontWeight: "800" },
  body: { marginTop: 12, color: "#536078", fontSize: 15, lineHeight: 22 },
  sensitiveNotice: {
    marginTop: 12,
    color: "#283450",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  localWarning: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    color: "#6d4c12",
    backgroundColor: "#fff8e8",
    fontSize: 14,
    lineHeight: 21,
  },
  button: {
    minHeight: 48,
    marginTop: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#283450",
    borderRadius: 999,
    backgroundColor: "white",
  },
  buttonText: {
    color: "#283450",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
    textAlign: "center",
  },
  disabled: { opacity: 0.5 },
  status: { marginTop: 14, color: "#536078", fontSize: 14, lineHeight: 21 },
  error: { color: "#8e332e", fontWeight: "700" },
});
