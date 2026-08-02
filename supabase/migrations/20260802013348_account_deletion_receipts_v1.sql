-- Suppression de compte v1.
--
-- Le recu survit volontairement au hard delete Auth afin qu'un retry apres une
-- reponse reseau perdue puisse rejouer le meme identifiant et le meme instant.
-- Les UUID utilisateur et les secrets de continuation ne survivent jamais en
-- clair : le serveur fournit seulement des HMAC-SHA-256 hexadecimaux.

-- attempt_events depend a la fois de auth.users et de devices. La contrainte
-- RESTRICT historique rendait l'ordre des triggers de cascade significatif et
-- pouvait donc bloquer la suppression d'un appareil encore reference. Les
-- tentatives etant elles-memes des donnees du compte, cette relation cascade.
alter table public.attempt_events
  drop constraint attempt_events_user_id_device_id_fkey;

alter table public.attempt_events
  add constraint attempt_events_device_owner_fkey
  foreign key (user_id, device_id)
  references public.devices (user_id, id)
  on delete cascade;

create table private.account_deletion_receipts (
  receipt_id uuid primary key default gen_random_uuid(),
  subject_hmac_sha256 text not null,
  idempotency_hmac_sha256 text not null,
  request_hmac_sha256 text not null,
  continuation_hmac_sha256 text not null,
  target_user_id uuid
    constraint account_deletion_receipts_target_user_fkey
    references auth.users (id) on delete set null,
  status text not null default 'in_progress',
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  completed_at timestamptz,
  constraint account_deletion_receipts_subject_hmac_format
    check (subject_hmac_sha256 ~ '^[0-9a-f]{64}$'),
  constraint account_deletion_receipts_idempotency_hmac_format
    check (idempotency_hmac_sha256 ~ '^[0-9a-f]{64}$'),
  constraint account_deletion_receipts_request_hmac_format
    check (request_hmac_sha256 ~ '^[0-9a-f]{64}$'),
  constraint account_deletion_receipts_continuation_hmac_format
    check (continuation_hmac_sha256 ~ '^[0-9a-f]{64}$'),
  constraint account_deletion_receipts_status
    check (status in ('in_progress', 'completed')),
  constraint account_deletion_receipts_state
    check (
      (
        status = 'in_progress'
        and target_user_id is not null
        and completed_at is null
      )
      or (
        status = 'completed'
        and target_user_id is null
        and completed_at is not null
      )
    ),
  constraint account_deletion_receipts_timestamps
    check (
      updated_at >= created_at
      and (completed_at is null or completed_at = updated_at)
    ),
  constraint account_deletion_receipts_subject_idempotency_unique
    unique (subject_hmac_sha256, idempotency_hmac_sha256),
  constraint account_deletion_receipts_continuation_unique
    unique (continuation_hmac_sha256)
);

-- resume() est volontairement consultable avant Auth. Son test de collision
-- ne doit donc jamais degenerer en parcours complet du registre sous trafic
-- non authentifie.
create index account_deletion_receipts_idempotency_hmac_idx
on private.account_deletion_receipts (idempotency_hmac_sha256);

-- PostgreSQL n'indexe pas automatiquement le cote enfant d'une FK. Cet index
-- partiel borne la recherche des recus encore rattaches pendant ON DELETE.
create index account_deletion_receipts_active_target_idx
on private.account_deletion_receipts (target_user_id)
where target_user_id is not null;

-- Le hard delete Auth et la finalisation du recu appartiennent a la meme
-- transaction PostgreSQL. Si la reponse HTTP disparait juste apres deleteUser,
-- ON DELETE SET NULL declenche cette transition avant le commit Auth et aucun
-- UUID brut ne reste orphelin. La fonction ne fait qu'ajuster NEW et n'a besoin
-- d'aucun privilege eleve.
create function private.finalize_account_deletion_receipt_v1()
returns trigger
language plpgsql
volatile
security invoker
set search_path = ''
as $function$
declare
  v_completed_at timestamptz;
begin
  if old.target_user_id is not null and new.target_user_id is null then
    v_completed_at := clock_timestamp();
    new.status := 'completed';
    new.updated_at := v_completed_at;
    new.completed_at := v_completed_at;
  end if;

  return new;
end;
$function$;

create trigger finalize_account_deletion_receipt_on_auth_delete_v1
before update of target_user_id on private.account_deletion_receipts
for each row execute function private.finalize_account_deletion_receipt_v1();

revoke execute on function private.finalize_account_deletion_receipt_v1()
from public, anon, authenticated, service_role;

alter table private.account_deletion_receipts enable row level security;

