-- Site-wide settings (key-value with JSONB)
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the featured event setting
INSERT INTO site_settings (key, value) VALUES (
  'featured_event',
  '{"enabled": true, "type": "tahajjud", "label": "Tahajjud", "href": "/tahajjud"}'
);

-- RLS: public read, no public write
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site_settings" ON site_settings FOR SELECT USING (true);
