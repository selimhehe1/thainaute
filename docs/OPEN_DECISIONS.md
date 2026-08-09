# Registre des décisions ouvertes

Une décision `OPEN` bloque seulement la fonctionnalité ou la phase indiquée.

| ID               | Décision                                                               | Échéance                          | État    |
| ---------------- | ---------------------------------------------------------------------- | --------------------------------- | ------- |
| OPEN-BRAND-001   | clearance et titulaire de la marque Thaïnaute                          | avant annonce/réservation         | ouverte |
| OPEN-PRODUCT-001 | premier segment et résultat à quatre semaines                          | avant validation Phase 1          | ouverte |
| OPEN-LEARN-001   | seuils de maîtrise et rôle de la transcription                         | avant contenu réel Phase 2        | ouverte |
| OPEN-CONTENT-001 | liste opérationnelle des sources et auditeurs autorisés                | avant première publication        | ouverte |
| OPEN-BILL-001    | orchestration RevenueCat Web ou Checkout Next.js                       | avant Phase 3                     | résolue |
| OPEN-PRICE-001   | prix, essai et seuils Premium                                          | avant Phase 3                     | ouverte |
| OPEN-PRIVACY-001 | mineurs et durée exacte de rétention vocale                            | avant collecte distante/bêta      | ouverte |
| OPEN-TAX-001     | pays de lancement et traitement fiscal                                 | avant paiement réel               | ouverte |
| OPEN-AI-001      | fournisseurs texte, STT et TTS                                         | avant P1 IA                       | ouverte |
| OPEN-TONE-001    | algorithme tonal et jeu d'évaluation natif                             | avant analyse tonale P1           | ouverte |
| OPEN-API-001     | seuils et stratégie de limitation par compte et IP pour `/api/v1`      | avant bêta distante               | ouverte |
| OPEN-SRS-001     | versions SRS rétrocompatibles, durée de support et migration/dispatch  | avant toute nouvelle version SRS  | ouverte |
| OPEN-SYNC-002    | rétention/purge des registres d'idempotence et reçus de suppression    | avant bêta distante               | ouverte |
| OPEN-OFFLINE-001 | correction différée ou matériel de notation local considéré non secret | avant vraie expérience hors ligne | ouverte |

## Décisions résolues

- `OPEN-ATTEMPT-001` — résolue par dérivation serveur stricte dans
  [ADR-0009](adr/0009-server-derived-attempt-target.md). La commande de
  tentative cliente ne transporte ni `itemId` ni `skill` et ne peut donc pas
  choisir la projection à affecter. La projection générique de réponse v1
  conserve l'identifiant opaque documenté par l'ADR-0007.
- `OPEN-SYNC-001` — résolue par une fenêtre serveur inclusive de trente jours
  dans le passé et cinq minutes dans le futur, sans réécriture de
  `answeredAt`, dans [ADR-0010](adr/0010-attempt-temporal-trust.md).
- `OPEN-BILL-001` — résolue par Checkout Sessions + Customer Portal Stripe sur
  le web et RevenueCat pour les achats natifs. Les deux chemins alimentent le
  même miroir serveur `premium`, documenté dans
  [ADR-0036](adr/0036-paiements-web-entitlements.md). Cette décision ne valide
  ni les prix, ni la fiscalité, ni l'encaissement live.
