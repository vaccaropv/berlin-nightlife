export interface Event {
    id: string;
    title: string;
    venueId: string;
    date: string;
    startTime: string;
    endTime: string;
    lineup: string[];
    price: number;
    currency: string;
    imageUrl: string;
    tags: string[];
    raLink: string;
}

export interface Venue {
    id: string;
    name: string;
    address: string;
    coordinates: [number, number]; // [lat, lng]
    description: string;
    rating: number;
    imageUrl: string;
    logoUrl?: string;
    type: 'Club' | 'Bar' | 'Open Air';
    liveStatus?: {
        queue: 'No Queue' | 'Short' | 'Medium' | 'Long' | 'Full';
        doorPolicy: 'Relaxed' | 'Standard' | 'Strict' | 'Very Strict';
        lastUpdate: string; // ISO timestamp
    };
    openingHours?: {
        mon: string;
        tue: string;
        wed: string;
        thu: string;
        fri: string;
        sat: string;
        sun: string;
    };
    size?: 'large' | 'medium' | 'small';
    shortName?: string;
    genre?: string[];
    isPromoted?: boolean;
}

export interface LiveUpdate {
    id: string;
    venueId: string;
    message: string;
    timestamp: string;
    type: 'Queue' | 'Door' | 'Event' | 'Alert';
}

export interface TimelineItem {
    id: string;
    type: 'community_report' | 'news' | 'event' | 'venue_update' | 'alert';
    timestamp: string;
    venueId: string;
    venueName: string;
    venueLogoUrl?: string;

    // Community Report fields
    reportData?: {
        username: string;
        userId: string;
        queueLength: string;
        doorPolicy: string;
        capacity?: string;
        vibe?: string;
        vibeEmojis?: string[];
        photoUrl?: string;
    };

    // News fields
    newsData?: {
        title: string;
        content: string;
        source: 'admin' | 'venue' | 'scraper';
        imageUrl?: string;
        tags?: string[];
        authorName?: string;
    };

    // Event fields
    eventData?: {
        title: string;
        lineup: string[];
        date: string;
        price: number;
        currency: string;
        tags: string[];
        raLink?: string;
    };

    // Update/Alert fields
    message?: string;
    priority?: 'low' | 'medium' | 'high';
}

