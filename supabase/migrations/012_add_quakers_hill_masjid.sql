-- Migration 012: Add Quakers Hill Masjid and link orphaned event
-- Generated 2026-03-07

-- ============================================
-- ADD MOSQUE
-- ============================================

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES (
  'Quakers Hill Masjid',
  '37 Douglas Rd, Quakers Hill NSW 2763',
  'Quakers Hill',
  'NSW',
  -33.7291,
  150.8320
)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- LINK ORPHANED EVENT
-- ============================================

UPDATE events
SET mosque_id = (SELECT id FROM mosques WHERE name = 'Quakers Hill Masjid'),
    venue_name = NULL,
    venue_address = NULL,
    venue_latitude = NULL,
    venue_longitude = NULL
WHERE id = 'ab9b7d1b-40b3-485e-8318-675083b6aebb'
  AND mosque_id IS NULL;
