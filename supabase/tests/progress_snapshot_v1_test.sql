begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(15);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('a1000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'snapshot-a@example.invalid', now(), now()),
  ('b1000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'snapshot-b@example.invalid', now(), now());

insert into public.profiles (user_id, sync_revision)
values
  ('a1000000-0000-4000-8000-000000000001', 7),
  ('b1000000-0000-4000-8000-000000000001', 3);

insert into public.devices (id, user_id, platform, app_version)
values
  ('a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'web', '0.0.1'),
  ('b2000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'android', '0.0.1');

insert into public.content_releases (
  id, version, status, manifest_sha256, published_at
)
values (
  'c1000000-0000-4000-8000-000000000001',
  9101,
  'published',
  repeat('a', 64),
  '2026-08-01T09:00:00.000Z'
);

insert into public.lesson_versions (
  id, lesson_id, version, release_id, status, title_fr, payload,
  payload_sha256, published_at
)
values (
  'c2000000-0000-4000-8000-000000000001',
  'c3000000-0000-4000-8000-000000000001',
  1,
  'c1000000-0000-4000-8000-000000000001',
  'published',
  'Snapshot fixture',
  '{}'::jsonb,
  repeat('b', 64),
  '2026-08-01T09:00:00.000Z'
);

insert into public.learning_items (id, lesson_version_id, position, kind, payload)
values
  ('d1000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001', 0, 'listening', '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000001', 1, 'reading', '{}'::jsonb);

insert into public.attempt_events (
  event_id, user_id, device_id, exercise_id, item_id, lesson_version_id,
  selected_option_id, dimension, rating, answered_at, duration_ms,
  algorithm_version, payload_sha256, received_at
)
values
  (
    'e1000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'a2000000-0000-4000-8000-000000000001',
    'e2000000-0000-4000-8000-000000000001',
    'd1000000-0000-4000-8000-000000000001',
    'c2000000-0000-4000-8000-000000000001',
    'e3000000-0000-4000-8000-000000000001',
    'listening', 1, '2026-08-01T10:00:00.000Z', 1000,
    'srs-v0', repeat('c', 64), '2026-08-01T10:00:00.000Z'
  ),
  (
    'e1000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000001',
    'a2000000-0000-4000-8000-000000000001',
    'e2000000-0000-4000-8000-000000000002',
    'd1000000-0000-4000-8000-000000000002',
    'c2000000-0000-4000-8000-000000000001',
    'e3000000-0000-4000-8000-000000000002',
    'reading', 1, '2026-08-01T10:01:00.000Z', 1000,
    'srs-v0', repeat('d', 64), '2026-08-01T10:01:00.000Z'
  ),
  (
    'e1000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000001',
    'b2000000-0000-4000-8000-000000000001',
    'e2000000-0000-4000-8000-000000000003',
    'd1000000-0000-4000-8000-000000000001',
    'c2000000-0000-4000-8000-000000000001',
    'e3000000-0000-4000-8000-000000000003',
    'listening', 0, '2026-08-01T10:02:00.000Z', 1000,
    'srs-v0', repeat('e', 64), '2026-08-01T10:02:00.000Z'
  );

insert into public.learner_item_state (
  user_id, item_id, lesson_version_id, dimension, mastery_permille,
  successful_attempts, consecutive_correct, attempt_count, last_event_id,
  last_answered_at, due_at, algorithm_version
)
values
  (
    'a1000000-0000-4000-8000-000000000001',
    'd1000000-0000-4000-8000-000000000002',
    'c2000000-0000-4000-8000-000000000001',
    'reading', 750, 3, 3, 3,
    'e1000000-0000-4000-8000-000000000002',
    '2026-08-01T10:01:00.000Z', '2026-08-08T10:01:00.000Z', 'srs-v0'
  ),
  (
    'a1000000-0000-4000-8000-000000000001',
    'd1000000-0000-4000-8000-000000000001',
    'c2000000-0000-4000-8000-000000000001',
    'listening', 250, 1, 1, 1,
    'e1000000-0000-4000-8000-000000000001',
    '2026-08-01T10:00:00.000Z', '2026-08-02T10:00:00.000Z', 'srs-v0'
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    'd1000000-0000-4000-8000-000000000001',
    'c2000000-0000-4000-8000-000000000001',
    'listening', 0, 0, 0, 1,
    'e1000000-0000-4000-8000-000000000003',
    '2026-08-01T10:02:00.000Z', '2026-08-01T10:12:00.000Z', 'srs-v0'
  );

select has_function(
  'public', 'get_progress_snapshot_v1', array['uuid'],
  'la RPC de snapshot existe'
);
select function_returns(
  'public', 'get_progress_snapshot_v1', array['uuid'], 'jsonb',
  'la RPC renvoie un objet jsonb'
);
select volatility_is(
  'public', 'get_progress_snapshot_v1', array['uuid'], 'volatile',
  'la RPC est volatile car elle verrouille le profil'
);
select ok(
  not (
    select prosecdef
    from pg_proc
    where oid = 'public.get_progress_snapshot_v1(uuid)'::regprocedure
  ),
  'la RPC est SECURITY INVOKER'
);
select ok(
  has_function_privilege(
    'service_role', 'public.get_progress_snapshot_v1(uuid)', 'execute'
  ),
  'service_role peut exécuter la RPC'
);
select ok(
  not has_function_privilege(
    'authenticated', 'public.get_progress_snapshot_v1(uuid)', 'execute'
  ),
  'authenticated ne peut pas exécuter la RPC'
);
select ok(
  not has_function_privilege(
    'anon', 'public.get_progress_snapshot_v1(uuid)', 'execute'
  ),
  'anon ne peut pas exécuter la RPC'
);

set local role service_role;

select is(
  (public.get_progress_snapshot_v1('a1000000-0000-4000-8000-000000000001')->>'syncRevision')::integer,
  7,
  'la révision A est autoritaire'
);
select is(
  jsonb_array_length(
    public.get_progress_snapshot_v1('a1000000-0000-4000-8000-000000000001')->'states'
  ),
  2,
  'A reçoit uniquement ses deux états'
);
select is(
  public.get_progress_snapshot_v1('a1000000-0000-4000-8000-000000000001')
    #>> '{states,0,itemId}',
  'd1000000-0000-4000-8000-000000000001',
  'les états sont triés par item et dimension'
);
select is(
  public.get_progress_snapshot_v1('a1000000-0000-4000-8000-000000000001')
    #>> '{states,1,status}',
  'confirmed',
  'le statut confirmé est dérivé des invariants SRS v0'
);
select is(
  public.get_progress_snapshot_v1('a1000000-0000-4000-8000-000000000001')
    #>> '{states,1,dueAt}',
  '2026-08-08T10:01:00.000Z',
  'dueAt est sérialisé en UTC avec exactement trois décimales'
);
select is(
  public.get_progress_snapshot_v1('b1000000-0000-4000-8000-000000000001')
    #>> '{states,0,masteryPermille}',
  '0',
  'B reçoit sa propre maîtrise sans lire celle de A'
);
select throws_ok(
  $$select public.get_progress_snapshot_v1(null::uuid)$$,
  'TP001',
  'Invalid progress snapshot identity.',
  'une identité nulle est refusée'
);
select throws_ok(
  $$select public.get_progress_snapshot_v1('f1000000-0000-4000-8000-000000000001')$$,
  'TP002',
  'Progress profile not found.',
  'un profil absent est refusé explicitement'
);

select * from finish();
rollback;
