/*
  # Create meetups table

  1. New Tables
    - `meetups`
      - `id` (uuid, primary key)
      - `url` (text, unique)
      - `platform` (text)
      - `type` (text)
      - `name` (text)
      - `logo` (text, nullable)
      - `description` (text, nullable)
      - `last_scraped_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `meetups` table
    - Add policy for authenticated users to read all meetups
    - Add policy for service role to manage meetups
*/

CREATE TABLE IF NOT EXISTS meetups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text UNIQUE NOT NULL,
  platform text NOT NULL,
  type text NOT NULL,
  name text NOT NULL,
  logo text,
  description text,
  last_scraped_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraints for platform and type
ALTER TABLE meetups ADD CONSTRAINT meetups_platform_check 
  CHECK (platform IN ('meetup', 'other'));

ALTER TABLE meetups ADD CONSTRAINT meetups_type_check 
  CHECK (type IN ('meetups', 'others'));

-- Enable RLS
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access"
  ON meetups
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role full access"
  ON meetups
  TO service_role
  USING (true)
  WITH CHECK (true);