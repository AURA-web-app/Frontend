"use client";

import React, { useState, useRef, useEffect } from "react";
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
    const [advModelsOpen, setAdvModelsOpen] = useState(false);
    const [flawOpen, setFlawOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState("Alpha");
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
                content: generateAIResponse(trimmed, selectedModel),
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

    const generateAIResponse = (userInput: string, model: string): string => {
        const lower = userInput.toLowerCase();
        let base = "";
        if (lower.includes("derivative")) {
            base = "The derivative of f(x) = x^n is f'(x) = n*x^(n-1). For example, if f(x) = x^2, then f'(x) = 2x.";
        } else if (lower.includes("calculus")) {
            base = "Calculus is the study of continuous change. The two main branches are differentiation and integration.";
        } else if (lower.includes("hello") || lower.includes("hi")) {
            base = "Hello! How can I assist with your studies today?";
        } else {
            base = "That's a great question! Could you provide a bit more detail so I can help you better?";
        }
        return `[${model}] ${base}`;
    };

    const closeAllPanels = () => {
        setAdvModelsOpen(false);
        setFlawOpen(false);
    };

    const selectModel = (model: string) => {
        setSelectedModel(model);
    };

    return (
        <div className="ai-chat-container">
            <div className={`side-panel left-panel ${advModelsOpen ? "open" : ""}`}>
                <button className="close-panel" onClick={() => setAdvModelsOpen(false)}>← Close</button>
                <h2>ADV MODELS</h2>
                <p>Advanced reasoning models with extended context.</p>
                <ul className="model-list">
                    <li
                        className={selectedModel === "Alpha" ? "active" : ""}
                        onClick={() => selectModel("Alpha")}
                    >
                        Alpha – 128k context
                    </li>
                    <li
                        className={selectedModel === "Beta" ? "active" : ""}
                        onClick={() => selectModel("Beta")}
                    >
                        Beta – 256k context
                    </li>
                    <li
                        className={selectedModel === "Gamma" ? "active" : ""}
                        onClick={() => selectModel("Gamma")}
                    >
                        Gamma – 512k context
                    </li>
                </ul>
            </div>

            <div className={`side-panel right-panel ${flawOpen ? "open" : ""}`}>
                <button className="close-panel" onClick={() => setFlawOpen(false)}>Close →</button>
                <h2>FLAW</h2>
                <p>Experimental research models. Expect errors.</p>
                <ul className="model-list">
                    <li
                        className={selectedModel === "Flaw 7k" ? "active" : ""}
                        onClick={() => selectModel("Flaw 7k")}
                    >
                        Flaw 7k – 7,000 params
                    </li>
                    <li
                        className={selectedModel === "Flaw 10k" ? "active" : ""}
                        onClick={() => selectModel("Flaw 10k")}
                    >
                        Flaw 10k – 10,000 params
                    </li>
                    <li
                        className={selectedModel === "Flaw 12k" ? "active" : ""}
                        onClick={() => selectModel("Flaw 12k")}
                    >
                        Flaw 12k – 12,000 params
                    </li>
                </ul>
            </div>

            {(advModelsOpen || flawOpen) && (
                <div className="panel-overlay" onClick={closeAllPanels} />
            )}

            <div className="ai-chat-header">
                <div className="header-top-row">
                    <h1>AI Study Assistant</h1>
                    <div className="header-actions">
                        <button className="panel-toggle-btn" onClick={() => setAdvModelsOpen(!advModelsOpen)}>
                            ADV MODELS
                        </button>
                        <button className="panel-toggle-btn" onClick={() => setFlawOpen(!flawOpen)}>
                            FLAW
                        </button>
                        <a href="/ai/pricing" className="pricing-btn">Pricing</a>
                    </div>
                </div>
                <p>Ask anything about your subjects, exams, or study plans</p>
                <div className="active-model-indicator">
                    Active model: <span>{selectedModel}</span>
                </div>
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