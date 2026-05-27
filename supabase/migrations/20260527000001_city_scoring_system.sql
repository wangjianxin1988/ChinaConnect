-- ============================================================
-- ChinaConnect City Scoring System
-- Version: 1.0.0
-- Description: Multi-source city ranking and scoring system
-- ============================================================

-- ============================================================
-- DATA SOURCE CONFIGS TABLE
-- Store configuration for each data source
-- ============================================================
CREATE TABLE IF NOT EXISTS data_source_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    source_name TEXT NOT NULL UNIQUE,
    source_type TEXT NOT NULL CHECK (source_type IN ('yicai', 'gawc', 'ctrip', 'gaode', 'dazhong')),
    base_url TEXT,
    api_key TEXT,
    last_fetch_at TIMESTAMPTZ,
    fetch_interval_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CITY SOURCE DATA TABLE
-- Store raw data from each source for each city
-- ============================================================
CREATE TABLE IF NOT EXISTS city_source_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value DECIMAL(15, 4),
    metric_unit TEXT,
    raw_data JSONB DEFAULT '{}',
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (city_id, source_name, metric_type, fetched_at)
);

-- ============================================================
-- CITY SCORES TABLE
-- Store calculated composite scores for each city
-- ============================================================
CREATE TABLE IF NOT EXISTS city_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    city_id UUID NOT NULL UNIQUE REFERENCES cities(id) ON DELETE CASCADE,

    -- Composite score (0-100)
    composite_score DECIMAL(5, 2) DEFAULT 0,

    -- Dimension scores (0-100)
    economy_score DECIMAL(5, 2) DEFAULT 0,
    international_score DECIMAL(5, 2) DEFAULT 0,
    tourism_score DECIMAL(5, 2) DEFAULT 0,
    livability_score DECIMAL(5, 2) DEFAULT 0,

    -- Rankings
    overall_rank INTEGER,
    economy_rank INTEGER,
    international_rank INTEGER,
    tourism_rank INTEGER,
    livability_rank INTEGER,

    -- Tier classification (S/A/B/C/D)
    tier TEXT DEFAULT 'D' CHECK (tier IN ('S', 'A', 'B', 'C', 'D')),

    -- Additional metadata
    score_breakdown JSONB DEFAULT '{}',
    data_freshness JSONB DEFAULT '{}',

    -- Timestamps
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CITY IMAGES TABLE
-- Store curated images for each city
-- ============================================================
CREATE TABLE IF NOT EXISTS city_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT DEFAULT 'cover' CHECK (image_type IN ('cover', 'hero', 'gallery', 'attraction')),
    photographer TEXT,
    photographer_url TEXT,
    source TEXT DEFAULT 'unsplash',
    alt_text TEXT,
    alt_text_zh TEXT,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CITY SCORE HISTORY TABLE
-- Track score changes over time
-- ============================================================
CREATE TABLE IF NOT EXISTS city_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    composite_score DECIMAL(5, 2),
    economy_score DECIMAL(5, 2),
    international_score DECIMAL(5, 2),
    tourism_score DECIMAL(5, 2),
    livability_score DECIMAL(5, 2),
    tier TEXT,
    recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (city_id, recorded_at)
);

-- ============================================================
-- SCORE UPDATE LOG
-- Log score calculation runs
-- ============================================================
CREATE TABLE IF NOT EXISTS score_update_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    run_id TEXT NOT NULL UNIQUE,
    sources_processed TEXT[] DEFAULT '{}',
    cities_updated INTEGER DEFAULT 0,
    calculation_duration_ms INTEGER,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed', 'partial')),
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Data source configs
CREATE INDEX IF NOT EXISTS idx_data_source_configs_active ON data_source_configs(is_active) WHERE is_active = true;

-- City source data
CREATE INDEX IF NOT EXISTS idx_city_source_data_city_id ON city_source_data(city_id);
CREATE INDEX IF NOT EXISTS idx_city_source_data_source ON city_source_data(source_name);
CREATE INDEX IF NOT EXISTS idx_city_source_data_metric_type ON city_source_data(metric_type);
CREATE INDEX IF NOT EXISTS idx_city_source_data_fetched_at ON city_source_data(fetched_at DESC);

-- City scores
CREATE INDEX IF NOT EXISTS idx_city_scores_composite ON city_scores(composite_score DESC);
CREATE INDEX IF NOT EXISTS idx_city_scores_tier ON city_scores(tier);
CREATE INDEX IF NOT EXISTS idx_city_scores_rank ON city_scores(overall_rank);

-- City images
CREATE INDEX IF NOT EXISTS idx_city_images_city_id ON city_images(city_id);
CREATE INDEX IF NOT EXISTS idx_city_images_primary ON city_images(city_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_city_images_type ON city_images(image_type);

-- City score history
CREATE INDEX IF NOT EXISTS idx_city_score_history_city_id ON city_score_history(city_id);
CREATE INDEX IF NOT EXISTS idx_city_score_history_recorded ON city_score_history(recorded_at DESC);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to update city tier based on composite score
CREATE OR REPLACE FUNCTION calculate_city_tier(score DECIMAL)
RETURNS TEXT AS $$
BEGIN
    IF score >= 85 THEN RETURN 'S';
    ELSIF score >= 70 THEN RETURN 'A';
    ELSIF score >= 55 THEN RETURN 'B';
    ELSIF score >= 40 THEN RETURN 'C';
    ELSE RETURN 'D';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_data_source_configs_updated_at
    BEFORE UPDATE ON data_source_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_city_scores_updated_at
    BEFORE UPDATE ON city_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VIEWS
-- ============================================================

-- View for city ranking with scores and images
CREATE OR REPLACE VIEW city_rankings AS
SELECT
    c.id,
    c.slug,
    c.name_en,
    c.name_zh,
    c.province,
    cs.composite_score,
    cs.economy_score,
    cs.international_score,
    cs.tourism_score,
    cs.livability_score,
    cs.tier,
    cs.overall_rank,
    ci.image_url AS cover_image_url,
    cs.calculated_at
FROM cities c
LEFT JOIN city_scores cs ON c.id = cs.city_id
LEFT JOIN city_images ci ON c.id = ci.city_id AND ci.is_primary = true
ORDER BY cs.composite_score DESC NULLS LAST;

-- ============================================================
-- SEED DATA: Default data source configs
-- ============================================================
INSERT INTO data_source_configs (source_name, source_type, fetch_interval_hours, is_active, config) VALUES
    ('yicai', 'yicai', 8760, true, '{"name_cn": "第一财经·新一线研究所", "url": "https://www.yicai.com/", "权重": 0.30}'),
    ('gawc', 'gawc', 8760, true, '{"name_cn": "GaWC世界城市排名", "url": "https://www.lboro.ac.uk/gawc/", "权重": 0.25}'),
    ('ctrip', 'ctrip', 168, true, '{"name_cn": "携程旅游", "url": "https://www.ctrip.com/", "权重": 0.15}'),
    ('gaode', 'gaode', 168, true, '{"name_cn": "高德地图", "url": "https://www.amap.com/", "权重": 0.10}'),
    ('dazhong', 'dazhong', 168, true, '{"name_cn": "大众点评", "url": "https://www.dianping.com/", "权重": 0.20}')
ON CONFLICT (source_name) DO NOTHING;
