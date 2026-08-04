import { z } from "zod";

import type { ContentBundle } from "./schemas";

export const publicationBlockerSchema = z.strictObject({
  code: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[A-Z0-9_]+$/u),
  detail: z.string().min(1).max(240),
});

export type PublicationBlocker = z.infer<typeof publicationBlockerSchema>;

export function getPublicationBlockers(
  bundle: ContentBundle,
): PublicationBlocker[] {
  const blockers: PublicationBlocker[] = [];
  const { lesson, audioManifest, sources } = bundle;

  if (lesson.visibility !== "public") {
    blockers.push({
      code: "VISIBILITY_NOT_PUBLIC",
      detail: "La version doit avoir une visibilité publique.",
    });
  }
  if (lesson.visibility === "fixture") {
    blockers.push({
      code: "FIXTURE_NOT_PUBLISHABLE",
      detail: "La visibilité fixture interdit la publication.",
    });
  }
  if (lesson.workflowStatus === "conflict") {
    blockers.push({
      code: "WORKFLOW_CONFLICT",
      detail: "Le workflow signale un conflit éditorial non résolu.",
    });
  }
  if (lesson.workflowStatus !== "published") {
    blockers.push({
      code: "WORKFLOW_NOT_PUBLISHED",
      detail: "La version n'est pas au statut published.",
    });
  }
  if (lesson.workflowStatus === "published" && lesson.publishedAt === null) {
    blockers.push({
      code: "PUBLISHED_AT_MISSING",
      detail: "Une version published doit avoir une date de publication.",
    });
  }
  if (lesson.workflowStatus !== "published" && lesson.publishedAt !== null) {
    blockers.push({
      code: "PUBLISHED_AT_INCONSISTENT",
      detail:
        "Une date de publication ne peut être définie avant le statut published.",
    });
  }
  if (lesson.provenance.audits.some(({ status }) => status !== "passed")) {
    blockers.push({
      code: "AUDIT_INCOMPLETE",
      detail: "Les sept dimensions linguistiques ne sont pas toutes validées.",
    });
  }
  if (
    lesson.provenance.findings.some(
      ({ blocking, status }) => blocking && status === "open",
    )
  ) {
    blockers.push({
      code: "OPEN_BLOCKING_FINDING",
      detail: "Un désaccord ou finding bloquant reste ouvert.",
    });
  }
  if (sources.some(({ publicationAuthorized }) => !publicationAuthorized)) {
    blockers.push({
      code: "SOURCE_NOT_AUTHORIZED",
      detail: "Une source n'autorise pas la publication.",
    });
  }
  if (sources.some(({ commercialUse }) => !commercialUse)) {
    blockers.push({
      code: "SOURCE_NOT_COMMERCIAL",
      detail: "Une source n'autorise pas l'usage commercial prévu.",
    });
  }
  if (sources.some(({ redistribution }) => !redistribution)) {
    blockers.push({
      code: "SOURCE_NOT_REDISTRIBUTABLE",
      detail: "Une source n'autorise pas la redistribution prévue.",
    });
  }
  if (sources.some(({ kind }) => kind === "synthetic_fixture")) {
    blockers.push({
      code: "SYNTHETIC_SOURCE_NOT_PUBLISHABLE",
      detail: "Une source synthétique de test ne peut pas être publiée.",
    });
  }
  if (
    !lesson.provenance.generationActors.some(
      ({ kind, role }) => kind === "human" && role === "author",
    )
  ) {
    blockers.push({
      code: "HUMAN_AUTHOR_MISSING",
      detail: "Aucun auteur humain responsable n'est référencé.",
    });
  }
  if (
    lesson.provenance.audits.some(({ auditor }) => auditor.kind !== "human")
  ) {
    blockers.push({
      code: "HUMAN_AUDITOR_MISSING",
      detail: "Chaque audit publié doit référencer un auditeur humain.",
    });
  }
  if (
    audioManifest.entries.some(
      ({ variant, voiceKind }) =>
        variant === "fixture" || voiceKind === "synthetic_test_tone",
    )
  ) {
    blockers.push({
      code: "FIXTURE_AUDIO_NOT_PUBLISHABLE",
      detail: "Un signal de test ne peut pas devenir un audio pédagogique.",
    });
  }
  if (
    audioManifest.entries.some(
      ({ consentReference, voiceKind }) =>
        voiceKind === "native_human" && consentReference === null,
    )
  ) {
    blockers.push({
      code: "VOICE_CONSENT_MISSING",
      detail: "Une voix humaine ne possède pas de référence de consentement.",
    });
  }
  // Une voix synthétique publiable doit avoir passé au moins un contrôle.
  // En thaï, un ton faux n'est pas un accent approximatif, c'est un autre
  // mot. Deux contrôles sont reconnus, et ils ne se valent pas :
  //
  //  - `toneCheck` mesure le contour de hauteur sur le signal. Aucun modèle
  //    de langue n'intervient, donc rien ne peut corriger vers le mot
  //    attendu. C'est la preuve forte.
  //  - `roundTrip` fait relire l'audio par une reconnaissance vocale. Elle
  //    reste utile pour l'intelligibilité, mais mesuré le 2026-08-04 sur la
  //    série คา ข่า ค่า ค้า ขา, `gpt-4o-transcribe` ne rend pas d'écriture
  //    thaïe sur syllabe isolée et `whisper-1` hallucine. C'est la preuve
  //    faible, et elle ne suffit jamais seule à attester un ton.
  if (
    audioManifest.entries.some(
      ({ voiceKind, roundTrip, toneCheck }) =>
        voiceKind === "synthetic_tts" &&
        roundTrip === null &&
        toneCheck === null,
    )
  ) {
    blockers.push({
      code: "SYNTHETIC_AUDIO_UNVERIFIED",
      detail: "Une voix synthétique n'a passé aucun contrôle de restitution.",
    });
  }
  if (
    audioManifest.entries.some(
      ({ voiceKind, roundTrip }) =>
        voiceKind === "synthetic_tts" && roundTrip?.matchesSource === false,
    )
  ) {
    blockers.push({
      code: "SYNTHETIC_AUDIO_MISREAD",
      detail: "Un audio synthétique est relu autrement que la graphie voulue.",
    });
  }
  if (
    audioManifest.entries.some(
      ({ voiceKind, toneCheck }) =>
        voiceKind === "synthetic_tts" && toneCheck?.consistent === false,
    )
  ) {
    blockers.push({
      code: "SYNTHETIC_AUDIO_TONE_MISMATCH",
      detail: "Le contour mesuré ne correspond pas au ton attendu de l'item.",
    });
  }
  if (
    lesson.items.some(
      ({ register, transcription, translationFr, syllables }) =>
        register === null ||
        transcription.value === null ||
        translationFr === null ||
        syllables.some(
          ({ final, initial, ipa, tone, vowelLength }) =>
            final === null ||
            initial === null ||
            ipa === null ||
            tone === null ||
            vowelLength === null,
        ),
    )
  ) {
    blockers.push({
      code: "LINGUISTIC_FIELDS_INCOMPLETE",
      detail: "Des champs linguistiques obligatoires manquent.",
    });
  }

  return blockers;
}

export function assertPublishable(bundle: ContentBundle): void {
  const blockers = getPublicationBlockers(bundle);
  if (blockers.length > 0) {
    throw new Error(blockers.map(({ code }) => code).join(", "));
  }
}
