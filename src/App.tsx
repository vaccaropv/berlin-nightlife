import { useState, useEffect } from 'react';
import Map from './components/Map/Map';
import VenueDetails from './components/UI/VenueDetails';
import LiveFeed from './components/UI/LiveFeed';
import EventsView from './components/UI/EventsView';
import UnifiedTimeline from './components/UI/UnifiedTimeline';
import ProfileView from './components/UI/ProfileView';
import WeatherWidget from './components/UI/WeatherWidget';
import FloatingActionButton from './components/UI/FloatingActionButton';
import ReportModal from './components/UI/ReportModal';
import CommunityVenueModal from './components/UI/CommunityVenueModal';
import { MOCK_VENUES, MOCK_EVENTS, MOCK_LIVE_UPDATES, type Venue, type Event } from './data/mockData';
import { fetchEvents } from './api/eventsApi';
import './App.css';
import './components/UI/LiveMode.css';

type ActiveTab = 'map' | 'events' | 'timeline' | 'profile';

import MapFilter, { FilterState } from './components/Map/MapFilter';

function App() {
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number]>([52.5200, 13.4050]); // Default to Berlin
    const [events, setEvents] = useState<Event[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('map');
    const [showQuickReportModal, setShowQuickReportModal] = useState(false);
    const [reportModalVenueId, setReportModalVenueId] = useState<string | undefined>(undefined);
    const [reportModalVenueName, setReportModalVenueName] = useState<string | undefined>(undefined);

    // Filter state
    const [filters, setFilters] = useState<FilterState>({
        queue: [],
        doorPolicy: [],
        price: [],
        genre: [],
        type: []
    });

    // Get user's location
    const refreshUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (_error) => {
                    console.log('Using default Berlin location');
                }
            );
        }
    };

    useEffect(() => {
        refreshUserLocation();
    }, []);

    // Fetch events when venue is selected
    useEffect(() => {
        if (!selectedVenue) {
            setEvents([]);
            return;
        }

        const loadEvents = async () => {
            setLoadingEvents(true);

            const mockEvents = MOCK_EVENTS.filter(e => e.venueId === selectedVenue.id);
            setEvents(mockEvents);

            try {
                const apiEvents = await fetchEvents(selectedVenue.id);
                if (apiEvents.length > 0 && !apiEvents[0].title.includes('Scraping Error')) {
                    console.log(`✅ Enhanced with ${apiEvents.length} events from API for ${selectedVenue.name}`);
                    setEvents(apiEvents);
                }
            } catch (error) {
                console.log(`📋 Using mock data for ${selectedVenue.name}`);
            }

            setLoadingEvents(false);
        };

        loadEvents();
    }, [selectedVenue]);

    const handleVenueClick = (venue: Venue) => {
        setSelectedVenue(venue);
        if (activeTab !== 'timeline') {
            setActiveTab('map');
        }
    };

    const handleOpenReportModal = (venueId?: string, venueName?: string) => {
        setReportModalVenueId(venueId);
        setReportModalVenueName(venueName);
        setShowQuickReportModal(true);
    };

    const handleCloseReportModal = () => {
        setShowQuickReportModal(false);
        setReportModalVenueId(undefined);
        setReportModalVenueName(undefined);
    };

    // Filtering Logic
    const getHighlightedVenueIds = (): string[] | undefined => {
        const hasActiveFilters = Object.values(filters).some(f => f.length > 0);
        if (!hasActiveFilters) return undefined;

        return MOCK_VENUES.filter(venue => {
            // Queue Filter
            if (filters.queue.length > 0) {
                if (!venue.liveStatus || !filters.queue.includes(venue.liveStatus.queue)) return false;
            }

            // Door Policy Filter
            if (filters.doorPolicy.length > 0) {
                if (!venue.liveStatus || !filters.doorPolicy.includes(venue.liveStatus.doorPolicy)) return false;
            }

            // Type Filter
            if (filters.type.length > 0) {
                if (!filters.type.includes(venue.type)) return false;
            }

            // Genre Filter
            if (filters.genre.length > 0) {
                const venueGenres = venue.genre || [];
                const hasMatchingGenre = venueGenres.some(g => filters.genre.includes(g));
                if (!hasMatchingGenre) return false;
            }

            // Price Filter (Complex: Check upcoming events)
            if (filters.price.length > 0) {
                const venueEvents = MOCK_EVENTS.filter(e => e.venueId === venue.id);
                if (venueEvents.length === 0) return false; // No events to check price against

                const hasMatchingPrice = venueEvents.some(event => {
                    return filters.price.some(priceFilter => {
                        if (priceFilter === '< €15') return event.price < 15;
                        if (priceFilter === '€15-25') return event.price >= 15 && event.price <= 25;
                        if (priceFilter === '> €25') return event.price > 25;
                        return false;
                    });
                });
                if (!hasMatchingPrice) return false;
            }

            return true;
        }).map(v => v.id);
    };

    const highlightedVenueIds = getHighlightedVenueIds();

    return (
        <div className="app">
            {activeTab === 'map' && (
                <>
                    {!selectedVenue && <WeatherWidget />}
                    <MapFilter
                        filters={filters}
                        onFilterChange={setFilters}
                        onVenueSelect={setSelectedVenue}
                    />
                    <LiveFeed updates={MOCK_LIVE_UPDATES} />

                    <Map
                        venues={MOCK_VENUES}
                        selectedVenue={selectedVenue}
                        onVenueSelect={setSelectedVenue}
                        userLocation={userLocation}
                        highlightedVenueIds={highlightedVenueIds}
                        onLocateUser={refreshUserLocation}
                    />
                </>
            )}

            {activeTab === 'events' && (
                <EventsView
                    userLocation={userLocation}
                    onEventClick={handleVenueClick}
                />
            )}

            {activeTab === 'timeline' && (
                <UnifiedTimeline
                    userLocation={userLocation}
                    onVenueClick={(venueId) => {
                        const venue = MOCK_VENUES.find(v => v.id === venueId);
                        if (venue) handleVenueClick(venue);
                    }}
                />
            )}

            {activeTab === 'profile' && (
                <ProfileView />
            )}

            {selectedVenue && activeTab === 'map' && (
                <div className="panel-container open">
                    <VenueDetails
                        venue={selectedVenue}
                        events={events}
                        onClose={() => setSelectedVenue(null)}
                        userLocation={userLocation}
                        loadingEvents={loadingEvents}
                        onOpenReportModal={() => handleOpenReportModal(selectedVenue.id, selectedVenue.name)}
                        onLoginRequest={() => {
                            setActiveTab('profile');
                            setSelectedVenue(null);
                        }}
                    />
                </div>
            )}

            {selectedVenue && activeTab === 'timeline' && (
                <CommunityVenueModal
                    venue={selectedVenue}
                    onClose={() => setSelectedVenue(null)}
                    onReportClick={() => handleOpenReportModal(selectedVenue.id, selectedVenue.name)}
                    onLoginClick={() => {
                        setActiveTab('profile');
                        setSelectedVenue(null);
                    }}
                />
            )}

            {!selectedVenue && (
                <div className="bottom-nav glass-panel">
                    <div
                        className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
                        onClick={() => setActiveTab('map')}
                    >
                        Map
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
                        onClick={() => setActiveTab('events')}
                    >
                        Events
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'timeline' ? 'active' : ''}`}
                        onClick={() => setActiveTab('timeline')}
                    >
                        Timeline
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </div>
                </div>
            )}

            {(activeTab === 'map' || activeTab === 'timeline') && (
                <FloatingActionButton onClick={() => handleOpenReportModal()} />
            )}

            <ReportModal
                isOpen={showQuickReportModal}
                onClose={handleCloseReportModal}
                venueId={reportModalVenueId}
                venueName={reportModalVenueName}
                onSuccess={() => {
                    // Refresh data if needed
                    console.log('Report submitted successfully');
                }}
            />
        </div>
    );
}

export default App;
