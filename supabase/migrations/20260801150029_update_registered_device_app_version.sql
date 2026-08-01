-- Un identifiant d'appareil reste immuable, mais sa version d'application est
-- une métadonnée courante. Sans mise à jour, le client strict rejetterait la
-- réponse après chaque montée de version de l'application.

grant update (app_version) on public.devices to service_role;

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

  perform 1
  from public.profiles as profile
  where profile.user_id = p_user_id
  for update;

  if not found then
    raise sqlstate 'TD003'
      using message = 'Device registration unavailable.';
  end if;

  select device.*
  into v_device
  from public.devices as device
  where device.id = p_device_id;

  if found then
    if v_device.user_id <> p_user_id or v_device.platform <> p_platform then
      raise sqlstate 'TD002'
        using message = 'Device identity collision.';
    end if;

    if v_device.app_version <> p_app_version then
      update public.devices as device
      set app_version = p_app_version
      where device.id = p_device_id
      returning device.* into strict v_device;
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
  from public, anon, authenticated;
grant execute on function public.register_device_v1(uuid, uuid, text, text)
  to service_role;

comment on function public.register_device_v1(uuid, uuid, text, text) is
  'Crée atomiquement un profil et au plus 20 appareils immuables par compte. Met à jour uniquement app_version lors d’un rejeu propriétaire. SQLSTATE: TD001 payload invalide; TD002 collision; TD003 indisponible; TD004 plafond atteint.';
