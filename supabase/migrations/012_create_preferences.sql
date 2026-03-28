-- Create preferences table
CREATE TABLE IF NOT EXISTS public.preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    budget_min NUMERIC DEFAULT 0,
    budget_max NUMERIC DEFAULT 10000,
    location_preferences TEXT[] DEFAULT '{}',
    amenity_preferences TEXT[] DEFAULT '{}',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    privacy_level TEXT DEFAULT 'private' CHECK (privacy_level IN ('public', 'private', 'friends')),
    saved_searches JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences"
    ON public.preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON public.preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON public.preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_preferences_updated_at
    BEFORE UPDATE ON public.preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
