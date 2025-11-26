import { useState, useEffect, useRef, useCallback } from 'react';
import { TimelineItem as TimelineItemType } from '../../data/mockData';
import { getTimelineItems, subscribeToTimeline, getTimelineItemsByDistance } from '../../api/timelineApi';
import TimelineItem from './TimelineItem';
import { Filter, TrendingUp, MapPin, Clock, RefreshCw } from 'lucide-react';
import './UnifiedTimeline.css';

interface UnifiedTimelineProps {
    userLocation?: [number, number];
    onVenueClick?: (venueId: string) => void;
}

type FilterType = 'all' | 'community_report' | 'news' | 'alert';
type SortType = 'recent' | 'nearby' | 'trending';

export default function UnifiedTimeline({ userLocation, onVenueClick }: UnifiedTimelineProps) {
    const [items, setItems] = useState<TimelineItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [sortBy, setSortBy] = useState<SortType>('recent');
    const [showFilters, setShowFilters] = useState(false);

    const observerTarget = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    const ITEMS_PER_PAGE = 20;

    // Load initial items
    const loadItems = useCallback(async (reset: boolean = false) => {
        const currentPage = reset ? 0 : page;
        const offset = currentPage * ITEMS_PER_PAGE;

        setLoading(true);

        try {
            let newItems: TimelineItemType[];

            if (sortBy === 'nearby' && userLocation) {
                newItems = await getTimelineItemsByDistance(
                    userLocation,
                    ITEMS_PER_PAGE,
                    offset
                );
            } else {
                const filters = activeFilter !== 'all'
                    ? { type: [activeFilter] as TimelineItemType['type'][] }
                    : undefined;

                newItems = await getTimelineItems(ITEMS_PER_PAGE, offset, filters);
            }

            if (reset) {
                setItems(newItems);
                setPage(0);
            } else {
                setItems(prev => [...prev, ...newItems]);
            }

            setHasMore(newItems.length === ITEMS_PER_PAGE);
        } catch (error) {
            console.error('Error loading timeline items:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page, activeFilter, sortBy, userLocation]);

    // Initial load
    useEffect(() => {
        loadItems(true);
    }, [activeFilter, sortBy]);

    // Real-time subscriptions
    useEffect(() => {
        const subscription = subscribeToTimeline(() => {
            // Reload timeline when new reports come in
            loadItems(true);
        });

        return () => subscription.unsubscribe();
    }, [activeFilter, sortBy]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading]);

    // Load more when page changes
    useEffect(() => {
        if (page > 0) {
            loadItems(false);
        }
    }, [page]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            loadItems(true);
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [loadItems]);

    // Pull to Refresh Logic
    const [pullStart, setPullStart] = useState(0);
    const [pullDistance, setPullDistance] = useState(0);
    const PULL_THRESHOLD = 80;

    const handleTouchStart = (e: React.TouchEvent) => {
        if (timelineRef.current && timelineRef.current.scrollTop === 0) {
            setPullStart(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (pullStart > 0 && timelineRef.current && timelineRef.current.scrollTop === 0) {
            const currentY = e.touches[0].clientY;
            const diff = currentY - pullStart;
            if (diff > 0) {
                setPullDistance(Math.min(diff * 0.5, 120)); // Resistance effect
            }
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance > PULL_THRESHOLD) {
            await handleRefresh();
        }
        setPullStart(0);
        setPullDistance(0);
    };

    // Pull to refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadItems(true);
    };

    const handleFilterChange = (filter: FilterType) => {
        setActiveFilter(filter);
        setPage(0);
    };

    const handleSortChange = (sort: SortType) => {
        setSortBy(sort);
        setPage(0);
    };

    return (
        <div className="unified-timeline">
            {/* Header with Tabs */}
            <div className="timeline-header">
                <div className="header-content">
                    <h1>Timeline</h1>
                </div>

                {/* Tab Navigation */}
                <div className="timeline-tabs">
                    <button
                        className={`tab ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All
                    </button>
                    <button
                        className={`tab ${activeFilter === 'community_report' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('community_report')}
                    >
                        Reports
                    </button>
                    <button
                        className={`tab ${activeFilter === 'news' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('news')}
                    >
                        News
                    </button>
                </div>

                <button
                    className={`filter-toggle ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={20} />
                </button>
            </div>

            {/* Filters & Sort */}
            {showFilters && (
                <div className="timeline-controls">
                    {/* Additional Filters */}
                    <div className="filter-chips">
                        <button
                            className={`chip ${activeFilter === 'alert' ? 'active' : ''}`}
                            onClick={() => handleFilterChange('alert')}
                        >
                            Alerts Only
                        </button>
                    </div>

                    {/* Sort Options */}
                    <div className="sort-options">
                        <button
                            className={`sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
                            onClick={() => handleSortChange('recent')}
                        >
                            <Clock size={14} />
                            Recent
                        </button>
                        {userLocation && (
                            <button
                                className={`sort-btn ${sortBy === 'nearby' ? 'active' : ''}`}
                                onClick={() => handleSortChange('nearby')}
                            >
                                <MapPin size={14} />
                                Nearby
                            </button>
                        )}
                        <button
                            className={`sort-btn ${sortBy === 'trending' ? 'active' : ''}`}
                            onClick={() => handleSortChange('trending')}
                        >
                            <TrendingUp size={14} />
                            Trending
                        </button>
                    </div>
                </div>
            )}

            {/* Pull to Refresh Indicator */}
            <div
                className="pull-indicator"
                style={{
                    height: pullDistance > 0 ? `${pullDistance}px` : (refreshing ? '60px' : '0'),
                    opacity: pullDistance > 0 || refreshing ? 1 : 0
                }}
            >
                <div className="pull-content">
                    <RefreshCw
                        size={24}
                        className={refreshing ? 'spin' : ''}
                        style={{ transform: `rotate(${pullDistance * 2}deg)` }}
                    />
                    <span>{refreshing ? 'Refreshing...' : 'Pull to refresh'}</span>
                </div>
            </div>

            {/* Timeline List */}
            <div
                className="timeline-list"
                ref={timelineRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {loading && items.length === 0 ? (
                    <div className="loading-skeleton">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="skeleton-item" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="empty-state">
                        <Clock size={48} />
                        <h3>No updates yet</h3>
                        <p>Be the first to share what's happening!</p>
                    </div>
                ) : (
                    <>
                        {items.map(item => (
                            <TimelineItem
                                key={item.id}
                                item={item}
                                onVenueClick={onVenueClick}
                            />
                        ))}

                        {/* Infinite Scroll Trigger */}
                        {hasMore && (
                            <div ref={observerTarget} className="load-more-trigger">
                                {loading && (
                                    <div className="loading-more">
                                        <RefreshCw size={16} className="spin" />
                                        <span>Loading more...</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {!hasMore && items.length > 0 && (
                            <div className="end-message">
                                <p>You're all caught up! 🎉</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
