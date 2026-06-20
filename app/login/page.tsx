"use client";

import React, { useState } from "react";
import "../style/auth.css";
import "../style/theme.css";
import "../cursor";
import CustomCursor from "../cursor";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <div className="auth-container">
            <CustomCursor />
            <div className="auth-card">
                <a href="/" className="auth-back-link">← Back to AURA</a>
                <div className="auth-header">
                    <h1>Welcome back</h1>
                    <p>Sign in to your AURA account</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="primary-btn primary-btn-lg" style={{ width: "100%" }}>
                        Login
                    </button>
                </form>
                <div className="auth-footer">
                    <a href="/forgot-password">Forgot password?</a><br></br>
                    <span>Don't have an account? <a href="/signup">Sign up</a></span>
                </div>
            </div>
        </div>
    );
}