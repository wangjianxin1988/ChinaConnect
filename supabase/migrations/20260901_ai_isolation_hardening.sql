-- ============================================================
-- 20260901: AI data-isolation hardening (deep audit round 2)
--
-- Confirmed live vulnerabilities fixed here:
--  1) user_dashboard view still returned every user's row (profiles is
--     intentionally public, so all rows passed the invoker RLS). Now the
--     view itself filters to auth.uid() — anonymous/sibling users get
--     zero rows, the owner still sees their full dashboard.
--  2) ai_conversation_snapshots INSERT checked only user_id, so user B
--     could insert a snapshot row referencing user A's conversation_id.
--     The SECURITY DEFINER trigger update_snapshot_latest_flag() then
--     flipped A's is_latest flag (confirmed: A's snapshot went true->false).
--  3) ai_routes INSERT/UPDATE checked only user_id, so user B could insert
--     a route referencing user A's conversation_id; the SECURITY DEFINER
--     trigger mark_conversation_route_saved() then set A's conversation to
--     is_route_saved=true + route_id=B's route (confirmed live).
--  4) Both triggers were SECURITY DEFINER and keyed only on conversation_id;
--     hardened to also require NEW.user_id so they can never touch another
--     user's rows even if a future policy change weakens the guard.
--  5) order_summary view (unused but exposed via PostgREST) had no
--     security_invoker and no owner filter — hardened the same way.
-- ============================================================

-- ---------- 1) user_dashboard: owner-only rows ----------
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
LEFT JOIN public.membership_tiers mt ON mt.id = um.tier_id
WHERE p.user_id = auth.uid();

ALTER VIEW public.user_dashboard SET (security_invoker = true);

-- ---------- 2) order_summary: owner-only rows + invoker RLS ----------
DROP VIEW IF EXISTS public.order_summary;

CREATE OR REPLACE VIEW public.order_summary AS
SELECT
    o.id,
    o.user_id,
    o.order_number,
    o.order_type,
    o.amount,
    o.final_amount,
    o.currency,
    o.status,
    o.payment_method,
    o.paid_at,
    o.completed_at,
    mt.name AS tier_name,
    o.billing_cycle,
    p.display_name AS user_display_name,
    p.avatar_url AS user_avatar,
    o.created_at
FROM orders o
LEFT JOIN membership_tiers mt ON mt.id = o.tier_id
LEFT JOIN profiles p ON p.user_id = o.user_id
WHERE o.user_id = auth.uid()
ORDER BY o.created_at DESC;

ALTER VIEW public.order_summary SET (security_invoker = true);

-- ---------- 3) ai_routes: conversation must belong to the user ----------
DROP POLICY IF EXISTS "Users can create their own routes" ON public.ai_routes;
CREATE POLICY "Users can create their own routes"
    ON public.ai_routes FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND (
            conversation_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.ai_conversations c
                WHERE c.id = conversation_id AND c.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Users can update their own routes" ON public.ai_routes;
CREATE POLICY "Users can update their own routes"
    ON public.ai_routes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND (
            conversation_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.ai_conversations c
                WHERE c.id = conversation_id AND c.user_id = auth.uid()
            )
        )
    );

-- ---------- 4) ai_conversation_snapshots: conversation must belong to the user ----------
DROP POLICY IF EXISTS "Users can create their own snapshots" ON public.ai_conversation_snapshots;
CREATE POLICY "Users can create their own snapshots"
    ON public.ai_conversation_snapshots FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.ai_conversations c
            WHERE c.id = conversation_id AND c.user_id = auth.uid()
        )
    );

-- ---------- 5) Harden SECURITY DEFINER triggers to the row's own user ----------
CREATE OR REPLACE FUNCTION public.update_snapshot_latest_flag()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.ai_conversation_snapshots
    SET is_latest = false
    WHERE conversation_id = NEW.conversation_id
      AND user_id = NEW.user_id
      AND id != NEW.id
      AND is_latest = true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.mark_conversation_route_saved()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.conversation_id IS NOT NULL THEN
        UPDATE public.ai_conversations
        SET is_route_saved = true,
            route_id = NEW.id
        WHERE id = NEW.conversation_id
          AND user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
