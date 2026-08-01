-- Commit atomique du journal de tentatives et de ses projections.
-- La logique pedagogique reste dans le serveur TypeScript ; PostgreSQL garantit
-- ici le verrou de revision, l'idempotence et l'atomicite de la persistance.

alter table public.profiles
  add column sync_revision bigint not null default 0
  check (sync_revision >= 0);

-- La révision et l'horodatage sont autoritaires. Le client peut seulement
-- présenter son propre UUID, ensuite contrôlé par la policy WITH CHECK.
revoke insert on public.profiles from authenticated;
grant insert (user_id) on public.profiles to authenticated;

-- Les payloads éditoriaux contiennent encore les clés de correction. Ils sont
-- réservés au serveur jusqu'à l'ajout d'un DTO public explicitement expurgé.
revoke select on public.lesson_versions, public.learning_items, public.audio_assets
from anon, authenticated;

create schema if not exists private;

revoke all on schema private from public, anon, authenticated, service_role;
grant usage on schema private to service_role;

create table private.attempt_sync_commits (
  user_id uuid not null
    references public.profiles (user_id) on delete cascade,
  idempotency_key uuid not null,
  request_sha256 text not null
    check (request_sha256 ~ '^[0-9a-f]{64}$'),
  expected_revision bigint not null
    check (expected_revision >= 0),
  committed_revision bigint not null
    check (committed_revision > 0),
  response_body jsonb not null
    check (jsonb_typeof(response_body) = 'object'),
  created_at timestamptz not null default now(),
  primary key (user_id, idempotency_key),
  unique (user_id, committed_revision)
);

alter table private.attempt_sync_commits enable row level security;

create policy attempt_sync_commits_service_read
on private.attempt_sync_commits for select to service_role
using (true);

create policy attempt_sync_commits_service_insert
on private.attempt_sync_commits for insert to service_role
with check (true);

revoke all on private.attempt_sync_commits
from public, anon, authenticated, service_role;

grant select, insert on private.attempt_sync_commits to service_role;
grant update (sync_revision) on public.profiles to service_role;

