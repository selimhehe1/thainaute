BEGIN;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(17);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'a@example.invalid', now(), now()),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'b@example.invalid', now(), now());

insert into public.profiles (user_id)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

insert into public.devices (id, user_id, platform, app_version)
values
  ('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'web', '0.0.1'),
  ('dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'android', '0.0.1');

insert into public.content_releases (id, version, status, manifest_sha256, published_at)
values
  ('30000000-0000-4000-8000-000000000001', 1, 'published', repeat('a', 64), now()),
  ('30000000-0000-4000-8000-000000000002', 2, 'draft', repeat('b', 64), null);

insert into public.lesson_versions (
  id, lesson_id, version, release_id, status, title_fr, payload, payload_sha256, published_at
)
values
  (
    '31000000-0000-4000-8000-000000000001',
    '31100000-0000-4000-8000-000000000001',
    1,
    '30000000-0000-4000-8000-000000000001',
    'published',
    'Fixture publiée transactionnelle',
    '{}'::jsonb,
    repeat('c', 64),
    now()
  ),
  (
    '31000000-0000-4000-8000-000000000002',
    '31100000-0000-4000-8000-000000000002',
    1,
    '30000000-0000-4000-8000-000000000002',
    'draft',
    'Fixture brouillon transactionnelle',
    '{}'::jsonb,
    repeat('d', 64),
    null
  );

insert into public.learning_items (id, lesson_version_id, position, kind, payload)
values
  ('32000000-0000-4000-8000-000000000001', '31000000-0000-4000-8000-000000000001', 0, 'listening', '{}'::jsonb),
  ('32000000-0000-4000-8000-000000000002', '31000000-0000-4000-8000-000000000002', 0, 'listening', '{}'::jsonb);

insert into public.attempt_events (
  event_id, user_id, device_id, exercise_id, item_id, lesson_version_id,
  selected_option_id, dimension, rating, answered_at, duration_ms,
  algorithm_version, payload_sha256
)
values
  (
    '40000000-0000-4000-8000-000000000001',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '41000000-0000-4000-8000-000000000001',
    '32000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001',
    '42000000-0000-4000-8000-000000000001',
    'listening', 1, now() - interval '1 hour', 1000, 'srs-v0', repeat('e', 64)
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '41000000-0000-4000-8000-000000000001',
    '32000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001',
    '42000000-0000-4000-8000-000000000001',
    'listening', 1, now() - interval '1 hour', 1000, 'srs-v0', repeat('f', 64)
  );

insert into public.learner_item_state (
  user_id, item_id, lesson_version_id, dimension, mastery_permille,
  successful_attempts, consecutive_correct, attempt_count, last_event_id,
  last_answered_at, due_at, algorithm_version
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '32000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001',
    'listening', 250, 1, 1, 1,
    '40000000-0000-4000-8000-000000000001',
    '2026-08-01T10:00:00Z', '2026-08-02T10:00:00Z', 'srs-v0'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '32000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001',
    'listening', 250, 1, 1, 1,
    '40000000-0000-4000-8000-000000000002',
    '2026-08-01T10:00:00Z', '2026-08-02T10:00:00Z', 'srs-v0'
  );

select is(
  (
    select count(*)::integer
    from pg_class
    where oid in (
      'public.profiles'::regclass,
      'public.devices'::regclass,
      'public.content_releases'::regclass,
      'public.lesson_versions'::regclass,
      'public.learning_items'::regclass,
      'public.audio_assets'::regclass,
      'public.attempt_events'::regclass,
      'public.learner_item_state'::regclass
    ) and relrowsecurity
  ),
  8,
  'RLS est active sur toutes les tables publiques'
);

set local role anon;
select is((select count(*)::integer from public.content_releases), 1, 'anon ne voit que la release publiée');
reset role;

select ok(
  not has_table_privilege('anon', 'public.lesson_versions', 'select')
  and not has_table_privilege('authenticated', 'public.lesson_versions', 'select'),
  'les clients ne peuvent pas lire un payload contenant les cles de correction'
);
select ok(
  not has_table_privilege('anon', 'public.learning_items', 'select')
  and not has_table_privilege('authenticated', 'public.learning_items', 'select')
  and not has_table_privilege('anon', 'public.audio_assets', 'select')
  and not has_table_privilege('authenticated', 'public.audio_assets', 'select'),
  'les clients attendent un DTO de contenu et audio expurge plutot que les tables brutes'
);

select ok(
  not has_table_privilege('anon', 'public.profiles', 'select'),
  'anon ne reçoit aucun privilège sur les profils'
);
select ok(
  not has_table_privilege('anon', 'public.attempt_events', 'select'),
  'anon ne reçoit aucun privilège sur les tentatives'
);

select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', true);
set local role authenticated;
select is((select count(*)::integer from public.profiles), 1, 'A ne lit que son profil');
select is((select count(*)::integer from public.devices), 1, 'A ne lit que son appareil initial');
select is((select count(*)::integer from public.attempt_events), 1, 'A ne lit que sa tentative');
select is((select count(*)::integer from public.learner_item_state), 1, 'A ne lit que sa projection');
reset role;

select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', true);
set local role authenticated;
select is((select count(*)::integer from public.attempt_events), 1, 'B ne voit aucune tentative de A');
reset role;

select ok(
  not has_any_column_privilege('authenticated', 'public.devices', 'insert')
  and not has_any_column_privilege('authenticated', 'public.profiles', 'insert'),
  'la création de profil et d appareil passe uniquement par la route serveur'
);
select ok(
  not has_table_privilege('authenticated', 'public.attempt_events', 'insert'),
  'les tentatives ne sont acceptées que par le serveur'
);
select ok(
  not has_table_privilege('authenticated', 'public.attempt_events', 'update')
  and not has_table_privilege('authenticated', 'public.attempt_events', 'delete'),
  'une tentative client est immuable'
);
select ok(
  not has_table_privilege('authenticated', 'public.learner_item_state', 'insert')
  and not has_table_privilege('authenticated', 'public.learner_item_state', 'update'),
  'un client ne peut pas écrire sa maîtrise'
);
select ok(
  has_any_column_privilege(
    'service_role', 'public.attempt_events', 'insert'
  )
  and not has_column_privilege(
    'service_role', 'public.attempt_events', 'received_at', 'insert'
  )
  and has_table_privilege('service_role', 'public.learner_item_state', 'update'),
  'le rôle serveur possède les écritures minimales sans received_at'
);
select col_is_pk('public', 'attempt_events', 'event_id', 'event_id garantit la déduplication en base');

SELECT * FROM finish();
ROLLBACK;
