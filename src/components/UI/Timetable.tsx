import { useState, useEffect } from 'react';
import { SisyphosEvent, TimetableEntry } from '../../data/sisyphosData';
import { Clock } from 'lucide-react';

interface TimetableProps {
    event: SisyphosEvent;
}

export default function Timetable({ event }: TimetableProps) {
    const stages = Array.from(new Set(event.timetable.map(t => t.stage)));
    const [activeStage, setActiveStage] = useState(stages[0]);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getStatus = (entry: TimetableEntry) => {
        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime);

        if (now >= start && now < end) return 'current';
        if (now < start) return 'upcoming';
        return 'past';
    };

    const getCountdown = (entry: TimetableEntry) => {
        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime);
        const status = getStatus(entry);

        let target = start;
        let prefix = 'Starts in';

        if (status === 'current') {
            target = end;
            prefix = 'Ends in';
        } else if (status === 'past') {
            return 'Ended';
        }

        const diff = target.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${prefix} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const filteredEntries = event.timetable
        .filter(t => t.stage === activeStage)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Check if the entire event has ended (all entries in the past)
    const isEventEnded = event.timetable.every(t => new Date(t.endTime) < now);

    if (isEventEnded) {
        return (
            <div className="timetable-container ended">
                <div className="event-ended-message">
                    <Clock size={24} className="ended-icon" />
                    <h4>Event Ended</h4>
                    <p>The party is over... for now.</p>
                    <span className="next-event-hint">Check back later for the next lineup!</span>
                </div>
                <style>{`
                    .timetable-container.ended {
                        background: rgba(0,0,0,0.4);
                        padding: 32px 16px;
                        text-align: center;
                        border: 1px solid rgba(255,255,255,0.05);
                    }
                    .event-ended-message {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                        color: var(--text-muted);
                    }
                    .ended-icon {
                        color: var(--text-muted);
                        opacity: 0.5;
                        margin-bottom: 4px;
                    }
                    .event-ended-message h4 {
                        margin: 0;
                        color: var(--text-main);
                        font-size: 16px;
                    }
                    .event-ended-message p {
                        margin: 0;
                        font-size: 13px;
                    }
                    .next-event-hint {
                        font-size: 11px;
                        opacity: 0.7;
                        margin-top: 8px;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="timetable-container">
            <div className="stage-tabs">
                {stages.map(stage => (
                    <button
                        key={stage}
                        className={`stage-tab ${activeStage === stage ? 'active' : ''}`}
                        onClick={() => setActiveStage(stage)}
                    >
                        {stage}
                    </button>
                ))}
            </div>

            <div className="timetable-list">
                {filteredEntries.map(entry => {
                    const status = getStatus(entry);
                    return (
                        <div key={entry.id} className={`timetable-row ${status}`}>
                            <div className="time-col">
                                <span className="start-time">
                                    {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="end-time">
                                    {new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="artist-col">
                                <span className="artist-name">{entry.artist}</span>
                                <div className="countdown-badge">
                                    <Clock size={10} />
                                    <span>{getCountdown(entry)}</span>
                                </div>
                            </div>

                            {status === 'current' && (
                                <div className="live-indicator">
                                    <span className="pulse-dot"></span>
                                    LIVE
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                .timetable-container {
                    margin-top: 20px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 12px;
                    overflow: hidden;
                }
                .stage-tabs {
                    display: flex;
                    overflow-x: auto;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.02);
                }
                .stage-tab {
                    padding: 12px 16px;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }
                .stage-tab.active {
                    color: var(--primary);
                    border-bottom-color: var(--primary);
                    background: rgba(57, 255, 20, 0.05);
                }
                .timetable-list {
                    padding: 8px;
                }
                .timetable-row {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 4px;
                    background: rgba(255,255,255,0.02);
                    transition: all 0.2s;
                }
                .timetable-row.current {
                    background: rgba(57, 255, 20, 0.1);
                    border: 1px solid rgba(57, 255, 20, 0.2);
                }
                .timetable-row.past {
                    opacity: 0.5;
                }
                .time-col {
                    display: flex;
                    flex-direction: column;
                    font-size: 11px;
                    color: var(--text-muted);
                    width: 50px;
                    margin-right: 12px;
                    font-family: monospace;
                }
                .artist-col {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .artist-name {
                    font-weight: 700;
                    font-size: 14px;
                    color: var(--text-main);
                }
                .countdown-badge {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 10px;
                    color: var(--text-muted);
                    background: rgba(0,0,0,0.3);
                    padding: 2px 6px;
                    border-radius: 4px;
                    width: fit-content;
                }
                .timetable-row.current .countdown-badge {
                    color: var(--primary);
                    background: rgba(0,0,0,0.5);
                }
                .live-indicator {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10px;
                    font-weight: 800;
                    color: var(--primary);
                    padding-left: 12px;
                }
                .pulse-dot {
                    width: 6px;
                    height: 6px;
                    background: var(--primary);
                    border-radius: 50%;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
