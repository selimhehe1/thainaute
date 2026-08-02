begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(62);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  (
    'a1000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'deletion-a@example.invalid',
    now(),
    now()
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'deletion-b@example.invalid',
    now(),
    now()
  );

insert into auth.sessions (id, user_id, created_at, updated_at)
values
  (
    'a0000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    now(),
    now()
  ),
  (
    'b0000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000001',
    now(),
    now()
  );

insert into public.profiles (user_id)
values
  ('a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000001');

insert into public.devices (id, user_id, platform, app_version)
values
  (
    'a2000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'web',
    '1.0.0'
  ),
  (
    'b2000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000001',
    'android',
    '1.0.0'
  );

insert into public.content_releases (
  id,
  version,
  status,
  manifest_sha256,
  published_at
) values (
  'c1000000-0000-4000-8000-000000000001',
  1,
  'published',
  repeat('9', 64),
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
) values (
  'c2000000-0000-4000-8000-000000000001',
  'c3000000-0000-4000-8000-000000000001',
  1,
  'c1000000-0000-4000-8000-000000000001',
  'published',
  'Fixture suppression de compte',
  '{}'::jsonb,
  repeat('8', 64),
  now()
);

insert into public.learning_items (
  id,
  lesson_version_id,
  position,
  kind,
  payload
) values (
  'd1000000-0000-4000-8000-000000000001',
  'c2000000-0000-4000-8000-000000000001',
  0,
  'listening',
  '{}'::jsonb
);

insert into public.attempt_events (
  event_id,
  user_id,
  device_id,
  exercise_id,
  item_id,
  lesson_version_id,
  selected_option_id,
  dimension,
  rating,
  answered_at,
  duration_ms,
  algorithm_version,
  payload_sha256
) values
  (
    'e1000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'a2000000-0000-4000-8000-000000000001',
    'e2000000-0000-4000-8000-000000000001',
    'd1000000-0000-4000-8000-000000000001',
    'c2000000-0000-4000-8000-000000000001',
    'e3000000-0000-4000-8000-000000000001',
    'listening',
    1,
    now() - interval '1 minute',
    1000,
    'srs-v0',
    repeat('7', 64)
  ),
  (
    'e1000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000001',
    'b2000000-0000-4000-8000-000000000001',
    'e2000000-0000-4000-8000-000000000001',
    'd1000000-0000-4000-8000-000000000001',
    'c2000000-0000-4000-8000-000000000001',
    'e3000000-0000-4000-8000-000000000001',
    'listening',
    1,
    now() - interval '1 minute',
    1000,
    'srs-v0',
    repeat('6', 64)
  );

insert into public.learner_item_state (
  user_id,
  item_id,
  lesson_version_id,
  dimension,
  mastery_permille,
  successful_attempts,
  consecutive_correct,
  attempt_count,
  last_event_id,
  last_answered_at,
  due_at,
  algorithm_version
) values
  (
    'a1000000-0000-4000-8000-000000000001',
    'd1000000-0000-4000-8000-000000000001',
    'c2000000-0000-4000-8000-000000000001',
    'listening',
    250,
    1,
    1,
    1,
    'e1000000-0000-4000-8000-000000000001',
    now() - interval '1 minute',
    now() + interval '1 day',
    'srs-v0'
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    'd1000000-0000-4000-8000-000000000001',
    'c2000000-0000-4000-8000-000000000001',
    'listening',
    250,
    1,
    1,
    1,
    'e1000000-0000-4000-8000-000000000002',
    now() - interval '1 minute',
    now() + interval '1 day',
    'srs-v0'
  );

insert into private.attempt_sync_commits (
  user_id,
  idempotency_key,
  request_sha256,
  expected_revision,
  committed_revision,
  response_body
) values
  (
    'a1000000-0000-4000-8000-000000000001',
    'f1000000-0000-4000-8000-000000000001',
    repeat('5', 64),
    0,
    1,
    '{}'::jsonb
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    'f1000000-0000-4000-8000-000000000002',
    repeat('4', 64),
    0,
    1,
    '{}'::jsonb
  );

