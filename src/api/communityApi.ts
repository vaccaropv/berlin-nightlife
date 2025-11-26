import { supabase } from '../lib/supabase';

export interface User {
    userId: string; // Changed to string (UUID)
    username: string;
    email?: string;
    phone?: string;
}

export interface StatusReport {
    id: string; // Changed to string (UUID)
    username: string;
    queueLength: string;
    doorPolicy: string;
    capacity: string;
    vibe: string[];
    vibeDetails?: string;
    photoUrl?: string;
    timestamp: string;
}

export interface AggregatedStatus {
    queue: string;
    doorPolicy: string;
    capacity: string;
    lastUpdate: string;
    reportCount: number;
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string, username: string) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                },
            },
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Sign up error:', error);
        throw error;
    }
}

/**
 * Login with email and password
 */
export async function loginWithEmail(email: string, password: string) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password', // Ensure this route exists or handles the token
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Request password reset error:', error);
        throw error;
    }
}

/**
 * Request OTP for login (Forgot Password flow) - REMOVED
 */
// export async function requestLoginOtp(phone: string) { ... }

/**
 * Verify OTP for login (Forgot Password flow) - REMOVED
 */
// export async function verifyLoginOtp(phone: string, token: string) { ... }

/**
 * Update user password
 */
export async function updatePassword(password: string) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            password
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Update password error:', error);
        throw error;
    }
}

/**
 * Check if username is unique
 */
export async function checkUsernameUnique(username: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single();

        if (error && error.code === 'PGRST116') {
            return true; // Not found, so it is unique
        }

        if (error) throw error;

        return false; // Found, so not unique
    } catch (error) {
        console.error('Check username error:', error);
        return false; // Assume not unique on error to be safe
    }
}

/**
 * Get user stats (report count, points, unique venues, recent reports)
 */
export async function getUserStats(userId: string) {
    try {
        // Fetch all reports for the user to calculate stats
        // In a real app with many reports, we would use a dedicated stats table or more efficient queries
        const { data: reports, error } = await supabase
            .from('reports')
            .select('venue_id, created_at, queue_length, vibe')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const reportCount = reports?.length || 0;
        const points = reportCount * 10; // 10 points per report

        // Calculate unique venues
        const uniqueVenues = new Set(reports?.map(r => r.venue_id)).size;

        // Get recent activity (last 5)
        const recentReports = reports?.slice(0, 5) || [];

        return {
            reportCount,
            points,
            venuesReported: uniqueVenues,
            recentReports
        };
    } catch (error) {
        console.error('Get user stats error:', error);
        return { reportCount: 0, points: 0, venuesReported: 0, recentReports: [] };
    }
}

/**
 * Legacy Login (kept for compatibility if needed, but we are moving to Supabase Auth)
 */
export async function legacyLogin(phone: string, username: string): Promise<User> {
    try {
        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('phone', phone)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
            throw fetchError;
        }

        if (existingUser) {
            return {
                userId: existingUser.id,
                username: existingUser.username,
                phone: existingUser.phone
            };
        }

        // Create new user
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ phone, username }])
            .select()
            .single();

        if (insertError) throw insertError;

        return {
            userId: newUser.id,
            username: newUser.username,
            phone: newUser.phone
        };
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Submit a status report
 */
export async function submitReport(
    venueId: string,
    userId: string, // Changed to string
    queueLength: string,
    doorPolicy: string,
    capacity: string,
    vibe: string[],
    vibeDetails?: string,
    _photo?: File
): Promise<void> {
    try {
        // Offline check
        if (!navigator.onLine) {
            throw new Error('You are offline. Please check your internet connection.');
        }

        // Duplicate check (5 minutes)
        const lastSubmissionKey = `last_report_${venueId}`;
        const lastSubmission = localStorage.getItem(lastSubmissionKey);
        if (lastSubmission) {
            const lastTime = parseInt(lastSubmission, 10);
            const now = Date.now();
            if (now - lastTime < 5 * 60 * 1000) {
                const remainingMinutes = Math.ceil((5 * 60 * 1000 - (now - lastTime)) / 60000);
                throw new Error(`Please wait ${remainingMinutes} minutes before reporting on this venue again.`);
            }
        }

        // TODO: Handle photo upload to Supabase Storage
        let photoUrl = undefined;

        const { error } = await supabase
            .from('reports')
            .insert([{
                venue_id: venueId,
                user_id: userId,
                queue_length: queueLength,
                door_policy: doorPolicy,
                capacity: capacity,
                vibe: vibe,
                vibe_details: vibeDetails,
                photo_url: photoUrl
            }]);

        if (error) throw error;

        // Store submission time
        localStorage.setItem(lastSubmissionKey, Date.now().toString());

    } catch (error) {
        console.error('Submit report error:', error);
        throw error;
    }
}

/**
 * Get recent reports for a venue
 */
export async function getReports(venueId: string, limit = 10): Promise<StatusReport[]> {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select(`
                *,
                users (username)
            `)
            .eq('venue_id', venueId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data.map((report: any) => ({
            id: report.id,
            username: report.users?.username || 'Anonymous',
            queueLength: report.queue_length,
            doorPolicy: report.door_policy,
            capacity: report.capacity,
            vibe: report.vibe || [],
            vibeDetails: report.vibe_details,
            photoUrl: report.photo_url,
            timestamp: report.created_at
        }));
    } catch (error) {
        console.error('Get reports error:', error);
        return [];
    }
}

/**
 * Get aggregated status for a venue
 */
export async function getAggregatedStatus(venueId: string): Promise<AggregatedStatus | null> {
    try {
        // Fetch last 5 reports from the last 2 hours
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

        const { data: reports, error } = await supabase
            .from('reports')
            .select('queue_length, door_policy, capacity, created_at')
            .eq('venue_id', venueId)
            .gte('created_at', twoHoursAgo)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        if (!reports || reports.length === 0) return null;

        // Simple aggregation: take the most recent report's values for now
        // Or mode/average could be implemented
        const latest = reports[0];

        return {
            queue: latest.queue_length,
            doorPolicy: latest.door_policy,
            capacity: latest.capacity,
            lastUpdate: latest.created_at,
            reportCount: reports.length
        };
    } catch (error) {
        console.error('Get status error:', error);
        return null;
    }
}
/**
 * Subscribe to real-time report updates for a venue
 */
export function subscribeToReports(venueId: string, onUpdate: (payload: any) => void) {
    const channel = supabase
        .channel(`public:reports:venue_id=eq.${venueId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'reports',
                filter: `venue_id=eq.${venueId}`
            },
            (payload) => {
                console.log('New report received:', payload);
                onUpdate(payload);
            }
        )
        .subscribe();

    return {
        unsubscribe: () => {
            supabase.removeChannel(channel);
        }
    };
}
