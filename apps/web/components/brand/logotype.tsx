import styles from "./logotype.module.css";

interface LogotypeProps {
  readonly size?: "header" | "hero";
}

/** Le mot-symbole : « Thaï » en encre, « naute » en corail (ADR-0022).
 * Toujours rendu dans un lien ou un titre qui porte le libellé accessible. */
export function Logotype({ size = "header" }: LogotypeProps) {
  return (
    <span
      className={size === "hero" ? styles.hero : styles.header}
      aria-hidden="true"
    >
      Thaï<span className={styles.naute}>naute</span>
    </span>
  );
}
