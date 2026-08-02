-- Signalement linguistique structure v1.
-- Le texte libre est volontairement absent : le serveur ne persiste que la
-- categorie fermee et l'identite exacte du contenu signale.

create table public.content_reports (
  user_id uuid not null,
  idempotency_key uuid not null,
  request_sha256 text not null,
  lesson_version_id uuid not null,
  item_id uuid not null,
  exercise_id uuid not null,
  category text not null,
  platform text not null,
  received_at timestamptz not null default now(),
  constraint content_reports_pkey
    primary key (user_id, idempotency_key),
  constraint content_reports_user_id_fkey
    foreign key (user_id)
    references auth.users (id)
    on delete cascade,
  constraint content_reports_target_fkey
    foreign key (item_id, lesson_version_id)
    references public.learning_items (id, lesson_version_id)
    on delete restrict,
  constraint content_reports_request_sha256_check
    check (request_sha256 ~ '^[0-9a-f]{64}$'),
  constraint content_reports_category_check
    check (
      category in (
        'orthography',
        'meaning',
        'pronunciation',
        'tone',
        'vowel_length',
        'register',
        'naturalness',
        'audio'
      )
    ),
  constraint content_reports_platform_check
    check (platform in ('web', 'ios', 'android'))
);

create index content_reports_user_received_idx
  on public.content_reports (user_id, received_at desc, idempotency_key);

create index content_reports_lesson_category_idx
  on public.content_reports (
    lesson_version_id,
    category,
    exercise_id
  );

-- PostgreSQL n'indexe pas automatiquement les colonnes référençantes d'une
-- FK. Cet index borne le contrôle RESTRICT lors d'une opération éditoriale sur
-- learning_items, sans dépendre de l'index d'agrégat orienté lesson_version_id.
create index content_reports_target_idx
  on public.content_reports (item_id, lesson_version_id);

alter table public.content_reports enable row level security;

revoke all on public.content_reports
from public, anon, authenticated, service_role;

grant select on public.content_reports to service_role;

-- received_at reste exclusivement attribue par PostgreSQL. Le role serveur
-- peut inserer les champs metier, mais ne peut pas antidater le signalement.
grant insert (
  user_id,
  idempotency_key,
  request_sha256,
  lesson_version_id,
  item_id,
  exercise_id,
  category,
  platform
) on public.content_reports to service_role;

-- La RPC refuse les comptes Supabase anonymes en defense en profondeur. Ce
-- droit de lecture cible deux colonnes non sensibles et reste cote serveur.
grant select (id, is_anonymous) on auth.users to service_role;

create function public.submit_content_report_v1(
  p_user_id uuid,
  p_idempotency_key uuid,
  p_request_sha256 text,
  p_lesson_version_id uuid,
  p_exercise_id uuid,
  p_category text,
  p_platform text
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $function$
declare
  v_stored_hash text;
  v_target_item_ids uuid[];
  v_item_id uuid;
begin
  if p_user_id is null
    or p_idempotency_key is null
    or p_request_sha256 is null
    or p_request_sha256 !~ '^[0-9a-f]{64}$'
    or p_lesson_version_id is null
    or p_exercise_id is null
    or p_category is null
    or p_category not in (
      'orthography',
      'meaning',
      'pronunciation',
      'tone',
      'vowel_length',
      'register',
      'naturalness',
      'audio'
    )
    or p_platform is null
    or p_platform not in ('web', 'ios', 'android')
  then
    raise sqlstate 'TR001'
      using message = 'Invalid content report payload.';
  end if;

  -- Un signalement ne dépend pas de l'enregistrement préalable d'un appareil.
  -- Le compte Auth doit toutefois exister et être permanent avant de créer le
  -- profil minimal partagé avec la synchronisation.
  perform 1
  from auth.users as account
  where account.id = p_user_id
    and account.is_anonymous is false;

  if not found then
    raise sqlstate 'TR002'
      using message = 'Permanent content report account not found.';
  end if;

  insert into public.profiles (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  -- Le même verrou que l'export garantit qu'un export voit soit la révision
  -- précédente sans le rapport, soit la révision suivante avec le rapport.
  -- Il sérialise aussi les rejeux d'une même clé pour ce compte.
  perform 1
  from public.profiles as profile
  where profile.user_id = p_user_id
  for update of profile;

  if not found then
    raise sqlstate 'TR002'
      using message = 'Permanent content report account not found.';
  end if;

  select report.request_sha256
  into v_stored_hash
  from public.content_reports as report
  where report.user_id = p_user_id
    and report.idempotency_key = p_idempotency_key;

  if found then
    if v_stored_hash <> p_request_sha256 then
      raise sqlstate 'TR003'
        using message = 'Content report idempotency key conflict.';
    end if;

    return jsonb_build_object(
      'status', 'duplicate'
    );
  end if;

  -- Il n'existe pas encore de table relationnelle d'exercices. L'identite de
  -- l'exercice est donc verifiee dans le bundle editorial de la version. Son
  -- item est derive ici et n'est jamais accepte depuis le client ou l'API.
  select array_agg(item.id order by item.id)
  into v_target_item_ids
  from public.lesson_versions as lesson
    join public.content_releases as release
      on release.id = lesson.release_id
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(lesson.payload #> '{lesson,exercises}') = 'array'
          then lesson.payload #> '{lesson,exercises}'
        else '[]'::jsonb
      end
    ) as exercise(value)
    join public.learning_items as item
      on item.lesson_version_id = lesson.id
      and item.id::text = exercise.value ->> 'itemId'
  where lesson.id = p_lesson_version_id
    and lesson.status = 'published'
    and lesson.published_at is not null
    and release.status = 'published'
    and release.published_at is not null
    and exercise.value ->> 'id' = p_exercise_id::text;

  if coalesce(cardinality(v_target_item_ids), 0) <> 1 then
    raise sqlstate 'TR004'
      using message = 'Invalid content report target.';
  end if;

  v_item_id := v_target_item_ids[1];

  insert into public.content_reports (
    user_id,
    idempotency_key,
    request_sha256,
    lesson_version_id,
    item_id,
    exercise_id,
    category,
    platform
  ) values (
    p_user_id,
    p_idempotency_key,
    p_request_sha256,
    p_lesson_version_id,
    v_item_id,
    p_exercise_id,
    p_category,
    p_platform
  );

  update public.profiles as profile
  set sync_revision = profile.sync_revision + 1
  where profile.user_id = p_user_id;

  if not found then
    raise sqlstate 'TR002'
      using message = 'Permanent content report account not found.';
  end if;

  return jsonb_build_object(
    'status', 'received'
  );
end;
$function$;

revoke execute on function public.submit_content_report_v1(
  uuid, uuid, text, uuid, uuid, text, text
) from public, anon, authenticated, service_role;

grant execute on function public.submit_content_report_v1(
  uuid, uuid, text, uuid, uuid, text, text
) to service_role;

comment on table public.content_reports is
  'Signalements linguistiques structures et immuables; aucun texte libre.';

comment on column public.content_reports.received_at is
  'Horodatage autoritaire attribue par PostgreSQL et non inserable par le role serveur.';

comment on function public.submit_content_report_v1(
  uuid, uuid, text, uuid, uuid, text, text
) is
  'RPC serveur transactionnelle. Retour status received|duplicate. SQLSTATE: TR001 payload invalide; TR002 compte permanent ou profil absent; TR003 collision idempotence; TR004 cible version/exercice/item derive invalide.';
