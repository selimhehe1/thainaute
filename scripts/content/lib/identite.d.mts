// Contrat typé du module d'identifiants stables. Voir le commentaire
// d'en-tête de `parse-authoring.d.mts` pour la raison de ce doublage.

/**
 * UUID de version 5 dérivé des parties fournies. Même entrée, même sortie :
 * une recompilation rend exactement le même fichier.
 */
export declare function uuidStable(...parties: string[]): string;
