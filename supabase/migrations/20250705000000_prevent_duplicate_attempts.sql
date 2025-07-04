/*
  # Prevent Duplicate Test Attempts

  1. Add unique constraint to prevent multiple attempts for the same test by the same user within a short time frame
  2. Add index for better query performance on attempt lookups
*/

-- Add a computed column for duplicate prevention (rounds timestamp to nearest 5 minutes)
ALTER TABLE test_attempts 
ADD COLUMN IF NOT EXISTS duplicate_check_key text 
GENERATED ALWAYS AS (user_id::text || '-' || test_id::text || '-' || test_type || '-' || EXTRACT(EPOCH FROM completed_at)::bigint / 300) STORED;

-- Add unique constraint using the computed column
CREATE UNIQUE INDEX IF NOT EXISTS idx_test_attempts_no_duplicates
ON test_attempts (duplicate_check_key);

-- Add comment explaining the constraint
COMMENT ON COLUMN test_attempts.duplicate_check_key IS 'Prevents duplicate test submissions within 5-minute windows by the same user for the same test';

-- Create function to handle duplicate attempt prevention
CREATE OR REPLACE FUNCTION prevent_duplicate_attempts()
RETURNS trigger AS $$
BEGIN
  -- Check if a similar attempt exists within the last 5 minutes
  IF EXISTS (
    SELECT 1 FROM test_attempts 
    WHERE user_id = NEW.user_id 
      AND test_id = NEW.test_id 
      AND test_type = NEW.test_type
      AND ABS(EXTRACT(EPOCH FROM completed_at) - EXTRACT(EPOCH FROM NEW.completed_at)) < 300
      AND id != COALESCE(NEW.id, gen_random_uuid())
  ) THEN
    RAISE EXCEPTION 'Duplicate test attempt detected within 5 minutes';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent duplicates
DROP TRIGGER IF EXISTS prevent_duplicate_attempts_trigger ON test_attempts;
CREATE TRIGGER prevent_duplicate_attempts_trigger
  BEFORE INSERT OR UPDATE ON test_attempts
  FOR EACH ROW EXECUTE FUNCTION prevent_duplicate_attempts();
