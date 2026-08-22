-- ============================================================
-- 20260831: user_dashboard — enforce RLS via security_invoker.
-- Without security_invoker the view runs with the owner's privileges
-- and bypasses RLS on profiles/wallets/ai_usage/ai_routes/bookmarks,
-- letting any authenticated user read every user's wallet balance,
-- AI usage, membership and counts. With security_invoker the caller's
-- RLS applies to the underlying tables, so cross-user reads return
-- NULL for owner-only columns.
-- ============================================================

ALTER VIEW public.user_dashboard SET (security_invoker = true);

-- Ensure authenticated users can still read the underlying tables the view
-- joins (RLS on each table already restricts rows to the owner, except the
-- intentionally-public profiles).
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.wallets TO authenticated;
GRANT SELECT ON public.user_memberships TO authenticated;
GRANT SELECT ON public.membership_tiers TO authenticated;
GRANT SELECT ON public.ai_usage TO authenticated;
GRANT SELECT ON public.ai_usage_daily TO authenticated;
GRANT SELECT ON public.ai_routes TO authenticated;
GRANT SELECT ON public.bookmarks TO authenticated;
GRANT SELECT ON public.ai_conversations TO authenticated;
