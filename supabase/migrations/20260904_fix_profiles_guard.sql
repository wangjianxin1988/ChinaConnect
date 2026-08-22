-- ============================================================
-- 20260904: fix profiles guard role detection
--
-- The 20260903 guard trusted session_user which is "postgres" for
-- PostgREST client sessions in this project, so client UPDATEs were
-- silently allowed. Guard now keys on auth.role() only:
--   - service_role (webhook/system) -> allow
--   - NULL (internal SQL / management / sync triggers) -> allow
--   - authenticated (client) -> enforce system-column protection
-- ============================================================

CREATE OR REPLACE FUNCTION public.guard_profiles_client_update()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.role() = 'service_role' OR auth.role() IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.membership_tier IS DISTINCT FROM OLD.membership_tier
       OR NEW.wallet_balance IS DISTINCT FROM OLD.wallet_balance
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.id IS DISTINCT FROM OLD.id
       OR NEW.created_at IS DISTINCT FROM OLD.created_at
       OR NEW.last_active_at IS DISTINCT FROM OLD.last_active_at
       OR NEW.signup_source IS DISTINCT FROM OLD.signup_source
    THEN
        RAISE EXCEPTION 'system-controlled profile fields cannot be changed by clients';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
