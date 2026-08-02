begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(44);

insert into auth.users (
  id,
  aud,
  role,
  email,
  is_anonymous,
  created_at,
  updated_at
)
values
  (
    'a2000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'report-a@example.invalid',
    false,
    now(),
    now()
  ),
  (
    'b2000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'report-b@example.invalid',
    false,
    now(),
    now()
  ),
  (
    'c2000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'report-no-profile@example.invalid',
    false,
    now(),
    now()
  ),
  (
    'd2000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'report-anonymous@example.invalid',
    true,
    now(),
    now()
  );

insert into public.profiles (user_id)
values
  ('a2000000-0000-4000-8000-000000000001'),
  ('b2000000-0000-4000-8000-000000000001'),
  ('d2000000-0000-4000-8000-000000000001');

insert into public.content_releases (
  id,
  version,
  status,
  manifest_sha256,
  published_at
)
values (
  '60000000-0000-4000-8000-000000000001',
  601,
  'published',
  repeat('6', 64),
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
  '61000000-0000-4000-8000-000000000001',
  '61100000-0000-4000-8000-000000000001',
  1,
  '60000000-0000-4000-8000-000000000001',
  'published',
  'Fixture signalement structure',
  jsonb_build_object(
    'lesson',
    jsonb_build_object(
      'exercises',
      jsonb_build_array(
        jsonb_build_object(
          'id', '63000000-0000-4000-8000-000000000001',
          'itemId', '62000000-0000-4000-8000-000000000001'
        )
      )
    )
  ),
  repeat('7', 64),
  now()
);

insert into public.learning_items (
  id,
  lesson_version_id,
  position,
  kind,
  payload
)
values (
  '62000000-0000-4000-8000-000000000001',
  '61000000-0000-4000-8000-000000000001',
  0,
  'listening',
  '{}'::jsonb
);

select has_table(
  'public',
  'content_reports',
  'la table publique de signalements existe'
);
select columns_are(
  'public',
  'content_reports',
  array[
    'user_id',
    'idempotency_key',
    'request_sha256',
    'lesson_version_id',
    'item_id',
    'exercise_id',
    'category',
    'platform',
    'received_at'
  ],
  'le schema ne contient que les identifiants et dimensions fermes attendus'
);
select ok(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.content_reports'::regclass
  ),
  'RLS est active sur content_reports'
);
select is(
  (
    select array_agg(attribute.attname order by key_column.ordinality)
    from pg_constraint as constraint_row
    cross join lateral unnest(constraint_row.conkey)
      with ordinality as key_column(attnum, ordinality)
    join pg_attribute as attribute
      on attribute.attrelid = constraint_row.conrelid
      and attribute.attnum = key_column.attnum
    where constraint_row.conrelid = 'public.content_reports'::regclass
      and constraint_row.contype = 'p'
  ),
  array['user_id', 'idempotency_key']::name[],
  'la cle primaire borne l idempotence par compte'
);
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.content_reports'::regclass
      and conname = 'content_reports_user_id_fkey'
      and confrelid = 'auth.users'::regclass
      and confdeltype = 'c'
  ),
  'le compte Auth est une FK directe avec ON DELETE CASCADE'
);
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.content_reports'::regclass
      and conname = 'content_reports_target_fkey'
      and confrelid = 'public.learning_items'::regclass
      and confdeltype = 'r'
      and pg_get_constraintdef(oid) like
        'FOREIGN KEY (item_id, lesson_version_id) REFERENCES learning_items(id, lesson_version_id) ON DELETE RESTRICT%'
  ),
  'item et version forment une cible relationnelle coherente et non supprimable'
);
select is(
  (
    select count(*)::integer
    from pg_constraint
    where conrelid = 'public.content_reports'::regclass
      and contype = 'c'
      and conname in (
        'content_reports_request_sha256_check',
        'content_reports_category_check',
        'content_reports_platform_check'
      )
  ),
  3,
  'hash, categorie et plateforme possedent des contraintes fermees'
);
select has_index(
  'public',
  'content_reports',
  'content_reports_user_received_idx',
  'l export ordonne d un compte possede un index dedie'
);
select has_index(
  'public',
  'content_reports',
  'content_reports_lesson_category_idx',
  'l agregat Studio par version et categorie possede un index dedie'
);
select has_index(
  'public',
  'content_reports',
  'content_reports_target_idx',
  'la FK item et version possede un index referencant dedie'
);
select has_function(
  'public',
  'submit_content_report_v1',
  array['uuid', 'uuid', 'text', 'uuid', 'uuid', 'text', 'text'],
  'la RPC v1 existe sans item fourni par le client'
);
select ok(
  not (
    select prosecdef
    from pg_proc
    where oid =
      'public.submit_content_report_v1(uuid,uuid,text,uuid,uuid,text,text)'::regprocedure
  )
  and (
    select provolatile = 'v'
    from pg_proc
    where oid =
      'public.submit_content_report_v1(uuid,uuid,text,uuid,uuid,text,text)'::regprocedure
  ),
  'la RPC est volatile et SECURITY INVOKER'
);
select ok(
  coalesce(
    (
      select 'search_path=""' = any (proconfig)
      from pg_proc
      where oid =
        'public.submit_content_report_v1(uuid,uuid,text,uuid,uuid,text,text)'::regprocedure
    ),
    false
  ),
  'la RPC fixe un search_path vide'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.submit_content_report_v1(uuid,uuid,text,uuid,uuid,text,text)',
    'execute'
  )
  and not has_function_privilege(
    'authenticated',
    'public.submit_content_report_v1(uuid,uuid,text,uuid,uuid,text,text)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.submit_content_report_v1(uuid,uuid,text,uuid,uuid,text,text)',
    'execute'
  ),
  'service_role est le seul role Data API autorise a executer la RPC'
);
select ok(
  has_table_privilege('service_role', 'public.content_reports', 'select')
  and has_column_privilege(
    'service_role', 'public.content_reports', 'user_id', 'insert'
  )
  and has_column_privilege(
    'service_role', 'public.content_reports', 'platform', 'insert'
  )
  and not has_column_privilege(
    'service_role', 'public.content_reports', 'received_at', 'insert'
  )
  and not has_table_privilege(
    'service_role', 'public.content_reports', 'update'
  )
  and not has_table_privilege(
    'service_role', 'public.content_reports', 'delete'
  )
  and not has_any_column_privilege(
    'authenticated', 'public.content_reports', 'select'
  )
  and not has_any_column_privilege(
    'authenticated', 'public.content_reports', 'insert'
  )
  and not has_any_column_privilege(
    'anon', 'public.content_reports', 'select'
  )
  and not has_any_column_privilege(
    'anon', 'public.content_reports', 'insert'
  ),
  'le serveur a seulement SELECT et INSERT sans received_at; les clients aucun acces'
);
select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'content_reports'
  ),
  0,
  'aucune policy ne rend une ligne accessible aux roles client'
);

