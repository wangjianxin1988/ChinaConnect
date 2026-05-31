-- ============================================================
-- ChinaConnect User Membership System
-- Supabase PostgreSQL Migration
-- Version: 2.0.0
-- Date: 2026-05-31
-- Description: Membership tiers, wallet, orders, AI routes,
--              favorites, auto-save, and enhanced profiles
-- ============================================================
--
-- Dependencies: Requires 20260526000000_chinaconnect_schema.sql
-- Tables enhanced: profiles, ai_conversations, bookmarks
-- Tables created: membership_tiers, user_memberships, wallets,
--                 wallet_transactions, orders, ai_routes,
--                 ai_conversation_snapshots
-- ============================================================

-- ============================================================
-- MEMBERSHIP TIERS TABLE
-- Defines available membership tiers with limits
-- ============================================================
CREATE TABLE IF NOT EXISTS membership_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    name TEXT NOT NULL UNIQUE,                         -- 'Free', 'Pro', 'Enterprise'
    slug TEXT NOT NULL UNIQUE,                         -- 'free', 'pro', 'enterprise'
    description TEXT,
    description_zh TEXT,

    -- Pricing (0 = free)
    price_monthly DECIMAL(10, 2) DEFAULT 0 CHECK (price_monthly >= 0),
    price_yearly DECIMAL(10, 2) DEFAULT 0 CHECK (price_yearly >= 0),
    currency TEXT DEFAULT 'CNY',

    -- AI request limits
    ai_requests_daily INTEGER DEFAULT 10 CHECK (ai_requests_daily >= -1),
    ai_requests_monthly INTEGER DEFAULT 200 CHECK (ai_requests_monthly >= -1),

    -- Storage limits
    max_saved_routes INTEGER DEFAULT 5 CHECK (max_saved_routes >= -1),
    max_conversations INTEGER DEFAULT 20 CHECK (max_conversations >= -1),
    max_favorites INTEGER DEFAULT 50 CHECK (max_favorites >= -1),

    -- Feature flags
    features JSONB DEFAULT '{
        "route_export": false,
        "priority_support": false,
        "advanced_ai_model": false,
        "group_planning": false,
        "offline_access": false
    }'::jsonb,

    -- Display
    display_order INTEGER DEFAULT 0,
    badge_color TEXT,                                  -- hex color for UI
    icon TEXT,                                         -- icon name/emoji
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER MEMBERSHIPS TABLE
-- Tracks each user's current and historical membership
-- ============================================================
CREATE TABLE IF NOT EXISTS user_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES membership_tiers(id),

    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended', 'pending_payment')),

    -- Billing period
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime', 'trial')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,                            -- NULL for lifetime
    cancelled_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT true,

    -- Payment reference
    order_id UUID,                                     -- will FK to orders after orders table created

    -- Usage tracking (reset on period boundary)
    ai_requests_used_today INTEGER DEFAULT 0 CHECK (ai_requests_used_today >= 0),
    ai_requests_used_month INTEGER DEFAULT 0 CHECK (ai_requests_used_month >= 0),
    daily_reset_at DATE DEFAULT CURRENT_DATE,
    monthly_reset_at DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)::DATE,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Only one active membership per user
    UNIQUE (user_id, status) -- partial unique handled via index below
);

-- Partial unique index: only one ACTIVE membership per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_memberships_one_active
    ON user_memberships(user_id)
    WHERE status = 'active';

-- ============================================================
-- WALLETS TABLE
-- Each user has one wallet for balance tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    balance DECIMAL(12, 2) DEFAULT 0 CHECK (balance >= 0),
    frozen_amount DECIMAL(12, 2) DEFAULT 0 CHECK (frozen_amount >= 0),
    currency TEXT DEFAULT 'CNY',

    -- Lifetime stats
    total_recharged DECIMAL(12, 2) DEFAULT 0 CHECK (total_recharged >= 0),
    total_consumed DECIMAL(12, 2) DEFAULT 0 CHECK (total_consumed >= 0),

    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WALLET TRANSACTIONS TABLE
-- All balance changes are recorded here (ledger)
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    type TEXT NOT NULL CHECK (type IN (
        'recharge',           -- User adds funds
        'consumption',        -- User spends funds (AI usage, etc.)
        'refund',            -- Refund from cancelled order
        'reward',            -- System reward/bonus
        'adjustment',        -- Admin manual adjustment
        'withdrawal'         -- User withdraws (if supported)
    )),

    amount DECIMAL(12, 2) NOT NULL,                   -- positive = credit, negative = debit
    balance_before DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,

    description TEXT,
    description_zh TEXT,

    -- Polymorphic reference to source
    reference_type TEXT CHECK (reference_type IN ('order', 'ai_usage', 'admin', 'reward', 'refund')),
    reference_id UUID,

    -- Payment provider details
    payment_channel TEXT,                              -- 'alipay', 'wechat_pay', 'stripe', etc.
    external_txn_id TEXT,                              -- Payment provider transaction ID

    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS TABLE
