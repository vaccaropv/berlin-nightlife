import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { MOCK_VENUES } from '../../../data/mockData';
import { Save, X, User, MapPin, Bell, Mail, Smartphone, Tag } from 'lucide-react';
import './EditProfileView.css';

interface EditProfileViewProps {
    onClose: () => void;
}

export default function EditProfileView({ onClose }: EditProfileViewProps) {
    const { user, updateProfile, checkUsernameUnique, requestPasswordReset } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [favoriteVenueIds, setFavoriteVenueIds] = useState<string[]>(user?.favoriteVenueIds || []);
    const [notifications, setNotifications] = useState(user?.notificationPreferences || {
        email: true,
        push: true,
        marketing: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

    // Calculate days until next username change
    const getDaysUntilUsernameChange = () => {
        if (!user?.usernameLastChanged) return 0;
        const lastChanged = new Date(user.usernameLastChanged);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastChanged.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, 30 - diffDays);
    };

    const daysUntilChange = getDaysUntilUsernameChange();
    const canChangeUsername = daysUntilChange === 0;

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            // Check username uniqueness if changed
            if (username !== user?.username) {
                if (!canChangeUsername) {
                    throw new Error(`You can change your username again in ${daysUntilChange} days.`);
                }
                const isUnique = await checkUsernameUnique(username);
                if (!isUnique) {
                    throw new Error('Username is already taken');
                }
            }

            await updateProfile({
                username,
                favoriteVenueIds,
                notificationPreferences: notifications
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        try {
            await requestPasswordReset(user.email);
            setPasswordMessage(`Password reset link sent to ${user.email}`);
        } catch (err) {
            setPasswordMessage('Failed to send reset link');
        }
    };

    const toggleVenue = (venueId: string) => {
        setFavoriteVenueIds(prev => {
            if (prev.includes(venueId)) {
                return prev.filter(id => id !== venueId);
            } else {
                if (prev.length >= 3) {
                    // Optional: Limit max favorites
                    return prev;
                }
                return [...prev, venueId];
            }
        });
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="edit-profile-container fade-in">
            <div className="edit-header">
                <h2>Edit Profile</h2>
                <button className="close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            <div className="edit-form">
                {/* Username */}
                <div className="form-group">
                    <label>
                        <User size={16} /> Username
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="form-input"
                        disabled={!canChangeUsername}
                    />
                    {!canChangeUsername && (
                        <div className="field-info warning">
                            Next change available in {daysUntilChange} days
                        </div>
                    )}
                </div>

                {/* Password Reset */}
                <div className="form-group">
                    <label>Password</label>
                    <button
                        className="action-btn btn-secondary"
                        onClick={handlePasswordReset}
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        Send Password Reset Email
                    </button>
                    {passwordMessage && (
                        <div className="field-info success">{passwordMessage}</div>
                    )}
                </div>

                {/* Favorite Venues */}
                <div className="form-group">
                    <label>
                        <MapPin size={16} /> Favorite Venues (Max 3)
                    </label>
                    <div className="venue-selector">
                        {MOCK_VENUES.map(venue => (
                            <div
                                key={venue.id}
                                className={`venue-chip ${favoriteVenueIds.includes(venue.id) ? 'selected' : ''}`}
                                onClick={() => toggleVenue(venue.id)}
                            >
                                {venue.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="section-title">
                    <Bell size={16} /> Notification Preferences
                </div>

                <div className="notification-options">
                    <div className="toggle-item" onClick={() => toggleNotification('email')}>
                        <div className="toggle-info">
                            <span className="toggle-label"><Mail size={14} /> Email Notifications</span>
                            <span className="toggle-desc">Receive weekly digests and important updates</span>
                        </div>
                        <div className={`toggle-switch ${notifications.email ? 'active' : ''}`}>
                            <div className="toggle-knob" />
                        </div>
                    </div>

                    <div className="toggle-item" onClick={() => toggleNotification('push')}>
                        <div className="toggle-info">
                            <span className="toggle-label"><Smartphone size={14} /> Push Notifications</span>
                            <span className="toggle-desc">Real-time alerts for queue updates</span>
                        </div>
                        <div className={`toggle-switch ${notifications.push ? 'active' : ''}`}>
                            <div className="toggle-knob" />
                        </div>
                    </div>

                    <div className="toggle-item" onClick={() => toggleNotification('marketing')}>
                        <div className="toggle-info">
                            <span className="toggle-label"><Tag size={14} /> Partner Offers</span>
                            <span className="toggle-desc">Exclusive deals from clubs and partners</span>
                        </div>
                        <div className={`toggle-switch ${notifications.marketing ? 'active' : ''}`}>
                            <div className="toggle-knob" />
                        </div>
                    </div>
                </div>

                {/* Error/Success Messages */}
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">Profile updated successfully!</div>}

                {/* Actions */}
                <div className="form-actions">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button
                        className="save-btn"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save size={18} /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
