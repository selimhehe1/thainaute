-- Entitlements partagés v1.
-- Les tables restent dans le schéma privé : aucun client ne lit directement
-- les identifiants Stripe/RevenueCat ni l'historique des webhooks. Les routes
-- serveur appellent uniquement les RPC SECURITY INVOKER accordées à
-- service_role.

create schema if not exists private;

create table private.billing_plans (
  code text primary key
    check (code ~ '^[a-z][a-z0-9_]{0,63}$'),
  entitlement text not null
    check (entitlement = 'premium'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table private.billing_customers (
  user_id uuid primary key
    references auth.users (id) on delete cascade,
  stripe_customer_id text unique
    check (stripe_customer_id is null or stripe_customer_id ~ '^cus_[A-Za-z0-9]+$'),
  revenuecat_app_user_id text unique
    check (
      revenuecat_app_user_id is null
      or length(revenuecat_app_user_id) between 1 and 128
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.entitlements_cache (
  user_id uuid not null
    references auth.users (id) on delete cascade,
  entitlement text not null
    check (entitlement = 'premium'),
  provider text not null
    check (provider in ('stripe', 'revenuecat', 'manual')),
  provider_customer_id text,
  provider_subscription_id text,
  status text not null
    check (status in ('active', 'trialing', 'grace', 'expired', 'revoked')),
  current_period_end timestamptz,
  last_event_provider text not null
    check (last_event_provider in ('stripe', 'revenuecat', 'manual')),
  last_event_created_at timestamptz not null,
  last_event_id text not null
    check (length(last_event_id) between 1 and 255),
  updated_at timestamptz not null default now(),
  primary key (user_id, entitlement)
);

create table private.billing_events (
  provider text not null
    check (provider in ('stripe', 'revenuecat', 'manual')),
  event_id text not null
    check (length(event_id) between 1 and 255),
  event_type text not null
    check (length(event_type) between 1 and 160),
  event_created_at timestamptz not null,
  payload_sha256 text not null
    check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  user_id uuid references auth.users (id) on delete set null,
  processing_status text not null
    check (processing_status in ('applied', 'ignored')),
  received_at timestamptz not null default now(),
  processed_at timestamptz not null default now(),
  primary key (provider, event_id)
);

create index billing_events_user_received_idx
  on private.billing_events (user_id, received_at desc)
  where user_id is not null;

alter table private.billing_plans enable row level security;
alter table private.billing_customers enable row level security;
alter table private.entitlements_cache enable row level security;
alter table private.billing_events enable row level security;

revoke all on schema private from public, anon, authenticated, service_role;
grant usage on schema private to service_role;

revoke all on
  private.billing_plans,
  private.billing_customers,
  private.entitlements_cache,
  private.billing_events
from public, anon, authenticated, service_role;

grant select on private.billing_plans to service_role;
grant select, insert, update on private.billing_customers to service_role;
grant select, insert, update on private.entitlements_cache to service_role;
grant select, insert, update on private.billing_events to service_role;

create policy billing_plans_service_read
on private.billing_plans for select to service_role
using (true);

create policy billing_customers_service_all
on private.billing_customers for all to service_role
using (true)
with check (true);

create policy entitlements_cache_service_all
on private.entitlements_cache for all to service_role
using (true)
with check (true);

create policy billing_events_service_all
on private.billing_events for all to service_role
using (true)
with check (true);

insert into private.billing_plans (code, entitlement)
values ('premium', 'premium')
on conflict (code) do update
set entitlement = excluded.entitlement,
    active = true;

create function public.billing_get_customer_v1(
  p_user_id uuid
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $function$
declare
  v_customer private.billing_customers;
begin
  if p_user_id is null then
    raise sqlstate 'BL001'
      using message = 'Billing user is required.';
  end if;

  select customer.*
  into v_customer
  from private.billing_customers as customer
  where customer.user_id = p_user_id;

  if not found then
    return jsonb_build_object(
      'stripeCustomerId', null,
      'revenuecatAppUserId', null
    );
  end if;

  return jsonb_build_object(
    'stripeCustomerId', v_customer.stripe_customer_id,
    'revenuecatAppUserId', v_customer.revenuecat_app_user_id
  );
end;
$function$;

create function public.billing_upsert_customer_v1(
  p_user_id uuid,
  p_stripe_customer_id text,
  p_revenuecat_app_user_id text
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $function$
declare
  v_customer private.billing_customers;
  v_is_anonymous boolean;
begin
  if p_user_id is null then
    raise sqlstate 'BL001'
      using message = 'Billing user is required.';
  end if;

  if p_stripe_customer_id is null
    and p_revenuecat_app_user_id is null
  then
    raise sqlstate 'BL001'
      using message = 'At least one billing provider identity is required.';
  end if;

  if p_stripe_customer_id is not null
    and p_stripe_customer_id !~ '^cus_[A-Za-z0-9]+$'
  then
    raise sqlstate 'BL001'
      using message = 'Invalid Stripe customer identity.';
  end if;

  if p_revenuecat_app_user_id is not null
    and length(p_revenuecat_app_user_id) not between 1 and 128
  then
    raise sqlstate 'BL001'
      using message = 'Invalid RevenueCat app user identity.';
  end if;

  select account.is_anonymous
  into v_is_anonymous
  from auth.users as account
  where account.id = p_user_id;

  if not found or coalesce(v_is_anonymous, false) then
    raise sqlstate 'BL002'
      using message = 'Permanent billing account not found.';
  end if;

  if p_stripe_customer_id is not null and exists (
    select 1
    from private.billing_customers as existing
    where existing.stripe_customer_id = p_stripe_customer_id
      and existing.user_id <> p_user_id
  ) then
    raise sqlstate 'BL003'
      using message = 'Stripe customer belongs to another account.';
  end if;

  if p_revenuecat_app_user_id is not null and exists (
    select 1
    from private.billing_customers as existing
    where existing.revenuecat_app_user_id = p_revenuecat_app_user_id
      and existing.user_id <> p_user_id
  ) then
    raise sqlstate 'BL003'
      using message = 'RevenueCat app user belongs to another account.';
  end if;

  insert into private.billing_customers (
    user_id,
    stripe_customer_id,
    revenuecat_app_user_id
  ) values (
    p_user_id,
    p_stripe_customer_id,
    p_revenuecat_app_user_id
  )
  on conflict (user_id) do update set
    stripe_customer_id = coalesce(
      excluded.stripe_customer_id,
      private.billing_customers.stripe_customer_id
    ),
    revenuecat_app_user_id = coalesce(
      excluded.revenuecat_app_user_id,
      private.billing_customers.revenuecat_app_user_id
    ),
    updated_at = now()
  returning * into v_customer;

  return jsonb_build_object(
    'stripeCustomerId', v_customer.stripe_customer_id,
    'revenuecatAppUserId', v_customer.revenuecat_app_user_id
  );
end;
$function$;

create function public.billing_find_user_by_customer_v1(
  p_provider text,
  p_provider_customer_id text
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $function$
declare
  v_user_id uuid;
begin
  if p_provider not in ('stripe', 'revenuecat')
    or p_provider_customer_id is null
    or length(p_provider_customer_id) not between 1 and 255
  then
    raise sqlstate 'BL001'
      using message = 'Invalid billing provider identity.';
  end if;

  if p_provider = 'stripe' then
    select customer.user_id
    into v_user_id
    from private.billing_customers as customer
    where customer.stripe_customer_id = p_provider_customer_id;
  else
    select customer.user_id
    into v_user_id
    from private.billing_customers as customer
    where customer.revenuecat_app_user_id = p_provider_customer_id;
  end if;

  return jsonb_build_object('userId', v_user_id);
end;
$function$;

create function public.billing_get_status_v1(
  p_user_id uuid
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $function$
declare
  v_entitlement private.entitlements_cache;
  v_effective_status text;
  v_is_active boolean;
begin
  if p_user_id is null then
    raise sqlstate 'BL001'
      using message = 'Billing user is required.';
  end if;

  select entitlement.*
  into v_entitlement
  from private.entitlements_cache as entitlement
  where entitlement.user_id = p_user_id
    and entitlement.entitlement = 'premium';

  if not found then
    return jsonb_build_object(
      'entitlement', 'premium',
      'status', 'none',
      'active', false,
      'provider', null,
      'currentPeriodEnd', null
    );
  end if;

  v_is_active := v_entitlement.status in ('active', 'trialing', 'grace')
    and v_entitlement.current_period_end is not null
    and v_entitlement.current_period_end > now();
  v_effective_status := case
    when v_is_active then v_entitlement.status
    when v_entitlement.status in ('active', 'trialing', 'grace') then 'expired'
    else v_entitlement.status
  end;

  return jsonb_build_object(
    'entitlement', v_entitlement.entitlement,
    'status', v_effective_status,
    'active', v_is_active,
    'provider', v_entitlement.provider,
    'currentPeriodEnd', v_entitlement.current_period_end
  );
end;
$function$;

create function public.billing_apply_event_v1(
  p_provider text,
  p_event_id text,
  p_event_type text,
  p_event_created_at timestamptz,
  p_payload_sha256 text,
  p_user_id uuid,
  p_entitlement text,
  p_provider_customer_id text,
  p_provider_subscription_id text,
  p_status text,
  p_current_period_end timestamptz
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $function$
declare
  v_event private.billing_events;
  v_entitlement private.entitlements_cache;
  v_resolved_user_id uuid := p_user_id;
  v_is_anonymous boolean;
  v_inserted integer;
  v_has_entitlement boolean;
begin
  if p_provider not in ('stripe', 'revenuecat', 'manual')
    or p_event_id is null
    or length(p_event_id) not between 1 and 255
    or p_event_type is null
    or length(p_event_type) not between 1 and 160
    or p_event_created_at is null
    or p_payload_sha256 is null
    or p_payload_sha256 !~ '^[0-9a-f]{64}$'
  then
    raise sqlstate 'BL001'
      using message = 'Invalid billing event.';
  end if;

  if p_entitlement is not null and p_entitlement <> 'premium' then
    raise sqlstate 'BL001'
      using message = 'Invalid billing entitlement.';
  end if;

  if p_status is not null
    and p_status not in ('active', 'trialing', 'grace', 'expired', 'revoked')
  then
    raise sqlstate 'BL001'
      using message = 'Invalid billing status.';
  end if;

  if p_provider_customer_id is not null
    and length(p_provider_customer_id) not between 1 and 255
  then
    raise sqlstate 'BL001'
      using message = 'Invalid provider customer identity.';
  end if;

  insert into private.billing_events (
    provider,
    event_id,
    event_type,
    event_created_at,
    payload_sha256,
    user_id,
    processing_status
  ) values (
    p_provider,
    p_event_id,
    p_event_type,
    p_event_created_at,
    p_payload_sha256,
    p_user_id,
    'ignored'
  )
  on conflict (provider, event_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    select event.*
    into v_event
    from private.billing_events as event
    where event.provider = p_provider
      and event.event_id = p_event_id;
    if v_event.payload_sha256 <> p_payload_sha256 then
      raise sqlstate 'BL003'
        using message = 'Billing event identity conflict.';
    end if;
    return jsonb_build_object('status', 'duplicate');
  end if;

  if v_resolved_user_id is null and p_provider_customer_id is not null then
    if p_provider = 'stripe' then
      select customer.user_id
      into v_resolved_user_id
      from private.billing_customers as customer
      where customer.stripe_customer_id = p_provider_customer_id;
    elsif p_provider = 'revenuecat' then
      select customer.user_id
      into v_resolved_user_id
      from private.billing_customers as customer
      where customer.revenuecat_app_user_id = p_provider_customer_id;
    end if;
  end if;

  if v_resolved_user_id is null or p_entitlement is null or p_status is null then
    update private.billing_events
    set processing_status = 'ignored',
        processed_at = now()
    where provider = p_provider
      and event_id = p_event_id;
    return jsonb_build_object('status', 'ignored');
  end if;

  select account.is_anonymous
  into v_is_anonymous
  from auth.users as account
  where account.id = v_resolved_user_id;
  if not found or coalesce(v_is_anonymous, false) then
    update private.billing_events
    set processing_status = 'ignored',
        processed_at = now()
    where provider = p_provider
      and event_id = p_event_id;
    return jsonb_build_object('status', 'ignored');
  end if;

  select entitlement.*
  into v_entitlement
  from private.entitlements_cache as entitlement
  where entitlement.user_id = v_resolved_user_id
    and entitlement.entitlement = p_entitlement
  for update;

  v_has_entitlement := found;

  if v_has_entitlement
    and (
      p_event_created_at < v_entitlement.last_event_created_at
      or (
        p_event_created_at = v_entitlement.last_event_created_at
        and (
          p_provider < v_entitlement.last_event_provider
          or (
            p_provider = v_entitlement.last_event_provider
            and p_event_id <= v_entitlement.last_event_id
          )
        )
      )
    )
  then
    update private.billing_events
    set user_id = v_resolved_user_id,
        processing_status = 'ignored',
        processed_at = now()
    where provider = p_provider
      and event_id = p_event_id;
    return jsonb_build_object('status', 'ignored');
  end if;

  if p_provider_customer_id is not null then
    if p_provider = 'stripe' then
      insert into private.billing_customers (
        user_id,
        stripe_customer_id
      ) values (
        v_resolved_user_id,
        p_provider_customer_id
      )
      on conflict (user_id) do update set
        stripe_customer_id = excluded.stripe_customer_id,
        updated_at = now();
    elsif p_provider = 'revenuecat' then
      insert into private.billing_customers (
        user_id,
        revenuecat_app_user_id
      ) values (
        v_resolved_user_id,
        p_provider_customer_id
      )
      on conflict (user_id) do update set
        revenuecat_app_user_id = excluded.revenuecat_app_user_id,
        updated_at = now();
    end if;
  end if;

  if not v_has_entitlement then
    insert into private.entitlements_cache (
      user_id,
      entitlement,
      provider,
      provider_customer_id,
      provider_subscription_id,
      status,
      current_period_end,
      last_event_provider,
      last_event_created_at,
      last_event_id
    ) values (
      v_resolved_user_id,
      p_entitlement,
      p_provider,
      p_provider_customer_id,
      p_provider_subscription_id,
      p_status,
      p_current_period_end,
      p_provider,
      p_event_created_at,
      p_event_id
    );
  else
    update private.entitlements_cache
    set provider = p_provider,
        provider_customer_id = coalesce(
          p_provider_customer_id,
          v_entitlement.provider_customer_id
        ),
        provider_subscription_id = coalesce(
          p_provider_subscription_id,
          v_entitlement.provider_subscription_id
        ),
        status = p_status,
        current_period_end = case
          when p_current_period_end is null
            and p_status in ('active', 'trialing', 'grace')
            then v_entitlement.current_period_end
          else p_current_period_end
        end,
        last_event_provider = p_provider,
        last_event_created_at = p_event_created_at,
        last_event_id = p_event_id,
        updated_at = now()
    where user_id = v_resolved_user_id
      and entitlement = p_entitlement;
  end if;

  update private.billing_events
  set user_id = v_resolved_user_id,
      processing_status = 'applied',
      processed_at = now()
  where provider = p_provider
    and event_id = p_event_id;

  return jsonb_build_object(
    'status', 'applied',
    'userId', v_resolved_user_id,
    'entitlement', p_entitlement,
    'active', p_status in ('active', 'trialing', 'grace')
      and p_current_period_end is not null
      and p_current_period_end > now()
  );
exception
  when unique_violation then
    raise sqlstate 'BL003'
      using message = 'Billing provider identity is already linked.';
end;
$function$;

revoke execute on function public.billing_get_customer_v1(uuid)
from public, anon, authenticated, service_role;
grant execute on function public.billing_get_customer_v1(uuid)
to service_role;

revoke execute on function public.billing_upsert_customer_v1(uuid, text, text)
from public, anon, authenticated, service_role;
grant execute on function public.billing_upsert_customer_v1(uuid, text, text)
to service_role;

revoke execute on function public.billing_find_user_by_customer_v1(text, text)
from public, anon, authenticated, service_role;
grant execute on function public.billing_find_user_by_customer_v1(text, text)
to service_role;

revoke execute on function public.billing_get_status_v1(uuid)
from public, anon, authenticated, service_role;
grant execute on function public.billing_get_status_v1(uuid)
to service_role;

revoke execute on function public.billing_apply_event_v1(
  text, text, text, timestamptz, text, uuid, text, text, text, text, timestamptz
)
from public, anon, authenticated, service_role;
grant execute on function public.billing_apply_event_v1(
  text, text, text, timestamptz, text, uuid, text, text, text, text, timestamptz
)
to service_role;

comment on schema private is
  'Données serveur non exposées à la Data API : entitlements et intégrations de paiement.';

comment on table private.entitlements_cache is
  'Miroir serveur de l entitlement premium, mis à jour uniquement par événements signés et idempotents.';

comment on table private.billing_events is
  'Registre des événements Stripe/RevenueCat pour rejouer sans double effet et ignorer les événements obsolètes.';
