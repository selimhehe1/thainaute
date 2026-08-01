-- TEST LOCAL UNIQUEMENT : fixture E2E hardcodée, sans valeur pédagogique.
-- Ne jamais charger ce fichier en staging/production, ni comme migration ou seed.

begin;

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
);

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
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000001',
  1,
  '30000000-0000-4000-8000-000000000001',
  'published',
  'Boucle technique locale',
  $connected_sync_bundle$
  {
    "lesson": {
      "schemaVersion": 1,
      "lessonId": "10000000-0000-4000-8000-000000000001",
      "versionId": "10000000-0000-4000-8000-000000000002",
      "revision": 1,
      "workflowStatus": "published",
      "visibility": "public",
      "publishedAt": "2026-08-01T10:00:00.000Z",
      "locale": "fr-FR",
      "titleFr": "Boucle technique locale",
      "objectiveFr": "Vérifier le rendu Unicode, l'audio local et la révision sans enseigner de contenu.",
      "requiredEntitlement": null,
      "audioManifestId": "10000000-0000-4000-8000-000000000006",
      "items": [
        {
          "id": "10000000-0000-4000-8000-000000000003",
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
          "id": "10000000-0000-4000-8000-000000000004",
          "type": "audio_choice",
          "itemId": "10000000-0000-4000-8000-000000000003",
          "skill": "listening",
          "audioAssetId": "10000000-0000-4000-8000-000000000005",
          "promptFr": "Sélectionnez l'option technique A après avoir écouté le signal.",
          "options": [
            {
              "id": "20000000-0000-4000-8000-000000000001",
              "labelFr": "Option A"
            },
            {
              "id": "20000000-0000-4000-8000-000000000002",
              "labelFr": "Option B"
            }
          ],
          "correctOptionId": "20000000-0000-4000-8000-000000000001",
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
      "manifestId": "10000000-0000-4000-8000-000000000006",
      "lessonVersionId": "10000000-0000-4000-8000-000000000002",
      "entries": [
        {
          "assetId": "10000000-0000-4000-8000-000000000005",
          "itemId": "10000000-0000-4000-8000-000000000003",
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
  'bcfc85787a0717f222b5fa2df0e8d19c0a5b6db49883b6dc04ddf407da880c81',
  '2026-08-01T10:00:00.000Z'::timestamptz
);

insert into public.learning_items (
  id,
  lesson_version_id,
  position,
  kind,
  payload
)
values (
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000002',
  0,
  'listening',
  '{}'::jsonb
);

commit;
