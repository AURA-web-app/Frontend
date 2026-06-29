"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/createclient";
import "../style/auth.css";
import "../style/theme.css";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (signInError) throw new Error(signInError.message);
            router.push("/admin");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <a href="/" className="auth-back-link">← Back to AURA</a>
                <div className="auth-header">
                    <h1>Admin Access</h1>
                    <p>Hey Admin, keep the app in control!</p>
                </div>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@aura.com"
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
                    <button type="submit" className="primary-btn primary-btn-lg" disabled={loading} style={{ width: "100%" }}>
                        {loading ? "Logging in..." : "Login as Admin"}
                    </button>
                </form>
                <div className="auth-footer">
                    <a href="/forgot-password">Forgot password?</a><br />
                    <span>Don't have an account? <a href="/signup">Sign up</a></span>
                </div>
            </div>
        </div>
    );
}