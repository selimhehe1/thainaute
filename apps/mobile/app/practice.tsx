// La leçon publiée passe le mur de l'ADR-0041.
//
// Ce mur existait parce que tout le contenu U01 était en brouillon, et
// qu'un écran marqué « interne » ne protège rien : le contenu reste
// extractible d'un APK. La signature de l'unité 1 retire cette raison pour
// les cinq leçons couvertes, et la laisse entière pour les autres. Le
// catalogue est donc filtré par statut, et `check-public-export.mjs`
// vérifie qu'aucune trace d'un brouillon ne part dans un export.
export { default } from "../internal/practice-screen";
