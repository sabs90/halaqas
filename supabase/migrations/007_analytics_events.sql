-- Analytics events table for domain-specific tracking
-- No PII: no IP addresses, no user agents, no cookies

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  mosque_id UUID REFERENCES mosques(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on event_name for filtering by action type
CREATE INDEX idx_analytics_event_name ON analytics_events(event_name);

-- Index on mosque_id for "most popular mosques" queries
CREATE INDEX idx_analytics_mosque_id ON analytics_events(mosque_id);

-- Index on created_at for time-range queries
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);

-- Composite index for count by name within a date range
CREATE INDEX idx_analytics_name_date ON analytics_events(event_name, created_at);

-- RLS: allow public inserts (tracking is anonymous), no public reads
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- No SELECT policy for anon — only service role (admin) can read
