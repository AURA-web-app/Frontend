"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/createclient";
import OtpInput from "../../components/otp";
import "../style/auth.css";
import "../style/theme.css";

export default function SignupPage() {
    const [step, setStep] = useState<"form" | "otp" | "done">("form");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [timer, setTimer] = useState(90);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [otpCode, setOtpCode] = useState("");
    const router = useRouter();
    const isPasswordValid = (pwd: string) => pwd.length >= 8;

    useEffect(() => {
        if (step === "otp" && timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        }
        if (timer === 0) {
            setCanResend(true);
            setWarning("You can now request for a new OTP.");
        }
    }, [step, timer]);

    const checkEmailExists = async (email: string): Promise<boolean> => {
        try {
            const res = await fetch("/api/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Check failed.");
            return data.exists === true;
        } catch (err) {
            console.error("Check email error:", err);
            throw new Error("Could not verify email. Please try again.");
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setWarning(null);

        if (!isPasswordValid(password)) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);
        try {
            const exists = await checkEmailExists(email);
            if (exists) {
                setError(
                    "Account Exists with this email" + ' '
                    + <a href="/login" style={{ color: '#10b981', fontWeight: 'bold' }}>Login instead</a>
                );
                setLoading(false);
                return;
            }

            const res = await fetch("/api/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "send", email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send OTP.");
            setStep("otp");
            setTimer(90);
            setCanResend(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => handleSendOtp({ preventDefault: () => {} } as React.FormEvent);

    const verifyOtp = async (code: string) => {
        setOtpCode(code);
        setLoading(true);
        setError(null);
        setWarning(null);

        try {
            const res = await fetch("/api/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "verify", email, token: code }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed.");

            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: name } },
            });
            if (signUpError) throw new Error(signUpError.message);

            setStep("done");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleManualVerify = () => {
        if (otpCode.length === 8) {
            verifyOtp(otpCode);
        } else {
            setError("Please enter all 8 digits.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <a href="/" className="auth-back-link">← Back to AURA</a>
                <div className="auth-header">
                    <h1>Create your account</h1>
                    <p>Start your learning journey today</p>
                </div>

                {error && <div className="auth-error">{error}</div>}
                {warning && (
                    <div className="warning-box">
                        {warning}
                        <button type="button" className="ghost-btn" onClick={handleResend} disabled={loading} style={{ marginLeft: "0.5rem" }}>
                            Resend
                        </button>
                    </div>
                )}

                <form onSubmit={handleSendOtp} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                            disabled={step === "otp" || step === "done"}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                            disabled={step === "otp" || step === "done"}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            required
                            disabled={step === "otp" || step === "done"}
                        />
                    </div>

                    {step === "otp" && (
                        <div className="otp-section">
                            <p className="otp-instruction">Enter the 8‑digit code sent to {email}</p>
                            <OtpInput length={8} onComplete={verifyOtp} disabled={loading} />
                            <div className="otp-actions">
                                <button
                                    type="button"
                                    className="primary-btn verify-btn"
                                    onClick={handleManualVerify}
                                    disabled={loading || otpCode.length < 8}
                                >
                                    {loading ? "Verifying..." : "Verify OTP"}
                                </button>
                            </div>
                            <div className="otp-resend">
                                {!canResend ? (
                                    <span>Resend in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</span>
                                ) : (
                                    <button type="button" className="ghost-btn" onClick={handleResend} disabled={loading}>
                                        Resend OTP
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {step === "form" && (
                        <button type="submit" className="primary-btn primary-btn-lg" disabled={loading} style={{ width: "100%" }}>
                            {loading ? "Checking..." : "Send OTP"}
                        </button>
                    )}
                </form>

                {step === "done" && (
                    <div className="auth-success">
                        <p>✅ Account created successfully!</p>
                        <a href="/login" className="primary-btn" style={{ display: "inline-block", marginTop: "1rem" }}>Go to Login</a>
                    </div>
                )}

                {step !== "done" && (
                    <div className="auth-footer">
                        <span>Already have an account? <a href="/login">Login</a></span>
                    </div>
                )}
            </div>
        </div>
    );
}