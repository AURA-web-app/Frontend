"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/createclient";
import styles from "../../style/profile.module.css";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [fullName, setFullName] = useState("");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmInput, setConfirmInput] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            const user = session.user;
            setUser(user);
            setFullName(user.user_metadata?.full_name || "");
            const mockProfile = {
                roll: "IN-000042",
                country: "IN",
                created_at: user.created_at,
                totalStudyHours: 127,
                coursesEnrolled: 4,
                examsTaken: 12,
            };
            setProfile(mockProfile);
            setLoading(false);
        };

        fetchUser();
    }, [router]);

    const handleUpdateName = async () => {
        if (!fullName.trim()) {
            setMessage({ type: "error", text: "Name cannot be empty." });
            return;
        }
        setUpdating(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({
            data: { full_name: fullName.trim() },
        });

        if (error) {
            setMessage({ type: "error", text: error.message });
        } else {
            setMessage({ type: "success", text: "Name updated successfully!" });
            setEditMode(false);
            setUser((prev: any) => ({
                ...prev,
                user_metadata: { ...prev.user_metadata, full_name: fullName.trim() },
            }));
        }
        setUpdating(false);
    };

    const handleChangePassword = async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(user.email);
        if (error) {
            setMessage({ type: "error", text: error.message });
        } else {
            setMessage({
                type: "success",
                text: "Password reset email sent. Check your inbox.",
            });
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };
    const handleDeleteAccount = async () => {
        if (confirmInput !== user.email) {
            setMessage({ type: "error", text: "Email confirmation does not match." });
            return;
        }

        setDeleting(true);
        setMessage(null);

        try {
            const res = await fetch("/api/delete-account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete account.");
            await supabase.auth.signOut();
            router.push("/");
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className={styles.profile}>
            <div className={styles.bgGrid} />
            <div className={styles.bgOrb} />
            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.userRow}>
                        <div className={styles.avatar}>
                            {fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                            <h1>{fullName || "User"}</h1>
                            <p className={styles.email}>{user?.email}</p>
                            <p className={styles.roll}>
                                Roll: <span>{profile?.roll || "Not assigned"}</span>
                            </p>
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <button onClick={() => router.push("/dashboard")} className={styles.backBtn}>
                            ← Dashboard
                        </button>
                        <button onClick={handleSignOut} className={styles.logoutBtn}>
                            Sign Out
                        </button>
                    </div>
                </header>
                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>📖</span>
                        <div className={styles.statValue}>{profile?.totalStudyHours || 0}h</div>
                        <div className={styles.statLabel}>Study Hours</div>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>📚</span>
                        <div className={styles.statValue}>{profile?.coursesEnrolled || 0}</div>
                        <div className={styles.statLabel}>Courses Enrolled</div>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>📝</span>
                        <div className={styles.statValue}>{profile?.examsTaken || 0}</div>
                        <div className={styles.statLabel}>Exams Taken</div>
                    </div>
                </div>
                <div className={styles.infoCard}>
                    <div className={styles.cardHeader}>
                        <h2>Profile Information</h2>
                        {!editMode ? (
                            <button onClick={() => setEditMode(true)} className={styles.editBtn}>
                                Edit
                            </button>
                        ) : (
                            <button onClick={() => setEditMode(false)} className={styles.cancelBtn}>
                                Cancel
                            </button>
                        )}
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Full Name</span>
                        {editMode ? (
                            <div className={styles.editField}>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                    className={styles.input}
                                />
                                <button
                                    onClick={handleUpdateName}
                                    disabled={updating}
                                    className={styles.saveBtn}
                                >
                                    {updating ? "Saving..." : "Save"}
                                </button>
                            </div>
                        ) : (
                            <span className={styles.value}>{fullName || "Not set"}</span>
                        )}
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Email</span>
                        <span className={styles.value}>{user?.email}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Roll Number</span>
                        <span className={styles.value}>{profile?.roll || "Not assigned"}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Country Code</span>
                        <span className={styles.value}>{profile?.country || "Not set"}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Member Since</span>
                        <span className={styles.value}>
                            {user?.created_at
                                ? new Date(user.created_at).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                  })
                                : "N/A"}
                        </span>
                    </div>
                </div>
                <div className={styles.securityCard}>
                    <h2>Account Security</h2>
                    <button onClick={handleChangePassword} className={styles.passwordBtn}>
                        Change Password
                    </button>
                    <p className={styles.securityNote}>
                        We'll send a password reset link to your email.
                    </p>
                    <hr className={styles.divider} />
                    <h3 className={styles.dangerTitle}>Danger Zone</h3>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className={styles.deleteBtn}
                    >
                        Delete Account
                    </button>
                    <p className={styles.dangerNote}>
                        This action is permanent and cannot be undone.
                    </p>
                </div>
            </div>
            {showDeleteModal && (
                <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>⚠️ Delete Account</h2>
                        <p>
                            Are you sure you want to delete your account? This action is
                            <strong> permanent</strong> and all your data will be lost.
                        </p>
                        <p>
                            To confirm, please type your email address below:
                        </p>
                        <input
                            type="email"
                            value={confirmInput}
                            onChange={(e) => setConfirmInput(e.target.value)}
                            placeholder={user?.email}
                            className={styles.modalInput}
                        />
                        <div className={styles.modalActions}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className={styles.modalCancel}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleting || confirmInput !== user?.email}
                                className={styles.modalDelete}
                            >
                                {deleting ? "Deleting..." : "Permanently Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}