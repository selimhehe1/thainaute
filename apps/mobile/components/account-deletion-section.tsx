import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { MobileAccountDeletionState } from "../lib/use-mobile-account-deletion";

export function AccountDeletionSection(props: {
  readonly deletionState: MobileAccountDeletionState;
  readonly disabled: boolean;
  readonly fusionInProgress: boolean;
  readonly pendingAccountAttemptCount: number;
}) {
  const [code, setCode] = useState("");
  const state = props.deletionState;
  const sectionDisabled = props.disabled || state.isBusy;

  return (
    <View
      accessibilityLabelledBy="account-deletion-title"
      style={styles.section}
    >
      <Text
        accessibilityRole="header"
        nativeID="account-deletion-title"
        style={styles.title}
      >
        Supprimer définitivement mon compte
      </Text>
      <Text style={styles.body}>
        La suppression est irréversible : le compte en ligne, sa progression
        synchronisée et ses données associées ne pourront pas être restaurés.
      </Text>
      <Text style={styles.body}>
        Exportez d’abord vos données si vous souhaitez en conserver une copie.
        L’export n’inclut ni les tentatives encore locales, ni les prises de
        voix.
      </Text>
      <Text style={styles.preservedNotice}>
        La progression anonyme, l’onboarding et l’installation de cet appareil
        sont préservés. Toute prise de voix active est fermée avec la session et
        reste privée ; aucune voix n’est envoyée par cette opération.
      </Text>

      {props.pendingAccountAttemptCount > 0 && (
        <Text style={styles.warning}>
          {props.pendingAccountAttemptCount} tentative
          {props.pendingAccountAttemptCount > 1 ? "s" : ""} locale
          {props.pendingAccountAttemptCount > 1 ? "s" : ""} liée
          {props.pendingAccountAttemptCount > 1 ? "s" : ""} au compte{" "}
          {props.pendingAccountAttemptCount > 1 ? "seront" : "sera"} effacée
          {props.pendingAccountAttemptCount > 1 ? "s" : ""}. Synchronisez-les,
          puis relancez l’export si vous souhaitez les conserver avant de
          continuer.
        </Text>
      )}
      <Text style={styles.warning}>
        Les signalements linguistiques conservés localement pour ce compte
        seront aussi effacés, y compris ceux en attente ou refusés. Revenez à la
        leçon avant de continuer si vous souhaitez les envoyer ou résoudre un
        refus.
      </Text>
      {props.fusionInProgress && (
        <Text style={styles.warning}>
          Une fusion locale est encore en cours pour ce compte. Sa copie dans le
          namespace du compte sera effacée ; la progression anonyme source reste
          conservée.
        </Text>
      )}

      {state.status === "idle" && (
        <DangerButton
          disabled={sectionDisabled}
          label="Commencer la suppression du compte"
          onPress={state.beginConfirmation}
        />
      )}

      {state.status === "confirming" && (
        <View style={styles.confirmation}>
          <Text
            accessibilityLiveRegion="polite"
            style={styles.confirmationText}
          >
            {state.message}
          </Text>
          <SecondaryButton
            disabled={sectionDisabled}
            label="Annuler"
            onPress={() => {
              setCode("");
              state.cancelConfirmation();
            }}
          />
          <DangerButton
            disabled={sectionDisabled}
            label="Je comprends, envoyer le code de sécurité"
            onPress={() => {
              setCode("");
              void state.requestReauthenticationCode();
            }}
          />
        </View>
      )}

      {state.status === "awaiting_code" && (
        <View style={styles.confirmation}>
          <Text
            accessibilityLiveRegion="polite"
            style={styles.confirmationText}
          >
            {state.message}
          </Text>
          <Text style={styles.label}>Code de sécurité à six chiffres</Text>
          <TextInput
            accessibilityLabel="Code de sécurité à six chiffres"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            style={styles.input}
            value={code}
            onChangeText={(value) => setCode(value.replace(/\D/gu, ""))}
          />
          {!state.hasPendingOperation && (
            <SecondaryButton
              disabled={sectionDisabled}
              label="Annuler"
              onPress={() => {
                setCode("");
                state.cancelConfirmation();
              }}
            />
          )}
          <DangerButton
            disabled={sectionDisabled}
            label="Supprimer définitivement mon compte"
            onPress={() => void state.verifyCodeAndDelete(code)}
          />
        </View>
      )}

      {(state.status === "checking" ||
        state.status === "sending_code" ||
        state.status === "deleting") && (
        <Text accessibilityLiveRegion="polite" style={styles.status}>
          {state.message}
        </Text>
      )}

      {state.status === "success" && (
        <Text accessibilityLiveRegion="polite" style={styles.success}>
          {state.message}
        </Text>
      )}

      {state.status === "error" && (
        <View style={styles.confirmation}>
          <Text
            accessibilityLiveRegion="assertive"
            accessibilityRole="alert"
            style={styles.error}
          >
            {state.message}
          </Text>
          {state.needsReauthentication && state.canReauthenticate && (
            <DangerButton
              disabled={sectionDisabled}
              label="Recevoir un nouveau code de sécurité"
              onPress={() => {
                setCode("");
                void state.requestReauthenticationCode();
              }}
            />
          )}
          {state.retryable && (
            <SecondaryButton
              disabled={sectionDisabled}
              label="Reprendre la même suppression"
              onPress={() => void state.retry()}
            />
          )}
          {!state.hasPendingOperation && (
            <SecondaryButton
              disabled={sectionDisabled}
              label="Revenir sans supprimer"
              onPress={state.cancelConfirmation}
            />
          )}
        </View>
      )}
    </View>
  );
}

