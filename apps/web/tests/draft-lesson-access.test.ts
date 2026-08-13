import { readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  publicAudioSources,
  readCompiledLessonBundle,
} from "@thainaute/content";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authorize: vi.fn(),
  configuration: null as null | {
    mode: "fixture";
    url: string;
    publishableKey: string;
  },
}));

vi.mock("../lib/server/content-studio/runtime", () => ({
  readContentStudioConfiguration: () => mocks.configuration,
}));

vi.mock("../lib/server/content-studio/supabase-auth", () => ({
  createSupabaseContentStudioAuthorizer: () => ({
    authorize: mocks.authorize,
  }),
}));

import { ContentStudioError } from "../lib/server/content-studio/errors";
import { GET as getProtectedAudio } from "../app/learn/lecon/[lecon]/preview/audio/[assetId]/route";
import { GET as getPreview } from "../app/learn/lecon/[lecon]/preview/route";

function request(authorization?: string): Request {
  return new Request("https://thainaute.example/learn/lecon/u13-l13b/preview", {
    headers:
      authorization === undefined ? {} : { Authorization: authorization },
  });
}

const context = (lessonId: string) => ({
  params: Promise.resolve({ lecon: lessonId }),
});

const audioContext = (lessonId: string, assetId: string) => ({
  params: Promise.resolve({ lecon: lessonId, assetId }),
});

function audioRequest(
  lessonId: string,
  assetId: string,
  authorization?: string,
): Request {
  return new Request(
    `https://thainaute.example/learn/lecon/${lessonId}/preview/audio/${assetId}`,
    {
      headers:
        authorization === undefined ? {} : { Authorization: authorization },
    },
  );
}

