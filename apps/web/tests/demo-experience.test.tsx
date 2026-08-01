import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DemoExperience } from "../app/learn/demo/demo-experience";
import { WebAttemptOutboxStore } from "../lib/client/attempt-outbox-store";

const lesson = {
  versionId: "10000000-0000-4000-8000-000000000002",
  title: "Boucle technique locale",
  objective: "Vérifier la boucle sans contenu pédagogique.",
  itemId: "10000000-0000-4000-8000-000000000003",
  thaiRaw: "ก่",
  exercise: {
    id: "10000000-0000-4000-8000-000000000004",
    prompt: "Sélectionnez l’option technique A.",
    options: [
      { id: "20000000-0000-4000-8000-000000000001", labelFr: "Option A" },
      { id: "20000000-0000-4000-8000-000000000002", labelFr: "Option B" },
    ],
    correctOptionId: "20000000-0000-4000-8000-000000000001",
    feedback: {
      correctFr: "La boucle technique fonctionne.",
      incorrectFr: "Réessayez.",
    },
  },
};

beforeEach(async () => {
  await new WebAttemptOutboxStore().deleteForTests();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("leçon web fictive", () => {
  it("annonce le caractère non publiable et termine une tentative", async () => {
    const user = userEvent.setup();
    render(<DemoExperience lesson={lesson} />);

    expect(
      screen.getByText("Donnée fictive — non publiable"),
    ).toBeInTheDocument();
    const startButton = screen.getByRole("button", { name: "Commencer" });
    await waitFor(() => expect(startButton).toBeEnabled());
    await user.click(startButton);
    await user.click(screen.getByRole("radio", { name: "Option A" }));
    await user.click(screen.getByRole("button", { name: "Valider" }));

    expect(
      await screen.findByRole("heading", {
        name: "La boucle technique fonctionne.",
      }),
    ).toHaveFocus();
    expect(screen.getByText("250 ‰")).toBeInTheDocument();
  });

  it("conserve un ancien journal illisible au lieu de l'écraser", async () => {
    window.localStorage.setItem("thainaute.fixture.attempts.v1", "{invalide");
    render(<DemoExperience lesson={lesson} />);

    expect(await screen.findByText("Journal local indisponible")).toBeVisible();
    expect(window.localStorage.getItem("thainaute.fixture.attempts.v1")).toBe(
      "{invalide",
    );
    expect(
      screen.getByRole("button", { name: "Réessayer le stockage" }),
    ).toBeEnabled();
  });

  it("n'enregistre qu'une tentative lors d'une double activation", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<DemoExperience lesson={lesson} />);
    const startButton = screen.getByRole("button", { name: "Commencer" });
    await waitFor(() => expect(startButton).toBeEnabled());
    await user.click(startButton);
    await user.click(screen.getByRole("radio", { name: "Option A" }));

    const submit = screen.getByRole("button", { name: "Valider" });
    fireEvent.click(submit);
    fireEvent.click(submit);
    await screen.findByRole("heading", {
      name: "La boucle technique fonctionne.",
    });
    unmount();

    const inspector = new WebAttemptOutboxStore();
    expect((await inspector.read()).entries).toHaveLength(1);
    await inspector.deleteForTests();
  });
});
