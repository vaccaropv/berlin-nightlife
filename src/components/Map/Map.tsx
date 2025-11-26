import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Venue } from '../../data/mockData';
import { useEffect } from 'react';
import { createCustomPin, createClusterIcon } from './MapIcons';
import { getVenueStatus } from '../../utils/timeUtils';
import 'leaflet/dist/leaflet.css';
import './MapPopup.css';

import { Locate } from 'lucide-react';

interface MapProps {
    venues: Venue[];
    onVenueSelect: (venue: Venue) => void;
    selectedVenue: Venue | null;
    userLocation: [number, number] | null;
    highlightedVenueIds?: string[];
    onLocateUser: () => void;
}

function LocateControl({ onLocate }: { onLocate: () => void }) {
    const map = useMap();

    const handleLocate = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.flyTo([latitude, longitude], 15, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });
                onLocate(); // Update global state
            },
            (error) => {
                console.error("Error getting location", error);
            }
        );
    };

    return (
        <button
            onClick={handleLocate}
            style={{
                position: 'absolute',
                bottom: '160px', // Moved up to avoid FAB overlap
                right: '16px',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(15, 15, 15, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 800, // Below panels but above map
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.2s ease'
            }}
            className="locate-btn"
        >
            <Locate size={20} />
        </button>
    );
}

function MapController({ selectedVenue }: { selectedVenue: Venue | null }) {
    const map = useMap();

    useEffect(() => {
        // Force map to recalculate size to prevent black screen
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);

    useEffect(() => {
        if (selectedVenue) {
            const targetZoom = 16;
            const isMobile = window.innerWidth < 768;

            if (isMobile) {
                // On mobile, the bottom sheet takes up 50% of the screen.
                // We want the venue to be centered in the top 50% visible area.
                // So we offset the center downwards by 25% of the screen height.
                const mapHeight = map.getSize().y;
                const offset = mapHeight * 0.25;

                // Project venue coordinates to pixels at target zoom
                const venuePoint = map.project(selectedVenue.coordinates, targetZoom);

                // Calculate new center point (map center needs to be below the venue)
                const targetPoint = L.point(venuePoint.x, venuePoint.y + offset);

                // Unproject back to coordinates
                const targetCenter = map.unproject(targetPoint, targetZoom);

                map.flyTo(targetCenter, targetZoom, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });
            } else {
                // Desktop behavior (center normally)
                map.flyTo(selectedVenue.coordinates, targetZoom, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });
            }
        }
    }, [selectedVenue, map]);

    return null;
}

export default function Map({ venues, onVenueSelect, selectedVenue, userLocation, highlightedVenueIds, onLocateUser }: MapProps) {
    const berlinCenter: [number, number] = [52.5200, 13.4050];

    const getStatusColorClass = (value: string, type: 'door' | 'queue') => {
        const v = value.toLowerCase();
        if (type === 'door') {
            if (v.includes('relaxed')) return 'status-green';
            if (v.includes('standard')) return 'status-yellow';
            if (v.includes('very strict')) return 'status-red';
            if (v.includes('strict')) return 'status-orange';
        }
        if (type === 'queue') {
            if (v.includes('no queue')) return 'status-green';
            if (v.includes('short')) return 'status-yellow';
            if (v.includes('medium')) return 'status-orange';
            if (v.includes('long') || v.includes('full')) return 'status-red';
        }
        return '';
    };

    return (
        <MapContainer
            center={berlinCenter}
            zoom={12}
            style={{ height: '100%', width: '100%', background: '#0a0a0a', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            <MapController selectedVenue={selectedVenue} />
            <LocateControl onLocate={onLocateUser} />

            {/* User Location */}
            {userLocation && (
                <Marker
                    position={userLocation}
                    icon={L.divIcon({
                        className: 'user-location-marker',
                        html: '<div style="width: 16px; height: 16px; background: #0099ff; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #0099ff;"></div>',
                        iconSize: [16, 16]
                    })}
                />
            )}

            <MarkerClusterGroup
                chunkedLoading
                iconCreateFunction={createClusterIcon}
                maxClusterRadius={40}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
            >
                {venues.map((venue) => {
                    const status = getVenueStatus(venue);
                    const isHighlighted = highlightedVenueIds ? highlightedVenueIds.includes(venue.id) : true;

                    // If we have filters active (highlightedVenueIds is defined), 
                    // dim non-matching venues instead of hiding them completely
                    const opacity = highlightedVenueIds && !isHighlighted ? 0.3 : 1;
                    const zIndexOffset = venue.isPromoted ? 1000 : 0;

                    return (
                        <Marker
                            key={venue.id}
                            position={venue.coordinates}
                            icon={createCustomPin(venue, status.mapStatus)}
                            opacity={opacity}
                            zIndexOffset={zIndexOffset}
                            eventHandlers={{
                                click: () => {
                                    onVenueSelect(venue);
                                }
                            }}
                        >
                            <Popup className="custom-popup" closeButton={false} offset={[90, 6]}>
                                <div className="compact-popup">
                                    <h3>{venue.name}</h3>

                                    <div className="popup-row">
                                        <span className="popup-label">Status:</span>
                                        <span className={`popup-value ${status.isOpen ? 'open' : 'closed'}`}>
                                            {status.isOpen ? 'Open' : 'Closed'}
                                        </span>
                                    </div>

                                    {venue.liveStatus && (
                                        <>
                                            <div className="popup-row">
                                                <span className="popup-label">Queue:</span>
                                                <span className={`popup-value ${getStatusColorClass(venue.liveStatus.queue, 'queue')}`}>
                                                    {venue.liveStatus.queue}
                                                </span>
                                            </div>
                                            <div className="popup-row">
                                                <span className="popup-label">Door:</span>
                                                <span className={`popup-value ${getStatusColorClass(venue.liveStatus.doorPolicy, 'door')}`}>
                                                    {venue.liveStatus.doorPolicy}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MarkerClusterGroup>
        </MapContainer>
    );
}
