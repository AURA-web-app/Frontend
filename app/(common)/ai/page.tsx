"use client";

import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../../lib/supabase/createclient";
import { Message, AIModel } from "@/types/ai";
import "../../style/ai.css";
import "../../style/theme.css";

export default function AIChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "ai",
            content: "Hello! I'm your AURA study assistant. What topic can I help you with today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [selectedModel, setSelectedModel] = useState<AIModel>("flaw");
    const [remaining, setRemaining] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsAuthenticated(true);
                setAccessToken(session.access_token);
            } else {
                setIsAuthenticated(false);
                setAccessToken(null);
            }
            fetchUsage(session?.access_token);
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setIsAuthenticated(true);
                setAccessToken(session.access_token);
            } else {
                setIsAuthenticated(false);
                setAccessToken(null);
            }
            fetchUsage(session?.access_token);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUsage = async (token?: string) => {
        const headers: HeadersInit = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        try {
            const res = await fetch('/api/ai/usage', { headers });
            if (res.ok) {
                const data = await res.json();
                setRemaining(data.remaining);
            }
        } catch (e) {
        }
    };

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: trimmed,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);
        setError(null);

        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (accessToken) {
                headers.Authorization = `Bearer ${accessToken}`;
            }
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    model: selectedModel,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong.');
                setIsTyping(false);
                return;
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: data.response,
            };
            setMessages((prev) => [...prev, aiMsg]);
            if (data.remaining !== undefined) setRemaining(data.remaining);
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const modelOptions: { value: AIModel; label: string }[] = [
        { value: 'flaw', label: 'FLAW (unlimited, free)' },
    ];
    if (isAuthenticated) {
        modelOptions.push(
            { value: 'openrouter', label: 'OpenRouter (Gemini 2 Flash)' },
            { value: 'github', label: 'GitHub (GPT-4o-mini)' },
            { value: 'groq', label: 'Groq (Mixtral 8x7b)' }
        );
    }

    const canSend = input.trim().length > 0 && !isTyping;

    return (
        <div className="ai-chat-container">
            <div className="ai-chat-header">
                <div className="header-top-row">
                    <h1>AI Study Assistant</h1>
                    <div className="header-actions">
                        <select
                            className="model-selector"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value as AIModel)}
                        >
                            {modelOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <span className="remaining-badge">
                            {remaining !== null ? `${remaining} remaining` : '...'}
                        </span>
                        <a href="/ai/pricing" className="pricing-btn">Pricing</a>
                    </div>
                </div>
                <p>Ask anything about your subjects, exams, or study plans</p>
                {!isAuthenticated && (
                    <p className="guest-note">🔓 Guest mode – 2 messages per day (FLAW only). <a href="/login">Log in</a> for more.</p>
                )}
                {isAuthenticated && (
                    <p className="user-note">✅ Logged in – {remaining !== null ? remaining : '...'} advanced messages left today.</p>
                )}
            </div>

            <div className="ai-chat-box" ref={chatBoxRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`ai-message ${
                            msg.role === "user" ? "ai-message-user" : "ai-message-ai"
                        }`}
                    >
                        <p>{msg.content}</p>
                    </div>
                ))}
                {isTyping && (
                    <div className="ai-message ai-message-ai typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
                {error && <div className="error-message">{error}</div>}
            </div>

            <div className="ai-chat-input">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isTyping}
                />
                <button onClick={handleSend} disabled={!canSend}>
                    Send
                </button>
            </div>
        </div>
    );
}