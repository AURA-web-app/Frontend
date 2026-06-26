"use client";

import { useEffect } from "react";
import "./style/theme.css";
import "./style/landing.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const navbar = document.getElementById("navbar");
        const handleScroll = () => {
            if (!navbar) return;
            if (window.scrollY > 40) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        const navLinks = document.getElementById("navLinks");
        const loginBtn = document.getElementById("loginBtn");
        navLinks?.classList.toggle("open");
        loginBtn?.classList.toggle("show-mobile");
    };

    const features = [
        {
            title: "AI Tutor",
            icon: "🧠",
            desc: "Personalized explanations, doubt solving, and adaptive learning paths.",
        },
        {
            title: "Focus Mode",
            icon: "⚡",
            desc: "Distraction-free study sessions with deep productivity analytics.",
        },
        {
            title: "Exam Engine",
            icon: "📝",
            desc: "Practice tests, revision plans, and real-time performance insights.",
        },
        {
            title: "SMS Learning",
            icon: "📱",
            desc: "Access education without internet — simple SMS-based delivery.",
        },
        {
            title: "Analytics",
            icon: "📊",
            desc: "Track progress, identify weaknesses, and celebrate growth.",
        },
        {
            title: "Classroom AI",
            icon: "🏫",
            desc: "AI-powered insights for schools and teachers at scale.",
        },
    ];

    return (
        <main className="landing">
            <div className="ambient-orbs">
                <div className="orb orb-purple" />
                <div className="orb orb-green" />
                <div className="orb orb-orange" />
            </div>

            <nav className="navbar" id="navbar">
                <div className="logo">
                    <Image src="/logo.png" alt="AURA" width={120} height={80} />
                </div>
                <div className="nav-links" id="navLinks">
                    <a href="#features" onClick={() => document.getElementById("navLinks")?.classList.remove("open")}>Features</a>
                    <a href="#difference" onClick={() => document.getElementById("navLinks")?.classList.remove("open")}>Difference</a>
                    <a href="#community" onClick={() => document.getElementById("navLinks")?.classList.remove("open")}>Community</a>
                    <a href="/ai" onClick={() => document.getElementById("navLinks")?.classList.remove("open")}>AI</a>
                    <a href="/timer" onClick={() => document.getElementById("navLinks")?.classList.remove("open")}>Timer</a>
                </div>
                <div className="nav-actions">
                    <button className="login-btn" id="loginBtn" onClick={() => router.push("/login")}>Login</button>
                    <button className="signup-btn" onClick={() => router.push("/signup")}>Sign Up</button>
                    <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Toggle menu">
                        <span /><span /><span />
                    </button>
                </div>
            </nav>

            <section className="hero">
                <p className="mini-badge">Next Generation Learning Ecosystem</p>
                <h1 className="aura-title">AURA</h1>
                <p className="aura-full-form">Adaptive Universal Resource for Achievement</p>
                <h2 className="hero-heading">
                    Have AURA?<br />
                    <span>Want It IRL?</span>
                </h2>
                <p className="hero-subtext">
                    Learn faster. Focus longer. Reach students everywhere. Powered by AI. Built for impact.
                </p>
                <div className="hero-buttons">
                    <button className="primary-btn primary-btn-lg" onClick={() => router.push("/signup")}>Get Your AURA</button>
                    <button className="secondary-btn">Watch Demo</button>
                </div>
                <div className="hero-stats">
                    <div className="stat-card">
                        <h3>3M+</h3>
                        <p>Training Examples</p>
                    </div>
                    <div className="stat-card">
                        <h3>24/7</h3>
                        <p>AI Learning</p>
                    </div>
                    <div className="stat-card">
                        <h3>SMS</h3>
                        <p>Offline Education</p>
                    </div>
                </div>
            </section>

            <section id="features" className="features-section">
                <span className="section-label">Core Features</span>
                <h2 className="section-title">Why Students Choose AURA</h2>
                <p className="section-subtitle">
                    A complete learning ecosystem designed for modern students — with or without internet access.
                </p>
                <div className="features-grid">
                    {features.map((feature) => (
                        <div key={feature.title} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                            <div className="feature-hover-line" />
                        </div>
                    ))}
                </div>
            </section>

            <section id="difference" className="difference-section">
                <span className="section-label">The Difference</span>
                <h2 className="section-title">Why We Are Different</h2>
                <p className="section-subtitle">
                    We are not just an app. Not just AI. Not just whatever the latest trend is.<br />
                    We are building for community.<br />
                </p>
                <div className="comparison-grid">
                    <div className="comparison-card">
                        <h3>Typical AI Apps</h3>
                        <ul>
                            <li>❌ Just a chatbot interface</li>
                            <li>❌ Internet required</li>
                            <li>❌ No community mission</li>
                            <li>❌ No school ecosystem</li>
                            <li>❌ Surface-level features</li>
                        </ul>
                    </div>
                    <div className="comparison-card featured">
                        <span className="featured-badge">⭐ Best Choice</span>
                        <h3>AURA</h3>
                        <ul>
                            <li>✅ Complete learning ecosystem</li>
                            <li>✅ SMS Learning — no internet needed</li>
                            <li>✅ School-ready infrastructure</li>
                            <li>✅ Humanitarian mission</li>
                            <li>✅ AI + Discipline + Analytics</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section id="community" className="community-section">
                <span className="section-label">Our Mission</span>
                <h2 className="section-title">Built To Help Everyone Learn</h2>
                <p className="section-subtitle">
                    Education shouldn't depend on privilege. We're building for everyone.
                </p>
                <div className="community-grid">
                    <Link href="/community" className="impact-card">
                        <h3>📚 SMS Education</h3>
                        <p>Learning for students without smartphones or reliable internet access.</p>
                    </Link>
                    <Link href="/community" className="impact-card">
                        <h3>🌍 Social Impact</h3>
                        <p>Expanding educational access to underserved communities worldwide.</p>
                    </Link>
                    <Link href="/community" className="impact-card">
                        <h3>🏫 School Partnerships</h3>
                        <p>Future-ready infrastructure designed for national education systems.</p>
                    </Link>
                </div>
            </section>

            <section className="movement-section">
                <span className="section-label">Join the Movement</span>
                <h2 className="section-title">Be Part of Something Bigger</h2>
                <div className="movement-content">
                    <p className="movement-tagline">#AURA — Go Crazzzy.</p>
                    <div className="movement-steps">
                        <div className="movement-step">
                            <span className="step-num">1</span>
                            <span className="step-label">Start Free</span>
                        </div>
                        <div className="movement-step">
                            <span className="step-num">2</span>
                            <span className="step-label">Learn with AI</span>
                        </div>
                        <div className="movement-step">
                            <span className="step-num">3</span>
                            <span className="step-label">Impact the World</span>
                        </div>
                    </div>
                    <button className="primary-btn primary-btn-lg" onClick={() => router.push("/signup")}>
                        Join Now
                    </button>
                </div>
            </section>

            <section className="future-section">
                <span className="section-label">Vision</span>
                <h2>The Future Of Learning</h2>
                <div className="future-divider" />
                <p>
                    AI Tutors. SMS Learning. Classroom Intelligence. National Scale Education. All in one ecosystem.
                </p>
            </section>

            <section className="cta-section">
                <div className="cta-glow" />
                <h2>Ready To Make It Real?</h2>
                <p>Learn smarter. Grow faster. <strong>Go Crazzzy.</strong></p>
                <button className="primary-btn primary-btn-lg" onClick={() => router.push("/signup")}>Start Free</button>
            </section>

            <div className="footer-mini">
                © 2026 <span>AURA</span> — Adaptive Universal Resource for Achievement. All rights reserved.
                <span className="sparkle"> ✦</span>
            </div>
        </main>
    );
}