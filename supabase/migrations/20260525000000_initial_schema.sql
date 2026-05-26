-- ============================================================
-- ChinaConnect Initial Schema Migration
-- Version: 20260525000000
-- Description: Create all core tables, indexes, RLS policies
-- ============================================================

-- Run this migration via Supabase dashboard or CLI:
-- supabase db push
-- or: psql -h <host> -U postgres -d postgres -f schema.sql

-- For migrations, use:
-- cat supabase/migrations/20260525000000_initial_schema.sql | psql

-- Verify installation:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

BEGIN;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create tables (reference schema.sql for full definitions)
-- This file is for incremental migrations beyond the initial schema

-- Example: Add new columns
-- ALTER TABLE cities ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0;

COMMIT;

-- Notes:
-- 1. Always wrap changes in BEGIN/COMMIT
-- 2. Use IF NOT EXISTS for idempotent migrations
-- 3. Document every change with comments
-- 4. Test migrations on a staging database first