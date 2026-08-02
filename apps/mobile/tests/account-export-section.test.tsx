// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-native", async () => {
  const React = await import("react");
  type AccessibilityState = { busy?: boolean; disabled?: boolean };
  type NativeProps = {
    accessibilityHint?: string;
    accessibilityLabel?: string;
    accessibilityLabelledBy?: string;
    accessibilityLiveRegion?: "assertive" | "none" | "polite";
    accessibilityRole?: string;
    accessibilityState?: AccessibilityState;
    children?: ReactNode;
    disabled?: boolean;
    nativeID?: string;
    onPress?: () => void;
  };

  return {
    Pressable: ({
      accessibilityHint,
      accessibilityLabel,
      accessibilityState,
      children,
      disabled,
      onPress,
    }: NativeProps) =>
      React.createElement(
        "button",
        {
          "aria-busy": accessibilityState?.busy,
          "aria-disabled": accessibilityState?.disabled,
          "aria-label": accessibilityLabel,
          disabled,
          onClick: onPress,
          title: accessibilityHint,
        },
        children,
      ),
    StyleSheet: { create: <T,>(styles: T) => styles },
    Text: ({
      accessibilityLiveRegion,
      accessibilityRole,
      children,
      nativeID,
    }: NativeProps) =>
      React.createElement(
        accessibilityRole === "header" ? "h2" : "p",
        {
          "aria-live": accessibilityLiveRegion,
          id: nativeID,
          role: accessibilityRole === "alert" ? "alert" : undefined,
        },
        children,
      ),
    View: ({ accessibilityLabelledBy, children }: NativeProps) =>
      React.createElement(
        "section",
        { "aria-labelledby": accessibilityLabelledBy },
        children,
      ),
  };
});

// Le composant doit être résolu après le double React Native.
// eslint-disable-next-line import/first
import { AccountExportSection } from "../components/account-export-section";

afterEach(() => cleanup());

function elementText(element: unknown): string {
  return String((element as { textContent?: unknown }).textContent ?? "");
}

function elementAttribute(element: unknown, name: string): string | null {
  return (
    element as { getAttribute: (attributeName: string) => string | null }
  ).getAttribute(name);
}

function elementIsDisabled(element: unknown): boolean {
  return (element as { disabled?: boolean }).disabled === true;
}

describe("section d’export du compte mobile", () => {
  it("distingue les données serveur, locales et vocales", () => {
    render(
      <AccountExportSection
        anonymousAttemptCount={2}
        disabled={false}
        exportState={{
          exportAccount: vi.fn(),
          isBusy: false,
          message: "",
          status: "idle",
        }}
        fusionInProgress
        pendingAccountAttemptCount={1}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Exporter les données de mon compte",
      }),
    ).toBeTruthy();
    expect(screen.getByText(/progression déjà synchronisées/i)).toBeTruthy();
    expect(elementText(screen.getByText(/ni progression anonyme/i))).toContain(
      "ni prise de voix",
    );
    expect(screen.getByText(/voix restent uniquement/i)).toBeTruthy();
    expect(screen.getByText(/adresse e-mail ou votre numéro/i)).toBeTruthy();
    expect(screen.getByText(/1 tentative de ce compte/i)).toBeTruthy();
    expect(
      screen.getByText(/progression anonyme de cet appareil/i),
    ).toBeTruthy();
    expect(screen.getByText(/fusion locale est en cours/i)).toBeTruthy();
  });

  it("expose une action secondaire explicite", () => {
    const exportAccount = vi.fn(() => Promise.resolve());
    render(
      <AccountExportSection
        anonymousAttemptCount={0}
        disabled={false}
        exportState={{
          exportAccount,
          isBusy: false,
          message: "",
          status: "idle",
        }}
        fusionInProgress={false}
        pendingAccountAttemptCount={0}
      />,
    );

    const button = screen.getByRole("button", {
      name: "Enregistrer ou partager mon export JSON",
    });
    expect(elementIsDisabled(button)).toBe(false);
    expect(elementAttribute(button, "title")).toMatch(/fichier JSON/i);
    fireEvent.click(button);
    expect(exportAccount).toHaveBeenCalledOnce();
  });

  it("annonce le chargement et les erreurs sans dépendre de la couleur", () => {
    const { rerender } = render(
      <AccountExportSection
        anonymousAttemptCount={0}
        disabled={false}
        exportState={{
          exportAccount: vi.fn(),
          isBusy: true,
          message: "Préparation sécurisée du fichier JSON…",
          status: "preparing",
        }}
        fusionInProgress={false}
        pendingAccountAttemptCount={0}
      />,
    );

    const busyButton = screen.getByRole("button", {
      name: "Préparation du fichier JSON…",
    });
    expect(elementIsDisabled(busyButton)).toBe(true);
    expect(elementAttribute(busyButton, "aria-busy")).toBe("true");
    expect(
      elementAttribute(screen.getByText(/préparation sécurisée/i), "aria-live"),
    ).toBe("polite");

    rerender(
      <AccountExportSection
        anonymousAttemptCount={0}
        disabled={false}
        exportState={{
          exportAccount: vi.fn(),
          isBusy: false,
          message: "Aucun fichier n’a été créé.",
          status: "error",
        }}
        fusionInProgress={false}
        pendingAccountAttemptCount={0}
      />,
    );
    expect(elementText(screen.getByRole("alert"))).toContain(
      "Aucun fichier n’a été créé.",
    );
  });
});
