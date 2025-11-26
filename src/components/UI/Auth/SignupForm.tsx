import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { signUpWithEmail } from '../../../api/communityApi';
import './AuthView.css';

interface SignupFormProps {
    onSuccess: (email: string) => void;
    onSwitchToLogin: () => void;
}

export default function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
    const { checkUsernameUnique } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        terms: false
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const validate = async () => {
        const newErrors: Record<string, string> = {};

        // Email validation
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = 'Invalid email format';
        }

        // Username validation
        if (!formData.username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
            newErrors.username = '3-20 chars, alphanumeric & underscore only';
        } else {
            const isUnique = await checkUsernameUnique(formData.username);
            if (!isUnique) newErrors.username = 'Username already taken';
        }

        // Password validation
        if (formData.password.length < 8) {
            newErrors.password = 'Min 8 chars';
        } else if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
            newErrors.password = 'Must include 1 uppercase & 1 number';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.terms) {
            newErrors.terms = 'You must agree to the terms';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (await validate()) {
            try {
                await signUpWithEmail(formData.email, formData.password, formData.username);
                onSuccess(formData.email);
            } catch (err: any) {
                setErrors({ submit: err.message || 'Signup failed' });
            }
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form fade-in">
            <h2 className="auth-title">Join the Community</h2>
            <p className="auth-subtitle">Get real-time club intel from locals</p>

            {errors.submit && <div className="auth-error">{errors.submit}</div>}

            <div className="form-group">
                <label>Email Address</label>
                <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
                <label>Username</label>
                <input
                    type="text"
                    placeholder="CoolClubber"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className={errors.username ? 'error' : ''}
                />
                {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
                <label>Confirm Password</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <div className="checkbox-group">
                <input
                    type="checkbox"
                    id="terms"
                    checked={formData.terms}
                    onChange={e => setFormData({ ...formData, terms: e.target.checked })}
                />
                <label htmlFor="terms">I agree to Terms & Privacy Policy</label>
            </div>
            {errors.terms && <span className="field-error block">{errors.terms}</span>}

            <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="auth-footer">
                Already have an account? <span onClick={onSwitchToLogin}>Log in</span>
            </p>
        </form>
    );
}
