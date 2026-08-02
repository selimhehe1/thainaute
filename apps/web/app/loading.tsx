import { ToneCurve } from "@/components/brand/tone-curve";

import styles from "./special.module.css";

export default function Loading() {
  return (
    <main className={styles.shell}>
      <section className={styles.panel} aria-busy="true" aria-live="polite">
        <ToneCurve
          className={styles.curveLoader}
          tone="rising"
          width={130}
          height={70}
          strokeWidth={7}
        />
        <h1>Chargement du carnet…</h1>
        <p>Un instant, la page arrive.</p>
      </section>
    </main>
  );
}
