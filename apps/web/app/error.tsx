"use client";

import { ToneCurve } from "@/components/brand/tone-curve";
import { buttonClass } from "@/components/ui/button";

import styles from "./special.module.css";

export default function GlobalError({
  reset,
}: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <main className={styles.shell}>
      <section className={styles.panel} role="alert">
        <ToneCurve
          className={styles.curve}
          tone="low"
          width={130}
          height={70}
          strokeWidth={7}
        />
        <h1>Quelque chose s’est mal passé.</h1>
        <p>
          L’erreur est de notre côté, pas du vôtre. Vos données locales sont
          conservées : vous pouvez réessayer sans risque.
        </p>
        <div className={styles.actions}>
          <button
            className={buttonClass("primary")}
            type="button"
            onClick={reset}
          >
            Réessayer
          </button>
        </div>
      </section>
    </main>
  );
}
