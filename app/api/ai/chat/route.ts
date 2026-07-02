import { NextRequest, NextResponse } from 'next/server';
import { supabase } from "../../../../lib/supabase/createclient";
import {
    getDailyUsage,
    incrementUsage,
    getGuestDailyUsage,
    incrementGuestUsage
} from '../../../../lib/supabase/usage';
import { callOpenRouter, callGitHub, callGroq, callFlaw } from '../../../../lib/ai/model';
import { AIModel, Message } from '../../../../types/ai';

const DAILY_LIMIT_USER = 5;
const DAILY_LIMIT_GUEST = 2;
const MODELS = ['openrouter', 'github', 'groq', 'flaw'] as const;

function getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const cfConnecting = req.headers.get('cf-connecting-ip');
    const realIp = req.headers.get('x-real-ip');
    return forwarded?.split(',')[0] || cfConnecting || realIp || '0.0.0.0';
}

console.log('🔑 OPENROUTER:', process.env.OPENROUTER ? '✅' : '❌');
console.log('🔑 GITHUB:', process.env.GITHUB ? '✅' : '❌');
console.log('🔑 GROQ:', process.env.GROQ ? '✅' : '❌');
console.log('🔑 FLAW:', process.env.FLAW ? '✅' : '❌');

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, model } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Messages are required.' }, { status: 400 });
        }

        const selectedModel = model && MODELS.includes(model) ? model : 'flaw';
        const isAdvanced = selectedModel !== 'flaw';
        let userId: string | null = null;
        let isAuthenticated = false;
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (!error && user) {
                userId = user.id;
                isAuthenticated = true;
            }
        }
        let remaining = null;
        const ip = getClientIP(req);

        if (!isAuthenticated) {
            const used = await getGuestDailyUsage(ip);
            if (used >= DAILY_LIMIT_GUEST) {
                return NextResponse.json(
                    { error: `You've used your daily limit of ${DAILY_LIMIT_GUEST} messages. Create a free account for more.` },
                    { status: 429 }
                );
            }
            if (selectedModel !== 'flaw') {
                return NextResponse.json(
                    { error: 'As a guest, you can only use FLAW. Log in to access advanced models.' },
                    { status: 403 }
                );
            }
            try {
                await incrementGuestUsage(ip);
                remaining = DAILY_LIMIT_GUEST - (used + 1);
            } catch (e) {
                console.error('Failed to increment guest usage:', e);
                remaining = DAILY_LIMIT_GUEST - used - 1;
            }
        } else {
            if (isAdvanced) {
                const used = await getDailyUsage(userId!);
                if (used >= DAILY_LIMIT_USER) {
                    return NextResponse.json(
                        { error: `Daily limit of ${DAILY_LIMIT_USER} advanced messages reached. Switch to FLAW for unlimited free responses.` },
                        { status: 429 }
                    );
                }
                try {
                    const newUsed = await incrementUsage(userId!);
                    remaining = DAILY_LIMIT_USER - newUsed;
                } catch (e) {
                    console.error('Failed to increment usage:', e);
                    remaining = DAILY_LIMIT_USER - used - 1;
                }
            }
        }

        let response: string;
        try {
            switch (selectedModel) {
                case 'openrouter': response = await callOpenRouter(messages); break;
                case 'github':     response = await callGitHub(messages); break;
                case 'groq':       response = await callGroq(messages); break;
                case 'flaw':
                default:           response = await callFlaw(messages); break;
            }
        } catch (err: any) {
            console.error('Model error:', err);
            response = `[${selectedModel}] I'm having trouble connecting. Please try again later.`;
        }

        return NextResponse.json({
            response,
            model: selectedModel,
            remaining: remaining !== null ? remaining : undefined,
            isAuthenticated,
        });
    } catch (error: any) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: error.message || 'An internal error occurred.' },
            { status: 500 }
        );
    }
}