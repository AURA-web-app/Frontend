import { Message } from '../../types/ai';

const OPENROUTER_API_KEY = process.env.OPENROUTER;
const GITHUB_TOKEN = process.env.GITHUB;
const GROQ_API_KEY = process.env.GROQ;
const FLAW_API_URL = process.env.FLAW;

const OPENROUTER_MODEL = 'google/gemini-2.0-flash';
const GITHUB_MODEL = 'github/gpt-4o-mini';
const GROQ_MODEL = 'mixtral-8x7b-32768';

function getSmartMock(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('derivative') || lower.includes('differentiate')) {
        return "The derivative of f(x) = x^n is f'(x) = n·x^(n-1). For example, if f(x) = x^3, then f'(x) = 3x^2.";
    }
    if (lower.includes('integral') || lower.includes('integrate')) {
        return "The integral of x^n dx is (x^(n+1))/(n+1) + C, where C is the constant of integration.";
    }
    if (lower.includes('calculus')) {
        return "Calculus is the branch of mathematics that studies continuous change. It has two main branches: differential calculus (derivatives) and integral calculus (integrals).";
    }
    if (lower.includes('physics') || lower.includes('force') || lower.includes('motion')) {
        return "Newton's second law: F = ma (force equals mass times acceleration). This is a cornerstone of classical mechanics.";
    }
    if (lower.includes('chemistry') || lower.includes('molecule') || lower.includes('atom')) {
        return "Atoms are the basic building blocks of matter. They consist of protons, neutrons, and electrons. Chemical reactions involve the rearrangement of atoms.";
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        return "Hello! How can I assist with your studies today? I'm here to help with any subject.";
    }
    if (lower.includes('exam') || lower.includes('test') || lower.includes('quiz')) {
        return "Good luck with your exam! Remember to practise regularly, review your notes, and take breaks. You've got this!";
    }
    return "That's a great question. To give you the best answer, could you provide a bit more detail?";
}

function formatMessages(messages: Message[]) {
    return messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content,
    }));
}

export async function callOpenRouter(messages: Message[]): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        console.warn('OPENROUTER_API_KEY missing – using mock');
        return `[OpenRouter mock] ${getSmartMock(messages[messages.length-1]?.content || '')}`;
    }
    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                'X-Title': 'AURA Study Assistant',
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: formatMessages(messages),
                temperature: 0.7,
            }),
        });
        const responseText = await res.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}`);
        }
        if (!res.ok) {
            const errorMsg = data.error?.message || data.error || `HTTP ${res.status}`;
            console.error('OpenRouter API error:', res.status, errorMsg);
            return `[OpenRouter error ${res.status}: ${errorMsg}]`;
        }
        return data.choices[0].message.content;
    } catch (err) {
        console.error('OpenRouter fetch error:', err);
        return `[OpenRouter fetch error: ${err}]`;
    }
}

export async function callGitHub(messages: Message[]): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        console.warn('OPENROUTER_API_KEY missing – GitHub mock');
        return `[GitHub mock] ${getSmartMock(messages[messages.length-1]?.content || '')}`;
    }
    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                'X-Title': 'AURA Study Assistant',
            },
            body: JSON.stringify({
                model: GITHUB_MODEL,
                messages: formatMessages(messages),
                temperature: 0.7,
            }),
        });
        const responseText = await res.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}`);
        }
        if (!res.ok) {
            const errorMsg = data.error?.message || data.error || `HTTP ${res.status}`;
            console.error('GitHub via OpenRouter error:', res.status, errorMsg);
            return `[GitHub fallback] ${getSmartMock(messages[messages.length-1]?.content || '')}`;
        }
        return data.choices[0].message.content;
    } catch (err) {
        console.error('GitHub fetch error:', err);
        return `[GitHub fallback] ${getSmartMock(messages[messages.length-1]?.content || '')}`;
    }
}

export async function callGroq(messages: Message[]): Promise<string> {
    if (!GROQ_API_KEY) {
        console.warn('GROQ_API_KEY missing – using mock');
        return `[Groq mock] ${getSmartMock(messages[messages.length-1]?.content || '')}`;
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
                messages: formatMessages(messages),
                temperature: 0.7,
            }),
        });
        const responseText = await res.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}`);
        }
        if (!res.ok) {
            const errorMsg = data.error?.message || data.error || `HTTP ${res.status}`;
            console.error('Groq API error:', res.status, errorMsg);
            return `[Groq fallback] ${getSmartMock(messages[messages.length-1]?.content || '')}`;
        }
        return data.choices[0].message.content;
    } catch (err) {
        console.error('Groq fetch error:', err);
        return `[Groq fallback] ${getSmartMock(messages[messages.length-1]?.content || '')}`;
    }
}

export async function callFlaw(messages: Message[]): Promise<string> {
    if (!FLAW_API_URL) {
        console.warn('FLAW_API_URL missing – using mock');
        return `[FLAW mock] ${getSmartMock(messages[messages.length-1]?.content || '')}`;
    }
    try {
        const lastMsg = messages[messages.length - 1]?.content || '';
        const res = await fetch(FLAW_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: lastMsg }),
        });
        const responseText = await res.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}`);
        }
        if (!res.ok) {
            const errorMsg = data.error?.message || data.error || `HTTP ${res.status}`;
            console.error('FLAW API error:', res.status, errorMsg);
            return `[FLAW fallback] ${getSmartMock(lastMsg)}`;
        }
        return data.response || data.text || data.generated_text || 'No response from FLAW.';
    } catch (err) {
        console.error('FLAW fetch error:', err);
        return `[FLAW fallback] ${getSmartMock(messages[messages.length-1]?.content || '')}`;
    }
}