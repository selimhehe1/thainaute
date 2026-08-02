import { AccountDeletionInfrastructureError } from "./errors";
import type { AccountDeletionStoragePurger } from "./ports";

/**
 * Registre fermé des emplacements Storage appartenant à un utilisateur.
 * La v1 ne crée aucun bucket utilisateur : les voix restent locales et les
 * bundles pédagogiques appartiennent à l'éditeur. Tout futur bucket privé doit
 * ajouter ici son adaptateur de purge avant sa migration de création.
 */
export const ACCOUNT_DELETION_USER_STORAGE_LOCATIONS = [] as const;

export function createCurrentAccountDeletionStoragePurger(): AccountDeletionStoragePurger {
  return {
    async purgeUserObjects({ signal }) {
      if (signal.aborted) {
        throw new AccountDeletionInfrastructureError("storage_unavailable");
      }
      // Le registre explicite est vide dans le schéma v1.
      await Promise.resolve(ACCOUNT_DELETION_USER_STORAGE_LOCATIONS);
    },
  };
}
