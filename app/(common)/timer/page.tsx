"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../style/timer.css";
import "../../style/theme.css";

const TOTAL_DAY_SECONDS = 86400;
const CIRCLE_RADIUS_RATIO = 0.85;
const STROKE_WIDTH_RATIO = 0.03;
interface Session {
    start: number;
    end: number | null;
}
interface LeaderboardEntry {
    name: string;
    totalToday: number;
}
const getBrowserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const formatTimeInTimezone = (date: Date, timezone: string) => {
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: timezone,
    });
};
const formatDateInTimezone = (date: Date, timezone: string) => {
    return date.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: timezone,
    });
};

export default function Timer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSessionStart, setCurrentSessionStart] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [leaderboardOpen, setLeaderboardOpen] = useState(false);
    const [guestId, setGuestId] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [liveTime, setLiveTime] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);
    const [timezone, setTimezone] = useState<string>(getBrowserTimezone());
    const [showTimezoneModal, setShowTimezoneModal] = useState(false);
    const animFrameRef = useRef<number>(0);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);
    useEffect(() => {
        const storedTz = localStorage.getItem("aura-timezone");
        if (storedTz) {
            setTimezone(storedTz);
        } else {
            setTimezone(getBrowserTimezone());
            setShowTimezoneModal(true);
        }
        const storedSessions = localStorage.getItem("aura-study-sessions");
        if (storedSessions) {
            const parsed: Session[] = JSON.parse(storedSessions);
            const ongoing = parsed.find((s) => s.end === null);
            setSessions(parsed);
            if (ongoing) setCurrentSessionStart(ongoing.start);
        }
        const storedGuestId = localStorage.getItem("aura-guest-id");
        if (storedGuestId) {
            setGuestId(storedGuestId);
        } else {
            const counter = parseInt(localStorage.getItem("aura-guest-counter") || "0", 10) + 1;
            localStorage.setItem("aura-guest-counter", counter.toString());
            const newId = `Guest #${counter}`;
            localStorage.setItem("aura-guest-id", newId);
            setGuestId(newId);
        }
        const storedUsername = localStorage.getItem("aura-username");
        if (storedUsername) setUsername(storedUsername);
    }, []);

    useEffect(() => {
        localStorage.setItem("aura-study-sessions", JSON.stringify(sessions));
    }, [sessions]);
    useEffect(() => {
        const timer = setInterval(() => setLiveTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);
        const todayStart = todayMidnight.getTime();

        const userTotal = sessions.reduce((acc, s) => {
            if (s.start >= todayStart || (s.end && s.end >= todayStart)) {
                const start = Math.max(s.start, todayStart);
                const end = s.end ? Math.min(s.end, Date.now()) : Date.now();
                return acc + Math.max(0, (end - start) / 1000);
            }
            return acc;
        }, 0);

        const displayName = username || guestId;

        const hardcoded: LeaderboardEntry[] = [
            { name: "Alex", totalToday: 45900 },
            { name: "Jordan", totalToday: 34200 },
            { name: "Taylor", totalToday: 26100 },
            { name: "Morgan", totalToday: 21000 },
            { name: "Casey", totalToday: 15600 },
        ];

        const combined = [...hardcoded];
        if (userTotal > 0) {
            const existingIndex = combined.findIndex((e) => e.name === displayName);
            if (existingIndex >= 0) {
                combined[existingIndex].totalToday = userTotal;
            } else {
                combined.push({ name: displayName, totalToday: userTotal });
            }
        }

        combined.sort((a, b) => b.totalToday - a.totalToday);
        setLeaderboardData(combined.slice(0, 8));
    }, [sessions, username, guestId]);

    const animate = useCallback(() => {
        drawCanvas();
        if (currentSessionStart) {
            setElapsed(Math.floor((Date.now() - currentSessionStart) / 1000));
        }
        animFrameRef.current = requestAnimationFrame(animate);
    }, [currentSessionStart, sessions]);

    useEffect(() => {
        animFrameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [animate]);
    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = (Math.min(w, h) * CIRCLE_RADIUS_RATIO) / 2;
        const lineWidth = Math.min(w, h) * STROKE_WIDTH_RATIO;

        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(0, 0, 0, 0);
        const secondsSinceMidnight = (now.getTime() - midnight.getTime()) / 1000;
        const currentAngle = (secondsSinceMidnight / TOTAL_DAY_SECONDS) * 2 * Math.PI - Math.PI / 2;
        const idleGradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
        idleGradient.addColorStop(0, "#00d2ff");
        idleGradient.addColorStop(1, "#0ea5e9");
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, currentAngle, false);
        ctx.strokeStyle = idleGradient;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.stroke();
        const timestampToAngle = (ts: number) => {
            const d = new Date(ts);
            const secs = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000;
            return (secs / TOTAL_DAY_SECONDS) * 2 * Math.PI - Math.PI / 2;
        };

        const studyGradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
        studyGradient.addColorStop(0, "#ef4444");
        studyGradient.addColorStop(1, "#f97316");

        for (const s of sessions) {
            const startAngle = timestampToAngle(s.start);
            let endAngle = s.end ? timestampToAngle(s.end) : currentAngle;
            if (endAngle < startAngle) endAngle += 2 * Math.PI;
            if (startAngle > currentAngle) continue;
            const drawEnd = Math.min(endAngle, currentAngle);

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, drawEnd, false);
            ctx.strokeStyle = studyGradient;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = "butt";
            ctx.stroke();
        }
        const dotX = centerX + radius * Math.cos(currentAngle);
        const dotY = centerY + radius * Math.sin(currentAngle);
        ctx.beginPath();
        ctx.arc(dotX, dotY, lineWidth * 0.65, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "rgba(255,255,255,0.9)";
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
    };
    const toggleSession = () => {
        if (currentSessionStart === null) {
            const start = Date.now();
            setCurrentSessionStart(start);
            setSessions((prev) => [...prev, { start, end: null }]);
        } else {
            const end = Date.now();
            setSessions((prev) =>
                prev.map((s) =>
                    s.start === currentSessionStart && s.end === null ? { ...s, end } : s
                )
            );
            setCurrentSessionStart(null);
            setElapsed(0);
        }
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };
    const completedSessions = sessions
        .filter((s) => s.end !== null)
        .sort((a, b) => b.start - a.start)
        .slice(0, 5);

    const isRunning = currentSessionStart !== null;
    const touchStartX = useRef(0);
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(deltaX) > 60 && deltaX > 0) {
            setLeaderboardOpen(true);
        }
    };

    const handleTimezoneConfirm = (tz: string) => {
        setTimezone(tz);
        localStorage.setItem("aura-timezone", tz);
        setShowTimezoneModal(false);
    };

    const leaderboardContent = (
        <>
            <button
                className="close-leaderboard"
                onClick={() => setLeaderboardOpen(false)}
            >
                ← Close
            </button>
            <h2>🏆 Leaderboard</h2>
            <ul className="leaderboard-list">
                {leaderboardData.map((entry, idx) => (
                    <li key={idx}>
                        <span className="rank">
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                        </span>
                        <span className="name">{entry.name}</span>
                        <span className="time">{formatDuration(entry.totalToday)}</span>
                    </li>
                ))}
            </ul>
            <p className="leaderboard-note">Study more to climb the ranks!</p>
        </>
    );

    return (
        <div className="timer-wrapper">
            {showTimezoneModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h2>Select your timezone</h2>
                        <p>We'll use this to show your local time.</p>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="timezone-select"
                        >
                            {Intl.supportedValuesOf("timeZone").map((tz) => (
                                <option key={tz} value={tz}>
                                    {tz}
                                </option>
                            ))}
                        </select>
                        <button
                            className="primary-btn"
                            onClick={() => handleTimezoneConfirm(timezone)}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            )}
            {!isMobile && (
                <div className="leaderboard-sidebar">
                    {leaderboardContent}
                </div>
            )}
            {isMobile && (
                <>
                    <div className={`leaderboard-panel ${leaderboardOpen ? "open" : ""}`}>
                        {leaderboardContent}
                    </div>
                    {leaderboardOpen && (
                        <div
                            className="overlay"
                            onClick={() => setLeaderboardOpen(false)}
                        />
                    )}
                    <button
                        className="leaderboard-toggle"
                        onClick={() => setLeaderboardOpen(true)}
                    >
                        🏆
                    </button>
                </>
            )}
            <div
                className="timer-container"
                onTouchStart={isMobile ? handleTouchStart : undefined}
                onTouchEnd={isMobile ? handleTouchEnd : undefined}
            >
                <div className="circle-wrapper">
                    <canvas ref={canvasRef} className="timer-canvas" />

                    <div className="circle-center">
                        <span className="live-clock">
                            {formatTimeInTimezone(liveTime, timezone)}
                        </span>
                        <span className="live-date">
                            {formatDateInTimezone(liveTime, timezone)}
                        </span>
                        <div className="user-info">
                            <input
                                type="text"
                                className="username-input"
                                placeholder="Your name (optional)"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    localStorage.setItem("aura-username", e.target.value);
                                }}
                            />
                            <span className="guest-id">{username ? "" : guestId}</span>
                        </div>
                    </div>

                    <button
                        className={`session-btn ${isRunning ? "stop" : ""}`}
                        onClick={toggleSession}
                    >
                        {isRunning ? "Stop" : "Start"}
                    </button>
                </div>

                <div className="session-list-container">
                    <h3>Recent Sessions</h3>
                    {completedSessions.length === 0 && !isRunning && (
                        <p className="no-session-msg">No sessions recorded today.</p>
                    )}
                    {isRunning && (
                        <div className="live-session">
                            <span>Active: {formatDuration(elapsed)}</span>
                        </div>
                    )}
                    <ul className="session-list">
                        {completedSessions.map((s, i) => (
                            <li key={i}>
                                <span>{new Date(s.start).toLocaleTimeString()}</span>
                                <span>
                                    {s.end ? formatDuration((s.end - s.start) / 1000) : "ongoing"}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}