select has_table(
  'private',
  'account_deletion_receipts',
  'le registre prive de suppression existe'
);
select col_is_pk(
  'private',
  'account_deletion_receipts',
  'receipt_id',
  'receipt_id est une identite stable'
);
select ok(
  (
    select relrowsecurity
    from pg_class
    where oid = 'private.account_deletion_receipts'::regclass
  ),
  'RLS est active en defense en profondeur sur le registre prive'
);
select is(
  (
    select count(*)::integer
    from pg_constraint
    where conrelid = 'private.account_deletion_receipts'::regclass
      and conname in (
        'account_deletion_receipts_subject_hmac_format',
        'account_deletion_receipts_idempotency_hmac_format',
        'account_deletion_receipts_request_hmac_format',
        'account_deletion_receipts_continuation_hmac_format',
        'account_deletion_receipts_status',
        'account_deletion_receipts_state',
        'account_deletion_receipts_timestamps'
      )
  ),
  7,
  'les formats, etats et horodatages portent des contraintes strictes'
);
select is(
  (
    select count(*)::integer
    from pg_constraint
    where conrelid = 'private.account_deletion_receipts'::regclass
      and conname in (
        'account_deletion_receipts_subject_idempotency_unique',
        'account_deletion_receipts_continuation_unique'
      )
      and contype = 'u'
  ),
  2,
  'idempotence et continuation sont uniques en base'
);
select is(
  (
    select confdeltype::text
    from pg_constraint
    where conrelid = 'private.account_deletion_receipts'::regclass
      and conname = 'account_deletion_receipts_target_user_fkey'
  ),
  'n',
  'la cible est nullifiee atomiquement par le hard delete Auth'
);
select has_index(
  'private',
  'account_deletion_receipts',
  'account_deletion_receipts_idempotency_hmac_idx',
  'le lookup public pre-Auth possede un index dedie'
);
select has_index(
  'private',
  'account_deletion_receipts',
  'account_deletion_receipts_active_target_idx',
  'la cascade Auth retrouve seulement les recus encore actifs'
);
select has_trigger(
  'private',
  'account_deletion_receipts',
  'finalize_account_deletion_receipt_on_auth_delete_v1',
  'le hard delete Auth finalise le recu dans la meme transaction'
);
select is(
  (
    select confdeltype::text
    from pg_constraint
    where conrelid = 'public.attempt_events'::regclass
      and conname = 'attempt_events_device_owner_fkey'
  ),
  'c',
  'la relation tentative vers appareil cascade au hard delete'
);
select ok(
  not has_schema_privilege('anon', 'private', 'usage')
  and not has_schema_privilege('authenticated', 'private', 'usage'),
  'le schema prive reste hors Data API client'
);
select ok(
  not has_any_column_privilege(
    'anon', 'private.account_deletion_receipts', 'select'
  )
  and not has_any_column_privilege(
    'authenticated', 'private.account_deletion_receipts', 'select'
  ),
  'anon et authenticated ne lisent aucune colonne du recu'
);
select ok(
  has_table_privilege(
    'service_role', 'private.account_deletion_receipts', 'select'
  )
  and has_any_column_privilege(
    'service_role', 'private.account_deletion_receipts', 'insert'
  ),
  'service_role peut lire et initialiser un recu'
);
select ok(
  not has_column_privilege(
    'service_role', 'private.account_deletion_receipts', 'receipt_id', 'insert'
  )
  and not has_column_privilege(
    'service_role', 'private.account_deletion_receipts', 'created_at', 'insert'
  )
  and not has_column_privilege(
    'service_role', 'private.account_deletion_receipts', 'status', 'insert'
  ),
  'identite, date et etat initiaux restent autoritaires'
);
select ok(
  not has_any_column_privilege(
    'service_role', 'private.account_deletion_receipts', 'update'
  )
  and not has_table_privilege(
    'service_role', 'private.account_deletion_receipts', 'delete'
  )
  and not has_function_privilege(
    'service_role',
    'private.finalize_account_deletion_receipt_v1()',
    'execute'
  ),
  'le serveur ne peut ni finaliser, reecrire, supprimer le recu ou appeler le trigger'
);

