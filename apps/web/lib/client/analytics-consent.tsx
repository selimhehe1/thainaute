"use client";

import {
  applyAnalyticsConsentDecision,
  createConsentAwareAnalytics,
  createInitialAnalyticsConsentSnapshot,
  noOpAnalytics,
  parseAnalyticsConsentSnapshot,
  type AnalyticsConsentDecision,
  type AnalyticsConsentSnapshot,
  type AnalyticsSink,
} from "@thainaute/analytics";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const WEB_ANALYTICS_CONSENT_STORAGE_KEY =
  "thainaute.analytics-consent.v1";

export type WebAnalyticsConsentStatus =
  "loading" | AnalyticsConsentDecision | "error";

interface WebAnalyticsConsentContextValue {
  readonly accept: () => void;
  readonly analytics: AnalyticsSink;
  readonly refuse: () => void;
  readonly retry: () => void;
  readonly status: WebAnalyticsConsentStatus;
  readonly withdraw: () => void;
}

interface StoredConsentReadResult {
  readonly snapshot: AnalyticsConsentSnapshot;
  readonly status: AnalyticsConsentDecision;
}

class AnalyticsConsentGate {
  private snapshot = createInitialAnalyticsConsentSnapshot();
  private pendingDenial: AnalyticsConsentSnapshot | null = null;

  readonly read = (): AnalyticsConsentSnapshot => this.snapshot;

  disable(): void {
    this.snapshot = createInitialAnalyticsConsentSnapshot();
  }

  clearPendingDenial(): void {
    this.pendingDenial = null;
  }

  latchPendingDenial(snapshot: AnalyticsConsentSnapshot): void {
    this.pendingDenial = snapshot;
  }

  readPendingDenial(): AnalyticsConsentSnapshot | null {
    return this.pendingDenial;
  }

  replace(snapshot: AnalyticsConsentSnapshot): void {
    this.snapshot = snapshot;
  }
}

const defaultContext: WebAnalyticsConsentContextValue = {
  accept() {},
  analytics: noOpAnalytics,
  refuse() {},
  retry() {},
  status: "loading",
  withdraw() {},
};

const WebAnalyticsConsentContext =
  createContext<WebAnalyticsConsentContextValue>(defaultContext);

function readStoredConsent(storage: Storage): StoredConsentReadResult {
  const serialized = storage.getItem(WEB_ANALYTICS_CONSENT_STORAGE_KEY);
  if (serialized === null) {
    const snapshot = createInitialAnalyticsConsentSnapshot();
    return { snapshot, status: snapshot.decision };
  }

  let candidate: unknown;
  try {
    candidate = JSON.parse(serialized);
  } catch {
    throw new Error("analytics_consent_corrupted");
  }

  const snapshot = parseAnalyticsConsentSnapshot(candidate);
  if (snapshot === null) {
    throw new Error("analytics_consent_corrupted");
  }
  return { snapshot, status: snapshot.decision };
}

export function WebAnalyticsConsentProvider({
  children,
  sink = noOpAnalytics,
}: Readonly<{
  children: ReactNode;
  sink?: AnalyticsSink;
}>) {
  const [gate] = useState(() => new AnalyticsConsentGate());
  const [status, setStatus] = useState<WebAnalyticsConsentStatus>("loading");
  const [retryRevision, setRetryRevision] = useState(0);

  const disableWithError = useCallback(() => {
    gate.disable();
    setStatus("error");
  }, [gate]);

  const refreshFromStorage = useCallback(() => {
    try {
      const stored = readStoredConsent(window.localStorage);
      if (gate.readPendingDenial() !== null) {
        if (stored.snapshot.decision !== "denied") {
          gate.disable();
          setStatus("error");
          return;
        }
        gate.clearPendingDenial();
      }
      gate.replace(stored.snapshot);
      setStatus(stored.status);
    } catch {
      disableWithError();
    }
  }, [disableWithError, gate]);

  useEffect(() => {
    const synchronizeFromStorage = (event: StorageEvent) => {
      if (
        event.key !== null &&
        event.key !== WEB_ANALYTICS_CONSENT_STORAGE_KEY
      ) {
        return;
      }

      try {
        if (
          event.storageArea !== null &&
          event.storageArea !== window.localStorage
        ) {
          return;
        }
      } catch {
        disableWithError();
        return;
      }

      // Relire la valeur canonique évite qu'un événement livré en retard
      // remplace une décision plus récente prise dans un autre onglet.
      refreshFromStorage();
    };

    let active = true;
    window.addEventListener("storage", synchronizeFromStorage);
    queueMicrotask(() => {
      if (active) refreshFromStorage();
    });
    return () => {
      active = false;
      window.removeEventListener("storage", synchronizeFromStorage);
    };
  }, [disableWithError, refreshFromStorage, retryRevision]);

  const persistDecision = useCallback(
    (decision: Exclude<AnalyticsConsentDecision, "unknown">) => {
      const previousSnapshot = gate.read();
      const pendingDenial = gate.readPendingDenial();

      // Un refus ou un retrait coupe le sink avant toute écriture. Un accord
      // ne l'active qu'après une persistance réussie.
      gate.disable();
      const nextSnapshot =
        decision === "denied" && pendingDenial !== null
          ? pendingDenial
          : applyAnalyticsConsentDecision(
              previousSnapshot,
              decision,
              new Date().toISOString(),
            );

      if (decision === "denied") {
        gate.latchPendingDenial(nextSnapshot);
        try {
          // Supprimer d'abord l'ancien accord rend une interruption ou un
          // échec d'écriture fail-closed au prochain montage.
          window.localStorage.removeItem(WEB_ANALYTICS_CONSENT_STORAGE_KEY);
        } catch {
          // L'écriture ci-dessous peut encore remplacer la valeur obsolète.
        }
      }

      try {
        window.localStorage.setItem(
          WEB_ANALYTICS_CONSENT_STORAGE_KEY,
          JSON.stringify(nextSnapshot),
        );
      } catch {
        if (decision !== "denied") {
          gate.clearPendingDenial();
        }
        disableWithError();
        return;
      }

      gate.clearPendingDenial();
      gate.replace(nextSnapshot);
      setStatus(nextSnapshot.decision);
    },
    [disableWithError, gate],
  );

  const retry = useCallback(() => {
    if (gate.readPendingDenial() !== null) {
      persistDecision("denied");
      return;
    }
    gate.disable();
    setStatus("loading");
    setRetryRevision((revision) => revision + 1);
  }, [gate, persistDecision]);

  const analytics = useMemo(
    () => createConsentAwareAnalytics(gate.read, sink),
    [gate, sink],
  );

  const value = useMemo<WebAnalyticsConsentContextValue>(
    () => ({
      accept: () => persistDecision("granted"),
      analytics,
      refuse: () => persistDecision("denied"),
      retry,
      status,
      withdraw: () => persistDecision("denied"),
    }),
    [analytics, persistDecision, retry, status],
  );

  return (
    <WebAnalyticsConsentContext.Provider value={value}>
      {children}
    </WebAnalyticsConsentContext.Provider>
  );
}

export function useWebAnalyticsConsent(): WebAnalyticsConsentContextValue {
  return useContext(WebAnalyticsConsentContext);
}
