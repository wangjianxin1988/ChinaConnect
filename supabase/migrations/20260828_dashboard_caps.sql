-- ============================================================
-- 20260828: user_dashboard — expose real tier caps
-- Account page usage bars should reflect the active membership's
-- max_saved_routes / max_favorites instead of hardcoded 5/50.
-- ============================================================

DROP VIEW IF EXISTS public.user_dashboard;

CREATE OR REPLACE VIEW public.user_dashboard AS
SELECT
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.membership_tier,
    p.points,
    p.travel_level,
    COALESCE(w.balance, 0) AS wallet_balance,
    COALESCE(mt.name, 'Free') AS tier_name,
    COALESCE(mt.slug, 'free') AS tier_slug,
    COALESCE(mt.ai_requests_daily, 10) AS ai_daily_limit,
    COALESCE((
        SELECT SUM(request_count)::INTEGER FROM public.ai_usage_daily d
        WHERE d.user_id = p.user_id AND d.usage_date = CURRENT_DATE
    ), 0) AS ai_used_today,
    COALESCE(mt.ai_requests_monthly, 200) AS ai_monthly_limit,
    COALESCE((
        SELECT request_count FROM public.ai_usage u
        WHERE u.user_id = p.user_id AND u.period_yyyymm = to_char(NOW() AT TIME ZONE 'UTC', 'YYYYMM')
    ), 0) AS ai_used_month,
    COALESCE(mt.max_saved_routes, 5) AS max_saved_routes,
    COALESCE(mt.max_favorites, 50) AS max_favorites,
    (SELECT COUNT(*) FROM public.ai_routes ar WHERE ar.user_id = p.user_id) AS saved_routes,
    (SELECT COUNT(*) FROM public.bookmarks b WHERE b.user_id = p.user_id) AS favorites_count,
    (SELECT COUNT(*) FROM public.ai_conversations ac WHERE ac.user_id = p.user_id) AS conversations_count,
    um.expires_at AS membership_expires_at,
    p.last_active_at
FROM public.profiles p
LEFT JOIN public.wallets w ON w.user_id = p.user_id
LEFT JOIN public.user_memberships um ON um.user_id = p.user_id AND um.status = 'active'
LEFT JOIN public.membership_tiers mt ON mt.id = um.tier_id;