create function public.commit_attempt_batch_v1(
  p_user_id uuid,
  p_idempotency_key uuid,
  p_request_sha256 text,
  p_expected_revision bigint,
  p_events jsonb,
  p_projections jsonb,
  p_response jsonb
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $function$
declare
  v_current_revision bigint;
  v_new_revision bigint;
  v_stored_hash text;
  v_stored_committed_revision bigint;
  v_stored_response jsonb;
  v_committed_response jsonb;
  v_conflicting_event_id uuid;
begin
  if p_user_id is null
    or p_idempotency_key is null
    or p_request_sha256 is null
    or p_request_sha256 !~ '^[0-9a-f]{64}$'
    or p_expected_revision is null
    or p_expected_revision < 0
    or p_events is null
    or jsonb_typeof(p_events) <> 'array'
    or jsonb_array_length(p_events) > 50
    or p_projections is null
    or jsonb_typeof(p_projections) <> 'array'
    or jsonb_array_length(p_projections) > 50
    or p_response is null
    or jsonb_typeof(p_response) <> 'object'
  then
    raise sqlstate 'TS001'
      using message = 'Invalid attempt sync payload.';
  end if;

  -- Toutes les synchronisations d'un compte prennent le meme verrou avant de
  -- consulter le registre. Un retry attend donc le premier commit puis rejoue
  -- sa reponse, au lieu d'entrer en conflit avec la revision deja incrementee.
  select profile.sync_revision
  into v_current_revision
  from public.profiles as profile
  where profile.user_id = p_user_id
  for update;

  if not found then
    raise sqlstate 'TS002'
      using message = 'Sync profile not found.';
  end if;

  select
    stored_commit.request_sha256,
    stored_commit.committed_revision,
    stored_commit.response_body
  into
    v_stored_hash,
    v_stored_committed_revision,
    v_stored_response
  from private.attempt_sync_commits as stored_commit
  where stored_commit.user_id = p_user_id
    and stored_commit.idempotency_key = p_idempotency_key;

  if found then
    -- La revision attendue est conservee pour audit, mais le hash de requete
    -- est l'identite du retry. Un client peut avoir rafraichi sa revision
    -- apres un timeout sans que cela transforme le rejeu en conflit.
    if v_stored_hash <> p_request_sha256 then
      raise sqlstate 'TS003'
        using message = 'Idempotency key conflict.';
    end if;

    return jsonb_build_object(
      'kind', 'replayed',
      'response', v_stored_response,
      'syncRevision', v_stored_committed_revision
    );
  end if;

  if v_current_revision <> p_expected_revision then
    raise sqlstate 'TS004'
      using
        message = 'Sync revision conflict.',
        detail = jsonb_build_object(
          'currentRevision', v_current_revision
        )::text;
  end if;

  -- Les champs user_id et les resultats de progression ne proviennent jamais
  -- directement du client. Ils sont fournis par le serveur authentifie.
  if exists (
    select 1
    from jsonb_to_recordset(p_events) as event_input (
      event_id uuid,
      device_id uuid,
      exercise_id uuid,
      item_id uuid,
      lesson_version_id uuid,
      selected_option_id uuid,
      dimension text,
      rating smallint,
      answered_at timestamptz,
      duration_ms integer,
      algorithm_version text,
      payload_sha256 text
    )
    where event_input.event_id is null
      or event_input.device_id is null
      or event_input.exercise_id is null
      or event_input.item_id is null
      or event_input.lesson_version_id is null
      or event_input.selected_option_id is null
      or event_input.dimension is null
      or event_input.rating is null
      or event_input.answered_at is null
      or event_input.duration_ms is null
      or event_input.algorithm_version is null
      or event_input.payload_sha256 is null
  ) then
    raise sqlstate 'TS001'
      using message = 'Attempt sync event is incomplete.';
  end if;

  select collision.event_id
  into v_conflicting_event_id
  from (
    select event_input.event_id
    from jsonb_to_recordset(p_events) as event_input (
      event_id uuid,
      payload_sha256 text
    )
    group by event_input.event_id
    having count(distinct event_input.payload_sha256) > 1
  ) as collision
  order by collision.event_id
  limit 1;

  if found then
    raise sqlstate 'TS005'
      using message = 'Attempt event identity conflict.';
  end if;

  select event_input.event_id
  into v_conflicting_event_id
  from jsonb_to_recordset(p_events) as event_input (
    event_id uuid,
    payload_sha256 text
  )
  join public.attempt_events as stored_event
    on stored_event.event_id = event_input.event_id
  where stored_event.user_id <> p_user_id
    or stored_event.payload_sha256 <> event_input.payload_sha256
  order by event_input.event_id
  limit 1;

  if found then
    raise sqlstate 'TS005'
      using message = 'Attempt event identity conflict.';
  end if;

  begin
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
    )
    select distinct on (event_input.event_id)
      event_input.event_id,
      p_user_id,
      event_input.device_id,
      event_input.exercise_id,
      event_input.item_id,
      event_input.lesson_version_id,
      event_input.selected_option_id,
      event_input.dimension,
      event_input.rating,
      event_input.answered_at,
      event_input.duration_ms,
      event_input.algorithm_version,
      event_input.payload_sha256
    from jsonb_to_recordset(p_events) as event_input (
      event_id uuid,
      device_id uuid,
      exercise_id uuid,
      item_id uuid,
      lesson_version_id uuid,
      selected_option_id uuid,
      dimension text,
      rating smallint,
      answered_at timestamptz,
      duration_ms integer,
      algorithm_version text,
      payload_sha256 text
    )
    order by event_input.event_id
    on conflict (event_id) do nothing;
  exception
    when integrity_constraint_violation then
      raise sqlstate 'TS001'
        using message = 'Attempt sync event violates persistence constraints.';
  end;

  -- Recontrole apres l'INSERT ... ON CONFLICT afin de fermer la course rare ou
  -- un autre compte presenterait simultanement le meme event_id.
  select event_input.event_id
  into v_conflicting_event_id
  from jsonb_to_recordset(p_events) as event_input (
    event_id uuid,
    payload_sha256 text
  )
  join public.attempt_events as stored_event
    on stored_event.event_id = event_input.event_id
  where stored_event.user_id <> p_user_id
    or stored_event.payload_sha256 <> event_input.payload_sha256
  order by event_input.event_id
  limit 1;

  if found then
    raise sqlstate 'TS005'
      using message = 'Attempt event identity conflict.';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_projections) as projection_input (
      item_id uuid,
      lesson_version_id uuid,
      dimension text,
      mastery_permille integer,
      successful_attempts integer,
      consecutive_correct integer,
      attempt_count integer,
      last_event_id uuid,
      last_answered_at timestamptz,
      due_at timestamptz,
      algorithm_version text
    )
    where projection_input.item_id is null
      or projection_input.lesson_version_id is null
      or projection_input.dimension is null
      or projection_input.mastery_permille is null
      or projection_input.successful_attempts is null
      or projection_input.consecutive_correct is null
      or projection_input.attempt_count is null
      or projection_input.last_event_id is null
      or projection_input.last_answered_at is null
      or projection_input.due_at is null
      or projection_input.algorithm_version is null
  ) then
    raise sqlstate 'TS006'
      using message = 'Attempt sync projection is incomplete.';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_projections) as projection_input (
      item_id uuid,
      dimension text
    )
    group by projection_input.item_id, projection_input.dimension
    having count(*) > 1
  ) then
    raise sqlstate 'TS006'
      using message = 'Attempt sync projection identity is duplicated.';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_projections) as projection_input (
      item_id uuid,
      lesson_version_id uuid,
      dimension text,
      last_event_id uuid,
      algorithm_version text
    )
    left join public.attempt_events as last_event
      on last_event.event_id = projection_input.last_event_id
    where last_event.event_id is null
      or last_event.user_id <> p_user_id
      or last_event.item_id <> projection_input.item_id
      or last_event.lesson_version_id <> projection_input.lesson_version_id
      or last_event.dimension <> projection_input.dimension
      or last_event.algorithm_version <> projection_input.algorithm_version
  ) then
    raise sqlstate 'TS006'
      using message = 'Attempt sync projection does not match its last event.';
  end if;

  begin
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
    )
    select
      p_user_id,
      projection_input.item_id,
      projection_input.lesson_version_id,
      projection_input.dimension,
      projection_input.mastery_permille,
      projection_input.successful_attempts,
      projection_input.consecutive_correct,
      projection_input.attempt_count,
      projection_input.last_event_id,
      projection_input.last_answered_at,
      projection_input.due_at,
      projection_input.algorithm_version
    from jsonb_to_recordset(p_projections) as projection_input (
      item_id uuid,
      lesson_version_id uuid,
      dimension text,
      mastery_permille integer,
      successful_attempts integer,
      consecutive_correct integer,
      attempt_count integer,
      last_event_id uuid,
      last_answered_at timestamptz,
      due_at timestamptz,
      algorithm_version text
    )
    on conflict (user_id, item_id, dimension)
    do update set
      lesson_version_id = excluded.lesson_version_id,
      mastery_permille = excluded.mastery_permille,
      successful_attempts = excluded.successful_attempts,
      consecutive_correct = excluded.consecutive_correct,
      attempt_count = excluded.attempt_count,
      last_event_id = excluded.last_event_id,
      last_answered_at = excluded.last_answered_at,
      due_at = excluded.due_at,
      algorithm_version = excluded.algorithm_version,
      updated_at = now();
  exception
    when integrity_constraint_violation then
      raise sqlstate 'TS006'
        using message = 'Attempt sync projection violates persistence constraints.';
  end;

  update public.profiles as profile
  set sync_revision = profile.sync_revision + 1
  where profile.user_id = p_user_id
  returning profile.sync_revision into v_new_revision;

  -- Le curseur public est produit sous le même verrou que le commit. Toute
  -- valeur prédite par le serveur est remplacée par la révision autoritaire.
  v_committed_response := jsonb_set(
    p_response,
    '{syncRevision}',
    to_jsonb(v_new_revision),
    true
  );

  insert into private.attempt_sync_commits (
    user_id,
    idempotency_key,
    request_sha256,
    expected_revision,
    committed_revision,
    response_body
  ) values (
    p_user_id,
    p_idempotency_key,
    p_request_sha256,
    p_expected_revision,
    v_new_revision,
    v_committed_response
  );

  return jsonb_build_object(
    'kind', 'committed',
    'response', v_committed_response,
    'syncRevision', v_new_revision
  );
exception
  when data_exception then
    raise sqlstate 'TS001'
      using message = 'Invalid attempt sync payload.';
end;
$function$;

revoke execute on function public.commit_attempt_batch_v1(
  uuid, uuid, text, bigint, jsonb, jsonb, jsonb
) from public, anon, authenticated, service_role;

grant execute on function public.commit_attempt_batch_v1(
  uuid, uuid, text, bigint, jsonb, jsonb, jsonb
) to service_role;

comment on column public.profiles.sync_revision is
  'Revision monotone verrouillee par commit_attempt_batch_v1.';

comment on table private.attempt_sync_commits is
  'Registre immuable des reponses de synchronisation rejouables.';

comment on table public.lesson_versions is
  'Bundle editorial serveur. Ne pas exposer directement: contient les cles de correction.';

comment on function public.commit_attempt_batch_v1(
  uuid, uuid, text, bigint, jsonb, jsonb, jsonb
) is
  'RPC serveur atomique; tableaux events/projections 0..50. SQLSTATE: TS001 payload invalide; TS002 profil absent; TS003 cle idempotente reutilisee avec un autre hash; TS004 revision obsolete; TS005 collision event/hash; TS006 projection invalide.';
