// Enhanced Community Feed - TypeScript Types

export interface News {
    id: string;
    title: string;
    content: string;
    source: 'admin' | 'venue' | 'scraper';
    source_url?: string;
    venue_id?: string;
    author_name?: string;
    image_url?: string;
    tags: string[];
    priority: number;
    published_at: string;
    created_at: string;
    updated_at: string;
}

export interface EnhancedReport {
    id: string;
    user_id: string;
    username: string;
    avatar_url?: string;
    venue_id: string;
    queue_length: string;
    door_policy: string;
    capacity: string;
    vibe: string[];
    vibe_details?: string;
    photos: string[];
    helpful_count: number;
    unhelpful_count: number;
    flag_count: number;
    created_at: string;
    timestamp: string;

    // Calculated fields from view
    recent_report_count: number;
    confidence_level: 'high' | 'medium' | 'low';
    freshness: 'fresh' | 'recent' | 'old';
}

export interface ReportVote {
    id: string;
    report_id: string;
    user_id: string;
    vote_type: 'helpful' | 'unhelpful';
    created_at: string;
}

export interface ReportFlag {
    id: string;
    report_id: string;
    user_id: string;
    reason: 'spam' | 'inappropriate' | 'inaccurate' | 'other';
    details?: string;
    created_at: string;
}

export type FeedItemType = 'news' | 'report';

export interface UnifiedFeedItem {
    id: string;
    type: FeedItemType;
    created_at: string;

    // News data
    newsData?: News;

    // Report data
    reportData?: EnhancedReport;
}

export type FeedFilter = 'all' | 'news' | 'reports' | 'nearby';
export type FeedSort = 'recent' | 'helpful' | 'nearby';

export interface FeedFilters {
    filter: FeedFilter;
    sort: FeedSort;
    venueId?: string;
}

export interface VoteState {
    reportId: string;
    voteType: 'helpful' | 'unhelpful' | null;
    isOptimistic?: boolean;
}
