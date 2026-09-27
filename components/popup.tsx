"use client";

import { useState, useEffect } from "react";
import styles from "../app/style/popup.module.css";

export default function Popup({ message, onClose }: { message: string; onClose: () => void }) {
    message = message || "Please Do Not Leave the Timer, else it will stop. If you want to leave, please pause the timer first.";
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [message]);

    const handleClose = () => {
        setVisible(false);
        onClose();
    };

    if (!visible) return null;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <p>{message}</p>
                <button onClick={handleClose}>Close</button>
            </div>
        </div>
    );
}