function DangerButton(props: {
  readonly disabled: boolean;
  readonly label: string;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: props.disabled }}
      disabled={props.disabled}
      style={[styles.dangerButton, props.disabled && styles.disabled]}
      onPress={props.onPress}
    >
      <Text style={styles.dangerButtonText}>{props.label}</Text>
    </Pressable>
  );
}

function SecondaryButton(props: {
  readonly disabled: boolean;
  readonly label: string;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: props.disabled }}
      disabled={props.disabled}
      style={[styles.secondaryButton, props.disabled && styles.disabled]}
      onPress={props.onPress}
    >
      <Text style={styles.secondaryButtonText}>{props.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d88782",
    borderRadius: 18,
    backgroundColor: "#fffafa",
  },
  title: { color: "#71302c", fontSize: 20, lineHeight: 27, fontWeight: "800" },
  body: { marginTop: 12, color: "#536078", fontSize: 15, lineHeight: 22 },
  preservedNotice: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    color: "#225c4a",
    backgroundColor: "#eff9f5",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  warning: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    color: "#6d4c12",
    backgroundColor: "#fff8e8",
    fontSize: 14,
    lineHeight: 21,
  },
  confirmation: { marginTop: 16 },
  confirmationText: { color: "#71302c", fontSize: 14, lineHeight: 21 },
  label: { marginTop: 16, color: "#283450", fontSize: 13, fontWeight: "800" },
  input: {
    minHeight: 52,
    marginTop: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#d88782",
    borderRadius: 14,
    color: "#283450",
    backgroundColor: "white",
    fontSize: 20,
    letterSpacing: 4,
  },
  dangerButton: {
    minHeight: 48,
    marginTop: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#8e332e",
  },
  dangerButtonText: {
    color: "white",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
    textAlign: "center",
  },
  secondaryButton: {
    minHeight: 48,
    marginTop: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#cbd0d8",
    borderRadius: 999,
    backgroundColor: "white",
  },
  secondaryButtonText: {
    color: "#283450",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
    textAlign: "center",
  },
  disabled: { opacity: 0.5 },
  status: { marginTop: 16, color: "#536078", fontSize: 14, lineHeight: 21 },
  success: {
    marginTop: 16,
    color: "#225c4a",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  error: {
    color: "#8e332e",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
});