describe("accès aux brouillons d'autorat", () => {
  beforeEach(() => {
    mocks.configuration = null;
    mocks.authorize.mockReset();
  });

  it("répond 404 sans mode serveur explicite et ne consulte pas Auth", async () => {
    const response = await getPreview(
      request("Bearer header.payload.token"),
      context("u13-l13b"),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.authorize).not.toHaveBeenCalled();
  });

  it("répond 404 sans Bearer même lorsque le mode est activé", async () => {
    mocks.configuration = {
      mode: "fixture",
      url: "https://project.supabase.co",
      publishableKey: "sb_publishable_test_value_long_enough",
    };

    const response = await getPreview(request(), context("u13-l13b"));

    expect(response.status).toBe(404);
    expect(mocks.authorize).not.toHaveBeenCalled();
  });

  it("ne délivre le paquet qu'après autorisation content_editor", async () => {
    mocks.configuration = {
      mode: "fixture",
      url: "https://project.supabase.co",
      publishableKey: "sb_publishable_test_value_long_enough",
    };
    mocks.authorize.mockResolvedValue(undefined);

    const response = await getPreview(
      request("Bearer header.payload.editor-token"),
      context("u13-l13b"),
    );
    const body = (await response.json()) as {
      kind: string;
      lesson: { titleFr: string };
    };

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.authorize).toHaveBeenCalledOnce();
    expect(body.kind).toBe("compiled");
    expect(body.lesson.titleFr).toBe("นะ, la particule qui adoucit");
    expect(body.lesson.titleFr).not.toMatch(/titre de travail|arbitrage/iu);
  });

  it("masque le refus de rôle content_editor derrière une 404", async () => {
    mocks.configuration = {
      mode: "fixture",
      url: "https://project.supabase.co",
      publishableKey: "sb_publishable_test_value_long_enough",
    };
    mocks.authorize.mockRejectedValue(new ContentStudioError("not_found"));

    const response = await getPreview(
      request("Bearer header.payload.non-editor"),
      context("u13-l13b"),
    );

    expect(response.status).toBe(404);
  });

  it("masque le WAV à l'anonyme sans consulter Auth", async () => {
    mocks.configuration = {
      mode: "fixture",
      url: "https://project.supabase.co",
      publishableKey: "sb_publishable_test_value_long_enough",
    };
    const bundle = readCompiledLessonBundle("u01-l1a");
    expect(bundle).not.toBeNull();
    const assetId = bundle!.audioManifest.entries[0]!.assetId;

    const response = await getProtectedAudio(
      audioRequest("u01-l1a", assetId),
      audioContext("u01-l1a", assetId),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.authorize).not.toHaveBeenCalled();
  });

  it("masque le WAV à un compte sans rôle content_editor", async () => {
    mocks.configuration = {
      mode: "fixture",
      url: "https://project.supabase.co",
      publishableKey: "sb_publishable_test_value_long_enough",
    };
    mocks.authorize.mockRejectedValue(new ContentStudioError("not_found"));
    const bundle = readCompiledLessonBundle("u01-l1a");
    expect(bundle).not.toBeNull();
    const assetId = bundle!.audioManifest.entries[0]!.assetId;

    const response = await getProtectedAudio(
      audioRequest("u01-l1a", assetId, "Bearer header.payload.non-editor"),
      audioContext("u01-l1a", assetId),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).not.toContain("audio/");
    expect(mocks.authorize).toHaveBeenCalledOnce();
  });

  it("refuse la porte éditeur à une leçon devenue publique", async () => {
    mocks.configuration = {
      mode: "fixture",
      url: "https://project.supabase.co",
      publishableKey: "sb_publishable_test_value_long_enough",
    };
    mocks.authorize.mockResolvedValue(undefined);
    const bundle = readCompiledLessonBundle("u01-l1a");
    expect(bundle).not.toBeNull();
    const entry = bundle!.audioManifest.entries[0]!;

    const response = await getProtectedAudio(
      audioRequest(
        "u01-l1a",
        entry.assetId,
        "Bearer header.payload.editor-token",
      ),
      audioContext("u01-l1a", entry.assetId),
    );
    const bytes = new Uint8Array(await response.arrayBuffer());

    // u01-l1a est SIGNÉE et publiée. Son audio doit désormais passer par la
    // route publique, pas par la porte de prévisualisation éditoriale : cette
    // porte n'existe que pour ce qui n'est pas encore publiable, et servir un
    // contenu publié par un chemin réservé aux brouillons brouillerait la
    // frontière que l'ADR-0041 protège.
    expect(response.status).toBe(404);
    // Le corps est une erreur, jamais l'audio : aucun octet du WAV ne doit
    // sortir par ce chemin.
    expect(response.headers.get("content-type")).not.toBe("audio/wav");
    expect(bytes.byteLength).toBeLessThan(entry.byteLength);
    expect(new TextDecoder().decode(bytes.slice(0, 4))).not.toBe("RIFF");
  });

  it("ne publie plus aucun chemin audio des manifestes internes", async () => {
    mocks.configuration = {
      mode: "fixture",
      url: "https://project.supabase.co",
      publishableKey: "sb_publishable_test_value_long_enough",
    };
    mocks.authorize.mockResolvedValue(undefined);

    for (const lessonId of [
      "u01-l1a",
      "u01-l1b",
      "u01-l1c",
      "u01-l1d",
      "u01-l1e",
      "u01-l1f",
    ]) {
      const bundle = readCompiledLessonBundle(lessonId);
      // L'invariant n'est plus « tout est brouillon » mais « un brouillon ne
      // publie aucun chemin audio ». Une leçon signée, elle, en publie, et
      // c'est exactement ce qu'on attend d'elle.
      const brouillon = bundle?.lesson.workflowStatus === "draft";
      expect(bundle?.lesson.visibility).toBe(brouillon ? "internal" : "public");
      if (!brouillon) continue;
      expect(publicAudioSources(bundle!)).toEqual({});
      expect(
        bundle?.audioManifest.entries.flatMap(
          ({ distributionPaths }) => distributionPaths,
        ),
      ).not.toContainEqual(expect.stringContaining("apps/web/public/audio/"));
    }

    const response = await getPreview(
      request("Bearer header.payload.editor-token"),
      context("u01-l1a"),
    );
    const payload = (await response.json()) as {
      audioSources: Record<string, string>;
    };
    expect(response.status).toBe(200);
    expect(Object.values(payload.audioSources)).not.toContainEqual(
      expect.stringMatching(/^\/audio\//u),
    );
    expect(Object.values(payload.audioSources)).toContainEqual(
      expect.stringMatching(
        /^\/learn\/lecon\/u01-l1a\/preview\/audio\/[0-9a-f-]+$/u,
      ),
    );
  });

  it("ne pré-rend plus les identifiants de brouillon et retire le catalogue public", async () => {
    const lessonPage = await readFile(
      join(process.cwd(), "app/learn/lecon/[lecon]/page.tsx"),
      "utf8",
    );
    const pathPage = await readFile(
      join(process.cwd(), "app/path/page.tsx"),
      "utf8",
    );

    expect(lessonPage).not.toContain("generateStaticParams");
    expect(lessonPage).not.toContain("authoringCompiledLessonIds");
    expect(pathPage).not.toContain("authoringCatalog");
    expect(pathPage).not.toContain("/learn/lecon/");
  });
});
