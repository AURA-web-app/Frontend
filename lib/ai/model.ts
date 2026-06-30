import { Message } from "@/types/ai";

const OPENROUTER_API_KEY = process.env.OPENROUTER;
const GITHUB_TOKEN = process.env.GITHUB;
const GROQ_API_KEY = process.env.GROQ;
const FLAW_API_URL = process.env.FLAW;

const OPENROUTER_MODEL = 'google/gemini-2.0-flash';
const GITHUB_MODEL = 'github/gpt-4o-mini';
const GROQ_MODEL = 'mixtral-8x7b-32768';

function getMockResponse(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('derivative')) return "The derivative of x^n is n*x^(n-1).";
    if (lower.includes('calculus')) return "Calculus is the study of continuous change.";
    if (lower.includes('hello')) return "Hello! How can I help you?";
    return "That's an interesting question. Could you elaborate?";
}

export async function callOpenRouter(messages: Message[]): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        console.warn('OPENROUTER_API_KEY missing – using mock response');
        return `[OpenRouter mock] ${getMockResponse(messages[messages.length-1]?.content || '')}`;
    }
    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
            }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.choices[0].message.content;
    } catch (err) {
        console.error('OpenRouter error:', err);
        return `[OpenRouter fallback] ${getMockResponse(messages[messages.length-1]?.content || '')}`;
    }
}

export async function callGitHub(messages: Message[]): Promise<string> {
    if (!GITHUB_TOKEN) {
        console.warn('GITHUB_TOKEN missing – using mock response');
        return `[GitHub mock] ${getMockResponse(messages[messages.length-1]?.content || '')}`;
    }
    try {
        const res = await fetch('https://models.github.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
            },
            body: JSON.stringify({
                model: GITHUB_MODEL,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
            }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.choices[0].message.content;
    } catch (err) {
        console.error('GitHub error:', err);
        return `[GitHub fallback] ${getMockResponse(messages[messages.length-1]?.content || '')}`;
    }
}

export async function callGroq(messages: Message[]): Promise<string> {
    if (!GROQ_API_KEY) {
        console.warn('GROQ_API_KEY missing – using mock response');
        return `[Groq mock] ${getMockResponse(messages[messages.length-1]?.content || '')}`;
    }
    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
            }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.choices[0].message.content;
    } catch (err) {
        console.error('Groq error:', err);
        return `[Groq fallback] ${getMockResponse(messages[messages.length-1]?.content || '')}`;
    }
}

export async function callFlaw(messages: Message[]): Promise<string> {
    if (!FLAW_API_URL) {
        console.warn('FLAW_API_URL missing – using mock response');
        return `[FLAW mock] ${getMockResponse(messages[messages.length-1]?.content || '')}`;
    }
    try {
        const lastMsg = messages[messages.length - 1]?.content || '';
        const res = await fetch(FLAW_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: lastMsg }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.response || data.text || data.generated_text || 'No response from FLAW.';
    } catch (err) {
        console.error('FLAW error:', err);
        return `[FLAW fallback] ${getMockResponse(messages[messages.length-1]?.content || '')}`;
    }
}