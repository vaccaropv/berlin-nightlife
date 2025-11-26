import { useState, useMemo } from 'react';
import { MOCK_EVENTS, MOCK_VENUES, Event, Venue } from '../../data/mockData';
import { Calendar, MapPin, Filter } from 'lucide-react';

interface EventsViewProps {
    userLocation: [number, number] | null;
    onEventClick: (venue: Venue) => void;
}

type QueueFilter = 'All' | 'No Queue' | 'Short' | 'Medium' | 'Long';
type DoorFilter = 'All' | 'Relaxed' | 'Standard' | 'Strict' | 'Very Strict';

export default function EventsView({ userLocation, onEventClick }: EventsViewProps) {
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [maxDistance, setMaxDistance] = useState<number>(10);
    const [queueFilter, setQueueFilter] = useState<QueueFilter>('All');
    const [doorFilter, setDoorFilter] = useState<DoorFilter>('All');
    const [showFilters, setShowFilters] = useState(false);

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Get all unique genres from events
    const allGenres = useMemo(() => {
        const genres = new Set<string>();
        MOCK_EVENTS.forEach(event => event.tags.forEach(tag => genres.add(tag)));
        return Array.from(genres).sort();
    }, []);

    // Merge events with venue data and filter
    const filteredEvents = useMemo(() => {
        const eventsWithVenues = MOCK_EVENTS.map(event => {
            const venue = MOCK_VENUES.find(v => v.id === event.venueId);
            if (!venue) return null;

            const distance = userLocation
                ? calculateDistance(userLocation[0], userLocation[1], venue.coordinates[0], venue.coordinates[1])
                : 0;

            return { event, venue, distance };
        }).filter(item => item !== null) as Array<{ event: Event; venue: Venue; distance: number }>;

        // Apply filters
        return eventsWithVenues.filter(({ event, venue, distance }) => {
            // Genre filter
            if (selectedGenres.length > 0 && !event.tags.some(tag => selectedGenres.includes(tag))) {
                return false;
            }

            // Distance filter
            if (userLocation && distance > maxDistance) {
                return false;
            }

            // Queue filter
            if (queueFilter !== 'All' && venue.liveStatus?.queue !== queueFilter) {
                return false;
            }

            // Door policy filter
            if (doorFilter !== 'All' && venue.liveStatus?.doorPolicy !== doorFilter) {
                return false;
            }

            return true;
        }).sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());
    }, [selectedGenres, maxDistance, queueFilter, doorFilter, userLocation]);

    const toggleGenre = (genre: string) => {
        setSelectedGenres(prev =>
            prev.includes(genre)
                ? prev.filter(g => g !== genre)
                : [...prev, genre]
        );
    };

    const clearFilters = () => {
        setSelectedGenres([]);
        setMaxDistance(10);
        setQueueFilter('All');
        setDoorFilter('All');
    };

    const hasActiveFilters = selectedGenres.length > 0 || maxDistance < 10 || queueFilter !== 'All' || doorFilter !== 'All';

    return (
        <div className="events-view">
            {/* Header */}
            <div className="events-header">
                <h1>Events in Berlin</h1>
                <button
                    className="filter-toggle-btn"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={20} />
                    {hasActiveFilters && <span className="filter-badge">{
                        selectedGenres.length +
                        (maxDistance < 10 ? 1 : 0) +
                        (queueFilter !== 'All' ? 1 : 0) +
                        (doorFilter !== 'All' ? 1 : 0)
                    }</span>}
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

                    {/* Genre Filter */}
                    <div className="filter-section">
                        <label>Music Genre</label>
                        <div className="genre-chips">
                            {allGenres.map(genre => (
                                <button
                                    key={genre}
                                    className={`genre-chip ${selectedGenres.includes(genre) ? 'active' : ''}`}
                                    onClick={() => toggleGenre(genre)}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Distance Filter */}
                    {userLocation && (
                        <div className="filter-section">
                            <label>Distance: {maxDistance}km</label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={maxDistance}
                                onChange={(e) => setMaxDistance(Number(e.target.value))}
                                className="distance-slider"
                            />
                        </div>
                    )}

                    {/* Queue Filter */}
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

                    {/* Door Policy Filter */}
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

            {/* Events List */}
            <div className="events-list">
                {filteredEvents.length === 0 ? (
                    <div className="no-events">
                        <Calendar size={48} />
                        <p>No events match your filters</p>
                        {hasActiveFilters && (
                            <button className="clear-filters-btn" onClick={clearFilters}>
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    filteredEvents.map(({ event, venue, distance }) => (
                        <div
                            key={event.id}
                            className="event-card-full"
                            onClick={() => onEventClick(venue)}
                        >
                            <div className="event-image" style={{ backgroundImage: `url(${event.imageUrl})` }}>
                                <div className="event-date-badge">
                                    <span className="day">{new Date(event.date).getDate()}</span>
                                    <span className="month">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                </div>
                            </div>

                            <div className="event-details">
                                <h3>{event.title}</h3>
                                <div className="event-venue-info">
                                    <MapPin size={14} />
                                    <span>{venue.name}</span>
                                    {userLocation && (
                                        <span className="distance">{distance.toFixed(1)}km</span>
                                    )}
                                </div>

                                <div className="event-tags">
                                    {event.tags.map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>

                                {venue.liveStatus && (
                                    <div className="event-status">
                                        <span className="status-badge queue">
                                            Queue: {venue.liveStatus.queue}
                                        </span>
                                        <span className="status-badge door">
                                            Door: {venue.liveStatus.doorPolicy}
                                        </span>
                                    </div>
                                )}

                                <div className="event-meta">
                                    <span className="time">{event.startTime} - {event.endTime}</span>
                                    <span className="price">{event.price} {event.currency}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
