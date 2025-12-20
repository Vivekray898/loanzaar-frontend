-- Create contact_messages table for storing Contact Us submissions
-- Run this in your Supabase (Postgres) database or via migration tool

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  state text,
  city text,
  reason text,
  user_id uuid,
  ip text,
  user_agent text,
  handled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
