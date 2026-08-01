-- Defense en profondeur de la politique temporelle applicative.
-- L'API applique [heure serveur - 30 jours, heure serveur + 5 minutes]. La
-- base garde une marge strictement technique pour absorber un faible ecart
-- entre les horloges Node.js et PostgreSQL, sans devenir l'autorite metier.

alter table public.attempt_events
  add constraint attempt_events_received_time_guard
  check (
    answered_at >= received_at - interval '31 days'
    and answered_at <= received_at + interval '10 minutes'
  );

create index attempt_events_user_device_idx
  on public.attempt_events (user_id, device_id);

-- La RPC SECURITY INVOKER enumere deja les colonnes inserees et laisse
-- received_at a son default PostgreSQL. Le privilege de colonne rend cette
-- propriete verifiable meme si un futur appelant serveur tente de le fournir.
revoke insert on public.attempt_events from service_role;

grant insert (
  event_id,
  user_id,
  device_id,
  exercise_id,
  item_id,
  lesson_version_id,
  selected_option_id,
  dimension,
  rating,
  answered_at,
  duration_ms,
  algorithm_version,
  payload_sha256
) on public.attempt_events to service_role;

comment on column public.attempt_events.answered_at is
  'Heure client conservee sans troncature apres controle temporel serveur.';

comment on column public.attempt_events.received_at is
  'Heure daudit autoritaire attribuee par PostgreSQL et non inserable par le role serveur.';
