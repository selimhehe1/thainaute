import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccountExperience } from "../app/account/account-experience";
import { WebAuthSessionProvider } from "../lib/client/auth-session";

describe("parcours compte web", () => {
  it("reste explicitement hors ligne sans configuration Supabase", () => {
    render(
      <WebAuthSessionProvider>
        <AccountExperience />
      </WebAuthSessionProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Compte non configuré ici" }),
    ).toBeVisible();
    expect(screen.queryByLabelText("Adresse email")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Continuer hors ligne" }),
    ).toHaveAttribute("href", "/learn/demo");
  });
});
