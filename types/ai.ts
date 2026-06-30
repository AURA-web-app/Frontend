export interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
}

export type AIModel = 'openrouter' | 'github' | 'groq' | 'flaw';