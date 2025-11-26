import { Venue, Event } from '../../data/mockData';
import { X, MapPin, Navigation, Music, ExternalLink, Users, Calendar } from 'lucide-react';
import Timetable from './Timetable';
import { SISYPHOS_EVENT } from '../../data/sisyphosData';
import TransportPanel from './TransportPanel';
import CommunityTab from './CommunityTab';
// import { getAggregatedStatus } from '../../api/communityApi';
import { getVenueStatus } from '../../utils/timeUtils';
import { useState, useEffect } from 'react';

interface VenueDetailsProps {
    venue: Venue;
    events: Event[];
    onClose: () => void;
    userLocation: [number, number] | null;
    loadingEvents?: boolean;
    onOpenReportModal: () => void;
    onLoginRequest: () => void;
}

export default function VenueDetails({ venue, events, onClose, userLocation, loadingEvents = false, onOpenReportModal, onLoginRequest }: VenueDetailsProps) {
    const [showDirections, setShowDirections] = useState(false);
    const [activeTab, setActiveTab] = useState<'events' | 'community'>('events');
    const [currentLiveStatus] = useState(venue.liveStatus);
    const [lastUpdate] = useState(0);

    // Drag Logic
    const [panelHeight, setPanelHeight] = useState(50); // vh
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ y: 0, h: 0 });

    // Touch Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setDragStart({
            y: e.touches[0].clientY,
            h: panelHeight
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;

        const deltaY = dragStart.y - e.touches[0].clientY;
        const windowHeight = window.innerHeight;
        const deltaVh = (deltaY / windowHeight) * 100;

        // Clamp between 20vh (minimized) and 95vh (full)
        const newHeight = Math.min(Math.max(dragStart.h + deltaVh, 20), 95);
        setPanelHeight(newHeight);
    };

    const snapPanel = () => {
        // Snap points
        if (panelHeight > 75) {
            setPanelHeight(95); // Full
        } else if (panelHeight < 35) {
            onClose(); // Close if dragged too low
        } else {
            setPanelHeight(50); // Half
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        snapPanel();
    };

    // Mouse Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({
            y: e.clientY,
            h: panelHeight
        });
    };

    // Global Mouse Events
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            const deltaY = dragStart.y - e.clientY;
            const windowHeight = window.innerHeight;
            const deltaVh = (deltaY / windowHeight) * 100;

            const newHeight = Math.min(Math.max(dragStart.h + deltaVh, 20), 95);
            setPanelHeight(newHeight);
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                snapPanel();
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, panelHeight]);

    return (
        <div
            className={`venue-details glass-panel ${!isDragging ? 'animate-height' : ''} ${panelHeight < 75 ? 'compact' : ''}`}
            style={{ height: `${panelHeight}vh` }}
        >
            <div
                className="drag-handle-container"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
            >
                <div className="drag-handle"></div>
            </div>
            <button className="close-btn" onClick={onClose}>
                <X size={20} />
            </button>

            <div className="venue-hero" style={{ backgroundImage: `url(${venue.imageUrl})` }}>
                <span className="venue-type-badge">{venue.type}</span>
                <div className="venue-hero-overlay">
                    <h2>{venue.name}</h2>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                        <span className="rating">★ {venue.rating}</span>
                        {(() => {
                            const status = getVenueStatus(venue);
                            return (
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    backgroundColor: status.isOpen ? 'rgba(57, 255, 20, 0.2)' : 'rgba(255, 0, 85, 0.2)',
                                    color: status.isOpen ? '#39ff14' : '#ff0055',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    marginLeft: '8px'
                                }}>
                                    <span style={{ marginRight: '4px', fontSize: '8px' }}>●</span>
                                    {status.statusText}
                                </span>
                            );
                        })()}
                    </div>
                </div>
            </div>

            <div className="venue-content">
                {currentLiveStatus && (
                    <div className="venue-live-status glass-panel" style={{
                        padding: '12px',
                        marginBottom: '16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(57, 255, 20, 0.2)',
                        background: 'rgba(57, 255, 20, 0.05)'
                    }}>
                        <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }} className="animate-pulse"></span>
                            Happening Now
                        </h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Queue:</span>
                                <span style={{ fontWeight: 700, color: currentLiveStatus.queue === 'No Queue' ? '#2bb812' : '#d32f2f' }}>
                                    {currentLiveStatus.queue}
                                </span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Door:</span>
                                <span style={{ fontWeight: 700 }}>{currentLiveStatus.doorPolicy}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="venue-actions" style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                    <button
                        className="action-btn primary"
                        onClick={() => setShowDirections(!showDirections)}
                        style={{
                            flex: 1,
                            background: 'var(--primary)',
                            color: 'black',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <Navigation size={16} />
                        {showDirections ? 'Hide Directions' : 'Get Directions'}
                    </button>
                </div>

                {showDirections && (
                    <TransportPanel userLocation={userLocation} venue={venue} />
                )}

                <div className="venue-info-row">
                    <MapPin size={16} className="icon" />
                    <p>{venue.address}</p>
                </div>

                <p className="venue-desc">{venue.description}</p>

                {/* Tabs */}
                <div className="tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                    <button
                        onClick={() => setActiveTab('events')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'events' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'events' ? 'var(--text-main)' : 'var(--text-muted)',
                            fontWeight: activeTab === 'events' ? 700 : 400,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Calendar size={16} />
                        Events
                    </button>
                    <button
                        onClick={() => setActiveTab('community')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'community' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'community' ? 'var(--text-main)' : 'var(--text-muted)',
                            fontWeight: activeTab === 'community' ? 700 : 400,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Users size={16} />
                        Community
                    </button>
                </div>

                {activeTab === 'events' ? (
                    <div className="events-section">
                        {venue.name.includes('Sisyphos') && (
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Calendar size={16} className="text-primary" />
                                    Current Lineup
                                </h3>
                                <Timetable event={SISYPHOS_EVENT} />
                            </div>
                        )}

                        {loadingEvents ? (
                            <p className="loading-events" style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '20px 0' }}>
                                Loading events...
                            </p>
                        ) : (
                            <div className="venue-events-list">
                                {events.length > 0 ? (
                                    events.map(event => (
                                        <div key={event.id} className="event-card">
                                            <div className="event-date">
                                                <span className="day">{new Date(event.date).getDate()}</span>
                                                <span className="month">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                            </div>
                                            <div className="event-info">
                                                <h4>{event.title}</h4>
                                                <div className="lineup">
                                                    <Music size={12} />
                                                    <span>{event.lineup.join(', ')}</span>
                                                </div>
                                                <div className="event-meta">
                                                    <span>{event.startTime} - {event.endTime}</span>
                                                    <span className="price">{event.price} {event.currency}</span>
                                                </div>
                                            </div>
                                            <a href={event.raLink} target="_blank" rel="noreferrer" className="ra-link">
                                                <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-events">No upcoming events listed.</p>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    // ... (rest of file)
                    <CommunityTab
                        venueId={venue.id}
                        venueName={venue.name}
                        onLoginClick={onLoginRequest}
                        onReportClick={onOpenReportModal}
                        lastUpdate={lastUpdate}
                    />
                )}
            </div>
        </div>
    );
}
