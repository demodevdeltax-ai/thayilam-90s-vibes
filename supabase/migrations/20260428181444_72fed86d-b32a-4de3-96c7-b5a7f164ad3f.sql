create or replace function public.claim_admin_if_first()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_count int;
  uid uuid := auth.uid();
begin
  if uid is null then
    return false;
  end if;
  select count(*) into admin_count from public.user_roles where role = 'admin';
  if admin_count > 0 then
    return false;
  end if;
  -- Promote: remove customer role (if any), add admin
  delete from public.user_roles where user_id = uid;
  insert into public.user_roles (user_id, role) values (uid, 'admin');
  return true;
end;
$$;

revoke all on function public.claim_admin_if_first() from public;
grant execute on function public.claim_admin_if_first() to authenticated;