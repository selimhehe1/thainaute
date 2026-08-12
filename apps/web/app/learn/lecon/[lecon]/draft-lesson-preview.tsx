import type { EditorLessonPreviewDraft } from "@thainaute/content/preview";
import Link from "next/link";
import type { ReactNode } from "react";

import { LessonHeader } from "@/components/layout/lesson-header";
import { buttonClass } from "@/components/ui/button";

import styles from "../../demo/lesson.module.css";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/gu).map((fragment, index) => {
    const key = `${keyPrefix}-${index}`;
    if (fragment.startsWith("`") && fragment.endsWith("`")) {
      return (
        <code key={key} className={styles.coursCode}>
          {fragment.slice(1, -1)}
        </code>
      );
    }
    if (fragment.startsWith("**") && fragment.endsWith("**")) {
      return <strong key={key}>{fragment.slice(2, -2)}</strong>;
    }
    return <span key={key}>{fragment}</span>;
  });
}

function renderBody(body: string, keyPrefix: string): ReactNode[] {
  return body
    .split(/\n{2,}/u)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => {
      const key = `${keyPrefix}-paragraph-${index}`;
      const lines = paragraph.split(/\n/gu).map((line) => line.trim());
      if (lines.every((line) => line.startsWith(">"))) {
        return (
          <blockquote className={styles.coursCitation} key={key}>
            {lines.map((line, lineIndex) => (
              <span
                className={styles.coursCitationLine}
                key={`${key}-${lineIndex}`}
              >
                {renderInline(
                  line.replace(/^>\s?/u, ""),
                  `${key}-${lineIndex}`,
                )}
              </span>
            ))}
          </blockquote>
        );
      }
      return (
        <p className={styles.coursTexte} key={key}>
          {renderInline(lines.join(" "), key)}
        </p>
      );
    });
}

export function DraftLessonPreview({
  draft,
}: {
  draft: EditorLessonPreviewDraft;
}) {
  return (
    <main className={styles.shell}>
      <LessonHeader step="Cours texte · exercices à préparer" />
      <section
        className={`${styles.card} ${styles.draftCard}`}
        aria-labelledby="draft-lesson-title"
      >
        <div className={styles.body}>
          <div className={styles.draftTopline}>
            <p className={styles.eyebrow}>Lecture interne · brouillon</p>
            <span className={styles.draftBadge}>Aperçu texte</span>
          </div>
          <h1 id="draft-lesson-title">{draft.titleFr}</h1>
          <p className={styles.objective}>{draft.objectiveFr}</p>
          <p
            className={`${styles.draftNote} ${styles.draftNoteProminent}`}
            role="status"
          >
            Les pages sont disponibles. Les exercices, la correction et les sons
            restent masqués jusqu&apos;à leur compilation et leur audit.
          </p>

          {draft.teaching.map((page) => (
            <article
              className={`${styles.cours} ${styles.draftPage}`}
              key={page.ordre}
            >
              <p className={styles.coursRang}>
                Page {page.ordre} sur {draft.teaching.length}
              </p>
              <h2 className={styles.coursTitre}>{page.titleFr}</h2>
              {renderBody(page.bodyFr, `page-${page.ordre}`)}
              {page.specimen !== null && (
                <p className={styles.coursSpecimen} lang="th">
                  {page.specimen}
                </p>
              )}
            </article>
          ))}

          <p className={styles.draftSource}>
            Source d&apos;autorat : <code>{draft.sourceFile}</code> · statut
            interne : {draft.workflowStatus}.
          </p>
          <div className={styles.actions}>
            <Link className={buttonClass("primary")} href="/path">
              Retour au parcours
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
