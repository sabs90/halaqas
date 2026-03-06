-- Migration 009: Delete duplicate events, keeping the most recently created row per group
-- Duplicates are defined as: same title (case-insensitive) + same mosque + same date/recurrence

DELETE FROM events
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY
               LOWER(TRIM(title)),
               COALESCE(mosque_id::text, LOWER(TRIM(venue_name))),
               fixed_date,
               recurrence_pattern
             ORDER BY created_at DESC
           ) AS rn
    FROM events
    WHERE status = 'active'
  ) ranked
  WHERE rn > 1
);
