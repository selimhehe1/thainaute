import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import {
  readAuthoringCompiledLessonBundle,
  readCompiledLessonBundle,
  type AudioManifest,
} from "@thainaute/content";

import {
  authorizeContentPreviewRequest,
  hiddenContentPreviewResponse,
} from "@/lib/server/content-studio/preview-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const repositoryRoots = [process.cwd(), resolve(process.cwd(), "../..")].filter(
  (candidate, index, candidates) => candidates.indexOf(candidate) === index,
);

function isWithin(root: string, candidate: string): boolean {
  const pathFromRoot = relative(root, candidate);
  return (
    pathFromRoot !== "" &&
    !pathFromRoot.startsWith("..") &&
    !isAbsolute(pathFromRoot)
  );
}

async function readVerifiedAudio(
  lecon: string,
  entry: AudioManifest["entries"][number],
): Promise<ArrayBuffer | null> {
  for (const repositoryRoot of repositoryRoots) {
    const lessonAudioRoot = resolve(
      repositoryRoot,
      "packages/content/assets/audio",
      lecon,
    );
    const absolutePath = resolve(repositoryRoot, entry.canonicalPath);
    if (!isWithin(lessonAudioRoot, absolutePath)) continue;

    try {
      const file = await readFile(absolutePath);
      const actualHash = createHash("sha256").update(file).digest("hex");
      if (file.byteLength !== entry.byteLength || actualHash !== entry.sha256) {
        return null;
      }
      const body = new ArrayBuffer(file.byteLength);
      new Uint8Array(body).set(file);
      return body;
    } catch {
      // Le runtime standalone part de la racine du bundle, tandis que
      // `next dev` part de `apps/web`; la racine suivante couvre l'autre cas.
    }
  }
  return null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ lecon: string; assetId: string }> },
): Promise<Response> {
  const denied = await authorizeContentPreviewRequest(request);
  if (denied !== null) return denied;

  const { lecon, assetId } = await context.params;
  const bundle =
    readCompiledLessonBundle(lecon) ?? readAuthoringCompiledLessonBundle(lecon);
  if (
    bundle === null ||
    bundle.lesson.visibility !== "internal" ||
    bundle.lesson.workflowStatus === "published"
  ) {
    return hiddenContentPreviewResponse();
  }

  const entry = bundle.audioManifest.entries.find(
    (candidate) => candidate.assetId === assetId,
  );
  if (entry === undefined) return hiddenContentPreviewResponse();

  const file = await readVerifiedAudio(lecon, entry);
  if (file === null) return hiddenContentPreviewResponse();

  return new Response(file, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Length": String(file.byteLength),
      "Content-Type": entry.mimeType,
      "Cross-Origin-Resource-Policy": "same-origin",
      Pragma: "no-cache",
      "Referrer-Policy": "no-referrer",
      Vary: "Authorization",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
