import { useState, useEffect, useRef, useCallback } from 'react';
import { Filter, TrendingUp, MapPin, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { UnifiedFeedItem, FeedFilter, FeedSort, VoteState } from '../../lib/communityFeed/types';
import { getUnifiedFeed, subscribeToFeed } from '../../lib/communityFeed/feedApi';
import { voteReport, getUserVotes, flagReport } from '../../lib/communityFeed/votingApi';
import { useAuth } from '../../context/AuthContext';
import ReportCard from './ReportCard';
import NewsCard from './NewsCard';
import './UnifiedFeed.css';

interface UnifiedFeedProps {
    userLocation?: [number, number];
    onVenueClick?: (venueId: string) => void;
}

export default function UnifiedFeed({ userLocation, onVenueClick }: UnifiedFeedProps) {
    const { user } = useAuth();
    const [items, setItems] = useState<UnifiedFeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    // Filters
    const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
    const [sortBy, setSortBy] = useState<FeedSort>('recent');
    const [showFilters, setShowFilters] = useState(false);

    // Voting state
    const [userVotes, setUserVotes] = useState<VoteState[]>([]);
    const [optimisticVotes, setOptimisticVotes] = useState<Map<string, VoteState>>(new Map());

    const observerTarget = useRef<HTMLDivElement>(null);
    const ITEMS_PER_PAGE = 20;

    // Load user votes
    useEffect(() => {
        if (user) {
            getUserVotes(user.userId).then(setUserVotes);
        }
    }, [user]);

    // Load feed items
    const loadItems = useCallback(async (reset: boolean = false) => {
        const currentPage = reset ? 0 : page;
        const offset = currentPage * ITEMS_PER_PAGE;

        setLoading(true);
        setError(null);

        try {
            const newItems = await getUnifiedFeed(
                { filter: activeFilter, sort: sortBy },
                ITEMS_PER_PAGE,
                offset,
                userLocation
            );

            if (reset) {
                setItems(newItems);
                setPage(0);
            } else {
                setItems(prev => [...prev, ...newItems]);
            }

            setHasMore(newItems.length === ITEMS_PER_PAGE);
        } catch (err) {
            console.error('Error loading feed:', err);
            setError('Failed to load feed. Please try again.');
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
        const subscription = subscribeToFeed(() => {
            loadItems(true);
        });

        return () => subscription.unsubscribe();
    }, [activeFilter, sortBy]);

    // Infinite scroll
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

    // Handle vote
    const handleVote = async (reportId: string, voteType: 'helpful' | 'unhelpful') => {
        if (!user) {
            // TODO: Show login prompt
            alert('Please log in to vote');
            return;
        }

        // Optimistic update
        const previousVote = userVotes.find(v => v.reportId === reportId);
        const newVote: VoteState = { reportId, voteType, isOptimistic: true };

        setOptimisticVotes(prev => new Map(prev).set(reportId, newVote));

        // Update items optimistically
        setItems(prev => prev.map(item => {
            if (item.type === 'report' && item.reportData && item.reportData.id === reportId) {
                const reportData = { ...item.reportData };

                // Remove previous vote counts
                if (previousVote) {
                    if (previousVote.voteType === 'helpful') {
                        reportData.helpful_count = Math.max(0, reportData.helpful_count - 1);
                    } else {
                        reportData.unhelpful_count = Math.max(0, reportData.unhelpful_count - 1);
                    }
                }

                // Add new vote counts
                if (voteType === 'helpful') {
                    reportData.helpful_count += 1;
                } else {
                    reportData.unhelpful_count += 1;
                }

                return { ...item, reportData };
            }
            return item;
        }));

        try {
            await voteReport(reportId, user.userId, voteType);

            // Update user votes
            setUserVotes(prev => {
                const filtered = prev.filter(v => v.reportId !== reportId);
                return [...filtered, { reportId, voteType }];
            });

            // Remove optimistic flag
            setOptimisticVotes(prev => {
                const next = new Map(prev);
                next.delete(reportId);
                return next;
            });
        } catch (err) {
            console.error('Error voting:', err);

            // Rollback optimistic update
            setOptimisticVotes(prev => {
                const next = new Map(prev);
                next.delete(reportId);
                return next;
            });

            // Reload to get correct state
            loadItems(true);

            setError('Failed to submit vote. Please try again.');
        }
    };

    // Handle flag
    const handleFlag = async (reportId: string) => {
        if (!user) {
            alert('Please log in to flag reports');
            return;
        }

        const reason = prompt('Why are you flagging this report?\n1. Spam\n2. Inappropriate\n3. Inaccurate\n4. Other');

        if (!reason) return;

        const reasonMap: { [key: string]: 'spam' | 'inappropriate' | 'inaccurate' | 'other' } = {
            '1': 'spam',
            '2': 'inappropriate',
            '3': 'inaccurate',
            '4': 'other'
        };

        const flagReason = reasonMap[reason] || 'other';

        try {
            await flagReport(reportId, user.userId, flagReason);
            alert('Report flagged. Thank you for helping keep the community safe.');
        } catch (err: any) {
            alert(err.message || 'Failed to flag report');
        }
    };

    // Handle share
    const handleShare = async (id: string) => {
        const url = `${window.location.origin}/feed/${id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Berlin Nightlife',
                    url
                });
            } catch (err) {
                // User cancelled
            }
        } else {
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        loadItems(true);
    };

    // Get user vote for report
    const getUserVote = (reportId: string): 'helpful' | 'unhelpful' | null => {
        const optimistic = optimisticVotes.get(reportId);
        if (optimistic) return optimistic.voteType;

        const vote = userVotes.find(v => v.reportId === reportId);
        return vote?.voteType || null;
    };

    return (
        <div className="unified-feed">
            {/* Header */}
            <div className="feed-header">
                <div className="header-content">
                    <h1>Community Feed</h1>
                    <p className="subtitle">Latest news and reports from the scene</p>
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
                <div className="feed-controls">
                    {/* Filter Pills */}
                    <div className="filter-pills">
                        <button
                            className={`pill ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`pill ${activeFilter === 'news' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('news')}
                        >
                            News
                        </button>
                        <button
                            className={`pill ${activeFilter === 'reports' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('reports')}
                        >
                            Reports
                        </button>
                        {userLocation && (
                            <button
                                className={`pill ${activeFilter === 'nearby' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('nearby')}
                            >
                                Nearby
                            </button>
                        )}
                    </div>

                    {/* Sort Options */}
                    <div className="sort-options">
                        <button
                            className={`sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
                            onClick={() => setSortBy('recent')}
                        >
                            <Clock size={14} />
                            Recent
                        </button>
                        <button
                            className={`sort-btn ${sortBy === 'helpful' ? 'active' : ''}`}
                            onClick={() => setSortBy('helpful')}
                        >
                            <TrendingUp size={14} />
                            Most Helpful
                        </button>
                        {userLocation && (
                            <button
                                className={`sort-btn ${sortBy === 'nearby' ? 'active' : ''}`}
                                onClick={() => setSortBy('nearby')}
                            >
                                <MapPin size={14} />
                                Nearby
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="error-banner">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* Refresh Indicator */}
            {refreshing && (
                <div className="refresh-indicator">
                    <RefreshCw size={16} className="spin" />
                    <span>Refreshing...</span>
                </div>
            )}

            {/* Feed List */}
            <div className="feed-list">
                {loading && items.length === 0 ? (
                    <div className="loading-skeleton">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="skeleton-card" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="empty-state">
                        <Clock size={48} />
                        <h3>No updates yet</h3>
                        <p>Be the first to share what's happening!</p>
                        <button className="cta-btn">Share Update</button>
                    </div>
                ) : (
                    <>
                        {items.map(item => (
                            item.type === 'report' && item.reportData ? (
                                <ReportCard
                                    key={item.id}
                                    report={item.reportData}
                                    userVote={getUserVote(item.reportData.id)}
                                    onVote={handleVote}
                                    onFlag={handleFlag}
                                    onShare={handleShare}
                                    onVenueClick={onVenueClick}
                                />
                            ) : item.type === 'news' && item.newsData ? (
                                <NewsCard
                                    key={item.id}
                                    news={item.newsData}
                                    onVenueClick={onVenueClick}
                                    onShare={handleShare}
                                />
                            ) : null
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

            {/* Refresh FAB */}
            <button
                className="refresh-fab"
                onClick={handleRefresh}
                disabled={refreshing}
            >
                <RefreshCw size={20} className={refreshing ? 'spin' : ''} />
            </button>
        </div>
    );
}
