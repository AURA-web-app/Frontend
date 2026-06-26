"use client";

import React, { useState, useRef, useEffect } from "react";

interface OtpInputProps {
    length?: number;
    onComplete: (code: string) => void;
    disabled?: boolean;
    className?: string;
}

export default function OtpInput({ length = 8, onComplete, disabled = false, className = "" }: OtpInputProps) {
    const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
        const fullCode = newOtp.join("");
        if (fullCode.length === length) {
            onComplete(fullCode);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = "";
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const paste = e.clipboardData.getData("text").slice(0, length).replace(/\D/g, "");
        if (paste.length === 0) return;
        const newOtp = [...otp];
        for (let i = 0; i < paste.length && i < length; i++) {
            newOtp[i] = paste[i];
        }
        setOtp(newOtp);
        const nextIndex = Math.min(paste.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
        const fullCode = newOtp.join("");
        if (fullCode.length === length) {
            onComplete(fullCode);
        }
    };

    return (
        <div 
            className={`otp-input-group ${className}`} 
            onPaste={handlePaste}
            style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "0.7rem",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "2rem",
            }}
        >
            {otp.map((digit, idx) => (
                <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`otp-box ${digit ? "filled" : ""}`}
                    disabled={disabled}
                    inputMode="numeric"
                    pattern="[0-9]"
                    style={{
                        width: "56px",
                        height: "64px",
                        textAlign: "center",
                        fontSize: "1.6rem",
                        fontWeight: "700",
                        background: "#0a0a0a",
                        border: "1px solid rgba(255, 255, 255, 0.07)",
                        borderRadius: "18px",
                        color: "#fff",
                        transition: "border 0.3s, box-shadow 0.3s",
                        flexShrink: 0,
                    }}
                />
            ))}
        </div>
    );
}