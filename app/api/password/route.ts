import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

function getVerificationSecret() {
    return process.env.EMAIL_VERIFICATION_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "fallback-verification-secret";
}

function signEmail(email: string) {
    return crypto
        .createHmac("sha256", getVerificationSecret())
        .update(email)
        .digest("base64url");
}

function parseVerifiedEmailCookie(cookieValue: string | undefined): string | null {
    if (!cookieValue) return null;
    const parts = cookieValue.split('::');
    if (parts.length !== 2) return null;
    const [email, signature] = parts;
    const expected = signEmail(email);
    if (signature !== expected) return null;
    return email;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and new password are required.' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long.' },
                { status: 400 }
            );
        }

        const verifiedCookie = request.cookies.get('verified_email')?.value;
        const verifiedEmail = parseVerifiedEmailCookie(verifiedCookie);

        if (!verifiedEmail || verifiedEmail !== email) {
            return NextResponse.json(
                { error: 'Email not verified. Please verify your OTP first.' },
                { status: 401 }
            );
        }

        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) {
            console.error('Error listing users:', listError);
            return NextResponse.json(
                { error: 'Failed to find user. Please try again later.' },
                { status: 500 }
            );
        }

        const user = listData.users?.find((u: any) => u.email === email);
        if (!user) {
            return NextResponse.json(
                { error: 'No user found with this email address.' },
                { status: 404 }
            );
        }

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password }
        );

        if (updateError) {
            console.error('Update error:', updateError);
            return NextResponse.json(
                { error: updateError.message || 'Failed to reset password.' },
                { status: 400 }
            );
        }

        const response = NextResponse.json({ success: true, message: 'Password updated successfully.' });
        response.cookies.delete('verified_email');

        return response;
    } catch (error) {
        console.error('Reset password API error:', error);
        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        );
    }
}