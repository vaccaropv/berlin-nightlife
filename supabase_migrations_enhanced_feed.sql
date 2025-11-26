-- Enhanced Community Feed System - Database Migrations
-- Run these in order in your Supabase SQL editor

-- ============================================================================
-- MIGRATION 1: News Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL, -- 'admin', 'venue', 'scraper'
    source_url TEXT, -- Original URL if scraped
    venue_id TEXT, -- References venue if venue-specific
    author_name TEXT, -- For admin/venue posts
    image_url TEXT,
    tags TEXT[], -- e.g., ['opening', 'lineup', 'special-event']
    priority INTEGER DEFAULT 0, -- Higher = more important
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_venue_id ON news(venue_id);
CREATE INDEX IF NOT EXISTS idx_news_source ON news(source);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news USING GIN(tags);

-- Enable RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read news
CREATE POLICY "News are viewable by everyone" ON news
    FOR SELECT USING (true);

-- Only authenticated users can insert (admins/venues)
CREATE POLICY "Authenticated users can insert news" ON news
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- MIGRATION 2: Report Votes Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS report_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES status_reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one vote per user per report
    UNIQUE(report_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_report_votes_report_id ON report_votes(report_id);
CREATE INDEX IF NOT EXISTS idx_report_votes_user_id ON report_votes(user_id);

-- Enable RLS
ALTER TABLE report_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can view votes
CREATE POLICY "Votes are viewable by everyone" ON report_votes
    FOR SELECT USING (true);

-- Authenticated users can insert their own votes
CREATE POLICY "Users can insert their own votes" ON report_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update their own votes" ON report_votes
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes" ON report_votes
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- MIGRATION 3: Enhance Status Reports Table
-- ============================================================================
-- Add photo gallery support (array of URLs)
ALTER TABLE status_reports 
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Add flag count for moderation
ALTER TABLE status_reports
ADD COLUMN IF NOT EXISTS flag_count INTEGER DEFAULT 0;

-- Add helpful/unhelpful counts (denormalized for performance)
ALTER TABLE status_reports
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

ALTER TABLE status_reports
ADD COLUMN IF NOT EXISTS unhelpful_count INTEGER DEFAULT 0;

-- Index for flagged reports
CREATE INDEX IF NOT EXISTS idx_status_reports_flag_count ON status_reports(flag_count);

-- ============================================================================
-- MIGRATION 4: Report Flags Table (for moderation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS report_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES status_reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'inaccurate', 'other')),
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one flag per user per report
    UNIQUE(report_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_report_flags_report_id ON report_flags(report_id);
CREATE INDEX IF NOT EXISTS idx_report_flags_created_at ON report_flags(created_at DESC);

-- Enable RLS
ALTER TABLE report_flags ENABLE ROW LEVEL SECURITY;

-- Authenticated users can flag reports
CREATE POLICY "Users can flag reports" ON report_flags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own flags
CREATE POLICY "Users can view their own flags" ON report_flags
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- MIGRATION 5: Functions for Vote Counts
-- ============================================================================
-- Function to update vote counts when votes change
CREATE OR REPLACE FUNCTION update_report_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'helpful' THEN
            UPDATE status_reports 
            SET helpful_count = helpful_count + 1 
            WHERE id = NEW.report_id;
        ELSE
            UPDATE status_reports 
            SET unhelpful_count = unhelpful_count + 1 
            WHERE id = NEW.report_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Remove old vote
        IF OLD.vote_type = 'helpful' THEN
            UPDATE status_reports 
            SET helpful_count = helpful_count - 1 
            WHERE id = OLD.report_id;
        ELSE
            UPDATE status_reports 
            SET unhelpful_count = unhelpful_count - 1 
            WHERE id = OLD.report_id;
        END IF;
        -- Add new vote
        IF NEW.vote_type = 'helpful' THEN
            UPDATE status_reports 
            SET helpful_count = helpful_count + 1 
            WHERE id = NEW.report_id;
        ELSE
            UPDATE status_reports 
            SET unhelpful_count = unhelpful_count + 1 
            WHERE id = NEW.report_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'helpful' THEN
            UPDATE status_reports 
            SET helpful_count = helpful_count - 1 
            WHERE id = OLD.report_id;
        ELSE
            UPDATE status_reports 
            SET unhelpful_count = unhelpful_count - 1 
            WHERE id = OLD.report_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update counts
DROP TRIGGER IF EXISTS report_vote_counts_trigger ON report_votes;
CREATE TRIGGER report_vote_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON report_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_report_vote_counts();

-- Function to update flag counts
CREATE OR REPLACE FUNCTION update_report_flag_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE status_reports 
        SET flag_count = flag_count + 1 
        WHERE id = NEW.report_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE status_reports 
        SET flag_count = flag_count - 1 
        WHERE id = OLD.report_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for flag counts
DROP TRIGGER IF EXISTS report_flag_counts_trigger ON report_flags;
CREATE TRIGGER report_flag_counts_trigger
    AFTER INSERT OR DELETE ON report_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_report_flag_counts();

-- ============================================================================
-- MIGRATION 6: View for Enhanced Reports with Confidence
-- ============================================================================
CREATE OR REPLACE VIEW enhanced_reports AS
SELECT 
    sr.*,
    p.username,
    p.avatar_url,
    -- Calculate confidence based on recent reports for same venue
    (
        SELECT COUNT(*)
        FROM status_reports sr2
        WHERE sr2.venue_id = sr.venue_id
        AND sr2.created_at > NOW() - INTERVAL '30 minutes'
    ) as recent_report_count,
    -- Confidence level
    CASE 
        WHEN (
            SELECT COUNT(*)
            FROM status_reports sr2
            WHERE sr2.venue_id = sr.venue_id
            AND sr2.created_at > NOW() - INTERVAL '30 minutes'
        ) >= 3 THEN 'high'
        WHEN (
            SELECT COUNT(*)
            FROM status_reports sr2
            WHERE sr2.venue_id = sr.venue_id
            AND sr2.created_at > NOW() - INTERVAL '30 minutes'
        ) >= 2 THEN 'medium'
        ELSE 'low'
    END as confidence_level,
    -- Freshness
    CASE
        WHEN sr.created_at > NOW() - INTERVAL '30 minutes' THEN 'fresh'
        WHEN sr.created_at > NOW() - INTERVAL '2 hours' THEN 'recent'
        ELSE 'old'
    END as freshness
FROM status_reports sr
LEFT JOIN profiles p ON sr.user_id = p.id;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================
-- Insert sample news
INSERT INTO news (title, content, source, venue_id, tags, priority) VALUES
('Berghain Announces Special Marathon Weekend', 'Get ready for 72 hours of non-stop techno...', 'venue', 'berghain', ARRAY['special-event', 'lineup'], 10),
('New Club Opening in Friedrichshain', 'A new underground venue is set to open next month...', 'admin', NULL, ARRAY['opening', 'news'], 5),
('Tresor Celebrates 30 Years', 'The legendary techno club marks three decades...', 'scraper', 'tresor', ARRAY['anniversary', 'special-event'], 8);
