"use client";

import { buttonClass } from "@/components/ui/button";
import panel from "@/components/ui/panel.module.css";
import { useEffect, useState } from "react";

import { billingStatusResponseSchema } from "@/lib/server/billing/contracts";

import styles from "./account.module.css";

interface BillingStatus {
  readonly entitlement: "premium";
  readonly status:
    "none" | "active" | "trialing" | "grace" | "expired" | "revoked";
  readonly active: boolean;
  readonly provider: "stripe" | "revenuecat" | "manual" | null;
  readonly currentPeriodEnd: string | null;
}

type BillingViewState =
  | { readonly phase: "loading" }
  | { readonly phase: "disabled" }
  | { readonly phase: "ready"; readonly status: BillingStatus }
  | { readonly phase: "error"; readonly message: string };

interface AccountBillingSectionProps {
  readonly accessToken: string | null;
  readonly sessionBoundaryRevision: number;
}

function randomIdempotencyKey(): string {
  return globalThis.crypto.randomUUID();
}

async function readResponseBody(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function apiErrorCode(body: unknown): string | null {
  if (
    typeof body !== "object" ||
    body === null ||
    !("error" in body) ||
    typeof body.error !== "object" ||
    body.error === null ||
    !("code" in body.error) ||
    typeof body.error.code !== "string"
  ) {
    return null;
  }
  return body.error.code;
}

function checkoutUrl(body: unknown): string | null {
  if (
    typeof body !== "object" ||
    body === null ||
    !("url" in body) ||
    typeof body.url !== "string"
  ) {
    return null;
  }
  try {
    const url = new URL(body.url);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function billingFailureMessage(code: string | null): string {
  if (code === "unauthorized") {
    return "Votre session a expiré. Reconnectez-vous puis réessayez.";
  }
  return "La gestion de Premium est momentanément indisponible.";
}

export function AccountBillingSection({
  accessToken,
  sessionBoundaryRevision,
}: AccountBillingSectionProps) {
  const [view, setView] = useState<BillingViewState>({ phase: "loading" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshRevision, setRefreshRevision] = useState(0);

  useEffect(() => {
    if (accessToken === null) {
      return;
    }
    const controller = new AbortController();
    void fetch("/api/v1/billing/status", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await readResponseBody(response);
        if (!response.ok) {
          if (apiErrorCode(body) === "billing_disabled") {
            setView({ phase: "disabled" });
            return;
          }
          setView({
            phase: "error",
            message: billingFailureMessage(apiErrorCode(body)),
          });
          return;
        }
        const validated = billingStatusResponseSchema.safeParse(body);
        if (!validated.success) {
          setView({
            phase: "error",
            message: "La réponse Premium reçue est invalide.",
          });
          return;
        }
        setView({
          phase: "ready",
          status: validated.data,
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setView({
            phase: "error",
            message: "La gestion de Premium est momentanément indisponible.",
          });
        }
      });
    return () => controller.abort();
  }, [accessToken, refreshRevision, sessionBoundaryRevision]);

  async function openBillingPath(path: "/checkout" | "/portal") {
    if (accessToken === null || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/v1/billing${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Idempotency-Key": randomIdempotencyKey(),
        },
        body: JSON.stringify({ plan: "premium" }),
      });
      const body = await readResponseBody(response);
      if (!response.ok) {
        setMessage(billingFailureMessage(apiErrorCode(body)));
        return;
      }
      const url = checkoutUrl(body);
      if (url === null) {
        setMessage("Le lien Premium reçu est invalide.");
        return;
      }
      window.location.assign(url);
    } catch {
      setMessage("La gestion de Premium est momentanément indisponible.");
    } finally {
      setBusy(false);
    }
  }

  if (accessToken === null || view.phase === "disabled") return null;

  return (
    <section
      aria-busy={view.phase === "loading" || busy}
      aria-labelledby="account-billing-title"
      className={styles.subPanel}
    >
      <h2 id="account-billing-title">Premium</h2>
      {view.phase === "loading" && (
        <p aria-live="polite">Vérification de Premium…</p>
      )}
      {view.phase === "error" && (
        <>
          <p className={styles.message}>{view.message}</p>
          <button
            className={buttonClass("ghost")}
            onClick={() => {
              setView({ phase: "loading" });
              setRefreshRevision((revision) => revision + 1);
            }}
            type="button"
          >
            Réessayer
          </button>
        </>
      )}
      {view.phase === "ready" && (
        <>
          {view.status.active ? (
            <p>
              {view.status.status === "grace"
                ? "Premium reste actif pendant la période de grâce."
                : view.status.status === "trialing"
                  ? "Votre essai Premium est actif."
                  : "Votre accès Premium est actif."}
              {view.status.currentPeriodEnd !== null && (
                <>
                  {" "}
                  Échéance :{" "}
                  {new Date(view.status.currentPeriodEnd).toLocaleDateString(
                    "fr-FR",
                  )}
                  .
                </>
              )}
            </p>
          ) : (
            <p>
              Premium accélère la progression avec davantage de confort et de
              volume ; le parcours fondamental reste accessible gratuitement.
            </p>
          )}
          <div className={panel.actions}>
            {view.status.active ? (
              <button
                className={buttonClass("ghost")}
                disabled={busy}
                onClick={() => void openBillingPath("/portal")}
                type="button"
              >
                {busy ? "Ouverture…" : "Gérer mon abonnement"}
              </button>
            ) : (
              <button
                className={buttonClass("primary")}
                disabled={busy}
                onClick={() => void openBillingPath("/checkout")}
                type="button"
              >
                {busy ? "Préparation…" : "Découvrir Premium"}
              </button>
            )}
          </div>
          {message !== "" && (
            <p className={styles.message} role="status">
              {message}
            </p>
          )}
        </>
      )}
    </section>
  );
}
