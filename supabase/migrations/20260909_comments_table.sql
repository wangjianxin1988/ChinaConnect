-- Restaurant reviews: dedicated comments table (restaurant reviews with rating).
-- Previously RestaurantDetail queried `comments` which never existed; the real
-- community table is post_comments (posts, no rating). This table backs the
-- "User reviews" section on restaurant detail pages.
--
-- restaurant_id is the frontend restaurant page id (text, e.g. "bj-michelin-1",
-- "beijing-1"); the restaurant detail pages are built from static per-city data
-- so there is no reliable uuid mapping to public.restaurants.
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  content text NOT NULL,
  is_best_answer boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_restaurant_id ON public.comments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

DROP TRIGGER IF EXISTS comments_set_updated_at ON public.comments;
CREATE TRIGGER comments_set_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant comments are viewable by everyone"
ON public.comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create restaurant comments"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own restaurant comments"
ON public.comments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own restaurant comments"
ON public.comments FOR DELETE
USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER ON public.comments TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, TRUNCATE ON public.comments TO postgres;

COMMENT ON TABLE public.comments IS
  'Restaurant reviews. Publicly readable; only the author can create/update/delete their own review. restaurant_id is the frontend restaurant page id (text).';