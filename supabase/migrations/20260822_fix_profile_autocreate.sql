-- ============================================================
-- Fix profile auto-creation for OAuth (Google/GitHub) users
-- Previous handle_new_user() only read raw_user_meta_data->>'display_name'
-- (NULL for OAuth users), and the trigger was never applied to prod,
-- so most users had no profiles row.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_display_name TEXT;
    v_avatar_url TEXT;
BEGIN
    v_display_name := NULLIF(BTRIM(NEW.raw_user_meta_data->>'display_name'), '');
    IF v_display_name IS NULL THEN
        v_display_name := NULLIF(BTRIM(NEW.raw_user_meta_data->>'full_name'), '');
    END IF;
    IF v_display_name IS NULL THEN
        v_display_name := NULLIF(BTRIM(NEW.raw_user_meta_data->>'name'), '');
    END IF;
    IF v_display_name IS NULL THEN
        v_display_name := NULLIF(BTRIM(NEW.raw_user_meta_data->>'preferred_username'), '');
    END IF;
    IF v_display_name IS NULL AND NEW.email IS NOT NULL THEN
        v_display_name := split_part(NEW.email, '@', 1);
    END IF;

    v_avatar_url := NULLIF(
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture'
        ),
        ''
    );

    INSERT INTO public.profiles (user_id, display_name, avatar_url)
    VALUES (NEW.id, v_display_name, v_avatar_url)
    ON CONFLICT (user_id) DO UPDATE
        SET display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
            avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
            updated_at = NOW();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users missing a row
INSERT INTO public.profiles (user_id, display_name, avatar_url)
SELECT
    u.id,
    COALESCE(
        NULLIF(BTRIM(u.raw_user_meta_data->>'display_name'), ''),
        NULLIF(BTRIM(u.raw_user_meta_data->>'full_name'), ''),
        NULLIF(BTRIM(u.raw_user_meta_data->>'name'), ''),
        NULLIF(BTRIM(u.raw_user_meta_data->>'preferred_username'), ''),
        split_part(u.email, '@', 1)
    ),
    NULLIF(COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture'), '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO NOTHING;
