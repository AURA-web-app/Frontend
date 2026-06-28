"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/createclient";
import styles from "../../style/exam-portal.module.css";

interface Exam {
    id: string;
    title: string;
    description: string;
    start: string;
    end: string;
    duration: string;
    link: string;
}

const EXAMS: Exam[] = [
    {
        id: "math-olympiad",
        title: "Math Olympiad",
        description: "Test your math skills and compete with others.",
        start: "2026-06-20T10:00:00",
        end: "2026-06-20T12:00:00",
        duration: "2 hours",
        link: "/exam/math-olympiad",
    },
    {
        id: "science-quiz",
        title: "Science Quiz",
        description: "Challenge your knowledge in various science topics.",
        start: "2025-06-22T14:00:00",
        end: "2025-06-22T15:30:00",
        duration: "1.5 hours",
        link: "/exam/science-quiz",
    },
    {
        id: "history-test",
        title: "History Test",
        description: "Assess your understanding of historical events.",
        start: "2025-06-25T11:00:00",
        end: "2025-06-25T12:00:00",
        duration: "1 hour",
        link: "/exam/history-test",
    },
];

type ExamStatus = "upcoming" | "live" | "expired";

export default function ExamPortal() {
    const [now, setNow] = useState(new Date());
    const [attemptedExams, setAttemptedExams] = useState<string[]>([]);
    const [studentName, setStudentName] = useState("Student");
    const [studentRoll, setStudentRoll] = useState("000000");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const meta = session.user.user_metadata;
                setStudentName(meta.full_name || session.user.email?.split("@")[0] || "Student");
                setStudentRoll(meta.roll || "IN-000042");
            }
            setLoading(false);
        };
        getUser();
    }, []);
    useEffect(() => {
        const stored = localStorage.getItem("attempted-exams");
        if (stored) setAttemptedExams(JSON.parse(stored));
    }, []);
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getExamStatus = (exam: Exam): ExamStatus => {
        const start = new Date(exam.start);
        const end = new Date(exam.end);
        if (now < start) return "upcoming";
        if (now >= start && now <= end) return "live";
        return "expired";
    };

    const formatTimeLeft = (exam: Exam) => {
        if (getExamStatus(exam) !== "live") return null;
        const end = new Date(exam.end);
        const diff = end.getTime() - now.getTime();
        if (diff <= 0) return "Ended";
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        return `${h}h ${m}m ${s}s`;
    };

    const handleAttempt = (examId: string) => {
        if (!attemptedExams.includes(examId)) {
            const updated = [...attemptedExams, examId];
            setAttemptedExams(updated);
            localStorage.setItem("attempted-exams", JSON.stringify(updated));
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Loading exams...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.bgGrid} />
            <div className={styles.bgOrb} />
            <div className={styles.content}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <Link href="/dashboard" className={styles.backBtn}>
                            ← Dashboard
                        </Link>
                        <div className={styles.studentBadge}>
                            <span className={styles.studentRoll}>🎓 {studentRoll}</span>
                            <span className={styles.studentName}>{studentName}</span>
                        </div>
                    </div>
                    <div className={styles.headerRight}>
                        <span className={styles.liveIndicator}>
                            <span className={styles.liveDot} />
                            {new Date().toLocaleTimeString()}
                        </span>
                    </div>
                </header>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Exam Portal</h1>
                    <p className={styles.subtitle}>Select an exam to challenge yourself</p>
                </div>
                <div className={styles.grid}>
                    {EXAMS.map((exam, index) => {
                        const status = getExamStatus(exam);
                        const attempted = attemptedExams.includes(exam.id);
                        const isDisabled = status !== "live" || attempted;
                        const timeLeft = formatTimeLeft(exam);

                        return (
                            <div
                                key={exam.id}
                                className={`${styles.card} ${styles[status]} ${attempted ? styles.attempted : ""}`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={styles.badge}>
                                    {attempted
                                        ? "✅ Attempted"
                                        : status === "live"
                                        ? "🔴 Live"
                                        : status === "upcoming"
                                        ? "🟡 Upcoming"
                                        : "⚪ Expired"}
                                </div>

                                <h2 className={styles.examTitle}>{exam.title}</h2>
                                <p className={styles.examDesc}>{exam.description}</p>

                                <div className={styles.examMeta}>
                                    <span>📅 {new Date(exam.start).toLocaleDateString()}</span>
                                    <span>🕐 {new Date(exam.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                    <span>⏱️ {exam.duration}</span>
                                </div>

                                {status === "live" && !attempted && timeLeft && (
                                    <div className={styles.timer}>
                                        ⏳ {timeLeft} remaining
                                    </div>
                                )}

                                <a
                                    href={isDisabled ? undefined : exam.link}
                                    className={`${styles.examLink} ${isDisabled ? styles.disabled : ""}`}
                                    onClick={(e) => {
                                        if (isDisabled) {
                                            e.preventDefault();
                                            return;
                                        }
                                        handleAttempt(exam.id);
                                    }}
                                    aria-disabled={isDisabled}
                                >
                                    {attempted
                                        ? "✅ Attempted"
                                        : status === "expired"
                                        ? "Expired"
                                        : status === "upcoming"
                                        ? "Starts Soon"
                                        : "🚀 Attempt Exam"}
                                </a>
                            </div>
                        );
                    })}
                </div>
                {attemptedExams.length > 0 && (
                    <div className={styles.summary}>
                        <p>
                            You've attempted <strong>{attemptedExams.length}</strong> exam{attemptedExams.length > 1 ? "s" : ""}.
                            Keep going! 💪
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}