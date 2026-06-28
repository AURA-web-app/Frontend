"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/createclient";
import styles from "../../style/courses.module.css";

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    progress: number;
    enrolled: boolean;
    price: number;
    category: string;
}

const MOCK_COURSES: Course[] = [
    {
        id: "1",
        title: "Calculus I",
        description: "Master limits, derivatives, and integrals with real-world applications.",
        thumbnail: "📐",
        progress: 72,
        enrolled: true,
        price: 49,
        category: "Mathematics",
    },
    {
        id: "2",
        title: "Physics 101",
        description: "Learn mechanics, thermodynamics, and electromagnetism from scratch.",
        thumbnail: "⚛️",
        progress: 58,
        enrolled: true,
        price: 59,
        category: "Science",
    },
    {
        id: "3",
        title: "Chemistry Basics",
        description: "Explore atoms, molecules, and chemical reactions in depth.",
        thumbnail: "🧪",
        progress: 34,
        enrolled: true,
        price: 39,
        category: "Science",
    },
    {
        id: "4",
        title: "Data Structures",
        description: "Algorithms, trees, graphs, and problem-solving techniques.",
        thumbnail: "📊",
        progress: 91,
        enrolled: true,
        price: 69,
        category: "Computer Science",
    },
    {
        id: "5",
        title: "Machine Learning Intro",
        description: "Supervised, unsupervised learning and neural networks.",
        thumbnail: "🤖",
        progress: 0,
        enrolled: false,
        price: 79,
        category: "AI",
    },
    {
        id: "6",
        title: "Web Development",
        description: "HTML, CSS, JavaScript, React, and Node.js full-stack.",
        thumbnail: "🌐",
        progress: 0,
        enrolled: false,
        price: 89,
        category: "Programming",
    },
];

