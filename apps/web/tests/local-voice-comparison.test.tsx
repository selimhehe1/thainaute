import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LocalVoiceComparison } from "../app/learn/demo/local-voice-comparison";
import {
  type ActiveLocalVoiceRecording,
  type LocalVoiceCapture,
  type LocalVoiceRecorder,
  LocalVoiceRecorderError,
} from "../lib/client/local-voice-recorder";

function fakeRecording() {
  let resolve!: (capture: LocalVoiceCapture) => void;
  let reject!: (error: LocalVoiceRecorderError) => void;
  let settled = false;
  const completion = new Promise<LocalVoiceCapture>(
    (resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    },
  );
  const capture = {
    blob: new Blob(["local-only"], { type: "audio/webm" }),
    durationMs: 500,
    stoppedByLimit: false,
  } satisfies LocalVoiceCapture;
  const active: ActiveLocalVoiceRecording = {
    completion,
    startedAt: performance.now(),
    cancel: vi.fn(() => {
      if (settled) return;
      settled = true;
      reject(new LocalVoiceRecorderError("cancelled"));
    }),
    interrupt: vi.fn(() => {
      if (settled) return;
      settled = true;
      reject(new LocalVoiceRecorderError("interrupted"));
    }),
    stop: vi.fn(() => {
      if (!settled) {
        settled = true;
        resolve(capture);
      }
      return completion;
    }),
  };
  return { active, capture };
}

function fakeDeferredStopRecording() {
  let reject!: (error: LocalVoiceRecorderError) => void;
  let settled = false;
  const completion = new Promise<LocalVoiceCapture>(
    (_resolve, rejectPromise) => {
      reject = rejectPromise;
    },
  );
  const active: ActiveLocalVoiceRecording = {
    completion,
    startedAt: performance.now(),
    cancel: vi.fn(() => {
      if (settled) return;
      settled = true;
      reject(new LocalVoiceRecorderError("cancelled"));
    }),
    interrupt: vi.fn(() => {
      if (settled) return;
      settled = true;
      reject(new LocalVoiceRecorderError("interrupted"));
    }),
    stop: vi.fn(() => completion),
  };
  return { active };
}

function fakeRecorder(
  ...recordings: readonly { readonly active: ActiveLocalVoiceRecording }[]
) {
  let index = 0;
  return {
    start: vi.fn(() => {
      const recording = recordings[index];
      index += 1;
      if (recording === undefined) {
        return Promise.reject(new LocalVoiceRecorderError("unknown"));
      }
      return Promise.resolve(recording.active);
    }),
  } satisfies LocalVoiceRecorder;
}

