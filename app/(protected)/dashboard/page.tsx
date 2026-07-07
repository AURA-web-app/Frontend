"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/createclient";
import styles from "../../style/dashboard.module.css";

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        roll: "",
        country: "",
        totalStudyHours: 0,
        coursesEnrolled: 0,
        examsTaken: 0,
        recentSessions: [] as { date: string; duration: string }[],
        upcomingExams: [] as { name: string; date: string }[],
    });

    useEffect(() => {
        const fetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            const userId = session.user.id;

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("full_name, roll, country")
                .eq("id", userId)
                .maybeSingle();

            if (profileError && profileError.code !== "PGRST116") {
                console.error("Profile fetch error:", profileError);
            }

            const { data: sessions, error: sessionsError } = await supabase
                .from("study_sessions")
                .select("start_time, duration_seconds")
                .eq("user_id", userId)
                .order("start_time", { ascending: false })
                .limit(5);

            if (sessionsError && sessionsError.code !== "PGRST116") {
                console.error("Sessions error:", sessionsError);
            }

            const { data: allSessions, error: totalError } = await supabase
                .from("study_sessions")
                .select("duration_seconds")
                .eq("user_id", userId);

            let totalHours = 0;
            if (!totalError && allSessions) {
                totalHours = allSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 3600;
            } else if (totalError && totalError.code !== "PGRST116") {
                console.error("Total sessions error:", totalError);
            }

            const { count: enrolledCount, error: enrollError } = await supabase
                .from("enrollments")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId);

            if (enrollError && enrollError.code !== "PGRST116") {
                console.error("Enroll error:", enrollError);
            }

            const { count: examsCount, error: examError } = await supabase
                .from("exam_attempts")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId);

            if (examError && examError.code !== "PGRST116") {
                console.error("Exam attempts error:", examError);
            }

            const now = new Date().toISOString();
            const { data: upcoming, error: upcomingError } = await supabase
                .from("calendar_events")
                .select("title, start_time")
                .eq("user_id", userId)
                .eq("event_type", "exam")
                .gte("start_time", now)
                .order("start_time", { ascending: true })
                .limit(5);

            if (upcomingError && upcomingError.code !== "PGRST116") {
                console.error("Upcoming exams error:", upcomingError);
            }

            const recent = (sessions || []).map(s => ({
                date: new Date(s.start_time).toLocaleDateString(),
                duration: s.duration_seconds
                    ? `${Math.floor(s.duration_seconds / 3600)}h ${Math.floor((s.duration_seconds % 3600) / 60)}m`
                    : "N/A",
            }));

            setUserData({
                name: profile?.full_name || session.user.user_metadata?.full_name || "AURA Student",
                email: session.user.email || "student@aura.edu",
                roll: profile?.roll || "IN-000000",
                country: profile?.country || "IN",
                totalStudyHours: Math.round(totalHours),
                coursesEnrolled: enrolledCount || 0,
                examsTaken: examsCount || 0,
                recentSessions: recent,
                upcomingExams: (upcoming || []).map(e => ({
                    name: e.title,
                    date: new Date(e.start_time).toLocaleDateString(),
                })),
            });

            setLoading(false);
        };

        fetchData();
    }, [router]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Loading your dashboard...</p>
            </div>
        );
    }

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
                            {userData.recentSessions.length === 0 ? (
                                <li>No sessions yet. Start studying!</li>
                            ) : (
                                userData.recentSessions.map((s, i) => (
                                    <li key={i}>
                                        <span>{s.date}</span>
                                        <span className={styles.duration}>{s.duration}</span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                    <div className={styles.card}>
                        <h3>Upcoming Exams</h3>
                        <ul className={styles.activityList}>
                            {userData.upcomingExams.length === 0 ? (
                                <li>No upcoming exams. Add one!</li>
                            ) : (
                                userData.upcomingExams.map((exam, i) => (
                                    <li key={i}>
                                        <span>{exam.name}</span>
                                        <span className={styles.examDate}>{exam.date}</span>
                                    </li>
                                ))
                            )}
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