-- ============================================================
-- 20260828: invoices UPDATE policy (owner-only)
-- The billing page upserts invoices with onConflict=invoice_number;
-- re-downloading an invoice takes the ON CONFLICT DO UPDATE path,
-- which requires an UPDATE policy. Without it PostgREST rejects
-- the statement even for brand-new rows in some setups.
-- ============================================================

DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
CREATE POLICY "Users can update their own invoices"
    ON public.invoices FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
