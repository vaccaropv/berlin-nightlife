import { supabase } from '../supabase';
import type { News, EnhancedReport, UnifiedFeedItem, FeedFilters } from './types';
import { MOCK_VENUES } from '../../data/mockData';

/**
 * Fetch news items from Supabase
 */
export async function getNews(
    limit: number = 20,
    offset: number = 0,
    venueId?: string
): Promise<News[]> {
    try {
        let query = supabase
            .from('news')
            .select('*')
            .order('published_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (venueId) {
            query = query.or(`venue_id.eq.${venueId},venue_id.is.null`);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}

/**
 * Fetch enhanced reports from Supabase view
 */
export async function getEnhancedReports(
    limit: number = 20,
    offset: number = 0,
    venueId?: string
): Promise<EnhancedReport[]> {
    try {
        let query = supabase
            .from('enhanced_reports')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (venueId) {
            query = query.eq('venue_id', venueId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching enhanced reports:', error);
        return [];
    }
}

/**
 * Fetch unified feed (merged news + reports)
 */
export async function getUnifiedFeed(
    filters: FeedFilters,
    limit: number = 20,
    offset: number = 0,
    userLocation?: [number, number]
): Promise<UnifiedFeedItem[]> {
    const items: UnifiedFeedItem[] = [];

    try {
        // Fetch news if needed
        if (filters.filter === 'all' || filters.filter === 'news') {
            const news = await getNews(limit, offset, filters.venueId);
            news.forEach(newsItem => {
                items.push({
                    id: `news-${newsItem.id}`,
                    type: 'news',
                    created_at: newsItem.published_at,
                    newsData: newsItem
                });
            });
        }

        // Fetch reports if needed
        if (filters.filter === 'all' || filters.filter === 'reports') {
            const reports = await getEnhancedReports(limit, offset, filters.venueId);
            reports.forEach(report => {
                items.push({
                    id: `report-${report.id}`,
                    type: 'report',
                    created_at: report.created_at,
                    reportData: report
                });
            });
        }

        // Sort by created_at
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Apply sorting
        if (filters.sort === 'helpful') {
            items.sort((a, b) => {
                const aHelpful = a.reportData?.helpful_count || 0;
                const bHelpful = b.reportData?.helpful_count || 0;
                return bHelpful - aHelpful;
            });
        } else if (filters.sort === 'nearby' && userLocation) {
            items.sort((a, b) => {
                const aVenueId = a.reportData?.venue_id || a.newsData?.venue_id;
                const bVenueId = b.reportData?.venue_id || b.newsData?.venue_id;

                const aVenue = MOCK_VENUES.find(v => v.id === aVenueId);
                const bVenue = MOCK_VENUES.find(v => v.id === bVenueId);

                if (!aVenue || !bVenue) return 0;

                const aDistance = calculateDistance(userLocation, aVenue.coordinates);
                const bDistance = calculateDistance(userLocation, bVenue.coordinates);

                return aDistance - bDistance;
            });
        }

        return items.slice(0, limit);
    } catch (error) {
        console.error('Error fetching unified feed:', error);
        return [];
    }
}

/**
 * Subscribe to real-time feed updates
 */
export function subscribeToFeed(callback: () => void) {
    const channel = supabase
        .channel('feed-updates')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'status_reports'
        }, () => {
            console.log('New report received');
            callback();
        })
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'news'
        }, () => {
            console.log('New news received');
            callback();
        })
        .subscribe();

    return {
        unsubscribe: () => {
            supabase.removeChannel(channel);
        }
    };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
    coord1: [number, number],
    coord2: [number, number]
): number {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
