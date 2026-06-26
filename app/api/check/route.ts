import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Check if env vars are present
        if (!supabaseUrl || !supabaseServiceRoleKey) {
            console.error('Missing env vars:', { supabaseUrl: !!supabaseUrl, supabaseServiceRoleKey: !!supabaseServiceRoleKey });
            return NextResponse.json(
                { error: 'Server configuration error. Missing credentials.' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { email } = body;
        if (!email) {
            return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
        }

        // Create admin client inside the function to avoid issues at module level
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) {
            console.error('Supabase listUsers error:', error);
            return NextResponse.json(
                { error: `Supabase error: ${error.message}` },
                { status: 500 }
            );
        }

        const users = data?.users || [];
        const exists = users.some((user: any) => user.email?.toLowerCase() === email.toLowerCase());

        return NextResponse.json({ exists });
    } catch (error) {
        console.error('Check email API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error.' },
            { status: 500 }
        );
    }
}