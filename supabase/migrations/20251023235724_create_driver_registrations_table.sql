/*
  # Create driver_registrations table

  1. New Tables
    - `driver_registrations`
      - `id` (uuid, primary key) - Unique identifier for each registration
      - `name` (text, required) - Driver's full name
      - `phone` (text, required) - Driver's phone number (Saudi format)
      - `email` (text, required) - Driver's email address
      - `message` (text, required) - Driver's introduction/message
      - `status` (text, default: 'new') - Registration status (new, contacted, approved, rejected)
      - `ip_address` (text) - IP address of the registrant
      - `user_agent` (text) - Browser/device information
      - `created_at` (timestamptz) - When the registration was submitted
      - `updated_at` (timestamptz) - When the record was last updated

  2. Security
    - Enable RLS on `driver_registrations` table
    - Add policy for service role to manage all operations
    - Public users can only insert their own registrations

  3. Indexes
    - Index on email for faster lookups
    - Index on phone for faster lookups
    - Index on status for filtering
    - Index on created_at for sorting
*/

-- Create driver_registrations table
CREATE TABLE IF NOT EXISTS driver_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'approved', 'rejected', 'archived')),
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE driver_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting new registrations (anyone can insert)
CREATE POLICY "Anyone can submit driver registration"
  ON driver_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create policy for service role to read all registrations
CREATE POLICY "Service role can read all registrations"
  ON driver_registrations
  FOR SELECT
  TO service_role
  USING (true);

-- Create policy for service role to update registrations
CREATE POLICY "Service role can update registrations"
  ON driver_registrations
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policy for service role to delete registrations
CREATE POLICY "Service role can delete registrations"
  ON driver_registrations
  FOR DELETE
  TO service_role
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_registrations_email ON driver_registrations(email);
CREATE INDEX IF NOT EXISTS idx_driver_registrations_phone ON driver_registrations(phone);
CREATE INDEX IF NOT EXISTS idx_driver_registrations_status ON driver_registrations(status);
CREATE INDEX IF NOT EXISTS idx_driver_registrations_created_at ON driver_registrations(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_driver_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_driver_registrations_updated_at_trigger ON driver_registrations;
CREATE TRIGGER update_driver_registrations_updated_at_trigger
  BEFORE UPDATE ON driver_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_registrations_updated_at();

-- Add comment to table
COMMENT ON TABLE driver_registrations IS 'Stores driver registration requests from the website';
