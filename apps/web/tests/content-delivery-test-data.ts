import { readFixtureBundle, type ContentBundle } from "@thainaute/content";

import { hashCanonical } from "../lib/server/attempt-sync/canonical-json";

export const RELEASE_ID = "30000000-0000-4000-8000-000000000001";

export function makePublishableBundle(): ContentBundle {
  const bundle = structuredClone(readFixtureBundle());
  bundle.lesson.workflowStatus = "published";
  bundle.lesson.visibility = "public";
  bundle.lesson.publishedAt = "2026-08-01T10:00:00.000Z";
  for (const audit of bundle.lesson.provenance.audits) {
    audit.status = "passed";
  }
  for (const finding of bundle.lesson.provenance.findings) {
    finding.status = "resolved";
    finding.note = "note-interne-sensible";
  }
  for (const item of bundle.lesson.items) {
    item.translationFr = "Fixture juridique et technique";
    item.transcription.value = "fixture";
    item.register = "test";
    for (const syllable of item.syllables) {
      syllable.ipa = "fixture";
      syllable.tone = "mid";
      syllable.vowelLength = "short";
      syllable.initial = "k";
      syllable.final = "none";
    }
  }
  for (const source of bundle.sources) {
    source.label = "source-interne-sensible";
    source.kind = "official";
    source.versionSource = "edition-test-v1";
    source.confidence = "high";
    source.commercialUse = true;
    source.redistribution = true;
    source.publicationAuthorized = true;
  }
  for (const entry of bundle.audioManifest.entries) {
    entry.variant = "natural";
    entry.voiceKind = "native_human";
    entry.consentReference = "contrat-interne-sensible";
    entry.canonicalPath = "bucket-prive/chemin-interne.wav";
    entry.distributionPaths = ["distribution/chemin-interne.wav"];
  }
  return bundle;
}

export function makePublishedLessonRow(bundle: ContentBundle) {
  const publishedAt = bundle.lesson.publishedAt;
  if (publishedAt === null) throw new Error("Date de publication manquante.");

  return {
    id: bundle.lesson.versionId,
    lesson_id: bundle.lesson.lessonId,
    version: bundle.lesson.revision,
    release_id: RELEASE_ID,
    status: "published",
    title_fr: bundle.lesson.titleFr,
    payload: bundle,
    payload_sha256: hashCanonical("thainaute.content-bundle/v1", bundle),
    published_at: publishedAt,
    content_releases: {
      id: RELEASE_ID,
      version: 1,
      status: "published",
      published_at: publishedAt,
    },
  };
}
