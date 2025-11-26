import { TimelineItem } from '../data/mockData';
import { getReports, subscribeToReports, type StatusReport } from './communityApi';
import { MOCK_VENUES, MOCK_NEWS } from '../data/mockData';

/**
 * Merge community reports and events into a unified timeline
 */
export async function getTimelineItems(
    limit: number = 20,
    offset: number = 0,
    filters?: {
        type?: TimelineItem['type'][];
        venueIds?: string[];
    }
): Promise<TimelineItem[]> {
    const items: TimelineItem[] = [];

    // 1. Fetch Community Reports (Optimized: Parallel Fetch)
    // In a real app, we would have a 'getAllReports' endpoint or query
    // For now, we'll fetch for all venues in parallel instead of sequential
    const reportPromises = MOCK_VENUES.map(venue => getReports(venue.id).then(reports => ({ venue, reports })));
    const results = await Promise.all(reportPromises);

    results.forEach(({ venue, reports }) => {
        reports.forEach(report => {
            items.push({
                id: `report-${report.id}`,
                type: 'community_report' as const,
                timestamp: report.timestamp,
                venueId: venue.id,
                venueName: venue.name,
                venueLogoUrl: venue.logoUrl,
                reportData: {
                    username: report.username,
                    userId: report.id,
                    queueLength: report.queueLength,
                    doorPolicy: report.doorPolicy,
                    capacity: report.capacity,
                    vibe: report.vibeDetails || report.vibe.join(', '),
                    vibeEmojis: report.vibe,
                    photoUrl: report.photoUrl
                }
            });
        });
    });

    // 2. Fetch News (Mock Data)
    const newsItems: TimelineItem[] = MOCK_NEWS.map(news => ({
        id: news.id,
        type: 'news' as const,
        timestamp: news.timestamp,
        venueId: 'news-source', // Generic ID for news
        venueName: news.source === 'venue' ? 'Venue Update' : 'Berlin Nightlife',
        newsData: {
            title: news.title,
            content: news.content,
            source: news.source,
            imageUrl: news.imageUrl,
            tags: news.tags,
            authorName: news.authorName
        }
    }));

    // 3. Merge & Filter
    // "All" tab = Reports + News (No Events)
    if (!filters?.type || filters.type.length === 0) {
        items.push(...newsItems);
    }
    // Specific filters
    else {
        if (filters.type.includes('news')) {
            items.push(...newsItems);
        }
        // Note: 'community_report' is already added above
    }

    // Apply filters
    let filteredItems = items;
    if (filters?.type && filters.type.length > 0) {
        filteredItems = filteredItems.filter(item => filters.type!.includes(item.type));
    }
    if (filters?.venueIds && filters.venueIds.length > 0) {
        // Keep news items even when filtering by venue, or filter news by venue if applicable
        // For now, we'll keep news items if they are generic, or filter if they are venue-specific
        filteredItems = filteredItems.filter(item =>
            item.type === 'news' || filters.venueIds!.includes(item.venueId)
        );
    }

    // Sort by timestamp (most recent first)
    filteredItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    return filteredItems.slice(offset, offset + limit);
}

/**
 * Subscribe to real-time timeline updates
 * This will trigger the callback whenever a new report is submitted
 */
export function subscribeToTimeline(callback: () => void) {
    // Subscribe to all venues for now
    // In production, you might want to optimize this
    const subscriptions = MOCK_VENUES.map(venue =>
        subscribeToReports(venue.id, callback)
    );

    return {
        unsubscribe: () => {
            subscriptions.forEach(sub => sub.unsubscribe());
        }
    };
}

/**
 * Get timeline items sorted by proximity to user location
 */
export async function getTimelineItemsByDistance(
    userLocation: [number, number],
    limit: number = 20,
    offset: number = 0
): Promise<TimelineItem[]> {
    const items = await getTimelineItems(100, 0); // Get more items to sort

    // Calculate distance for each item
    const itemsWithDistance = items.map(item => {
        const venue = MOCK_VENUES.find(v => v.id === item.venueId);
        if (!venue) return { item, distance: Infinity };

        const [lat1, lon1] = userLocation;
        const [lat2, lon2] = venue.coordinates;

        // Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return { item, distance };
    });

    // Sort by distance
    itemsWithDistance.sort((a, b) => a.distance - b.distance);

    // Apply pagination
    return itemsWithDistance
        .slice(offset, offset + limit)
        .map(({ item }) => item);
}
