import { Plus } from 'lucide-react';
import './FloatingActionButton.css';

interface FloatingActionButtonProps {
    onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
    return (
        <button
            className="fab-button"
            onClick={onClick}
            aria-label="Quick Report"
        >
            <Plus size={28} color="white" />
        </button>
    );
}
