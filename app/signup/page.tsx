"use client";

import React, { useState, useEffect, useRef } from "react";
import "../style/auth.css";
import "../style/theme.css";
import CustomCursor from "../cursor";

export default function SignupPage() {
    const [step, setStep] = useState<"form" | "otp" | "done">("form");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(90);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        if (step === "otp" && timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        }
        if (timer === 0) setCanResend(true);
    }, [step, timer]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep("otp");
        setTimer(90);
        setCanResend(false);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleResend = () => {
        setTimer(90);
        setCanResend(false);
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join("");
        if (otpCode.length === 6) {
            setStep("done");
        }
    };

    return (
        <div className="auth-container">
            <CustomCursor />
            <div className="auth-card">
                <a href="/" className="auth-back-link">← Back to AURA</a>
                <div className="auth-header">
                    <h1>Create your account</h1>
                    <p>Start your learning journey today</p>
                </div>

                {step === "form" && (
                <form onSubmit={handleFormSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full name</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required />
                    </div>
                    <button type="submit" className="primary-btn primary-btn-lg" style={{ width: "100%" }}>Send OTP</button>
                </form>
                )}

                {step === "otp" && (
                <form onSubmit={handleOtpSubmit} className="auth-form">
                    <p className="otp-instruction">Enter the 6‑digit code sent to {email}</p>
                    <div className="otp-input-group">
                    {otp.map((digit, idx) => (
                        <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="otp-box"
                        />
                    ))}
                    </div>
                        <button type="submit" className="primary-btn primary-btn-lg" style={{ width: "100%" }}>Verify OTP</button>
                    <div className="otp-resend">
                    {timer > 0 ? (<span>Resend in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>) : (
                        <button type="button" className="ghost-btn" onClick={handleResend}>Resend OTP</button>
                    )}
                    </div>
                </form>
                )}

                {step === "done" && (
                <div className="auth-success">
                    <p>✅ Account created successfully!</p>
                    <a href="/login" className="primary-btn" style={{ display: "inline-block", marginTop: "1rem" }}>Go to Login</a>
                </div>
                )}

                {step !== "done" && (
                <div className="auth-footer">
                    <span>Already have an account? <a href="/login">Sign in</a></span>
                </div>
                )}
            </div>
        </div>
    );
}