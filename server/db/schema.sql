-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Status reports table
CREATE TABLE IF NOT EXISTS status_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    queue_length TEXT NOT NULL CHECK(queue_length IN ('No Queue', 'Short', 'Medium', 'Long', 'Full')),
    door_policy TEXT NOT NULL CHECK(door_policy IN ('Relaxed', 'Standard', 'Strict', 'Very Strict')),
    vibe TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_venue ON status_reports(venue_id);
CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON status_reports(timestamp);
