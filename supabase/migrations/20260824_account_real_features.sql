-- ============================================================
-- 20260824: Account real features (wallet, daily usage, billing)
-- 1) Auto-create wallets for every user + backfill existing users
-- 2) Daily AI usage table + RPC + daily bump inside increment_ai_usage
-- 3) get_user_membership: add started_at / billing_cycle / next_charge_at
-- 4) user_dashboard: real ai_used_today / ai_used_month from usage tables
-- ============================================================

-- ---------- 1) Wallet auto-creation ----------
CREATE OR REPLACE FUNCTION public.ensure_user_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.wallets (user_id, balance, frozen_amount, currency, total_recharged, total_consumed, status)
    VALUES (NEW.id, 0, 0, 'CNY', 0, 0, 'active')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.ensure_user_wallet();

INSERT INTO public.wallets (user_id, balance, frozen_amount, currency, total_recharged, total_consumed, status)
SELECT u.id, 0, 0, 'CNY', 0, 0, 'active'
FROM auth.users u
LEFT JOIN public.wallets w ON w.user_id = u.id
WHERE w.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ---------- 2) Daily AI usage ----------
CREATE TABLE IF NOT EXISTS public.ai_usage_daily (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    request_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, usage_date)
);

ALTER TABLE public.ai_usage_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own daily usage" ON public.ai_usage_daily;
CREATE POLICY "Users can view their own daily usage" ON public.ai_usage_daily
    FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.get_user_ai_usage_daily(p_user_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE (usage_date DATE, request_count INTEGER)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT (CURRENT_DATE - n.n)::date AS usage_date,
           COALESCE(u.request_count, 0)::INTEGER
    FROM generate_series(0, GREATEST(0, p_days - 1)) AS n
    LEFT JOIN public.ai_usage_daily u ON u.user_id = p_user_id AND u.usage_date = CURRENT_DATE - n.n
    ORDER BY usage_date;
END;
$$;

GRANT SELECT ON public.ai_usage_daily TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_ai_usage_daily(UUID, INTEGER) TO anon, authenticated;

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

-- ---------- 3) Membership with billing info ----------
-- Change return type: drop then recreate
DROP FUNCTION IF EXISTS public.get_user_membership(UUID);

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

-- ---------- 4) user_dashboard with real usage ----------
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
    (SELECT COUNT(*) FROM public.ai_routes ar WHERE ar.user_id = p.user_id) AS saved_routes,
    (SELECT COUNT(*) FROM public.bookmarks b WHERE b.user_id = p.user_id) AS favorites_count,
    (SELECT COUNT(*) FROM public.ai_conversations ac WHERE ac.user_id = p.user_id) AS conversations_count,
    um.expires_at AS membership_expires_at,
    p.last_active_at
FROM public.profiles p
LEFT JOIN public.wallets w ON w.user_id = p.user_id
LEFT JOIN public.user_memberships um ON um.user_id = p.user_id AND um.status = 'active'
LEFT JOIN public.membership_tiers mt ON mt.id = um.tier_id;
