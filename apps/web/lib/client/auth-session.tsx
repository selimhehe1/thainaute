"use client";

import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { purgeSettledWebAccountData } from "./account-sync";
import { getWebSupabaseAuthClient } from "./supabase-auth";

type AuthStatus = "loading" | "unconfigured" | "signed_out" | "signed_in";

interface AuthSessionValue {
  readonly status: AuthStatus;
  readonly session: Session | null;
  readonly sessionBoundaryRevision: number;
  readonly requestEmailCode: (email: string) => Promise<void>;
  readonly verifyEmailCode: (email: string, code: string) => Promise<void>;
  readonly signOutLocal: (expectedUserId: string) => Promise<void>;
}

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

function assertConfigured() {
  const client = getWebSupabaseAuthClient();
  if (client === null) {
    throw new Error(
      "L’authentification n’est pas configurée sur cet environnement.",
    );
  }
  return client;
}

function isDurableSession(session: Session | null): session is Session {
  return session !== null && session.user.is_anonymous !== true;
}

export function WebAuthSessionProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const client = useMemo(() => getWebSupabaseAuthClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    client === null ? "unconfigured" : "loading",
  );
  const [sessionBoundaryRevision, setSessionBoundaryRevision] = useState(0);
  const lastDurableUserId = useRef<string | null | undefined>(undefined);
  const expectedLocalSignOuts = useRef(new Set<string>());

  useEffect(() => {
    if (client === null) return;
    let active = true;
    let authEventRevision = 0;

    const applySession = (
      nextSession: Session | null,
      signedOut: boolean,
      bootstrap: boolean,
    ) => {
      const current = isDurableSession(nextSession) ? nextSession : null;
      const nextUserId = current?.user.id.toLowerCase() ?? null;
      const previousUserId = lastDurableUserId.current;
      const previousResolvedUserId = previousUserId ?? null;
      const durableSubjectChanged =
        (previousUserId !== undefined || !bootstrap) &&
        previousResolvedUserId !== nextUserId;
      if (signedOut || durableSubjectChanged) {
        setSessionBoundaryRevision((revision) => revision + 1);
      }
      if (
        previousUserId !== undefined &&
        previousUserId !== null &&
        previousUserId !== nextUserId
      ) {
        const expected =
          signedOut && expectedLocalSignOuts.current.delete(previousUserId);
        if (!expected) {
          queueMicrotask(() => {
            if (!active || lastDurableUserId.current === previousUserId) {
              return;
            }
            void purgeSettledWebAccountData(previousUserId).catch(() => {
              // Un échec conserve le namespace verrouillé ; aucune perte silencieuse.
            });
          });
        }
      }
      if (nextUserId !== null) {
        expectedLocalSignOuts.current.delete(nextUserId);
      }
      lastDurableUserId.current = nextUserId;
      setSession(current);
      setStatus(current === null ? "signed_out" : "signed_in");
    };

    void client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active || authEventRevision !== 0) return;
        applySession(error === null ? data.session : null, false, true);
      })
      .catch(() => {
        if (!active || authEventRevision !== 0) return;
        applySession(null, false, true);
      });

    const { data } = client.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      authEventRevision += 1;
      applySession(
        nextSession,
        event === "SIGNED_OUT",
        event === "INITIAL_SESSION",
      );
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  const requestEmailCode = useCallback(async (email: string) => {
    const { error } = await assertConfigured().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    if (error !== null) throw new Error("Le code n’a pas pu être envoyé.");
  }, []);

  const verifyEmailCode = useCallback(async (email: string, code: string) => {
    const { data, error } = await assertConfigured().auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    if (error !== null || !isDurableSession(data.session)) {
      throw new Error("Le code est invalide ou a expiré.");
    }
  }, []);

  const signOutLocal = useCallback(async (expectedUserId: string) => {
    const auth = assertConfigured().auth;
    const expected = expectedUserId.toLowerCase();
    const { data, error: sessionError } = await auth.getSession();
    if (
      sessionError !== null ||
      !isDurableSession(data.session) ||
      data.session.user.id.toLowerCase() !== expected
    ) {
      throw new Error("La session a changé avant la déconnexion.");
    }

    expectedLocalSignOuts.current.add(expected);
    try {
      const { error } = await auth.signOut({ scope: "local" });
      if (error !== null) throw error;
    } catch {
      expectedLocalSignOuts.current.delete(expected);
      throw new Error("La déconnexion locale a échoué.");
    }
  }, []);

  const contextValue = useMemo<AuthSessionValue>(
    () => ({
      status,
      session,
      sessionBoundaryRevision,
      requestEmailCode,
      verifyEmailCode,
      signOutLocal,
    }),
    [
      requestEmailCode,
      session,
      sessionBoundaryRevision,
      signOutLocal,
      status,
      verifyEmailCode,
    ],
  );

  return (
    <AuthSessionContext.Provider value={contextValue}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useWebAuthSession(): AuthSessionValue {
  const value = useContext(AuthSessionContext);
  if (value === null) {
    throw new Error("WebAuthSessionProvider est absent.");
  }
  return value;
}
