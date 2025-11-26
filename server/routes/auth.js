import express from 'express';
import { createOrGetUser } from '../db/database.js';

const router = express.Router();

// Login/Register with phone + username
router.post('/login', async (req, res) => {
    try {
        const { phone, username } = req.body;

        if (!phone || !username) {
            return res.status(400).json({ error: 'Phone and username are required' });
        }

        // Validate phone format (basic validation)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

        const user = createOrGetUser(phone, username);

        res.json({
            userId: user.id,
            username: user.username,
            phone: user.phone
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

export default router;
