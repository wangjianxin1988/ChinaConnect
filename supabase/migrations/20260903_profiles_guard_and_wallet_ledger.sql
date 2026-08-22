-- ============================================================
-- 20260903: profiles client-update guard + wallet ledger tightening
--
--  1) Column-level REVOKE alone cannot block client UPDATEs because
--     Supabase grants table-level UPDATE to anon/authenticated. A
--     BEFORE UPDATE trigger now raises when a client (non service_role,
--     non postgres) tries to change system-controlled profile fields
--     (membership_tier, wallet_balance, user_id, id, created_at,
--     last_active_at, signup_source). Confirmed exploit: user B set
--     points=999999 / membership_tier=business / wallet_balance=88888.
--     Points/badges/travel_level stay client-writable for gamification.
--  2) wallet_transactions INSERT policy "System can insert transactions"
--     used WITH CHECK (auth.uid() = user_id), letting any user write
--     fake ledger rows for themselves. No client flow needs it; system
--     writes go through service_role (bypasses RLS). Dropped.
-- ============================================================

-- ---------- 1) profiles guard ----------
CREATE OR REPLACE FUNCTION public.guard_profiles_client_update()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.role() = 'service_role' OR session_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin') THEN
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

DROP TRIGGER IF EXISTS guard_profiles_client_update ON public.profiles;
CREATE TRIGGER guard_profiles_client_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.guard_profiles_client_update();

-- ---------- 2) wallet_transactions: no client INSERT ----------
DROP POLICY IF EXISTS "System can insert transactions" ON public.wallet_transactions;
