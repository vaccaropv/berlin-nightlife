import { Zap } from 'lucide-react';

interface LiveToggleProps {
    isActive: boolean;
    onToggle: () => void;
}

export default function LiveToggle({ isActive, onToggle }: LiveToggleProps) {
    return (
        <button
            className={`live-toggle ${isActive ? 'active' : ''}`}
            onClick={onToggle}
        >
            <div className="toggle-content">
                <Zap size={16} className={isActive ? 'animate-pulse' : ''} />
                <span>Happening Now</span>
            </div>
            <div className="toggle-switch">
                <div className="toggle-knob" />
            </div>
        </button>
    );
}