select has_function(
  'public',
  'is_account_deletion_session_active_v1',
  array['uuid', 'uuid'],
  'la RPC de session active existe'
);
select has_function(
  'public',
  'begin_account_deletion_v1',
  array['text', 'text', 'text', 'text', 'uuid'],
  'la RPC begin existe'
);
select has_function(
  'public',
  'resume_account_deletion_v1',
  array['text', 'text'],
  'la RPC resume existe'
);
select has_function(
  'public',
  'read_account_deletion_completion_v1',
  array['text', 'text'],
  'la RPC de completion existe'
);
select ok(
  not (
    select prosecdef
    from pg_proc
    where oid =
      'public.begin_account_deletion_v1(text,text,text,text,uuid)'::regprocedure
  )
  and (
    select provolatile = 'v'
    from pg_proc
    where oid =
      'public.begin_account_deletion_v1(text,text,text,text,uuid)'::regprocedure
  )
  and 2 = (
    select count(*)::integer
    from pg_proc
    where oid in (
      'public.resume_account_deletion_v1(text,text)'::regprocedure,
      'public.read_account_deletion_completion_v1(text,text)'::regprocedure
    )
      and not prosecdef
      and provolatile = 's'
  ),
  'begin est volatile; reprise et lecture sont stables; toutes sont SECURITY INVOKER'
);
select ok(
  not (
    select prosecdef
    from pg_proc
    where oid =
      'public.is_account_deletion_session_active_v1(uuid,uuid)'::regprocedure
  )
  and (
    select provolatile = 's'
    from pg_proc
    where oid =
      'public.is_account_deletion_session_active_v1(uuid,uuid)'::regprocedure
  ),
  'la verification de session est stable et SECURITY INVOKER'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.begin_account_deletion_v1(text,text,text,text,uuid)',
    'execute'
  )
  and has_function_privilege(
    'service_role',
    'public.resume_account_deletion_v1(text,text)',
    'execute'
  )
  and has_function_privilege(
    'service_role',
    'public.read_account_deletion_completion_v1(text,text)',
    'execute'
  ),
  'service_role peut executer les trois RPC'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.is_account_deletion_session_active_v1(uuid,uuid)',
    'execute'
  )
  and has_column_privilege('service_role', 'auth.sessions', 'id', 'select')
  and has_column_privilege(
    'service_role', 'auth.sessions', 'user_id', 'select'
  ),
  'service_role peut attester seulement avec id et user_id Auth'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.begin_account_deletion_v1(text,text,text,text,uuid)',
    'execute'
  )
  and not has_function_privilege(
    'authenticated',
    'public.begin_account_deletion_v1(text,text,text,text,uuid)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.resume_account_deletion_v1(text,text)',
    'execute'
  )
  and not has_function_privilege(
    'authenticated',
    'public.read_account_deletion_completion_v1(text,text)',
    'execute'
  ),
  'aucune RPC de suppression n est executable par un client'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.is_account_deletion_session_active_v1(uuid,uuid)',
    'execute'
  )
  and not has_function_privilege(
    'authenticated',
    'public.is_account_deletion_session_active_v1(uuid,uuid)',
    'execute'
  ),
  'aucun client ne peut interroger directement les sessions Auth'
);

