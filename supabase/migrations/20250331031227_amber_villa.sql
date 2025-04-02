/*
  # Add events table and relationships

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `meetup_id` (uuid, foreign key to meetups)
      - `title` (text)
      - `datetime` (timestamptz)
      - `venue` (text)
      - `description` (text)
      - `logo` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `events` table
    - Add policy for public read access
    - Add policy for service role to manage events
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id uuid NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
  title text NOT NULL,
  datetime timestamptz NOT NULL,
  venue text,
  description text,
  logo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for datetime to optimize sorting
CREATE INDEX events_datetime_idx ON events(datetime);

-- Create index for meetup_id for faster joins
CREATE INDEX events_meetup_id_idx ON events(meetup_id);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access"
  ON events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role full access"
  ON events
  TO service_role
  USING (true)
  WITH CHECK (true);
