-- Migration: add id_number and nationality to driver_registrationss
-- Timestamp: 2025-10-30 12:00:00

BEGIN;

-- Add columns if they don't exist already
ALTER TABLE IF EXISTS public.driver_registrationss
  ADD COLUMN IF NOT EXISTS id_number text,
  ADD COLUMN IF NOT EXISTS nationality text;

-- Add checks to validate common formats:
-- - id_number: either NULL or exactly 10 digits (common Saudi ID/Iqama length)
-- - nationality: either NULL or limited length (<= 100 chars)

-- Create or replace a constraint for id_number
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage ccu
    JOIN information_schema.table_constraints tc ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'driver_registrationss' AND tc.constraint_type = 'CHECK' AND ccu.column_name = 'id_number'
  ) THEN
    ALTER TABLE public.driver_registrationss
      ADD CONSTRAINT chk_driver_registrationss_id_number_format CHECK (id_number IS NULL OR id_number ~ '^[0-9]{10}$');
  END IF;
END
$$;

-- Create or replace a constraint for nationality length
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage ccu
    JOIN information_schema.table_constraints tc ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'driver_registrationss' AND tc.constraint_type = 'CHECK' AND ccu.column_name = 'nationality'
  ) THEN
    ALTER TABLE public.driver_registrationss
      ADD CONSTRAINT chk_driver_registrationss_nationality_len CHECK (nationality IS NULL OR char_length(nationality) <= 100);
  END IF;
END
$$;

COMMIT;
