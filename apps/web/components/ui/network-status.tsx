"use client";

import { useSyncExternalStore } from "react";

import styles from "./network-status.module.css";

/**
 * L'état de connexion, dit une seule fois pour tout le produit.
 *
 * POURQUOI CE COMPOSANT EXISTE : deux écrans le redéclaraient, et les deux
 * copies avaient dérivé. Bordure jade sur l'une, absente sur l'autre, et
 * une déclaration `background` écrasée par la suivante dans le même bloc.
 *
 * Le point coloré n'est jamais le seul signal : le texte dit l'état, et
 * `aria-live` l'annonce quand il change.
 *
 * La forme `quiet` sert le lecteur de leçon, où une pastille permanente
 * ferait du mobilier de tableau de bord.
 */
function subscribe(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}

export function NetworkStatus({
  online,
  enLigne,
  horsLigne,
  forme = "pill",
}: {
  readonly online: boolean;
  /** Ce que l'écran promet quand la connexion est là. */
  readonly enLigne: string;
  /** Ce qu'il promet quand elle ne l'est pas. Jamais une excuse. */
  readonly horsLigne: string;
  readonly forme?: "pill" | "quiet";
}) {
  return (
    <div
      className={`${styles.status} ${forme === "pill" ? styles.pill : styles.quiet}`}
      aria-live="polite"
    >
      <span
        className={online ? `${styles.dot} ${styles.dotOnline}` : styles.dot}
        aria-hidden="true"
      />
      {online ? enLigne : horsLigne}
    </div>
  );
}
