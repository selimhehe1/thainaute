begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(14);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('a9000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'history-a@example.invalid', now(), now()),
  ('b9000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'history-b@example.invalid', now(), now()),
  ('c9000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'history-c@example.invalid', now(), now()),
  ('d9000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'history-d@example.invalid', now(), now());

select has_function(
  'public', 'billing_has_history_v1', array['uuid'],
  'la RPC de preuve d historique billing existe'
);

select function_returns(
  'public', 'billing_has_history_v1', array['uuid'], 'boolean',
  'la RPC retourne seulement un booleen'
);

select volatility_is(
  'public', 'billing_has_history_v1', array['uuid'], 'stable',
  'la lecture d historique est stable'
);

select ok(
  not (
    select prosecdef
    from pg_proc
    where oid = 'public.billing_has_history_v1(uuid)'::regprocedure
  ),
  'la RPC reste SECURITY INVOKER'
);

select ok(
  has_function_privilege(
    'service_role', 'public.billing_has_history_v1(uuid)', 'execute'
  ),
  'service_role peut verifier l historique billing'
);

select ok(
  not has_function_privilege(
    'anon', 'public.billing_has_history_v1(uuid)', 'execute'
  )
  and not has_function_privilege(
    'authenticated', 'public.billing_has_history_v1(uuid)', 'execute'
  ),
  'les roles client ne peuvent pas appeler la preuve d historique'
);

set local role anon;
select throws_ok(
  $$select public.billing_has_history_v1('a9000000-0000-4000-8000-000000000001')$$,
  '42501',
  null,
  'un appel anonyme est refuse'
);
reset role;

select set_config(
  'request.jwt.claim.sub',
  'a9000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;
select throws_ok(
  $$select public.billing_has_history_v1('a9000000-0000-4000-8000-000000000001')$$,
  '42501',
  null,
  'l utilisateur A ne peut pas appeler la preuve sur A'
);
reset role;

select set_config(
  'request.jwt.claim.sub',
  'b9000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;
select throws_ok(
  $$select public.billing_has_history_v1('a9000000-0000-4000-8000-000000000001')$$,
  '42501',
  null,
  'l utilisateur B ne peut pas appeler la preuve sur A'
);
reset role;

set local role service_role;

select throws_ok(
  $$select public.billing_has_history_v1(null)$$,
  'BL001',
  'Billing user is required.',
  'un UUID billing est obligatoire'
);

insert into private.billing_customers (user_id, stripe_customer_id)
values ('a9000000-0000-4000-8000-000000000001', 'cus_HistoryA');

insert into private.entitlements_cache (
  user_id,
  entitlement,
  provider,
  status,
  last_event_provider,
  last_event_created_at,
  last_event_id
)
values (
  'c9000000-0000-4000-8000-000000000001',
  'premium',
  'manual',
  'expired',
  'manual',
  '2026-08-08T10:00:00Z'::timestamptz,
  'manual_history_c'
);

insert into private.billing_events (
  provider,
  event_id,
  event_type,
  event_created_at,
  payload_sha256,
  user_id,
  processing_status
)
values (
  'manual',
  'manual_history_d',
  'account.history',
  '2026-08-08T10:00:00Z'::timestamptz,
  repeat('d', 64),
  'd9000000-0000-4000-8000-000000000001',
  'ignored'
);

select is(
  public.billing_has_history_v1('a9000000-0000-4000-8000-000000000001'),
  true,
  'une identite billing historique ferme A'
);

select is(
  public.billing_has_history_v1('b9000000-0000-4000-8000-000000000001'),
  false,
  'seul B sans aucune trace obtient la preuve negative'
);

select is(
  public.billing_has_history_v1('c9000000-0000-4000-8000-000000000001'),
  true,
  'un entitlement expire reste un historique'
);

select is(
  public.billing_has_history_v1('d9000000-0000-4000-8000-000000000001'),
  true,
  'un evenement ignore et isole reste un historique'
);

reset role;
select * from finish();
rollback;
