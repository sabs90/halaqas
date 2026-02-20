-- Add new event types
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'competition';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'workshop';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'tahajjud';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'itikaf';
