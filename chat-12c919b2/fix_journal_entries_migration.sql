-- CRITICAL PRODUCTION FIX MIGRATION
-- This script fixes the missing journal_entries table that's causing the production error

-- Run this script in your Supabase SQL Editor immediately to restore journal functionality

-- Step 1: Check if the table exists and drop it to start fresh (if needed)
-- DROP TABLE IF EXISTS journal_entries CASCADE;

-- Step 2: Create the complete journal_entries table with all required fields
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Required fields from the application
    title TEXT,
    date DATE NOT NULL,
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    energy INTEGER CHECK (energy >= 1 AND energy <= 10),
    reflections TEXT,
    gratitude TEXT,
    biggest_win TEXT,
    challenge TEXT,
    learning TEXT,
    tomorrow_focus TEXT,

    -- Optional fields used by the app
    tags TEXT[], -- Array of tags for categorization
    affirmations TEXT[], -- Array of affirmations
    weather TEXT,
    location TEXT,
    content TEXT, -- Full journal content
    themes TEXT[], -- Extracted themes
    insights TEXT[], -- AI-generated insights
    template TEXT, -- Template used for entry
    photo_url TEXT, -- Attached photo URL

    -- Metadata and timestamps
    is_draft BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_saved TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood ON journal_entries(mood);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, date DESC);

-- Step 4: Enable Row Level Security for multi-user data isolation
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies to ensure users can only access their own data
DROP POLICY IF EXISTS "Users can view own journal entries" ON journal_entries;
CREATE POLICY "Users can view own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own journal entries" ON journal_entries;
CREATE POLICY "Users can insert own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own journal entries" ON journal_entries;
CREATE POLICY "Users can update own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own journal entries" ON journal_entries;
CREATE POLICY "Users can delete own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Step 6: Create function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_journal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.last_saved = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Create trigger for automatic updates
DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_journal_updated_at();

-- Step 8: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON journal_entries TO authenticated;
GRANT SELECT ON journal_entries TO anon; -- For public reading if needed

-- Step 9: Create helpful views for analytics
CREATE OR REPLACE VIEW user_journal_stats AS
SELECT
    user_id,
    COUNT(*) as total_entries,
    COUNT(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as entries_this_week,
    COUNT(CASE WHEN date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as entries_this_month,
    ROUND(AVG(mood), 2) as average_mood,
    ROUND(AVG(energy), 2) as average_energy,
    MAX(date) as most_recent_entry,
    MIN(date) as first_entry_date,
    (MAX(date) - MIN(date)) as journaling_span_days
FROM journal_entries
WHERE is_draft = FALSE
GROUP BY user_id;

GRANT SELECT ON user_journal_stats TO authenticated;

-- Step 10: Verification query to ensure table is properly created
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'journal_entries'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Journal entries table created successfully!';
    RAISE NOTICE '✅ RLS policies enabled for user data isolation';
    RAISE NOTICE '✅ Indexes created for performance';
    RAISE NOTICE '✅ The production app should now work properly';
END $$;