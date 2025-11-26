import { LiveUpdate } from '../../data/mockData';
import { Users, DoorOpen, AlertTriangle, Calendar } from 'lucide-react';

interface LiveFeedProps {
    updates: LiveUpdate[];
}

export default function LiveFeed({ updates }: LiveFeedProps) {
    const getIcon = (type: LiveUpdate['type']) => {
        switch (type) {
            case 'Queue': return <Users size={14} color="#ff0055" />;
            case 'Door': return <DoorOpen size={14} color="#39ff14" />;
            case 'Alert': return <AlertTriangle size={14} color="#ffcc00" />;
            case 'Event': return <Calendar size={14} color="#00ccff" />;
        }
    };

    return (
        <div className="live-feed">
            <div className="live-feed-list">
                {updates.map(update => (
                    <div key={update.id} className="live-update-item">
                        <div className="update-icon">
                            {getIcon(update.type)}
                        </div>
                        <div className="update-content">
                            <p>
                                <strong>{update.type}:</strong> {update.message}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
