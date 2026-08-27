-- Hide sensitive/private columns of public.profiles from REST roles.
-- Supabase grants table-level SELECT to anon/authenticated by default, which
-- overrides column-level REVOKEs, so we revoke table-level SELECT and re-grant
-- only the columns that public features actually need (profile pages,
-- restaurant review authors, gamification). wallet_balance is read from the
-- dedicated wallets table (own-row RLS); preferences / signup_source /
-- onboarding_completed are internal fields. None of the hidden columns are
-- read by any frontend code path.
REVOKE SELECT ON public.profiles FROM anon, authenticated;

GRANT SELECT (
  id,
  user_id,
  display_name,
  avatar_url,
  bio,
  nationality,
  native_language,
  travel_level,
  points,
  badges,
  membership_tier,
  last_active_at,
  created_at,
  updated_at
) ON public.profiles TO anon, authenticated;

COMMENT ON TABLE public.profiles IS
  'User profiles. Sensitive columns (wallet_balance, preferences, signup_source, onboarding_completed) are NOT selectable by anon/authenticated; wallet balance lives in public.wallets.';
