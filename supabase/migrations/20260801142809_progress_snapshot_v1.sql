-- Snapshot autoritaire complet pour hydrater un nouvel appareil. La ligne de
-- profil est verrouillée en partage afin qu'un commit de tentative ne puisse
-- pas intercaler sa révision et ses projections entre les lectures.

create function public.get_progress_snapshot_v1(p_user_id uuid)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $function$
declare
  v_sync_revision bigint;
  v_state_count integer;
  v_states jsonb;
  v_max_states constant integer := 10000;
begin
  if p_user_id is null then
    raise sqlstate 'TP001'
      using message = 'Invalid progress snapshot identity.';
  end if;

  select profile.sync_revision
  into v_sync_revision
  from public.profiles as profile
  where profile.user_id = p_user_id
  for share;

  if not found then
    raise sqlstate 'TP002'
      using message = 'Progress profile not found.';
  end if;

  select count(*)::integer
  into v_state_count
  from public.learner_item_state as state
  where state.user_id = p_user_id;

  if v_state_count > v_max_states then
    raise sqlstate 'TP003'
      using message = 'Progress snapshot capacity exceeded.';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'itemId', state.item_id,
        'skill', state.dimension,
        'masteryPermille', state.mastery_permille,
        'status', case
          when state.mastery_permille >= 750
            and state.successful_attempts >= 3
          then 'confirmed'
          else 'learning'
        end,
        'attemptCount', state.attempt_count,
        'successfulAttempts', state.successful_attempts,
        'consecutiveCorrect', state.consecutive_correct,
        'dueAt', to_char(
          state.due_at at time zone 'UTC',
          'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        ),
        'algorithmVersion', state.algorithm_version
      )
      order by state.item_id, state.dimension collate "C"
    ),
    '[]'::jsonb
  )
  into v_states
  from public.learner_item_state as state
  where state.user_id = p_user_id;

  return jsonb_build_object(
    'syncRevision', v_sync_revision,
    'states', v_states
  );
end;
$function$;

revoke execute on function public.get_progress_snapshot_v1(uuid)
from public, anon, authenticated, service_role;

grant execute on function public.get_progress_snapshot_v1(uuid)
to service_role;

comment on function public.get_progress_snapshot_v1(uuid) is
  'Snapshot serveur ordonné et borné sous verrou de profil. SQLSTATE: TP001 identité invalide; TP002 profil absent; TP003 capacité dépassée.';
