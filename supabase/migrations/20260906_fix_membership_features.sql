-- ============================================================
-- 20260906: complete membership tier feature flags
--
-- explorer/traveler/business rows were inserted with partial
-- features JSON (only 2 keys), while free/pro/enterprise carry the
-- full 5-key structure. get_user_membership() returns these flags
-- to the account UI; missing keys render as inconsistent plans.
-- Merge defaults so every tier exposes all 5 flags, and set
-- business (top consumer tier) to full access.
-- ============================================================

UPDATE public.membership_tiers
SET features = '{"route_export": false, "group_planning": false, "offline_access": false, "priority_support": true, "advanced_ai_model": false}'::jsonb
WHERE slug = 'explorer';

UPDATE public.membership_tiers
SET features = '{"route_export": true, "group_planning": true, "offline_access": false, "priority_support": true, "advanced_ai_model": false}'::jsonb
WHERE slug = 'traveler';

UPDATE public.membership_tiers
SET features = '{"route_export": true, "group_planning": true, "offline_access": true, "priority_support": true, "advanced_ai_model": true}'::jsonb
WHERE slug = 'business';
