-- Migration: 012_create_preferences
-- Description: Create user_preferences table for storing user customization settings

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Budget range (in USD/month)
  budget_min INTEGER NOT NULL DEFAULT 500,
  budget_max INTEGER NOT NULL DEFAULT 2000,

  -- Location preferences
  preferred_locations TEXT[] NOT NULL DEFAULT '{}',
  max_commute_distance INTEGER NOT NULL DEFAULT 30, -- in miles

  -- Amenity preferences (e.g. 'wifi', 'gym', 'parking', 'laundry')
  amenities TEXT[] NOT NULL DEFAULT '{}',

  -- Notification settings
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT false,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  payment_reminders BOOLEAN NOT NULL DEFAULT true,
  new_match_alerts BOOLEAN NOT NULL DEFAULT true,
  message_notifications BOOLEAN NOT NULL DEFAULT true,

  -- Privacy settings
  profile_visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (profile_visibility IN ('public', 'matches_only', 'private')),
  show_budget_range BOOLEAN NOT NULL DEFAULT false,
  show_location BOOLEAN NOT NULL DEFAULT true,
  allow_contact_from_strangers BOOLEAN NOT NULL DEFAULT true,

  -- Saved searches (JSON array of search filter objects)
  saved_searches JSONB NOT NULL DEFAULT '[]',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id),
  CONSTRAINT budget_range_valid CHECK (budget_min >= 0 AND budget_max >= budget_min),
  CONSTRAINT commute_distance_valid CHECK (max_commute_distance >= 0 AND max_commute_distance <= 500)
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read their own preferences
CREATE POLICY "users_select_own_preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can insert their own preferences (one row per user enforced by UNIQUE)
CREATE POLICY "users_insert_own_preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can update their own preferences
CREATE POLICY "users_update_own_preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can delete their own preferences
CREATE POLICY "users_delete_own_preferences"
  ON user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger function to auto-update the updated_at column
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences (user_id);
