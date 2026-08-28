-- 20260910: Registration-page confirmation polling.
-- The signup page needs to detect (on ANY device) when the user has clicked the
-- email confirmation link so it can auto-login with the just-entered password or
-- prompt "email confirmed - please sign in". GoTrue has no public "is this email
-- confirmed" endpoint for anon clients, so expose a narrow security-definer RPC.
--
-- Security: a random per-signup `confirm_nonce` (sent in the signup user_metadata
-- and kept in the registering tab's sessionStorage) is REQUIRED. Without it the
-- function returns false, so anon callers cannot enumerate which email addresses
-- exist or are confirmed.

create or replace function public.check_email_confirmed(target_email text, nonce text)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  confirmed_at timestamptz;
begin
  if nonce is null or nonce = '' then
    return false;
  end if;
  select email_confirmed_at into confirmed_at
  from auth.users
  where lower(email) = lower(target_email)
    and raw_user_meta_data->>'confirm_nonce' = nonce
  limit 1;
  return confirmed_at is not null;
end;
$$;

revoke all on function public.check_email_confirmed(text, text) from public;
grant execute on function public.check_email_confirmed(text, text) to anon, authenticated;
