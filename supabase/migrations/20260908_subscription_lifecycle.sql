-- ============================================================
-- 2026-08: Subscription lifecycle hardening
--  1) Drop UNIQUE(user_id, status) so users can have a full history of
--     cancelled/superseded memberships (partial unique index on 'active'
--     still guarantees at most ONE active membership per user).
--  2) Add 'superseded' status (old plan after an upgrade / billing switch).
--  3) Treat EXPIRED memberships as inactive in usage/membership RPCs so a
--     user whose plan lapsed is correctly downgraded to Free and can buy.
--  4) Index metadata subscription_id for fast webhook lookups.
-- ============================================================

ALTER TABLE public.user_memberships
    DROP CONSTRAINT IF EXISTS user_memberships_user_id_status_key;

ALTER TABLE public.user_memberships
    DROP CONSTRAINT IF EXISTS user_memberships_status_check;

ALTER TABLE public.user_memberships
    ADD CONSTRAINT user_memberships_status_check
    CHECK (status IN ('active', 'expired', 'cancelled', 'suspended', 'pending_payment', 'superseded'));

CREATE INDEX IF NOT EXISTS idx_user_memberships_subscription_meta
    ON public.user_memberships ((metadata ->> 'subscription_id'))
    WHERE metadata ->> 'subscription_id' IS NOT NULL;

-- ---------- get_user_ai_usage: expired memberships are not active ----------
CREATE OR REPLACE FUNCTION public.get_user_ai_usage(p_user_id UUID)
RETURNS TABLE (
    request_count INTEGER,
    period_yyyymm TEXT,
    period_reset_at TIMESTAMPTZ,
    tier_slug TEXT,
    max_requests INTEGER
) AS $$
DECLARE
    v_period TEXT;
    v_reset_at TIMESTAMPTZ;
    v_count INTEGER;
    v_tier TEXT;
    v_max INTEGER;
BEGIN
    IF NOT public.is_self_or_service(p_user_id) THEN
        RAISE EXCEPTION 'permission denied';
    END IF;

    -- Compute current period: YYYYMM in UTC
    v_period := to_char(NOW() AT TIME ZONE 'UTC', 'YYYYMM');
    -- Reset at first day of next month 00:00 UTC
    v_reset_at := date_trunc('month', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 month';

    -- Try to read existing row for current period
    SELECT au.request_count, au.tier_slug
      INTO v_count, v_tier
      FROM public.ai_usage au
     WHERE au.user_id = p_user_id
       AND au.period_yyyymm = v_period;

    IF NOT FOUND THEN
        -- Auto-create row at zero
        v_count := 0;
        v_tier := 'free';
        INSERT INTO public.ai_usage (user_id, period_yyyymm, request_count, period_reset_at, tier_slug)
        VALUES (p_user_id, v_period, 0, v_reset_at, v_tier)
        ON CONFLICT ON CONSTRAINT ai_usage_user_id_period_yyyymm_key DO NOTHING;
    END IF;

    -- Membership is the source of truth for the tier. Prefer the latest
    -- active, non-expired membership so grants/upgrades apply immediately
    -- and lapsed memberships correctly fall back to Free.
    v_tier := COALESCE(
        (
            SELECT mt.slug
              FROM public.user_memberships um
              JOIN public.membership_tiers mt ON mt.id = um.tier_id
             WHERE um.user_id = p_user_id
               AND um.status = 'active'
               AND (um.expires_at IS NULL OR um.expires_at > NOW())
             ORDER BY um.created_at DESC
             LIMIT 1
        ),
        v_tier,
        'free'
    );

    -- Self-heal the cached row so it matches membership.
    UPDATE public.ai_usage AS au
       SET tier_slug = v_tier,
           updated_at = NOW()
     WHERE au.user_id = p_user_id
       AND au.period_yyyymm = v_period
       AND au.tier_slug IS DISTINCT FROM v_tier;

    -- Resolve max for tier
    v_max := CASE v_tier
        WHEN 'free' THEN 5
        WHEN 'explorer' THEN 20
        WHEN 'traveler' THEN 40
        WHEN 'pro' THEN 40
        WHEN 'business' THEN -1
        WHEN 'enterprise' THEN -1
        ELSE 5
    END;

    RETURN QUERY SELECT v_count AS request_count, v_period AS period_yyyymm, v_reset_at AS period_reset_at, v_tier AS tier_slug, v_max AS max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_user_ai_usage(UUID) TO anon, authenticated;

-- ---------- get_user_membership: expired memberships are not active ----------
CREATE OR REPLACE FUNCTION public.get_user_membership(p_user_id UUID)
RETURNS TABLE (
    tier_name TEXT,
    tier_slug TEXT,
    ai_daily_limit INT,
    ai_monthly_limit INT,
    ai_used_today INT,
    ai_used_month INT,
    max_saved_routes INT,
    max_favorites INT,
    features JSONB,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN,
    started_at TIMESTAMPTZ,
    billing_cycle TEXT,
    next_charge_at TIMESTAMPTZ
) AS $$
DECLARE
    v_started_at TIMESTAMPTZ;
    v_cycle TEXT;
BEGIN
    IF NOT public.is_self_or_service(p_user_id) THEN
        RAISE EXCEPTION 'permission denied';
    END IF;

    SELECT um.started_at, um.billing_cycle
      INTO v_started_at, v_cycle
      FROM public.user_memberships um
     WHERE um.user_id = p_user_id
       AND um.status = 'active'
       AND (um.expires_at IS NULL OR um.expires_at > NOW())
     ORDER BY um.created_at DESC
     LIMIT 1;

    RETURN QUERY
    SELECT
        mt.name,
        mt.slug,
        mt.ai_requests_daily,
        mt.ai_requests_monthly,
        COALESCE(um.ai_requests_used_today, 0),
        COALESCE(um.ai_requests_used_month, 0),
        mt.max_saved_routes,
        mt.max_favorites,
        mt.features,
        um.expires_at,
        COALESCE((um.status = 'active' AND (um.expires_at IS NULL OR um.expires_at > NOW())), false)::boolean,
        v_started_at,
        v_cycle,
        CASE v_cycle
            WHEN 'monthly' THEN v_started_at + INTERVAL '1 month'
            WHEN 'yearly' THEN v_started_at + INTERVAL '1 year'
            ELSE NULL
        END
    FROM public.membership_tiers mt
    LEFT JOIN public.user_memberships um ON um.tier_id = mt.id AND um.user_id = p_user_id
    WHERE mt.slug = COALESCE(
        (SELECT mt2.slug FROM public.user_memberships um2
          JOIN public.membership_tiers mt2 ON mt2.id = um2.tier_id
         WHERE um2.user_id = p_user_id
           AND um2.status = 'active'
           AND (um2.expires_at IS NULL OR um2.expires_at > NOW())
         ORDER BY um2.created_at DESC
         LIMIT 1),
        'free'
    )
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_user_membership(UUID) TO anon, authenticated;
