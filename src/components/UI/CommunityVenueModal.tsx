import { X, MapPin } from 'lucide-react';
import { Venue } from '../../data/mockData';
import CommunityTab from './CommunityTab';
import './CommunityVenueModal.css';

interface CommunityVenueModalProps {
    venue: Venue;
    onClose: () => void;
    onReportClick: () => void;
    onLoginClick: () => void;
}

export default function CommunityVenueModal({ venue, onClose, onReportClick, onLoginClick }: CommunityVenueModalProps) {
    return (
        <div className="community-venue-modal-overlay" onClick={onClose}>
            <div className="community-venue-modal glass-panel" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="venue-info">
                        <h2>{venue.name}</h2>
                        <div className="venue-meta">
                            <MapPin size={14} className="icon" />
                            <span>{venue.address}</span>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-content">
                    <CommunityTab
                        venueId={venue.id}
                        venueName={venue.name}
                        onReportClick={onReportClick}
                        onLoginClick={onLoginClick}
                    />
                </div>
            </div>
        </div>
    );
}
