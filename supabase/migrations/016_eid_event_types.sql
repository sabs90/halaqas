-- Step 1: Run these two lines first (new enum values can't be used in the same transaction)
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'eid_event';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'eid_prayers';

-- Step 2: Then run this separately to recategorise existing Eid events
-- UPDATE events SET event_type = 'eid_event' WHERE event_type = 'other' AND title ILIKE '%eid%';
