"use client";

import React, { useState, useRef, useEffect } from "react";
import CustomCursor from "@/app/cursor";
import "../../style/ai.css";
import "../../style/theme.css";

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
}

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
    const chatBoxRef = useRef<HTMLDivElement>(null);
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
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: generateAIResponse(trimmed),
            };
            setMessages((prev) => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1200);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const generateAIResponse = (userInput: string): string => {
        const lower = userInput.toLowerCase();
        if (lower.includes("derivative")) {
            return "The derivative of f(x) = x^n is f'(x) = n*x^(n-1). For example, if f(x) = x^2, then f'(x) = 2x.";
        }
        if (lower.includes("calculus")) {
            return "Calculus is the study of continuous change. The two main branches are differentiation and integration.";
        }
        if (lower.includes("hello") || lower.includes("hi")) {
            return "Hello! How can I assist with your studies today?";
        }
        return "That's a great question! Could you provide a bit more detail so I can help you better?";
    };

    return (
        <div className="ai-chat-container">
            <CustomCursor />
            <div className="ai-chat-header">
                <h1>AI Study Assistant</h1>
                <p>Ask anything about your subjects, exams, or study plans</p>
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
            </div>

            <div className="ai-chat-input">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={handleSend} disabled={!input.trim()}>
                    Send
                </button>
            </div>
        </div>
    );
}