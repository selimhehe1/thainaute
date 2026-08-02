import type { AnalyticsSink } from "@thainaute/analytics";
import {
  CONTENT_REPORT_CATEGORIES,
  countPendingContentReports,
  type ContentReportCategory,
  type ContentReportOutboxRejection,
} from "@thainaute/sync";
import { Link } from "expo-router";
import { useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useMobileAuthSession } from "../lib/auth-session";
import {
  discardRejectedMobileContentReport,
  readMobileContentReports,
  submitMobileContentReport,
  synchronizeMobileContentReports,
} from "../lib/content-report";

const CATEGORY_LABELS: Readonly<Record<ContentReportCategory, string>> = {
  orthography: "Orthographe",
  meaning: "Sens ou traduction",
  pronunciation: "Prononciation",
  tone: "Ton",
  vowel_length: "Longueur vocalique",
  register: "Registre",
  naturalness: "Naturalité",
  audio: "Audio",
};

type ReportStatus =
  "idle" | "loading" | "submitting" | "queued" | "rejected" | "sent" | "error";

function rejectedMessage(rejection: ContentReportOutboxRejection): string {
  return rejection.reason === "invalid_request"
    ? "Ce signalement a été refusé définitivement : le contenu ou sa version n’est plus accepté. Il reste conservé jusqu’à votre retrait explicite."
    : "Ce signalement a été refusé définitivement à cause d’un conflit de reprise. Il reste conservé jusqu’à votre retrait explicite.";
}

function captureReported(analytics: AnalyticsSink, count = 1): void {
  try {
    for (let index = 0; index < count; index += 1) {
      analytics.capture({
        name: "content_reported",
        platform: Platform.OS === "ios" ? "ios" : "android",
      });
    }
  } catch {
    // La mesure consentie reste facultative et ne bloque jamais l'accusé.
  }
}

interface MobileContentReportPanelProps {
  readonly analytics: AnalyticsSink;
  readonly contentVersionId: string;
  readonly exerciseId: string;
  /** Force seulement l'absence de tentative réseau dans les tests/scénarios. */
  readonly attemptDelivery?: boolean;
}

export function MobileContentReportPanel(props: MobileContentReportPanelProps) {
  const database = useSQLiteContext();
  const auth = useMobileAuthSession();
  const userId =
    auth.status === "signed_in" ? (auth.session?.user.id ?? null) : null;

  return (
    <MobileContentReportPanelForSession
      {...props}
      database={database}
      key={`${auth.sessionBoundaryRevision}:${userId ?? auth.status}`}
      userId={userId}
    />
  );
}