-- All orders: recharge, membership upgrade/renew
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Order type
    order_type TEXT NOT NULL CHECK (order_type IN (
        'recharge',                -- Wallet top-up
        'membership_upgrade',      -- Tier upgrade
        'membership_renew',        -- Tier renewal
        'membership_new'           -- First-time membership purchase
    )),

    -- Order number (human-readable)
    order_number TEXT UNIQUE NOT NULL,

    -- Amounts
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'CNY',
    discount_amount DECIMAL(12, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    final_amount DECIMAL(12, 2) NOT NULL CHECK (final_amount >= 0),

    -- For membership orders
    tier_id UUID REFERENCES membership_tiers(id),
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),

    -- Payment
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending',         -- Created, awaiting payment
        'paid',            -- Payment received
        'processing',      -- Being processed
        'completed',       -- Fully completed
        'failed',          -- Payment failed
        'cancelled',       -- User cancelled
        'refunded',        -- Refunded
        'partially_refunded'
    )),
    payment_method TEXT,                               -- 'alipay', 'wechat_pay', 'stripe', 'apple_pay'
    payment_provider TEXT,                             -- 'stripe', 'alipay_global', etc.
    external_order_id TEXT,                            -- Provider's order/payment ID
    paid_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Coupon / promo
    coupon_code TEXT,
    coupon_discount DECIMAL(10, 2) DEFAULT 0,

    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',                       -- Additional structured data
    ip_address TEXT,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Now add the FK from user_memberships.order_id to orders
ALTER TABLE user_memberships
    ADD CONSTRAINT fk_user_memberships_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- ============================================================
-- AI ROUTES TABLE
-- Saved/refined AI-generated travel routes
-- One route per conversation (the final refined version)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,

    -- Route metadata
    title TEXT NOT NULL,
    title_zh TEXT,
    summary TEXT,                                      -- Brief AI-generated summary
    summary_zh TEXT,

    -- Location context
    city_id UUID REFERENCES cities(id),
    city_ids UUID[] DEFAULT '{}',                      -- Multi-city routes
    start_date DATE,
    end_date DATE,
    days INTEGER CHECK (days > 0),

    -- The refined route content
    route_data JSONB NOT NULL DEFAULT '{
        "days": [],
        "total_estimated_cost": null,
        "transport_summary": [],
        "highlights": [],
        "tips": []
    }'::jsonb,

    -- Tags and categorization
    tags TEXT[] DEFAULT '{}',
    travel_style TEXT CHECK (travel_style IN ('budget', 'comfort', 'luxury', 'adventure', 'cultural', 'foodie', 'family')),

    -- Visibility
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'published', 'archived')),

    -- Engagement
    likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
    views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
    saves_count INTEGER DEFAULT 0 CHECK (saves_count >= 0),

    -- AI metadata
    ai_model TEXT,                                     -- Which model generated this
    ai_provider TEXT,                                  -- Which provider
    generation_tokens INTEGER,                         -- Tokens used for generation

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI CONVERSATION SNAPSHOTS TABLE
-- Periodic auto-saves to prevent data loss on crash/close
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_conversation_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Snapshot of all messages at this point
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Snapshot metadata
    snapshot_type TEXT DEFAULT 'auto' CHECK (snapshot_type IN ('auto', 'manual', 'crash_recovery', 'end_of_conversation')),
    message_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,

    -- Conversation state at snapshot time
    conversation_context JSONB DEFAULT '{}',

    -- Which snapshot is the latest/final
    is_latest BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXTEND EXISTING TABLES
-- ============================================================

-- Add membership-related fields to profiles
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS signup_source TEXT;         -- 'google', 'email', 'wechat', etc.

-- Add route-tracking fields to ai_conversations
ALTER TABLE ai_conversations
    ADD COLUMN IF NOT EXISTS route_id UUID REFERENCES ai_routes(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS is_route_saved BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_snapshot_at TIMESTAMPTZ;

-- Add conversation status constraint (only if not already present)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ai_conversations_status_check'
    ) THEN
        ALTER TABLE ai_conversations
            ADD CONSTRAINT ai_conversations_status_check
            CHECK (status IN ('active', 'completed', 'archived'));
    END IF;
