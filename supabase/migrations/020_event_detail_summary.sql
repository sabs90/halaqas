-- Add detail_summary column for editable one-liner shown in compact tables
ALTER TABLE events ADD COLUMN IF NOT EXISTS detail_summary TEXT;
