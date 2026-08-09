import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AccountBillingSection } from "../app/account/account-billing-section";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("panneau Premium du compte", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("reste invisible quand la facturation est désactivée", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ error: { code: "billing_disabled" } }, 404),
    );

    render(
      <AccountBillingSection
        accessToken="access-token"
        sessionBoundaryRevision={0}
      />,
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Premium" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("affiche un statut actif et ne bloque pas le parcours gratuit", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        entitlement: "premium",
        status: "active",
        active: true,
        provider: "stripe",
        currentPeriodEnd: "2026-09-01T10:00:00.000Z",
      }),
    );

    render(
      <AccountBillingSection
        accessToken="access-token"
        sessionBoundaryRevision={0}
      />,
    );

    expect(
      await screen.findByText(/Votre accès Premium est actif\./u),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Gérer mon abonnement" }),
    ).toBeEnabled();
    expect(screen.getByText(/Échéance/)).toBeVisible();
  });

  it("affiche une reprise après une réponse invalide", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ unexpected: true }))
      .mockResolvedValueOnce(
        jsonResponse({ error: { code: "billing_unavailable" } }, 503),
      );

    render(
      <AccountBillingSection
        accessToken="access-token"
        sessionBoundaryRevision={0}
      />,
    );

    expect(
      await screen.findByText("La réponse Premium reçue est invalide."),
    ).toBeVisible();
    screen.getByRole("button", { name: "Réessayer" }).click();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(
      await screen.findByText(
        "La gestion de Premium est momentanément indisponible.",
      ),
    ).toBeVisible();
  });
});