select set_config(
  'request.jwt.claim.sub',
  'a1000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;
select throws_ok(
  $$select * from private.account_deletion_receipts$$,
  '42501',
  null,
  'l utilisateur A ne peut pas lire le registre prive'
);
select throws_ok(
  $$
    select public.resume_account_deletion_v1(
      repeat('c', 64),
      repeat('e', 64)
    )
  $$,
  '42501',
  null,
  'l utilisateur A ne peut pas appeler resume'
);
reset role;

select set_config(
  'request.jwt.claim.sub',
  'b1000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;
select throws_ok(
  $$
    select public.begin_account_deletion_v1(
      repeat('b', 64),
      repeat('c', 64),
      repeat('d', 64),
      repeat('f', 64),
      'b1000000-0000-4000-8000-000000000001'
    )
  $$,
  '42501',
  null,
  'l utilisateur B ne peut pas appeler begin'
);
reset role;

set local role anon;
select throws_ok(
  $$
    select public.read_account_deletion_completion_v1(
      repeat('c', 64),
      repeat('e', 64)
    )
  $$,
  '42501',
  null,
  'anon ne peut pas appeler la completion'
);
reset role;

set local role service_role;

select ok(
  public.is_account_deletion_session_active_v1(
    'a1000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001'
  ),
  'la session A vivante correspond a son sujet'
);
select ok(
  not public.is_account_deletion_session_active_v1(
    'b1000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001'
  ),
  'la session A ne peut jamais attester le sujet B'
);
select ok(
  not public.is_account_deletion_session_active_v1(
    'a1000000-0000-4000-8000-000000000001',
    'f0000000-0000-4000-8000-000000000001'
  ),
  'une session inconnue est refusee'
);

select is(
  public.begin_account_deletion_v1(
    repeat('a', 64),
    repeat('c', 64),
    repeat('d', 64),
    repeat('e', 64),
    'a1000000-0000-4000-8000-000000000001'
  )->>'status',
  'in_progress',
  'begin cree un recu en cours'
);
select ok(
  (
    public.begin_account_deletion_v1(
      repeat('a', 64),
      repeat('c', 64),
      repeat('d', 64),
      repeat('e', 64),
      'a1000000-0000-4000-8000-000000000001'
    )->>'receiptId'
  ) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
  'receiptId est un UUID v4 canonique genere par PostgreSQL'
);
select is(
  public.begin_account_deletion_v1(
    repeat('a', 64),
    repeat('c', 64),
    repeat('d', 64),
    repeat('e', 64),
    'a1000000-0000-4000-8000-000000000001'
  )->>'receiptId',
  public.resume_account_deletion_v1(
    repeat('c', 64),
    repeat('e', 64)
  )->>'receiptId',
  'un rejeu reprend exactement le meme receiptId'
);
select is(
  (
    select count(*)::integer
    from private.account_deletion_receipts
    where subject_hmac_sha256 = repeat('a', 64)
      and idempotency_hmac_sha256 = repeat('c', 64)
  ),
  1,
  'un rejeu ne duplique jamais le recu'
);
select is(
  public.resume_account_deletion_v1(
    repeat('c', 64),
    repeat('e', 64)
  )->>'targetUserId',
  'a1000000-0000-4000-8000-000000000001',
  'resume restitue la cible uniquement tant que le travail est en cours'
);
select is(
  (
    public.resume_account_deletion_v1(
      repeat('c', 64),
      repeat('e', 64)
    )->>'completedAt'
  )::text,
  null::text,
  'un recu en cours n annonce aucune completion'
);
select throws_ok(
  $$
    select public.begin_account_deletion_v1(
      repeat('a', 64),
      repeat('c', 64),
      repeat('1', 64),
      repeat('e', 64),
      'a1000000-0000-4000-8000-000000000001'
    )
  $$,
  'TA003',
  'Account deletion idempotency conflict.',
  'une meme idempotence refuse une requete differente'
);
select throws_ok(
  $$
    select public.begin_account_deletion_v1(
      repeat('a', 64),
      repeat('c', 64),
      repeat('d', 64),
      repeat('2', 64),
      'a1000000-0000-4000-8000-000000000001'
    )
  $$,
  'TA004',
  'Account deletion continuation mismatch.',
  'un rejeu refuse une continuation differente'
);
select throws_ok(
  $$
    select public.begin_account_deletion_v1(
      repeat('a', 64),
      repeat('c', 64),
      repeat('d', 64),
      repeat('e', 64),
      'b1000000-0000-4000-8000-000000000001'
    )
  $$,
  'TA005',
  'Account deletion target mismatch.',
  'un rejeu en cours ne peut pas changer de cible'
);
select throws_ok(
  $$
    select public.resume_account_deletion_v1(
      repeat('c', 64),
      repeat('2', 64)
    )
  $$,
  'TA004',
  'Account deletion continuation mismatch.',
  'resume refuse un mauvais secret de continuation'
);
select throws_ok(
  $$
    select public.resume_account_deletion_v1(
      repeat('3', 64),
      repeat('4', 64)
    )
  $$,
  'TA002',
  'Account deletion receipt not found.',
  'resume refuse une idempotence inconnue'
);
select throws_ok(
  $$
    select public.read_account_deletion_completion_v1(
      repeat('c', 64),
      repeat('e', 64)
    )
  $$,
  'TA006',
  'Account deletion completion is not committed.',
  'aucune RPC applicative ne peut finaliser avant le hard delete Auth'
);
select throws_ok(
  $$
    select public.begin_account_deletion_v1(
      'A',
      repeat('c', 64),
      repeat('d', 64),
      repeat('e', 64),
      'a1000000-0000-4000-8000-000000000001'
    )
  $$,
  'TA001',
  'Invalid account deletion receipt payload.',
  'les HMAC non canoniques sont refuses avant toute ecriture'
);

select is(
  public.begin_account_deletion_v1(
    repeat('b', 64),
    repeat('c', 64),
    repeat('d', 64),
    repeat('f', 64),
    'b1000000-0000-4000-8000-000000000001'
  )->>'targetUserId',
  'b1000000-0000-4000-8000-000000000001',
  'deux comptes peuvent reutiliser le meme UUID d idempotence source'
);
select isnt(
  public.resume_account_deletion_v1(
    repeat('c', 64),
    repeat('e', 64)
  )->>'receiptId',
  public.resume_account_deletion_v1(
    repeat('c', 64),
    repeat('f', 64)
  )->>'receiptId',
  'les continuations isolent les recus A et B'
);
reset role;

select lives_ok(
  $$
    delete from auth.users
    where id = 'a1000000-0000-4000-8000-000000000001'
  $$,
  'le hard delete Auth cascade malgre une tentative liee a l appareil'
);
select is(
  (
    select
      (select count(*) from auth.users
       where id = 'a1000000-0000-4000-8000-000000000001')
      + (select count(*) from public.profiles
       where user_id = 'a1000000-0000-4000-8000-000000000001')
      + (select count(*) from public.devices
         where user_id = 'a1000000-0000-4000-8000-000000000001')
      + (select count(*) from public.attempt_events
         where user_id = 'a1000000-0000-4000-8000-000000000001')
      + (select count(*) from public.learner_item_state
         where user_id = 'a1000000-0000-4000-8000-000000000001')
      + (select count(*) from private.attempt_sync_commits
         where user_id = 'a1000000-0000-4000-8000-000000000001')
  )::integer,
  0,
  'Auth, profil, appareil, tentatives, projection et commits de A sont purges'
);
select is(
  (
    select
      (select count(*) from auth.users
       where id = 'b1000000-0000-4000-8000-000000000001')
      + (select count(*) from public.profiles
       where user_id = 'b1000000-0000-4000-8000-000000000001')
      + (select count(*) from public.devices
         where user_id = 'b1000000-0000-4000-8000-000000000001')
      + (select count(*) from public.attempt_events
         where user_id = 'b1000000-0000-4000-8000-000000000001')
      + (select count(*) from public.learner_item_state
         where user_id = 'b1000000-0000-4000-8000-000000000001')
      + (select count(*) from private.attempt_sync_commits
         where user_id = 'b1000000-0000-4000-8000-000000000001')
  )::integer,
  6,
  'le hard delete de A ne touche aucune donnee de B'
);
select ok(
  (
    select target_user_id is null
      and status = 'completed'
      and completed_at is not null
    from private.account_deletion_receipts
    where subject_hmac_sha256 = repeat('a', 64)
  ),
  'le hard delete Auth finalise et pseudonymise le recu atomiquement'
);
select ok(
  not public.is_account_deletion_session_active_v1(
    'a1000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001'
  ),
  'la session A ne subsiste pas apres le hard delete Auth'
);

set local role service_role;
select is(
  public.read_account_deletion_completion_v1(
    repeat('c', 64),
    repeat('e', 64)
  )->>'status',
  'completed',
  'la RPC relit la suppression terminee'
);
select is(
  (
    public.read_account_deletion_completion_v1(
      repeat('c', 64),
      repeat('e', 64)
    )->>'targetUserId'
  )::text,
  null::text,
  'la reponse terminee ne contient plus l UUID cible'
);
select ok(
  (
    public.read_account_deletion_completion_v1(
      repeat('c', 64),
      repeat('e', 64)
    )->>'completedAt'
  ) ~ '^202[0-9]-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$',
  'completedAt est canonique UTC a trois decimales'
);
select is(
  public.read_account_deletion_completion_v1(
    repeat('c', 64),
    repeat('e', 64)
  ),
  public.read_account_deletion_completion_v1(
    repeat('c', 64),
    repeat('e', 64)
  ),
  'la lecture de completion est idempotente et rejoue le meme recu'
);
select is(
  public.resume_account_deletion_v1(
    repeat('c', 64),
    repeat('e', 64)
  )->>'completedAt',
  public.read_account_deletion_completion_v1(
    repeat('c', 64),
    repeat('e', 64)
  )->>'completedAt',
  'resume rejoue le meme instant apres suppression Auth'
);
select is(
  public.begin_account_deletion_v1(
    repeat('a', 64),
    repeat('c', 64),
    repeat('d', 64),
    repeat('e', 64),
    'a1000000-0000-4000-8000-000000000001'
  )->>'receiptId',
  public.resume_account_deletion_v1(
    repeat('c', 64),
    repeat('e', 64)
  )->>'receiptId',
  'begin rejoue aussi le recu apres disparition de auth.users'
);
reset role;

select ok(
  (
    select target_user_id is null
      and status = 'completed'
      and completed_at is not null
    from private.account_deletion_receipts
    where subject_hmac_sha256 = repeat('a', 64)
  ),
  'l etat final nullifie la cible et conserve le recu'
);
select ok(
  not (
    select to_jsonb(receipt)::text
      like '%a1000000-0000-4000-8000-000000000001%'
    from private.account_deletion_receipts as receipt
    where receipt.subject_hmac_sha256 = repeat('a', 64)
  ),
  'aucun UUID utilisateur brut ne subsiste dans le recu final'
);
select throws_ok(
  $$
    insert into private.account_deletion_receipts (
      subject_hmac_sha256,
      idempotency_hmac_sha256,
      request_hmac_sha256,
      continuation_hmac_sha256,
      target_user_id
    ) values (
      repeat('A', 64),
      repeat('1', 64),
      repeat('2', 64),
      repeat('3', 64),
      'b1000000-0000-4000-8000-000000000001'
    )
  $$,
  '23514',
  null,
  'la table refuse un HMAC majuscule non canonique'
);
select throws_ok(
  $$
    insert into private.account_deletion_receipts (
      subject_hmac_sha256,
      idempotency_hmac_sha256,
      request_hmac_sha256,
      continuation_hmac_sha256,
      target_user_id,
      status,
      created_at,
      updated_at,
      completed_at
    ) values (
      repeat('0', 64),
      repeat('1', 64),
      repeat('2', 64),
      repeat('3', 64),
      'b1000000-0000-4000-8000-000000000001',
      'completed',
      now(),
      now(),
      now()
    )
  $$,
  '23514',
  null,
  'la table interdit un etat final qui conserve l UUID cible'
);

select * from finish();
rollback;
