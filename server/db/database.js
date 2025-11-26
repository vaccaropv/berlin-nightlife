import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'data.json');

// Initialize database file
function initDB() {
    if (!fs.existsSync(dbPath)) {
        const initialData = { users: [], reports: [] };
        fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    }
}

function readDB() {
    initDB();
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
}

function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Initialize database
export function initializeDatabase() {
    initDB();
    console.log('✅ Database initialized (JSON storage)');
}

// User operations
export function createOrGetUser(phone, username) {
    const db = readDB();

    // Try to find existing user
    let user = db.users.find(u => u.phone === phone);

    if (!user) {
        // Create new user
        user = {
            id: db.users.length + 1,
            phone,
            username,
            created_at: new Date().toISOString()
        };
        db.users.push(user);
        writeDB(db);
    }

    return user;
}

// Report operations
export function createReport(venueId, userId, queueStatus, doorPolicy, capacity, vibeEmojis, vibeText, photoUrl) {
    const db = readDB();

    const report = {
        id: crypto.randomUUID(), // Use UUID as requested
        venue_id: venueId,
        user_id: userId,
        queue_status: parseInt(queueStatus),
        door_policy: parseInt(doorPolicy),
        capacity: parseInt(capacity),
        vibe_emojis: vibeEmojis || [],
        vibe_text: vibeText || '',
        photo_url: photoUrl || null,
        created_at: new Date().toISOString(),
        // Mock lat/lng for now
        lat: 52.5200,
        lng: 13.4050
    };

    db.reports.push(report);
    writeDB(db);

    return report;
}

export function getRecentReports(venueId, limit = 10) {
    const db = readDB();

    const reports = db.reports
        .filter(r => r.venue_id === venueId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

    // Join with user data
    return reports.map(r => {
        const user = db.users.find(u => u.id === r.user_id);
        return {
            ...r,
            username: user?.username || 'Unknown',
            phone: user?.phone || ''
        };
    });
}

export function getAggregatedStatus(venueId) {
    const db = readDB();

    // Get reports from last 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const recentReports = db.reports.filter(r =>
        r.venue_id === venueId && new Date(r.timestamp) > twoHoursAgo
    );

    if (recentReports.length === 0) {
        return null;
    }

    // Calculate most common queue length and door policy
    const queueCounts = {};
    const doorCounts = {};

    recentReports.forEach(r => {
        queueCounts[r.queue_length] = (queueCounts[r.queue_length] || 0) + 1;
        doorCounts[r.door_policy] = (doorCounts[r.door_policy] || 0) + 1;
    });

    const mostCommonQueue = Object.entries(queueCounts).sort((a, b) => b[1] - a[1])[0][0];
    const mostCommonDoor = Object.entries(doorCounts).sort((a, b) => b[1] - a[1])[0][0];

    return {
        queue: mostCommonQueue,
        doorPolicy: mostCommonDoor,
        lastUpdate: new Date().toISOString(),
        reportCount: recentReports.length
    };
}
