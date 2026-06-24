"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import styles from "../../../style/pricing.module.css";

// ---------- Animated Grid ----------
const AnimatedGrid = () => {
    return (
        <div className={styles.animatedGrid}>
            <div className={styles.gridInner} />
            <div className={styles.spotlight} id="heroSpotlight" />
        </div>
    );
};

// ---------- Floating Particles ----------
const Particles = () => {
    return (
        <div className={styles.particles}>
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={i}
                    className={styles.particle}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${Math.random() * 8 + 4}px`,
                        height: `${Math.random() * 8 + 4}px`,
                        background:
                            i % 3 === 0
                                ? "#10b981"
                                : i % 3 === 1
                                ? "#f97316"
                                : "#fff",
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.4, 1],
                    }}
                    transition={{
                        duration: 3 + i * 0.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

// ---------- Spotlight follows mouse ----------
const useSpotlight = () => {
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const spot = document.getElementById("heroSpotlight");
            if (spot) {
                spot.style.setProperty("--x", `${e.clientX}px`);
                spot.style.setProperty("--y", `${e.clientY}px`);
            }
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);
};

// ---------- Temporary donation modal ----------
const useDonationPopup = () => {
    const [showPopup, setShowPopup] = useState(false);

    const openPopup = () => setShowPopup(true);
    const closePopup = () => setShowPopup(false);

    return { showPopup, openPopup, closePopup };
};

export default function PricingPage() {
    useSpotlight();
    const { showPopup, openPopup, closePopup } = useDonationPopup();

    const [requests, setRequests] = useState(1000);
    const [researchTasks, setResearchTasks] = useState(10);
    const estimatedCost = requests * 0.02 + researchTasks * 0.5;

    const sectionRef = useRef(null);

    return (
        <div className={styles.page}>
            {/* Kill double scrollbar */}
            <style jsx global>{`
                html,
                body {
                    overflow-x: hidden;
                }
            `}</style>

            <AnimatedGrid />
            <Particles />

            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <motion.h1
                        className={styles.heroTitle}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                    >
                        AI Without Subscriptions
                    </motion.h1>
                    <motion.p
                        className={styles.heroSubtitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.2 }}
                    >
                        Pay only for what you use. Support only if you believe.
                    </motion.p>
                    <motion.div
                        className={styles.heroButtons}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <a href="/ai" className={styles.primaryBtn}>
                            Start Building
                        </a>
                        <a href="/ai" className={styles.secondaryBtn}>
                            View Models
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Pricing cards */}
            <section className={styles.pricing} ref={sectionRef}>
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    Transparent Pricing
                </motion.h2>

                <div className={styles.cards}>
                    {/* Community */}
                    <motion.div
                        className={`${styles.card} ${styles.community}`}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <h3>Community</h3>
                        <div className={styles.price}>₹0</div>
                        <ul>
                            <li>Limited requests</li>
                            <li>Community queue</li>
                            <li>Access to latest public model</li>
                            <li>Free forever</li>
                        </ul>
                        <a href="/ai" className={styles.cardBtn}>
                            Get Started
                        </a>
                    </motion.div>

                    {/* Builder (Featured) */}
                    <motion.div
                        className={`${styles.card} ${styles.featured}`}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className={styles.badge}>MOST POPULAR</div>
                        <h3>Builder</h3>
                        <div className={styles.price}>Pay As You Use</div>
                        <ul>
                            <li>₹0.02 / request</li>
                            <li>₹0.10 / reasoning task</li>
                            <li>₹0.50 / research task</li>
                            <li>No monthly subscription</li>
                            <li>Priority queue</li>
                        </ul>
                        <a href="/ai" className={styles.featuredBtn}>
                            Start Building
                        </a>
                    </motion.div>

                    {/* Enterprise */}
                    <motion.div
                        className={`${styles.card} ${styles.enterprise}`}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <h3>Enterprise</h3>
                        <ul>
                            <li>Private deployment</li>
                            <li>Dedicated GPUs</li>
                            <li>Fine tuning</li>
                            <li>Contact sales</li>
                        </ul>
                        <a href="/ai" className={styles.cardBtn}>
                            Contact Us
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Calculator */}
            <section className={styles.calculator}>
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    Live Cost Calculator
                </motion.h2>
                <div className={styles.sliderGroup}>
                    <label>Requests per month: {requests}</label>
                    <input
                        type="range"
                        min="0"
                        max="10000"
                        value={requests}
                        onChange={(e) => setRequests(Number(e.target.value))}
                        className={styles.rangeSlider}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Research tasks per month: {researchTasks}</label>
                    <input
                        type="range"
                        min="0"
                        max="500"
                        value={researchTasks}
                        onChange={(e) => setResearchTasks(Number(e.target.value))}
                        className={styles.rangeSlider}
                    />
                </div>
                <motion.div
                    className={styles.totalCost}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span>Estimated Monthly Cost</span>
                    <motion.span
                        key={estimatedCost.toFixed(2)}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={styles.costValue}
                    >
                        ₹{estimatedCost.toFixed(2)}
                    </motion.span>
                </motion.div>
            </section>

            {/* Cost Transparency */}
            <section className={styles.transparency}>
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    Where Your Money Goes
                </motion.h2>
                <div className={styles.bars}>
                    {[
                        { label: "GPUs", percent: 42, color: "#10b981" },
                        { label: "Storage", percent: 18, color: "#f97316" },
                        { label: "Research", percent: 12, color: "#a855f7" },
                        { label: "Infrastructure", percent: 15, color: "#3b82f6" },
                        { label: "Reserve", percent: 13, color: "#ec4899" },
                    ].map((item, index) => (
                        <motion.div
                            key={item.label}
                            className={styles.barItem}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className={styles.barLabel}>
                                <span>{item.label}</span>
                                <span>{item.percent}%</span>
                            </div>
                            <div className={styles.barTrack}>
                                <motion.div
                                    className={styles.barFill}
                                    style={{ background: item.color }}
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${item.percent}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Timeline */}
            <section className={styles.timeline}>
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    AURA Evolution
                </motion.h2>
                <div className={styles.timelineContainer}>
                    {[
                        "Flaw 2k",
                        "Flaw 7k",
                        "Flaw 10k",
                        "Flaw 12k",
                        "AURA v1",
                        "AURA Reason",
                        "AURA Research",
                    ].map((node, index) => (
                        <motion.div
                            key={node}
                            className={styles.timelineNode}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <div className={styles.nodeDot} />
                            <div className={styles.nodeLabel}>{node}</div>
                            {index < 6 && <div className={styles.nodeLine} />}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Support AURA (with temporary donation popup) */}
            <section className={styles.support}>
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    Support Independent AI
                </motion.h2>
                <div className={styles.donationButtons}>
                    {["₹50", "₹100", "₹500", "Custom"].map((amount) => (
                        <motion.button
                            key={amount}
                            className={styles.donateBtn}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openPopup}
                        >
                            {amount}
                        </motion.button>
                    ))}
                </div>
                <p className={styles.supportText}>
                    Support development, research and infrastructure. No additional
                    AI capabilities. Pure support.
                </p>
            </section>

            {/* Trust Manifesto */}
            <section className={styles.trust}>
                <motion.div
                    className={styles.trustStatement}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h2>If AURA disappears, the models remain public.</h2>
                </motion.div>
            </section>

            {/* Final CTA */}
            <section className={styles.finalCta}>
                <motion.div
                    className={styles.ctaGlow}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                />
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    Build With AURA
                </motion.h2>
                <motion.div
                    className={styles.ctaButtons}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <a href="/ai" className={styles.primaryBtn}>
                        Start Free
                    </a>
                    <a href="/ai" className={styles.secondaryBtn}>
                        Explore Models
                    </a>
                </motion.div>
            </section>

            {/* Donation Popup Modal */}
            {showPopup && (
                <motion.div
                    className={styles.popupOverlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closePopup}
                >
                    <motion.div
                        className={styles.popupContent}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Thank you for your support! 💚</h2>
                        <p>
                            Donations are not available right now, but we really
                            appreciate your continued support. Stay tuned!
                        </p>
                        <button onClick={closePopup} className={styles.primaryBtn}>
                            Close
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}