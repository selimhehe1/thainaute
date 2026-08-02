-- TEST LOCAL UNIQUEMENT : fixture E2E hardcodée, sans valeur pédagogique.
-- Ne jamais charger ce fichier en staging/production, ni comme migration ou seed.

with inserted_release as (
  insert into public.content_releases (
  id,
  version,
  status,
  manifest_sha256,
  published_at
)
values (
  '30000000-0000-4000-8000-000000000001',
  1,
  'published',
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  '2026-08-01T10:00:00.000Z'::timestamptz
  )
  returning id
),
inserted_lesson as (

  insert into public.lesson_versions (
  id,
  lesson_id,
  version,
  release_id,
  status,
  title_fr,
  payload,
  payload_sha256,
  published_at
)
values (
  '30000000-0000-4000-8000-000000000102',
  '30000000-0000-4000-8000-000000000101',
  1,
  (select id from inserted_release),
  'published',
  'Boucle technique locale',
  $connected_sync_bundle$
  {
    "lesson": {
      "schemaVersion": 1,
      "lessonId": "30000000-0000-4000-8000-000000000101",
      "versionId": "30000000-0000-4000-8000-000000000102",
      "revision": 1,
      "workflowStatus": "published",
      "visibility": "public",
      "publishedAt": "2026-08-01T10:00:00.000Z",
      "locale": "fr-FR",
      "titleFr": "Boucle technique locale",
      "objectiveFr": "Vérifier le rendu Unicode, l'audio local et la révision sans enseigner de contenu.",
      "requiredEntitlement": null,
      "audioManifestId": "30000000-0000-4000-8000-000000000106",
      "items": [
        {
          "id": "30000000-0000-4000-8000-000000000103",
          "thaiRaw": "ก่",
          "unicodeCodePoints": ["U+0E01", "U+0E48"],
          "translationFr": "Fixture juridique et technique",
          "transcription": {
            "systemVersion": "thainaute-fr-v0-draft",
            "value": "fixture"
          },
          "syllables": [
            {
              "thaiRaw": "ก่",
              "ipa": "fixture",
              "tone": "mid",
              "vowelLength": "short",
              "initial": "k",
              "final": "none"
            }
          ],
          "register": "test",
          "sourceIds": ["TEST_ONLY"]
        }
      ],
      "exercises": [
        {
          "id": "30000000-0000-4000-8000-000000000104",
          "type": "audio_choice",
          "itemId": "30000000-0000-4000-8000-000000000103",
          "skill": "listening",
          "audioAssetId": "30000000-0000-4000-8000-000000000105",
          "promptFr": "Sélectionnez l'option technique A après avoir écouté le signal.",
          "options": [
            {
              "id": "30000000-0000-4000-8000-000000000201",
              "labelFr": "Option A"
            },
            {
              "id": "30000000-0000-4000-8000-000000000202",
              "labelFr": "Option B"
            }
          ],
          "correctOptionId": "30000000-0000-4000-8000-000000000201",
          "feedback": {
            "correctFr": "La boucle technique fonctionne.",
            "incorrectFr": "Réessayez avec l'option technique A."
          }
        }
      ],
      "provenance": {
        "sourceIds": ["TEST_ONLY"],
        "generationActors": [
          {
            "actorId": "TEST_AUTHOR",
            "kind": "human",
            "role": "author"
          }
        ],
        "audits": [
          {
            "dimension": "orthography",
            "status": "passed",
            "auditor": {
              "actorId": "TEST_AUDITOR",
              "kind": "human",
              "role": "auditor"
            }
          },
          {
            "dimension": "meaning",
            "status": "passed",
            "auditor": {
              "actorId": "TEST_AUDITOR",
              "kind": "human",
              "role": "auditor"
            }
          },
          {
            "dimension": "pronunciation",
            "status": "passed",
            "auditor": {
              "actorId": "TEST_AUDITOR",
              "kind": "human",
              "role": "auditor"
            }
          },
          {
            "dimension": "tone",
            "status": "passed",
            "auditor": {
              "actorId": "TEST_AUDITOR",
              "kind": "human",
              "role": "auditor"
            }
          },
          {
            "dimension": "vowel_length",
            "status": "passed",
            "auditor": {
              "actorId": "TEST_AUDITOR",
              "kind": "human",
              "role": "auditor"
            }
          },
          {
            "dimension": "register",
            "status": "passed",
            "auditor": {
              "actorId": "TEST_AUDITOR",
              "kind": "human",
              "role": "auditor"
            }
          },
          {
            "dimension": "naturalness",
            "status": "passed",
            "auditor": {
              "actorId": "TEST_AUDITOR",
              "kind": "human",
              "role": "auditor"
            }
          }
        ],
        "findings": [
          {
            "code": "FIXTURE_ONLY",
            "status": "resolved",
            "blocking": true,
            "note": "note-interne-sensible"
          }
        ]
      }
    },
    "audioManifest": {
      "schemaVersion": 1,
      "manifestId": "30000000-0000-4000-8000-000000000106",
      "lessonVersionId": "30000000-0000-4000-8000-000000000102",
      "entries": [
        {
          "assetId": "30000000-0000-4000-8000-000000000105",
          "itemId": "30000000-0000-4000-8000-000000000103",
          "variant": "natural",
          "canonicalPath": "bucket-prive/chemin-interne.wav",
          "distributionPaths": ["distribution/chemin-interne.wav"],
          "mimeType": "audio/wav",
          "sha256": "801031380b85885ed9edd1bfe0050a4e93a61208fae8b8c5f01bbd3d553c118a",
          "byteLength": 5164,
          "durationMs": 320,
          "voiceKind": "native_human",
          "consentReference": "contrat-interne-sensible"
        }
      ]
    },
    "sources": [
      {
        "schemaVersion": 1,
        "sourceId": "TEST_ONLY",
        "label": "source-interne-sensible",
        "kind": "official",
        "versionSource": "edition-test-v1",
        "confidence": "high",
        "license": "INTERNAL-TEST-ONLY",
        "commercialUse": true,
        "redistribution": true,
        "publicationAuthorized": true,
        "consultedAt": "2026-08-01T00:00:00.000Z"
      }
    ]
  }
  $connected_sync_bundle$::jsonb,
  '39223840c8619f4a81e6ac38b499cddf587082327074e78a0c3b5eb3a6166843',
  '2026-08-01T10:00:00.000Z'::timestamptz
  )
  returning id
)

insert into public.learning_items (
  id,
  lesson_version_id,
  position,
  kind,
  payload
)
values (
  '30000000-0000-4000-8000-000000000103',
  (select id from inserted_lesson),
  0,
  'listening',
  '{}'::jsonb
);
