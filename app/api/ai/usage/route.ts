import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase/createclient';
import { getDailyUsage } from '@/lib/supabase/usage';

const DAILY_LIMIT = 5;

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const used = await getDailyUsage(user.id);
        const remaining = Math.max(0, DAILY_LIMIT - used);

        return NextResponse.json({ used, remaining, limit: DAILY_LIMIT });
    } catch (error) {
        console.error('Usage API error:', error);
        return NextResponse.json({ error: 'Failed to fetch usage.' }, { status: 500 });
    }
}