set local role service_role;

select throws_ok(
  $$
    select public.submit_content_report_v1(
      'a2000000-0000-4000-8000-000000000001',
      '64000000-0000-4000-8000-000000000001',
      'hash-invalide',
      '61000000-0000-4000-8000-000000000001',
      '63000000-0000-4000-8000-000000000001',
      'orthography',
      'web'
    )
  $$,
  'TR001',
  'Invalid content report payload.',
  'un hash non SHA-256 est refuse avant toute ecriture'
);
select throws_ok(
  $$
    select public.submit_content_report_v1(
      'a2000000-0000-4000-8000-000000000001',
      '64000000-0000-4000-8000-000000000002',
      repeat('1', 64),
      '61000000-0000-4000-8000-000000000001',
      '63000000-0000-4000-8000-000000000001',
      'free_text',
      'web'
    )
  $$,
  'TR001',
  'Invalid content report payload.',
  'une categorie hors liste est refusee'
);
select throws_ok(
  $$
    select public.submit_content_report_v1(
      'a2000000-0000-4000-8000-000000000001',
      '64000000-0000-4000-8000-000000000003',
      repeat('1', 64),
      '61000000-0000-4000-8000-000000000001',
      '63000000-0000-4000-8000-000000000001',
      'audio',
      'desktop'
    )
  $$,
  'TR001',
  'Invalid content report payload.',
  'une plateforme hors liste est refusee'
);
select is(
  public.submit_content_report_v1(
    'c2000000-0000-4000-8000-000000000001',
    '64000000-0000-4000-8000-000000000004',
    repeat('1', 64),
    '61000000-0000-4000-8000-000000000001',
    '63000000-0000-4000-8000-000000000001',
    'meaning',
    'ios'
  ),
  '{"status":"received"}'::jsonb,
  'un compte permanent sans appareil peut envoyer son premier signalement'
);
select is(
  (
    select sync_revision
    from public.profiles
    where user_id = 'c2000000-0000-4000-8000-000000000001'
  ),
  1::bigint,
  'la RPC cree puis verrouille le profil minimal avant d incrementer sa revision'
);
select throws_ok(
  $$
    select public.submit_content_report_v1(
      'e2000000-0000-4000-8000-000000000001',
      '64000000-0000-4000-8000-000000000006',
      repeat('1', 64),
      '61000000-0000-4000-8000-000000000001',
      '63000000-0000-4000-8000-000000000001',
      'meaning',
      'ios'
    )
  $$,
  'TR002',
  'Permanent content report account not found.',
  'un sujet absent de Auth ne peut pas amorcer un profil'
);
select throws_ok(
  $$
    select public.submit_content_report_v1(
      'd2000000-0000-4000-8000-000000000001',
      '64000000-0000-4000-8000-000000000005',
      repeat('1', 64),
      '61000000-0000-4000-8000-000000000001',
      '63000000-0000-4000-8000-000000000001',
      'meaning',
      'android'
    )
  $$,
  'TR002',
  'Permanent content report account not found.',
  'un utilisateur Auth anonyme est refuse meme avec un profil'
);

