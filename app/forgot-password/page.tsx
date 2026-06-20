import React, { useState, useEffect, useRef } from "react";
import "../style/auth.css";
import "../style/theme.css";
import CustomCursor from "../cursor";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<"email" | "otp" | "newPassword">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [timer, setTimer] = useState(180); // 3 minutes
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        if (step === "otp" && timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        }
        if (timer === 0) setCanResend(true);
    }, [step, timer]);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep("otp");
        setTimer(180);
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
        setTimer(180);
        setCanResend(false);
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join("");
        if (otpCode.length === 6) {
            setStep("newPassword");
        }
    };

    const handlePasswordReset = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Password reset successful! Redirecting to login...");
    };

    return (
        <div className="auth-container">
            <CustomCursor />
            <div className="auth-card">
                <a href="/login" className="auth-back-link">← Back to login</a>
                <div className="auth-header">
                    <h1>Reset your password</h1>
                    <p>Enter your email and verify the OTP</p>
                </div>

                {step === "email" && (
                <form onSubmit={handleEmailSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
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

                {step === "newPassword" && (
                <form onSubmit={handlePasswordReset} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="new-password">New password</label>
                        <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" required />
                    </div>
                    <button type="submit" className="primary-btn primary-btn-lg" style={{ width: "100%" }}>Reset Password</button>
                </form>
                )}

                <div className="auth-footer">
                    <span>Remember your password? <a href="/login">Login</a></span>
                </div>
            </div>
        </div>
    );
}