import './FreshnessDot.css';

interface FreshnessDotProps {
    freshness: 'fresh' | 'recent' | 'old';
    timestamp: string;
}

export default function FreshnessDot({ freshness, timestamp: _timestamp }: FreshnessDotProps) {
    const getLabel = () => {
        switch (freshness) {
            case 'fresh':
                return 'Just posted';
            case 'recent':
                return 'Recent';
            case 'old':
                return 'Older';
        }
    };

    return (
        <div className={`freshness-dot ${freshness}`} title={getLabel()}>
            <span className="dot"></span>
        </div>
    );
}
