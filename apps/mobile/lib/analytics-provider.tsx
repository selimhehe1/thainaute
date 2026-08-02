import {
  applyAnalyticsConsentDecision,
  createConsentAwareAnalytics,
  createInitialAnalyticsConsentSnapshot,
  noOpAnalytics,
  type AnalyticsConsentDecision,
  type AnalyticsConsentSnapshot,
  type AnalyticsSink,
} from "@thainaute/analytics";
import { useSQLiteContext } from "expo-sqlite";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  MobileAnalyticsConsentStore,
  type MobileAnalyticsConsentStorePort,
} from "./mobile-analytics-consent-store";

type ConsentStatus = "error" | "loading" | "ready" | "saving";
type FinalConsentDecision = Exclude<AnalyticsConsentDecision, "unknown">;

interface RevocableAnalyticsSink extends AnalyticsSink {
  reset?(): void | Promise<void>;
}

class MobileAnalyticsConsentGate {
  private snapshot = createInitialAnalyticsConsentSnapshot();

  public readonly read = (): AnalyticsConsentSnapshot => this.snapshot;

  public disable(): void {
    this.snapshot = createInitialAnalyticsConsentSnapshot();
  }

  public replace(snapshot: AnalyticsConsentSnapshot): void {
    this.snapshot = snapshot;
  }
}

export interface MobileAnalyticsContextValue {
  readonly analytics: AnalyticsSink;
  readonly decision: AnalyticsConsentDecision;
  readonly message: string;
  readonly status: ConsentStatus;
  readonly updatedAt: string | null;
  decide(decision: FinalConsentDecision): Promise<void>;
  retry(): void;
}

const MobileAnalyticsContext =
  createContext<MobileAnalyticsContextValue | null>(null);

export function MobileAnalyticsProvider({
  children,
  sink = noOpAnalytics,
  store,
}: {
  readonly children: ReactNode;
  readonly sink?: RevocableAnalyticsSink;
  readonly store: MobileAnalyticsConsentStorePort;
}) {
  const [snapshot, setSnapshot] = useState<AnalyticsConsentSnapshot>(
    createInitialAnalyticsConsentSnapshot,
  );
  const [status, setStatus] = useState<ConsentStatus>("loading");
  const [message, setMessage] = useState("");
  const [loadRevision, setLoadRevision] = useState(0);
  const [gate] = useState(() => new MobileAnalyticsConsentGate());
  const operationRevision = useRef(0);
  const mounted = useRef(true);
  const withdrawalPending = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      operationRevision.current += 1;
    };
  }, []);

  useEffect(() => {
    const expectedRevision = ++operationRevision.current;
    gate.disable();
    void store
      .read()
      .then((stored) => {
        if (
          !mounted.current ||
          operationRevision.current !== expectedRevision
        ) {
          return;
        }
        gate.replace(stored);
        setSnapshot(stored);
        setStatus("ready");
      })
      .catch(() => {
        if (
          !mounted.current ||
          operationRevision.current !== expectedRevision
        ) {
          return;
        }
        gate.disable();
        setSnapshot(createInitialAnalyticsConsentSnapshot());
        setStatus("error");
        setMessage(
          "La préférence locale est illisible. La mesure reste désactivée jusqu’à votre nouveau choix.",
        );
      });
  }, [gate, loadRevision, store]);

  const analytics = useMemo(
    () => createConsentAwareAnalytics(gate.read, sink),
    [gate, sink],
  );

  const decide = useCallback(
    async (decision: FinalConsentDecision): Promise<void> => {
      const expectedRevision = ++operationRevision.current;
      withdrawalPending.current = decision === "denied";
      const updatedAt = new Date().toISOString();
      const previousSnapshot = gate.read();
      const previousDecision = previousSnapshot.decision;

      // Un accord ne devient actif qu’après persistance. Un refus ou retrait
      // ferme le flux avant toute opération asynchrone.
      gate.disable();
      setStatus("saving");
      setMessage("");
      let resetPromise = Promise.resolve();
      if (decision === "denied") {
        const provisional = applyAnalyticsConsentDecision(
          previousSnapshot,
          decision,
          updatedAt,
        );
        gate.replace(provisional);
        setSnapshot(provisional);
        try {
          resetPromise = Promise.resolve(sink.reset?.())
            .then(() => undefined)
            .catch(() => undefined);
        } catch {
          // Une panne d’un futur fournisseur ne doit pas rouvrir le flux.
        }
      }

      try {
        const [next] = await Promise.all([
          store.decide(decision, updatedAt),
          resetPromise,
        ]);
        if (
          !mounted.current ||
          operationRevision.current !== expectedRevision
        ) {
          return;
        }
        gate.replace(next);
        withdrawalPending.current = false;
        setSnapshot(next);
        setStatus("ready");
        setMessage(
          decision === "granted"
            ? "Mesure facultative autorisée sur cet appareil."
            : previousDecision === "granted"
              ? "Consentement retiré immédiatement sur cet appareil."
              : "Mesure facultative refusée sur cet appareil.",
        );
      } catch {
        if (
          !mounted.current ||
          operationRevision.current !== expectedRevision
        ) {
          return;
        }
        if (decision !== "denied") {
          withdrawalPending.current = false;
          gate.disable();
          setSnapshot(createInitialAnalyticsConsentSnapshot());
        }
        setStatus("error");
        setMessage(
          decision === "denied"
            ? "Le retrait est actif pour cette session, mais sa sauvegarde doit être retentée."
            : "Le choix n’a pas pu être sauvegardé. La mesure reste désactivée.",
        );
      }
    },
    [gate, sink, store],
  );

  const retry = useCallback(() => {
    if (withdrawalPending.current) {
      void decide("denied");
      return;
    }
    gate.disable();
    setSnapshot(createInitialAnalyticsConsentSnapshot());
    setStatus("loading");
    setMessage("");
    setLoadRevision((revision) => revision + 1);
  }, [decide, gate]);

  const value = useMemo<MobileAnalyticsContextValue>(
    () => ({
      analytics,
      decision: snapshot.decision,
      message,
      status,
      updatedAt: snapshot.updatedAt,
      decide,
      retry,
    }),
    [analytics, decide, message, retry, snapshot, status],
  );

  return (
    <MobileAnalyticsContext.Provider value={value}>
      {children}
    </MobileAnalyticsContext.Provider>
  );
}

export function MobileAnalyticsBootstrap({
  children,
}: {
  readonly children: ReactNode;
}) {
  const database = useSQLiteContext();
  const store = useMemo(
    () => new MobileAnalyticsConsentStore(database),
    [database],
  );
  return (
    <MobileAnalyticsProvider store={store}>{children}</MobileAnalyticsProvider>
  );
}

export function useMobileAnalytics(): MobileAnalyticsContextValue {
  const context = useContext(MobileAnalyticsContext);
  if (context === null) {
    throw new Error(
      "useMobileAnalytics doit être utilisé sous MobileAnalyticsProvider.",
    );
  }
  return context;
}
