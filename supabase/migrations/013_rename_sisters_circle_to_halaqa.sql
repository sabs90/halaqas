-- Step 1: Add new enum value (must be committed separately before use)
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'halaqa';
