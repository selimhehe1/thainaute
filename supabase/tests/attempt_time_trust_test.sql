begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(11);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values (
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'authenticated',
  'authenticated',
  'time-trust@example.invalid',
  now(),
  now()
);

insert into public.profiles (user_id)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc');

insert into public.devices (id, user_id, platform, app_version)
values (
  'dccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'web',
  '0.0.1'
);

insert into public.content_releases (
  id, version, status, manifest_sha256, published_at
)
values (
  '70000000-0000-4000-8000-000000000001',
  7001,
  'published',
  repeat('7', 64),
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
  '71000000-0000-4000-8000-000000000001',
  '71100000-0000-4000-8000-000000000001',
  1,
  '70000000-0000-4000-8000-000000000001',
  'published',
  'Fixture de confiance temporelle',
  '{}'::jsonb,
  repeat('8', 64),
  now()
);

insert into public.learning_items (
  id, lesson_version_id, position, kind, payload
)
values (
  '72000000-0000-4000-8000-000000000001',
  '71000000-0000-4000-8000-000000000001',
  0,
  'listening',
  '{}'::jsonb
);

select ok(
  coalesce(
    (
      select constraint_row.convalidated
      from pg_constraint as constraint_row
      where constraint_row.conrelid = 'public.attempt_events'::regclass
        and constraint_row.conname = 'attempt_events_received_time_guard'
        and constraint_row.contype = 'c'
    ),
    false
  ),
  'la contrainte temporelle existe et est validee'
);

select ok(
  exists (
    select 1
    from pg_class as index_row
    join pg_index as index_definition
      on index_definition.indexrelid = index_row.oid
    where index_definition.indrelid = 'public.attempt_events'::regclass
      and index_row.relname = 'attempt_events_user_device_idx'
      and pg_get_indexdef(index_row.oid) like '%(user_id, device_id)%'
  ),
  'la cle etrangere appareil dispose de son index composite'
);

select ok(
  (
    select bool_and(
      has_column_privilege(
        'service_role',
        'public.attempt_events',
        expected_column.column_name,
        'insert'
      )
    )
    from (
      values
        ('event_id'),
        ('user_id'),
        ('device_id'),
        ('exercise_id'),
        ('item_id'),
        ('lesson_version_id'),
        ('selected_option_id'),
        ('dimension'),
        ('rating'),
        ('answered_at'),
        ('duration_ms'),
        ('algorithm_version'),
        ('payload_sha256')
    ) as expected_column (column_name)
  )
  and not has_column_privilege(
    'service_role', 'public.attempt_events', 'received_at', 'insert'
  ),
  'service_role insere seulement les colonnes calculees attendues'
);

select ok(
  not has_any_column_privilege(
    'anon', 'public.attempt_events', 'insert'
  )
  and not has_any_column_privilege(
    'authenticated', 'public.attempt_events', 'insert'
  ),
  'les roles clients ne peuvent inserer aucune colonne de tentative'
);

set local role service_role;

select lives_ok(
  $sql$
    insert into public.attempt_events (
      event_id, user_id, device_id, exercise_id, item_id, lesson_version_id,
      selected_option_id, dimension, rating, answered_at, duration_ms,
      algorithm_version, payload_sha256
    ) values (
      '73000000-0000-4000-8000-000000000001',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'dccccccc-cccc-4ccc-8ccc-cccccccccccc',
      '73100000-0000-4000-8000-000000000001',
      '72000000-0000-4000-8000-000000000001',
      '71000000-0000-4000-8000-000000000001',
      '73200000-0000-4000-8000-000000000001',
      'listening', 1, now(), 1000, 'srs-v0', repeat('9', 64)
    )
  $sql$,
  'le role serveur laisse PostgreSQL attribuer received_at'
);

select is(
  (
    select received_at
    from public.attempt_events
    where event_id = '73000000-0000-4000-8000-000000000001'
  ),
  transaction_timestamp(),
  'received_at vient du default transactionnel PostgreSQL'
);

select lives_ok(
  $sql$
    do $block$
    begin
      begin
        insert into public.attempt_events (
          event_id, user_id, device_id, exercise_id, item_id,
          lesson_version_id, selected_option_id, dimension, rating,
          answered_at, duration_ms, algorithm_version, payload_sha256,
          received_at
        ) values (
          '73000000-0000-4000-8000-000000000002',
          'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
          'dccccccc-cccc-4ccc-8ccc-cccccccccccc',
          '73100000-0000-4000-8000-000000000001',
          '72000000-0000-4000-8000-000000000001',
          '71000000-0000-4000-8000-000000000001',
          '73200000-0000-4000-8000-000000000001',
          'listening', 1, now(), 1000, 'srs-v0', repeat('a', 64), now()
        );
        raise sqlstate 'P0001'
          using message = 'received_at aurait du etre interdit';
      exception
        when insufficient_privilege then null;
      end;
    end
    $block$
  $sql$,
  'service_role ne peut pas imposer received_at'
);