END $$;

-- Extend bookmarks to support new favorite types
-- Drop existing constraint and add new one
ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_bookmark_type_check;
ALTER TABLE bookmarks
    ADD CONSTRAINT bookmarks_bookmark_type_check
    CHECK (bookmark_type IN (
        'attraction', 'restaurant', 'itinerary', 'post',  -- existing
        'city', 'food', 'app_info', 'route'                -- new
    ));

-- ============================================================
-- INDEXES
-- ============================================================

-- Membership tiers
CREATE INDEX IF NOT EXISTS idx_membership_tiers_slug ON membership_tiers(slug);
CREATE INDEX IF NOT EXISTS idx_membership_tiers_active ON membership_tiers(is_active, display_order) WHERE is_active = true;

-- User memberships
CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_tier_id ON user_memberships(tier_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);
CREATE INDEX IF NOT EXISTS idx_user_memberships_expires ON user_memberships(expires_at) WHERE expires_at IS NOT NULL;

-- Wallets
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- Wallet transactions
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_ref ON wallet_transactions(reference_type, reference_id);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_external ON orders(external_order_id) WHERE external_order_id IS NOT NULL;

-- AI routes
CREATE INDEX IF NOT EXISTS idx_ai_routes_user_id ON ai_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_routes_conversation_id ON ai_routes(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_routes_city_id ON ai_routes(city_id);
CREATE INDEX IF NOT EXISTS idx_ai_routes_public ON ai_routes(is_public, status) WHERE is_public = true AND status = 'published';
CREATE INDEX IF NOT EXISTS idx_ai_routes_created ON ai_routes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_routes_style ON ai_routes(travel_style);

-- AI conversation snapshots
CREATE INDEX IF NOT EXISTS idx_ai_snapshots_conversation ON ai_conversation_snapshots(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_snapshots_user ON ai_conversation_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_snapshots_latest ON ai_conversation_snapshots(conversation_id, is_latest) WHERE is_latest = true;
CREATE INDEX IF NOT EXISTS idx_ai_snapshots_created ON ai_conversation_snapshots(created_at DESC);

-- Profile extensions
CREATE INDEX IF NOT EXISTS idx_profiles_membership ON profiles(membership_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Membership tiers: public read, no direct write (admin only via service role)
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membership tiers are viewable by everyone"
    ON membership_tiers FOR SELECT
    USING (is_active = true);

-- User memberships: users can view their own
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memberships"
    ON user_memberships FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert memberships"
    ON user_memberships FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships"
    ON user_memberships FOR UPDATE
    USING (auth.uid() = user_id);

-- Wallets: users can view their own
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet"
    ON wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can update wallets"
    ON wallets FOR UPDATE
    USING (auth.uid() = user_id);

-- Wallet transactions: users can view their own
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
    ON wallet_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
    ON wallet_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Orders: users can view and create their own
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
    ON orders FOR UPDATE
    USING (auth.uid() = user_id);

-- AI routes: users can view their own + public routes
ALTER TABLE ai_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own routes"
    ON ai_routes FOR SELECT
    USING (auth.uid() = user_id OR (is_public = true AND status = 'published'));

CREATE POLICY "Users can create their own routes"
    ON ai_routes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes"
    ON ai_routes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes"
    ON ai_routes FOR DELETE
    USING (auth.uid() = user_id);

-- AI conversation snapshots: users can view/manage their own
ALTER TABLE ai_conversation_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own snapshots"
    ON ai_conversation_snapshots FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own snapshots"
    ON ai_conversation_snapshots FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snapshots"
    ON ai_conversation_snapshots FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================

-- Auto-create profile AND wallet on user signup
-- Replaces the existing handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_wallet_id UUID;
    free_tier_id UUID;
    display_name_val TEXT;
    avatar_url_val TEXT;
    provider_val TEXT;
BEGIN
    -- Extract metadata
    display_name_val := COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    avatar_url_val := NEW.raw_user_meta_data->>'avatar_url';
    provider_val := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');

    -- Create profile
    INSERT INTO profiles (user_id, display_name, avatar_url, membership_tier, signup_source)
    VALUES (NEW.id, display_name_val, avatar_url_val, 'free', provider_val);

    -- Create wallet
    INSERT INTO wallets (user_id, balance, currency)
    VALUES (NEW.id, 0, 'CNY')
    RETURNING id INTO new_wallet_id;

    -- Assign free tier membership
    SELECT id INTO free_tier_id FROM membership_tiers WHERE slug = 'free' LIMIT 1;
    IF free_tier_id IS NOT NULL THEN
        INSERT INTO user_memberships (user_id, tier_id, status, billing_cycle)
        VALUES (NEW.id, free_tier_id, 'active', 'lifetime');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger (drop first to replace)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger for new tables
CREATE TRIGGER update_membership_tiers_updated_at
    BEFORE UPDATE ON membership_tiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_memberships_updated_at
    BEFORE UPDATE ON user_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ai_routes_updated_at
    BEFORE UPDATE ON ai_routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCTION: Check AI request limits
-- Returns true if user has remaining AI requests
-- ============================================================
CREATE OR REPLACE FUNCTION check_ai_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_tier_slug TEXT;
    v_daily_limit INT;
    v_monthly_limit INT;
    v_used_today INT;
    v_used_month INT;
    v_daily_reset DATE;
    v_monthly_reset DATE;
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Increment AI usage counter
-- ============================================================
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE user_memberships
    SET ai_requests_used_today = ai_requests_used_today + 1,
        ai_requests_used_month = ai_requests_used_month + 1
    WHERE user_id = p_user_id AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Get user membership info
-- Returns tier details, limits, and usage
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_membership(p_user_id UUID)
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
    is_active BOOLEAN
) AS $$
BEGIN
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
        (um.status = 'active') AS is_active
    FROM membership_tiers mt
    LEFT JOIN user_memberships um ON um.tier_id = mt.id AND um.user_id = p_user_id
    WHERE mt.slug = COALESCE(
        (SELECT mt2.slug FROM user_memberships um2
         JOIN membership_tiers mt2 ON mt2.id = um2.tier_id
         WHERE um2.user_id = p_user_id AND um2.status = 'active'
         LIMIT 1),
        'free'
    )
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Cleanup old auto-snapshots
-- Keeps only the latest N auto-snapshots per conversation
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_old_snapshots(p_keep_count INT DEFAULT 5)
RETURNS INT AS $$
DECLARE
    v_deleted INT;
BEGIN
    WITH ranked AS (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY conversation_id
                   ORDER BY created_at DESC
               ) AS rn
        FROM ai_conversation_snapshots
        WHERE snapshot_type = 'auto'
    )
    DELETE FROM ai_conversation_snapshots
    WHERE id IN (
        SELECT id FROM ranked WHERE rn > p_keep_count
    );

    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VIEW: User dashboard summary
-- ============================================================
CREATE OR REPLACE VIEW user_dashboard AS
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
    COALESCE(um.ai_requests_used_today, 0) AS ai_used_today,
    COALESCE(mt.ai_requests_monthly, 200) AS ai_monthly_limit,
    COALESCE(um.ai_requests_used_month, 0) AS ai_used_month,
    (SELECT COUNT(*) FROM ai_routes ar WHERE ar.user_id = p.user_id) AS saved_routes,
    (SELECT COUNT(*) FROM bookmarks b WHERE b.user_id = p.user_id) AS favorites_count,
    (SELECT COUNT(*) FROM ai_conversations ac WHERE ac.user_id = p.user_id) AS conversations_count,
    um.expires_at AS membership_expires_at,
    p.last_active_at
FROM profiles p
LEFT JOIN wallets w ON w.user_id = p.user_id
LEFT JOIN user_memberships um ON um.user_id = p.user_id AND um.status = 'active'
LEFT JOIN membership_tiers mt ON mt.id = um.tier_id;

-- ============================================================
-- VIEW: Order summary with user info
-- ============================================================
CREATE OR REPLACE VIEW order_summary AS
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
ORDER BY o.created_at DESC;

-- ============================================================
-- SEED DATA: Default membership tiers
-- ============================================================
INSERT INTO membership_tiers (name, slug, description, description_zh, price_monthly, price_yearly, ai_requests_daily, ai_requests_monthly, max_saved_routes, max_conversations, max_favorites, features, display_order, badge_color, icon) VALUES
(
    'Free',
    'free',
    'Basic access to ChinaConnect AI travel assistant',
    '基础版 - 基本使用ChinaConnect AI旅行助手',
    0, 0,
    10, 200,
    5, 20, 50,
    '{
        "route_export": false,
        "priority_support": false,
        "advanced_ai_model": false,
        "group_planning": false,
        "offline_access": false
    }'::jsonb,
    0, '#6B7280', '🆓'
),
(
    'Pro',
    'pro',
    'Enhanced AI travel planning with more requests and features',
    '专业版 - 更多AI请求和高级功能',
    29.00, 290.00,
    100, 3000,
    50, 200, 500,
    '{
        "route_export": true,
        "priority_support": false,
        "advanced_ai_model": true,
        "group_planning": true,
        "offline_access": false
    }'::jsonb,
    1, '#3B82F6', '⭐'
),
(
    'Enterprise',
    'enterprise',
    'Unlimited AI travel planning for travel agencies and groups',
    '企业版 - 无限AI旅行规划，适用于旅行社和团队',
    99.00, 990.00,
    -1, -1,
    -1, -1, -1,
    '{
        "route_export": true,
        "priority_support": true,
        "advanced_ai_model": true,
        "group_planning": true,
        "offline_access": true
    }'::jsonb,
    2, '#8B5CF6', '💎'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- TRIGGER: Auto-update profile membership_tier
