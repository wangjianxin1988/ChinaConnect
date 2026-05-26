-- ============================================================
-- ChinaConnect Database Schema
-- Supabase PostgreSQL
-- Version: 1.0.0
-- Description: Foreigners in China one-stop service platform
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    nationality TEXT,
    native_language TEXT DEFAULT 'en',
    travel_level INTEGER DEFAULT 1 CHECK (travel_level BETWEEN 1 AND 10),
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    badges TEXT[] DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CITIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    name_en TEXT NOT NULL,
    name_zh TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    country TEXT NOT NULL DEFAULT 'China',
    province TEXT,
    lat DECIMAL(10, 7) NOT NULL,
    lng DECIMAL(10, 7) NOT NULL,
    population INTEGER,
    timezone TEXT DEFAULT 'Asia/Shanghai',
    description TEXT,
    description_zh TEXT,
    cover_image_url TEXT,
    climate TEXT,
    best_season TEXT[],
    cost_level INTEGER DEFAULT 2 CHECK (cost_level BETWEEN 1 AND 5),
    airport_code TEXT,
    high_speed_rail_available BOOLEAN DEFAULT true,
    visa_offices JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ATTRACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS attractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_zh TEXT NOT NULL,
    slug TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('landmark', 'museum', 'park', 'temple', 'nature', 'shopping', 'entertainment', 'other')),
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7),
    address TEXT,
    address_zh TEXT,
    rating DECIMAL(3, 2) CHECK (rating BETWEEN 0 AND 5),
    review_count INTEGER DEFAULT 0,
    price_min DECIMAL(10, 2) DEFAULT 0,
    price_max DECIMAL(10, 2),
    currency TEXT DEFAULT 'CNY',
    opening_hours JSONB DEFAULT '{}',
    booking_required BOOLEAN DEFAULT false,
    crowd_level TEXT CHECK (crowd_level IN ('low', 'moderate', 'high', 'very_high')),
    best_time_to_visit TEXT,
    avg_visit_duration INTEGER DEFAULT 120,
    description TEXT,
    description_zh TEXT,
    images TEXT[],
    tags TEXT[],
    official_website TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (city_id, slug)
);

-- ============================================================
-- RESTAURANTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_zh TEXT NOT NULL,
    slug TEXT NOT NULL,
    cuisine TEXT NOT NULL,
    cuisine_zh TEXT,
    price_range INTEGER DEFAULT 2 CHECK (price_range BETWEEN 1 AND 5),
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7),
    address TEXT,
    address_zh TEXT,
    michelin_stars INTEGER DEFAULT 0 CHECK (michelin_stars BETWEEN 0 AND 3),
    heizhenzhu_rank INTEGER,
    blogger_recommended BOOLEAN DEFAULT false,
    rating DECIMAL(3, 2),
    review_count INTEGER DEFAULT 0,
    avg_cost DECIMAL(10, 2),
    opening_hours JSONB DEFAULT '{}',
    avg_meal_duration INTEGER DEFAULT 90,
    description TEXT,
    description_zh TEXT,
    images TEXT[],
    tags TEXT[],
    phone TEXT,
    booking_required BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (city_id, slug)
);

-- ============================================================
-- ITINERARIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_zh TEXT,
    description TEXT,
    cities UUID[] DEFAULT '{}',
    days INTEGER DEFAULT 1 CHECK (days BETWEEN 1 AND 90),
    budget_level INTEGER DEFAULT 2 CHECK (budget_level BETWEEN 1 AND 5),
    budget_currency TEXT DEFAULT 'CNY',
    estimated_total DECIMAL(12, 2),
    type TEXT DEFAULT 'custom' CHECK (type IN ('custom', 'ai_generated', 'official', 'community')),
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ITINERARY DAYS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS itinerary_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number > 0),
    city_id UUID REFERENCES cities(id),
    date DATE,
    theme TEXT,
    activities JSONB DEFAULT '[]',
    transport_notes TEXT,
    accommodation TEXT,
    estimated_cost DECIMAL(10, 2),
    tips TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (itinerary_id, day_number)
);

