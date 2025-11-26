import { Calendar, MapPin, Share2, ExternalLink, Tag } from 'lucide-react';
import { News } from '../../lib/communityFeed/types';
import { MOCK_VENUES } from '../../data/mockData';
import './NewsCard.css';

interface NewsCardProps {
    news: News;
    onVenueClick?: (venueId: string) => void;
    onShare: (newsId: string) => void;
}

export default function NewsCard({ news, onVenueClick, onShare }: NewsCardProps) {
    const venue = news.venue_id ? MOCK_VENUES.find(v => v.id === news.venue_id) : null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getSourceBadge = () => {
        switch (news.source) {
            case 'admin':
                return { label: 'Official', color: '#39ff14' };
            case 'venue':
                return { label: 'Venue', color: '#00ccff' };
            case 'scraper':
                return { label: 'News', color: '#ff0055' };
        }
    };

    const sourceBadge = getSourceBadge();

    return (
        <div className="news-card">
            {/* Header */}
            <div className="news-card-header">
                <div
                    className="source-badge"
                    style={{ borderColor: sourceBadge.color, color: sourceBadge.color }}
                >
                    {sourceBadge.label}
                </div>
                <div className="news-date">
                    <Calendar size={12} />
                    <span>{formatDate(news.published_at)}</span>
                </div>
            </div>

            {/* Image */}
            {news.image_url && (
                <div className="news-image">
                    <img src={news.image_url} alt={news.title} loading="lazy" />
                </div>
            )}

            {/* Content */}
            <div className="news-content">
                <h3 className="news-title">{news.title}</h3>

                {news.author_name && (
                    <div className="news-author">By {news.author_name}</div>
                )}

                <p className="news-excerpt">
                    {news.content.length > 200
                        ? `${news.content.substring(0, 200)}...`
                        : news.content
                    }
                </p>

                {/* Tags */}
                {news.tags && news.tags.length > 0 && (
                    <div className="news-tags">
                        {news.tags.map((tag, idx) => (
                            <span key={idx} className="tag">
                                <Tag size={10} />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Venue Link */}
                {venue && (
                    <div
                        className="news-venue"
                        onClick={() => onVenueClick?.(venue.id)}
                    >
                        {venue.logoUrl ? (
                            <img src={venue.logoUrl} alt={venue.name} className="venue-logo" />
                        ) : (
                            <MapPin size={14} />
                        )}
                        <span>{venue.name}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="news-actions">
                {news.source_url && (
                    <a
                        href={news.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn primary"
                    >
                        <ExternalLink size={16} />
                        <span>Read More</span>
                    </a>
                )}
                <button
                    className="action-btn secondary"
                    onClick={() => onShare(news.id)}
                >
                    <Share2 size={16} />
                    <span>Share</span>
                </button>
            </div>
        </div>
    );
}
