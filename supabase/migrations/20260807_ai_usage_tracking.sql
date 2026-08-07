-- ============================================================
-- AI Usage Tracking Migration
-- Server-side monthly AI request counters (eliminates localStorage refresh bug)
-- Version: 3.0.0
-- Date: 2026-08-07
-- ============================================================

-- ============================================================
-- AI USAGE TABLE (per-user, per-period)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_yyyymm TEXT NOT NULL, -- e.g. '202608'
    request_count INTEGER NOT NULL DEFAULT 0,
    period_reset_at TIMESTAMPTZ NOT NULL,
    tier_slug TEXT NOT NULL DEFAULT 'free',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, period_yyyymm)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON public.ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_period ON public.ai_usage(period_yyyymm);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
    ON public.ai_usage FOR SELECT
    USING (auth.uid() = user_id);

-- No INSERT/UPDATE policy: writes happen via SECURITY DEFINER RPC only

-- ============================================================
-- RPC: get_user_ai_usage
-- Returns current period usage. Auto-creates row if missing.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_ai_usage(p_user_id UUID)
RETURNS TABLE (
    request_count INTEGER,
    period_yyyymm TEXT,
    period_reset_at TIMESTAMPTZ,
    tier_slug TEXT,
    max_requests INTEGER
) AS 
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
        ON CONFLICT (user_id, period_yyyymm) DO NOTHING;
    END IF;

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

    RETURN QUERY SELECT v_count, v_period, v_reset_at, v_tier, v_max;
END;
 LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: increment_ai_usage
-- Atomically increments counter AFTER checking tier limit.
-- Returns new count, max, and whether the request was allowed.
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_ai_usage(p_user_id UUID)
RETURNS TABLE (
    allowed BOOLEAN,
    request_count INTEGER,
    max_requests INTEGER,
    tier_slug TEXT
) AS 
DECLARE
    v_period TEXT;
    v_reset_at TIMESTAMPTZ;
    v_count INTEGER;
    v_tier TEXT;
    v_max INTEGER;
    v_allowed BOOLEAN;
BEGIN
    -- Read current usage (and resolve tier from existing row or membership)
    SELECT * INTO v_count, v_period, v_reset_at, v_tier, v_max
      FROM public.get_user_ai_usage(p_user_id);

    -- Lock this user's ai_usage row (or absence of one) for the current period
    -- so the read/modify/write of the counter is race-free across concurrent requests.
    PERFORM 1
      FROM public.ai_usage
     WHERE user_id = p_user_id
       AND period_yyyymm = v_period
     FOR UPDATE;

    -- Business/enterprise = unlimited
    IF v_max = -1 THEN
        v_allowed := TRUE;
        -- Still bump counter for analytics
        INSERT INTO public.ai_usage (user_id, period_yyyymm, request_count, period_reset_at, tier_slug)
        VALUES (p_user_id, v_period, 1, v_reset_at, v_tier)
        ON CONFLICT (user_id, period_yyyymm) DO UPDATE
            SET request_count = public.ai_usage.request_count + 1,
                updated_at = NOW();
        v_count := 1;
    ELSIF v_count < v_max THEN
        v_allowed := TRUE;
        INSERT INTO public.ai_usage (user_id, period_yyyymm, request_count, period_reset_at, tier_slug)
        VALUES (p_user_id, v_period, 1, v_reset_at, v_tier)
        ON CONFLICT (user_id, period_yyyymm) DO UPDATE
            SET request_count = public.ai_usage.request_count + 1,
                updated_at = NOW();
        v_count := v_count + 1;
    ELSE
        v_allowed := FALSE;
    END IF;

    RETURN QUERY SELECT v_allowed, v_count, v_max, v_tier;
END;
 LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: update_ai_usage_tier
-- Called when user upgrades/downgrades subscription
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_ai_usage_tier(p_user_id UUID, p_tier_slug TEXT)
RETURNS VOID AS 
DECLARE
    v_period TEXT;
    v_reset_at TIMESTAMPTZ;
BEGIN
    v_period := to_char(NOW() AT TIME ZONE 'UTC', 'YYYYMM');
    v_reset_at := date_trunc('month', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 month';

    INSERT INTO public.ai_usage (user_id, period_yyyymm, request_count, period_reset_at, tier_slug)
    VALUES (p_user_id, v_period, 0, v_reset_at, p_tier_slug)
    ON CONFLICT (user_id, period_yyyymm) DO UPDATE
        SET tier_slug = EXCLUDED.tier_slug,
            updated_at = NOW();
END;
 LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ai_conversations: add summary column for sidebar display
-- ============================================================
ALTER TABLE public.ai_conversations
    ADD COLUMN IF NOT EXISTS summary TEXT,
    ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_updated
    ON public.ai_conversations(user_id, updated_at DESC);

-- ============================================================
-- ai_messages: ensure required columns
-- ============================================================
ALTER TABLE public.ai_messages
    ADD COLUMN IF NOT EXISTS model TEXT,
    ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0;
