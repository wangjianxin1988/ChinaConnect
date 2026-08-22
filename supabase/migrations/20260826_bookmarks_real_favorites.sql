-- ============================================================
-- 20260826: Bookmarks reference_id TEXT + metadata (real favorites)
-- Restaurant ids in the static dataset are slug strings (bj-michelin-1)
-- so the UUID reference_id column rejected every insert. Allow TEXT
-- and add a JSONB metadata column so the personal center can render
-- favorite cards (title / type / link / image) without extra joins.
-- ============================================================

ALTER TABLE public.bookmarks
    ALTER COLUMN reference_id TYPE TEXT USING reference_id::text;

ALTER TABLE public.bookmarks
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
