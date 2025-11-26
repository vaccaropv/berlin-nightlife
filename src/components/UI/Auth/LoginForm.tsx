import { useState } from 'react';
import { loginWithEmail } from '../../../api/communityApi';
import { useAuth } from '../../../context/AuthContext';
import './AuthView.css';

interface LoginFormProps {
    onForgotPassword: () => void;
    onSwitchToSignup: () => void;
}

export default function LoginForm({ onForgotPassword, onSwitchToSignup }: LoginFormProps) {
    const { refreshProfile } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await loginWithEmail(email, password);
            await refreshProfile();
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form fade-in">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Log in to continue</p>

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

            <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <span className="forgot-link" onClick={onForgotPassword}>Forgot Password?</span>
            </div>

            <div className="checkbox-group">
                <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Stay logged in</label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
            </button>

            <p className="auth-footer">
                New here? <span onClick={onSwitchToSignup}>Create account</span>
            </p>
        </form>
    );
}
