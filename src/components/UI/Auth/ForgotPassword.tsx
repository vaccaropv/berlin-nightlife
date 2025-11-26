import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './AuthView.css';

interface ForgotPasswordProps {
    onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
    const { requestPasswordReset } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await requestPasswordReset(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-form fade-in success-state">
                <div className="success-icon">📧</div>
                <h2>Check your email</h2>
                <p>We sent a password reset link to {email}</p>
                <button className="submit-btn" onClick={onBack} style={{ marginTop: '24px' }}>
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleRequestReset} className="auth-form fade-in">
            <button type="button" className="back-btn" onClick={onBack}>← Back</button>
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">Enter your email to receive a reset link</p>

            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
                <label>Email Address</label>
                <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
        </form>
    );
}
