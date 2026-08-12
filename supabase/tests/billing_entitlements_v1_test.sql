begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(29);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'a@example.invalid', now(), now()),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'b@example.invalid', now(), now()),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'authenticated', 'authenticated', 'c@example.invalid', now(), now());

update auth.users
set is_anonymous = true
where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

select is(
  (
    select count(*)::integer
    from pg_class
    where oid in (
      'private.billing_plans'::regclass,
      'private.billing_customers'::regclass,
      'private.entitlements_cache'::regclass,
      'private.billing_events'::regclass
    )
    and relrowsecurity
  ),
  4,
  'les quatre tables de facturation ont RLS active'
);

select ok(
  not has_schema_privilege('anon', 'private', 'usage')
  and not has_schema_privilege('authenticated', 'private', 'usage'),
  'les roles client ne peuvent pas resoudre le schema prive'
);

select ok(
  to_regprocedure('public.billing_get_customer_v1(uuid)') is not null
  and to_regprocedure('public.billing_upsert_customer_v1(uuid,text,text)') is not null
  and to_regprocedure('public.billing_find_user_by_customer_v1(text,text)') is not null
  and to_regprocedure('public.billing_get_status_v1(uuid)') is not null
  and to_regprocedure('public.billing_apply_event_v1(text,text,text,timestamptz,text,uuid,text,text,text,text,timestamptz)') is not null,
  'les cinq RPC de facturation v1 existent avec leur signature'
);

select ok(
  has_function_privilege('service_role', 'public.billing_get_customer_v1(uuid)', 'execute')
  and has_function_privilege('service_role', 'public.billing_upsert_customer_v1(uuid,text,text)', 'execute')
  and has_function_privilege('service_role', 'public.billing_find_user_by_customer_v1(text,text)', 'execute')
  and has_function_privilege('service_role', 'public.billing_get_status_v1(uuid)', 'execute')
  and has_function_privilege('service_role', 'public.billing_apply_event_v1(text,text,text,timestamptz,text,uuid,text,text,text,text,timestamptz)', 'execute'),
  'service_role peut executer les RPC de facturation'
);

select ok(
  not has_function_privilege('anon', 'public.billing_get_status_v1(uuid)', 'execute')
  and not has_function_privilege('authenticated', 'public.billing_get_status_v1(uuid)', 'execute')
  and not has_function_privilege('anon', 'public.billing_apply_event_v1(text,text,text,timestamptz,text,uuid,text,text,text,text,timestamptz)', 'execute')
  and not has_function_privilege('authenticated', 'public.billing_apply_event_v1(text,text,text,timestamptz,text,uuid,text,text,text,text,timestamptz)', 'execute'),
  'les roles client ne peuvent pas invoquer les RPC de facturation'
);

select ok(
  not has_table_privilege('anon', 'private.billing_customers', 'select')
  and not has_table_privilege('authenticated', 'private.billing_customers', 'select')
  and not has_table_privilege('anon', 'private.entitlements_cache', 'select')
  and not has_table_privilege('authenticated', 'private.entitlements_cache', 'select')
  and not has_table_privilege('anon', 'private.billing_events', 'select')
  and not has_table_privilege('authenticated', 'private.billing_events', 'select'),
  'les identites et evenements de paiement ne sont pas exposes aux clients'
);

select ok(
  has_table_privilege('service_role', 'private.billing_customers', 'select')
  and has_table_privilege('service_role', 'private.billing_customers', 'insert')
  and has_table_privilege('service_role', 'private.billing_customers', 'update')
  and has_table_privilege('service_role', 'private.entitlements_cache', 'update')
  and has_table_privilege('service_role', 'private.billing_events', 'insert'),
  'service_role possede les ecritures serveur necessaires'
);

set local role service_role;

select is(
  public.billing_upsert_customer_v1(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'cus_A', null
  )->>'stripeCustomerId',
  'cus_A',
  'un compte permanent peut lier son client Stripe'
);

select is(
  public.billing_get_customer_v1(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  )->>'stripeCustomerId',
  'cus_A',
  'la liaison Stripe est relisible côté serveur'
);

select is(
  public.billing_find_user_by_customer_v1('stripe', 'cus_A')->>'userId',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'un client Stripe est resolu vers le bon compte'
);

select is(
  public.billing_get_status_v1('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')->>'status',
  'none',
  'un compte sans entitlement reste inactif'
);

select is(
  public.billing_apply_event_v1(
    'stripe',
    'evt_billing_a_001',
    'customer.subscription.created',
    '2026-08-01T10:00:00Z'::timestamptz,
    repeat('a', 64),
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'premium',
    'cus_A',
    'sub_A',
    'active',
    '2026-09-01T10:00:00Z'::timestamptz
  )->>'status',
  'applied',
  'un evenement Stripe signe active lentitlement'
);

select is(
  public.billing_get_status_v1('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')->>'status',
  'active',
  'le statut actif est servi depuis le miroir serveur'
);

