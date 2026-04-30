-- ============================================================
-- Migration: Add auth_user_id to businesses table
-- Run this in the Supabase SQL Editor BEFORE deploying
-- ============================================================

-- 1. Add auth_user_id column to link Supabase Auth users to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 2. Add email column for user lookup
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_businesses_auth_user_id ON businesses(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_email ON businesses(email);
