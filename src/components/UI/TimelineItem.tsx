import { useState } from 'react';
import { TimelineItem as TimelineItemType } from '../../data/mockData';
import {
    Users,
    Calendar,
    AlertCircle,
    Clock,
    MapPin,
    ChevronDown,
    ChevronUp,
    Music,
    TrendingUp,
    Newspaper
} from 'lucide-react';

interface TimelineItemProps {
    item: TimelineItemType;
    onVenueClick?: (venueId: string) => void;
}

export default function TimelineItem({ item, onVenueClick }: TimelineItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getTypeIcon = () => {
        switch (item.type) {
            case 'community_report':
                return <Users size={16} className="type-icon" />;
            case 'news':
                return <Newspaper size={16} className="type-icon" />;
            case 'event':
                return <Calendar size={16} className="type-icon" />;
            case 'venue_update':
                return <TrendingUp size={16} className="type-icon" />;
            case 'alert':
                return <AlertCircle size={16} className="type-icon" />;
        }
    };

    const getTypeLabel = () => {
        switch (item.type) {
            case 'community_report':
                return 'Community Report';
            case 'news':
                return 'News';
            case 'event':
                return 'Event';
            case 'venue_update':
                return 'Venue Update';
            case 'alert':
                return 'Alert';
        }
    };

    const getQueueColor = (queue: string) => {
        switch (queue) {
            case 'No Queue': return '#2bb812';
            case 'Short': return '#39ff14';
            case 'Medium': return '#ffcc00';
            case 'Long': return '#ff8800';
            case 'Full': return '#d32f2f';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div className={`timeline-item ${item.type}`}>
            {/* Header */}
            <div className="timeline-item-header">
                <div className="venue-badge" onClick={() => onVenueClick?.(item.venueId)}>
                    {item.venueLogoUrl ? (
                        <img src={item.venueLogoUrl} alt={item.venueName} className="venue-logo" />
                    ) : (
                        <MapPin size={14} />
                    )}
                    <span className="venue-name">{item.venueName}</span>
                </div>
                <div className="timestamp">
                    <Clock size={12} />
                    <span>{formatTimestamp(item.timestamp)}</span>
                </div>
            </div>

            {/* Type Badge */}
            <div className="type-badge">
                {getTypeIcon()}
                <span>{getTypeLabel()}</span>
            </div>

            {/* Content based on type */}
            {item.type === 'community_report' && item.reportData && (
                <div className="report-content">
                    <div className="report-user">
                        <Users size={14} />
                        <span>@{item.reportData.username}</span>
                    </div>

                    <div className="report-status">
                        <div className="status-item">
                            <span className="status-label">Queue:</span>
                            <span
                                className="status-value"
                                style={{ color: getQueueColor(item.reportData.queueLength) }}
                            >
                                {item.reportData.queueLength}
                            </span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Door:</span>
                            <span className="status-value">{item.reportData.doorPolicy}</span>
                        </div>
                        {item.reportData.capacity && (
                            <div className="status-item">
                                <span className="status-label">Capacity:</span>
                                <span className="status-value">{item.reportData.capacity}</span>
                            </div>
                        )}
                    </div>

                    {item.reportData.vibeEmojis && item.reportData.vibeEmojis.length > 0 && (
                        <div className="vibe-emojis">
                            {item.reportData.vibeEmojis.map((emoji, idx) => (
                                <span key={idx} className="vibe-emoji">{emoji}</span>
                            ))}
                        </div>
                    )}

                    {item.reportData.vibe && (
                        <p className="vibe-text">"{item.reportData.vibe}"</p>
                    )}

                    {item.reportData.photoUrl && (
                        <img src={item.reportData.photoUrl} alt="Report" className="report-photo" />
                    )}
                </div>
            )}

            {item.type === 'news' && item.newsData && (
                <div className="news-content">
                    <h3 className="news-title">{item.newsData.title}</h3>

                    {item.newsData.authorName && (
                        <div className="news-author">
                            By {item.newsData.authorName}
                        </div>
                    )}

                    {item.newsData.imageUrl && (
                        <img src={item.newsData.imageUrl} alt={item.newsData.title} className="news-image" />
                    )}

                    <p className="news-excerpt">
                        {item.newsData.content.length > 200
                            ? `${item.newsData.content.substring(0, 200)}...`
                            : item.newsData.content
                        }
                    </p>

                    {item.newsData.tags && item.newsData.tags.length > 0 && (
                        <div className="news-tags">
                            {item.newsData.tags.map((tag, idx) => (
                                <span key={idx} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}

                    <div className={`source-badge ${item.newsData.source}`}>
                        {item.newsData.source === 'admin' && 'Official'}
                        {item.newsData.source === 'venue' && 'Venue'}
                        {item.newsData.source === 'scraper' && 'News'}
                    </div>
                </div>
            )}

            {item.type === 'event' && item.eventData && (
                <div className="event-content">
                    <h3 className="event-title">{item.eventData.title}</h3>

                    <div className="event-date">
                        <Calendar size={14} />
                        <span>
                            {new Date(item.eventData.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>

                    {!isExpanded && item.eventData.lineup.length > 0 && (
                        <div className="lineup-preview">
                            <Music size={14} />
                            <span>{item.eventData.lineup.slice(0, 2).join(', ')}</span>
                            {item.eventData.lineup.length > 2 && (
                                <span className="more-artists">+{item.eventData.lineup.length - 2} more</span>
                            )}
                        </div>
                    )}

                    {isExpanded && (
                        <div className="event-details">
                            <div className="lineup-full">
                                <Music size={14} />
                                <div className="artists">
                                    {item.eventData.lineup.map((artist, idx) => (
                                        <span key={idx} className="artist">{artist}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="event-tags">
                                {item.eventData.tags.map((tag, idx) => (
                                    <span key={idx} className="tag">{tag}</span>
                                ))}
                            </div>

                            <div className="event-price">
                                <span className="price">{item.eventData.price} {item.eventData.currency}</span>
                            </div>
                        </div>
                    )}

                    {item.eventData.lineup.length > 2 && (
                        <button
                            className="expand-btn"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? (
                                <>Show Less <ChevronUp size={14} /></>
                            ) : (
                                <>Show More <ChevronDown size={14} /></>
                            )}
                        </button>
                    )}
                </div>
            )}

            {(item.type === 'venue_update' || item.type === 'alert') && item.message && (
                <div className="message-content">
                    <p>{item.message}</p>
                    {item.priority && (
                        <span className={`priority-badge ${item.priority}`}>
                            {item.priority.toUpperCase()}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
