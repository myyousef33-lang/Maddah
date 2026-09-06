-- =========================================================
-- MADDAH MATHEMATICS LMS - SUPABASE DATABASE SCHEMA
-- Clean, isolated schema for the Mathematics platform
-- =========================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Main Key-Value Application Store
CREATE TABLE IF NOT EXISTS app_data (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Realtime Student Presence & Online Tracking
CREATE TABLE IF NOT EXISTS presence (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  grade TEXT,
  current_page TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security Policies
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access for LMS client operation
CREATE POLICY "Allow public read access to app_data" 
  ON app_data FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update to app_data" 
  ON app_data FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to presence" 
  ON presence FOR ALL USING (true) WITH CHECK (true);
