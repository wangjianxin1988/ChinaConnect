-- ============================================================
-- Make get_user_ai_usage resolve the tier from user_memberships
-- (authoritative source) so upgrades/downgrades take effect
-- immediately, even when the ai_usage row still holds a stale
-- tier_slug from a previous period/grant.
-- Also self-heal stale ai_usage.tier_slug rows on every read so
-- the cached value and the membership record never diverge.
-- ============================================================
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
    -- active membership so grants/upgrades apply immediately.
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

-- Ensure the business membership record exists for the AI test account so
-- both usage and membership views agree (admin grant parity with the main account).
INSERT INTO public.user_memberships (
    user_id, tier_id, status, billing_cycle, started_at, expires_at,
    cancelled_at, auto_renew, ai_requests_used_today, ai_requests_used_month,
    daily_reset_at, monthly_reset_at, metadata
)
SELECT
    u.id, t.id, 'active', 'lifetime', NOW(), NULL, NULL, FALSE, 0, 0,
    CURRENT_DATE, to_char(NOW(), 'YYYY-MM-01')::DATE, '{"note":"test account - unlimited AI (admin grant by Codex)"}'::JSONB
FROM auth.users u
JOIN membership_tiers t ON t.slug = 'business'
WHERE u.email = 'ai.codextest.1787386274959@example.com'
ON CONFLICT DO NOTHING;

-- Keep the denormalized profiles.membership_tier in sync for the two granted accounts.
UPDATE public.profiles
   SET membership_tier = 'business',
       updated_at = NOW()
 WHERE user_id IN (
     SELECT id FROM auth.users
     WHERE email IN ('237905750@qq.com', 'ai.codextest.1787386274959@example.com')
 );