-- Keeps profiles.membership_tier in sync with active membership
-- ============================================================
CREATE OR REPLACE FUNCTION sync_profile_membership_tier()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
        UPDATE profiles
        SET membership_tier = (
            SELECT slug FROM membership_tiers WHERE id = NEW.tier_id
        )
        WHERE user_id = NEW.user_id;
    ELSIF NEW.status IN ('expired', 'cancelled') THEN
        -- Check if there's another active membership
        IF NOT EXISTS (
            SELECT 1 FROM user_memberships
            WHERE user_id = NEW.user_id AND status = 'active' AND id != NEW.id
        ) THEN
            UPDATE profiles SET membership_tier = 'free' WHERE user_id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_membership_on_change
    AFTER INSERT OR UPDATE ON user_memberships
    FOR EACH ROW EXECUTE FUNCTION sync_profile_membership_tier();

-- ============================================================
-- TRIGGER: Sync wallet balance to profile
-- ============================================================
CREATE OR REPLACE FUNCTION sync_profile_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET wallet_balance = NEW.balance
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_wallet_balance_to_profile
    AFTER UPDATE OF balance ON wallets
    FOR EACH ROW EXECUTE FUNCTION sync_profile_wallet_balance();

-- ============================================================
-- TRIGGER: Update ai_conversations.is_route_saved when route created
-- ============================================================
CREATE OR REPLACE FUNCTION mark_conversation_route_saved()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.conversation_id IS NOT NULL THEN
        UPDATE ai_conversations
        SET is_route_saved = true,
            route_id = NEW.id
        WHERE id = NEW.conversation_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_route_created
    AFTER INSERT ON ai_routes
    FOR EACH ROW EXECUTE FUNCTION mark_conversation_route_saved();

