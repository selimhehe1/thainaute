import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccountExportSection } from "../components/account-export-section";
import { AccountDeletionSection } from "../components/account-deletion-section";
import {
  discardMobileAnonymousProgress,
  purgeMobileAccountData,
  readMobileAccountLocalState,
  synchronizeMobileAccount,
} from "../lib/account-sync";
import { useMobileAuthSession } from "../lib/auth-session";
import { assertNoPendingMobileAccountDeletion } from "../lib/mobile-account-deletion";
import { useMobileAccountExport } from "../lib/use-mobile-account-export";
import { useMobileAccountDeletion } from "../lib/use-mobile-account-deletion";

type LocalState = Awaited<ReturnType<typeof readMobileAccountLocalState>>;

function accountLocalStateForUser(
  localState: LocalState | null,
  userId: string | null,
): LocalState | null {
  if (
    userId === null ||
    localState?.accountSnapshot.owner.kind !== "account" ||
    localState.accountSnapshot.owner.userId !== userId.toLowerCase()
  ) {
    return null;
  }
  return localState;
}

export default function AccountScreen() {
  const database = useSQLiteContext();
  const auth = useMobileAuthSession();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [localState, setLocalState] = useState<LocalState | null>(null);
  const [logoutConfirmationUserId, setLogoutConfirmationUserId] = useState<
    string | null
  >(null);
  const [deletionConfirmationUserId, setDeletionConfirmationUserId] = useState<
    string | null
  >(null);
  const userId = auth.session?.user.id ?? null;
  const accountExport = useMobileAccountExport({
    expectedUserId: userId,
    platform: Platform.OS === "ios" ? "ios" : "android",
    sessionBoundaryRevision: auth.sessionBoundaryRevision,
  });
  const accountDeletion = useMobileAccountDeletion({
    database,
    currentUserId: userId,
    platform: Platform.OS === "ios" ? "ios" : "android",
    clearDeletedSession: auth.clearDeletedSession,
    requestReauthenticationCode:
      auth.requestAccountDeletionReauthenticationCode,
    verifyReauthenticationCode: auth.verifyAccountDeletionReauthenticationCode,
  });
  const accountOperationBusy =
    busy ||
    accountExport.isBusy ||
    accountDeletion.isBusy ||
    (accountDeletion.hasPendingOperation &&
      accountDeletion.pendingTargetsCurrentUser);
  const currentLocalState = accountLocalStateForUser(localState, userId);

  const refreshLocalState = useCallback(async () => {
    if (userId === null) {
      setLocalState(null);
      return;
    }
    setLocalState(await readMobileAccountLocalState(database, userId));
  }, [database, userId]);

  useEffect(() => {
    let active = true;
    if (userId === null) return;
    void readMobileAccountLocalState(database, userId)
      .then((value) => {
        if (active) setLocalState(value);
      })
      .catch(() => {
        if (active) setMessage("Le stockage local est indisponible.");
      });
    return () => {
      active = false;
    };
  }, [database, userId]);

  useEffect(() => {
    if (auth.status === "loading") return;
    let active = true;
    const timeout = setTimeout(() => {
      if (!active) return;
      setEmail("");
      setCode("");
      setCodeRequested(false);
      setLogoutConfirmationUserId(null);
      setDeletionConfirmationUserId(null);
    }, 0);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [auth.status, userId]);

  async function requestCode() {
    if (!/^\S+@\S+\.\S+$/u.test(email.trim())) {
      setMessage("Saisissez une adresse email valide.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await auth.requestEmailCode(email);
      setCodeRequested(true);
      setMessage("Code envoyé. Il expire rapidement.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Envoi impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    if (!/^\d{6}$/u.test(code.trim())) {
      setMessage("Le code doit contenir exactement six chiffres.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await auth.verifyEmailCode(email, code);
      setEmail("");
      setCode("");
      setCodeRequested(false);
      setMessage("Compte connecté sur cet appareil.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Connexion impossible.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function synchronize(startAnonymousFusion: boolean) {
    if (userId === null) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await synchronizeMobileAccount({
        database,
        userId,
        startAnonymousFusion,
        assertAccountWritable: () =>
          assertNoPendingMobileAccountDeletion(userId),
      });
      await refreshLocalState();
      setMessage(
        result.fusionCompleted && result.fusionRejectedCount > 0
          ? `${result.fusionRejectedCount} tentative${result.fusionRejectedCount > 1 ? "s" : ""} non importable${result.fusionRejectedCount > 1 ? "s" : ""} ${result.fusionRejectedCount > 1 ? "sont conservées" : "est conservée"} localement.`
          : result.fusionCompleted
            ? "Progression fusionnée et synchronisée."
            : "Progression du compte synchronisée.",
      );
    } catch {
      setMessage(
        "La synchronisation n’a pas abouti. Les tentatives restent sur cet appareil.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function discardAnonymous() {
    if (userId === null) return;
    if (deletionConfirmationUserId !== userId) {
      setDeletionConfirmationUserId(userId);
      setMessage(
        "Appuyez encore une fois pour confirmer la suppression locale.",
      );
      return;
    }
    setBusy(true);
    try {
      await discardMobileAnonymousProgress(database);
      await refreshLocalState();
      setDeletionConfirmationUserId(null);
      setMessage("Progression anonyme supprimée de cet appareil.");
    } catch {
      setMessage("La progression locale n’a pas été supprimée.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (userId === null) return;
    try {
      await assertNoPendingMobileAccountDeletion(userId);
    } catch {
      setMessage(
        "Terminez d’abord la suppression en attente avant de vous déconnecter.",
      );
      return;
    }
    const logoutState = currentLocalState;
    if (logoutState === null) return;
    const pending = logoutState.accountSnapshot.entries.filter(
      ({ status }) => status === "pending",
    ).length;
    const activeFusion =
      logoutState.fusionMarker?.status === "awaiting_server_ack" &&
      logoutState.fusionMarker.targetUserId === userId.toLowerCase();
    if ((pending > 0 || activeFusion) && logoutConfirmationUserId !== userId) {
      setLogoutConfirmationUserId(userId);
      setMessage(
        "Des tentatives ne sont pas encore synchronisées. Synchronisez-les ou confirmez leur effacement uniquement sur cet appareil. Votre compte reste en ligne.",
      );
      return;
    }

    setBusy(true);
    let signedOut = false;
    try {
      await auth.signOutLocal(userId);
      signedOut = true;
      const purged = await purgeMobileAccountData(database, userId, {
        snapshot: logoutState.accountSnapshot,
        fusionMarker: logoutState.fusionMarker,
      });
      setLocalState(null);
      setLogoutConfirmationUserId(null);
      setDeletionConfirmationUserId(null);
      setEmail("");
      setCode("");
      setCodeRequested(false);
      setMessage(
        purged
          ? "Vous êtes déconnecté de cet appareil. Les données locales liées à ce compte ont été effacées ; le compte et sa progression synchronisée restent en ligne."
          : "Vous êtes déconnecté de cet appareil. Le journal local a changé : ses nouvelles données restent verrouillées jusqu’à la reconnexion au même compte.",
      );
    } catch {
      if (signedOut) {
        setLocalState(null);
        setMessage(
          "Vous êtes déconnecté de cet appareil. Les données locales restent verrouillées jusqu’à la reconnexion au même compte.",
        );
      } else {
        setMessage(
          "La session a changé ou la déconnexion a échoué. Aucune donnée locale n’a été supprimée.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  const anonymousEntries = currentLocalState?.anonymousSnapshot.entries ?? [];
  const anonymousImportableCount = anonymousEntries.filter(
    ({ status }) => status !== "rejected",
  ).length;
  const anonymousRejectedCount =
    anonymousEntries.length - anonymousImportableCount;
  const accountPendingCount =
    currentLocalState?.accountSnapshot.entries.filter(
      ({ status }) => status === "pending",
    ).length ?? 0;
  const activeFusionForCurrent =
    currentLocalState?.fusionMarker?.status === "awaiting_server_ack" &&
    currentLocalState.fusionMarker.targetUserId === userId?.toLowerCase();
  const activeFusionForAnotherAccount =
    currentLocalState?.fusionMarker?.status === "awaiting_server_ack" &&
    currentLocalState.fusionMarker.targetUserId !== userId?.toLowerCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brand}>Thaïnaute</Text>
        <Link href="/" asChild>
          <Pressable accessibilityRole="button" style={styles.backButton}>
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
        </Link>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {auth.status === "loading" && (
          <Text accessibilityLiveRegion="polite">
            Vérification de la session…
          </Text>
        )}

        {auth.status === "unconfigured" && (
          <View style={styles.card} accessibilityLiveRegion="polite">
            <Text style={styles.title}>Compte non configuré ici</Text>
            <Text style={styles.body}>
              Cette build locale reste utilisable hors ligne sans compte.
            </Text>
          </View>
        )}

        {auth.status === "signed_out" && (
          <View style={styles.card}>
            <Text style={styles.eyebrow}>APRÈS UNE PREMIÈRE RÉUSSITE</Text>
            <Text style={styles.title}>Retrouver sa progression partout.</Text>
            <Text style={styles.body}>
              Un code à six chiffres suffit. Aucune fusion n’est implicite. Une
              progression non synchronisée reste verrouillée après une
              expiration distante jusqu’à la reconnexion au même compte.
            </Text>
            {!codeRequested ? (
              <>
                <Text style={styles.label}>Adresse email</Text>
                <TextInput
                  accessibilityLabel="Adresse email"
                  autoCapitalize="none"
                  autoComplete="email"
                  inputMode="email"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                />
                <ActionButton
                  disabled={busy}
                  label={busy ? "Envoi…" : "Recevoir mon code"}
                  onPress={() => void requestCode()}
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Code reçu par email</Text>
                <TextInput
                  accessibilityLabel="Code à six chiffres"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={6}
                  style={styles.input}
                  value={code}
                  onChangeText={setCode}
                />
                <ActionButton
                  disabled={busy}
                  label={busy ? "Vérification…" : "Me connecter"}
                  onPress={() => void verifyCode()}
                />
              </>
            )}
          </View>
        )}

        {auth.status === "signed_in" && (
          <View style={styles.card}>
            <Text style={styles.eyebrow}>COMPTE CONNECTÉ</Text>
            <Text style={styles.title}>Votre progression, sous contrôle.</Text>
            <View style={styles.metrics} accessibilityLiveRegion="polite">
              <Metric
                label="états synchronisés"
                value={
                  currentLocalState?.accountSnapshot.authoritativeStates
                    .length ?? 0
                }
              />
              <Metric
                label="tentatives compte en attente"
                value={accountPendingCount}
              />
              <Metric
                label="tentatives anonymes"
                value={anonymousEntries.length}
              />
            </View>
            {activeFusionForAnotherAccount && (
              <View style={styles.choice}>
                <Text style={styles.choiceTitle}>
                  Fusion locale déjà engagée
                </Text>
                <Text style={styles.body}>
                  Reconnectez le compte qui l’a commencée pour la terminer. Ce
                  compte peut synchroniser sa propre progression.
                </Text>
              </View>
            )}
            {anonymousEntries.length > 0 &&
              !activeFusionForCurrent &&
              !activeFusionForAnotherAccount && (
                <View style={styles.choice}>
                  <Text style={styles.choiceTitle}>
                    Progression locale détectée
                  </Text>
                  <Text style={styles.body}>
                    Le serveur recalculera la maîtrise après la fusion.
                  </Text>
                  {anonymousImportableCount > 0 && (
                    <ActionButton
                      disabled={accountOperationBusy}
                      label="Fusionner et synchroniser"
                      onPress={() => void synchronize(true)}
                    />
                  )}
                  <SecondaryButton
                    disabled={accountOperationBusy}
                    label={
                      deletionConfirmationUserId === userId
                        ? "Confirmer la suppression locale"
                        : "Supprimer la progression locale"
                    }
                    danger
                    onPress={() => void discardAnonymous()}
                  />
                  {anonymousRejectedCount > 0 && (
                    <Text style={styles.message}>
                      {anonymousRejectedCount} tentative
                      {anonymousRejectedCount > 1 ? "s" : ""} non importable
                      {anonymousRejectedCount > 1 ? "s" : ""} conservée
                      {anonymousRejectedCount > 1 ? "s" : ""} localement.
                    </Text>
                  )}
                </View>
              )}
            <ActionButton
              disabled={accountOperationBusy}
              label={busy ? "Synchronisation…" : "Synchroniser maintenant"}
              onPress={() => void synchronize(false)}
            />
            <AccountExportSection
              anonymousAttemptCount={anonymousEntries.length}
              disabled={accountOperationBusy}
              exportState={accountExport}
              fusionInProgress={activeFusionForCurrent}
              pendingAccountAttemptCount={accountPendingCount}
            />
            <SecondaryButton
              danger={logoutConfirmationUserId === userId}
              disabled={accountOperationBusy || currentLocalState === null}
              label={
                logoutConfirmationUserId === userId
                  ? "Effacer les données locales liées à ce compte et me déconnecter"
                  : "Me déconnecter de cet appareil"
              }
              onPress={() => void logout()}
            />
            <AccountDeletionSection
              deletionState={accountDeletion}
              disabled={busy || accountExport.isBusy}
              fusionInProgress={activeFusionForCurrent}
              pendingAccountAttemptCount={accountPendingCount}
            />
          </View>
        )}

        {auth.status !== "signed_in" &&
          (accountDeletion.status !== "idle" ||
            accountDeletion.hasPendingOperation) && (
            <View style={styles.card}>
              <AccountDeletionSection
                deletionState={accountDeletion}
                disabled={busy || accountExport.isBusy}
                fusionInProgress={false}
                pendingAccountAttemptCount={0}
              />
            </View>
          )}

        {message !== "" && (
          <Text accessibilityLiveRegion="polite" style={styles.message}>
            {message}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton(props: {
  readonly label: string;
  readonly disabled: boolean;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: props.disabled }}
      disabled={props.disabled}
      style={[styles.primaryButton, props.disabled && styles.disabled]}
      onPress={props.onPress}
    >
      <Text style={styles.primaryText}>{props.label}</Text>
    </Pressable>
  );
}

function SecondaryButton(props: {
  readonly label: string;
  readonly disabled: boolean;
  readonly danger?: boolean;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: props.disabled }}
      disabled={props.disabled}
      style={[
        styles.secondaryButton,
        props.danger && styles.dangerButton,
        props.disabled && styles.disabled,
      ]}
      onPress={props.onPress}
    >
      <Text style={[styles.secondaryText, props.danger && styles.dangerText]}>
        {props.label}
      </Text>
    </Pressable>
  );
}

function Metric(props: { readonly label: string; readonly value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{props.value}</Text>
      <Text style={styles.metricLabel}>{props.label}</Text>
    </View>
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
  brand: { color: "#283450", fontSize: 18, fontWeight: "800" },
  backButton: {
    minWidth: 64,
    minHeight: 44,
    marginLeft: "auto",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: "#283450", fontWeight: "700" },
  content: { flexGrow: 1, padding: 20, paddingBottom: 48 },
  card: {
    width: "100%",
    maxWidth: 680,
    padding: 24,
    alignSelf: "center",
    borderRadius: 24,
    backgroundColor: "white",
  },
  eyebrow: {
    marginBottom: 14,
    color: "#43a283",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: { color: "#283450", fontSize: 36, lineHeight: 42, fontWeight: "800" },
  body: { marginTop: 14, color: "#5e6980", fontSize: 16, lineHeight: 24 },
  label: { marginTop: 24, color: "#283450", fontSize: 13, fontWeight: "800" },
  input: {
    minHeight: 52,
    marginTop: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#eef1f4",
    borderRadius: 14,
    color: "#283450",
    backgroundColor: "white",
  },
  primaryButton: {
    minHeight: 52,
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#283450",
  },
  primaryText: { color: "white", fontSize: 16, fontWeight: "800" },
  secondaryButton: {
    minHeight: 48,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#cbd0d8",
    borderRadius: 999,
  },
  secondaryText: { color: "#283450", fontWeight: "700" },
  dangerButton: { borderColor: "#d88782", backgroundColor: "#fff5f4" },
  dangerText: { color: "#8e332e" },
  disabled: { opacity: 0.5 },
  metrics: { marginTop: 24, gap: 10 },
  metric: { padding: 18, borderRadius: 16, backgroundColor: "#eef1f4" },
  metricValue: { color: "#43a283", fontSize: 28, fontWeight: "800" },
  metricLabel: { marginTop: 5, color: "#677187", fontSize: 12 },
  choice: {
    marginTop: 22,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#eff9f5",
  },
  choiceTitle: { color: "#283450", fontSize: 20, fontWeight: "800" },
  message: {
    maxWidth: 680,
    marginTop: 18,
    alignSelf: "center",
    color: "#536078",
    lineHeight: 21,
  },
});
