-- Add language column to ai_conversations (expected by chat edge function)
ALTER TABLE public.ai_conversations
    ADD COLUMN IF NOT EXISTS language TEXT;
