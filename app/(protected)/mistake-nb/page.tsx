"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/createclient";
import styles from "../../style/mistakes.module.css";

interface Mistake {
    id: string;
    exam_id: string;
    exam_title: string;
    question_text: string;
    user_answer: string;
    correct_answer: string;
    explanation: string;
    marked_reviewed: boolean;
    created_at: string;
}

export default function MistakesPage() {
    const [mistakes, setMistakes] = useState<Mistake[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "reviewed" | "unreviewed">("all");
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = "/login";
                return;
            }
            setUserId(session.user.id);
            fetchMistakes(session.user.id);
        };
        getUser();
    }, []);

    const fetchMistakes = async (uid: string) => {
        setLoading(true);
        const res = await fetch(`/api/mistakes?userId=${uid}`);
        const data = await res.json();
        if (res.ok) setMistakes(data);
        setLoading(false);
    };

    const toggleReviewed = async (id: string, current: boolean) => {
        if (!userId) return;
        const res = await fetch(`/api/mistakes`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, userId, markedReviewed: !current }),
        });
        if (res.ok) {
            setMistakes((prev) =>
                prev.map((m) => (m.id === id ? { ...m, marked_reviewed: !current } : m))
            );
        }
    };

    const deleteMistake = async (id: string) => {
        if (!userId) return;
        if (!confirm("Delete this mistake?")) return;
        const res = await fetch(`/api/mistakes?id=${id}&userId=${userId}`, {
            method: "DELETE",
        });
        if (res.ok) {
            setMistakes((prev) => prev.filter((m) => m.id !== id));
        }
    };

    const clearAll = async () => {
        if (!userId) return;
        if (!confirm("Delete all mistakes? This cannot be undone.")) return;
        const res = await fetch(`/api/mistakes?userId=${userId}`, {
            method: "DELETE",
        });
        if (res.ok) setMistakes([]);
    };

    const filtered = mistakes.filter((m) => {
        if (filter === "reviewed") return m.marked_reviewed;
        if (filter === "unreviewed") return !m.marked_reviewed;
        return true;
    });

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Loading your mistakes...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.bgGrid} />
            <div className={styles.bgOrb} />

            <div className={styles.content}>
                <header className={styles.header}>
                    <Link href="/dashboard" className={styles.backBtn}>
                        ← Dashboard
                    </Link>
                    <h1 className={styles.title}>📓 Mistake Notebook</h1>
                    <div className={styles.actions}>
                        <button onClick={clearAll} className={styles.clearBtn}>
                            Clear All
                        </button>
                    </div>
                </header>

                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <span>Total</span>
                        <strong>{mistakes.length}</strong>
                    </div>
                    <div className={styles.statCard}>
                        <span>Unreviewed</span>
                        <strong>{mistakes.filter((m) => !m.marked_reviewed).length}</strong>
                    </div>
                    <div className={styles.statCard}>
                        <span>Reviewed</span>
                        <strong>{mistakes.filter((m) => m.marked_reviewed).length}</strong>
                    </div>
                </div>

                <div className={styles.filterBar}>
                    <button
                        className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
                        onClick={() => setFilter("all")}
                    >
                        All
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === "unreviewed" ? styles.active : ""}`}
                        onClick={() => setFilter("unreviewed")}
                    >
                        Unreviewed
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === "reviewed" ? styles.active : ""}`}
                        onClick={() => setFilter("reviewed")}
                    >
                        Reviewed
                    </button>
                </div>

                {filtered.length === 0 ? (
                    <div className={styles.empty}>
                        <p>✨ No mistakes to show! You're doing great.</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filtered.map((mistake) => (
                            <div
                                key={mistake.id}
                                className={`${styles.card} ${mistake.marked_reviewed ? styles.reviewed : ""}`}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.examTag}>{mistake.exam_title}</span>
                                    <span className={styles.date}>
                                        {new Date(mistake.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className={styles.question}>{mistake.question_text}</p>
                                <div className={styles.answerRow}>
                                    <span className={styles.wrong}>❌ Your answer: {mistake.user_answer}</span>
                                    <span className={styles.correct}>✅ Correct: {mistake.correct_answer}</span>
                                </div>
                                {mistake.explanation && (
                                    <p className={styles.explanation}>💡 {mistake.explanation}</p>
                                )}
                                <div className={styles.cardActions}>
                                    <button
                                        className={styles.reviewBtn}
                                        onClick={() => toggleReviewed(mistake.id, mistake.marked_reviewed)}
                                    >
                                        {mistake.marked_reviewed ? "Unmark" : "Mark as Reviewed"}
                                    </button>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => deleteMistake(mistake.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}