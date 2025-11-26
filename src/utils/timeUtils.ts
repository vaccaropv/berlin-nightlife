import { Venue } from '../data/mockData';

export type MapStatus = 'open' | 'closed' | 'opening_soon' | 'special_event';

interface VenueStatus {
    isOpen: boolean;
    statusText: string;
    mapStatus: MapStatus;
    nextOpen?: Date;
}

export const getVenueStatus = (venue: Venue): VenueStatus => {
    if (!venue.openingHours) {
        return { isOpen: false, statusText: 'Hours unknown', mapStatus: 'closed' };
    }

    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const hours = venue.openingHours[day as keyof typeof venue.openingHours];

    // Special event logic (simplified for now, could check events array)
    // If today is Friday or Saturday, mark as special event potential
    const isWeekend = day === 'fri' || day === 'sat';

    if (!hours || hours === 'Closed') {
        // Check if opening soon (simplified)
        return { isOpen: false, statusText: 'Closed', mapStatus: 'closed' };
    }

    if (hours === 'Varies') {
        return { isOpen: false, statusText: 'Check events', mapStatus: 'special_event' };
    }

    // Simplified open check
    // In a real app, we'd parse times. For now, assume open if hours exist and not closed/varies
    // and it's "night" time or the venue is known to be open long.

    // Logic for 'opening_soon' would go here (e.g. within 2h of start time)

    return {
        isOpen: true,
        statusText: `Open: ${hours}`,
        mapStatus: isWeekend ? 'special_event' : 'open'
    };
};
