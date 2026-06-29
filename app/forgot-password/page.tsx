"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OtpInput from "../../components/otp";
import "../style/auth.css";
import "../style/theme.css";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<"email" | "otp" | "newPassword">("email");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [timer, setTimer] = useState(180);
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
            setWarning("You can now request a new OTP.");
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

    const handleSendOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        setError(null);
        setWarning(null);

        try {
            const exists = await checkEmailExists(email);
            if (!exists) {
                setError(
                    "No account found with this email." + ' '
                    + <a href="/signup" style={{ color: '#10b981', fontWeight: 'bold' }}>Sign up instead</a>
                );
                setLoading(false);
                return;
            }

            const res = await fetch("/api/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "send", email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send OTP.");
            setStep("otp");
            setTimer(180);
            setCanResend(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => handleSendOtp();

    const verifyOtp = async (code: string) => {
        setOtpCode(code);
        setLoading(true);
        setError(null);
        setWarning(null);

        try {
            const res = await fetch("/api/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "verify", email, token: code }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed.");
            setStep("newPassword");
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

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPasswordValid(newPassword)) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Password reset failed.");
            alert("Password reset successful! Redirecting to login...");
            router.push("/login");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <a href="/login" className="auth-back-link">← Back to login</a>
                <div className="auth-header">
                    <h1>Reset your password</h1>
                    <p>Enter your email and verify the OTP</p>
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

                {step === "email" && (
                    <form onSubmit={handleSendOtp} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email address</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
                        </div>
                        <button type="submit" className="primary-btn primary-btn-lg" disabled={loading} style={{ width: "100%" }}>
                            {loading ? "Checking..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {step === "otp" && (
                    <div className="auth-form">
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

                {step === "newPassword" && (
                    <form onSubmit={handlePasswordReset} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="new-password">New password</label>
                            <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirm-password">Confirm password</label>
                            <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re‑type your password" required />
                        </div>
                        <button type="submit" className="primary-btn primary-btn-lg" disabled={loading} style={{ width: "100%" }}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <span>Remember your password? <a href="/login">Login</a></span>
                </div>
            </div>
        </div>
    );
}