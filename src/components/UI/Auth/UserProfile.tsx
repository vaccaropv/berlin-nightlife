import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { LogOut, Edit2, FileText, Star, MapPin, Award, ChevronRight, Settings, Shield, HelpCircle } from 'lucide-react';
import { MOCK_VENUES as venues, Venue } from '../../../data/mockData';
import EditProfileView from './EditProfileView';
import './UserProfile.css';

export default function UserProfile() {
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    if (!user) return null;

    if (isEditing) {
        return <EditProfileView onClose={() => setIsEditing(false)} />;
    }

    // Helper to mask email
    const maskEmail = (email?: string) => {
        if (!email) return '';
        const [name, domain] = email.split('@');
        const maskedName = name.length > 2 ? name.substring(0, 2) + '***' : name + '***';
        return `${maskedName}@${domain}`;
    };

    // Helper to get venue name
    const getVenueName = (venueId: string) => {
        const venue = venues.find((v: Venue) => v.id === venueId);
        return venue ? venue.name : 'Unknown Venue';
    };

    // Helper to format time
    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / 1000 / 60; // minutes

        if (diff < 60) return `${Math.floor(diff)}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return date.toLocaleDateString();
    };

    // Determine reputation level
    const points = user.points || 0;
    let reputationLevel = 'Newbie';
    let badgeClass = 'badge-bronze';
    if (points > 100) { reputationLevel = 'Regular'; badgeClass = 'badge-silver'; }
    if (points > 500) { reputationLevel = 'Pro'; badgeClass = 'badge-gold'; }
    if (points > 1000) { reputationLevel = 'Legend'; badgeClass = 'badge-platinum'; }

    return (
        <div className="profile-container fade-in">
            {/* Header */}
            <div className="profile-header">
                <div className="profile-avatar">
                    {user.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="profile-info">
                    <h2>@{user.username}</h2>
                    <p className="profile-email">{maskEmail(user.email)}</p>
                    {user.favoriteVenueIds && user.favoriteVenueIds.length > 0 && (
                        <div className="favorite-venue-badge">
                            <MapPin size={12} />
                            {getVenueName(user.favoriteVenueIds[0])}
                            {user.favoriteVenueIds.length > 1 && ` +${user.favoriteVenueIds.length - 1}`}
                        </div>
                    )}
                </div>
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                    <Edit2 size={18} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <FileText size={14} /> Reports
                    </div>
                    <div className="stat-value">{user.reportCount || 0}</div>
                    <div className="stat-subtext">Keep sharing!</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <Star size={14} /> Points
                    </div>
                    <div className="stat-value">{points} XP</div>
                    <div className="stat-subtext">Level {Math.floor(points / 100) + 1}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <MapPin size={14} /> Venues
                    </div>
                    <div className="stat-value">{user.venuesReported || 0}</div>
                    <div className="stat-subtext">Unique spots</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <Award size={14} /> Reputation
                    </div>
                    <div className={`reputation-badge ${badgeClass}`}>
                        {reputationLevel}
                    </div>
                    <div className="stat-subtext">Trusted</div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="section-title">
                Your Recent Reports
            </div>
            <div className="activity-list">
                {user.recentReports && user.recentReports.length > 0 ? (
                    user.recentReports.map((report, index) => (
                        <div key={index} className="activity-item">
                            <div className="activity-icon">📝</div>
                            <div className="activity-details">
                                <div className="activity-venue">{getVenueName(report.venue_id)}</div>
                                <div className="activity-meta">
                                    <span>{formatTime(report.created_at)}</span>
                                    <span>•</span>
                                    <span>Queue: {report.queue_length}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="activity-item" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
                        No reports yet. Go explore!
                    </div>
                )}
            </div>

            {/* Achievements (Placeholder) */}
            <div className="section-title">Achievements</div>
            <div className="achievements-grid">
                <div className={`achievement-badge ${points > 0 ? 'unlocked' : ''}`}>
                    <div className="achievement-icon">🚀</div>
                    <div className="achievement-label">First Report</div>
                </div>
                <div className={`achievement-badge ${points > 50 ? 'unlocked' : ''}`}>
                    <div className="achievement-icon">🦉</div>
                    <div className="achievement-label">Night Owl</div>
                </div>
                <div className={`achievement-badge ${user.venuesReported && user.venuesReported >= 5 ? 'unlocked' : ''}`}>
                    <div className="achievement-icon">🌍</div>
                    <div className="achievement-label">Explorer</div>
                </div>
                <div className={`achievement-badge ${points > 500 ? 'unlocked' : ''}`}>
                    <div className="achievement-icon">👑</div>
                    <div className="achievement-label">Hero</div>
                </div>
            </div>

            {/* Actions */}
            <div className="primary-actions">
                <button className="action-btn btn-primary">
                    <FileText size={18} /> Submit New Report
                </button>
                <button className="action-btn btn-secondary">
                    <Award size={18} /> Invite Friends
                </button>
            </div>

            {/* Menu */}
            <div className="menu-list">
                <button className="menu-item">
                    <span><Settings size={16} style={{ marginRight: 10, verticalAlign: 'middle' }} /> Settings</span>
                    <ChevronRight size={16} />
                </button>
                <button className="menu-item">
                    <span><Shield size={16} style={{ marginRight: 10, verticalAlign: 'middle' }} /> Privacy & Security</span>
                    <ChevronRight size={16} />
                </button>
                <button className="menu-item">
                    <span><HelpCircle size={16} style={{ marginRight: 10, verticalAlign: 'middle' }} /> Help & Support</span>
                    <ChevronRight size={16} />
                </button>
                <button className="menu-item logout" onClick={logout}>
                    <LogOut size={18} style={{ marginRight: 8 }} /> Log Out
                </button>
            </div>
        </div>
    );
}
