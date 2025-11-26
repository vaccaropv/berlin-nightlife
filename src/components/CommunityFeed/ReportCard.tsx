import { useState } from 'react';
import { Users, Clock, MapPin, ThumbsUp, ThumbsDown, Flag, Share2, Music } from 'lucide-react';
import { EnhancedReport } from '../../lib/communityFeed/types';
import { MOCK_VENUES } from '../../data/mockData';
import FreshnessDot from './FreshnessDot';
import ConfidenceBadge from './ConfidenceBadge';
import PhotoGallery from './PhotoGallery';
import './ReportCard.css';

interface ReportCardProps {
    report: EnhancedReport;
    userVote?: 'helpful' | 'unhelpful' | null;
    onVote: (reportId: string, voteType: 'helpful' | 'unhelpful') => void;
    onFlag: (reportId: string) => void;
    onShare: (reportId: string) => void;
    onVenueClick?: (venueId: string) => void;
}

export default function ReportCard({
    report,
    userVote,
    onVote,
    onFlag,
    onShare,
    onVenueClick
}: ReportCardProps) {
    const [isVoting, setIsVoting] = useState(false);

    const venue = MOCK_VENUES.find(v => v.id === report.venue_id);

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
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

    const handleVote = async (voteType: 'helpful' | 'unhelpful') => {
        if (isVoting) return;

        setIsVoting(true);
        try {
            await onVote(report.id, voteType);
        } finally {
            setIsVoting(false);
        }
    };

    return (
        <div className="report-card">
            {/* Header */}
            <div className="report-card-header">
                <div className="user-info">
                    <div className="avatar">
                        {report.avatar_url ? (
                            <img src={report.avatar_url} alt={report.username} />
                        ) : (
                            <Users size={16} />
                        )}
                    </div>
                    <div className="user-details">
                        <span className="username">
                            {report.username || 'Anonymous'}
                        </span>
                        <div className="meta">
                            <Clock size={12} />
                            <span>{formatTimestamp(report.created_at)}</span>
                            <FreshnessDot
                                freshness={report.freshness}
                                timestamp={report.created_at}
                            />
                        </div>
                    </div>
                </div>

                <div className="venue-badge" onClick={() => onVenueClick?.(report.venue_id)}>
                    {venue?.logoUrl ? (
                        <img src={venue.logoUrl} alt={venue.name} className="venue-logo" />
                    ) : (
                        <MapPin size={14} />
                    )}
                    <span>{venue?.name || 'Unknown Venue'}</span>
                </div>
            </div>

            {/* Confidence Badge */}
            <div className="confidence-section">
                <ConfidenceBadge
                    level={report.confidence_level}
                    recentReportCount={report.recent_report_count}
                />
                <span className="report-label">Community Report</span>
            </div>

            {/* Status Grid */}
            <div className="status-grid">
                <div className="status-item">
                    <span className="status-label">Queue</span>
                    <span
                        className="status-value"
                        style={{ color: getQueueColor(report.queue_length) }}
                    >
                        {report.queue_length}
                    </span>
                </div>
                <div className="status-item">
                    <span className="status-label">Door</span>
                    <span className="status-value">{report.door_policy}</span>
                </div>
                <div className="status-item">
                    <span className="status-label">Capacity</span>
                    <span className="status-value">{report.capacity}</span>
                </div>
            </div>

            {/* Vibe Section */}
            {(report.vibe.length > 0 || report.vibe_details) && (
                <div className="vibe-section">
                    {report.vibe.length > 0 && (
                        <div className="vibe-emojis">
                            {report.vibe.map((emoji, idx) => (
                                <span key={idx} className="vibe-emoji">{emoji}</span>
                            ))}
                        </div>
                    )}
                    {report.vibe_details && (
                        <p className="vibe-text">"{report.vibe_details}"</p>
                    )}
                </div>
            )}

            {/* Photo Gallery */}
            {report.photos && report.photos.length > 0 && (
                <PhotoGallery photos={report.photos} />
            )}

            {/* Actions */}
            <div className="report-actions">
                <div className="vote-actions">
                    <button
                        className={`vote-btn helpful ${userVote === 'helpful' ? 'active' : ''}`}
                        onClick={() => handleVote('helpful')}
                        disabled={isVoting}
                    >
                        <ThumbsUp size={16} />
                        <span>{report.helpful_count}</span>
                    </button>
                    <button
                        className={`vote-btn unhelpful ${userVote === 'unhelpful' ? 'active' : ''}`}
                        onClick={() => handleVote('unhelpful')}
                        disabled={isVoting}
                    >
                        <ThumbsDown size={16} />
                        <span>{report.unhelpful_count}</span>
                    </button>
                </div>

                <div className="secondary-actions">
                    <button className="action-btn" onClick={() => onFlag(report.id)}>
                        <Flag size={16} />
                    </button>
                    <button className="action-btn" onClick={() => onShare(report.id)}>
                        <Share2 size={16} />
                    </button>
                </div>
            </div>

            {/* Helpful Count Text */}
            {report.helpful_count > 0 && (
                <div className="helpful-text">
                    {report.helpful_count} {report.helpful_count === 1 ? 'person' : 'people'} found this helpful
                </div>
            )}
        </div>
    );
}
