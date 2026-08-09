-- La reponse composee est persistante et exclusivement controlee par le
-- serveur. Les anciennes tentatives gardent leur selected_option_id.

alter table public.attempt_events
  alter column selected_option_id drop not null,
  add column answer jsonb,
  add constraint attempt_events_answer_shape
    check (answer is null or jsonb_typeof(answer) = 'object'),
  add constraint attempt_events_answer_exclusive
    check ((selected_option_id is null) <> (answer is null));

comment on column public.attempt_events.answer is
  'Reponse typee normalisee et notee par le serveur; exclusive de selected_option_id.';

create index attempt_events_typed_answer_idx
  on public.attempt_events using gin (answer)
  where answer is not null;

-- La facade SECURITY INVOKER remplace le jeton technique insere par la RPC
-- historique par la reponse composee. Le serveur ne peut modifier que ces deux
-- colonnes; les clients gardent leurs privileges de lecture uniquement.
grant update (selected_option_id, answer)
  on public.attempt_events to service_role;

-- La migration historique expose encore le RPC v1 qui ne connaissait que
-- selected_option_id. On le conserve comme moteur atomique interne et on
-- ajoute une façade compatible avec les réponses composées. Le jeton
-- temporaire n'est jamais laissé en base : l'UPDATE atomique le remplace par
-- answer avant le retour de la transaction.
alter function public.commit_attempt_batch_v1(
  uuid, uuid, text, bigint, jsonb, jsonb, jsonb
) rename to commit_attempt_batch_v1_legacy;

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
  v_response jsonb;
  v_legacy_events jsonb;
begin
  if p_events is null or jsonb_typeof(p_events) <> 'array' then
    raise sqlstate 'TS001'
      using message = 'Invalid attempt sync payload.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_events) as source(event_input)
    where event_input -> 'selected_option_id' <> 'null'::jsonb
      and event_input -> 'answer' <> 'null'::jsonb
  ) then
    raise sqlstate 'TS001'
      using message = 'Attempt answer fields are mutually exclusive.';
  end if;

  v_legacy_events := coalesce(
    (
      select jsonb_agg(
        case
          when event_input -> 'answer' is not null
            and event_input -> 'answer' <> 'null'::jsonb
          then jsonb_set(
            event_input,
            '{selected_option_id}',
            to_jsonb('00000000-0000-0000-0000-000000000000'::text),
            true
          )
          else event_input
        end
        order by event_order
      )
      from jsonb_array_elements(p_events) with ordinality as source(
        event_input,
        event_order
      )
    ),
    '[]'::jsonb
  );

  v_response := public.commit_attempt_batch_v1_legacy(
    p_user_id,
    p_idempotency_key,
    p_request_sha256,
    p_expected_revision,
    v_legacy_events,
    p_projections,
    p_response
  );

  update public.attempt_events as stored_event
  set selected_option_id = null,
      answer = event_input -> 'answer'
  from jsonb_array_elements(p_events) as source(event_input)
  where stored_event.event_id = (event_input ->> 'event_id')::uuid
    and stored_event.user_id = p_user_id
    and event_input -> 'answer' is not null
    and event_input -> 'answer' <> 'null'::jsonb;

  return v_response;
exception
  when data_exception then
    raise sqlstate 'TS001'
      using message = 'Invalid attempt sync payload.';
end;
$function$;

revoke execute on function public.commit_attempt_batch_v1_legacy(
  uuid, uuid, text, bigint, jsonb, jsonb, jsonb
) from public, anon, authenticated, service_role;

grant execute on function public.commit_attempt_batch_v1_legacy(
  uuid, uuid, text, bigint, jsonb, jsonb, jsonb
) to service_role;

revoke execute on function public.commit_attempt_batch_v1(
  uuid, uuid, text, bigint, jsonb, jsonb, jsonb
) from public, anon, authenticated, service_role;

grant execute on function public.commit_attempt_batch_v1(
  uuid, uuid, text, bigint, jsonb, jsonb, jsonb
) to service_role;

comment on function public.commit_attempt_batch_v1(
  uuid, uuid, text, bigint, jsonb, jsonb, jsonb
) is
  'RPC serveur atomique; accepte selected_option_id ou answer compose, jamais les deux.';
