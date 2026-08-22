-- ============================================================
-- 20260824b: Fix get_user_ai_usage_daily (DATE return type + date gen)
-- The original 20260824 migration shipped with TIMESTAMPTZ in the
-- RETURNS TABLE but a DATE in the SELECT, causing PostgREST 42804.
-- Re-create with matching DATE types and correct date generation.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_ai_usage_daily(p_user_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE (usage_date DATE, request_count INTEGER)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
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