-- ============================================================
-- COMMUNITY POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    city_id UUID REFERENCES cities(id),
    type TEXT NOT NULL CHECK (type IN ('diary', 'tip', 'question', 'review', 'announcement')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    images TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- POST LIKES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (post_id, user_id)
);

-- ============================================================
-- CHECK-INS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    city_id UUID REFERENCES cities(id),
    attraction_id UUID REFERENCES attractions(id),
    restaurant_id UUID REFERENCES restaurants(id),
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7),
    photo_url TEXT,
    note TEXT,
    rating DECIMAL(2, 1) CHECK (rating BETWEEN 1 AND 5),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCAM REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS scam_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('taxi', 'market', 'restaurant', 'pickpocket', 'fake_product', 'scam_call', 'other')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    location_lat DECIMAL(10, 7),
    location_lng DECIMAL(10, 7),
    location_description TEXT,
    images TEXT[],
    is_verified BOOLEAN DEFAULT false,
    upvotes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMERGENCY INFO TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS emergency_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('police', 'hospital', 'ambulance', 'fire', 'embassy', 'tourist_police', 'other')),
    name TEXT NOT NULL,
    name_zh TEXT,
    phone TEXT NOT NULL,
    phone_international TEXT,
    address TEXT,
    address_zh TEXT,
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7),
    opening_hours TEXT,
    opening_hours_zh TEXT,
    services TEXT[],
    languages TEXT[],
    is_24h BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLOGGER RESTAURANTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS blogger_restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('douyin', 'bilibili', 'xiaohongshu', 'wechat', 'weibo', 'other')),
    platform_post_id TEXT,
    blogger_name TEXT NOT NULL,
    blogger_id TEXT,
    blogger_followers INTEGER DEFAULT 0,
    video_url TEXT,
    thumbnail_url TEXT,
    quote TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shared_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRICE REFERENCES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS price_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('food', 'transport', 'accommodation', 'attraction', 'shopping', 'service', 'other')),
    item_name TEXT NOT NULL,
    item_name_zh TEXT,
    local_price_min DECIMAL(10, 2),
    local_price_max DECIMAL(10, 2),
    tourist_price_min DECIMAL(10, 2),
    tourist_price_max DECIMAL(10, 2),
    currency TEXT DEFAULT 'CNY',
    unit TEXT,
    notes TEXT,
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BOOKMARKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bookmark_type TEXT NOT NULL CHECK (bookmark_type IN ('attraction', 'restaurant', 'itinerary', 'post')),
    reference_id UUID NOT NULL,
    note TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, bookmark_type, reference_id)
);

