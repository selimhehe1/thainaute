import Link from "next/link";

import { ToneCurve } from "@/components/brand/tone-curve";
import { buttonClass } from "@/components/ui/button";

import styles from "./special.module.css";

export const metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <main className={styles.shell}>
      <section className={styles.panel}>
        <ToneCurve
          className={styles.curve}
          tone="falling"
          width={130}
          height={70}
          strokeWidth={7}
        />
        <h1>Cette page n’existe pas dans le carnet.</h1>
        <p>
          L’adresse a peut-être changé, ou la page n’a jamais existé. Votre
          progression locale n’est pas concernée.
        </p>
        <div className={styles.actions}>
          <Link className={buttonClass("primary")} href="/">
            Retour à l’accueil
          </Link>
          <Link className={buttonClass("ghost")} href="/today">
            Ouvrir Aujourd’hui
          </Link>
        </div>
      </section>
    </main>
  );
}
