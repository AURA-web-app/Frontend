"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/createclient";
import styles from "../app/style/navbar.module.css";

export default function Nav() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        };
        getSession();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        setMenuOpen(false);
    };

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => setMenuOpen(false);

    if (loading) {
        return (
            <nav className={styles.nav}>
                <div className={styles.container}>
                    <div className={styles.logo}>AURA</div>
                    <div className={styles.loadingPlaceholder} />
                </div>
            </nav>
        );
    }
    const guestLinks = (
        <>
            <Link href="/#features" onClick={closeMenu}>Features</Link>
            <Link href="/#pricing" onClick={closeMenu}>Pricing</Link>
            <Link href="/ai" onClick={closeMenu}>AI</Link>
            <Link href="/timer" onClick={closeMenu}>Timer</Link>
            <Link href="/login" className={styles.loginBtn} onClick={closeMenu}>Login</Link>
            <Link href="/signup" className={styles.signupBtn} onClick={closeMenu}>Sign Up</Link>
        </>
    );

    const userLinks = (
        <>
            <Link href="/dashboard" onClick={closeMenu}>Dashboard</Link>
            <Link href="/ai" onClick={closeMenu}>AI</Link>
            <Link href="/timer" onClick={closeMenu}>Timer</Link>
            <Link href="/courses" onClick={closeMenu}>Courses</Link>
            <div className={styles.profileDropdown}>
                <button className={styles.profileBtn} onClick={toggleMenu}>
                    {session?.user?.email?.[0]?.toUpperCase() || "U"}
                </button>
                {menuOpen && (
                    <div className={styles.dropdownMenu}>
                        <div className={styles.dropdownUser}>
                            <span>{session?.user?.email}</span>
                        </div>
                        <Link href="/dashboard" onClick={closeMenu}>Dashboard</Link>
                        <Link href="/profile" onClick={closeMenu}>Profile</Link>
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </>
    );

    const isSignedIn = !!session;

    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo} onClick={closeMenu}>
                    AURA
                </Link>

                <div className={`${styles.links} ${menuOpen ? styles.open : ""}`}>
                    {isSignedIn ? userLinks : guestLinks}
                </div>
                <button
                    className={`${styles.hamburger} ${menuOpen ? styles.active : ""}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>
            {menuOpen && <div className={styles.overlay} onClick={closeMenu} />}
        </nav>
    );
}