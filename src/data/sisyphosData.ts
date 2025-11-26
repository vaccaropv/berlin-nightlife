export interface TimetableEntry {
    id: string;
    artist: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    stage: string;
}

export interface SisyphosEvent {
    title: string;
    dateRange: string;
    timetable: TimetableEntry[];
}

// Helper to create dates relative to now for demo purposes
const getRelativeDate = (hoursOffset: number) => {
    const date = new Date();
    date.setHours(date.getHours() + hoursOffset);
    date.setMinutes(0);
    date.setSeconds(0);
    return date.toISOString();
};

// Mocking the "DICHTE DENKENDE" event but making it live now
export const SISYPHOS_EVENT: SisyphosEvent = {
    title: "DICHTE DENKENDE",
    dateRange: "21.11.2025 - 24.11.2025", // Keeping original title but shifting times
    timetable: [
        // Hammahalle
        {
            id: 'h1',
            stage: 'Hammahalle',
            artist: 'Lydion',
            startTime: getRelativeDate(-3),
            endTime: getRelativeDate(0),
        },
        {
            id: 'h2',
            stage: 'Hammahalle',
            artist: 'Hennon',
            startTime: getRelativeDate(0),
            endTime: getRelativeDate(3),
        },
        {
            id: 'h3',
            stage: 'Hammahalle',
            artist: 'RBÉ_',
            startTime: getRelativeDate(3),
            endTime: getRelativeDate(6),
        },
        {
            id: 'h4',
            stage: 'Hammahalle',
            artist: 'DJ Love Me',
            startTime: getRelativeDate(6),
            endTime: getRelativeDate(9),
        },
        // Wintergarten
        {
            id: 'w1',
            stage: 'Wintergarten',
            artist: 'K.Eule',
            startTime: getRelativeDate(-2),
            endTime: getRelativeDate(1),
        },
        {
            id: 'w2',
            stage: 'Wintergarten',
            artist: 'Vittjas Tief',
            startTime: getRelativeDate(1),
            endTime: getRelativeDate(4),
        },
        {
            id: 'w3',
            stage: 'Wintergarten',
            artist: 'Michael Klein',
            startTime: getRelativeDate(4),
            endTime: getRelativeDate(7),
        },
        // Dampfer
        {
            id: 'd1',
            stage: 'Dampfer',
            artist: 'Sål',
            startTime: getRelativeDate(-1),
            endTime: getRelativeDate(2),
        },
        {
            id: 'd2',
            stage: 'Dampfer',
            artist: 'Anna Schreit',
            startTime: getRelativeDate(2),
            endTime: getRelativeDate(5),
        }
    ]
};
