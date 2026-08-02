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
  readonly requestAccountDeletionCode: (
    expectedUserId: string,
  ) => Promise<void>;
  readonly verifyAccountDeletionCode: (
    expectedUserId: string,
    code: string,
  ) => Promise<void>;
  readonly clearDeletedSession: (expectedUserId: string) => Promise<void>;
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

async function expectedDurableEmailSession(expectedUserId: string) {
  const auth = assertConfigured().auth;
  const expected = expectedUserId.toLowerCase();
  const { data, error } = await auth.getSession();
  const current = data.session;
  if (
    error !== null ||
    !isDurableSession(current) ||
    current.user.id.toLowerCase() !== expected ||
    typeof current.user.email !== "string" ||
    current.user.email.length === 0
  ) {
    throw new Error(
      "Reconnectez le compte concern\u00e9 avant de confirmer sa suppression.",
    );
  }
  return { auth, email: current.user.email, expected };
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

  const requestAccountDeletionCode = useCallback(
    async (expectedUserId: string) => {
      const { auth, email } = await expectedDurableEmailSession(expectedUserId);
      const { error } = await auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (error !== null) {
        throw new Error(
          "Le code de confirmation n'a pas pu \u00eatre envoy\u00e9. R\u00e9essayez.",
        );
      }
    },
    [],
  );

  const verifyAccountDeletionCode = useCallback(
    async (expectedUserId: string, code: string) => {
      if (!/^\d{6}$/u.test(code)) {
        throw new Error("Le code doit contenir exactement six chiffres.");
      }
      const { auth, email, expected } =
        await expectedDurableEmailSession(expectedUserId);
      const { data, error } = await auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      if (
        error !== null ||
        !isDurableSession(data.session) ||
        data.session.user.id.toLowerCase() !== expected
      ) {
        throw new Error(
          "Le code est invalide, expir\u00e9 ou li\u00e9 \u00e0 un autre compte.",
        );
      }

      const verified = await auth.getUser(data.session.access_token);
      if (
        verified.error !== null ||
        verified.data.user.is_anonymous === true ||
        verified.data.user.id.toLowerCase() !== expected
      ) {
        throw new Error(
          "L'identit\u00e9 du compte n'a pas pu \u00eatre rev\u00e9rifi\u00e9e. Aucune suppression n'a \u00e9t\u00e9 demand\u00e9e.",
        );
      }
    },
    [],
  );

  const clearDeletedSession = useCallback(
    async (expectedUserId: string) => {
      if (client === null) return;
      const expected = expectedUserId.toLowerCase();
      const { data, error: sessionError } = await client.auth.getSession();
      if (sessionError !== null) {
        throw new Error(
          "La session locale n'a pas pu \u00eatre v\u00e9rifi\u00e9e.",
        );
      }
      if (
        !isDurableSession(data.session) ||
        data.session.user.id.toLowerCase() !== expected
      ) {
        return;
      }

      expectedLocalSignOuts.current.add(expected);
      try {
        const { error } = await client.auth.signOut({ scope: "local" });
        if (error !== null) throw error;
      } catch {
        expectedLocalSignOuts.current.delete(expected);
        throw new Error(
          "La session supprim\u00e9e n'a pas pu \u00eatre effac\u00e9e localement.",
        );
      }
    },
    [client],
  );

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
      requestAccountDeletionCode,
      verifyAccountDeletionCode,
      clearDeletedSession,
      signOutLocal,
    }),
    [
      clearDeletedSession,
      requestAccountDeletionCode,
      requestEmailCode,
      session,
      sessionBoundaryRevision,
      signOutLocal,
      status,
      verifyAccountDeletionCode,
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
