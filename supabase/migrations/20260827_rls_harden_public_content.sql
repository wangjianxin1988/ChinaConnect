-- Pre-launch security hardening: enable RLS on public content tables
-- that previously had NO RLS but full INSERT/UPDATE/DELETE grants for
-- anon/authenticated (anyone with the public anon key could modify the
-- entire city/restaurant/attraction dataset).

ALTER TABLE public.attractions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.attractions;
CREATE POLICY "Public read" ON public.attractions FOR SELECT USING (true);

ALTER TABLE public.blogger_restaurants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.blogger_restaurants;
CREATE POLICY "Public read" ON public.blogger_restaurants FOR SELECT USING (true);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.cities;
CREATE POLICY "Public read" ON public.cities FOR SELECT USING (true);

ALTER TABLE public.city_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.city_images;
CREATE POLICY "Public read" ON public.city_images FOR SELECT USING (true);

ALTER TABLE public.city_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.city_metrics;
CREATE POLICY "Public read" ON public.city_metrics FOR SELECT USING (true);

ALTER TABLE public.city_score_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.city_score_history;
CREATE POLICY "Public read" ON public.city_score_history FOR SELECT USING (true);

ALTER TABLE public.city_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.city_scores;
CREATE POLICY "Public read" ON public.city_scores FOR SELECT USING (true);

ALTER TABLE public.city_source_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.city_source_data;
CREATE POLICY "Public read" ON public.city_source_data FOR SELECT USING (true);

ALTER TABLE public.data_source_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.data_source_configs;
CREATE POLICY "Public read" ON public.data_source_configs FOR SELECT USING (true);

ALTER TABLE public.emergency_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.emergency_info;
CREATE POLICY "Public read" ON public.emergency_info FOR SELECT USING (true);

ALTER TABLE public.price_references ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.price_references;
CREATE POLICY "Public read" ON public.price_references FOR SELECT USING (true);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.restaurants;
CREATE POLICY "Public read" ON public.restaurants FOR SELECT USING (true);

ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.scam_reports;
CREATE POLICY "Public read" ON public.scam_reports FOR SELECT USING (true);

ALTER TABLE public.score_update_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.score_update_logs;
CREATE POLICY "Public read" ON public.score_update_logs FOR SELECT USING (true);

-- PostGIS system tables: keep readable but block anon/authenticated writes.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.spatial_ref_sys FROM anon, authenticated;

-- Views (reporting/system): block anon/authenticated writes defensively.
REVOKE INSERT, UPDATE, DELETE ON public.city_rankings FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.geography_columns FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.geometry_columns FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.order_summary FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.user_dashboard FROM anon, authenticated;

-- TRUNCATE bypasses RLS: revoke everywhere for anon/authenticated.
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
