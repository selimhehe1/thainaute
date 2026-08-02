// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  decide: vi.fn(),
  retry: vi.fn(),
  value: {
    analytics: { capture: vi.fn() },
    decision: "unknown" as "unknown" | "denied" | "granted",
    message: "",
    status: "ready" as "error" | "loading" | "ready" | "saving",
    updatedAt: null as string | null,
  },
}));

vi.mock("expo-router", async () => {
  const React = await import("react");
  return {
    Link: ({ children }: { readonly children?: ReactNode }) =>
      React.createElement("a", { href: "/account" }, children),
  };
});
vi.mock("react-native-safe-area-context", async () => {
  const React = await import("react");
  return {
    SafeAreaView: ({ children }: { readonly children?: ReactNode }) =>
      React.createElement("main", null, children),
  };
});
vi.mock("react-native", async () => {
  const React = await import("react");
  interface Props {
    readonly accessibilityRole?: string;
    readonly children?: ReactNode;
    readonly disabled?: boolean;
    readonly onPress?: () => void;
  }
  const container = ({ children }: Props) =>
    React.createElement("div", null, children);
  return {
    Pressable: ({ children, disabled, onPress }: Props) =>
      React.createElement("button", { disabled, onClick: onPress }, children),
    ScrollView: container,
    StyleSheet: { create: <T,>(styles: T) => styles },
    Text: ({ accessibilityRole, children }: Props) =>
      React.createElement(
        accessibilityRole === "header" ? "h1" : "span",
        null,
        children,
      ),
    View: container,
  };
});
vi.mock("../lib/analytics-provider", () => ({
  useMobileAnalytics: () => ({
    ...state.value,
    decide: state.decide,
    retry: state.retry,
  }),
}));

// Les doubles natifs sont installés avant la résolution de la route.
// eslint-disable-next-line import/first
import PrivacyScreen from "../app/privacy";

afterEach(cleanup);
beforeEach(() => {
  state.decide.mockReset();
  state.retry.mockReset();
  state.value.decision = "unknown";
  state.value.message = "";
  state.value.status = "ready";
});

describe("centre de confidentialité mobile", () => {
  it("propose accepter ou refuser sans lier le choix au compte", () => {
    render(<PrivacyScreen />);

    expect(screen.getByText(/n’est pas lié à votre compte/i)).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Autoriser la mesure facultative",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Refuser ou retirer la mesure" }),
    );

    expect(state.decide).toHaveBeenNthCalledWith(1, "granted");
    expect(state.decide).toHaveBeenNthCalledWith(2, "denied");
  });

  it("garde le retrait disponible quand le consentement est actif", () => {
    state.value.decision = "granted";
    render(<PrivacyScreen />);

    fireEvent.click(
      screen.getByRole("button", { name: "Refuser ou retirer la mesure" }),
    );
    expect(state.decide).toHaveBeenCalledWith("denied");
  });

  it("laisse relire une préférence locale en erreur", () => {
    state.value.status = "error";
    state.value.message = "Préférence illisible";
    render(<PrivacyScreen />);

    fireEvent.click(
      screen.getByRole("button", { name: "Réessayer l’opération locale" }),
    );
    expect(state.retry).toHaveBeenCalledOnce();
  });
});
