-- Halaqas Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE event_type AS ENUM (
  'talk', 'class', 'quran_circle', 'iftar', 'taraweeh',
  'charity', 'youth', 'sisters_circle', 'other'
);

CREATE TYPE language_type AS ENUM (
  'english', 'arabic', 'urdu', 'turkish', 'bahasa', 'mixed', 'other'
);

CREATE TYPE gender_type AS ENUM ('brothers', 'sisters', 'mixed');

CREATE TYPE time_mode_type AS ENUM ('fixed', 'prayer_anchored');

CREATE TYPE prayer_name AS ENUM ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha');

CREATE TYPE event_status AS ENUM ('active', 'archived', 'delisted');

CREATE TYPE amendment_reason AS ENUM ('ended', 'wrong_date', 'wrong_details', 'duplicate', 'other');

CREATE TYPE amendment_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================
-- MOSQUES TABLE
-- ============================================

CREATE TABLE mosques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  suburb TEXT NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  go_pray_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mosques_suburb ON mosques(suburb);
CREATE INDEX idx_mosques_active ON mosques(active);

-- ============================================
-- EVENTS TABLE
-- ============================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mosque_id UUID REFERENCES mosques(id) ON DELETE SET NULL,
  venue_name TEXT,
  venue_address TEXT,
  venue_latitude DECIMAL,
  venue_longitude DECIMAL,
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL DEFAULT 'other',
  speaker TEXT,
  language language_type NOT NULL DEFAULT 'english',
  gender gender_type NOT NULL DEFAULT 'mixed',
  time_mode time_mode_type NOT NULL DEFAULT 'fixed',
  fixed_date DATE,
  fixed_time TIME,
  prayer_anchor prayer_name,
  prayer_offset_minutes INTEGER DEFAULT 0,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  recurrence_end_date DATE,
  flyer_image_url TEXT,
  submitter_contact TEXT,
  status event_status DEFAULT 'active',
  last_confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_mosque ON events(mosque_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_date ON events(fixed_date);
CREATE INDEX idx_events_recurring ON events(is_recurring);

-- ============================================
-- AMENDMENTS TABLE
-- ============================================

CREATE TABLE amendments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reason amendment_reason NOT NULL,
  old_details JSONB,
  new_details JSONB,
  reporter_contact TEXT,
  status amendment_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_amendments_event ON amendments(event_id);
CREATE INDEX idx_amendments_status ON amendments(status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE mosques ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE amendments ENABLE ROW LEVEL SECURITY;

-- Public can read active mosques
CREATE POLICY "Public can read active mosques"
  ON mosques FOR SELECT
  USING (active = true);

-- Public can read active events
CREATE POLICY "Public can read active events"
  ON events FOR SELECT
  USING (status = 'active');

-- Anyone can insert events (submissions)
CREATE POLICY "Anyone can insert events"
  ON events FOR INSERT
  WITH CHECK (true);

-- Anyone can insert amendments (reports)
CREATE POLICY "Anyone can insert amendments"
  ON amendments FOR INSERT
  WITH CHECK (true);

-- Public can read their own amendments (not needed for MVP but harmless)
CREATE POLICY "Public can read amendments"
  ON amendments FOR SELECT
  USING (true);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED PLACEHOLDER MOSQUES
-- ============================================

INSERT INTO mosques (name, address, suburb, latitude, longitude) VALUES
  ('Lakemba Mosque (Imam Ali bin Abi Talib)', '65-67 Wangee Rd, Lakemba NSW 2195', 'Lakemba', -33.9200, 151.0750),
  ('Auburn Gallipoli Mosque', '10-18 North Parade, Auburn NSW 2144', 'Auburn', -33.8490, 151.0330),
  ('Masjid As-Sunnah', '23-25 Restwell St, Bankstown NSW 2200', 'Bankstown', -33.9180, 151.0350),
  ('ISRA (Islamic Sciences & Research Academy)', '27 Chalmers Rd, Strathfield NSW 2135', 'Strathfield', -33.8710, 151.0870),
  ('Masjid Al-Noor', '18 Railway St, Granville NSW 2142', 'Granville', -33.8330, 151.0120),
  ('Rooty Hill Mosque', '65 Rooty Hill Rd N, Rooty Hill NSW 2766', 'Rooty Hill', -33.7720, 150.8440),
  ('Al-Amanah College Mosque', '2 Winspear Ave, Bankstown NSW 2200', 'Bankstown', -33.9230, 151.0370),
  ('Ahl Al Sunnah Wal Jamaah', '45 Hector St, Chester Hill NSW 2162', 'Chester Hill', -33.8840, 151.0070),
  ('Masjid Ibrahim', '25 Station St, Marrickville NSW 2204', 'Marrickville', -33.9110, 151.1560),
  ('Liverpool Mosque', '42 Memorial Ave, Liverpool NSW 2170', 'Liverpool', -33.9200, 150.9240),
  ('Imam Hasan Centre', '49-57 Hume Hwy, Greenacre NSW 2190', 'Greenacre', -33.8960, 151.0570),
  ('Al Zahra Mosque', '25 Stapleton St, Arncliffe NSW 2205', 'Arncliffe', -33.9380, 151.1480),
  ('Punchbowl Mosque (Masjid Bilal)', '725 Punchbowl Rd, Punchbowl NSW 2196', 'Punchbowl', -33.9280, 151.0590),
  ('IREA (Islamic Research & Educational Academy)', '3 Francis St, Dee Why NSW 2099', 'Dee Why', -33.7510, 151.2870),
  ('Parramatta Mosque', '101-105 Marsden St, Parramatta NSW 2150', 'Parramatta', -33.8150, 151.0010),
  ('Surry Hills Mosque', '175 Commonwealth St, Surry Hills NSW 2010', 'Surry Hills', -33.8810, 151.2110),
  ('UNSW Musallah', 'UNSW Sydney, Kensington NSW 2052', 'Kensington', -33.9173, 151.2313),
  ('Erskineville Mosque', '13-15 John St, Erskineville NSW 2043', 'Erskineville', -33.9020, 151.1860),
  ('Cabramatta Mosque', '8 Water St, Cabramatta NSW 2166', 'Cabramatta', -33.8950, 150.9380),
  ('Campbelltown Musallah', '8 Browne St, Campbelltown NSW 2560', 'Campbelltown', -34.0650, 150.8140);
