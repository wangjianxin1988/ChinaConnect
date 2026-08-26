-- chat Edge Function idempotency: ai_messages upserts key on client_msg_id.
-- Without a unique constraint Postgres rejects ON CONFLICT (client_msg_id)
-- with 42P10 and messages are silently never persisted (ai_conversations stay
-- at message_count=0), so chat history cannot be restored after a refresh.
-- Multiple NULLs are allowed, so legacy rows are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_messages_client_msg_id
    ON public.ai_messages (client_msg_id);