const MOCK_TRANSACTIONS = [
    { id: "t1", type: "credit", amount: 500, description: "Wallet top-up", date: "2026-06-27" },
    { id: "t2", type: "debit", amount: 49, description: "Course purchase: Calculus I", date: "2026-06-26" },
    { id: "t3", type: "credit", amount: 200, description: "Referral bonus", date: "2026-06-25" },
    { id: "t4", type: "debit", amount: 59, description: "Course purchase: Physics 101", date: "2026-06-24" },
];

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
    const [balance, setBalance] = useState(342);
    const [studentName, setStudentName] = useState("Student");
    const [loading, setLoading] = useState(true);
    const [showDeposit, setShowDeposit] = useState(false);
    const [depositAmount, setDepositAmount] = useState(100);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const meta = session.user.user_metadata;
                setStudentName(meta.full_name || session.user.email?.split("@")[0] || "Student");
            }
            setLoading(false);
        };
        getUser();
    }, []);

    const handleEnroll = (courseId: string) => {
        setCourses((prev) =>
            prev.map((c) =>
                c.id === courseId ? { ...c, enrolled: true, progress: 0 } : c
            )
        );
        const course = courses.find((c) => c.id === courseId);
        if (course) {
            setBalance((prev) => prev - course.price);
        }
    };

    const handleDeposit = () => {
        setBalance((prev) => prev + depositAmount);
        setShowDeposit(false);
        setDepositAmount(100);
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Loading your courses...</p>
            </div>
        );
    }

    const totalEnrolled = courses.filter((c) => c.enrolled).length;
    const totalHours = courses.reduce((acc, c) => acc + Math.round(c.progress / 100 * 10), 0);

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
                        <span className={styles.greeting}>Welcome back, {studentName} 👋</span>
                    </div>
                    <div className={styles.headerRight}>
                        <span className={styles.liveIndicator}>
                            <span className={styles.liveDot} />
                            Live
                        </span>
                    </div>
                </header>
                <section className={styles.walletSection}>
                    <div className={styles.walletCard}>
                        <div className={styles.walletHeader}>
                            <h2>💳 Wallet</h2>
                            <button
                                className={styles.depositBtn}
                                onClick={() => setShowDeposit(true)}
                            >
                                + Add Funds
                            </button>
                        </div>
                        <div className={styles.walletBalance}>
                            <span className={styles.balanceLabel}>Balance</span>
                            <motion.span
                                key={balance}
                                className={styles.balanceAmount}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                ₹{balance.toFixed(2)}
                            </motion.span>
                        </div>
                        <div className={styles.walletStats}>
                            <div className={styles.statItem}>
                                <span>📚 Enrolled</span>
                                <strong>{totalEnrolled}</strong>
                            </div>
                            <div className={styles.statItem}>
                                <span>⏱️ Hours</span>
                                <strong>{totalHours}</strong>
                            </div>
                            <div className={styles.statItem}>
                                <span>🏆 Courses</span>
                                <strong>{courses.length}</strong>
                            </div>
                        </div>
                    </div>
                    <div className={styles.transactionsCard}>
                        <h3>Recent Activity</h3>
                        <ul className={styles.transactionsList}>
                            {MOCK_TRANSACTIONS.slice(0, 3).map((tx) => (
                                <li key={tx.id} className={styles.transactionItem}>
                                    <span className={styles.txIcon}>
                                        {tx.type === "credit" ? "⬆️" : "⬇️"}
                                    </span>
                                    <span className={styles.txDesc}>{tx.description}</span>
                                    <span className={`${styles.txAmount} ${tx.type === "credit" ? styles.credit : styles.debit}`}>
                                        {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
                <AnimatePresence>
                    {showDeposit && (
                        <motion.div
                            className={styles.modalOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeposit(false)}
                        >
                            <motion.div
                                className={styles.modalContent}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2>💰 Add Funds</h2>
                                <p>Enter the amount you'd like to add to your wallet.</p>
                                <div className={styles.modalInputGroup}>
                                    <input
                                        type="number"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(Number(e.target.value))}
                                        min="10"
                                        step="10"
                                        className={styles.modalInput}
                                    />
                                    <div className={styles.quickAmounts}>
                                        {[50, 100, 200, 500].map((amt) => (
                                            <button
                                                key={amt}
                                                className={styles.quickAmountBtn}
                                                onClick={() => setDepositAmount(amt)}
                                            >
                                                ₹{amt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.modalActions}>
                                    <button
                                        className={styles.modalCancel}
                                        onClick={() => setShowDeposit(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={styles.modalConfirm}
                                        onClick={handleDeposit}
                                    >
                                        Add ₹{depositAmount}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <section className={styles.coursesSection}>
                    <div className={styles.sectionHeader}>
                        <h2>📚 Your Courses</h2>
                        <span className={styles.courseCount}>{totalEnrolled} / {courses.length}</span>
                    </div>
                    <div className={styles.grid}>
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                className={`${styles.card} ${course.enrolled ? styles.enrolled : ""}`}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08, duration: 0.5 }}
                                whileHover={{ y: -8 }}
                            >
                                <div className={styles.cardThumb}>
                                    <span className={styles.emojiThumb}>{course.thumbnail}</span>
                                    {course.enrolled && (
                                        <div className={styles.progressBadge}>
                                            {course.progress}%
                                        </div>
                                    )}
                                    {!course.enrolled && (
                                        <div className={styles.priceTag}>₹{course.price}</div>
                                    )}
                                </div>
                                <div className={styles.cardBody}>
                                    <span className={styles.cardCategory}>{course.category}</span>
                                    <h3>{course.title}</h3>
                                    <p>{course.description}</p>
                                    {course.enrolled && (
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{ width: `${course.progress}%` }}
                                            />
                                        </div>
                                    )}
                                    <div className={styles.cardActions}>
                                        {course.enrolled ? (
                                            <Link
                                                href={`/courses/${course.id}`}
                                                className={styles.continueBtn}
                                            >
                                                Continue
                                            </Link>
                                        ) : (
                                            <button
                                                className={styles.enrollBtn}
                                                onClick={() => handleEnroll(course.id)}
                                            >
                                                Enroll · ₹{course.price}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
                <footer className={styles.footer}>
                    <p>© 2026 AURA — Adaptive Universal Resource for Achievement</p>
                </footer>
            </div>
        </div>
    );
}