-- Add kids and family tags to events
ALTER TABLE events ADD COLUMN is_kids boolean DEFAULT false;
ALTER TABLE events ADD COLUMN is_family boolean DEFAULT false;
