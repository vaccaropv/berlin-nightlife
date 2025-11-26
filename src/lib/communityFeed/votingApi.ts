import { supabase } from '../supabase';
import type { ReportVote, ReportFlag, VoteState } from './types';

/**
 * Vote on a report (helpful or unhelpful)
 */
export async function voteReport(
    reportId: string,
    userId: string,
    voteType: 'helpful' | 'unhelpful'
): Promise<ReportVote | null> {
    try {
        // Check if user already voted
        const { data: existingVote } = await supabase
            .from('report_votes')
            .select('*')
            .eq('report_id', reportId)
            .eq('user_id', userId)
            .single();

        if (existingVote) {
            // Update existing vote
            const { data, error } = await supabase
                .from('report_votes')
                .update({ vote_type: voteType })
                .eq('id', existingVote.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Insert new vote
            const { data, error } = await supabase
                .from('report_votes')
                .insert({
                    report_id: reportId,
                    user_id: userId,
                    vote_type: voteType
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    } catch (error) {
        console.error('Error voting on report:', error);
        throw error;
    }
}

/**
 * Remove vote from a report
 */
export async function removeVote(
    reportId: string,
    userId: string
): Promise<void> {
    try {
        const { error } = await supabase
            .from('report_votes')
            .delete()
            .eq('report_id', reportId)
            .eq('user_id', userId);

        if (error) throw error;
    } catch (error) {
        console.error('Error removing vote:', error);
        throw error;
    }
}

/**
 * Get user's votes for reports
 */
export async function getUserVotes(userId: string): Promise<VoteState[]> {
    try {
        const { data, error } = await supabase
            .from('report_votes')
            .select('report_id, vote_type')
            .eq('user_id', userId);

        if (error) throw error;

        return (data || []).map(vote => ({
            reportId: vote.report_id,
            voteType: vote.vote_type as 'helpful' | 'unhelpful'
        }));
    } catch (error) {
        console.error('Error fetching user votes:', error);
        return [];
    }
}

/**
 * Flag a report for moderation
 */
export async function flagReport(
    reportId: string,
    userId: string,
    reason: 'spam' | 'inappropriate' | 'inaccurate' | 'other',
    details?: string
): Promise<ReportFlag | null> {
    try {
        const { data, error } = await supabase
            .from('report_flags')
            .insert({
                report_id: reportId,
                user_id: userId,
                reason,
                details
            })
            .select()
            .single();

        if (error) {
            // Check if user already flagged this report
            if (error.code === '23505') {
                throw new Error('You have already flagged this report');
            }
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error flagging report:', error);
        throw error;
    }
}

/**
 * Check if user has flagged a report
 */
export async function hasUserFlagged(
    reportId: string,
    userId: string
): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('report_flags')
            .select('id')
            .eq('report_id', reportId)
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    } catch (error) {
        console.error('Error checking flag status:', error);
        return false;
    }
}
