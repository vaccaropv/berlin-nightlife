import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { getUserStats, requestPasswordReset, updatePassword, checkUsernameUnique } from '../api/communityApi';

export interface UserProfile {
    userId: string;
    username: string;
    email?: string;
    phone?: string;
    reportCount?: number;
    points?: number;
    venuesReported?: number;
    recentReports?: any[];
    favoriteVenueIds?: string[];
    usernameLastChanged?: string;
    notificationPreferences?: {
        email: boolean;
        push: boolean;
        marketing: boolean;
    };
}

interface AuthContextType {
    user: UserProfile | null;
    session: Session | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    requestPasswordReset: (email: string) => Promise<any>;
    updatePassword: (password: string) => Promise<any>;
    checkUsernameUnique: (username: string) => Promise<boolean>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile data (username, stats)
    const fetchUserProfile = async (currentUser: SupabaseUser) => {
        try {
            // Get username from public users table
            let { data: publicUser, error } = await supabase
                .from('users')
                .select('username, favorite_venue_ids, notification_preferences, username_last_changed')
                .eq('id', currentUser.id)
                .single();

            // Self-healing: If user missing in public table, create it
            if (error && error.code === 'PGRST116') {
                console.log('User missing in public table, creating record...');
                const { data: newUser, error: insertError } = await supabase
                    .from('users')
                    .insert([{
                        id: currentUser.id,
                        username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || 'User',
                        phone: currentUser.phone
                    }])
                    .select('username, favorite_venue_ids, notification_preferences, username_last_changed')
                    .single();

                if (insertError) {
                    console.error('Error creating public user record:', insertError);
                } else {
                    publicUser = newUser;
                    error = null; // Clear error as we fixed it
                }
            } else if (error) {
                console.error('Error fetching public user profile:', error);
            }

            // Get stats
            const stats = await getUserStats(currentUser.id);

            setUser({
                userId: currentUser.id,
                email: currentUser.email,
                phone: currentUser.phone,
                username: publicUser?.username || currentUser.user_metadata?.username || 'User',
                reportCount: stats.reportCount,
                points: stats.points,
                venuesReported: stats.venuesReported,
                recentReports: stats.recentReports,
                favoriteVenueIds: publicUser?.favorite_venue_ids || [],
                usernameLastChanged: publicUser?.username_last_changed,
                notificationPreferences: publicUser?.notification_preferences || {
                    email: true,
                    push: true,
                    marketing: false
                }
            });
        } catch (error) {
            console.error('Error in fetchUserProfile:', error);
        }
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshProfile = async () => {
        if (session?.user) {
            await fetchUserProfile(session.user);
        }
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!session?.user) return;

        try {
            const dbUpdates: any = {};

            // Username update logic (30 day limit)
            if (updates.username && updates.username !== user?.username) {
                if (user?.usernameLastChanged) {
                    const lastChanged = new Date(user.usernameLastChanged);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - lastChanged.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays < 30) {
                        const daysLeft = 30 - diffDays;
                        throw new Error(`You can change your username again in ${daysLeft} days.`);
                    }
                }
                dbUpdates.username = updates.username;
                dbUpdates.username_last_changed = new Date().toISOString();
            }

            if (updates.favoriteVenueIds !== undefined) dbUpdates.favorite_venue_ids = updates.favoriteVenueIds;
            if (updates.notificationPreferences) dbUpdates.notification_preferences = updates.notificationPreferences;

            if (Object.keys(dbUpdates).length > 0) {
                const { error } = await supabase
                    .from('users')
                    .update(dbUpdates)
                    .eq('id', session.user.id);

                if (error) throw error;

                // Refresh local state
                await fetchUserProfile(session.user);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            refreshProfile,
            logout,
            isAuthenticated: !!session,
            requestPasswordReset,
            updatePassword,
            checkUsernameUnique,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
