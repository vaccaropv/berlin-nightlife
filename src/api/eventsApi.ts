import { Event } from '../data/mockData';

const API_BASE_URL = 'http://localhost:3001/api';

export interface EventsResponse {
    events: Event[];
    cached?: boolean;
    error?: string;
}

/**
 * Fetch events for a specific venue from the backend API
 * @param venueId - The ID of the venue (e.g., 'tresor', 'berghain')
 * @returns Promise with events data
 */
export async function fetchEvents(venueId: string): Promise<Event[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${venueId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: EventsResponse = await response.json();
        return data.events || [];

    } catch (error) {
        console.error(`Error fetching events for ${venueId}:`, error);
        // Return empty array on error - component will use mock data as fallback
        return [];
    }
}

/**
 * Check if the backend API is available
 */
export async function checkAPIHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}
