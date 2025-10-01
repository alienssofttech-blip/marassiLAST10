/*
  # Contact Messages Table

  ## Description
  This migration creates the contact_messages table to store all contact form submissions
  from the MARASSI Transport & Logistics website.

  ## Tables Created
  
  ### `contact_messages`
  Stores all contact form submissions with the following fields:
  - `id` (uuid, primary key) - Unique identifier for each message
  - `name` (text, required) - Name of the person submitting the form
  - `email` (text, required) - Email address for contact
  - `message` (text, required) - The message content
  - `status` (text, default: 'new') - Message status (new, read, replied, archived)
  - `ip_address` (text, optional) - IP address of submitter for security
  - `user_agent` (text, optional) - Browser/device information
  - `created_at` (timestamptz) - Timestamp of submission
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - RLS is ENABLED on the contact_messages table
  - Public INSERT policy allows anyone to submit messages (required for contact form)
  - Only authenticated admins can read messages
  - No public read access to protect user privacy
  
  ### Policies Created
  1. "Anyone can submit contact messages" - Allows public INSERT
  2. "Admins can view all messages" - Allows authenticated users to SELECT
  3. "Admins can update message status" - Allows authenticated users to UPDATE

  ## Indexes
  - Index on `created_at` for efficient sorting
  - Index on `status` for filtering
  - Index on `email` for searching

  ## Notes
  - All messages are retained indefinitely for business records
  - Status field helps track message lifecycle
  - IP address stored for spam prevention
*/

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert contact messages (required for public contact form)
CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can view messages
CREATE POLICY "Admins can view all messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users (admins) can update messages
CREATE POLICY "Admins can update message status"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER update_contact_messages_updated_at_trigger
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();