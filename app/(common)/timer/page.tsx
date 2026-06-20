"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../style/timer.css";
import CustomCursor from "../../cursor";

const SESSION_GOAL = 1500; // 25 minutes in seconds
const CIRCUMFERENCE = 2 * Math.PI * 70;

export default function Timer() {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState<{ id: number; duration: number }[]>([]);
    const [leaderboardOpen, setLeaderboardOpen] = useState(false);
    const [guestName, setGuestName] = useState("");
    const [totalToday, setTotalToday] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const touchStartX = useRef(0);
    const touchStartY = useRef(0);

    // Load guest & today's total
    useEffect(() => {
        const storedName = localStorage.getItem("aura-guest-name");
        if (storedName) {
            setGuestName(storedName);
        } else {
            const randomId = Math.floor(1000 + Math.random() * 9000);
            const name = `Guest${randomId}`;
            localStorage.setItem("aura-guest-name", name);
            setGuestName(name);
        }

        const todayKey = new Date().toISOString().split("T")[0];
        const storedToday = localStorage.getItem(`aura-study-${todayKey}`);
        if (storedToday) setTotalToday(parseInt(storedToday, 10));
    }, []);

    useEffect(() => {
        const todayKey = new Date().toISOString().split("T")[0];
        localStorage.setItem(`aura-study-${todayKey}`, totalToday.toString());
    }, [totalToday]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const tick = useCallback(() => {
        setTime((prev) => prev + 1);
    }, []);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(tick, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, tick]);

    const startTimer = () => setIsRunning(true);
    const stopTimer = () => {
        setIsRunning(false);
        if (time > 0) {
            const newLap = { id: laps.length + 1, duration: time };
            setLaps((prev) => [...prev, newLap]);
            setTotalToday((prev) => prev + time);
            setTime(0);
        }
    };
    const resetTimer = () => {
        setIsRunning(false);
        setTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    // Swipe handlers (open leaderboard on right swipe)
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        const deltaY = e.changedTouches[0].clientY - touchStartY.current;
        if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 60) {
            setLeaderboardOpen(true);
        }
    };

    const sessionProgress = Math.min(time / SESSION_GOAL, 1);
    const dashOffset = CIRCUMFERENCE * (1 - sessionProgress);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const formatDaily = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hrs}h ${mins}m`;
    };

    return (
        <>
            <CustomCursor />
            <div className={`leaderboard-panel ${leaderboardOpen ? "open" : ""}`}>
                <button className="close-leaderboard" onClick={() => setLeaderboardOpen(false)}>
                    ← Close
                </button>
                <h2>🏆 Leaderboard</h2>
                <ul className="leaderboard-list">
                    <li>🥇 Alex – 12h 45m</li>
                    <li>🥈 Jordan – 9h 30m</li>
                    <li>🥉 Taylor – 7h 15m</li>
                    <li>4. Morgan – 5h 50m</li>
                    <li>5. Casey – 4h 20m</li>
                </ul>
                <p className="leaderboard-note">Study more to climb the ranks!</p>
            </div>

            {leaderboardOpen && (
                <div className="overlay" onClick={() => setLeaderboardOpen(false)} />
            )}

            <div
                className="timer-container"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className="timer-card">
                    <div className="guest-badge">
                        <span className="guest-icon">👤</span>
                        <span>{guestName}</span>
                    </div>

                    <button
                        className="leaderboard-toggle"
                        onClick={() => setLeaderboardOpen(true)}
                    >
                        🏆 Leaderboard
                    </button>

                    <div className="timer-circle-wrapper">
                        <svg className="timer-ring" viewBox="0 0 160 160">
                            {/* Background track */}
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="none"
                                stroke="#2d2d2d"
                                strokeWidth="12"
                            />
                            {/* Progress arc */}
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="none"
                                stroke={
                                    sessionProgress >= 1 ? "#f97316" : "#10b981"
                                }
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={dashOffset}
                                transform="rotate(-90 80 80)"
                                className="progress-ring"
                            />
                        </svg>
                        <div className="timer-text">
                            <span className="current-time">{formatTime(time)}</span>
                            <span className="goal-time">/ {formatTime(SESSION_GOAL)}</span>
                        </div>
                    </div>

                    <div className="timer-controls">
                        {!isRunning ? (
                            <button onClick={startTimer} className="btn btn-start">
                                Start
                            </button>
                        ) : (
                            <button onClick={stopTimer} className="btn btn-stop">
                                Stop
                            </button>
                        )}
                        <button onClick={resetTimer} className="btn btn-reset">
                            Reset
                        </button>
                    </div>

                    {/* Daily total */}
                    <div className="daily-summary">
                        Today: {formatDaily(totalToday)} studied
                    </div>

                    {laps.length > 0 && (
                        <div className="laps-section">
                            <h3>Sessions</h3>
                            <ul className="laps-list">
                                {laps.map((lap) => (
                                    <li key={lap.id} className="lap-item">
                                        <span>Session {lap.id}</span>
                                        <span>{formatTime(lap.duration)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}