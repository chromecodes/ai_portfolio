-- ==============================================================================
-- AI PORTFOLIO: SUPABASE DATABASE RESET & SETUP SCRIPT
-- ==============================================================================
-- Copy and paste this entire script into your Supabase SQL Editor and hit "Run".
-- This will wipe the existing analytics tables (if any) and recreate them with 
-- the exact schema needed for your application.
-- ==============================================================================

-- 1. CLEANUP EXISTING TABLES (Caution: this deletes all data)
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS analytics_pageviews CASCADE;
DROP TABLE IF EXISTS analytics_sessions CASCADE;
DROP TABLE IF EXISTS lead_submissions CASCADE;


-- 2. CREATE SESSIONS TABLE
CREATE TABLE analytics_sessions (
    id TEXT PRIMARY KEY,
    cookie_id TEXT,
    cookie_expiry TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    country TEXT,
    city TEXT,
    region TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    screen_resolution TEXT,
    language TEXT,
    lead_source TEXT,
    visitor_name TEXT,
    visitor_email TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- 3. CREATE PAGEVIEWS TABLE
CREATE TABLE analytics_pageviews (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES analytics_sessions(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    title TEXT,
    referrer TEXT,
    stay_duration INTEGER DEFAULT 0,
    max_scroll_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- 4. CREATE EVENTS TABLE
CREATE TABLE analytics_events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES analytics_sessions(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    event_type TEXT NOT NULL,
    selected_text TEXT,
    selected_context TEXT,
    scroll_depth INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- 5. CREATE LEADS TABLE
CREATE TABLE lead_submissions (
    id TEXT PRIMARY KEY,
    cookie_id TEXT,
    cookie_expiry TIMESTAMP WITH TIME ZONE,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    ip_address TEXT,
    location TEXT,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- 6. SECURITY: ENABLE ROW LEVEL SECURITY (RLS) — LOCKED DOWN
-- ALL database reads/writes go through the Next.js server using the
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS entirely.
-- Therefore NO policies are granted to anon/authenticated: nobody holding the
-- public publishable key can read, insert, or tamper with analytics/lead data.

ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_submissions ENABLE ROW LEVEL SECURITY;

-- Defense in depth: explicitly revoke direct table access from client roles
REVOKE ALL ON analytics_sessions FROM anon, authenticated;
REVOKE ALL ON analytics_pageviews FROM anon, authenticated;
REVOKE ALL ON analytics_events FROM anon, authenticated;
REVOKE ALL ON lead_submissions FROM anon, authenticated;

-- If you are upgrading an existing database WITHOUT wiping it, also drop the
-- old permissive policies manually:
--   DROP POLICY IF EXISTS "Allow anonymous inserts for sessions" ON analytics_sessions;
--   DROP POLICY IF EXISTS "Allow anonymous updates for sessions" ON analytics_sessions;
--   DROP POLICY IF EXISTS "Allow anonymous inserts for pageviews" ON analytics_pageviews;
--   DROP POLICY IF EXISTS "Allow anonymous inserts for events" ON analytics_events;
--   DROP POLICY IF EXISTS "Allow anonymous inserts for leads" ON lead_submissions;
--   DROP POLICY IF EXISTS "Allow anonymous updates for leads" ON lead_submissions;


-- Setup Complete!
