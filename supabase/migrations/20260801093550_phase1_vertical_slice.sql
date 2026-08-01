-- Phase 1 foundation. Generated with `supabase migration new`; edited by hand.
-- Grants and RLS are deliberately separate controls.

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables
  from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke usage, select on sequences
  from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions
  from public, anon, authenticated, service_role;

create table public.profiles (
  user_id uuid primary key default auth.uid()
    references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.devices (
  id uuid primary key,
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  platform text not null
    check (platform in ('web', 'ios', 'android')),
  app_version text not null
    check (app_version ~ '^[0-9A-Za-z._+-]{1,32}$'),
  created_at timestamptz not null default now(),
  constraint devices_owner_identity_unique unique (user_id, id)
);

create table public.content_releases (
  id uuid primary key,
  version integer not null unique check (version > 0),
  status text not null check (status in ('draft', 'published')),
  manifest_sha256 text not null
    check (manifest_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  check ((status = 'published') = (published_at is not null))
);

create table public.lesson_versions (
  id uuid primary key,
  lesson_id uuid not null,
  version integer not null check (version > 0),
  release_id uuid not null
    references public.content_releases (id) on delete restrict,
  status text not null
    check (status in ('draft', 'review', 'approved', 'conflict', 'published')),
  title_fr text not null check (length(title_fr) between 1 and 160),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  payload_sha256 text not null
    check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (lesson_id, version),
  check ((status = 'published') = (published_at is not null))
);

create table public.learning_items (
  id uuid primary key,
  lesson_version_id uuid not null
    references public.lesson_versions (id) on delete restrict,
  position integer not null check (position >= 0),
  kind text not null
    check (kind in ('listening', 'reading', 'recall', 'production', 'tone')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  unique (lesson_version_id, position),
  constraint learning_items_version_identity_unique
    unique (id, lesson_version_id)
);

create table public.audio_assets (
  id uuid primary key,
  learning_item_id uuid not null,
  lesson_version_id uuid not null,
  variant text not null check (variant in ('natural', 'pedagogical')),
  storage_path text not null
    check (
      length(storage_path) between 1 and 512
      and storage_path !~ '(^/|(^|/)\.\.(/|$))'
    ),
  mime_type text not null
    check (mime_type in ('audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/webm', 'audio/wav')),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  duration_ms integer not null check (duration_ms between 1 and 3600000),
  foreign key (learning_item_id, lesson_version_id)
    references public.learning_items (id, lesson_version_id)
    on delete restrict,
  unique (learning_item_id, variant)
);

create table public.attempt_events (
  event_id uuid primary key,
  user_id uuid not null
    references auth.users (id) on delete cascade,
  device_id uuid not null,
  exercise_id uuid not null,
  item_id uuid not null,
  lesson_version_id uuid not null,
  selected_option_id uuid not null,
  dimension text not null
    check (dimension in ('listening', 'reading', 'recall', 'production', 'tone')),
  rating smallint not null check (rating in (0, 1)),
  answered_at timestamptz not null,
  duration_ms integer not null check (duration_ms between 0 and 1800000),
  algorithm_version text not null
    check (algorithm_version ~ '^[0-9A-Za-z._-]{1,64}$'),
  payload_sha256 text not null
    check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  received_at timestamptz not null default now(),
  foreign key (user_id, device_id)
    references public.devices (user_id, id) on delete restrict,
  foreign key (item_id, lesson_version_id)
    references public.learning_items (id, lesson_version_id) on delete restrict
);

create table public.learner_item_state (
  user_id uuid not null
    references auth.users (id) on delete cascade,
  item_id uuid not null,
  lesson_version_id uuid not null,
  dimension text not null
    check (dimension in ('listening', 'reading', 'recall', 'production', 'tone')),
  mastery_permille integer not null check (mastery_permille between 0 and 1000),
  successful_attempts integer not null check (successful_attempts >= 0),
  consecutive_correct integer not null check (consecutive_correct >= 0),
  attempt_count integer not null check (attempt_count > 0),
  last_event_id uuid not null
    references public.attempt_events (event_id) on delete cascade,
  last_answered_at timestamptz not null,
  due_at timestamptz not null,
  algorithm_version text not null
    check (algorithm_version ~ '^[0-9A-Za-z._-]{1,64}$'),
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id, dimension),
  foreign key (item_id, lesson_version_id)
    references public.learning_items (id, lesson_version_id) on delete restrict
);

create index devices_user_id_idx on public.devices (user_id);
create index lesson_versions_release_id_idx on public.lesson_versions (release_id);
create index learning_items_lesson_position_idx
  on public.learning_items (lesson_version_id, position);
create index attempt_events_user_answered_idx
  on public.attempt_events (user_id, answered_at desc, event_id);
create index attempt_events_user_item_dimension_idx
  on public.attempt_events (user_id, item_id, dimension, answered_at desc);
create index attempt_events_content_idx
  on public.attempt_events (item_id, lesson_version_id);
create index learner_item_state_content_idx
  on public.learner_item_state (item_id, lesson_version_id);
create index learner_item_state_last_event_idx
  on public.learner_item_state (last_event_id);
create index learner_item_state_due_idx
  on public.learner_item_state (user_id, due_at, item_id);

alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.content_releases enable row level security;
alter table public.lesson_versions enable row level security;
alter table public.learning_items enable row level security;
alter table public.audio_assets enable row level security;
alter table public.attempt_events enable row level security;
alter table public.learner_item_state enable row level security;

create policy profiles_read_own
on public.profiles for select to authenticated
using ((select auth.uid()) = user_id);

create policy profiles_insert_own
on public.profiles for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy devices_read_own
on public.devices for select to authenticated
using ((select auth.uid()) = user_id);

create policy devices_insert_own
on public.devices for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy releases_read_published
on public.content_releases for select to anon, authenticated
using (status = 'published');

create policy lessons_read_published
on public.lesson_versions for select to anon, authenticated
using (
  status = 'published'
  and exists (
    select 1 from public.content_releases as release
    where release.id = lesson_versions.release_id
      and release.status = 'published'
  )
);

create policy items_read_published
on public.learning_items for select to anon, authenticated
using (
  exists (
    select 1
    from public.lesson_versions as lesson
    join public.content_releases as release on release.id = lesson.release_id
    where lesson.id = learning_items.lesson_version_id
      and lesson.status = 'published'
      and release.status = 'published'
  )
);

create policy audio_read_published
on public.audio_assets for select to anon, authenticated
using (
  exists (
    select 1
    from public.lesson_versions as lesson
    join public.content_releases as release on release.id = lesson.release_id
    where lesson.id = audio_assets.lesson_version_id
      and lesson.status = 'published'
      and release.status = 'published'
  )
);

create policy attempts_read_own
on public.attempt_events for select to authenticated
using ((select auth.uid()) = user_id);

create policy learner_state_read_own
on public.learner_item_state for select to authenticated
using ((select auth.uid()) = user_id);

revoke all on
  public.profiles,
  public.devices,
  public.content_releases,
  public.lesson_versions,
  public.learning_items,
  public.audio_assets,
  public.attempt_events,
  public.learner_item_state
from anon, authenticated, service_role;

grant select on public.content_releases
to anon, authenticated, service_role;

-- Les payloads éditoriaux contiennent encore des clés de correction et des
-- chemins audio. Ils attendent un DTO client expurgé et restent côté serveur.
grant select on
  public.lesson_versions,
  public.learning_items,
  public.audio_assets
to service_role;

grant select on
  public.profiles,
  public.devices,
  public.attempt_events,
  public.learner_item_state
to authenticated, service_role;

grant insert (user_id) on public.profiles to authenticated;
grant insert (id, platform, app_version) on public.devices to authenticated;

grant insert on public.attempt_events to service_role;
grant insert, update on public.learner_item_state to service_role;

comment on table public.attempt_events is
  'Journal immuable. Seul le serveur authentifié calcule rating et payload_sha256.';
comment on column public.learner_item_state.mastery_permille is
  'Projection serveur 0..1000 ; jamais acceptée depuis un client.';
