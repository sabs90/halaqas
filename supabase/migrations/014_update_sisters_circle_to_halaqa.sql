-- Step 2: Update existing events (enum value 'halaqa' was committed in migration 013)
UPDATE events SET event_type = 'halaqa' WHERE event_type = 'sisters_circle';
