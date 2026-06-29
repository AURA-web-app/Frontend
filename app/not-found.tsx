"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function NotFound() {
    const [homeHover, setHomeHover] = useState(false);
    const [supportHover, setSupportHover] = useState(false);

    const styles = {
        logoWrapper: {
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            border: "3px solid rgba(16, 185, 129, 0.4)",
            boxShadow: "0 0 30px rgba(16, 185, 129, 0.3), 0 0 0 8px rgba(16, 185, 129, 0.05)",
            overflow: "hidden",
            marginBottom: "2.5rem",
            animation: "float 4s ease-in-out infinite",
        },
        logo: {
            
        },
        title: {
            fontSize: "clamp(4rem, 10vw, 8rem)",
            fontWeight: 900,
            letterSpacing: "0.05em",
            marginBottom: "0.5rem",
            background: "linear-gradient(135deg, #10b981 0%, #f97316 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))",
        },
        subtitle: {
            fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            color: "#a0a0a0",
            marginBottom: "0.8rem",
            maxWidth: "500px",
        },
        description: {
            fontSize: "1rem",
            color: "#5e5e5e",
            marginBottom: "2.5rem",
            maxWidth: "400px",
        },
        primaryButton: (hover: boolean) => ({
            padding: "0.85rem 2rem",
            borderRadius: "999px",
            border: "none",
            fontWeight: 700,
            fontSize: "1rem",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            letterSpacing: "0.02em",
            background: hover ? "#34d399" : "#10b981",
            color: "#000",
            boxShadow: hover
                ? "0 0 35px rgba(16, 185, 129, 0.4), 0 8px 24px rgba(0,0,0,0.5)"
                : "0 0 20px rgba(16, 185, 129, 0.2)",
            transform: hover ? "translateY(-3px)" : "none",
        }),
        secondaryButton: (hover: boolean) => ({
            padding: "0.85rem 2rem",
            borderRadius: "999px",
            border: "1.5px solid rgba(255,255,255,0.1)",
            fontWeight: 700,
            fontSize: "1rem",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            letterSpacing: "0.02em",
            background: "transparent",
            color: hover ? "#fff" : "#a0a0a0",
            boxShadow: hover ? "0 0 25px rgba(255,255,255,0.08)" : "none",
            transform: hover ? "translateY(-2px)" : "none",
            backdropFilter: "blur(8px)",
        }),
    };

    return (
        <>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem", textAlign: "center", background: "#010101", color: "#fafafa", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden", backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "48px 48px"}}>
                <div style={{position: "absolute", width: "500px", height: "500px", borderRadius: "50%", filter: "blur(150px)", opacity: 0.06, background: "#8b5cf6", top: "-10%", left: "-10%", pointerEvents: "none"}}></div>
                <div style={{position: "absolute", width: "400px", height: "400px", borderRadius: "50%", filter: "blur(150px)", opacity: 0.05, background: "#10b981", bottom: "-10%", right: "-10%", pointerEvents: "none"}}></div>
                <div style={styles.logoWrapper}>
                    <img src="./logo.png" alt="AURA Logo" style={{width: "100%", height: "100%", objectFit: "cover"}} />
                </div>
                <h1 style={styles.title}>404</h1>
                <p style={styles.subtitle}>
                    Oops! The page you're looking for doesn't exist.
                </p>
                <p style={styles.description}>
                    It might have been moved or deleted. Let's get you back on track.
                </p>
                <div style={{display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center"}}>
                    <Link
                        href="/"
                        style={styles.primaryButton(homeHover)}
                        onMouseEnter={() => setHomeHover(true)}
                        onMouseLeave={() => setHomeHover(false)}
                    >
                        Go Back Home
                    </Link>
                    <Link
                        href="/support"
                        style={styles.secondaryButton(supportHover)}
                        onMouseEnter={() => setSupportHover(true)}
                        onMouseLeave={() => setSupportHover(false)}
                    >
                        Contact Support
                    </Link>
                </div>

                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                    }
                `}</style>
            </div>
        </>
    );
}
