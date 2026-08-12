-- Garde minimale de suppression de compte : ne retourne aucun identifiant ni
-- statut de fournisseur, seulement l'existence d'une trace durable.
create function public.billing_has_history_v1(
  p_user_id uuid
)
returns boolean
language plpgsql
stable
security invoker
set search_path = ''
as $function$
begin
  if p_user_id is null then
    raise sqlstate 'BL001'
      using message = 'Billing user is required.';
  end if;

  return exists (
    select 1
    from private.billing_customers
    where user_id = p_user_id

    union all

    select 1
    from private.entitlements_cache
    where user_id = p_user_id

    union all

    select 1
    from private.billing_events
    where user_id = p_user_id
  );
end;
$function$;

revoke execute on function public.billing_has_history_v1(uuid)
from public, anon, authenticated, service_role;

grant execute on function public.billing_has_history_v1(uuid)
to service_role;

comment on function public.billing_has_history_v1(uuid) is
  'Indique seulement si un compte possède une trace durable de facturation ; service_role uniquement.';
