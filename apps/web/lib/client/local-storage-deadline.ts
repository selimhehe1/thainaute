"use client";

export const LOCAL_STORAGE_HYDRATION_TIMEOUT_MS = 8_000;

export class LocalStorageDeadlineError extends Error {
  public constructor(timeoutMs: number) {
    super(
      `Le stockage local n\u2019a pas r\u00e9pondu dans le d\u00e9lai de ${timeoutMs} ms.`,
    );
    this.name = "LocalStorageDeadlineError";
  }
}

/**
 * Emp\u00eache une ouverture IndexedDB bloqu\u00e9e par un ancien onglet ou une
 * migration interrompue de laisser l'interface en chargement ind\u00e9finiment.
 *
 * L'op\u00e9ration IndexedDB reste propri\u00e9taire de sa transaction. `onTimeout`
 * permet \u00e0 l'appelant de fermer imm\u00e9diatement ses connexions, avant de cr\u00e9er
 * une nouvelle g\u00e9n\u00e9ration de stores au retry.
 */
export async function withLocalStorageDeadline<T>(
  operation: Promise<T>,
  timeoutMs = LOCAL_STORAGE_HYDRATION_TIMEOUT_MS,
  onTimeout?: () => void,
): Promise<T> {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError(
      "Le d\u00e9lai du stockage local doit \u00eatre un entier positif.",
    );
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      try {
        onTimeout?.();
      } catch {
        // La fermeture est un best effort ; l'erreur publique reste l'échéance.
      }
      reject(new LocalStorageDeadlineError(timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation, deadline]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