beforeEach(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn(() => "blob:local-voice"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
    () => undefined,
  );
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(
    () => undefined,
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("comparaison vocale locale web", () => {
  it("demande le microphone après le clic, crée B puis révoque son URL à la suppression", async () => {
    const user = userEvent.setup();
    const first = fakeRecording();
    const recorder = fakeRecorder(first);
    render(
      <LocalVoiceComparison
        modelAudioSrc="/audio/fixture-tone.wav"
        recorder={recorder}
      />,
    );

    expect(recorder.start).not.toHaveBeenCalled();
    expect(
      screen.getByLabelText("Lire le signal modèle fictif"),
    ).toHaveAttribute("src", "/audio/fixture-tone.wav");
    const modelBeforePermission = screen.getByLabelText(
      "Lire le signal modèle fictif",
    );
    const pauseBeforePermission = vi.fn();
    (modelBeforePermission as HTMLAudioElement).pause = pauseBeforePermission;

    await user.click(screen.getByRole("button", { name: "M’enregistrer" }));
    expect(recorder.start).toHaveBeenCalledOnce();
    expect(pauseBeforePermission).toHaveBeenCalledOnce();
    expect(pauseBeforePermission.mock.invocationCallOrder[0]).toBeLessThan(
      recorder.start.mock.invocationCallOrder[0] ?? Infinity,
    );
    expect(
      await screen.findByRole("button", { name: "Arrêter l’enregistrement" }),
    ).toBeEnabled();
    await user.click(
      screen.getByRole("button", { name: "Arrêter l’enregistrement" }),
    );

    const localAudio = await screen.findByLabelText("Lire ma prise locale");
    expect(localAudio).toHaveAttribute("src", "blob:local-voice");
    const modelAudio = screen.getByLabelText("Lire le signal modèle fictif");
    const pauseModel = vi.fn();
    const pauseLocal = vi.fn();
    (modelAudio as HTMLAudioElement).pause = pauseModel;
    (localAudio as HTMLAudioElement).pause = pauseLocal;
    fireEvent.play(localAudio);
    expect(pauseModel).toHaveBeenCalledOnce();
    fireEvent.play(modelAudio);
    expect(pauseLocal).toHaveBeenCalledOnce();
    fireEvent.error(localAudio);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "La lecture A/B est indisponible.",
    );

    await user.click(
      screen.getByRole("button", { name: "Supprimer ma prise" }),
    );

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:local-voice");
    expect(pauseModel).toHaveBeenCalledTimes(2);
    expect(pauseLocal).toHaveBeenCalledTimes(2);
    expect(localAudio).not.toHaveAttribute("src");
    expect(
      screen.queryByLabelText("Lire ma prise locale"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Prise supprimée de cet onglet.")).toBeVisible();
  });

  it("verrouille et repause le signal A des la demande de permission", async () => {
    const user = userEvent.setup();
    const onBeforeCapture = vi.fn();
    const recorder: LocalVoiceRecorder = {
      start: vi.fn(
        () => new Promise<ActiveLocalVoiceRecording>(() => undefined),
      ),
    };
    render(
      <LocalVoiceComparison
        modelAudioSrc="/audio/fixture-tone.wav"
        onBeforeCapture={onBeforeCapture}
        recorder={recorder}
      />,
    );
    const modelAudio = screen.getByLabelText("Lire le signal modèle fictif");
    const pauseModel = vi.fn();
    (modelAudio as HTMLAudioElement).pause = pauseModel;
    expect(modelAudio).toHaveAttribute("controls");

    await user.click(screen.getByRole("button", { name: "M’enregistrer" }));

    expect(onBeforeCapture).toHaveBeenCalledOnce();
    expect(onBeforeCapture.mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(recorder.start).mock.invocationCallOrder[0] ?? Infinity,
    );
    expect(modelAudio).not.toHaveAttribute("controls");
    expect(modelAudio).toHaveAttribute("aria-disabled", "true");
    expect(pauseModel).toHaveBeenCalledOnce();

    fireEvent.play(modelAudio);

    expect(pauseModel).toHaveBeenCalledTimes(2);
  });

  it("garde A verrouille et supprime une finalisation si l'onglet devient cache", async () => {
    const user = userEvent.setup();
    const first = fakeDeferredStopRecording();
    const recorder = fakeRecorder(first);
    render(
      <LocalVoiceComparison
        modelAudioSrc="/audio/fixture-tone.wav"
        recorder={recorder}
      />,
    );
    await user.click(screen.getByRole("button", { name: "M’enregistrer" }));
    const stopButton = await screen.findByRole("button", {
      name: "Arrêter l’enregistrement",
    });
    const modelAudio = screen.getByLabelText("Lire le signal modèle fictif");
    const pauseModel = vi.fn();
    (modelAudio as HTMLAudioElement).pause = pauseModel;

    await user.click(stopButton);

    expect(first.active.stop).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("button", { name: "Finalisation de la prise…" }),
    ).toBeDisabled();
    expect(modelAudio).not.toHaveAttribute("controls");
    fireEvent.play(modelAudio);
    expect(pauseModel).toHaveBeenCalledOnce();

    const originalVisibility = Object.getOwnPropertyDescriptor(
      document,
      "visibilityState",
    );
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    fireEvent(document, new Event("visibilitychange"));
    if (originalVisibility === undefined) {
      Reflect.deleteProperty(document, "visibilityState");
    } else {
      Object.defineProperty(document, "visibilityState", originalVisibility);
    }

    await waitFor(() => expect(first.active.interrupt).toHaveBeenCalledOnce());
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La prise a été interrompue et supprimée.",
    );
  });

  it("détruit l'ancienne prise avant d'en demander une nouvelle", async () => {
    const user = userEvent.setup();
    const first = fakeRecording();
    const second = fakeRecording();
    const recorder = fakeRecorder(first, second);
    render(
      <LocalVoiceComparison
        modelAudioSrc="/audio/fixture-tone.wav"
        recorder={recorder}
      />,
    );
    await user.click(screen.getByRole("button", { name: "M’enregistrer" }));
    await user.click(
      await screen.findByRole("button", { name: "Arrêter l’enregistrement" }),
    );
    const localAudio = await screen.findByLabelText("Lire ma prise locale");
    expect(URL.createObjectURL).toHaveBeenCalledWith(first.capture.blob);
    const modelAudio = screen.getByLabelText("Lire le signal modèle fictif");
    const pauseModel = vi.fn();
    const pauseLocal = vi.fn();
    (modelAudio as HTMLAudioElement).pause = pauseModel;
    (localAudio as HTMLAudioElement).pause = pauseLocal;

    await user.click(screen.getByRole("button", { name: "Refaire ma prise" }));

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:local-voice");
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(pauseModel).toHaveBeenCalledOnce();
    expect(pauseLocal).toHaveBeenCalledOnce();
    expect(recorder.start).toHaveBeenCalledTimes(2);
    expect(pauseModel.mock.invocationCallOrder[0]).toBeLessThan(
      recorder.start.mock.invocationCallOrder[1] ?? Infinity,
    );
    expect(pauseLocal.mock.invocationCallOrder[0]).toBeLessThan(
      recorder.start.mock.invocationCallOrder[1] ?? Infinity,
    );
    expect(
      vi.mocked(URL.revokeObjectURL).mock.invocationCallOrder[0],
    ).toBeLessThan(recorder.start.mock.invocationCallOrder[1] ?? Infinity);
    expect(
      screen.queryByLabelText("Lire ma prise locale"),
    ).not.toBeInTheDocument();
  });

  it("annule une capture encore active au démontage", async () => {
    const user = userEvent.setup();
    const first = fakeRecording();
    const recorder = fakeRecorder(first);
    const { unmount } = render(
      <LocalVoiceComparison
        modelAudioSrc="/audio/fixture-tone.wav"
        recorder={recorder}
      />,
    );
    await user.click(screen.getByRole("button", { name: "M’enregistrer" }));
    await screen.findByRole("button", { name: "Arrêter l’enregistrement" });

    unmount();

    expect(first.active.cancel).toHaveBeenCalledOnce();
  });

  it("annule une demande de permission lors d'une mise en cache BFCache", async () => {
    const user = userEvent.setup();
    let permissionSignal: AbortSignal | undefined;
    const recorder: LocalVoiceRecorder = {
      start: vi.fn((options) => {
        permissionSignal = options?.signal;
        return new Promise<ActiveLocalVoiceRecording>(() => undefined);
      }),
    };
    render(
      <LocalVoiceComparison
        modelAudioSrc="/audio/fixture-tone.wav"
        recorder={recorder}
      />,
    );
    await user.click(screen.getByRole("button", { name: "M’enregistrer" }));
    await screen.findByRole("button", {
      name: "Autorisation du microphone…",
    });

    fireEvent(
      window,
      Object.assign(new Event("pagehide"), { persisted: true }),
    );

    expect(permissionSignal?.aborted).toBe(true);
    expect(screen.getByRole("button", { name: "M’enregistrer" })).toBeEnabled();
  });

  it("annule une capture active lors d'une mise en cache BFCache", async () => {
    const user = userEvent.setup();
    const first = fakeRecording();
    const recorder = fakeRecorder(first);
    render(
      <LocalVoiceComparison
        modelAudioSrc="/audio/fixture-tone.wav"
        recorder={recorder}
      />,
    );
    await user.click(screen.getByRole("button", { name: "M’enregistrer" }));
    await screen.findByRole("button", { name: "Arrêter l’enregistrement" });

    fireEvent(
      window,
      Object.assign(new Event("pagehide"), { persisted: true }),
    );

    expect(first.active.cancel).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "M’enregistrer" })).toBeEnabled();
  });

  it("interrompt et supprime la prise partielle quand l'onglet devient caché", async () => {
    const user = userEvent.setup();
    const first = fakeRecording();
    const recorder = fakeRecorder(first);
    render(
      <LocalVoiceComparison
        modelAudioSrc="/audio/fixture-tone.wav"
        recorder={recorder}
      />,
    );
    await user.click(screen.getByRole("button", { name: "M’enregistrer" }));
    await screen.findByRole("button", { name: "Arrêter l’enregistrement" });
    const originalVisibility = Object.getOwnPropertyDescriptor(
      document,
      "visibilityState",
    );
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });

    fireEvent(document, new Event("visibilitychange"));
    if (originalVisibility === undefined) {
      Reflect.deleteProperty(document, "visibilityState");
    } else {
      Object.defineProperty(document, "visibilityState", originalVisibility);
    }
    await waitFor(() => expect(first.active.interrupt).toHaveBeenCalledOnce());
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La prise a été interrompue et supprimée.",
    );
  });

  it("révoque l'URL d'une prise finalisée au démontage", async () => {
    const user = userEvent.setup();
    const first = fakeRecording();
    const recorder = fakeRecorder(first);
    const { unmount } = render(
      <LocalVoiceComparison
        modelAudioSrc="/audio/fixture-tone.wav"
        recorder={recorder}
      />,
    );
    await user.click(screen.getByRole("button", { name: "M’enregistrer" }));
    await user.click(
      await screen.findByRole("button", { name: "Arrêter l’enregistrement" }),
    );
    await screen.findByLabelText("Lire ma prise locale");

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:local-voice");
  });

  it("révoque une prise finalisée et stoppe A/B lors d'une mise en cache BFCache", async () => {
    const user = userEvent.setup();
    const first = fakeRecording();
    const recorder = fakeRecorder(first);
    render(
      <LocalVoiceComparison
        modelAudioSrc="/audio/fixture-tone.wav"
        recorder={recorder}
      />,
    );
    await user.click(screen.getByRole("button", { name: "M’enregistrer" }));
    await user.click(
      await screen.findByRole("button", { name: "Arrêter l’enregistrement" }),
    );
    const localAudio = await screen.findByLabelText("Lire ma prise locale");
    expect(URL.createObjectURL).toHaveBeenCalledWith(first.capture.blob);
    const modelAudio = screen.getByLabelText("Lire le signal modèle fictif");
    const pauseModel = vi.fn();
    const pauseLocal = vi.fn();
    (modelAudio as HTMLAudioElement).pause = pauseModel;
    (localAudio as HTMLAudioElement).pause = pauseLocal;

    fireEvent(
      window,
      Object.assign(new Event("pagehide"), { persisted: true }),
    );

    expect(pauseModel).toHaveBeenCalledOnce();
    expect(pauseLocal).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:local-voice");
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(localAudio).not.toHaveAttribute("src");
    expect(
      screen.queryByLabelText("Lire ma prise locale"),
    ).not.toBeInTheDocument();
  });

  it.each([
    ["permission_denied", "L’accès au microphone a été refusé."],
    [
      "permission_blocked",
      "L’accès au microphone est bloqué par la sécurité du navigateur ou de la page.",
    ],
  ] as const)(
    "affiche une catégorie sûre pour %s sans recopier l'erreur du navigateur",
    async (code, expectedMessage) => {
      const user = userEvent.setup();
      const recorder: LocalVoiceRecorder = {
        start: vi.fn(() => Promise.reject(new LocalVoiceRecorderError(code))),
      };
      render(
        <LocalVoiceComparison
          modelAudioSrc="/audio/fixture-tone.wav"
          recorder={recorder}
        />,
      );

      await user.click(screen.getByRole("button", { name: "M’enregistrer" }));

      await waitFor(() =>
        expect(screen.getByRole("alert")).toHaveTextContent(expectedMessage),
      );
    },
  );
});
