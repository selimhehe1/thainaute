"use client";

import type { Lesson } from "@thainaute/content/schemas";
import {
  projectLearningProgress,
  type LearningProgress,
} from "@thainaute/sync";
import { libelleMaitrise, maitriseEnPourcent } from "@thainaute/domain";
import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonClass } from "@/components/ui/button";
import panel from "@/components/ui/panel.module.css";
import {
  AttemptOutboxStorageError,
  WebAttemptOutboxStore,
} from "@/lib/client/attempt-outbox-store";

import styles from "./progress.module.css";

type Etat =
  | { readonly phase: "chargement" }
  | { readonly phase: "prêt"; readonly progress: LearningProgress }
  | { readonly phase: "erreur"; readonly message: string };

/**
 * Ce que la personne a réellement appris, lu depuis le journal durable.
 *
 * Aucun compte n'est requis : la progression vit dans le navigateur tant que
 * la synchronisation n'est pas configurée. Le calcul lui-même est partagé
 * avec le mobile (`projectLearningProgress`), pour que les deux plateformes
 * ne puissent pas afficher deux vérités.
 */
export function ProgressExperience({
  lessons,
  storageKey,
}: {
  readonly lessons: readonly Lesson[];
  readonly storageKey: string;
}) {
  const [etat, setEtat] = useState<Etat>({ phase: "chargement" });

  useEffect(() => {
    let actif = true;
    const store = new WebAttemptOutboxStore(storageKey);
    void store
      .read()
      .then((outbox) => {
        if (!actif) return;
        setEtat({
          phase: "prêt",
          progress: projectLearningProgress({
            lessons: [...lessons],
            outbox,
            now: new Date().toISOString(),
          }),
        });
      })
      .catch((erreur: unknown) => {
        if (!actif) return;
        // Une progression illisible s'annonce comme telle. Afficher zéro
        // laisserait croire à une régression qui n'a pas eu lieu.
        setEtat({
          phase: "erreur",
          message:
            erreur instanceof AttemptOutboxStorageError
              ? "Le stockage local ne répond pas. Fermez les autres onglets Thaïnaute, puis rechargez."
              : "La progression locale n'a pas pu être lue.",
        });
      })
      .finally(() => store.close());
    return () => {
      actif = false;
    };
  }, [lessons, storageKey]);

  if (etat.phase === "chargement") {
    return (
      <section className={panel.panel} aria-busy="true">
        <p className={panel.eyebrow}>Progrès</p>
        <h1>Lecture de votre progression…</h1>
      </section>
    );
  }

  if (etat.phase === "erreur") {
    return (
      <section className={panel.panel}>
        <p className={panel.eyebrow}>Progrès</p>
        <h1>Votre progression n’a pas pu être lue.</h1>
        <p className={panel.inlineError} role="alert">
          {etat.message}
        </p>
      </section>
    );
  }

  const { progress } = etat;
  const vierge = progress.reviewedItems === 0;

  return (
    <section className={panel.panel}>
      <p className={panel.eyebrow}>Progrès</p>
      <h1 id="progress-title">
        {vierge ? "Votre carte commence ici." : "Ce que vous avez appris."}
      </h1>

      {vierge ? (
        <>
          <p className={panel.lede}>
            Aucune séance terminée pour l’instant. Une première réussite suffit
            à ouvrir cette page.
          </p>
          <div className={panel.actions}>
            <Link className={buttonClass("primary")} href="/today">
              Commencer une séance
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className={panel.lede}>
            {progress.confirmedItems} repère
            {progress.confirmedItems > 1 ? "s" : ""} confirmé
            {progress.confirmedItems > 1 ? "s" : ""} sur{" "}
            {progress.reviewedItems} révisé
            {progress.reviewedItems > 1 ? "s" : ""}.
          </p>

          <dl className={styles.metrics}>
            <div>
              <dt>Maîtrise moyenne</dt>
              <dd>{libelleMaitrise(progress.masteryPermille)}</dd>
            </div>
            <div>
              <dt>Essais</dt>
              <dd>{progress.attemptedCount}</dd>
            </div>
            <div>
              <dt>Réussites</dt>
              <dd>{progress.successfulAttempts}</dd>
            </div>
            <div>
              <dt>À revoir</dt>
              <dd>{progress.dueCount}</dd>
            </div>
          </dl>

          <ul className={styles.lessons}>
            {progress.lessons
              .filter(({ reviewedItems }) => reviewedItems > 0)
              .map((lesson) => (
                <li className={styles.lesson} key={lesson.versionId}>
                  <p className={styles.lessonTitle}>{lesson.titleFr}</p>
                  <div
                    aria-label={`Maîtrise de ${lesson.titleFr}`}
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={maitriseEnPourcent(lesson.masteryPermille)}
                    aria-valuetext={libelleMaitrise(lesson.masteryPermille)}
                    className={styles.bar}
                    role="progressbar"
                  >
                    <span
                      className={styles.barFill}
                      style={{ width: `${lesson.masteryPermille / 10}%` }}
                    />
                  </div>
                  <p className={styles.lessonMeta}>
                    {lesson.reviewedItems} repère
                    {lesson.reviewedItems > 1 ? "s" : ""} révisé
                    {lesson.reviewedItems > 1 ? "s" : ""} ·{" "}
                    {lesson.attemptedCount} essai
                    {lesson.attemptedCount > 1 ? "s" : ""}
                  </p>
                  <p className={styles.lessonMeta}>
                    {lesson.dueCount > 0
                      ? `${lesson.dueCount} révision${lesson.dueCount > 1 ? "s" : ""} à faire`
                      : lesson.nextReviewAt === null
                        ? "Prochaine révision à calculer"
                        : `Prochaine révision : ${new Intl.DateTimeFormat(
                            "fr-FR",
                            { dateStyle: "medium", timeStyle: "short" },
                          ).format(new Date(lesson.nextReviewAt))}`}
                  </p>
                </li>
              ))}
          </ul>

          <div className={panel.actions}>
            <Link className={buttonClass("primary")} href="/practice">
              Pratiquer
            </Link>
          </div>
        </>
      )}

      <p className={panel.note}>
        Cette progression vit dans ce navigateur. Elle rejoindra votre compte
        lorsque la synchronisation sera ouverte.
      </p>
    </section>
  );
}
