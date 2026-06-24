"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../app/style/navbar.module.css";
import { useState } from "react";

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/exam", label: "Exam Portal" },
        { href: "/ai", label: "AI Assistant" },
        { href: "/timer", label: "Timer" },
        { href: "/ai/pricing", label: "Pricing" },
        { href: "/leaderboard", label: "Leaderboard" },
        { href: "/calendar", label: "Calendar" },
    ];

    return (
        <>
            <div className={styles.spacer} />

            <header className={styles.header}>
                <Link href="/" className={styles.logo}>
                    AURA
                </Link>
                <nav className={styles.desktopLinks}>
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.link} ${pathname === link.href ? styles.active : ""}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <button
                    className={styles.hamburger}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? "✕" : "☰"}
                </button>
            </header>
            <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ""}`}>
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`${styles.mobileLink} ${pathname === link.href ? styles.activeMobile : ""}`}
                        onClick={() => setMobileOpen(false)}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
            {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}
        </>
    );
}