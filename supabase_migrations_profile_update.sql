-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS favorite_venue_ids TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS username_last_changed TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": true, "marketing": false}';

-- Index for favorite venues (using GIN for array)
CREATE INDEX IF NOT EXISTS idx_users_favorite_venue_ids ON users USING GIN(favorite_venue_ids);
