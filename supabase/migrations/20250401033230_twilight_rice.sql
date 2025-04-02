/*
  # Add unique constraint to event link

  1. Changes
    - Add unique constraint to link column in events table
    - Add index on link column for better query performance

  2. Notes
    - Using IF NOT EXISTS to prevent errors if constraint already exists
    - Adding index to improve lookup performance
*/

-- Add unique constraint to link column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'events_link_key'
  ) THEN
    ALTER TABLE events
    ADD CONSTRAINT events_link_key UNIQUE (link);
  END IF;
END $$;

-- Add index on link column
CREATE INDEX IF NOT EXISTS events_link_idx ON events (link);
