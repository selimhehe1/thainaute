import styles from "./button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost";

/** Classes du bouton carnet, utilisables sur <button> comme sur <Link>. */
export function buttonClass(variant: ButtonVariant): string {
  return `${styles.base} ${styles[variant]}`;
}
