"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/createclient";
import styles from "../../style/dashboard.module.css";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            setUser(session.user);
            setLoading(false);
        };
        getUser();
    }, [router]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Loading your dashboard...</p>
            </div>
        );
    }
    const userData = {
        name: user?.user_metadata?.full_name || "AURA Student",
        email: user?.email || "student@aura.edu",
        roll: "IN-000042",
        country: "IN",
        totalStudyHours: 127,
        coursesEnrolled: 4,
        examsTaken: 12,
        recentSessions: [
            { date: "2026-06-27", duration: "2h 15m" },
            { date: "2026-06-26", duration: "1h 45m" },
            { date: "2026-06-25", duration: "3h 10m" },
        ],
        upcomingExams: [
            { name: "Calculus Final", date: "2026-07-05" },
            { name: "Physics Midterm", date: "2026-07-12" },
        ],
    };

    const quickLinks = [
        { href: "/ai", label: "AI Assistant", icon: "🤖", color: "#10b981" },
        { href: "/timer", label: "Study Timer", icon: "⏱️", color: "#f97316" },
        { href: "/exam-portal", label: "Exam Portal", icon: "📝", color: "#8b5cf6" },
        { href: "/courses", label: "My Courses", icon: "📚", color: "#3b82f6" },
        { href: "/calendar", label: "Calendar", icon: "📅", color: "#facc15" },
    ];

    return (
        <div className={styles.dashboard}>
            <div className={styles.bgGrid} />
            <div className={styles.bgOrb} />

            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.userInfo}>
                        <h1>Welcome back, {userData.name} 👋</h1>
                        <p className={styles.subtitle}>
                            Roll: <span className={styles.roll}>{userData.roll}</span>
                            &nbsp;·&nbsp; {userData.email}
                        </p>
                    </div>
                    <Link href="/" className={styles.homeLink}>← Home</Link>
                </header>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>📖</span>
                        <div className={styles.statValue}>{userData.totalStudyHours}h</div>
                        <div className={styles.statLabel}>Study Hours</div>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>📚</span>
                        <div className={styles.statValue}>{userData.coursesEnrolled}</div>
                        <div className={styles.statLabel}>Courses Enrolled</div>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>📝</span>
                        <div className={styles.statValue}>{userData.examsTaken}</div>
                        <div className={styles.statLabel}>Exams Taken</div>
                    </div>
                </div>
                <div className={styles.quickActions}>
                    <h2>Quick Actions</h2>
                    <div className={styles.quickGrid}>
                        {quickLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={styles.quickCard}
                                style={{ borderColor: link.color }}
                            >
                                <div className={styles.quickIcon} style={{ background: link.color }}>
                                    {link.icon}
                                </div>
                                <span className={styles.quickLabel}>{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className={styles.twoCol}>
                    <div className={styles.card}>
                        <h3>Recent Sessions</h3>
                        <ul className={styles.activityList}>
                            {userData.recentSessions.map((s, i) => (
                                <li key={i}>
                                    <span>{s.date}</span>
                                    <span className={styles.duration}>{s.duration}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className={styles.card}>
                        <h3>Upcoming Exams</h3>
                        <ul className={styles.activityList}>
                            {userData.upcomingExams.map((exam, i) => (
                                <li key={i}>
                                    <span>{exam.name}</span>
                                    <span className={styles.examDate}>{exam.date}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className={styles.footer}>
                    <p>© 2026 AURA — Adaptive Universal Resource for Achievement</p>
                </div>
            </div>
        </div>
    );
}