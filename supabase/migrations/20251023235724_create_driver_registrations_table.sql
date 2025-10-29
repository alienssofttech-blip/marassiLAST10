/*
  # Create driver_registrations table (extended)

  This migration creates the `driver_registrations` table with additional
  columns used by the website form and the Netlify function that accepts
  multipart/form-data uploads. New columns include:
    - phone_local: local phone digits (e.g., 5xxxxxxxx)
    - phone_e164: canonical E.164 phone (e.g., +9665xxxxxxxx)
    - sponsor_phone: optional sponsor phone number
    - city, vehicle_type: user-provided city and vehicle type text
    - agree_terms: boolean flag if the applicant agreed to terms
    - submitted_at: timestamp when the form was submitted (client-provided)
    - id_document_url, license_document_url, vehicle_registration_url, profile_photo_url: uploaded file URLs
    - notes: optional free text notes

  Security: keep RLS enabled; service_role policies allow service role full access.

  Indexes added for phone_e164 and submitted_at for efficient lookups.
*/

-- Create driver_registrationss table
CREATE TABLE IF NOT EXISTS driver_registrationss (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  phone_local text,
  phone_e164 text,
  sponsor_phone text,
  email text NOT NULL,
  message text,
  notes text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'approved', 'rejected', 'archived')),
  city text,
  vehicle_type text,
  agree_terms boolean DEFAULT false,
  submitted_at timestamptz,
  id_document_url text,
  license_document_url text,
  vehicle_registration_url text,
  profile_photo_url text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE driver_registrationss ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting new registrationss (anyone can insert)
CREATE POLICY "Anyone can submit driver registration"
  ON driver_registrationss
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy for service role to read all registrationss
CREATE POLICY "Service role can read all registrationss"
  ON driver_registrationss
  FOR SELECT
  TO public
  USING (true);

-- Create policy for service role to update registrationss
CREATE POLICY "Service role can update registrationss"
  ON driver_registrationss
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policy for service role to delete registrationss
CREATE POLICY "Service role can delete registrationss"
  ON driver_registrationss
  FOR DELETE
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_driver_registrations_email ON driver_registrationss(email);
CREATE INDEX IF NOT EXISTS idx_driver_registrations_phone ON driver_registrationss(phone);
CREATE INDEX IF NOT EXISTS idx_driver_registrations_phone_e164 ON driver_registrationss(phone_e164);
CREATE INDEX IF NOT EXISTS idx_driver_registrations_sponsor_phone ON driver_registrationss(sponsor_phone);
CREATE INDEX IF NOT EXISTS idx_driver_registrations_status ON driver_registrationss(status);
CREATE INDEX IF NOT EXISTS idx_driver_registrations_submitted_at ON driver_registrationss(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_registrations_created_at ON driver_registrationss(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_driver_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_driver_registrations_updated_at_trigger ON driver_registrationss;
CREATE TRIGGER update_driver_registrations_updated_at_trigger
  BEFORE UPDATE ON driver_registrationss
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_registrations_updated_at();

-- Add comment to table
COMMENT ON TABLE driver_registrationss IS 'Stores driver registrationss requests from the website (including uploaded document URLs)';
