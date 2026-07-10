"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../style/demo.module.css";

export default function DemoPage() {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const steps = [
        {
            title: "AI Tutor",
            description: "Get personalised explanations, doubt solving, and adaptive learning paths.",
            icon: "🧠",
            color: "#10b981",
        },
        {
            title: "Focus Mode",
            description: "Distraction-free study sessions with deep productivity analytics.",
            icon: "⚡",
            color: "#f97316",
        },
        {
            title: "Exam Engine",
            description: "Practice tests, revision plans, and real-time performance insights.",
            icon: "📝",
            color: "#8b5cf6",
        },
        {
            title: "SMS Learning",
            description: "Access education without internet — simple SMS-based delivery.",
            icon: "📱",
            color: "#3b82f6",
        },
        {
            title: "Analytics",
            description: "Track progress, identify weaknesses, and celebrate growth.",
            icon: "📊",
            color: "#ec4899",
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [steps.length]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className={styles.demo}>
            <div className={styles.bgGrid} />
            <div className={styles.bgOrb} />
            <div className={styles.container}>
                <section className={styles.hero}>
                    <h1 className={styles.title}>
                        See AURA in Action
                    </h1>
                    <p className={styles.subtitle}>
                        Watch how AURA transforms learning with AI-powered tools.
                    </p>
                    <div className={styles.videoWrapper}>
                        <div className={styles.videoPlaceholder}>
                            <div className={styles.playIcon}>
                                <svg viewBox="0 0 24 24" width="64" height="64" fill="white">
                                    <polygon points="5,3 19,12 5,21" />
                                </svg>
                            </div>
                            <p className={styles.videoLabel}>Demo Video</p>
                        </div>
                    </div>
                </section>
                <section className={styles.walkthrough}>
                    <h2 className={styles.sectionTitle}>How It Works</h2>
                    <div className={styles.stepsContainer}>
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`${styles.step} ${index === activeStep ? styles.active : ""}`}
                                style={{ borderColor: step.color }}
                                onClick={() => setActiveStep(index)}
                            >
                                <div className={styles.stepIcon} style={{ background: step.color }}>
                                    {step.icon}
                                </div>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section className={styles.preview}>
                    <h2 className={styles.sectionTitle}>Live Preview</h2>
                    <div className={styles.previewGrid}>
                        <div className={styles.previewCard}>
                            <div className={styles.previewHeader}>
                                <span>🤖 AI Chat</span>
                                <span className={styles.liveBadge}>● Live</span>
                            </div>
                            <div className={styles.previewBody}>
                                <div className={styles.message}>
                                    <span className={styles.ai}>AI</span>
                                    <p>Hello! I'm your AURA study assistant.</p>
                                </div>
                                <div className={styles.message}>
                                    <span className={styles.user}>You</span>
                                    <p>What is calculus?</p>
                                </div>
                                <div className={`${styles.message} ${styles.typing}`}>
                                    <span className={styles.ai}>AI</span>
                                    <p>Calculus is the study of continuous change...</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.previewCard}>
                            <div className={styles.previewHeader}>
                                <span>⏱️ Study Timer</span>
                                <span className={styles.liveBadge}>● Live</span>
                            </div>
                            <div className={styles.timerPreview}>
                                <div className={styles.timerCircle}>
                                    <span className={styles.timerTime}>02:34:17</span>
                                </div>
                                <button className={styles.timerBtn}>Start</button>
                            </div>
                        </div>
                        <div className={styles.previewCard}>
                            <div className={styles.previewHeader}>
                                <span>📝 Exam Portal</span>
                                <span className={styles.liveBadge}>● Live</span>
                            </div>
                            <div className={styles.examPreview}>
                                <div className={styles.examCard}>
                                    <h4>Math Olympiad</h4>
                                    <span className={styles.examStatus}>● Live</span>
                                    <span className={styles.examDuration}>2 hours</span>
                                </div>
                                <div className={styles.examCard}>
                                    <h4>Science Quiz</h4>
                                    <span className={styles.examStatus}>○ Upcoming</span>
                                    <span className={styles.examDuration}>1.5 hours</span>
                                </div>
                                <div className={styles.examCard}>
                                    <h4>History Test</h4>
                                    <span className={styles.examStatus}>• Expired</span>
                                    <span className={styles.examDuration}>1 hour</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className={styles.cta}>
                    <div className={styles.ctaGlow} />
                    <h2>Ready to experience AURA?</h2>
                    <p>Join thousands of students learning smarter.</p>
                    <div className={styles.ctaButtons}>
                        <Link href="/signup" className={styles.primaryBtn}>
                            Start Free
                        </Link>
                        <Link href="/" className={styles.secondaryBtn}>
                            ← Back to Home
                        </Link>
                    </div>
                </section>

                <div className={styles.footer}>
                    <p>© 2026 <span>AURA</span> — Adaptive Universal Resource for Achievement</p>
                </div>
            </div>
        </div>
    );
}