import { useState, useEffect, useRef } from 'react';
import { X, Search, MapPin, Camera, Check, AlertCircle } from 'lucide-react';
import { submitReport } from '../../api/communityApi';
import { useAuth } from '../../context/AuthContext';
import { MOCK_VENUES } from '../../data/mockData';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    venueId?: string;
    venueName?: string;
    onSuccess: () => void;
}

const QUEUE_OPTIONS = [
    { value: 'No Queue', label: 'None', emoji: '✅' },
    { value: 'Short', label: 'Short', emoji: '🟢' },
    { value: 'Medium', label: 'Medium', emoji: '🟡' },
    { value: 'Long', label: 'Long', emoji: '🟠' },
    { value: 'Full', label: 'Very Long', emoji: '🔴' }
];

const DOOR_OPTIONS = [
    { value: 'Relaxed', label: 'Relaxed', emoji: '😊' },
    { value: 'Standard', label: 'Normal', emoji: '🙂' },
    { value: 'Strict', label: 'Selective', emoji: '😐' },
    { value: 'Very Strict', label: 'Strict', emoji: '🤨' },
    { value: 'Impossible', label: 'Very Strict', emoji: '😤' }
];

const CAPACITY_OPTIONS = [
    { value: 'Empty', label: 'Empty', emoji: '⬜' },
    { value: 'Comfortable', label: 'Comfortable', emoji: '🟩' },
    { value: 'Busy', label: 'Busy', emoji: '🟨' },
    { value: 'Packed', label: 'Packed', emoji: '🟥' }
];

const VIBE_EMOJIS = [
    { emoji: '🔥', label: 'Fire' },
    { emoji: '💃', label: 'Dancing' },
    { emoji: '🎵', label: 'Music' },
    { emoji: '😴', label: 'Dead' },
    { emoji: '👥', label: 'Social' },
    { emoji: '🌈', label: 'Inclusive' },
    { emoji: '💫', label: 'Electric' }
];

