begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(32);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'sync-a@example.invalid', now(), now()),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'sync-b@example.invalid', now(), now());

insert into public.profiles (user_id)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

insert into public.devices (id, user_id, platform, app_version)
values
  ('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'web', '0.0.1'),
  ('dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'android', '0.0.1');

insert into public.content_releases (
  id, version, status, manifest_sha256, published_at
)
values (
  '30000000-0000-4000-8000-000000000001',
  1,
  'published',
  repeat('a', 64),
  now()
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
  '31000000-0000-4000-8000-000000000001',
  '31100000-0000-4000-8000-000000000001',
  1,
  '30000000-0000-4000-8000-000000000001',
  'published',
  'Fixture de synchronisation atomique',
  '{}'::jsonb,
  repeat('c', 64),
  now()
);

insert into public.learning_items (
  id, lesson_version_id, position, kind, payload
)
values (
  '32000000-0000-4000-8000-000000000001',
  '31000000-0000-4000-8000-000000000001',
  0,
  'listening',
  '{}'::jsonb
);

create temporary table sync_test_payloads as
select
  jsonb_build_array(
    jsonb_build_object(
      'event_id', '50000000-0000-4000-8000-000000000001',
      'device_id', 'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'exercise_id', '51000000-0000-4000-8000-000000000001',
      'item_id', '32000000-0000-4000-8000-000000000001',
      'lesson_version_id', '31000000-0000-4000-8000-000000000001',
      'selected_option_id', '52000000-0000-4000-8000-000000000001',
      'dimension', 'listening',
      'rating', 1,
      'answered_at', '2026-08-01T10:00:00.000Z',
      'duration_ms', 1000,
      'algorithm_version', 'srs-v0',
      'payload_sha256', repeat('e', 64)
    )
  ) as event_one,
  jsonb_build_array(
    jsonb_build_object(
      'event_id', '50000000-0000-4000-8000-000000000001',
      'device_id', 'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'exercise_id', '51000000-0000-4000-8000-000000000001',
      'item_id', '32000000-0000-4000-8000-000000000001',
      'lesson_version_id', '31000000-0000-4000-8000-000000000001',
      'selected_option_id', '52000000-0000-4000-8000-000000000002',
      'dimension', 'listening',
      'rating', 0,
      'answered_at', '2026-08-01T10:00:00.000Z',
      'duration_ms', 1000,
      'algorithm_version', 'srs-v0',
      'payload_sha256', repeat('f', 64)
    )
  ) as event_one_collision,
  jsonb_build_array(
    jsonb_build_object(
      'event_id', '50000000-0000-4000-8000-000000000002',
      'device_id', 'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'exercise_id', '51000000-0000-4000-8000-000000000001',
      'item_id', '32000000-0000-4000-8000-000000000001',
      'lesson_version_id', '31000000-0000-4000-8000-000000000001',
      'selected_option_id', '52000000-0000-4000-8000-000000000001',
      'dimension', 'listening',
      'rating', 1,
      'answered_at', '2026-08-02T10:00:00.000Z',
      'duration_ms', 900,
      'algorithm_version', 'srs-v0',
      'payload_sha256', repeat('2', 64)
    )
  ) as event_two,
  jsonb_build_array(
    jsonb_build_object(
      'item_id', '32000000-0000-4000-8000-000000000001',
      'lesson_version_id', '31000000-0000-4000-8000-000000000001',
      'dimension', 'listening',
      'mastery_permille', 250,
      'successful_attempts', 1,
      'consecutive_correct', 1,
      'attempt_count', 1,
      'last_event_id', '50000000-0000-4000-8000-000000000001',
      'last_answered_at', '2026-08-01T10:00:00.000Z',
      'due_at', '2026-08-02T10:00:00.000Z',
      'algorithm_version', 'srs-v0'
    )
  ) as projection_one,
  jsonb_build_array(
    jsonb_build_object(
      'item_id', '32000000-0000-4000-8000-000000000001',
      'lesson_version_id', '31000000-0000-4000-8000-000000000001',
      'dimension', 'listening',
      'mastery_permille', 1001,
      'successful_attempts', 2,
      'consecutive_correct', 2,
      'attempt_count', 2,
      'last_event_id', '50000000-0000-4000-8000-000000000002',
      'last_answered_at', '2026-08-02T10:00:00.000Z',
      'due_at', '2026-08-03T10:00:00.000Z',
      'algorithm_version', 'srs-v0'
    )
  ) as projection_two_invalid,
  jsonb_build_object(
    'acceptedEventIds', jsonb_build_array('50000000-0000-4000-8000-000000000001'),
    'duplicateEventIds', '[]'::jsonb,
    'projections', jsonb_build_array(
      jsonb_build_object(
        'itemId', '32000000-0000-4000-8000-000000000001',
        'skill', 'listening',
        'masteryPermille', 250,
        'dueAt', '2026-08-02T10:00:00.000Z'
      )
    )
  ) as response_one,
  '{"sentinel":"must-not-replace-stored-response"}'::jsonb as response_changed;

grant select on pg_temp.sync_test_payloads to service_role;

select has_column(
  'public',
  'profiles',
  'sync_revision',
  'profiles expose une revision de synchronisation'
);
select has_table(
  'private',
  'attempt_sync_commits',
  'le registre idempotent reste dans le schema prive'
);
select ok(
  (
    select relrowsecurity
    from pg_class
    where oid = 'private.attempt_sync_commits'::regclass
  ),
  'RLS est active en defense en profondeur sur le registre prive'
);
select ok(
  to_regprocedure(
    'public.commit_attempt_batch_v1(uuid,uuid,text,bigint,jsonb,jsonb,jsonb)'
  ) is not null,
  'la RPC v1 existe avec une signature non ambigue'
);
select ok(
  not (
    select prosecdef
    from pg_proc
    where oid = 'public.commit_attempt_batch_v1(uuid,uuid,text,bigint,jsonb,jsonb,jsonb)'::regprocedure
  ),
  'la RPC est SECURITY INVOKER'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.commit_attempt_batch_v1(uuid,uuid,text,bigint,jsonb,jsonb,jsonb)',
    'execute'
  ),
  'service_role peut executer la RPC'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.commit_attempt_batch_v1(uuid,uuid,text,bigint,jsonb,jsonb,jsonb)',
    'execute'
  ),
  'authenticated ne peut pas executer la RPC'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.commit_attempt_batch_v1(uuid,uuid,text,bigint,jsonb,jsonb,jsonb)',
    'execute'
  ),
  'anon ne peut pas executer la RPC'
);
select ok(
  not has_schema_privilege('authenticated', 'private', 'usage'),
  'authenticated ne peut pas resoudre le schema prive'
);
select ok(
  not has_schema_privilege('anon', 'private', 'usage'),
  'anon ne peut pas resoudre le schema prive'
);
select ok(
  not has_table_privilege(
    'authenticated', 'private.attempt_sync_commits', 'select'
  ),
  'authenticated ne lit pas le registre idempotent'
);
select ok(
  not has_table_privilege('anon', 'private.attempt_sync_commits', 'select'),
  'anon ne lit pas le registre idempotent'
);
select ok(
  has_table_privilege(
    'service_role', 'private.attempt_sync_commits', 'select'
  )
  and has_table_privilege(
    'service_role', 'private.attempt_sync_commits', 'insert'
  )
  and not has_table_privilege(
    'service_role', 'private.attempt_sync_commits', 'update'
  )
  and not has_table_privilege(
    'service_role', 'private.attempt_sync_commits', 'delete'
  ),
  'service_role peut seulement lire et ajouter au registre immuable'
);
select ok(
  has_column_privilege(
    'service_role', 'public.profiles', 'sync_revision', 'update'
  )
  and not has_column_privilege(
    'service_role', 'public.profiles', 'user_id', 'update'
  ),
  'service_role ne peut mettre a jour que la revision du profil'
);

