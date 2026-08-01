import type { ContentBundle } from "./schemas";

export interface PublicationBlocker {
  code: string;
  detail: string;
}

export function getPublicationBlockers(
  bundle: ContentBundle,
): PublicationBlocker[] {
  const blockers: PublicationBlocker[] = [];
  const { lesson, audioManifest, sources } = bundle;

  if (lesson.visibility === "fixture") {
    blockers.push({
      code: "FIXTURE_NOT_PUBLISHABLE",
      detail: "La visibilité fixture interdit la publication.",
    });
  }
  if (lesson.workflowStatus !== "published") {
    blockers.push({
      code: "WORKFLOW_NOT_PUBLISHED",
      detail: "La version n'est pas au statut published.",
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
