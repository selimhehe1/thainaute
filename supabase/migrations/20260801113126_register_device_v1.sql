-- Enregistrement serveur atomique d'un profil et de son appareil.
-- L'UUID d'appareil est la clé naturelle d'idempotence et ne change jamais
-- de propriétaire.

-- La route serveur est désormais l'unique chemin de création. Révoquer les
-- privilèges de colonnes est nécessaire : un REVOKE au niveau table ne retire
-- pas à lui seul les GRANT de colonnes existants.
revoke insert on public.profiles from authenticated;
revoke insert (user_id) on public.profiles from authenticated;
revoke insert on public.devices from authenticated;
revoke insert (id, platform, app_version) on public.devices from authenticated;

drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists devices_insert_own on public.devices;

grant insert (user_id) on public.profiles to service_role;
grant insert (id, user_id, platform, app_version)
on public.devices to service_role;

create function public.register_device_v1(
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

  insert into public.devices (id, user_id, platform, app_version)
  values (p_device_id, p_user_id, p_platform, p_app_version)
  on conflict (id) do nothing;

  select device.*
  into strict v_device
  from public.devices as device
  where device.id = p_device_id
  for update;

  -- Un UUID d'installation ne peut être ni transféré vers un autre compte,
  -- ni réinterprété comme une autre plateforme. La version enregistrée reste
  -- celle de la création, ce qui rend les rejeux strictement stables.
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
  'Crée atomiquement le profil et un appareil immuable, via le serveur uniquement.';