select is(
  public.submit_content_report_v1(
    'a2000000-0000-4000-8000-000000000001',
    '64000000-0000-4000-8000-000000000011',
    repeat('a', 64),
    '61000000-0000-4000-8000-000000000001',
    '63000000-0000-4000-8000-000000000001',
    'orthography',
    'web'
  ),
  '{"status":"received"}'::jsonb,
  'un signalement valide retourne le contrat public ferme received'
);
select is(
  (
    select count(*)::integer
    from public.content_reports
    where user_id = 'a2000000-0000-4000-8000-000000000001'
  ),
  1,
  'le premier envoi insere exactement une ligne'
);
select is(
  (
    select jsonb_build_object(
      'userId', user_id,
      'idempotencyKey', idempotency_key,
      'requestSha256', request_sha256,
      'lessonVersionId', lesson_version_id,
      'itemId', item_id,
      'exerciseId', exercise_id,
      'category', category,
      'platform', platform
    )
    from public.content_reports
    where user_id = 'a2000000-0000-4000-8000-000000000001'
      and idempotency_key = '64000000-0000-4000-8000-000000000011'
  ),
  jsonb_build_object(
    'userId', 'a2000000-0000-4000-8000-000000000001'::uuid,
    'idempotencyKey', '64000000-0000-4000-8000-000000000011'::uuid,
    'requestSha256', repeat('a', 64),
    'lessonVersionId', '61000000-0000-4000-8000-000000000001'::uuid,
    'itemId', '62000000-0000-4000-8000-000000000001'::uuid,
    'exerciseId', '63000000-0000-4000-8000-000000000001'::uuid,
    'category', 'orthography',
    'platform', 'web'
  ),
  'la ligne exacte contient l item derive depuis la version et l exercice'
);
select is(
  (
    select received_at
    from public.content_reports
    where user_id = 'a2000000-0000-4000-8000-000000000001'
      and idempotency_key = '64000000-0000-4000-8000-000000000011'
  ),
  transaction_timestamp(),
  'received_at est attribue par le default serveur de la transaction'
);
select is(
  (
    select sync_revision
    from public.profiles
    where user_id = 'a2000000-0000-4000-8000-000000000001'
  ),
  1::bigint,
  'un nouvel insert incremente la revision du profil sous verrou'
);
select is(
  public.submit_content_report_v1(
    'a2000000-0000-4000-8000-000000000001',
    '64000000-0000-4000-8000-000000000011',
    repeat('a', 64),
    '61000000-0000-4000-8000-000000000001',
    '63000000-0000-4000-8000-000000000001',
    'orthography',
    'web'
  ),
  '{"status":"duplicate"}'::jsonb,
  'un rejeu exact retourne duplicate'
);
select is(
  (
    select count(*)::integer
    from public.content_reports
    where user_id = 'a2000000-0000-4000-8000-000000000001'
  ),
  1,
  'un rejeu exact ne duplique pas la ligne'
);
select is(
  (
    select sync_revision
    from public.profiles
    where user_id = 'a2000000-0000-4000-8000-000000000001'
  ),
  1::bigint,
  'un duplicate n incremente pas la revision'
);
select throws_ok(
  $$
    select public.submit_content_report_v1(
      'a2000000-0000-4000-8000-000000000001',
      '64000000-0000-4000-8000-000000000011',
      repeat('b', 64),
      '61000000-0000-4000-8000-000000000001',
      '63000000-0000-4000-8000-000000000001',
      'orthography',
      'web'
    )
  $$,
  'TR003',
  'Content report idempotency key conflict.',
  'une meme cle avec un autre hash echoue fermee'
);
select is(
  (
    select sync_revision
    from public.profiles
    where user_id = 'a2000000-0000-4000-8000-000000000001'
  ),
  1::bigint,
  'une collision n incremente pas la revision'
);
select throws_ok(
  $$
    select public.submit_content_report_v1(
      'a2000000-0000-4000-8000-000000000001',
      '64000000-0000-4000-8000-000000000012',
      repeat('c', 64),
      '61000000-0000-4000-8000-000000000001',
      '63000000-0000-4000-8000-000000000099',
      'pronunciation',
      'ios'
    )
  $$,
  'TR004',
  'Invalid content report target.',
  'un exercice absent de la version est refuse'
);
select throws_ok(
  $$
    select public.submit_content_report_v1(
      'a2000000-0000-4000-8000-000000000001',
      '64000000-0000-4000-8000-000000000013',
      repeat('d', 64),
      '61000000-0000-4000-8000-000000000099',
      '63000000-0000-4000-8000-000000000001',
      'tone',
      'android'
    )
  $$,
  'TR004',
  'Invalid content report target.',
  'une version absente est refusee'
);
select is(
  (
    select sync_revision
    from public.profiles
    where user_id = 'a2000000-0000-4000-8000-000000000001'
  ),
  1::bigint,
  'les cibles invalides n incrementent pas la revision'
);