-- Une opération aussi sensible doit refuser un JWT dont la session a déjà été
-- révoquée, même si son exp et son utilisateur Auth restent encore valides.
-- La documentation Supabase recommande de corréler le claim session_id avec
-- la clé primaire de auth.sessions. Le service ne reçoit que les deux colonnes
-- nécessaires et la table Auth n'est jamais exposée directement au client.
grant usage on schema auth to service_role;
grant select (id, user_id) on auth.sessions to service_role;

create function public.is_account_deletion_session_active_v1(
  p_user_id uuid,
  p_session_id uuid
)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $function$
  select
    p_user_id is not null
    and p_session_id is not null
    and exists (
      select 1
      from auth.sessions as session
      where session.id = p_session_id
        and session.user_id = p_user_id
    );
$function$;

create policy account_deletion_receipts_service_read
on private.account_deletion_receipts for select to service_role
using (true);

create policy account_deletion_receipts_service_insert
on private.account_deletion_receipts for insert to service_role
with check (
  status = 'in_progress'
  and target_user_id is not null
  and completed_at is null
);

revoke all on private.account_deletion_receipts
from public, anon, authenticated, service_role;

grant select on private.account_deletion_receipts to service_role;

grant insert (
  subject_hmac_sha256,
  idempotency_hmac_sha256,
  request_hmac_sha256,
  continuation_hmac_sha256,
  target_user_id
) on private.account_deletion_receipts to service_role;

