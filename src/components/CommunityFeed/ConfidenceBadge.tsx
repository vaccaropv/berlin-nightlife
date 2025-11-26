import './ConfidenceBadge.css';

interface ConfidenceBadgeProps {
    level: 'high' | 'medium' | 'low';
    recentReportCount: number;
}

export default function ConfidenceBadge({ level, recentReportCount }: ConfidenceBadgeProps) {
    const getLabel = () => {
        switch (level) {
            case 'high':
                return 'High confidence';
            case 'medium':
                return 'Moderate confidence';
            case 'low':
                return 'Needs confirmation';
        }
    };

    const getTooltip = () => {
        return `${recentReportCount} report${recentReportCount !== 1 ? 's' : ''} in last 30 minutes`;
    };

    return (
        <div className={`confidence-badge ${level}`} title={getTooltip()}>
            <span className="badge-icon">
                {level === 'high' && '✓'}
                {level === 'medium' && '~'}
                {level === 'low' && '?'}
            </span>
            <span className="badge-label">{getLabel()}</span>
        </div>
    );
}
