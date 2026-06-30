import { supabase } from "./createclient";

export async function getDailyUsage(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    try {
        const { data, error } = await supabase
            .from('ai_usage')
            .select('messages_used')
            .eq('user_id', userId)
            .eq('date', today)
            .single();
        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching usage:', error);
            return 0;
        }
        return data?.messages_used || 0;
    } catch (e) {
        console.error('getDailyUsage error:', e);
        return 0;
    }
}

export async function incrementUsage(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    try {
        const { data, error } = await supabase
            .from('ai_usage')
            .upsert(
                { user_id: userId, date: today, messages_used: 1 },
                { onConflict: 'user_id,date', ignoreDuplicates: false }
            )
            .select('messages_used')
            .single();
        if (error) {
            console.error('Error incrementing usage:', error);
            return 1;
        }
        return data?.messages_used || 1;
    } catch (e) {
        console.error('incrementUsage error:', e);
        return 1;
    }
}

export async function getGuestDailyUsage(ip: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    try {
        const { data, error } = await supabase
            .from('guest_ai_usage')
            .select('messages_used')
            .eq('ip_address', ip)
            .eq('date', today)
            .single();
        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching guest usage:', error);
            return 0;
        }
        return data?.messages_used || 0;
    } catch (e) {
        console.error('getGuestDailyUsage error:', e);
        return 0;
    }
}

export async function incrementGuestUsage(ip: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    try {
        const { data, error } = await supabase
            .from('guest_ai_usage')
            .upsert(
                { ip_address: ip, date: today, messages_used: 1 },
                { onConflict: 'ip_address,date', ignoreDuplicates: false }
            )
            .select('messages_used')
            .single();
        if (error) {
            console.error('Error incrementing guest usage:', error);
            return 1;
        }
        return data?.messages_used || 1;
    } catch (e) {
        console.error('incrementGuestUsage error:', e);
        return 1;
    }
}