function MobileContentReportPanelForSession({
  analytics,
  attemptDelivery = true,
  contentVersionId,
  database,
  exerciseId,
  userId,
}: {
  readonly analytics: AnalyticsSink;
  readonly attemptDelivery?: boolean;
  readonly contentVersionId: string;
  readonly database: SQLiteDatabase;
  readonly exerciseId: string;
  readonly userId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ContentReportCategory | null>(null);
  const [status, setStatus] = useState<ReportStatus>("idle");
  const [message, setMessage] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedHead, setRejectedHead] =
    useState<ContentReportOutboxRejection | null>(null);
  const operationRevision = useRef(0);

  useEffect(() => {
    if (userId === null) return;
    let active = true;
    const revision = operationRevision.current;

    async function resumeDurableReports(): Promise<void> {
      setStatus("loading");
      setMessage("Vérification des signalements conservés…");
      try {
        const persisted = await readMobileContentReports({
          database,
          expectedUserId: userId as string,
        });
        if (!active || revision !== operationRevision.current) return;
        setPendingCount(countPendingContentReports(persisted));
        setRejectedHead(persisted.rejection);
        if (persisted.entries.length === 0) {
          setStatus("idle");
          setMessage("");
          return;
        }
        if (persisted.rejection !== null) {
          setStatus("rejected");
          setMessage(rejectedMessage(persisted.rejection));
          return;
        }
        if (!attemptDelivery) {
          setStatus("queued");
          setMessage(
            `${persisted.entries.length} signalement${persisted.entries.length > 1 ? "s" : ""} conservé${persisted.entries.length > 1 ? "s" : ""} hors ligne.`,
          );
          return;
        }

        try {
          const synchronized = await synchronizeMobileContentReports({
            database,
            expectedUserId: userId as string,
          });
          if (!active || revision !== operationRevision.current) return;
          setPendingCount(synchronized.pendingCount);
          setRejectedHead(synchronized.rejectedHead);
          captureReported(
            analytics,
            synchronized.acknowledgedIdempotencyKeys.length,
          );
          if (synchronized.rejectedHead !== null) {
            setStatus("rejected");
            setMessage(rejectedMessage(synchronized.rejectedHead));
          } else {
            setStatus(synchronized.pendingCount === 0 ? "sent" : "queued");
            setMessage(
              synchronized.pendingCount === 0
                ? "Les signalements en attente ont été envoyés. Merci."
                : "Certains signalements restent conservés sur cet appareil.",
            );
          }
        } catch {
          if (!active || revision !== operationRevision.current) return;
          setStatus("queued");
          setMessage(
            "Hors ligne ou service indisponible : les signalements restent conservés sur cet appareil.",
          );
        }
      } catch {
        if (!active || revision !== operationRevision.current) return;
        setStatus("error");
        setMessage(
          "La file locale de signalements est indisponible. Réessayez sans recréer le signalement.",
        );
      }
    }

    void resumeDurableReports();
    return () => {
      active = false;
    };
  }, [analytics, attemptDelivery, database, userId]);

  async function submit(): Promise<void> {
    if (userId === null || category === null) return;
    const revision = ++operationRevision.current;
    setStatus("submitting");
    setMessage(
      attemptDelivery
        ? "Tentative d’envoi du signalement…"
        : "Conservation hors ligne…",
    );
    try {
      const result = await submitMobileContentReport({
        database,
        expectedUserId: userId,
        contentVersionId,
        exerciseId,
        category,
        attemptDelivery,
      });
      if (revision !== operationRevision.current) return;
      setPendingCount(result.pendingCount);
      if (result.status === "sent") {
        setRejectedHead(null);
        captureReported(analytics);
        setStatus("sent");
        setMessage("Signalement envoyé. Merci d’aider à améliorer Thaïnaute.");
        setCategory(null);
      } else if (result.status === "rejected") {
        setRejectedHead(result.rejectedHead);
        setStatus("rejected");
        setMessage(rejectedMessage(result.rejectedHead));
      } else {
        setRejectedHead(
          result.reason === "blocked_by_rejected" ? result.rejectedHead : null,
        );
        if (result.reason === "blocked_by_rejected") {
          setStatus("rejected");
          setMessage(rejectedMessage(result.rejectedHead));
          return;
        }
        setStatus("queued");
        setMessage(
          result.reason === "offline"
            ? "Signalement conservé hors ligne. Il sera renvoyé avec ce compte après reconnexion."
            : "Hors ligne ou service indisponible : le signalement reste conservé sur cet appareil.",
        );
      }
    } catch {
      if (revision !== operationRevision.current) return;
      setStatus("error");
      setMessage(
        "Le signalement n’a pas pu être conservé. Vérifiez la session et réessayez.",
      );
    }
  }

  async function retry(): Promise<void> {
    if (userId === null || !attemptDelivery) return;
    const revision = ++operationRevision.current;
    setStatus("loading");
    setMessage("Nouvelle tentative d’envoi…");
    try {
      const synchronized = await synchronizeMobileContentReports({
        database,
        expectedUserId: userId,
      });
      if (revision !== operationRevision.current) return;
      setPendingCount(synchronized.pendingCount);
      setRejectedHead(synchronized.rejectedHead);
      captureReported(
        analytics,
        synchronized.acknowledgedIdempotencyKeys.length,
      );
      if (synchronized.rejectedHead !== null) {
        setStatus("rejected");
        setMessage(rejectedMessage(synchronized.rejectedHead));
      } else {
        setStatus(synchronized.pendingCount === 0 ? "sent" : "queued");
        setMessage(
          synchronized.pendingCount === 0
            ? "Signalement envoyé. Merci d’aider à améliorer Thaïnaute."
            : "Des signalements restent conservés sur cet appareil.",
        );
      }
    } catch {
      if (revision !== operationRevision.current) return;
      setStatus("queued");
      setMessage(
        "L’envoi n’a pas abouti. Le signalement reste conservé sur cet appareil.",
      );
    }
  }

  async function discardRejected(): Promise<void> {
    if (userId === null || rejectedHead === null) return;
    const revision = ++operationRevision.current;
    setStatus("loading");
    setMessage("Retrait explicite du signalement refusé…");
    try {
      const synchronized = await discardRejectedMobileContentReport({
        database,
        expectedUserId: userId,
        rejection: rejectedHead,
        attemptDelivery,
      });
      if (revision !== operationRevision.current) return;
      setPendingCount(synchronized.pendingCount);
      setRejectedHead(synchronized.rejectedHead);
      captureReported(
        analytics,
        synchronized.acknowledgedIdempotencyKeys.length,
      );
      if (synchronized.rejectedHead !== null) {
        setStatus("rejected");
        setMessage(rejectedMessage(synchronized.rejectedHead));
      } else {
        setStatus(synchronized.pendingCount === 0 ? "sent" : "queued");
        setMessage(
          synchronized.pendingCount === 0
            ? "Le signalement refusé a été retiré. La file est à jour."
            : "Le signalement refusé a été retiré. Les suivants restent conservés pour une prochaine tentative.",
        );
      }
    } catch {
      if (revision !== operationRevision.current) return;
      setStatus("rejected");
      setMessage(
        "Le retrait n’a pas abouti. Le signalement refusé reste conservé sans modification.",
      );
    }
  }

  const busy = status === "loading" || status === "submitting";
  const statusMessage =
    message === ""
      ? ""
      : `${message}${
          rejectedHead !== null && pendingCount > 0
            ? ` ${pendingCount} autre${pendingCount > 1 ? "s" : ""} attend${pendingCount > 1 ? "ent" : ""} derrière ce refus.`
            : rejectedHead === null && pendingCount > 0
              ? ` ${pendingCount} en attente sur cet appareil.`
              : ""
        }`;

  useEffect(() => {
    // Le panneau reste monté sur l'écran de résultat pour reprendre sa file,
    // mais ne doit pas interrompre l'annonce pédagogique tant qu'il est fermé.
    if (open && statusMessage !== "") {
      AccessibilityInfo.announceForAccessibility(statusMessage);
    }
  }, [open, statusMessage]);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.openButton, pressed && styles.pressed]}
        onPress={() => setOpen((current) => !current)}
      >
        <Text style={styles.openButtonText}>Signaler une erreur</Text>
      </Pressable>

      {open && (
        <View style={styles.panel}>
          <Text accessibilityRole="header" style={styles.title}>
            Quel type d’erreur avez-vous vu ?
          </Text>
          <Text style={styles.body}>
            Choisissez une catégorie. Aucun texte libre, réponse ou audio n’est
            joint au signalement.
          </Text>

          {userId === null ? (
            <View style={styles.signedOut}>
              <Text accessibilityLiveRegion="polite" style={styles.body}>
                Connectez un compte permanent pour conserver le signalement sur
                le bon contenu.
              </Text>
              <Link href="/account" asChild>
                <Pressable accessibilityRole="button" style={styles.linkButton}>
                  <Text style={styles.linkButtonText}>Me connecter</Text>
                </Pressable>
              </Link>
            </View>
          ) : (
            <View accessibilityRole="radiogroup" style={styles.categories}>
              {CONTENT_REPORT_CATEGORIES.map((value) => {
                const selected = category === value;
                return (
                  <Pressable
                    accessibilityLabel={CATEGORY_LABELS[value]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected, disabled: busy }}
                    disabled={busy}
                    key={value}
                    style={({ pressed }) => [
                      styles.category,
                      selected && styles.categorySelected,
                      pressed && styles.pressed,
                      busy && styles.disabled,
                    ]}
                    onPress={() => setCategory(value)}
                  >
                    <View
                      accessible={false}
                      importantForAccessibility="no"
                      style={[styles.radio, selected && styles.radioSelected]}
                    />
                    <Text style={styles.categoryText}>
                      {CATEGORY_LABELS[value]}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  busy,
                  disabled: category === null || busy,
                }}
                disabled={category === null || busy}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.pressed,
                  (category === null || busy) && styles.disabled,
                ]}
                onPress={() => void submit()}
              >
                <Text style={styles.submitButtonText}>
                  {status === "submitting"
                    ? attemptDelivery
                      ? "Tentative d’envoi…"
                      : "Conservation…"
                    : attemptDelivery
                      ? "Envoyer le signalement"
                      : "Conserver le signalement"}
                </Text>
              </Pressable>
            </View>
          )}

          {message !== "" && (
            <Text
              accessibilityLiveRegion="polite"
              accessibilityRole={
                status === "error" || status === "rejected"
                  ? "alert"
                  : undefined
              }
              style={
                status === "error" || status === "rejected"
                  ? styles.error
                  : styles.status
              }
            >
              {statusMessage}
            </Text>
          )}
          {userId !== null && rejectedHead !== null && !busy && (
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
              onPress={() => void discardRejected()}
            >
              <Text style={styles.retryButtonText}>
                Retirer le signalement refusé et reprendre
              </Text>
            </Pressable>
          )}
          {userId !== null &&
            pendingCount > 0 &&
            attemptDelivery &&
            !busy &&
            rejectedHead === null && (
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => void retry()}
              >
                <Text style={styles.retryButtonText}>Réessayer l’envoi</Text>
              </Pressable>
            )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  openButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#cbd0d8",
    borderRadius: 999,
  },
  openButtonText: {
    paddingHorizontal: 16,
    color: "#283450",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  panel: {
    marginTop: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#cbd0d8",
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },
  title: {
    color: "#283450",
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "800",
  },
  body: {
    marginTop: 8,
    color: "#5e6980",
    fontSize: 15,
    lineHeight: 22,
    flexShrink: 1,
  },
  signedOut: { marginTop: 8 },
  categories: { marginTop: 16, gap: 8 },
  category: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd0d8",
    borderRadius: 14,
  },
  categorySelected: { borderColor: "#43a283", backgroundColor: "#eff9f5" },
  radio: {
    width: 20,
    height: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#8b94a4",
    borderRadius: 10,
  },
  radioSelected: { borderWidth: 6, borderColor: "#43a283" },
  categoryText: {
    paddingVertical: 10,
    color: "#283450",
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },
  submitButton: {
    minHeight: 52,
    marginTop: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#283450",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  linkButton: {
    minHeight: 48,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#cbd0d8",
    borderRadius: 999,
  },
  linkButtonText: { color: "#283450", fontWeight: "700" },
  status: {
    marginTop: 14,
    color: "#325f54",
    fontSize: 13,
    lineHeight: 20,
  },
  error: {
    marginTop: 14,
    color: "#a23d38",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  retryButton: {
    minHeight: 48,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    color: "#283450",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.5 },
});