reset role;

select lives_ok(
  $sql$
    insert into public.attempt_events (
      event_id, user_id, device_id, exercise_id, item_id, lesson_version_id,
      selected_option_id, dimension, rating, answered_at, duration_ms,
      algorithm_version, payload_sha256, received_at
    ) values (
      '73000000-0000-4000-8000-000000000003',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'dccccccc-cccc-4ccc-8ccc-cccccccccccc',
      '73100000-0000-4000-8000-000000000001',
      '72000000-0000-4000-8000-000000000001',
      '71000000-0000-4000-8000-000000000001',
      '73200000-0000-4000-8000-000000000001',
      'listening', 1,
      '2026-07-01T10:00:00.000Z', 1000, 'srs-v0', repeat('b', 64),
      '2026-08-01T10:00:00.000Z'
    )
  $sql$,
  'la borne SQL passee de 31 jours est inclusive'
);

select lives_ok(
  $sql$
    do $block$
    begin
      begin
        insert into public.attempt_events (
          event_id, user_id, device_id, exercise_id, item_id,
          lesson_version_id, selected_option_id, dimension, rating,
          answered_at, duration_ms, algorithm_version, payload_sha256,
          received_at
        ) values (
          '73000000-0000-4000-8000-000000000004',
          'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
          'dccccccc-cccc-4ccc-8ccc-cccccccccccc',
          '73100000-0000-4000-8000-000000000001',
          '72000000-0000-4000-8000-000000000001',
          '71000000-0000-4000-8000-000000000001',
          '73200000-0000-4000-8000-000000000001',
          'listening', 1,
          '2026-07-01T09:59:59.999Z', 1000, 'srs-v0', repeat('c', 64),
          '2026-08-01T10:00:00.000Z'
        );
        raise sqlstate 'P0001'
          using message = 'la borne passee aurait du etre refusee';
      exception
        when check_violation then null;
      end;
    end
    $block$
  $sql$,
  'la base refuse plus de 31 jours dans le passe'
);

select lives_ok(
  $sql$
    insert into public.attempt_events (
      event_id, user_id, device_id, exercise_id, item_id, lesson_version_id,
      selected_option_id, dimension, rating, answered_at, duration_ms,
      algorithm_version, payload_sha256, received_at
    ) values (
      '73000000-0000-4000-8000-000000000005',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'dccccccc-cccc-4ccc-8ccc-cccccccccccc',
      '73100000-0000-4000-8000-000000000001',
      '72000000-0000-4000-8000-000000000001',
      '71000000-0000-4000-8000-000000000001',
      '73200000-0000-4000-8000-000000000001',
      'listening', 1,
      '2026-08-01T10:10:00.000Z', 1000, 'srs-v0', repeat('d', 64),
      '2026-08-01T10:00:00.000Z'
    )
  $sql$,
  'la borne SQL future de dix minutes est inclusive'
);

select lives_ok(
  $sql$
    do $block$
    begin
      begin
        insert into public.attempt_events (
          event_id, user_id, device_id, exercise_id, item_id,
          lesson_version_id, selected_option_id, dimension, rating,
          answered_at, duration_ms, algorithm_version, payload_sha256,
          received_at
        ) values (
          '73000000-0000-4000-8000-000000000006',
          'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
          'dccccccc-cccc-4ccc-8ccc-cccccccccccc',
          '73100000-0000-4000-8000-000000000001',
          '72000000-0000-4000-8000-000000000001',
          '71000000-0000-4000-8000-000000000001',
          '73200000-0000-4000-8000-000000000001',
          'listening', 1,
          '2026-08-01T10:10:00.001Z', 1000, 'srs-v0', repeat('e', 64),
          '2026-08-01T10:00:00.000Z'
        );
        raise sqlstate 'P0001'
          using message = 'la borne future aurait du etre refusee';
      exception
        when check_violation then null;
      end;
    end
    $block$
  $sql$,
  'la base refuse plus de dix minutes dans le futur'
);

select * from finish();
rollback;
