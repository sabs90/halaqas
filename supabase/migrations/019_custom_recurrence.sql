-- Add recurrence_days column for custom multi-day recurrence patterns
ALTER TABLE events ADD COLUMN recurrence_days INTEGER[];

-- Values must be 0-6 (JS Date.getDay() convention: 0=Sun, 6=Sat)
-- Array must be non-empty when present
ALTER TABLE events ADD CONSTRAINT events_recurrence_days_valid
  CHECK (
    recurrence_days IS NULL
    OR (
      array_length(recurrence_days, 1) > 0
      AND recurrence_days <@ ARRAY[0,1,2,3,4,5,6]
    )
  );
