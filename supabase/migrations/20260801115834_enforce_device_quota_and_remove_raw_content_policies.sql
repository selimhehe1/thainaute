-- Limite transactionnelle d'appareils et suppression des anciennes policies
-- de lecture client sur les payloads editoriaux bruts.

drop policy if exists lessons_read_published on public.lesson_versions;
drop policy if exists items_read_published on public.learning_items;
drop policy if exists audio_read_published on public.audio_assets;

create or replace function public.register_device_v1(
  p_user_id uuid,
  p_device_id uuid,
  p_platform text,
  p_app_version text
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $function$
declare
  v_device record;
  v_device_count integer;
  v_max_devices_per_account constant integer := 20;
begin
  if p_user_id is null
    or p_device_id is null
    or p_platform is null
    or p_platform not in ('web', 'ios', 'android')
    or p_app_version is null
    or p_app_version !~ '^[0-9A-Za-z._+-]{1,32}$'
  then
    raise sqlstate 'TD001'
      using message = 'Invalid device registration payload.';
  end if;

  insert into public.profiles (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  -- Toutes les creations d'appareils d'un compte prennent le meme verrou.
  -- Le comptage et l'insertion sont ainsi atomiques, meme avec deux requetes
  -- concurrentes portant des UUID differents.
  perform 1
  from public.profiles as profile
  where profile.user_id = p_user_id
  for update;

  if not found then
    raise sqlstate 'TD003'
      using message = 'Device registration unavailable.';
  end if;

  -- Un rejeu exact reste autorise lorsque le compte est deja au plafond.
  select device.*
  into v_device
  from public.devices as device
  where device.id = p_device_id;

  if found then
    if v_device.user_id <> p_user_id or v_device.platform <> p_platform then
      raise sqlstate 'TD002'
        using message = 'Device identity collision.';
    end if;

    return jsonb_build_object(
      'deviceId', v_device.id,
      'platform', v_device.platform,
      'appVersion', v_device.app_version,
      'registeredAt', v_device.created_at
    );
  end if;

  select count(*)::integer
  into v_device_count
  from public.devices as device
  where device.user_id = p_user_id;

  if v_device_count >= v_max_devices_per_account then
    raise sqlstate 'TD004'
      using message = 'Device registration limit reached.';
  end if;

  -- ON CONFLICT ferme la course inter-comptes sur un meme UUID. Le controle
  -- qui suit transforme toute collision en code stable sans transfert.
  insert into public.devices (id, user_id, platform, app_version)
  values (p_device_id, p_user_id, p_platform, p_app_version)
  on conflict (id) do nothing;

  select device.*
  into strict v_device
  from public.devices as device
  where device.id = p_device_id;

  if v_device.user_id <> p_user_id or v_device.platform <> p_platform then
    raise sqlstate 'TD002'
      using message = 'Device identity collision.';
  end if;

  return jsonb_build_object(
    'deviceId', v_device.id,
    'platform', v_device.platform,
    'appVersion', v_device.app_version,
    'registeredAt', v_device.created_at
  );
exception
  when no_data_found then
    raise sqlstate 'TD003'
      using message = 'Device registration unavailable.';
end;
$function$;

revoke execute on function public.register_device_v1(uuid, uuid, text, text)
from public, anon, authenticated, service_role;

grant execute on function public.register_device_v1(uuid, uuid, text, text)
to service_role;

comment on function public.register_device_v1(uuid, uuid, text, text) is
  'Cree atomiquement un profil et au plus 20 appareils immuables par compte. SQLSTATE: TD001 payload invalide; TD002 collision; TD003 indisponible; TD004 plafond atteint.';
