/*
  # Add link field to events table

  1. Changes
    - Add `link` column to events table to store event URLs
    - Make the column nullable since some existing events might not have links
    - Add index on link column for faster lookups

  2. Security
    - No changes to RLS policies needed
*/

-- Add link column to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS link text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS events_link_idx ON events(link);
