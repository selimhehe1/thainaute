-- Pack identity is data, not authorization. Existing Thai rows are
-- backfilled explicitly through defaults so this migration is deployable
-- before the application starts sending the new columns.

alter table public.content_releases
  add column language_pack_id text not null default 'thai-fr',
  add column target_locale text not null default 'th-TH',
  add constraint content_releases_language_pack_id_check
    check (language_pack_id ~ '^[a-z0-9]+(?:-[a-z0-9]+){1,3}$'),
  add constraint content_releases_target_locale_check
    check (target_locale ~ '^[a-z]{2,3}(?:-[A-Z]{2})?$');

alter table public.lesson_versions
  add column language_pack_id text not null default 'thai-fr',
  add column target_locale text not null default 'th-TH',
  add constraint lesson_versions_language_pack_id_check
    check (language_pack_id ~ '^[a-z0-9]+(?:-[a-z0-9]+){1,3}$'),
  add constraint lesson_versions_target_locale_check
    check (target_locale ~ '^[a-z]{2,3}(?:-[A-Z]{2})?$');

create index content_releases_pack_version_idx
  on public.content_releases (language_pack_id, version desc);

create index lesson_versions_pack_status_idx
  on public.lesson_versions (language_pack_id, status, version desc);

comment on column public.content_releases.language_pack_id is
  'Identifiant stable du pack de langue servi par cette release.';
comment on column public.content_releases.target_locale is
  'Locale de la langue cible du pack, par exemple th-TH.';
comment on column public.lesson_versions.language_pack_id is
  'Doit correspondre a l identite du pack du payload editorial.';
comment on column public.lesson_versions.target_locale is
  'Doit correspondre a la locale cible du payload editorial.';