export const MOCK_VENUES: Venue[] = [
    {
        id: 'berghain',
        name: 'Berghain / Panorama Bar',
        address: 'Am Wriezener Bahnhof, 10243 Berlin',
        coordinates: [52.5111, 13.4430],
        description: 'The world-famous techno club in a former power plant.',
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/berghain.berlin',
        type: 'Club',
        liveStatus: {
            queue: 'Long',
            doorPolicy: 'Very Strict',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: '00:00-08:00',
            tue: 'Closed',
            wed: 'Closed',
            thu: '22:00-05:00',
            fri: '22:00-09:00',
            sat: '23:59-12:00+',
            sun: '00:00-08:00'
        },
        size: 'large',
        shortName: 'BH',
        genre: ['Techno', 'Industrial']
    },
    {
        id: 'katerblau',
        name: 'Kater Blau',
        address: 'Holzmarktstr. 25, 10243 Berlin',
        coordinates: [52.5119, 13.4253],
        description: 'Playful riverside club with a wooden deck and long weekend parties.',
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/katerblau.de',
        type: 'Club',
        liveStatus: {
            queue: 'Medium',
            doorPolicy: 'Strict',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: '00:00-12:00',
            tue: 'Closed',
            wed: 'Closed',
            thu: 'Closed',
            fri: '23:00-09:00+',
            sat: '23:00-12:00+',
            sun: '00:00-12:00'
        },
        size: 'medium',
        shortName: 'KB',
        genre: ['Tech House', 'Deep House']
    },
    {
        id: 'watergate',
        name: 'Watergate',
        address: 'Falckensteinstr. 49, 10997 Berlin',
        coordinates: [52.5006, 13.4447],
        description: 'Split-level club with floor-to-ceiling windows overlooking the Spree.',
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/water-gate.de',
        type: 'Club',
        liveStatus: {
            queue: 'Medium',
            doorPolicy: 'Standard',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: '23:00-06:00',
            tue: 'Closed',
            wed: 'Closed',
            thu: '23:00-06:00',
            fri: '23:00-08:00',
            sat: '23:00-10:00',
            sun: 'Closed'
        },
        size: 'medium',
        shortName: 'WG',
        genre: ['House', 'Techno']
    },
    {
        id: 'ritterbutzke',
        name: 'Ritter Butzke',
        address: 'Ritterstraße 26, 10969 Berlin',
        coordinates: [52.5029, 13.4083],
        description: 'Former factory turned into a multi-floor techno playground.',
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1571266028243-d220c6c2e144?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/ritterbutzke.com',
        type: 'Club',
        liveStatus: {
            queue: 'Short',
            doorPolicy: 'Standard',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Closed',
            tue: 'Closed',
            wed: 'Closed',
            thu: 'Closed',
            fri: '22:00-08:00',
            sat: '22:00-10:00',
            sun: 'Varies'
        },
        size: 'medium',
        shortName: 'RB',
        genre: ['Melodic Techno', 'House']
    },
    {
        id: 'renate',
        name: 'Wilde Renate',
        address: 'Alt-Stralau 70, 10245 Berlin',
        coordinates: [52.4956, 13.4619],
        description: 'Multi-floor club with eclectic music and a relaxed vibe.',
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1571266028243-d220c6c2e144?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/renate.cc',
        type: 'Club',
        liveStatus: {
            queue: 'Short',
            doorPolicy: 'Relaxed',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Closed',
            tue: 'Closed',
            wed: 'Closed',
            thu: '23:00-08:00',
            fri: '23:00-09:00',
            sat: '23:00-10:00',
            sun: 'Closed'
        },
        size: 'medium',
        shortName: 'WR',
        genre: ['House', 'Disco', 'Techno']
    },
    {
        id: 'cdv',
        name: 'Club der Visionäre',
        address: 'Am Flutgraben 1, 12435 Berlin',
        coordinates: [52.4963, 13.4533],
        description: 'Rustic canal-side spot for minimal techno and afternoon drinks.',
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/clubdervisionaere.com',
        type: 'Bar',
        liveStatus: {
            queue: 'No Queue',
            doorPolicy: 'Relaxed',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Varies',
            tue: 'Varies',
            wed: 'Varies',
            thu: 'Varies',
            fri: '14:00-late',
            sat: '14:00-late',
            sun: '14:00-late'
        },
        size: 'small',
        shortName: 'CDV',
        genre: ['Minimal', 'Microhouse']
    },
    {
        id: 'sisyphos',
        name: 'Sisyphos',
        address: 'Hauptstr. 15, 10317 Berlin',
        coordinates: [52.4931, 13.4918],
        description: 'Open-air village with a festival vibe every weekend.',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/sisyphos-berlin.net',
        type: 'Open Air',
        liveStatus: {
            queue: 'Short',
            doorPolicy: 'Relaxed',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: '00:00-10:00',
            tue: 'Closed',
            wed: 'Closed',
            thu: 'Closed',
            fri: '22:00-10:00+',
            sat: '22:00-10:00+',
            sun: '00:00-10:00'
        },
        size: 'large',
        shortName: 'SIS',
        genre: ['Techno', 'House', 'Festival']
    },
    {
        id: 'aboutblank',
        name: '://about blank',
        address: 'Markgrafendamm 24, 10245 Berlin',
        coordinates: [52.5028, 13.4633],
        description: 'Gritty, left-wing techno club with a large garden.',
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/aboutblank.li',
        type: 'Club',
        liveStatus: {
            queue: 'Medium',
            doorPolicy: 'Strict',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Varies',
            tue: 'Closed',
            wed: 'Closed',
            thu: 'Varies',
            fri: '23:00-10:00+',
            sat: '23:00-12:00+',
            sun: '00:00-12:00'
        },
        size: 'medium',
        shortName: 'AB',
        genre: ['Techno', 'House', 'Bass']
    },
    {
        id: 'rso',
        name: 'RSO.Berlin',
        address: 'Schnellerstraße 137, 12439 Berlin',
        coordinates: [52.4593, 13.4947],
        description: 'Industrial techno venue in Schöneweide.',
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/rso.berlin',
        type: 'Club',
        liveStatus: {
            queue: 'Short',
            doorPolicy: 'Standard',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: '00:00-12:00',
            tue: 'Closed',
            wed: 'Closed',
            thu: 'Closed',
            fri: '23:00-10:00+',
            sat: '23:00-12:00+',
            sun: '00:00-12:00'
        },
        size: 'large',
        shortName: 'RSO',
        genre: ['Hard Techno', 'Industrial']
    },
    {
        id: 'oxi',
        name: 'OXI',
        address: 'Wiesenweg 1-4, 10365 Berlin',
        coordinates: [52.5204, 13.4883],
        description: 'Intimate club with a focus on diverse lineups.',
        rating: 4.4,
        imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/oxiberlin.de',
        type: 'Club',
        liveStatus: {
            queue: 'No Queue',
            doorPolicy: 'Relaxed',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Varies',
            tue: 'Closed',
            wed: 'Closed',
            thu: 'Varies',
            fri: '23:00-08:00',
            sat: '23:00-10:00',
            sun: 'Varies'
        },
        size: 'small',
        shortName: 'OXI',
        genre: ['Techno', 'House']
    },
    {
        id: 'aeden',
        name: 'ÆDEN',
        address: 'Schleusenufer 3-4, 10997 Berlin',
        coordinates: [52.4975, 13.4475],
        description: 'Cultural venue with a beautiful garden and club nights.',
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/aedenberlin.com',
        type: 'Open Air',
        liveStatus: {
            queue: 'Short',
            doorPolicy: 'Standard',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Closed',
            tue: '23:00-09:00',
            wed: 'Closed',
            thu: 'Closed',
            fri: '23:00-08:00',
            sat: '23:00-10:00',
            sun: 'Varies'
        },
        size: 'small',
        shortName: 'Æ',
        genre: ['House', 'Techno']
    },
    {
        id: 'kitkat',
        name: 'KitKat Club',
        address: 'Köpenicker Str. 76, 10179 Berlin',
        coordinates: [52.5113, 13.4165],
        description: 'Famous fetish club with a strict dress code.',
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/kitkatclub.org',
        type: 'Club',
        liveStatus: {
            queue: 'Long',
            doorPolicy: 'Very Strict',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: '22:00-07:00',
            tue: 'Closed',
            wed: 'Closed',
            thu: 'Varies',
            fri: '23:00-10:00+',
            sat: '23:00-12:00+',
            sun: 'Varies'
        },
        size: 'large',
        shortName: 'KK',
        genre: ['Techno', 'Trance', 'Fetish']
    },
    {
        id: 'tresor',
        name: 'Tresor',
        address: 'Köpenicker Str. 70, 10179 Berlin',
        coordinates: [52.5106, 13.4194],
        description: 'Legendary techno club in a former heating plant.',
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/tresorberlin.com',
        type: 'Club',
        liveStatus: {
            queue: 'Medium',
            doorPolicy: 'Strict',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Closed',
            tue: 'Closed',
            wed: '23:00-09:00',
            thu: '00:00-09:00',
            fri: '00:00-09:00',
            sat: '00:00-12:00',
            sun: '00:00-12:00'
        },
        size: 'large',
        shortName: 'TR',
        genre: ['Techno', 'Industrial']
    },
    {
        id: 'ost',
        name: 'OST',
        address: 'Alt-Stralau 1-2, 10245 Berlin',
        coordinates: [52.5072, 13.4697],
        description: 'Club in an old power station with a raw industrial feel.',
        rating: 4.4,
        imageUrl: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/clubost.de',
        type: 'Club',
        liveStatus: {
            queue: 'Short',
            doorPolicy: 'Standard',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Varies',
            tue: 'Closed',
            wed: 'Closed',
            thu: '23:00-10:00',
            fri: '23:00-10:00',
            sat: '23:00-12:00',
            sun: 'Varies'
        },
        size: 'medium',
        shortName: 'OST',
        genre: ['Techno']
    },
    {
        id: 'lokschuppen',
        name: 'Lokschuppen Berlin',
        address: 'Revaler Straße 99, Friedrichshain',
        coordinates: [52.5108, 13.4563],
        description: 'Event location in a historic engine shed.',
        rating: 4.3,
        imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/lokschuppen-berlin.de',
        type: 'Club',
        liveStatus: {
            queue: 'No Queue',
            doorPolicy: 'Relaxed',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Varies',
            tue: 'Closed',
            wed: 'Closed',
            thu: 'Varies',
            fri: '23:00-08:00',
            sat: '23:00-10:00',
            sun: 'Varies'
        },
        size: 'small',
        shortName: 'LOK',
        genre: ['House', 'Techno']
    },
    {
        id: 'zenner',
        name: 'Zenner',
        address: 'Treptower Park am Ufer, 12435 Berlin',
        coordinates: [52.4873, 13.4775],
        description: 'Historic beer garden and event venue by the Spree.',
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop',
        logoUrl: 'https://logo.clearbit.com/zenner.berlin',
        type: 'Open Air',
        liveStatus: {
            queue: 'Short',
            doorPolicy: 'Relaxed',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Varies',
            tue: 'Varies',
            wed: 'Varies',
            thu: 'Varies',
            fri: 'Varies',
            sat: 'Varies',
            sun: 'Varies'
        },
        size: 'medium',
        shortName: 'ZN',
        genre: ['House', 'Disco', 'Open Air']
    },
    {
        id: 'zurklappe',
        name: 'Zur Klappe',
        address: 'Yorckstraße 2, 10965 Berlin',
        coordinates: [52.4937, 13.3769],
        description: 'Underground club in a former public toilet, known for intimate vibes and queer parties.',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1571266028243-d220c6c2e144?q=80&w=1000&auto=format&fit=crop',
        // logoUrl: 'https://logo.clearbit.com/zurklappe.berlin', // Placeholder or real if available
        type: 'Club',
        isPromoted: true,
        liveStatus: {
            queue: 'Medium',
            doorPolicy: 'Strict',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Closed',
            tue: 'Closed',
            wed: 'Closed',
            thu: '23:00-06:00',
            fri: '23:59-08:00',
            sat: '23:59-10:00',
            sun: 'Closed'
        },
        size: 'small',
        shortName: 'ZK',
        genre: ['Techno', 'House', 'Queer']
    },
    {
        id: 'matrix',
        name: 'Matrix Club Berlin',
        address: 'Warschauer Pl. 18, 10245 Berlin',
        coordinates: [52.5035, 13.4494],
        description: 'Large, mainstream club located under the U-Bahn arches.',
        rating: 3.5,
        imageUrl: 'https://berliner.party/img/clubs/matrix_500.jpg',
        logoUrl: 'https://logo.clearbit.com/matrix-berlin.de',
        type: 'Club',
        liveStatus: {
            queue: 'Long',
            doorPolicy: 'Standard',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: '22:00-06:00',
            tue: '22:00-06:00',
            wed: '22:00-06:00',
            thu: '22:00-06:00',
            fri: '22:00-07:00',
            sat: '22:00-07:00',
            sun: '22:00-06:00'
        },
        size: 'large',
        shortName: 'MX',
        genre: ['Pop', 'R&B', 'Chart']
    },
    {
        id: 'insomnia',
        name: 'Insomnia',
        address: 'Alt-Tempelhof 17-19, 12099 Berlin',
        coordinates: [52.4656, 13.3844],
        description: 'Hedonistic nightclub known for fetish parties and strict dress codes.',
        rating: 4.4,
        imageUrl: 'https://berliner.party/img/clubs/insomnia_500.jpg',
        logoUrl: 'https://logo.clearbit.com/insomnia-berlin.de',
        type: 'Club',
        liveStatus: {
            queue: 'Medium',
            doorPolicy: 'Strict',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Closed',
            tue: 'Closed',
            wed: 'Closed',
            thu: '22:00-06:00',
            fri: '22:00-08:00',
            sat: '22:00-08:00',
            sun: '22:00-06:00'
        },
        size: 'medium',
        shortName: 'IN',
        genre: ['Techno', 'Fetish']
    },
    {
        id: 'soda',
        name: 'Soda Club Berlin',
        address: 'Schönhauser Allee 36, 10435 Berlin',
        coordinates: [52.5392, 13.4125],
        description: 'Multi-floor club in the Kulturbrauerei complex.',
        rating: 4.0,
        imageUrl: 'https://berliner.party/img/clubs/soda_500.jpg',
        logoUrl: 'https://logo.clearbit.com/soda-berlin.de',
        type: 'Club',
        liveStatus: {
            queue: 'Long',
            doorPolicy: 'Standard',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Closed',
            tue: 'Closed',
            wed: 'Closed',
            thu: '19:00-04:00',
            fri: '23:00-07:00',
            sat: '23:00-07:00',
            sun: '19:00-04:00'
        },
        size: 'large',
        shortName: 'SD',
        genre: ['R&B', 'Hip Hop', 'Latin']
    },
    {
        id: 'cassiopeia',
        name: 'Cassiopeia',
        address: 'Revaler Str. 99, 10245 Berlin',
        coordinates: [52.5085, 13.4542],
        description: 'Diverse club with live music, hip hop, and hardcore/punk shows.',
        rating: 4.3,
        imageUrl: 'https://berliner.party/img/clubs/cassiopeia_500.jpg',
        logoUrl: 'https://logo.clearbit.com/cassiopeia-berlin.de',
        type: 'Club',
        liveStatus: {
            queue: 'Medium',
            doorPolicy: 'Relaxed',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Varies',
            tue: 'Varies',
            wed: 'Varies',
            thu: 'Varies',
            fri: '23:00-06:00',
            sat: '23:00-06:00',
            sun: 'Varies'
        },
        size: 'medium',
        shortName: 'CS',
        genre: ['Hip Hop', 'Rock', 'Punk']
    },
    {
        id: 'beateuwe',
        name: 'Beate Uwe',
        address: 'Schillingstraße 31, 10179 Berlin',
        coordinates: [52.5167, 13.4200],
        description: 'Cozy, living-room style club with a great sound system.',
        rating: 4.5,
        imageUrl: 'https://berliner.party/img/clubs/temporary_500.jpg',
        logoUrl: 'https://logo.clearbit.com/beate-uwe.de',
        type: 'Club',
        liveStatus: {
            queue: 'Short',
            doorPolicy: 'Standard',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Closed',
            tue: 'Closed',
            wed: 'Closed',
            thu: '23:00-08:00',
            fri: '23:00-10:00',
            sat: '23:00-10:00',
            sun: 'Closed'
        },
        size: 'small',
        shortName: 'BU',
        genre: ['House', 'Techno', 'Downtempo']
    },
    {
        id: 'weekend',
        name: 'Weekend Club',
        address: 'Alexanderstraße 7, 10178 Berlin',
        coordinates: [52.5220, 13.4130],
        description: 'Rooftop club with panoramic views of Alexanderplatz.',
        rating: 4.1,
        imageUrl: 'https://berliner.party/img/clubs/weekend_500.jpg',
        logoUrl: 'https://logo.clearbit.com/weekendclub.berlin',
        type: 'Club',
        liveStatus: {
            queue: 'Long',
            doorPolicy: 'Strict',
            lastUpdate: new Date().toISOString()
        },
        openingHours: {
            mon: 'Closed',
            tue: 'Closed',
            wed: 'Closed',
            thu: '23:00-06:00',
            fri: '23:00-06:00',
            sat: '23:00-06:00',
            sun: 'Closed'
        },
        size: 'medium',
        shortName: 'WK',
        genre: ['House', 'R&B', 'Hip Hop']
    }
];