select is(
  public.billing_apply_event_v1(
    'stripe', 'evt_billing_b_noend', 'customer.subscription.created',
    '2026-08-01T10:01:00Z'::timestamptz, repeat('9', 64),
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'premium', 'cus_B', 'sub_B',
    'active', null
  )->>'status',
  'applied',
  'un entitlement sans date de fin est conserve pour audit'
);

select is(
  public.billing_get_status_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')->>'active',
  'false',
  'un entitlement sans date de fin ne devient pas actif par defaut'
);

select is(
  public.billing_apply_event_v1(
    'stripe',
    'evt_billing_a_001',
    'customer.subscription.created',
    '2026-08-01T10:00:00Z'::timestamptz,
    repeat('a', 64),
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'premium',
    'cus_A',
    'sub_A',
    'active',
    null
  )->>'status',
  'duplicate',
  'un webhook Stripe rejoue est idempotent'
);

select throws_ok(
  $sql$
    select public.billing_apply_event_v1(
      'stripe', 'evt_billing_a_001', 'customer.subscription.created',
      '2026-08-01T10:00:00Z'::timestamptz, repeat('b', 64),
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'premium', 'cus_A', 'sub_A',
      'revoked', null
    )
  $sql$,
  'BL003',
  'Billing event identity conflict.',
  'un même evenement avec un hash different est refuse'
);

select is(
  public.billing_apply_event_v1(
    'stripe', 'evt_billing_a_old', 'customer.subscription.updated',
    '2026-07-01T10:00:00Z'::timestamptz, repeat('c', 64),
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'premium', 'cus_A', 'sub_A',
    'revoked', null
  )->>'status',
  'ignored',
  'un evenement plus ancien ne retrograde pas lentitlement'
);

select is(
  public.billing_get_status_v1('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')->>'status',
  'active',
  'le statut reste actif après un evenement ancien'
);

select is(
  public.billing_apply_event_v1(
    'revenuecat', 'evt_billing_rc_old', 'INITIAL_PURCHASE',
    '2026-06-01T10:00:00Z'::timestamptz, repeat('d', 64),
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'premium', 'rc_A', null,
    'revoked', null
  )->>'status',
  'ignored',
  'un evenement RevenueCat plus ancien ne remplace pas Stripe'
);

select is(
  public.billing_apply_event_v1(
    'revenuecat', 'evt_billing_rc_new', 'RENEWAL',
    '2026-08-02T10:00:00Z'::timestamptz, repeat('e', 64),
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'premium', 'rc_A', null,
    'active', '2026-09-02T10:00:00Z'::timestamptz
  )->>'status',
  'applied',
  'un evenement RevenueCat plus recent peut actualiser lentitlement partage'
);

select is(
  public.billing_get_status_v1('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')->>'provider',
  'revenuecat',
  'le fournisseur le plus recent est conserve'
);

select is(
  public.billing_find_user_by_customer_v1('revenuecat', 'rc_A')->>'userId',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'une identite RevenueCat est liee au meme compte'
);

select is(
  public.billing_apply_event_v1(
    'stripe', 'evt_billing_unknown', 'customer.subscription.created',
    '2026-08-03T10:00:00Z'::timestamptz, repeat('f', 64),
    null, 'premium', 'cus_unknown', 'sub_unknown', 'active', null
  )->>'status',
  'ignored',
  'un webhook sans compte resolu est ignore'
);

select is(
  public.billing_apply_event_v1(
    'stripe', 'evt_billing_anon', 'customer.subscription.created',
    '2026-08-04T10:00:00Z'::timestamptz, repeat('1', 64),
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'premium', 'cus_anon', 'sub_anon',
    'active', null
  )->>'status',
  'ignored',
  'un compte anonyme ne recoit pas dentitlement'
);

select throws_ok(
  $sql$
    select public.billing_apply_event_v1(
      'stripe', 'evt_billing_collision', 'customer.subscription.created',
      '2026-08-05T10:00:00Z'::timestamptz, repeat('2', 64),
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'premium', 'cus_A', 'sub_B',
      'active', null
    )
  $sql$,
  'BL003',
  'Billing provider identity is already linked.',
  'une identite Stripe ne peut appartenir a deux comptes'
);

select is(
  (
    select count(*)::integer
    from private.entitlements_cache
    where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
      and provider_customer_id = 'cus_A'
  ),
  0,
  'le compte B ne recoit aucune donnee du compte A'
);

select is(
  (
    select count(*)::integer
    from private.billing_events
    where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      and processing_status = 'applied'
  ),
  2,
  'seuls les deux evenements les plus recents ont ete appliques'
);

reset role;

select ok(
  not (
    select prosecdef
    from pg_proc
    where oid = 'public.billing_apply_event_v1(text,text,text,timestamptz,text,uuid,text,text,text,text,timestamptz)'::regprocedure
  ),
  'la RPC d application reste SECURITY INVOKER'
);

select * from finish();
rollback;
