-- Run this in your Supabase SQL editor to enable settings persistence
-- Dashboard → SQL Editor → New Query → paste & run

-- Add JSONB preference columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notification_prefs  JSONB,
  ADD COLUMN IF NOT EXISTS privacy_settings    JSONB,
  ADD COLUMN IF NOT EXISTS crown_prefs         JSONB,
  ADD COLUMN IF NOT EXISTS preferences         JSONB,
  ADD COLUMN IF NOT EXISTS deleted_at          TIMESTAMPTZ;

-- Optional: Create feedback table for Support & Feedback screen
CREATE TABLE IF NOT EXISTS feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type        TEXT NOT NULL CHECK (type IN ('bug', 'suggestion', 'question')),
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for feedback table
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stylist_id       UUID REFERENCES stylists(id) ON DELETE SET NULL,
  service_name     TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  status           TEXT NOT NULL DEFAULT 'upcoming'
                     CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);
