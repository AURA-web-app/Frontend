"use client";

import { useState, useEffect } from "react";
import "../../style/exam-portal.css";
import "../../style/theme.css";

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
    const [studentId] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
    const [studentName] = useState("Rahul Sharma");
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
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        return `${h}h ${m}m ${s}s remaining`;
    };

    const handleAttempt = (examId: string) => {
        if (!attemptedExams.includes(examId)) {
            const updated = [...attemptedExams, examId];
            setAttemptedExams(updated);
            localStorage.setItem("attempted-exams", JSON.stringify(updated));
        }
    };

    return (
        <div className="exam-portal-container">
            <div className="student-badge">
                <span className="student-roll">#{studentId}</span>
                <span className="student-name">{studentName}</span>
            </div>

            <h1 className="exam-portal-title">Exam Portal</h1>
            <p className="exam-portal-subtitle">Select an exam to challenge yourself</p>

            <div className="exam-grid">
                {EXAMS.map((exam) => {
                    const status = getExamStatus(exam);
                    const attempted = attemptedExams.includes(exam.id);
                    const isDisabled = status !== "live" || attempted;

                    return (
                        <div
                            key={exam.id}
                            className={`exam-card ${status} ${attempted ? "attempted" : ""}`}
                        >
                            <div className="exam-card-badge">
                                {attempted
                                    ? "✓ Attempted"
                                    : status === "live"
                                    ? "● Live"
                                    : status === "upcoming"
                                    ? "○ Upcoming"
                                    : "• Expired"}
                            </div>

                            <h2 className="exam-title">{exam.title}</h2>
                            <p className="exam-description">{exam.description}</p>

                            <div className="exam-details">
                                <span>{new Date(exam.start).toLocaleDateString()}</span>
                                <span>
                                    {new Date(exam.start).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                                <span>{exam.duration}</span>
                            </div>

                            {status === "live" && !attempted && (
                                <div className="exam-timer">{formatTimeLeft(exam)}</div>
                            )}

                            <a
                                href={isDisabled ? undefined : exam.link}
                                className={`exam-link ${isDisabled ? "disabled" : ""}`}
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
                                    ? "Attempted"
                                    : status === "expired"
                                    ? "Expired"
                                    : status === "upcoming"
                                    ? "Starts Soon"
                                    : "Attempt Exam"}
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}