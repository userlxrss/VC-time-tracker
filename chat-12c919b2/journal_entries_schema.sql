-- Journal Entries Table Schema for Supabase
-- CRITICAL FIX: Create missing journal_entries table to resolve production error

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Core journal fields
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

    -- Optional fields
    tags TEXT[], -- Array of tags
    affirmations TEXT[], -- Array of affirmations
    weather TEXT,
    location TEXT,
    content TEXT, -- Full content/entry text
    themes TEXT[], -- Array of themes
    insights TEXT[], -- Array of insights
    template TEXT,
    photo_url TEXT,

    -- Metadata
    is_draft BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_saved TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(date);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX idx_journal_entries_mood ON journal_entries(mood);
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own entries
CREATE POLICY "Users can view own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own entries
CREATE POLICY "Users can insert own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own entries
CREATE POLICY "Users can update own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own entries
CREATE POLICY "Users can delete own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_journal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.last_saved = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_journal_updated_at();

-- Create view for user journal summaries
CREATE VIEW user_journal_summaries AS
SELECT
    user_id,
    COUNT(*) as total_entries,
    COUNT(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as entries_this_week,
    COUNT(CASE WHEN date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as entries_this_month,
    ROUND(AVG(mood), 2) as average_mood,
    ROUND(AVG(energy), 2) as average_energy,
    MAX(date) as most_recent_entry,
    MIN(date) as first_entry
FROM journal_entries
WHERE is_draft = FALSE
GROUP BY user_id;

-- Grant permissions on the view
GRANT SELECT ON user_journal_summaries TO authenticated;
GRANT SELECT ON user_journal_summaries TO anon;