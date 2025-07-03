/*
  # Create tests and attempts tables

  1. New Tables
    - `tests`
      - `id` (uuid, primary key)
      - `test_type` (text) - 'navodaya' or 'sainik'
      - `test_name` (text)
      - `test_name_hi` (text, optional)
      - `total_marks` (integer)
      - `test_date` (date)
      - `duration_in_minutes` (integer)
      - `is_live` (boolean)
      - `sections` (jsonb) - stores sections and questions
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `test_attempts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `test_id` (uuid, references tests)
      - `test_type` (text)
      - `test_name` (text)
      - `score` (integer)
      - `total_marks` (integer)
      - `percentage` (integer)
      - `duration` (integer)
      - `section_wise_score` (jsonb)
      - `user_answers` (jsonb)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Public read access for tests
    - User-specific access for attempts
*/

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type text NOT NULL CHECK (test_type IN ('navodaya', 'sainik')),
  test_name text NOT NULL,
  test_name_hi text,
  total_marks integer NOT NULL DEFAULT 0,
  test_date date DEFAULT CURRENT_DATE,
  duration_in_minutes integer NOT NULL DEFAULT 60,
  is_live boolean DEFAULT true,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create test_attempts table
CREATE TABLE IF NOT EXISTS test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id uuid REFERENCES tests(id) ON DELETE CASCADE,
  test_type text NOT NULL,
  test_name text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  total_marks integer NOT NULL DEFAULT 0,
  percentage integer NOT NULL DEFAULT 0,
  duration integer NOT NULL DEFAULT 0,
  section_wise_score jsonb DEFAULT '{}'::jsonb,
  user_answers jsonb DEFAULT '[]'::jsonb,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for tests table
CREATE POLICY "Tests are viewable by everyone"
  ON tests
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert tests"
  ON tests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tests"
  ON tests
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete tests"
  ON tests
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for test_attempts table
CREATE POLICY "Users can view their own attempts"
  ON test_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts"
  ON test_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts"
  ON test_attempts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tests_type_live ON tests(test_type, is_live);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON test_attempts(test_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for tests table
CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();