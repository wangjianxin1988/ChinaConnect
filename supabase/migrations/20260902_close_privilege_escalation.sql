-- ============================================================
-- 20260902: Close privilege-escalation gaps (deep audit round 3)
--
-- Live-confirmed exploits fixed here:
--  1) user_memberships INSERT/UPDATE allowed ANY authenticated user to
--     create their own Business membership (free unlimited AI + all paid
--     features). Confirmed: free account B inserted tier_id=business and
--     get_user_ai_usage immediately returned max_requests=-1.
--  2) wallets UPDATE allowed a user to set their own balance (confirmed:
--     B changed balance 0 -> 99999).
--  3) orders UPDATE allowed a user to flip their own order to completed /
--     change amounts (policy existed; no legit client writes orders).
--  4) notifications INSERT policy was WITH CHECK (true) — cross-user spam
--     is currently blocked only by auth.users RLS on the FK; tightened to
--     own-user so it stays safe even if that changes. System writes via
--     service_role still bypass RLS.
--  5) profiles UPDATE let a user set system-controlled columns (confirmed:
--     B set points=999999, membership_tier=business, wallet_balance=88888).
--     Revoked UPDATE on membership_tier + wallet_balance; points/badges/
--     travel_level remain client-writable for gamification.
--  6) invoices INSERT/UPDATE let a user forge/tamper their own invoice
--     amounts. Replaced client upsert with owner-validated SECURITY DEFINER
--     RPC record_invoice() that derives amount from the user real order.
-- ============================================================

-- ---------- 1) user_memberships: read-only for clients ----------
DROP POLICY IF EXISTS "System can insert memberships" ON public.user_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.user_memberships;

-- ---------- 2) wallets: read-only for clients ----------
DROP POLICY IF EXISTS "System can update wallets" ON public.wallets;

-- ---------- 3) orders: no client UPDATE ----------
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- ---------- 4) notifications: only own-user client INSERT ----------
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Users can create their own notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ---------- 5) profiles: protect system-controlled columns ----------
REVOKE UPDATE (membership_tier, wallet_balance) ON public.profiles FROM anon, authenticated;

-- ---------- 6) invoices: owner-validated recording RPC ----------
DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;

CREATE OR REPLACE FUNCTION public.record_invoice(p_order_id UUID, p_invoice_number TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order public.orders%ROWTYPE;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'permission denied';
    END IF;

    SELECT * INTO v_order FROM public.orders
    WHERE id = p_order_id AND user_id = auth.uid();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'order not found';
    END IF;

    INSERT INTO public.invoices (user_id, order_id, invoice_number, amount, currency, billing_cycle, status)
    VALUES (auth.uid(), p_order_id, p_invoice_number, v_order.final_amount, v_order.currency, v_order.billing_cycle, 'issued')
    ON CONFLICT (invoice_number) DO UPDATE
        SET amount = EXCLUDED.amount,
            currency = EXCLUDED.currency,
            billing_cycle = EXCLUDED.billing_cycle,
            status = 'issued',
            issued_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_invoice(UUID, TEXT) TO authenticated;
