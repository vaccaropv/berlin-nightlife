import express from 'express';
import { createReport, getRecentReports, getAggregatedStatus } from '../db/database.js';

const router = express.Router();

// Submit a status report
router.post('/', async (req, res) => {
    try {
        const {
            venueId,
            userId,
            queueLength, // Maps to queue_status
            doorPolicy,
            capacity,
            vibe, // Array of emojis
            vibeDetails,
            photoUrl
        } = req.body;

        if (!venueId || !userId || !queueLength || !doorPolicy) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const report = createReport(
            venueId,
            userId,
            queueLength,
            doorPolicy,
            capacity || 1,
            vibe || [],
            vibeDetails || '',
            photoUrl || null
        );

        res.json({ report, message: 'Report submitted successfully' });
    } catch (error) {
        console.error('Submit report error:', error);
        res.status(500).json({ error: 'Failed to submit report' });
    }
});

// Get recent reports for a venue
router.get('/:venueId', async (req, res) => {
    try {
        const { venueId } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const reports = getRecentReports(venueId, limit);

        // Hide phone numbers from response (privacy)
        const sanitizedReports = reports.map(r => ({
            id: r.id,
            username: r.username,
            queueLength: r.queue_length,
            doorPolicy: r.door_policy,
            vibe: r.vibe,
            timestamp: r.timestamp
        }));

        res.json({ reports: sanitizedReports });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Failed to get reports' });
    }
});

// Get aggregated status for a venue
router.get('/status/:venueId', async (req, res) => {
    try {
        const { venueId } = req.params;

        const status = getAggregatedStatus(venueId);

        if (!status) {
            return res.json({ status: null, message: 'No recent reports' });
        }

        res.json({ status });
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ error: 'Failed to get status' });
    }
});

export default router;
