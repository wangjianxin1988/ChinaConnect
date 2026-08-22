-- ============================================================
-- 20260905: check_ai_limit owner guard + revoke client execute
--
-- check_ai_limit(p_user_id) was SECURITY DEFINER with NO owner
-- check. Any authenticated user (or even anon) could call it for
-- any user_id: it leaks whether a target user is over their AI
-- limit AND can reset the target's user_memberships daily/monthly
-- counters when a period has rolled over. The function has no
-- client call sites (gatekeeping goes through increment_ai_usage),
-- so we add the is_self_or_service guard (consistent with the other
-- user-level AI RPCs) and revoke EXECUTE from anon/authenticated;
-- service_role / internal SQL remain able to call it.
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_ai_limit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    v_tier_slug TEXT;
    v_daily_limit INT;
    v_monthly_limit INT;
    v_used_today INT;
    v_used_month INT;
    v_daily_reset DATE;
    v_monthly_reset DATE;
BEGIN
    IF NOT public.is_self_or_service(p_user_id) THEN
        RAISE EXCEPTION 'permission denied';
    END IF;

    -- Get current membership
    SELECT mt.slug, mt.ai_requests_daily, mt.ai_requests_monthly,
           um.ai_requests_used_today, um.ai_requests_used_month,
           um.daily_reset_at, um.monthly_reset_at
    INTO v_tier_slug, v_daily_limit, v_monthly_limit,
         v_used_today, v_used_month,
         v_daily_reset, v_monthly_reset
    FROM user_memberships um
    JOIN membership_tiers mt ON mt.id = um.tier_id
    WHERE um.user_id = p_user_id AND um.status = 'active'
    LIMIT 1;

    -- Default to free tier if no membership found
    IF v_tier_slug IS NULL THEN
        SELECT ai_requests_daily, ai_requests_monthly
        INTO v_daily_limit, v_monthly_limit
        FROM membership_tiers WHERE slug = 'free' LIMIT 1;
        v_daily_limit := COALESCE(v_daily_limit, 10);
        v_monthly_limit := COALESCE(v_monthly_limit, 200);
        RETURN TRUE; -- Allow if no membership record
    END IF;

    -- Reset counters if period has rolled over
    IF v_daily_reset < CURRENT_DATE THEN
        UPDATE user_memberships
        SET ai_requests_used_today = 0, daily_reset_at = CURRENT_DATE
        WHERE user_id = p_user_id AND status = 'active';
        v_used_today := 0;
    END IF;

    IF v_monthly_reset < DATE_TRUNC('month', CURRENT_DATE)::DATE THEN
        UPDATE user_memberships
        SET ai_requests_used_month = 0, monthly_reset_at = DATE_TRUNC('month', CURRENT_DATE)::DATE
        WHERE user_id = p_user_id AND status = 'active';
        v_used_month := 0;
    END IF;

    -- Check limits (-1 = unlimited)
    IF v_daily_limit = -1 OR v_monthly_limit = -1 THEN
        RETURN TRUE;
    END IF;

    RETURN v_used_today < v_daily_limit AND v_used_month < v_monthly_limit;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.check_ai_limit(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_ai_limit(uuid) TO service_role;
