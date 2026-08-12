import { readCompiledLessonBundle } from "@thainaute/content";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: {
    session: null as null | { access_token: string },
    sessionBoundaryRevision: 1,
    status: "signed_out" as "signed_out" | "signed_in",
  },
  expedition: vi.fn(),
}));

vi.mock("../lib/client/auth-session", () => ({
  useWebAuthSession: () => mocks.auth,
}));

vi.mock("../app/learn/demo/expedition-experience", () => ({
  ExpeditionExperience: (props: unknown) => {
    mocks.expedition(props);
    return null;
  },
}));

import { EditorLessonPreview } from "../app/learn/lecon/[lecon]/editor-lesson-preview";

function deferred<T>(): {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
} {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("audios de l'aperçu éditeur", () => {
  const bundle = readCompiledLessonBundle("u01-l1a");
  if (bundle === null) throw new Error("Fixture interne u01-l1a absente.");
  const assetId = bundle.audioManifest.entries[0]!.assetId;
  const protectedPath = `/learn/lecon/u01-l1a/preview/audio/${assetId}`;
  const payload = {
    kind: "compiled" as const,
    lesson: bundle.lesson,
    audioSources: { [assetId]: protectedPath },
  };

  beforeEach(() => {
    mocks.auth.status = "signed_out";
    mocks.auth.session = null;
    mocks.auth.sessionBoundaryRevision = 1;
    mocks.expedition.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("attend l'autorisation puis révoque chaque Blob URL aux frontières de session", async () => {
    const firstPreview = deferred<Response>();
    let previewRequestCount = 0;
    const fetchMock = vi.fn(
      async (
        input: RequestInfo | URL,
        init?: RequestInit,
      ): Promise<Response> => {
        const url = String(input);
        if (url === "/learn/lecon/u01-l1a/preview") {
          previewRequestCount += 1;
          if (previewRequestCount === 1) return firstPreview.promise;
          return Response.json(payload);
        }
        if (url === protectedPath) {
          return new Response(new Uint8Array([82, 73, 70, 70]), {
            headers: { "Content-Type": "audio/wav" },
          });
        }
        throw new Error(`Requête inattendue : ${url} ${String(init?.method)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    let blobSequence = 0;
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockImplementation(() => `blob:editor-audio-${++blobSequence}`);
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);

    const view = render(<EditorLessonPreview lessonId="u01-l1a" />);
    expect(fetchMock).not.toHaveBeenCalled();

    mocks.auth.status = "signed_in";
    mocks.auth.session = { access_token: "editor-token-1" };
    view.rerender(<EditorLessonPreview lessonId="u01-l1a" />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(mocks.expedition).not.toHaveBeenCalled();
    expect(createObjectURL).not.toHaveBeenCalled();

    firstPreview.resolve(Response.json(payload));
    await waitFor(() => expect(mocks.expedition).toHaveBeenCalled());

    const firstAudioRequest = fetchMock.mock.calls.find(
      ([url]) => String(url) === protectedPath,
    );
    expect(firstAudioRequest).toBeDefined();
    expect(firstAudioRequest?.[1]?.headers).toEqual({
      Authorization: "Bearer editor-token-1",
    });
    expect(String(firstAudioRequest?.[0])).not.toContain("editor-token-1");
    expect(mocks.expedition).toHaveBeenLastCalledWith(
      expect.objectContaining({
        audioSources: { [assetId]: "blob:editor-audio-1" },
      }),
    );

    mocks.auth.sessionBoundaryRevision = 2;
    mocks.auth.session = { access_token: "editor-token-2" };
    view.rerender(<EditorLessonPreview lessonId="u01-l1a" />);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:editor-audio-1");

    await waitFor(() =>
      expect(mocks.expedition).toHaveBeenLastCalledWith(
        expect.objectContaining({
          audioSources: { [assetId]: "blob:editor-audio-2" },
        }),
      ),
    );
    view.unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:editor-audio-2");
  });
});
