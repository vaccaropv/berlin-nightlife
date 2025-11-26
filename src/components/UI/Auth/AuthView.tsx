import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPassword from './ForgotPassword';
import './AuthView.css';

export default function AuthView() {
    const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'check-email'>('login');
    const [email, setEmail] = useState('');

    const handleSignupSuccess = (email: string) => {
        setEmail(email);
        setView('check-email');
    };

    if (view === 'forgot') {
        return <ForgotPassword onBack={() => setView('login')} />;
    }

    if (view === 'check-email') {
        return (
            <div className="auth-form fade-in success-state">
                <div className="success-icon">📧</div>
                <h2>Check your email</h2>
                <p>We sent a confirmation link to {email}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px' }}>
                    Click the link in the email to verify your account, then log in.
                </p>
                <button className="submit-btn" onClick={() => setView('login')} style={{ marginTop: '24px' }}>
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="auth-container">
            {view === 'login' ? (
                <LoginForm
                    onForgotPassword={() => setView('forgot')}
                    onSwitchToSignup={() => setView('signup')}
                />
            ) : (
                <SignupForm
                    onSuccess={handleSignupSuccess}
                    onSwitchToLogin={() => setView('login')}
                />
            )}
        </div>
    );
}
