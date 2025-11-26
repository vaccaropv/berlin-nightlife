import express from 'express';
import cors from 'cors';
import NodeCache from 'node-cache';
import { scrapeTresorEvents } from './scrapers/tresorScraper.js';
import { scrapeBerghainEvents } from './scrapers/berghainScraper.js';
import { scrapeRenateEvents } from './scrapers/renateScraper.js';
import { scrapeRAEvents } from './scrapers/raScraper.js';
import { initializeDatabase } from './db/database.js';
import authRoutes from './routes/auth.js';
import reportsRoutes from './routes/reports.js';

const app = express();
const PORT = 3001;

// Initialize database
initializeDatabase();

// Cache with 1 hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

// Enable CORS for frontend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Berlin Nightlife API is running' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Reports routes
app.use('/api/reports', reportsRoutes);

// Get events for a specific venue
app.get('/api/events/:venueId', async (req, res) => {
    const { venueId } = req.params;
    const cacheKey = `events-${venueId}`;

    try {
        // Check cache first
        const cachedEvents = cache.get(cacheKey);
        if (cachedEvents) {
            console.log(`📦 Returning cached events for ${venueId}`);
            return res.json({ events: cachedEvents, cached: true });
        }

        // Scrape based on venue
        let events = [];

        switch (venueId.toLowerCase()) {
            case 'tresor':
                events = await scrapeTresorEvents();
                break;
            case 'berghain':
                events = await scrapeBerghainEvents();
                break;
            case 'renate':
                events = await scrapeRenateEvents();
                break;
            default:
                // For other venues, try RA scraper (not implemented yet)
                events = await scrapeRAEvents(venueId);
                break;
        }

        // Cache the results
        if (events.length > 0) {
            cache.set(cacheKey, events);
        }

        res.json({ events, cached: false });

    } catch (error) {
        console.error(`❌ Error fetching events for ${venueId}:`, error);
        res.status(500).json({
            error: 'Failed to fetch events',
            message: error.message,
            events: []
        });
    }
});

// Clear cache endpoint (for development)
app.post('/api/cache/clear', (req, res) => {
    cache.flushAll();
    res.json({ message: 'Cache cleared' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api/events/:venueId`);
    console.log(`👥 Community API: http://localhost:${PORT}/api/reports`);
});
