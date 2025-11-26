import { useAuth } from '../../context/AuthContext';
import AuthView from './Auth/AuthView';
import UserProfile from './Auth/UserProfile';

export default function ProfileView() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    return (
        <div className="view-container">
            {isAuthenticated ? <UserProfile /> : <AuthView />}
        </div>
    );
}