-- ============================================================
-- USER FOLLOWERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (follower_id, following_id)
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'system', 'achievement')),
    title TEXT NOT NULL,
    content TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI CONVERSATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    city_id UUID REFERENCES cities(id),
    title TEXT,
    context JSONB DEFAULT '{}',
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CITY METRICS TABLE (for analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS city_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_ins_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    searches_count INTEGER DEFAULT 0,
    avg_sentiment DECIMAL(3, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (city_id, date)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Cities
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country);
CREATE INDEX IF NOT EXISTS idx_cities_location ON cities(lat, lng);

-- Attractions
CREATE INDEX IF NOT EXISTS idx_attractions_city_id ON attractions(city_id);
CREATE INDEX IF NOT EXISTS idx_attractions_type ON attractions(type);
CREATE INDEX IF NOT EXISTS idx_attractions_rating ON attractions(rating DESC);
CREATE INDEX IF NOT EXISTS idx_attractions_location ON attractions(lat, lng);

-- Restaurants
CREATE INDEX IF NOT EXISTS idx_restaurants_city_id ON restaurants(city_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX IF NOT EXISTS idx_restaurants_price_range ON restaurants(price_range);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(lat, lng);
CREATE INDEX IF NOT EXISTS idx_restaurants_michelin ON restaurants(michelin_stars) WHERE michelin_stars > 0;

-- Itineraries
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_public ON itineraries(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_itineraries_type ON itineraries(type);
CREATE INDEX IF NOT EXISTS idx_itineraries_created ON itineraries(created_at DESC);

-- Itinerary days
CREATE INDEX IF NOT EXISTS idx_itinerary_days_itinerary_id ON itinerary_days(itinerary_id);

-- Community posts
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_city_id ON community_posts(city_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(type);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_featured ON community_posts(is_featured) WHERE is_featured = true;

-- Post comments
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

-- Post likes
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- Check-ins
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_city_id ON check_ins(city_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_created ON check_ins(created_at DESC);

-- Scam reports
CREATE INDEX IF NOT EXISTS idx_scam_reports_city_id ON scam_reports(city_id);
CREATE INDEX IF NOT EXISTS idx_scam_reports_type ON scam_reports(type);
CREATE INDEX IF NOT EXISTS idx_scam_reports_severity ON scam_reports(severity);
CREATE INDEX IF NOT EXISTS idx_scam_reports_status ON scam_reports(status);

-- Emergency info
CREATE INDEX IF NOT EXISTS idx_emergency_city_id ON emergency_info(city_id);
CREATE INDEX IF NOT EXISTS idx_emergency_type ON emergency_info(type);
CREATE INDEX IF NOT EXISTS idx_emergency_location ON emergency_info(lat, lng);

-- Blogger restaurants
CREATE INDEX IF NOT EXISTS idx_blogger_restaurants_restaurant_id ON blogger_restaurants(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_blogger_restaurants_city_id ON blogger_restaurants(city_id);
CREATE INDEX IF NOT EXISTS idx_blogger_restaurants_platform ON blogger_restaurants(platform);

-- Price references
CREATE INDEX IF NOT EXISTS idx_price_references_city_id ON price_references(city_id);
CREATE INDEX IF NOT EXISTS idx_price_references_item_type ON price_references(item_type);

-- Bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_type ON bookmarks(bookmark_type);

-- User follows
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- AI conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);

-- AI messages
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);

-- City metrics
CREATE INDEX IF NOT EXISTS idx_city_metrics_city_id ON city_metrics(city_id);
CREATE INDEX IF NOT EXISTS idx_city_metrics_date ON city_metrics(date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- Public tables (no RLS needed)
-- cities, attractions, restaurants, scam_reports, emergency_info, blogger_restaurants, price_references, city_metrics

-- ============================================================
-- PROFILES RLS
-- ============================================================

CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================
-- ITINERARIES RLS
-- ============================================================

CREATE POLICY "Users can view public itineraries"
    ON itineraries FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own itineraries"
    ON itineraries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own itineraries"
    ON itineraries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own itineraries"
    ON itineraries FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- ITINERARY DAYS RLS
-- ============================================================

CREATE POLICY "Users can view itinerary days of public or owned itineraries"
    ON itinerary_days FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM itineraries
            WHERE itineraries.id = itinerary_days.itinerary_id
            AND (itineraries.is_public = true OR itineraries.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert days for their own itineraries"
    ON itinerary_days FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM itineraries
            WHERE itineraries.id = itinerary_days.itinerary_id
            AND itineraries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update days for their own itineraries"
    ON itinerary_days FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM itineraries
            WHERE itineraries.id = itinerary_days.itinerary_id
            AND itineraries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete days for their own itineraries"
    ON itinerary_days FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM itineraries
            WHERE itineraries.id = itinerary_days.itinerary_id
            AND itineraries.user_id = auth.uid()
        )
    );

-- ============================================================
-- COMMUNITY POSTS RLS
-- ============================================================

CREATE POLICY "Posts are viewable by everyone"
    ON community_posts FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create posts"
    ON community_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
    ON community_posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
    ON community_posts FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- POST COMMENTS RLS
-- ============================================================

CREATE POLICY "Comments are viewable by everyone"
    ON post_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create comments"
    ON post_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON post_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON post_comments FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- POST LIKES RLS
-- ============================================================

CREATE POLICY "Likes are viewable by everyone"
    ON post_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can like posts"
    ON post_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
    ON post_likes FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- CHECK-INS RLS
-- ============================================================

CREATE POLICY "Public check-ins are viewable by everyone"
    ON check_ins FOR SELECT
    USING (visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own check-ins"
    ON check_ins FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins"
    ON check_ins FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own check-ins"
    ON check_ins FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- BOOKMARKS RLS
-- ============================================================

CREATE POLICY "Users can view their own bookmarks"
    ON bookmarks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookmarks"
    ON bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
    ON bookmarks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
    ON bookmarks FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- USER FOLLOWS RLS
-- ============================================================

CREATE POLICY "Follow relationships are viewable by everyone"
    ON user_follows FOR SELECT
    USING (true);

CREATE POLICY "Users can follow others"
    ON user_follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
    ON user_follows FOR DELETE
    USING (auth.uid() = follower_id);

-- ============================================================
-- NOTIFICATIONS RLS
-- ============================================================

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can mark their own notifications as read"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================
-- AI CONVERSATIONS RLS
-- ============================================================

CREATE POLICY "Users can view their own conversations"
    ON ai_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
    ON ai_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
    ON ai_conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
    ON ai_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- AI MESSAGES RLS
-- ============================================================

CREATE POLICY "Users can view messages from their own conversations"
    ON ai_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their own conversations"
    ON ai_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- ============================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cities_updated_at
    BEFORE UPDATE ON cities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_attractions_updated_at
    BEFORE UPDATE ON attractions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_itineraries_updated_at
    BEFORE UPDATE ON itineraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_itinerary_days_updated_at
    BEFORE UPDATE ON itinerary_days
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_post_comments_updated_at
    BEFORE UPDATE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_scam_reports_updated_at
    BEFORE UPDATE ON scam_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_emergency_info_updated_at
    BEFORE UPDATE ON emergency_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_blogger_restaurants_updated_at
    BEFORE UPDATE ON blogger_restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_price_references_updated_at
    BEFORE UPDATE ON price_references
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ai_conversations_updated_at
    BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (user_id, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to increment likes count
CREATE OR REPLACE FUNCTION increment_likes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'post_likes' THEN
        UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_like_insert
    AFTER INSERT ON post_likes
    FOR EACH ROW EXECUTE FUNCTION increment_likes();

-- Function to decrement likes count on unlike
CREATE OR REPLACE FUNCTION decrement_likes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'post_likes' THEN
        UPDATE community_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_like_delete
    AFTER DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION decrement_likes();

-- ============================================================
-- FULL TEXT SEARCH CONFIGURATION
-- ============================================================

ALTER TABLE cities ADD COLUMN IF NOT EXISTS fts tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name_en, '')), 'A') ||
        setweight(to_tsvector('chinese', coalesce(name_zh, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
    ) STORED;

ALTER TABLE attractions ADD COLUMN IF NOT EXISTS fts tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name_en, '')), 'A') ||
        setweight(to_tsvector('chinese', coalesce(name_zh, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
    ) STORED;

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS fts tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name_en, '')), 'A') ||
        setweight(to_tsvector('chinese', coalesce(name_zh, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(cuisine, '')), 'B')
    ) STORED;

ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS fts tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'B')
    ) STORED;

-- FTS indexes
CREATE INDEX IF NOT EXISTS idx_cities_fts ON cities USING GIN(fts);
CREATE INDEX IF NOT EXISTS idx_attractions_fts ON attractions USING GIN(fts);
CREATE INDEX IF NOT EXISTS idx_restaurants_fts ON restaurants USING GIN(fts);
CREATE INDEX IF NOT EXISTS idx_community_posts_fts ON community_posts USING GIN(fts);