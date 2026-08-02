// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-native", async () => {
  const React = await import("react");
  type NativeProps = {
    accessibilityLabel?: string;
    accessibilityLabelledBy?: string;
    accessibilityLiveRegion?: "assertive" | "none" | "polite";
    accessibilityRole?: string;
    accessibilityState?: { disabled?: boolean };
    children?: ReactNode;
    disabled?: boolean;
    nativeID?: string;
    onChangeText?: (value: string) => void;
    onPress?: () => void;
    value?: string;
  };

  return {
    Pressable: ({
      accessibilityState,
      children,
      disabled,
      onPress,
    }: NativeProps) =>
      React.createElement(
        "button",
        {
          "aria-disabled": accessibilityState?.disabled,
          disabled,
          onClick: onPress,
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
    TextInput: ({ accessibilityLabel, onChangeText, value }: NativeProps) =>
      React.createElement("input", {
        "aria-label": accessibilityLabel,
        value,
        onChange: (event: { target: { value: string } }) =>
          onChangeText?.(event.target.value),
      }),
    View: ({ accessibilityLabelledBy, children }: NativeProps) =>
      React.createElement(
        "section",
        { "aria-labelledby": accessibilityLabelledBy },
        children,
      ),
  };
});

// eslint-disable-next-line import/first
import { AccountDeletionSection } from "../components/account-deletion-section";
// eslint-disable-next-line import/first
import type { MobileAccountDeletionState } from "../lib/use-mobile-account-deletion";

afterEach(() => cleanup());

function state(
  overrides: Partial<MobileAccountDeletionState> = {},
): MobileAccountDeletionState {
  return {
    status: "idle",
    isBusy: false,
    message: "",
    hasPendingOperation: false,
    pendingTargetsCurrentUser: false,
    canReauthenticate: false,
    needsReauthentication: false,
    retryable: false,
    beginConfirmation: vi.fn(),
    cancelConfirmation: vi.fn(),
    requestReauthenticationCode: vi.fn(() => Promise.resolve()),
    verifyCodeAndDelete: vi.fn(() => Promise.resolve()),
    retry: vi.fn(() => Promise.resolve()),
    ...overrides,
  };
}

function renderSection(deletionState: MobileAccountDeletionState) {
  return render(
    <AccountDeletionSection
      deletionState={deletionState}
      disabled={false}
      fusionInProgress
      pendingAccountAttemptCount={2}
    />,
  );
}

describe("section de suppression du compte mobile", () => {
  it("explique l'irréversibilité, l'export, le local et les voix", () => {
    const deletionState = state();
    renderSection(deletionState);

    expect(
      screen.getByRole("heading", {
        name: "Supprimer définitivement mon compte",
      }),
    ).toBeTruthy();
    expect(screen.getByText(/suppression est irréversible/i)).toBeTruthy();
    expect(screen.getByText(/exportez d’abord/i)).toBeTruthy();
    expect(screen.getByText(/prises de voix/i)).toBeTruthy();
    expect(screen.getByText(/progression anonyme.*onboarding/i)).toBeTruthy();
    expect(screen.getByText(/2 tentatives locales/i)).toBeTruthy();
    expect(
      screen.getByText(/signalements linguistiques conservés localement/iu),
    ).toBeTruthy();
    expect(screen.getByText(/en attente ou refusés/iu)).toBeTruthy();
    expect(screen.getByText(/fusion locale est encore en cours/i)).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Commencer la suppression du compte",
      }),
    );
    expect(deletionState.beginConfirmation).toHaveBeenCalledOnce();
  });

  it("présente une seconde confirmation annulable avant l'OTP", () => {
    const deletionState = state({
      status: "confirming",
      message: "Cette action est définitive.",
    });
    renderSection(deletionState);

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Je comprends, envoyer le code de sécurité",
      }),
    );

    expect(deletionState.cancelConfirmation).toHaveBeenCalledOnce();
    expect(deletionState.requestReauthenticationCode).toHaveBeenCalledOnce();
  });

  it("filtre le code à six chiffres avant l'action définitive", () => {
    const deletionState = state({
      status: "awaiting_code",
      message: "Code envoyé.",
    });
    renderSection(deletionState);
    const input = screen.getByRole("textbox", {
      name: "Code de sécurité à six chiffres",
    });

    fireEvent.change(input, { target: { value: "12a34 56" } });
    fireEvent.click(
      screen.getByRole("button", {
        name: "Supprimer définitivement mon compte",
      }),
    );

    expect(deletionState.verifyCodeAndDelete).toHaveBeenCalledWith("123456");
  });

  it("annonce l'erreur et n'offre la réauthentification qu'au bon sujet", () => {
    const deletionState = state({
      status: "error",
      message: "La session doit être confirmée.",
      hasPendingOperation: true,
      pendingTargetsCurrentUser: true,
      canReauthenticate: true,
      needsReauthentication: true,
    });
    const { rerender } = renderSection(deletionState);
    expect(
      String(
        (screen.getByRole("alert") as { textContent?: unknown }).textContent,
      ),
    ).toContain("La session doit être confirmée.");
    expect(
      screen.getByRole("button", {
        name: "Recevoir un nouveau code de sécurité",
      }),
    ).toBeTruthy();

    rerender(
      <AccountDeletionSection
        deletionState={{
          ...deletionState,
          pendingTargetsCurrentUser: false,
          canReauthenticate: false,
        }}
        disabled={false}
        fusionInProgress={false}
        pendingAccountAttemptCount={0}
      />,
    );
    expect(
      screen.queryByRole("button", {
        name: "Recevoir un nouveau code de sécurité",
      }),
    ).toBeNull();
  });
});