reset role;

-- Ces grants temporaires isolent RLS des privileges Data API. Sans aucune
-- policy, anon et deux comptes authentifies ne voient toujours aucune ligne.
grant select on public.content_reports to anon, authenticated;

set local role anon;
select is(
  (select count(*)::integer from public.content_reports),
  0,
  'RLS masque tous les signalements a anon meme avec un GRANT temporaire'
);
reset role;

select set_config(
  'request.jwt.claim.sub',
  'a2000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;
select is(
  (select count(*)::integer from public.content_reports),
  0,
  'RLS masque son propre signalement a l utilisateur A'
);
reset role;

select set_config(
  'request.jwt.claim.sub',
  'b2000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;
select is(
  (select count(*)::integer from public.content_reports),
  0,
  'RLS masque aussi le signalement de A a l utilisateur B'
);
reset role;

revoke select on public.content_reports from anon, authenticated;

select ok(
  not has_any_column_privilege(
    'authenticated', 'public.content_reports', 'update'
  )
  and not has_table_privilege(
    'authenticated', 'public.content_reports', 'delete'
  )
  and not has_any_column_privilege(
    'anon', 'public.content_reports', 'update'
  )
  and not has_table_privilege(
    'anon', 'public.content_reports', 'delete'
  ),
  'les clients ne peuvent ni corriger ni supprimer un signalement immuable'
);

set local role service_role;
select is(
  public.submit_content_report_v1(
    'b2000000-0000-4000-8000-000000000001',
    '64000000-0000-4000-8000-000000000021',
    repeat('e', 64),
    '61000000-0000-4000-8000-000000000001',
    '63000000-0000-4000-8000-000000000001',
    'audio',
    'android'
  ),
  '{"status":"received"}'::jsonb,
  'un second compte permanent peut creer son propre signalement'
);
select is(
  (
    select sync_revision
    from public.profiles
    where user_id = 'b2000000-0000-4000-8000-000000000001'
  ),
  1::bigint,
  'le nouvel insert du compte B incremente seulement sa revision'
);
reset role;

delete from auth.users
where id = 'b2000000-0000-4000-8000-000000000001';

select is(
  (
    select count(*)::integer
    from public.content_reports
    where user_id = 'b2000000-0000-4000-8000-000000000001'
  ),
  0,
  'le hard delete Auth cascade atomiquement vers les signalements'
);

update public.lesson_versions
set status = 'draft', published_at = null
where id = '61000000-0000-4000-8000-000000000001';

set local role service_role;
select throws_ok(
  $$
    select public.submit_content_report_v1(
      'a2000000-0000-4000-8000-000000000001',
      '64000000-0000-4000-8000-000000000031',
      repeat('f', 64),
      '61000000-0000-4000-8000-000000000001',
      '63000000-0000-4000-8000-000000000001',
      'register',
      'web'
    )
  $$,
  'TR004',
  'Invalid content report target.',
  'une version non publiee ne peut pas devenir la cible d un signalement utilisateur'
);
reset role;

select * from finish();
rollback;