export default function ReportModal({ isOpen, onClose, venueId: initialVenueId, venueName: initialVenueName, onSuccess }: ReportModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState<'select-venue' | 'report'>('report');
    const [selectedVenueId, setSelectedVenueId] = useState<string>('');
    const [selectedVenueName, setSelectedVenueName] = useState<string>('');
    const [selectedVenueLogo, setSelectedVenueLogo] = useState<string | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [queueIndex, setQueueIndex] = useState(2); // Medium
    const [doorIndex, setDoorIndex] = useState(1); // Standard
    const [capacityIndex, setCapacityIndex] = useState(1); // Comfortable
    const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
    const [vibeDetails, setVibeDetails] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [touched, setTouched] = useState({ queue: false, door: false, capacity: false });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialVenueId) {
                setSelectedVenueId(initialVenueId);
                setSelectedVenueName(initialVenueName || '');
                const venue = MOCK_VENUES.find(v => v.id === initialVenueId);
                setSelectedVenueLogo(venue?.logoUrl);
                setStep('report');
            } else {
                setSelectedVenueId('');
                setSelectedVenueName('');
                setSelectedVenueLogo(undefined);
                setStep('select-venue');
                setSearchQuery('');
            }
            // Reset form
            setQueueIndex(2);
            setDoorIndex(1);
            setCapacityIndex(1);
            setSelectedVibes([]);
            setVibeDetails('');
            setPhoto(null);
            setPhotoPreview(null);
            setTouched({ queue: false, door: false, capacity: false });
            setError('');
            setSuccess(false);
            setLoading(false);
        }
    }, [isOpen, initialVenueId, initialVenueName]);

    if (!isOpen || !user) return null;

    const filteredVenues = MOCK_VENUES.filter(venue =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleVenueSelect = (venue: typeof MOCK_VENUES[0]) => {
        setSelectedVenueId(venue.id);
        setSelectedVenueName(venue.name);
        setSelectedVenueLogo(venue.logoUrl);
        setStep('report');
    };

    const toggleVibe = (emoji: string) => {
        setSelectedVibes(prev => {
            if (prev.includes(emoji)) {
                return prev.filter(e => e !== emoji);
            }
            if (prev.length >= 3) {
                return prev;
            }
            return [...prev, emoji];
        });
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVenueId) return;

        // Validation: Ensure at least one field is touched or provided
        if (!touched.queue && !touched.door && !touched.capacity && selectedVibes.length === 0 && !photo && !vibeDetails) {
            setError('Please provide at least one update (Queue, Door, Capacity, Vibe, or Photo).');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await submitReport(
                selectedVenueId,
                user.userId,
                QUEUE_OPTIONS[queueIndex].value,
                DOOR_OPTIONS[doorIndex].value,
                CAPACITY_OPTIONS[capacityIndex].value,
                selectedVibes,
                vibeDetails,
                photo || undefined
            );

            setSuccess(true);
            onSuccess();

            // Auto close after 2 seconds
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'Failed to submit report. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="modal-content glass-panel report-modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                {success ? (
                    <div className="success-container animate-scale-in">
                        <div className="success-icon">
                            <Check size={48} />
                        </div>
                        <h2>Report Submitted!</h2>
                        <p>Thanks! Your report helps the community 🎉</p>
                        <div className="xp-gained">+10 points</div>
                    </div>
                ) : step === 'select-venue' ? (
                    <>
                        <div className="modal-header">
                            <h2>Select Venue</h2>
                            <p className="subtitle">Where are you reporting from?</p>
                        </div>

                        <div className="venue-search-container">
                            <div className="search-input-wrapper">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search club..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="venue-search-input"
                                    autoFocus
                                />
                            </div>

                            <div className="venue-list">
                                {filteredVenues.map(venue => (
                                    <div
                                        key={venue.id}
                                        className="venue-list-item"
                                        onClick={() => handleVenueSelect(venue)}
                                    >
                                        <div className="venue-icon">
                                            {venue.logoUrl ? (
                                                <img src={venue.logoUrl} alt={venue.name} />
                                            ) : (
                                                <MapPin size={16} />
                                            )}
                                        </div>
                                        <div className="venue-info">
                                            <span className="venue-name">{venue.name}</span>
                                            <span className="venue-address">{venue.address}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="modal-header">
                            <h2>Quick Report</h2>
                            <div className="selected-venue-display">
                                {selectedVenueLogo && <img src={selectedVenueLogo} alt="Logo" className="venue-logo-small" />}
                                <span className="highlight">{selectedVenueName}</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="report-form">
                            {/* Queue Slider */}
                            <div className="form-group slider-group">
                                <div className="slider-header">
                                    <label>Queue Status</label>
                                    <span className="slider-value">
                                        {QUEUE_OPTIONS[queueIndex].emoji} {QUEUE_OPTIONS[queueIndex].label}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="4"
                                    step="1"
                                    value={queueIndex}
                                    onChange={(e) => {
                                        setQueueIndex(parseInt(e.target.value));
                                        setTouched(prev => ({ ...prev, queue: true }));
                                    }}
                                    className="custom-range queue-range"
                                />
                                <div className="slider-labels">
                                    <span>None</span>
                                    <span>Very Long</span>
                                </div>
                            </div>

                            {/* Door Policy Slider */}
                            <div className="form-group slider-group">
                                <div className="slider-header">
                                    <label>Door Policy</label>
                                    <span className="slider-value">
                                        {DOOR_OPTIONS[doorIndex].emoji} {DOOR_OPTIONS[doorIndex].label}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="4"
                                    step="1"
                                    value={doorIndex}
                                    onChange={(e) => {
                                        setDoorIndex(parseInt(e.target.value));
                                        setTouched(prev => ({ ...prev, door: true }));
                                    }}
                                    className="custom-range door-range"
                                />
                                <div className="slider-labels">
                                    <span>Relaxed</span>
                                    <span>Strict</span>
                                </div>
                            </div>

                            {/* Capacity Slider */}
                            <div className="form-group slider-group">
                                <div className="slider-header">
                                    <label>Capacity</label>
                                    <span className="slider-value">
                                        {CAPACITY_OPTIONS[capacityIndex].emoji} {CAPACITY_OPTIONS[capacityIndex].label}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="3"
                                    step="1"
                                    value={capacityIndex}
                                    onChange={(e) => {
                                        setCapacityIndex(parseInt(e.target.value));
                                        setTouched(prev => ({ ...prev, capacity: true }));
                                    }}
                                    className="custom-range capacity-range"
                                />
                                <div className="slider-labels">
                                    <span>Empty</span>
                                    <span>Packed</span>
                                </div>
                            </div>

                            {/* Vibe Selector */}
                            <div className="form-group">
                                <label>Vibe (Select up to 3)</label>
                                <div className="vibe-grid">
                                    {VIBE_EMOJIS.map((vibe) => (
                                        <button
                                            key={vibe.label}
                                            type="button"
                                            className={`vibe-btn ${selectedVibes.includes(vibe.emoji) ? 'active' : ''}`}
                                            onClick={() => toggleVibe(vibe.emoji)}
                                        >
                                            <span className="emoji">{vibe.emoji}</span>
                                            <span className="label">{vibe.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add more details... (optional)"
                                    value={vibeDetails}
                                    onChange={(e) => setVibeDetails(e.target.value)}
                                    maxLength={100}
                                    className="styled-input vibe-details-input"
                                />
                            </div>

                            {/* Photo Upload */}
                            <div className="form-group">
                                <label>Photo (Optional)</label>
                                <div className="photo-upload-container">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handlePhotoSelect}
                                        style={{ display: 'none' }}
                                    />
                                    {photoPreview ? (
                                        <div className="photo-preview">
                                            <img src={photoPreview} alt="Preview" />
                                            <button
                                                type="button"
                                                className="remove-photo-btn"
                                                onClick={() => {
                                                    setPhoto(null);
                                                    setPhotoPreview(null);
                                                }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="upload-btn"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera size={20} />
                                            <span>Add Photo</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="error-message animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4444', background: 'rgba(255, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <button type="submit" className="submit-btn neon-btn" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </button>

                            {!initialVenueId && (
                                <button
                                    type="button"
                                    className="back-btn"
                                    onClick={() => setStep('select-venue')}
                                >
                                    Change Venue
                                </button>
                            )}
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
