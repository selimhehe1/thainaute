import { z } from "zod";

/**
 * Signature humaine d'une unité, seule chose qui ouvre les portes
 * `HUMAN_AUTHOR_MISSING` et `HUMAN_AUDITOR_MISSING`.
 *
 * Pourquoi un fichier versionné et non un drapeau
 * ----------------------------------------------
 * `CLAUDE.md` réserve au fondateur la validation manuelle du dossier de
 * preuve avant tout changement de statut. Une variable d'environnement ou une
 * option de ligne de commande rendrait cet acte invisible et rejouable par
 * accident. Un fichier committé porte une date, un nom, un périmètre, et se
 * relit dans l'historique.
 *
 * Ce que la signature ne dit PAS
 * ------------------------------
 * Elle n'est pas une revue par un locuteur natif. Le champ
 * `revueNativeEffectuee` existe pour que ce soit écrit noir sur blanc, et il
 * doit rester `false` tant qu'aucun natif n'a relu. Le produit continue
 * d'afficher « Revue native : en attente ».
 */
export const signatureUniteSchema = z.strictObject({
  schemaVersion: z.literal(1),
  unite: z.string().regex(/^\d{2}$/u),
  /** Identité de la personne qui engage sa responsabilité. */
  signataire: z.strictObject({
    nom: z.string().min(1).max(120),
    role: z.enum(["fondateur", "auditeur", "relecteur"]),
  }),
  signeLe: z.iso.datetime({ offset: true }),
  /** Ce que la personne déclare avoir relu, en toutes lettres. */
  portee: z.string().min(1).max(2000),
  /** Les leçons couvertes. Une leçon absente reste un brouillon. */
  lecons: z.array(z.string().regex(/^u\d{2}-l\S+$/u)).min(1),
  /**
   * Publier, ou seulement enregistrer la relecture humaine.
   *
   * Séparer les deux permet de signer une unité sans la publier, par exemple
   * pendant que sa voix se termine.
   */
  publier: z.boolean(),
  revueNativeEffectuee: z.literal(false),
});

export type SignatureUnite = z.infer<typeof signatureUniteSchema>;

/** La signature couvre-t-elle cette leçon ? Sinon, elle reste brouillon. */
export function signatureCouvre(
  signature: SignatureUnite,
  identifiantLecon: string,
): boolean {
  return signature.lecons.includes(identifiantLecon);
}