-- ============================================================
-- TRIGGER: Mark old snapshots as not latest when new one inserted
-- ============================================================
CREATE OR REPLACE FUNCTION update_snapshot_latest_flag()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ai_conversation_snapshots
    SET is_latest = false
    WHERE conversation_id = NEW.conversation_id
      AND id != NEW.id
      AND is_latest = true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_snapshot_insert
    AFTER INSERT ON ai_conversation_snapshots
    FOR EACH ROW EXECUTE FUNCTION update_snapshot_latest_flag();

-- ============================================================
-- COMMENTS (for documentation)
-- ============================================================
COMMENT ON TABLE membership_tiers IS 'Defines available membership tiers with pricing and feature limits';
COMMENT ON TABLE user_memberships IS 'Tracks each user''s current and historical membership subscriptions';
COMMENT ON TABLE wallets IS 'User wallet for balance tracking, one wallet per user';
COMMENT ON TABLE wallet_transactions IS 'Ledger of all wallet balance changes (credits and debits)';
COMMENT ON TABLE orders IS 'All orders: recharge, membership upgrade/renew with payment tracking';
COMMENT ON TABLE ai_routes IS 'Saved/refined AI-generated travel routes, one final version per conversation';
COMMENT ON TABLE ai_conversation_snapshots IS 'Periodic auto-saves of conversation state to prevent data loss';

COMMENT ON FUNCTION check_ai_limit(UUID) IS 'Checks if user has remaining AI requests for today/month';
COMMENT ON FUNCTION increment_ai_usage(UUID) IS 'Increments AI request usage counters for the user';
COMMENT ON FUNCTION get_user_membership(UUID) IS 'Returns full membership info including tier, limits, and usage';
COMMENT ON FUNCTION cleanup_old_snapshots(INT) IS 'Removes old auto-snapshots, keeping latest N per conversation';
COMMENT ON VIEW user_dashboard IS 'Aggregated user dashboard view with membership, wallet, and usage stats';
