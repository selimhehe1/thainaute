"use client";

import {
  editorLessonPreviewPayloadSchema,
  type EditorLessonPreviewPayload,
} from "@thainaute/content/preview";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useWebAuthSession } from "@/lib/client/auth-session";

import { LessonHeader } from "@/components/layout/lesson-header";

import { ExpeditionExperience } from "../../demo/expedition-experience";
import styles from "../../demo/lesson.module.css";

import { DraftLessonPreview } from "./draft-lesson-preview";

type PreviewState =
  | {
      readonly kind: "ready";
      readonly payload: EditorLessonPreviewPayload;
      readonly requestKey: string;
    }
  | { readonly kind: "unavailable"; readonly requestKey: string };

export function EditorLessonPreview({ lessonId }: { lessonId: string }) {
  const auth = useWebAuthSession();
  const [state, setState] = useState<PreviewState | null>(null);
  const requestKey = `${auth.sessionBoundaryRevision}:${lessonId}`;

  useEffect(() => {
    const accessToken = auth.session?.access_token;
    if (auth.status !== "signed_in" || accessToken === undefined) {
      return;
    }

    const controller = new AbortController();
    const objectUrls: string[] = [];
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    void fetch(`/learn/lecon/${encodeURIComponent(lessonId)}/preview`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("preview unavailable");
        return editorLessonPreviewPayloadSchema.parse(await response.json());
      })
      .then(async (payload) => {
        if (payload.kind === "draft") return payload;

        const expectedPrefix = `/learn/lecon/${encodeURIComponent(lessonId)}/preview/audio/`;
        const audioSources = await Promise.all(
          Object.entries(payload.audioSources).map(
            async ([assetId, protectedPath]) => {
              // Le Bearer ne doit jamais suivre une URL absolue ou protocol-relative.
              if (!protectedPath.startsWith(expectedPrefix)) {
                throw new Error("invalid protected audio path");
              }
              const response = await fetch(protectedPath, {
                cache: "no-store",
                headers: { Authorization: `Bearer ${accessToken}` },
                signal: controller.signal,
              });
              if (
                !response.ok ||
                !response.headers.get("content-type")?.startsWith("audio/")
              ) {
                throw new Error("protected audio unavailable");
              }
              const blob = await response.blob();
              if (!active) throw new Error("preview cancelled");
              const objectUrl = URL.createObjectURL(blob);
              objectUrls.push(objectUrl);
              return [assetId, objectUrl] as const;
            },
          ),
        );
        return { ...payload, audioSources: Object.fromEntries(audioSources) };
      })
      .then((payload) => {
        if (active) setState({ kind: "ready", payload, requestKey });
      })
      .catch(() => {
        for (const objectUrl of objectUrls.splice(0)) {
          URL.revokeObjectURL(objectUrl);
        }
        if (active) setState({ kind: "unavailable", requestKey });
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
      for (const objectUrl of objectUrls) URL.revokeObjectURL(objectUrl);
    };
  }, [auth.session?.access_token, auth.status, lessonId, requestKey]);

  const currentState = state?.requestKey === requestKey ? state : null;

  if (auth.status === "signed_in" && currentState?.kind === "ready") {
    if (currentState.payload.kind === "draft") {
      return <DraftLessonPreview draft={currentState.payload.draft} />;
    }
    return (
      <main className={styles.shell}>
        <LessonHeader
          step={`Aperçu éditeur · ${currentState.payload.lesson.exercises.length} exercices`}
        />
        <p className={styles.draftNote} role="note">
          Brouillon interne · tentatives isolées de la progression réelle.
        </p>
        <ExpeditionExperience
          lesson={currentState.payload.lesson}
          audioSources={currentState.payload.audioSources}
        />
      </main>
    );
  }

  const signedOut =
    auth.status === "signed_out" || auth.status === "unconfigured";
  return (
    <main className={styles.shell}>
      <section className={`${styles.card} ${styles.draftCard}`}>
        <p className={styles.eyebrow}>Aperçu éditorial protégé</p>
        <h1>
          {currentState?.kind === "unavailable"
            ? "Cette leçon interne n’est pas accessible."
            : signedOut
              ? "Connectez un compte éditeur."
              : "Vérification de l’autorisation…"}
        </h1>
        <p className={styles.objective}>
          Le contenu n’est chargé qu’après relecture du rôle content_editor par
          le serveur.
        </p>
        {signedOut ? <Link href="/account">Ouvrir le compte</Link> : null}
      </section>
    </main>
  );
}
