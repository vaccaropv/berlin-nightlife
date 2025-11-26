export interface TransportOption {
    type: 'Public' | 'Ride' | 'Walk';
    provider?: 'BVG' | 'Uber' | 'Bolt' | 'Walk';
    duration: number; // minutes
    price?: number; // euros
    details?: string; // e.g., "U8 -> M10"
    calories?: number;
}

// Haversine formula to calculate distance in km
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const deg2rad = (deg: number) => deg * (Math.PI / 180);

export const getTransportOptions = (distanceKm: number): TransportOption[] => {
    const options: TransportOption[] = [];

    // Public Transport (BVG)
    // Simulating: Base time 5 mins + 3 mins per km
    const publicDuration = Math.round(5 + distanceKm * 3);
    options.push({
        type: 'Public',
        provider: 'BVG',
        duration: publicDuration,
        price: 3.20, // Standard AB ticket
        details: distanceKm < 2 ? 'Bus M29' : 'U8 \u2192 M10'
    });

    // Rideshare (Uber/Bolt)
    // Simulating: Base €1.50 + €2.00 per km
    const uberPrice = 1.50 + (distanceKm * 2.00);
    const uberDuration = Math.round(2 + distanceKm * 1.5); // Faster than public

    options.push({
        type: 'Ride',
        provider: 'Uber',
        duration: uberDuration,
        price: Number(uberPrice.toFixed(2)),
        details: '4 min away'
    });

    options.push({
        type: 'Ride',
        provider: 'Bolt',
        duration: uberDuration + 1,
        price: Number((uberPrice * 0.9).toFixed(2)), // Bolt usually slightly cheaper
        details: '6 min away'
    });

    // Walking
    // Simulating: 5km/h = 12 mins per km
    const walkDuration = Math.round(distanceKm * 12);
    const calories = Math.round(distanceKm * 50); // ~50 cal per km

    options.push({
        type: 'Walk',
        provider: 'Walk',
        duration: walkDuration,
        calories: calories,
        details: `${distanceKm.toFixed(1)} km`
    });

    return options;
};

export const getRouteCoordinates = (
    start: [number, number],
    end: [number, number]
): [number, number][] => {
    // Simulate a "Manhattan" style route (L-shape or ZigZag) to look like streets
    // instead of a straight line.
    const [lat1, lon1] = start;
    const [lat2, lon2] = end;

    const midLat = lat1 + (lat2 - lat1) * 0.5;

    return [
        [lat1, lon1],
        [midLat, lon1], // Go North/South first
        [midLat, lon2], // Then East/West
        [lat2, lon2]
    ];
};
