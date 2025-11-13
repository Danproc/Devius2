-- Migration: Add sequential member number to devcards

-- Add member_number column as SERIAL (auto-incrementing)
ALTER TABLE devcards ADD COLUMN member_number SERIAL NOT NULL UNIQUE;

-- Backfill existing users with sequential numbers based on creation date
-- This ensures first user gets #1, second gets #2, etc.
WITH numbered_cards AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM devcards
)
UPDATE devcards
SET member_number = numbered_cards.row_num
FROM numbered_cards
WHERE devcards.id = numbered_cards.id;

-- Reset the sequence to continue from the highest number
SELECT setval(
  pg_get_serial_sequence('devcards', 'member_number'),
  (SELECT MAX(member_number) FROM devcards)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_devcards_member_number ON devcards(member_number);

-- Add comment for documentation
COMMENT ON COLUMN devcards.member_number IS 'Sequential member number assigned in order of DevCard creation (#1, #2, #3, etc.)';
