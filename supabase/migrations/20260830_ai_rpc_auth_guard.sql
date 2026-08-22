-- ============================================================
-- 20260830: RPC authorization guards for user-scoped functions.
-- Every user-scoped RPC must only be callable for the owner themselves
-- (auth.uid() = p_user_id) or by service_role (server-side calls).
-- Fixes cross-user data access via SECURITY DEFINER RPCs.
-- ============================================================

-- Helper: true for service_role (server-side) or the owner themselves.
CREATE OR REPLACE FUNCTION public.is_self_or_service(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT (auth.role() = 'service_role' OR (auth.uid() IS NOT NULL AND auth.uid() = p_user_id));
$$;

-- ---------- get_user_ai_usage ----------
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

    -- Membership is the source of truth for the tier.
    v_tier := COALESCE(
        (
            SELECT mt.slug
              FROM public.user_memberships um
              JOIN public.membership_tiers mt ON mt.id = um.tier_id
             WHERE um.user_id = p_user_id
               AND um.status = 'active'
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

-- ---------- get_user_ai_usage_daily ----------
CREATE OR REPLACE FUNCTION public.get_user_ai_usage_daily(p_user_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE (usage_date DATE, request_count INTEGER)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.is_self_or_service(p_user_id) THEN
        RAISE EXCEPTION 'permission denied';
    END IF;

    RETURN QUERY
    SELECT (CURRENT_DATE - n.n)::date AS usage_date,
           COALESCE(u.request_count, 0)::INTEGER AS request_count
    FROM generate_series(0, GREATEST(0, p_days - 1)) AS n
    LEFT JOIN public.ai_usage_daily u
           ON u.user_id = p_user_id AND u.usage_date = (CURRENT_DATE - n.n)::date
    ORDER BY usage_date;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_ai_usage_daily(UUID, INTEGER) TO anon, authenticated;

-- ---------- increment_ai_usage ----------
CREATE OR REPLACE FUNCTION public.increment_ai_usage(p_user_id UUID)
RETURNS TABLE (
    allowed BOOLEAN,
    request_count INTEGER,
    max_requests INTEGER,
    tier_slug TEXT
) AS $$
DECLARE
    v_period TEXT;
    v_reset_at TIMESTAMPTZ;
    v_count INTEGER;
    v_tier TEXT;
    v_max INTEGER;
    v_allowed BOOLEAN;
BEGIN
    IF NOT public.is_self_or_service(p_user_id) THEN
        RAISE EXCEPTION 'permission denied';
    END IF;

    SELECT * INTO v_count, v_period, v_reset_at, v_tier, v_max
      FROM public.get_user_ai_usage(p_user_id);

    PERFORM 1
      FROM public.ai_usage
     WHERE user_id = p_user_id
       AND period_yyyymm = v_period
     FOR UPDATE;

    IF v_max = -1 THEN
        v_allowed := TRUE;
        INSERT INTO public.ai_usage (user_id, period_yyyymm, request_count, period_reset_at, tier_slug)
        VALUES (p_user_id, v_period, 1, v_reset_at, v_tier)
        ON CONFLICT ON CONSTRAINT ai_usage_user_id_period_yyyymm_key DO UPDATE
            SET request_count = public.ai_usage.request_count + 1,
                updated_at = NOW();
        v_count := 1;
    ELSIF v_count < v_max THEN
        v_allowed := TRUE;
        INSERT INTO public.ai_usage (user_id, period_yyyymm, request_count, period_reset_at, tier_slug)
        VALUES (p_user_id, v_period, 1, v_reset_at, v_tier)
        ON CONFLICT ON CONSTRAINT ai_usage_user_id_period_yyyymm_key DO UPDATE
            SET request_count = public.ai_usage.request_count + 1,
                updated_at = NOW();
        v_count := v_count + 1;
    ELSE
        v_allowed := FALSE;
    END IF;

    IF v_allowed THEN
        INSERT INTO public.ai_usage_daily (user_id, usage_date, request_count)
        VALUES (p_user_id, CURRENT_DATE, 1)
        ON CONFLICT (user_id, usage_date) DO UPDATE
            SET request_count = public.ai_usage_daily.request_count + 1;
    END IF;

    RETURN QUERY SELECT v_allowed, v_count, v_max, v_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------- get_user_membership ----------
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
     WHERE um.user_id = p_user_id AND um.status = 'active'
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
        (um.status = 'active')::boolean,
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
         WHERE um2.user_id = p_user_id AND um2.status = 'active'
         LIMIT 1),
        'free'
    )
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------- update_ai_usage_tier (server-side only) ----------
CREATE OR REPLACE FUNCTION public.update_ai_usage_tier(p_user_id UUID, p_tier_slug TEXT)
RETURNS VOID AS $$
DECLARE
    v_period TEXT;
    v_reset_at TIMESTAMPTZ;
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'permission denied';
    END IF;

    v_period := to_char(NOW() AT TIME ZONE 'UTC', 'YYYYMM');
    v_reset_at := date_trunc('month', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 month';

    INSERT INTO public.ai_usage (user_id, period_yyyymm, request_count, period_reset_at, tier_slug)
    VALUES (p_user_id, v_period, 0, v_reset_at, p_tier_slug)
    ON CONFLICT ON CONSTRAINT ai_usage_user_id_period_yyyymm_key DO UPDATE
        SET tier_slug = EXCLUDED.tier_slug,
            updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
