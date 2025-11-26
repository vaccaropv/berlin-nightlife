import { useState, useMemo } from 'react';
import { MOCK_VENUES, Venue } from '../../data/mockData';
import { MapPin, Clock, Users, TrendingUp, Filter } from 'lucide-react';
import { getVenueStatus } from '../../utils/timeUtils';

interface CommunityViewProps {
    userLocation: [number, number] | null;
    onVenueClick: (venue: Venue) => void;
}

type SortOption = 'recent' | 'distance' | 'queue' | 'name';
type QueueFilter = 'All' | 'No Queue' | 'Short' | 'Medium' | 'Long';
type DoorFilter = 'All' | 'Relaxed' | 'Standard' | 'Strict' | 'Very Strict';

export default function CommunityView({ userLocation, onVenueClick }: CommunityViewProps) {
    const [sortBy, setSortBy] = useState<SortOption>('recent');
    const [queueFilter, setQueueFilter] = useState<QueueFilter>('All');
    const [doorFilter, setDoorFilter] = useState<DoorFilter>('All');
    const [showFilters, setShowFilters] = useState(false);

    // Calculate distance between two coordinates
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Get time since last update
    const getTimeSince = (timestamp: string): string => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    // Filter and sort venues
    const filteredVenues = useMemo(() => {
        let venues = MOCK_VENUES.filter(venue => {
            // Queue filter
            if (queueFilter !== 'All' && venue.liveStatus?.queue !== queueFilter) {
                return false;
            }
            // Door filter
            if (doorFilter !== 'All' && venue.liveStatus?.doorPolicy !== doorFilter) {
                return false;
            }
            return true;
        });

        // Add distance and sort
        const venuesWithDistance = venues.map(venue => ({
            venue,
            distance: userLocation
                ? calculateDistance(userLocation[0], userLocation[1], venue.coordinates[0], venue.coordinates[1])
                : 0
        }));

        // Sort
        venuesWithDistance.sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    if (!a.venue.liveStatus || !b.venue.liveStatus) return 0;
                    return new Date(b.venue.liveStatus.lastUpdate).getTime() -
                        new Date(a.venue.liveStatus.lastUpdate).getTime();
                case 'distance':
                    return a.distance - b.distance;
                case 'queue':
                    const queueOrder = { 'No Queue': 0, 'Short': 1, 'Medium': 2, 'Long': 3, 'Full': 4 };
                    const aQueue = a.venue.liveStatus?.queue || 'Medium';
                    const bQueue = b.venue.liveStatus?.queue || 'Medium';
                    return queueOrder[aQueue as keyof typeof queueOrder] - queueOrder[bQueue as keyof typeof queueOrder];
                case 'name':
                    return a.venue.name.localeCompare(b.venue.name);
                default:
                    return 0;
            }
        });

        return venuesWithDistance;
    }, [sortBy, queueFilter, doorFilter, userLocation]);

    const clearFilters = () => {
        setQueueFilter('All');
        setDoorFilter('All');
    };

    const hasActiveFilters = queueFilter !== 'All' || doorFilter !== 'All';

    return (
        <div className="community-view">
            {/* Header */}
            <div className="community-header">
                <div>
                    <h1>Community Updates</h1>
                    <p className="subtitle">Real-time reports from the scene</p>
                </div>
                <button
                    className="filter-toggle-btn"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={20} />
                    {hasActiveFilters && <span className="filter-badge">
                        {(queueFilter !== 'All' ? 1 : 0) + (doorFilter !== 'All' ? 1 : 0)}
                    </span>}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-header">
                        <h3>Filters</h3>
                        {hasActiveFilters && (
                            <button className="clear-filters-btn" onClick={clearFilters}>
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="filter-section">
                        <label>Queue Length</label>
                        <select
                            value={queueFilter}
                            onChange={(e) => setQueueFilter(e.target.value as QueueFilter)}
                            className="filter-select"
                        >
                            <option value="All">All</option>
                            <option value="No Queue">No Queue</option>
                            <option value="Short">Short</option>
                            <option value="Medium">Medium</option>
                            <option value="Long">Long</option>
                        </select>
                    </div>

                    <div className="filter-section">
                        <label>Door Policy</label>
                        <select
                            value={doorFilter}
                            onChange={(e) => setDoorFilter(e.target.value as DoorFilter)}
                            className="filter-select"
                        >
                            <option value="All">All</option>
                            <option value="Relaxed">Relaxed</option>
                            <option value="Standard">Standard</option>
                            <option value="Strict">Strict</option>
                            <option value="Very Strict">Very Strict</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Sort Options */}
            <div className="sort-bar">
                <button
                    className={`sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
                    onClick={() => setSortBy('recent')}
                >
                    <Clock size={14} />
                    Recent
                </button>
                {userLocation && (
                    <button
                        className={`sort-btn ${sortBy === 'distance' ? 'active' : ''}`}
                        onClick={() => setSortBy('distance')}
                    >
                        <MapPin size={14} />
                        Distance
                    </button>
                )}
                <button
                    className={`sort-btn ${sortBy === 'queue' ? 'active' : ''}`}
                    onClick={() => setSortBy('queue')}
                >
                    <Users size={14} />
                    Queue
                </button>
                <button
                    className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
                    onClick={() => setSortBy('name')}
                >
                    A-Z
                </button>
            </div>

            {/* Venues Grid */}
            <div className="community-grid">
                {filteredVenues.map(({ venue, distance }) => {
                    const status = getVenueStatus(venue);
                    const hasUpdate = venue.liveStatus !== undefined;

                    return (
                        <div
                            key={venue.id}
                            className="community-card"
                            onClick={() => onVenueClick(venue)}
                        >
                            {/* Venue Image */}
                            <div className="community-card-image" style={{ backgroundImage: `url(${venue.imageUrl})` }}>
                                <div className="venue-type-badge">{venue.type}</div>
                                {hasUpdate && (
                                    <div className="update-badge">
                                        <TrendingUp size={12} />
                                        {getTimeSince(venue.liveStatus!.lastUpdate)}
                                    </div>
                                )}
                            </div>

                            {/* Venue Info */}
                            <div className="community-card-content">
                                <h3>{venue.name}</h3>

                                <div className="venue-meta">
                                    <div className="meta-item">
                                        <MapPin size={12} />
                                        {userLocation ? `${distance.toFixed(1)}km` : venue.address.split(',')[1]}
                                    </div>
                                    <div className={`status-dot ${status.isOpen ? 'open' : 'closed'}`}>
                                        {status.isOpen ? 'Open' : 'Closed'}
                                    </div>
                                </div>

                                {/* Community Updates */}
                                {hasUpdate ? (
                                    <div className="community-updates">
                                        <div className="update-row">
                                            <span className="update-label">Queue:</span>
                                            <span className={`update-value queue-${venue.liveStatus!.queue.toLowerCase().replace(' ', '-')}`}>
                                                {venue.liveStatus!.queue}
                                            </span>
                                        </div>
                                        <div className="update-row">
                                            <span className="update-label">Door:</span>
                                            <span className="update-value">
                                                {venue.liveStatus!.doorPolicy}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-updates">
                                        <Users size={14} />
                                        <span>No recent updates</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredVenues.length === 0 && (
                <div className="no-venues">
                    <Users size={48} />
                    <p>No venues match your filters</p>
                    {hasActiveFilters && (
                        <button className="clear-filters-btn" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