create function public.begin_account_deletion_v1(
  p_subject_hmac_sha256 text,
  p_idempotency_hmac_sha256 text,
  p_request_hmac_sha256 text,
  p_continuation_hmac_sha256 text,
  p_target_user_id uuid
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $function$
declare
  v_receipt private.account_deletion_receipts%rowtype;
begin
  if p_subject_hmac_sha256 is null
    or p_subject_hmac_sha256 !~ '^[0-9a-f]{64}$'
    or p_idempotency_hmac_sha256 is null
    or p_idempotency_hmac_sha256 !~ '^[0-9a-f]{64}$'
    or p_request_hmac_sha256 is null
    or p_request_hmac_sha256 !~ '^[0-9a-f]{64}$'
    or p_continuation_hmac_sha256 is null
    or p_continuation_hmac_sha256 !~ '^[0-9a-f]{64}$'
    or p_target_user_id is null
  then
    raise sqlstate 'TA001'
      using message = 'Invalid account deletion receipt payload.';
  end if;

  insert into private.account_deletion_receipts (
    subject_hmac_sha256,
    idempotency_hmac_sha256,
    request_hmac_sha256,
    continuation_hmac_sha256,
    target_user_id
  ) values (
    p_subject_hmac_sha256,
    p_idempotency_hmac_sha256,
    p_request_hmac_sha256,
    p_continuation_hmac_sha256,
    p_target_user_id
  )
  on conflict do nothing
  returning * into v_receipt;

  if not found then
    select receipt.*
    into v_receipt
    from private.account_deletion_receipts as receipt
    where receipt.subject_hmac_sha256 = p_subject_hmac_sha256
      and receipt.idempotency_hmac_sha256 = p_idempotency_hmac_sha256;

    if not found then
      -- L'unique continuation a pu entrer en collision avec une autre ligne.
      -- Le message reste ferme et ne revele aucun identifiant de recu.
      raise sqlstate 'TA004'
        using message = 'Account deletion continuation mismatch.';
    end if;

    if v_receipt.request_hmac_sha256 <> p_request_hmac_sha256 then
      raise sqlstate 'TA003'
        using message = 'Account deletion idempotency conflict.';
    end if;

    if v_receipt.continuation_hmac_sha256
      <> p_continuation_hmac_sha256
    then
      raise sqlstate 'TA004'
        using message = 'Account deletion continuation mismatch.';
    end if;

    if v_receipt.status = 'in_progress'
      and v_receipt.target_user_id <> p_target_user_id
    then
      raise sqlstate 'TA005'
        using message = 'Account deletion target mismatch.';
    end if;
  end if;

  return jsonb_build_object(
    'status', v_receipt.status,
    'receiptId', v_receipt.receipt_id,
    'targetUserId', v_receipt.target_user_id,
    'completedAt', case
      when v_receipt.completed_at is null then null
      else to_char(
        v_receipt.completed_at at time zone 'UTC',
        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
      )
    end
  );
end;
$function$;

create function public.resume_account_deletion_v1(
  p_idempotency_hmac_sha256 text,
  p_continuation_hmac_sha256 text
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $function$
declare
  v_receipt private.account_deletion_receipts%rowtype;
begin
  if p_idempotency_hmac_sha256 is null
    or p_idempotency_hmac_sha256 !~ '^[0-9a-f]{64}$'
    or p_continuation_hmac_sha256 is null
    or p_continuation_hmac_sha256 !~ '^[0-9a-f]{64}$'
  then
    raise sqlstate 'TA001'
      using message = 'Invalid account deletion continuation payload.';
  end if;

  select receipt.*
  into v_receipt
  from private.account_deletion_receipts as receipt
  where receipt.idempotency_hmac_sha256 = p_idempotency_hmac_sha256
    and receipt.continuation_hmac_sha256 = p_continuation_hmac_sha256;

  if not found then
    if exists (
      select 1
      from private.account_deletion_receipts as receipt
      where receipt.idempotency_hmac_sha256 = p_idempotency_hmac_sha256
    ) then
      raise sqlstate 'TA004'
        using message = 'Account deletion continuation mismatch.';
    end if;

    raise sqlstate 'TA002'
      using message = 'Account deletion receipt not found.';
  end if;

  return jsonb_build_object(
    'status', v_receipt.status,
    'receiptId', v_receipt.receipt_id,
    'targetUserId', v_receipt.target_user_id,
    'completedAt', case
      when v_receipt.completed_at is null then null
      else to_char(
        v_receipt.completed_at at time zone 'UTC',
        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
      )
    end
  );
end;
$function$;

create function public.read_account_deletion_completion_v1(
  p_idempotency_hmac_sha256 text,
  p_continuation_hmac_sha256 text
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $function$
declare
  v_receipt private.account_deletion_receipts%rowtype;
begin
  if p_idempotency_hmac_sha256 is null
    or p_idempotency_hmac_sha256 !~ '^[0-9a-f]{64}$'
    or p_continuation_hmac_sha256 is null
    or p_continuation_hmac_sha256 !~ '^[0-9a-f]{64}$'
  then
    raise sqlstate 'TA001'
      using message = 'Invalid account deletion completion payload.';
  end if;

  select receipt.*
  into v_receipt
  from private.account_deletion_receipts as receipt
  where receipt.idempotency_hmac_sha256 = p_idempotency_hmac_sha256
    and receipt.continuation_hmac_sha256 = p_continuation_hmac_sha256;

  if not found then
    if exists (
      select 1
      from private.account_deletion_receipts as receipt
      where receipt.idempotency_hmac_sha256 = p_idempotency_hmac_sha256
    ) then
      raise sqlstate 'TA004'
        using message = 'Account deletion continuation mismatch.';
    end if;

    raise sqlstate 'TA002'
      using message = 'Account deletion receipt not found.';
  end if;

  if v_receipt.status <> 'completed' then
    raise sqlstate 'TA006'
      using message = 'Account deletion completion is not committed.';
  end if;

  return jsonb_build_object(
    'status', v_receipt.status,
    'receiptId', v_receipt.receipt_id,
    'targetUserId', v_receipt.target_user_id,
    'completedAt', to_char(
      v_receipt.completed_at at time zone 'UTC',
      'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
    )
  );
end;
$function$;

revoke execute on function public.begin_account_deletion_v1(
  text, text, text, text, uuid
) from public, anon, authenticated, service_role;

revoke execute on function public.is_account_deletion_session_active_v1(
  uuid, uuid
) from public, anon, authenticated, service_role;

revoke execute on function public.resume_account_deletion_v1(text, text)
from public, anon, authenticated, service_role;

revoke execute on function public.read_account_deletion_completion_v1(text, text)
from public, anon, authenticated, service_role;

grant execute on function public.begin_account_deletion_v1(
  text, text, text, text, uuid
) to service_role;

grant execute on function public.is_account_deletion_session_active_v1(
  uuid, uuid
) to service_role;

grant execute on function public.resume_account_deletion_v1(text, text)
to service_role;

grant execute on function public.read_account_deletion_completion_v1(text, text)
to service_role;

comment on table private.account_deletion_receipts is
  'Recu prive de suppression rejouable. target_user_id doit etre NULL a completion.';

comment on column private.account_deletion_receipts.subject_hmac_sha256 is
  'HMAC-SHA-256 contextuel du UUID Auth, calcule avec un secret serveur non stocke en base.';

comment on column private.account_deletion_receipts.continuation_hmac_sha256 is
  'HMAC-SHA-256 d un secret aleatoire de 32 octets, jamais persiste en clair.';

comment on function private.finalize_account_deletion_receipt_v1() is
  'Finalise transactionnellement tous les recus cibles par un hard delete Auth.';

comment on function public.begin_account_deletion_v1(
  text, text, text, text, uuid
) is
  'Initialise ou rejoue atomiquement une suppression; service_role uniquement.';

comment on function public.is_account_deletion_session_active_v1(uuid, uuid) is
  'Atteste la presence de la session Auth du sujet; service_role uniquement.';

comment on function public.resume_account_deletion_v1(text, text) is
  'Reprend une suppression par HMAC idempotence et continuation; service_role uniquement.';

comment on function public.read_account_deletion_completion_v1(text, text) is
  'Relit uniquement une completion deja commise par le hard delete Auth.';
