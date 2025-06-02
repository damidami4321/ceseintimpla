/*
  # Create tables for romantic website

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `created_at` (timestamp with time zone)
    
    - `answers`
      - `id` (uuid, primary key)
      - `user_name` (text, not null)
      - `question` (text, not null)
      - `answer` (text, not null)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read their own data
    - Add policies for public access to create entries
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Allow public to create users"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO public
  USING (true);

-- Create policies for answers table
CREATE POLICY "Allow public to create answers"
  ON answers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can read answers"
  ON answers
  FOR SELECT
  TO public
  USING (true);