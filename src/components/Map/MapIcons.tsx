import L from 'leaflet';
import { Venue } from '../../data/mockData';
import { MapStatus } from '../../utils/timeUtils';

const getStatusColor = (status: MapStatus): string => {
    switch (status) {
        case 'open': return '#39ff14'; // Green
        case 'closed': return '#ff0055'; // Red
        case 'opening_soon': return '#ffeb3b'; // Yellow
        case 'special_event': return '#bf40bf'; // Purple
        default: return '#888';
    }
};

const getSizePixels = (size?: 'large' | 'medium' | 'small'): number => {
    switch (size) {
        case 'large': return 40;
        case 'medium': return 36;
        case 'small': return 28;
        default: return 36;
    }
};

export const createCustomPin = (venue: Venue, status: MapStatus) => {
    const color = getStatusColor(status);
    const size = getSizePixels(venue.size);
    const badgeSize = 8;

    const isPromoted = venue.isPromoted;
    const finalColor = isPromoted ? '#FFD700' : color; // Gold for promoted
    const finalSize = Math.round(isPromoted ? size * 1.2 : size); // Slightly larger, rounded
    const boxShadow = isPromoted
        ? `0 0 20px ${finalColor}, 0 0 10px ${finalColor}` // Stronger glow
        : `0 0 10px ${color}40`;

    // Use logo if available, otherwise fallback to initials
    const content = venue.logoUrl
        ? `<img src="${venue.logoUrl}" alt="${venue.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
           <span style="display: none;">${venue.shortName || venue.name.substring(0, 2).toUpperCase()}</span>`
        : `${venue.shortName || venue.name.substring(0, 2).toUpperCase()}`;

    return L.divIcon({
        className: isPromoted ? 'custom-venue-pin promoted' : 'custom-venue-pin',
        html: `
            <div
                role="button"
                aria-label="${venue.name} - ${status}"
                style="
                position: relative;
                width: ${finalSize}px;
                height: ${finalSize}px;
                background: rgba(10, 10, 10, 0.9);
                border: ${isPromoted ? '3px' : '2px'} solid ${finalColor};
                border-radius: 50%;
                box-shadow: ${boxShadow};
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-family: system-ui, sans-serif;
                font-size: ${Math.round(size * 0.4)}px;
                backdrop-filter: blur(4px);
                transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                overflow: hidden;
                z-index: ${isPromoted ? 10 : 1};
            ">
                ${content}
                <div style="
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: ${badgeSize}px;
                    height: ${badgeSize}px;
                    background: ${color};
                    border-radius: 50%;
                    box-shadow: 0 0 5px ${color};
                    border: 1px solid rgba(0,0,0,0.5);
                    z-index: 10;
                "></div>
            </div>
        `,
        iconSize: [finalSize, finalSize],
        iconAnchor: [finalSize / 2, finalSize / 2],
        popupAnchor: [0, -finalSize / 2]
    });
};

export const createClusterIcon = (cluster: any) => {
    const count = cluster.getChildCount();
    return L.divIcon({
        className: 'custom-cluster-pin',
        html: `
            <div style="
                width: 40px;
                height: 40px;
                background: rgba(57, 255, 20, 0.2);
                border: 2px solid #39ff14;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #39ff14;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 0 15px rgba(57, 255, 20, 0.3);
            ">
                ${count}
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
};
