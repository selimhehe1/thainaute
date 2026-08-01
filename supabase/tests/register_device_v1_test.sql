begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(28);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'a@example.invalid', now(), now()),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'b@example.invalid', now(), now());

select ok(
  to_regprocedure('public.register_device_v1(uuid,uuid,text,text)') is not null,
  'la RPC d enregistrement v1 existe avec une signature non ambigue'
);
select ok(
  not (
    select prosecdef
    from pg_proc
    where oid = 'public.register_device_v1(uuid,uuid,text,text)'::regprocedure
  ),
  'la RPC est SECURITY INVOKER'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.register_device_v1(uuid,uuid,text,text)',
    'execute'
  ),
  'service_role peut executer la RPC'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.register_device_v1(uuid,uuid,text,text)',
    'execute'
  ),
  'authenticated ne peut pas executer la RPC'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.register_device_v1(uuid,uuid,text,text)',
    'execute'
  ),
  'anon ne peut pas executer la RPC'
);
select ok(
  not has_any_column_privilege('authenticated', 'public.profiles', 'insert'),
  'authenticated ne peut plus creer directement un profil'
);
select ok(
  not has_any_column_privilege('authenticated', 'public.devices', 'insert')
  and not has_any_column_privilege('authenticated', 'public.devices', 'update')
  and not has_any_column_privilege('anon', 'public.devices', 'update'),
  'les roles client ne peuvent ni creer ni mettre a jour un appareil'
);
select ok(
  has_column_privilege('service_role', 'public.profiles', 'user_id', 'insert')
  and not has_column_privilege('service_role', 'public.profiles', 'created_at', 'insert')
  and not has_column_privilege('service_role', 'public.profiles', 'sync_revision', 'insert'),
  'service_role ne choisit que l identite lors de la creation du profil'
);
select ok(
  has_column_privilege('service_role', 'public.devices', 'id', 'insert')
  and has_column_privilege('service_role', 'public.devices', 'user_id', 'insert')
  and has_column_privilege('service_role', 'public.devices', 'platform', 'insert')
  and has_column_privilege('service_role', 'public.devices', 'app_version', 'insert')
  and has_column_privilege('service_role', 'public.devices', 'app_version', 'update')
  and not has_column_privilege('service_role', 'public.devices', 'id', 'update')
  and not has_column_privilege('service_role', 'public.devices', 'user_id', 'update')
  and not has_column_privilege('service_role', 'public.devices', 'platform', 'update')
  and not has_column_privilege('service_role', 'public.devices', 'created_at', 'update')
  and not has_column_privilege('service_role', 'public.devices', 'created_at', 'insert')
  and not has_table_privilege('service_role', 'public.devices', 'update')
  and not has_table_privilege('service_role', 'public.devices', 'delete'),
  'service_role possede seulement les colonnes necessaires a l appareil'
);
select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and policyname in (
        'lessons_read_published',
        'items_read_published',
        'audio_read_published'
      )
  ),
  0,
  'les anciennes policies client des payloads editoriaux bruts sont supprimees'
);

set local role service_role;

select is(
  public.register_device_v1(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'web',
    '1.0.0'
  )->>'deviceId',
  'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'le premier appel cree l appareil'
);
select is(
  (select count(*)::integer from public.profiles
   where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  1,
  'le profil est cree dans la meme operation'
);
select is(
  (select user_id::text from public.devices
   where id = 'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'l appareil appartient a l utilisateur authentifie par le serveur'
);
select is(
  (
    select count(*)::integer
    from pg_catalog.jsonb_object_keys(
      public.register_device_v1(
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'web',
        '1.0.0'
      )
    )
  ),
  4,
  'la reponse publique n expose que quatre champs fermes'
);
select ok(
  (
    public.register_device_v1(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'web',
      '1.0.0'
    )->>'registeredAt'
  )::timestamptz is not null,
  'la date autoritaire est renvoyee par PostgreSQL'
);
select is(
  public.register_device_v1(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'web',
    '2.0.0'
  )->>'appVersion',
  '2.0.0',
  'un rejeu proprietaire actualise la version applicative'
);
select is(
  (select app_version from public.devices
   where id = 'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  '2.0.0',
  'la version actualisee est persistee sur l appareil'
);
select is(
  (select count(*)::integer from public.devices
   where id = 'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  1,
  'les rejeux ne dupliquent pas l appareil'
);
select throws_ok(
  $$
    select public.register_device_v1(
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'web',
      '1.0.0'
    )
  $$,
  'TD002',
  'Device identity collision.',
  'un autre utilisateur rencontre une collision fermee'
);
select is(
  (select count(*)::integer from public.profiles
   where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  0,
  'la collision annule aussi la creation du profil concurrent'
);
select is(
  (select user_id::text from public.devices
   where id = 'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'une collision ne transfere jamais l appareil'
);
select throws_ok(
  $$
    select public.register_device_v1(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'ios',
      '1.0.0'
    )
  $$,
  'TD002',
  'Device identity collision.',
  'une plateforme differente ne reutilise pas le meme UUID'
);
select throws_ok(
  $$
    select public.register_device_v1(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'dcaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'web',
      'version invalide'
    )
  $$,
  'TD001',
  'Invalid device registration payload.',
  'la RPC valide aussi ses entrees en defense en profondeur'
);

select lives_ok(
  $$
    select public.register_device_v1(
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      (
        '50000000-0000-4000-8000-'
        || lpad(device_number::text, 12, '0')
      )::uuid,
      'android',
      '1.0.0'
    )
    from generate_series(1, 20) as series(device_number)
  $$,
  'vingt appareils distincts peuvent etre enregistres pour un compte'
);
select is(
  (
    select count(*)::integer
    from public.devices
    where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
  ),
  20,
  'le plafond autorise exactement vingt appareils'
);
select throws_ok(
  $$
    select public.register_device_v1(
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      '50000000-0000-4000-8000-000000000021',
      'android',
      '1.0.0'
    )
  $$,
  'TD004',
  'Device registration limit reached.',
  'un vingt-et-unieme appareil rencontre une limite fermee'
);
select is(
  (
    select count(*)::integer
    from public.devices
    where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
  ),
  20,
  'le refus de quota ne cree aucune ligne partielle'
);
select is(
  public.register_device_v1(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '50000000-0000-4000-8000-000000000001',
    'android',
    '9.9.9'
  )->>'deviceId',
  '50000000-0000-4000-8000-000000000001',
  'un rejeu exact reste autorise lorsque le compte est au plafond'
);

select * from finish();
rollback;
