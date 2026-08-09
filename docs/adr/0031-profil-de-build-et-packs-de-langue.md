# ADR-0031 — Profil de build et packs de langue

## Statut

Accepté.

## Contexte

Thaïnaute est d'abord conçu pour enseigner le thaï à partir du français, mais
le moteur partagé ne doit pas être recopié si une langue cible supplémentaire
est ajoutée. En revanche, le brief ne demande pas encore un sélecteur de
langues utilisateur ni un cours italien publiable.

## Décision

La langue d'enseignement reste `fr-FR`. Une build sélectionne exactement un
`LanguagePack` via `THAINAUTE_LANGUAGE_PACK`. Le registre échoue fermé si le
profil est inconnu. Le pack porte les métadonnées d'application, la locale
cible, la typographie, les capacités linguistiques et le registre de contenu.

La première et unique valeur enregistrée est `thai-fr`. Les cours, les
comptes, la progression, la synchronisation et les entitlements restent dans
le même produit ; les données locales sont isolées par identifiant de pack.

Les champs thaïs existants (`thaiRaw`, tons, mesures F0 et police thaïe) sont
conservés comme compatibilité du pack actuel. Ils ne deviennent pas des
pré-requis du contrat commun pour une future langue.

## Conséquences

- changer de cible dans une build sera un changement de profil et de contenu,
  pas une réécriture du moteur ;
- aucune build italienne ne peut être produite tant qu'un pack italien et son
  contenu audité n'ont pas été ajoutés au registre ;
- les identifiants natifs restent ceux de l'application actuelle tant qu'une
  décision produit distincte ne demande pas une application séparée ;
- les migrations de contenu portent l'identité du pack pour empêcher qu'une
  release d'une langue soit servie comme une autre.
