import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DemoExperience } from "../app/learn/demo/demo-experience";
import { WebAttemptOutboxStore } from "../lib/client/attempt-outbox-store";
import { WebAuthSessionProvider } from "../lib/client/auth-session";

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

class FakeLessonAudio {
  public static readonly instances: FakeLessonAudio[] = [];

  public onended: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  public readonly load = vi.fn();
  public readonly pause = vi.fn();
  public readonly play = vi.fn(() => Promise.resolve());
  public readonly removeAttribute = vi.fn();

  public constructor(public readonly initialSrc?: string) {
    FakeLessonAudio.instances.push(this);
  }
}

const NativeAudio = globalThis.Audio;

function renderDemo() {
  return render(
    <WebAuthSessionProvider>
      <DemoExperience lesson={lesson} />
    </WebAuthSessionProvider>,
  );
}

beforeEach(async () => {
  FakeLessonAudio.instances.splice(0);
  Object.defineProperty(globalThis, "Audio", {
    configurable: true,
    value: FakeLessonAudio as unknown as typeof Audio,
  });
  await new WebAttemptOutboxStore("thainaute-demo-v1").deleteForTests();
});

afterEach(() => {
  cleanup();
  Object.defineProperty(globalThis, "Audio", {
    configurable: true,
    value: NativeAudio,
  });
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("leçon web fictive", () => {
  it("arrete chaque signal detache avant remplacement, changement d'etape et pagehide", async () => {
    const user = userEvent.setup();
    renderDemo();
    const startButton = screen.getByRole("button", { name: "Commencer" });
    await waitFor(() => expect(startButton).toBeEnabled());
    const listenButton = screen.getByRole("button", {
      name: "Écouter le signal",
    });

    await user.click(listenButton);
    const firstAudio = FakeLessonAudio.instances[0];
    expect(firstAudio?.initialSrc).toBe("/audio/fixture-tone.wav");
    expect(firstAudio?.play).toHaveBeenCalledOnce();

    await user.click(listenButton);
    const secondAudio = FakeLessonAudio.instances[1];
    expect(firstAudio?.pause).toHaveBeenCalledOnce();
    expect(firstAudio?.removeAttribute).toHaveBeenCalledWith("src");
    expect(firstAudio?.load).toHaveBeenCalledOnce();
    expect(secondAudio?.play).toHaveBeenCalledOnce();

    await user.click(startButton);
    expect(secondAudio?.pause).toHaveBeenCalledOnce();
    expect(secondAudio?.removeAttribute).toHaveBeenCalledWith("src");
    expect(secondAudio?.load).toHaveBeenCalledOnce();

    await user.click(
      screen.getByRole("button", { name: "Réécouter le signal" }),
    );
    const thirdAudio = FakeLessonAudio.instances[2];
    expect(thirdAudio?.play).toHaveBeenCalledOnce();

    fireEvent(
      window,
      Object.assign(new Event("pagehide"), { persisted: true }),
    );
    expect(thirdAudio?.pause).toHaveBeenCalledOnce();
    expect(thirdAudio?.removeAttribute).toHaveBeenCalledWith("src");
    expect(thirdAudio?.load).toHaveBeenCalledOnce();
  });

  it("annonce le caractère non publiable et termine une tentative", async () => {
    const user = userEvent.setup();
    renderDemo();

    expect(
      screen.getByText("Donnée fictive — non publiable"),
    ).toBeInTheDocument();
    const startButton = screen.getByRole("button", { name: "Commencer" });
    await waitFor(() => expect(startButton).toBeEnabled());
    await user.click(startButton);
    await user.click(screen.getByRole("radio", { name: "Option A" }));
    await user.click(screen.getByRole("button", { name: "Valider" }));

    const result = await screen.findByRole("heading", {
      name: "La boucle technique fonctionne.",
    });
    await waitFor(() => expect(result).toHaveFocus());
    expect(screen.getByText("250 ‰")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Écouter A, puis votre prise B." }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "M’enregistrer" })).toBeEnabled();
  });

  it("conserve un ancien journal illisible au lieu de l'écraser", async () => {
    window.localStorage.setItem("thainaute.fixture.attempts.v1", "{invalide");
    renderDemo();

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
    const { unmount } = renderDemo();
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

    const inspector = new WebAttemptOutboxStore("thainaute-demo-v1");
    expect((await inspector.read()).entries).toHaveLength(1);
    await inspector.deleteForTests();
    const learningInspector = new WebAttemptOutboxStore();
    expect((await learningInspector.read()).entries).toHaveLength(0);
    await learningInspector.deleteForTests();
  });
});