export const MOCK_LIVE_UPDATES: LiveUpdate[] = [
    {
        id: 'u1',
        venueId: 'v1',
        message: 'Queue is past the kiosk. Expect 2h wait.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        type: 'Queue'
    },
    {
        id: 'u2',
        venueId: 'v3',
        message: 'Pizza truck just opened! 🍕',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        type: 'Alert'
    },
    {
        id: 'u3',
        venueId: 'v2',
        message: 'Main floor opening in 10 mins.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
        type: 'Event'
    }
];

export const MOCK_EVENTS: Event[] = [
    {
        id: 'tr-2025-11-26',
        title: 'Tresor New Faces hosted by Playhaus',
        venueId: 'tresor',
        date: '2025-11-26T23:00:00',
        startTime: '23:00',
        endTime: '06:00',
        lineup: ['Di² JØRDY Josiane Redd', 'Di²'],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno', 'New Faces'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/tresor-new-2025-11-26'
    },
    {
        id: 'mx-2025-11-26',
        title: 'Matrix - Wednesday',
        venueId: 'matrix',
        date: '2025-11-26T22:00:00',
        startTime: '22:00',
        endTime: '06:00',
        lineup: ['afrobeats', 'classics', 'Hip Hop'],
        price: 10,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/matrix_500.jpg',
        tags: ['Hip Hop', 'Party'],
        raLink: 'https://berliner.party/en/nightclubs/matrix/matrix---2025-11-26'
    },
    {
        id: 'ae-2025-11-26',
        title: '𝓲𝓲𝓲𝓬𝓸𝓶𝓭',
        venueId: 'aeden',
        date: '2025-11-26T23:00:00',
        startTime: '23:00',
        endTime: '08:00',
        lineup: ['More info soon…'],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/aeden_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/aeden/-2025-11-26'
    },
    {
        id: 'in-2025-11-26',
        title: 'Berlin Kink',
        venueId: 'insomnia',
        date: '2025-11-26T20:00:00',
        startTime: '20:00',
        endTime: '06:00',
        lineup: ['25'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/insomnia_500.jpg',
        tags: ['Kink', 'Techno'],
        raLink: 'https://berliner.party/en/nightclubs/insomnia/berlin-kink-2025-11-26'
    },
    {
        id: 'rb-2025-11-27',
        title: 'Cover My Ass Aftershow',
        venueId: 'ritterbutzke',
        date: '2025-11-27T22:00:00',
        startTime: '22:00',
        endTime: '06:00',
        lineup: ['Techno', 'House', 'Tech House', 'Deep'],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/ritterbutzke_500.jpg',
        tags: ['Techno', 'House'],
        raLink: 'https://berliner.party/en/nightclubs/ritterbutzke/cover-my-2025-11-27'
    },
    {
        id: 'bh-2025-11-27',
        title: 'The Sound Of',
        venueId: 'berghain',
        date: '2025-11-27T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: ['Deluka', 'Mathys Lenne', 'Orbe'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/berghain_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/berghain/the-sound-2025-11-27'
    },
    {
        id: 'sd-2025-11-27',
        title: 'Soda Social Club',
        venueId: 'soda',
        date: '2025-11-27T19:00:00',
        startTime: '19:00',
        endTime: '04:00',
        lineup: ['DJ TiMueve', 'DJ Brillant', 'DJ'],
        price: 10,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/soda_500.jpg',
        tags: ['Party', 'Social'],
        raLink: 'https://berliner.party/en/nightclubs/soda/soda-social-2025-11-27'
    },
    {
        id: 'mx-2025-11-27',
        title: 'Matrix - Thursday',
        venueId: 'matrix',
        date: '2025-11-27T22:00:00',
        startTime: '22:00',
        endTime: '06:00',
        lineup: ['afrobeats', 'Hip Hop', 'reggaeton'],
        price: 10,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/matrix_500.jpg',
        tags: ['Hip Hop', 'Reggaeton'],
        raLink: 'https://berliner.party/en/nightclubs/matrix/matrix---2025-11-27'
    },
    {
        id: 'tr-2025-11-27-2',
        title: '35th Anniversary of Texte zur Kunst',
        venueId: 'tresor',
        date: '2025-11-27T23:00:00',
        startTime: '23:00',
        endTime: '08:00',
        lineup: ['Erik D Clark Lena Willikens'],
        price: 18,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno', 'Art'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/35th-anniversary-2025-11-27'
    },
    {
        id: 'bh-2025-11-28',
        title: 'LIVE FROM EARTH',
        venueId: 'berghain',
        date: '2025-11-28T20:00:00',
        startTime: '20:00',
        endTime: '12:00',
        lineup: ['MCR-T', 'Rojuu', 'saramalacara', 'Six'],
        price: 25,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/berghain_500.jpg',
        tags: ['Techno', 'Live'],
        raLink: 'https://berliner.party/en/nightclubs/berghain/live-from-2025-11-28'
    },
    {
        id: 'rb-2025-11-28-2',
        title: 'Monkey Safari',
        venueId: 'ritterbutzke',
        date: '2025-11-28T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: ['Techno', 'House', 'Melodic'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/ritterbutzke_500.jpg',
        tags: ['Melodic Techno'],
        raLink: 'https://berliner.party/en/nightclubs/ritterbutzke/monkey-safari-2025-11-28'
    },
    {
        id: 'ae-2025-11-28-2',
        title: 'Spicy / rhythm, spice and everything hot',
        venueId: 'aeden',
        date: '2025-11-28T23:00:00',
        startTime: '23:00',
        endTime: '08:00',
        lineup: ['Pikante invites you for a night'],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/aeden_500.jpg',
        tags: ['Techno', 'Spicy'],
        raLink: 'https://berliner.party/en/nightclubs/aeden/spicy--2025-11-28'
    },
    {
        id: 'tr-2025-11-28-2',
        title: 'Tresor meets',
        venueId: 'tresor',
        date: '2025-11-28T23:00:00',
        startTime: '23:00',
        endTime: '10:00',
        lineup: ['Mareena', 'Ryan James Ford', 'TONI'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/tresor-meets-2025-11-28'
    },
    {
        id: 'rn-2025-11-28',
        title: 'Renate Klubnacht x FOLD London x E&X Records',
        venueId: 'renate',
        date: '2025-11-28T23:00:00',
        startTime: '23:00',
        endTime: '12:00',
        lineup: ['James Newmarch', 'Melati', 'Alba'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/renate_500.jpg',
        tags: ['Techno', 'House'],
        raLink: 'https://berliner.party/en/nightclubs/renate/renate-klubnacht-2025-11-28'
    },
    {
        id: 'mx-2025-11-28',
        title: 'Matrix - Friday',
        venueId: 'matrix',
        date: '2025-11-28T22:00:00',
        startTime: '22:00',
        endTime: '06:00',
        lineup: ['afrobeats', 'classics', 'hip-hop'],
        price: 12,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/matrix_500.jpg',
        tags: ['Hip Hop', 'Party'],
        raLink: 'https://berliner.party/en/nightclubs/matrix/matrix---2025-11-28'
    },
    {
        id: 'sd-2025-11-28',
        title: 'Ladies Night',
        venueId: 'soda',
        date: '2025-11-28T22:00:00',
        startTime: '22:00',
        endTime: '06:00',
        lineup: ['Paul Debonaire', 'DJ R\'n\'P'],
        price: 10,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/soda_500.jpg',
        tags: ['Party', 'Ladies Night'],
        raLink: 'https://berliner.party/en/nightclubs/soda/ladies-night-2025-11-28'
    },
    {
        id: 'cs-2025-11-28',
        title: 'Forever Young - The 80s Party November',
        venueId: 'cassiopeia',
        date: '2025-11-28T23:00:00',
        startTime: '23:00',
        endTime: '06:00',
        lineup: ['80s', '90s', 'Alltime Favorites'],
        price: 12,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/cassiopeia_500.jpg',
        tags: ['80s', 'Party'],
        raLink: 'https://berliner.party/en/nightclubs/cassiopeia/forever-young-2025-11-28'
    },
    {
        id: 'bu-2025-11-28',
        title: 'Deep Dive – Vol. 1',
        venueId: 'beateuwe',
        date: '2025-11-28T23:00:00',
        startTime: '23:00',
        endTime: '08:00',
        lineup: ['Crydebleich', 'Cardi-O', 'Daniel'],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/temporary_500.jpg',
        tags: ['Techno', 'Deep House'],
        raLink: 'https://berliner.party/en/nightclubs/beateuwe/deep-dive-2025-11-28'
    },
    {
        id: 'in-2025-11-28',
        title: 'Dirty Disco',
        venueId: 'insomnia',
        date: '2025-11-28T22:00:00',
        startTime: '22:00',
        endTime: '06:00',
        lineup: ['WestwingS', 'Guests'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/insomnia_500.jpg',
        tags: ['Disco', 'Kink'],
        raLink: 'https://berliner.party/en/nightclubs/insomnia/dirty-disco-2025-11-28'
    },
    {
        id: 'kb-2025-11-29',
        title: '48 Cats... dancing on the table',
        venueId: 'katerblau',
        date: '2025-11-29T23:59:00',
        startTime: '23:59',
        endTime: '12:00',
        lineup: ['Annett Gapstream', 'Borella'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/katerblau_500.jpg',
        tags: ['Tech House', 'Deep House'],
        raLink: 'https://berliner.party/en/nightclubs/katerblau/48-cats-2025-11-29'
    },
    {
        id: 'bh-2025-11-29',
        title: 'Club Night',
        venueId: 'berghain',
        date: '2025-11-29T23:59:00',
        startTime: '23:59',
        endTime: '12:00',
        lineup: ['Phase Fatale', 'Blasha', 'Allatt'],
        price: 25,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/berghain_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/berghain/club-night-2025-11-29'
    },
    {
        id: 'rn-2025-11-29',
        title: 'Renate Klubnacht',
        venueId: 'renate',
        date: '2025-11-29T23:00:00',
        startTime: '23:00',
        endTime: '10:00',
        lineup: ['Kathi Liz', 'Rallo', 'Daniel'],
        price: 18,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/renate_500.jpg',
        tags: ['House', 'Techno'],
        raLink: 'https://berliner.party/en/nightclubs/renate/renate-klubnacht-2025-11-29'
    },
    {
        id: 'rb-2025-11-29',
        title: 'Mark Dekoda',
        venueId: 'ritterbutzke',
        date: '2025-11-29T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: ['Mark Dekoda', 'Bonq', 'Rob Robsen'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/ritterbutzke_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/ritterbutzke/mark-dekoda-2025-11-29'
    },
    {
        id: 'rb-2025-11-29-2',
        title: 'Lexy & K-Paul (live)',
        venueId: 'ritterbutzke',
        date: '2025-11-29T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: ['House'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/ritterbutzke_500.jpg',
        tags: ['House', 'Live'],
        raLink: 'https://berliner.party/en/nightclubs/ritterbutzke/lexy--2025-11-29'
    },
    {
        id: 'tr-2025-11-29',
        title: 'Tresor Klubnacht',
        venueId: 'tresor',
        date: '2025-11-29T23:00:00',
        startTime: '23:00',
        endTime: '10:00',
        lineup: ['Beatrice', 'Blazej Malinowski'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/tresor-klubnacht-2025-11-29'
    },
    {
        id: 'rb-2025-11-29-3',
        title: 'Robosonic',
        venueId: 'ritterbutzke',
        date: '2025-11-29T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: ['House'],
        price: 18,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/ritterbutzke_500.jpg',
        tags: ['House'],
        raLink: 'https://berliner.party/en/nightclubs/ritterbutzke/robosonic-2025-11-29'
    },
    {
        id: 'bu-2025-11-29',
        title: 'Beate Invites // 925 Collective – Nightshift #6',
        venueId: 'beateuwe',
        date: '2025-11-29T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: ['Monsai', 'Anna G', 'Magdita', 'Adam'],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/temporary_500.jpg',
        tags: ['Techno', 'House'],
        raLink: 'https://berliner.party/en/nightclubs/beateuwe/beate-invites-2025-11-29'
    },
    {
        id: 'sd-2025-11-29',
        title: 'Sodalicious',
        venueId: 'soda',
        date: '2025-11-29T22:00:00',
        startTime: '22:00',
        endTime: '06:00',
        lineup: ['DJ Miss IRiE', 'DJ R\'n\'P', 'DJ'],
        price: 12,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/soda_500.jpg',
        tags: ['Party', 'R&B'],
        raLink: 'https://berliner.party/en/nightclubs/soda/sodalicious-2025-11-29'
    },
    {
        id: 'bu-2025-11-29-2',
        title: 'Living Room Two',
        venueId: 'beateuwe',
        date: '2025-11-29T20:00:00',
        startTime: '20:00',
        endTime: '04:00',
        lineup: ['18+'],
        price: 10,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/temporary_500.jpg',
        tags: ['Lounge'],
        raLink: 'https://berliner.party/en/nightclubs/beateuwe/living-room-2025-11-29'
    },
    {
        id: 'cs-2025-11-29',
        title: '20 Years Cassiopeia Birthday Party',
        venueId: 'cassiopeia',
        date: '2025-11-29T22:00:00',
        startTime: '22:00',
        endTime: '06:00',
        lineup: ['Rock', 'Hip Hop', 'Indie'],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/cassiopeia_500.jpg',
        tags: ['Party', 'Anniversary'],
        raLink: 'https://berliner.party/en/nightclubs/cassiopeia/20-years-2025-11-29'
    },
    {
        id: 'mx-2025-11-29',
        title: 'Matrix - Saturday',
        venueId: 'matrix',
        date: '2025-11-29T22:00:00',
        startTime: '22:00',
        endTime: '06:00',
        lineup: ['dance classics', 'Hip Hop', 'house'],
        price: 12,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/matrix_500.jpg',
        tags: ['Hip Hop', 'House'],
        raLink: 'https://berliner.party/en/nightclubs/matrix/matrix---2025-11-29'
    },
    {
        id: 'in-2025-11-29',
        title: 'UNLEASHED.BERLIN - Where Techno Meets Freedom',
        venueId: 'insomnia',
        date: '2025-11-29T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: ['28'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/insomnia_500.jpg',
        tags: ['Techno', 'Kink'],
        raLink: 'https://berliner.party/en/nightclubs/insomnia/unleashedberlin---2025-11-29'
    },
    {
        id: 'bu-2025-11-30',
        title: 'Beate Barfuß',
        venueId: 'beateuwe',
        date: '2025-11-30T17:00:00',
        startTime: '17:00',
        endTime: '02:00',
        lineup: ['anahi', 'Luca Musto', 'Matija', 'iris'],
        price: 10,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/temporary_500.jpg',
        tags: ['Downtempo'],
        raLink: 'https://berliner.party/en/nightclubs/beateuwe/beate-barfu-2025-11-30'
    },
    {
        id: 'sd-2025-11-30',
        title: 'Soda Social Club',
        venueId: 'soda',
        date: '2025-11-30T19:00:00',
        startTime: '19:00',
        endTime: '04:00',
        lineup: ['DJ DVent', 'DJ Eddy Nice', 'DJ'],
        price: 10,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/soda_500.jpg',
        tags: ['Party', 'Social'],
        raLink: 'https://berliner.party/en/nightclubs/soda/soda-social-2025-11-30'
    },
    {
        id: 'tr-2025-12-01',
        title: 'SINGULARITY',
        venueId: 'tresor',
        date: '2025-12-01T23:00:00',
        startTime: '23:00',
        endTime: '06:00',
        lineup: ['18+'],
        price: 10,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/singularity-2025-12-01'
    },
    {
        id: 'tr-2025-12-03',
        title: 'Tresor New Faces hosted by Krumm',
        venueId: 'tresor',
        date: '2025-12-03T23:00:00',
        startTime: '23:00',
        endTime: '06:00',
        lineup: ['ALKARLINE'],
        price: 12,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno', 'New Faces'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/tresor-new-2025-12-03'
    },
    {
        id: 'ae-2025-12-03',
        title: '𝓲𝓲𝓲𝓬𝓸𝓶𝓭',
        venueId: 'aeden',
        date: '2025-12-03T23:00:00',
        startTime: '23:00',
        endTime: '06:00',
        lineup: ['More info soon…'],
        price: 10,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/aeden_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/aeden/-2025-12-03'
    },
    {
        id: 'rb-2025-12-05',
        title: 'Leblanc',
        venueId: 'ritterbutzke',
        date: '2025-12-05T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: ['Techno', 'House', 'Progressive'],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/ritterbutzke_500.jpg',
        tags: ['Techno', 'House'],
        raLink: 'https://berliner.party/en/nightclubs/ritterbutzke/leblanc-2025-12-05'
    },
    {
        id: 'tr-2025-12-05',
        title: 'Tresor meets Closer Milano',
        venueId: 'tresor',
        date: '2025-12-05T23:00:00',
        startTime: '23:00',
        endTime: '08:00',
        lineup: ['Dinamite Nastia Reigel'],
        price: 18,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/tresor-meets-2025-12-05'
    },
    {
        id: 'in-2025-12-05',
        title: 'YOUNG LOVE',
        venueId: 'insomnia',
        date: '2025-12-05T22:00:00',
        startTime: '22:00',
        endTime: '06:00',
        lineup: ['25'],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/insomnia_500.jpg',
        tags: ['Party'],
        raLink: 'https://berliner.party/en/nightclubs/insomnia/young-love-2025-12-05'
    },
    {
        id: 'tr-2025-12-06',
        title: 'Tresor Klubnacht',
        venueId: 'tresor',
        date: '2025-12-06T23:00:00',
        startTime: '23:00',
        endTime: '10:00',
        lineup: ['Bloody Mary', 'Charlton', 'James'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/tresor-klubnacht-2025-12-06'
    },
    {
        id: 'rb-2025-12-06',
        title: 'Maceo Plex pres. Ellum',
        venueId: 'ritterbutzke',
        date: '2025-12-06T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: ['Techno', 'Melodic', 'Deep'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/ritterbutzke_500.jpg',
        tags: ['Melodic Techno'],
        raLink: 'https://berliner.party/en/nightclubs/ritterbutzke/maceo-plex-2025-12-06'
    },
    {
        id: 'ae-2025-12-07',
        title: 'Naughty Xmas Fest',
        venueId: 'aeden',
        date: '2025-12-07T16:00:00',
        startTime: '16:00',
        endTime: '02:00',
        lineup: ['The Naughty Markets (Naughty'],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/aeden_500.jpg',
        tags: ['Market', 'Party'],
        raLink: 'https://berliner.party/en/nightclubs/aeden/naughty-xmas-2025-12-07'
    },
    {
        id: 'tr-2025-12-08',
        title: 'SINGULARITY',
        venueId: 'tresor',
        date: '2025-12-08T23:00:00',
        startTime: '23:00',
        endTime: '06:00',
        lineup: ['18+'],
        price: 10,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/singularity-2025-12-08'
    },
    {
        id: 'tr-2025-12-10',
        title: 'Tresor New Faces hosted by TANGA',
        venueId: 'tresor',
        date: '2025-12-10T23:00:00',
        startTime: '23:00',
        endTime: '06:00',
        lineup: ['ALP Khloe', 'Mama Yha Yha'],
        price: 12,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno', 'New Faces'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/tresor-new-2025-12-10'
    },
    {
        id: 'in-2025-12-10',
        title: 'Berlin Kink',
        venueId: 'insomnia',
        date: '2025-12-10T20:00:00',
        startTime: '20:00',
        endTime: '06:00',
        lineup: ['25'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/insomnia_500.jpg',
        tags: ['Kink', 'Techno'],
        raLink: 'https://berliner.party/en/nightclubs/insomnia/berlin-kink-2025-12-10'
    },
    {
        id: 'ae-2025-12-10',
        title: '𝓲𝓲𝓲𝓬𝓸𝓶𝓭',
        venueId: 'aeden',
        date: '2025-12-10T23:00:00',
        startTime: '23:00',
        endTime: '06:00',
        lineup: ['18+'],
        price: 10,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/aeden_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/aeden/-2025-12-10'
    },
    {
        id: 'tr-2025-12-12',
        title: 'Tresor meets DJ Sotofett: Resonance of Dub',
        venueId: 'tresor',
        date: '2025-12-12T23:00:00',
        startTime: '23:00',
        endTime: '08:00',
        lineup: [],
        price: 18,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno', 'Dub'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/tresor-meets-2025-12-12'
    },
    {
        id: 'in-2025-12-12',
        title: 'Flashback Friday - The Kinky 90\'s-00\'s Party!',
        venueId: 'insomnia',
        date: '2025-12-12T22:00:00',
        startTime: '22:00',
        endTime: '06:00',
        lineup: [],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/insomnia_500.jpg',
        tags: ['90s', 'Kink'],
        raLink: 'https://berliner.party/en/nightclubs/insomnia/flashback-friday-2025-12-12'
    },
    {
        id: 'tr-2025-12-13',
        title: 'Tresor Klubnacht',
        venueId: 'tresor',
        date: '2025-12-13T23:00:00',
        startTime: '23:00',
        endTime: '10:00',
        lineup: [],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/tresor-klubnacht-2025-12-13'
    },
    {
        id: 'rb-2025-12-13',
        title: 'Tragedie Winter Rave',
        venueId: 'ritterbutzke',
        date: '2025-12-13T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: [],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/ritterbutzke_500.jpg',
        tags: ['Techno', 'Rave'],
        raLink: 'https://berliner.party/en/nightclubs/ritterbutzke/tragedie-winter-2025-12-13'
    },
    {
        id: 'in-2025-12-13',
        title: 'Hedomanie',
        venueId: 'insomnia',
        date: '2025-12-13T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: [],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/insomnia_500.jpg',
        tags: ['Kink', 'Party'],
        raLink: 'https://berliner.party/en/nightclubs/insomnia/hedomanie-2025-12-13'
    },
    {
        id: 'ae-2025-12-13',
        title: 'LAPSUS',
        venueId: 'aeden',
        date: '2025-12-13T23:00:00',
        startTime: '23:00',
        endTime: '08:00',
        lineup: [],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/aeden_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/aeden/lapsus-2025-12-13'
    },
    {
        id: 'tr-2025-12-15',
        title: 'SINGULARITY',
        venueId: 'tresor',
        date: '2025-12-15T23:00:00',
        startTime: '23:00',
        endTime: '06:00',
        lineup: [],
        price: 10,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/singularity-2025-12-15'
    },
    {
        id: 'tr-2025-12-17',
        title: 'Tresor New Faces hosted by In Balance',
        venueId: 'tresor',
        date: '2025-12-17T23:00:00',
        startTime: '23:00',
        endTime: '06:00',
        lineup: [],
        price: 12,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno', 'New Faces'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/tresor-new-2025-12-17'
    },
    {
        id: 'in-2025-12-17',
        title: 'Berlin Kink',
        venueId: 'insomnia',
        date: '2025-12-17T20:00:00',
        startTime: '20:00',
        endTime: '06:00',
        lineup: [],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/insomnia_500.jpg',
        tags: ['Kink', 'Techno'],
        raLink: 'https://berliner.party/en/nightclubs/insomnia/berlin-kink-2025-12-17'
    },
    {
        id: 'ae-2025-12-17',
        title: '𝓲𝓲𝓲𝓬𝓸𝓶𝓭',
        venueId: 'aeden',
        date: '2025-12-17T23:00:00',
        startTime: '23:00',
        endTime: '06:00',
        lineup: [],
        price: 10,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/aeden_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/aeden/-2025-12-17'
    },
    {
        id: 'tr-2025-12-19',
        title: 'Tresor meets Scheiße Mukke',
        venueId: 'tresor',
        date: '2025-12-19T23:00:00',
        startTime: '23:00',
        endTime: '08:00',
        lineup: [],
        price: 18,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/tresor-meets-2025-12-19'
    },
    {
        id: 'rb-2025-12-19',
        title: 'Kloud',
        venueId: 'ritterbutzke',
        date: '2025-12-19T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: [],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/ritterbutzke_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/ritterbutzke/kloud-2025-12-19'
    },
    {
        id: 'in-2025-12-19',
        title: 'Seven Sins',
        venueId: 'insomnia',
        date: '2025-12-19T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: [],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/insomnia_500.jpg',
        tags: ['Kink', 'Party'],
        raLink: 'https://berliner.party/en/nightclubs/insomnia/seven-sins-2025-12-19'
    },
    {
        id: 'rb-2025-12-20',
        title: 'Joyhauser pres. Memoro',
        venueId: 'ritterbutzke',
        date: '2025-12-20T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: [],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/ritterbutzke_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/ritterbutzke/joyhauser-pres-2025-12-20'
    },
    {
        id: 'tr-2025-12-20',
        title: 'Tresor: Club Christmas',
        venueId: 'tresor',
        date: '2025-12-20T23:00:00',
        startTime: '23:00',
        endTime: '10:00',
        lineup: [],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno', 'Christmas'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/tresor-club-2025-12-20'
    },
    {
        id: 'ae-2025-12-20',
        title: 'RANDOM NOTES',
        venueId: 'aeden',
        date: '2025-12-20T23:00:00',
        startTime: '23:00',
        endTime: '08:00',
        lineup: [],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/aeden_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/aeden/random-notes-2025-12-20'
    },
    {
        id: 'in-2025-12-20',
        title: 'Kinktastisch!',
        venueId: 'insomnia',
        date: '2025-12-20T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: [],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/insomnia_500.jpg',
        tags: ['Kink', 'Party'],
        raLink: 'https://berliner.party/en/nightclubs/insomnia/kinktastisch-2025-12-20'
    },
    {
        id: 'ae-2025-12-24',
        title: '𝓲𝓲𝓲𝓬𝓸𝓶𝓭',
        venueId: 'aeden',
        date: '2025-12-24T23:00:00',
        startTime: '23:00',
        endTime: '06:00',
        lineup: [],
        price: 10,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/aeden_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/aeden/-2025-12-24'
    },
    {
        id: 'ae-2025-12-25',
        title: 'OBXENE',
        venueId: 'aeden',
        date: '2025-12-25T23:00:00',
        startTime: '23:00',
        endTime: '08:00',
        lineup: [],
        price: 15,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/aeden_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/aeden/obxene-2025-12-25'
    },
    {
        id: 'in-2025-12-26',
        title: 'ANGEL-IN-BONDAGE',
        venueId: 'insomnia',
        date: '2025-12-26T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: [],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/insomnia_500.jpg',
        tags: ['Kink', 'Bondage'],
        raLink: 'https://berliner.party/en/nightclubs/insomnia/angel-in-bondage-2025-12-26'
    },
    {
        id: 'tr-2025-12-27',
        title: 'Tresor: True Spirit',
        venueId: 'tresor',
        date: '2025-12-27T23:00:00',
        startTime: '23:00',
        endTime: '10:00',
        lineup: [],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/tresor_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/tresor/tresor-true-2025-12-27'
    },
    {
        id: 'kb-2025-12-31',
        title: 'Forever 25 – NYE Edition',
        venueId: 'katerblau',
        date: '2025-12-31T22:00:00',
        startTime: '22:00',
        endTime: '12:00',
        lineup: [],
        price: 30,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/katerblau_500.jpg',
        tags: ['NYE', 'Party'],
        raLink: 'https://berliner.party/en/nightclubs/katerblau/forever-25-2025-12-31'
    },
    {
        id: 'rn-2025-12-31',
        title: 'Renate\'s Final Silvester: NYE 2025',
        venueId: 'renate',
        date: '2025-12-31T23:00:00',
        startTime: '23:00',
        endTime: '12:00',
        lineup: [],
        price: 35,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/renate_500.jpg',
        tags: ['NYE', 'Techno'],
        raLink: 'https://berliner.party/en/nightclubs/renate/renates-final-2025-12-31'
    },
    {
        id: 'rb-2025-12-31',
        title: 'Hippie New Year',
        venueId: 'ritterbutzke',
        date: '2025-12-31T22:00:00',
        startTime: '22:00',
        endTime: '12:00',
        lineup: [],
        price: 30,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/ritterbutzke_500.jpg',
        tags: ['NYE', 'Party'],
        raLink: 'https://berliner.party/en/nightclubs/ritterbutzke/hippie-new-2025-12-31'
    },
    {
        id: 'ae-2025-12-31',
        title: 'Bodies x Candyflip pres. BLOCC PARTY II',
        venueId: 'aeden',
        date: '2025-12-31T22:00:00',
        startTime: '22:00',
        endTime: '12:00',
        lineup: [],
        price: 25,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/aeden_500.jpg',
        tags: ['NYE', 'Techno'],
        raLink: 'https://berliner.party/en/nightclubs/aeden/bodies-x-2025-12-31'
    },
    {
        id: 'wk-2025-12-31',
        title: 'New Years Eve - Rooftop over Berlin',
        venueId: 'weekend',
        date: '2025-12-31T22:00:00',
        startTime: '22:00',
        endTime: '06:00',
        lineup: [],
        price: 40,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/weekend_500.jpg',
        tags: ['NYE', 'Rooftop'],
        raLink: 'https://berliner.party/en/nightclubs/weekend/new-years-2025-12-31'
    },
    {
        id: 'sd-2025-12-31',
        title: 'New Year\'s Eve at Kulturbrauerei',
        venueId: 'soda',
        date: '2025-12-31T20:00:00',
        startTime: '20:00',
        endTime: '06:00',
        lineup: [],
        price: 30,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/soda_500.jpg',
        tags: ['NYE', 'Party'],
        raLink: 'https://berliner.party/en/nightclubs/soda/new-years-2025-12-31'
    },
    {
        id: 'rb-2026-01-10',
        title: 'Deborah De Luca',
        venueId: 'ritterbutzke',
        date: '2026-01-10T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: ['Deborah De Luca'],
        price: 25,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/ritterbutzke_500.jpg',
        tags: ['Techno'],
        raLink: 'https://berliner.party/en/nightclubs/ritterbutzke/deborah-de-2026-01-10'
    },
    {
        id: 'rb-2026-01-24',
        title: 'Marek Hemmann',
        venueId: 'ritterbutzke',
        date: '2026-01-24T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: ['Marek Hemmann'],
        price: 20,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/ritterbutzke_500.jpg',
        tags: ['Techno', 'Live'],
        raLink: 'https://berliner.party/en/nightclubs/ritterbutzke/marek-hemmann-2026-01-24'
    },
    {
        id: 'rb-2026-01-24-2',
        title: 'Fatboy Slim',
        venueId: 'ritterbutzke',
        date: '2026-01-24T22:00:00',
        startTime: '22:00',
        endTime: '08:00',
        lineup: ['Fatboy Slim'],
        price: 30,
        currency: '€',
        imageUrl: 'https://berliner.party/img/clubs/ritterbutzke_500.jpg',
        tags: ['House', 'Legend'],
        raLink: 'https://berliner.party/en/nightclubs/ritterbutzke/fatboy-slim-2026-01-24'
    }
];

export const MOCK_NEWS = [
    {
        id: 'news-1',
        title: 'Berghain Announces New Resident DJ',
        content: 'The legendary club has added a new name to its roster of residents. Rising techno star Fadi Mohem joins the ranks of Ben Klock and Marcel Dettmann. His debut as a resident will be at the next Klubnacht.',
        source: 'admin' as const,
        imageUrl: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1000&auto=format&fit=crop',
        tags: ['Berghain', 'Techno', 'News'],
        authorName: 'Berlin Nightlife Team',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    },
    {
        id: 'news-2',
        title: 'Tresor Garden Reopens for Summer Season',
        content: 'Just in time for the warmer weather, Tresor has announced the reopening of its outdoor garden area. Expect open-air parties every Sunday starting next week.',
        source: 'venue' as const,
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1000&auto=format&fit=crop',
        tags: ['Tresor', 'Open Air', 'Summer'],
        authorName: 'Tresor Berlin',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
    },
    {
        id: 'news-3',
        title: 'New Safety Awareness Team at About Blank',
        content: 'About Blank is introducing a new awareness team to ensure a safer space for all guests. Look for the team members in pink vests if you need assistance or feel uncomfortable.',
        source: 'scraper' as const,
        imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop',
        tags: ['Safety', 'Community', 'About Blank'],
        authorName: 'Clubcommission',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
    },
    {
        id: 'news-4',
        title: 'Watergate 21st Birthday Weekender',
        content: 'Watergate is celebrating 21 years with a massive non-stop weekend party. The lineup includes Solomun, Pan-Pot, and many more. Tickets are selling fast!',
        source: 'venue' as const,
        imageUrl: 'https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=1000&auto=format&fit=crop',
        tags: ['Watergate', 'Anniversary', 'Party'],
        authorName: 'Watergate Club',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
    }
];