set local role service_role;

select is(
  public.commit_attempt_batch_v1(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '60000000-0000-4000-8000-000000000001',
    repeat('1', 64),
    0,
    (select event_one from pg_temp.sync_test_payloads),
    (select projection_one from pg_temp.sync_test_payloads),
    (select response_one from pg_temp.sync_test_payloads)
  ),
  jsonb_build_object(
    'kind', 'committed',
    'response', (select response_one from pg_temp.sync_test_payloads) || '{"syncRevision":1}'::jsonb,
    'syncRevision', 1
  ),
  'le premier appel commit la reponse publique avec son curseur autoritaire'
);
select is(
  jsonb_build_array(
    (
      select sync_revision
      from public.profiles
      where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    ),
    (
      select count(*)
      from public.attempt_events
      where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    ),
    (
      select mastery_permille
      from public.learner_item_state
      where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    ),
    (
      select count(*)
      from private.attempt_sync_commits
      where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    )
  ),
  '[1,1,250,1]'::jsonb,
  'journal, projection, revision et registre sont engages ensemble'
);
select is(
  public.commit_attempt_batch_v1(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '60000000-0000-4000-8000-000000000001',
    repeat('1', 64),
    999,
    (select event_one from pg_temp.sync_test_payloads),
    (select projection_one from pg_temp.sync_test_payloads),
    (select response_changed from pg_temp.sync_test_payloads)
  ),
  jsonb_build_object(
    'kind', 'replayed',
    'response', (select response_one from pg_temp.sync_test_payloads) || '{"syncRevision":1}'::jsonb,
    'syncRevision', 1
  ),
  'un retry renvoie strictement la reponse initialement stockee'
);
select is(
  jsonb_build_array(
    (
      select sync_revision
      from public.profiles
      where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    ),
    (
      select count(*)
      from public.attempt_events
      where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    ),
    (
      select count(*)
      from private.attempt_sync_commits
      where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    )
  ),
  '[1,1,1]'::jsonb,
  'un replay ne produit aucun nouvel effet'
);
select throws_ok(
  $sql$
    select public.commit_attempt_batch_v1(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '60000000-0000-4000-8000-000000000001',
      repeat('9', 64),
      0,
      (select event_one from pg_temp.sync_test_payloads),
      (select projection_one from pg_temp.sync_test_payloads),
      (select response_one from pg_temp.sync_test_payloads)
    )
  $sql$,
  'TS003',
  'Idempotency key conflict.',
  'une cle idempotente ne peut pas designer un autre hash'
);
select is(
  (
    select sync_revision
    from public.profiles
    where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  ),
  1::bigint,
  'le conflit de hash ne modifie pas la revision'
);
select throws_ok(
  $sql$
    select public.commit_attempt_batch_v1(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '60000000-0000-4000-8000-000000000003',
      repeat('3', 64),
      0,
      (select event_two from pg_temp.sync_test_payloads),
      (select projection_two_invalid from pg_temp.sync_test_payloads),
      (select response_changed from pg_temp.sync_test_payloads)
    )
  $sql$,
  'TS004',
  'Sync revision conflict.',
  'une revision client obsolete est refusee sous verrou'
);
select is(
  (
    select count(*)
    from private.attempt_sync_commits
    where idempotency_key = '60000000-0000-4000-8000-000000000003'
  ),
  0::bigint,
  'un conflit de revision ne reserve pas la cle idempotente'
);
select throws_ok(
  $sql$
    select public.commit_attempt_batch_v1(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '60000000-0000-4000-8000-000000000004',
      repeat('4', 64),
      1,
      (select event_one_collision from pg_temp.sync_test_payloads),
      (select projection_one from pg_temp.sync_test_payloads),
      (select response_changed from pg_temp.sync_test_payloads)
    )
  $sql$,
  'TS005',
  'Attempt event identity conflict.',
  'un event_id existant ne peut pas changer de hash'
);
select is(
  jsonb_build_array(
    (
      select count(*)
      from public.attempt_events
      where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    ),
    (
      select sync_revision
      from public.profiles
      where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    )
  ),
  '[1,1]'::jsonb,
  'la collision event/hash ne remplace rien et ne change pas la revision'
);
select throws_ok(
  $sql$
    select public.commit_attempt_batch_v1(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '60000000-0000-4000-8000-000000000005',
      repeat('5', 64),
      1,
      (select event_two from pg_temp.sync_test_payloads),
      (select projection_two_invalid from pg_temp.sync_test_payloads),
      (select response_changed from pg_temp.sync_test_payloads)
    )
  $sql$,
  'TS006',
  'Attempt sync projection violates persistence constraints.',
  'une projection invalide annule le commit apres insertion de la tentative'
);
select is(
  (
    select count(*)
    from public.attempt_events
    where event_id = '50000000-0000-4000-8000-000000000002'
  ),
  0::bigint,
  'la tentative inseree avant une erreur de projection est annulee'
);
select is(
  (
    select count(*)
    from private.attempt_sync_commits
    where idempotency_key = '60000000-0000-4000-8000-000000000005'
  ),
  0::bigint,
  'la cle idempotente du commit invalide nest pas conservee'
);
select is(
  (
    select sync_revision
    from public.profiles
    where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  ),
  1::bigint,
  'la revision est inchangee apres le rollback atomique'
);
select is(
  public.commit_attempt_batch_v1(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '60000000-0000-4000-8000-000000000006',
    repeat('6', 64),
    1,
    '[]'::jsonb,
    '[]'::jsonb,
    (select response_changed from pg_temp.sync_test_payloads)
  ),
  jsonb_build_object(
    'kind', 'committed',
    'response', (select response_changed from pg_temp.sync_test_payloads) || '{"syncRevision":2}'::jsonb,
    'syncRevision', 2
  ),
  'un lot entierement rejete peut enregistrer une reponse sans evenement'
);
select is(
  public.commit_attempt_batch_v1(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '60000000-0000-4000-8000-000000000006',
    repeat('6', 64),
    999,
    '[]'::jsonb,
    '[]'::jsonb,
    (select response_one from pg_temp.sync_test_payloads)
  ),
  jsonb_build_object(
    'kind', 'replayed',
    'response', (select response_changed from pg_temp.sync_test_payloads) || '{"syncRevision":2}'::jsonb,
    'syncRevision', 2
  ),
  'le lot vide rejoue la reponse stockee malgre une revision rafraichie'
);

reset role;

select set_config(
  'request.jwt.claim.sub',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  true
);
set local role authenticated;
select is(
  (
    select jsonb_build_object(
      'count', count(*),
      'revision', max(sync_revision)
    )
    from public.profiles
  ),
  '{"count":1,"revision":2}'::jsonb,
  'A ne lit que sa revision de profil'
);
reset role;

select set_config(
  'request.jwt.claim.sub',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  true
);
set local role authenticated;
select is(
  (
    select jsonb_build_object(
      'count', count(*),
      'revision', max(sync_revision)
    )
    from public.profiles
  ),
  '{"count":1,"revision":0}'::jsonb,
  'B ne lit ni le profil ni la revision de A'
);
reset role;

select * from finish();
rollback;
