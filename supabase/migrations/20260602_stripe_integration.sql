-- ============================================================
-- Stripe Payment Integration Migration
-- Adds explorer/traveler/business tiers and Stripe metadata
-- Version: 2.1.0
-- Date: 2026-06-02
-- ============================================================

-- Add explorer, traveler, business tiers if they don't exist
-- These map to the frontend tier names
INSERT INTO membership_tiers (name, slug, description, description_zh, price_monthly, price_yearly, ai_requests_daily, ai_requests_monthly, max_saved_routes, max_conversations, max_favorites, features, display_order, badge_color, icon) VALUES
(
    'Explorer',
    'explorer',
    'More requests and save your itineraries',
    '探索版 - 更多请求次数并保存行程',
    4.99, 47.99,
    50, 500,
    20, 100, 200,
    '{
        "route_export": false,
        "priority_support": true,
        "advanced_ai_model": false,
        "group_planning": false,
        "offline_access": false
    }'::jsonb,
    1, '#3B82F6', '🧭'
),
(
    'Traveler',
    'traveler',
    'Unlimited AI with premium features',
    '旅行版 - 无限AI请求及高级功能',
    9.99, 95.99,
    -1, -1,
    -1, -1, -1,
    '{
        "route_export": true,
        "priority_support": true,
        "advanced_ai_model": true,
        "group_planning": true,
        "offline_access": false
    }'::jsonb,
    2, '#8B5CF6', '✈️'
),
(
    'Business',
    'business',
    'Full access for travel professionals',
    '商务版 - 旅行专业人士的完整功能',
    19.99, 191.99,
    -1, -1,
    -1, -1, -1,
    '{
        "route_export": true,
        "priority_support": true,
        "advanced_ai_model": true,
        "group_planning": true,
        "offline_access": true
    }'::jsonb,
    3, '#F59E0B', '💼'
)
ON CONFLICT (slug) DO NOTHING;

-- Update existing Free tier pricing to USD if currently CNY
UPDATE membership_tiers 
SET currency = 'USD', price_monthly = 0, price_yearly = 0
WHERE slug = 'free' AND currency = 'CNY';

-- Update Pro tier to USD pricing
UPDATE membership_tiers 
SET currency = 'USD', price_monthly = 29.00, price_yearly = 290.00
WHERE slug = 'pro' AND currency = 'CNY';

-- Update Enterprise tier to USD pricing
UPDATE membership_tiers 
SET currency = 'USD', price_monthly = 99.00, price_yearly = 990.00
WHERE slug = 'enterprise' AND currency = 'CNY';

-- Ensure orders table has payment_provider column (may already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_provider'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_provider TEXT;
    END IF;
END $$;

-- Add Stripe-specific columns to orders if needed
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'external_order_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN external_order_id TEXT;
    END IF;
END $$;

-- Add index for Stripe webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_external_order_id 
    ON orders(external_order_id) WHERE external_order_id IS NOT NULL;

-- Add index for user membership lookups by Stripe subscription
CREATE INDEX IF NOT EXISTS idx_user_memberships_metadata_stripe 
    ON user_memberships USING gin (metadata) WHERE metadata ? 'stripe_subscription_id';

-- Ensure wallet exists for all users (upsert function)
CREATE OR REPLACE FUNCTION ensure_user_wallet(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_wallet_id UUID;
BEGIN
    -- Try to get existing wallet
    SELECT id INTO v_wallet_id FROM wallets WHERE user_id = p_user_id;
    
    IF v_wallet_id IS NULL THEN
        -- Create wallet if it doesn't exist
        INSERT INTO wallets (user_id, balance, currency, status)
        VALUES (p_user_id, 0, 'USD', 'active')
        RETURNING id INTO v_wallet_id;
    END IF;
    
    RETURN v_wallet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION ensure_user_wallet(UUID) IS 'Ensures a user has a wallet, creating one if needed';
