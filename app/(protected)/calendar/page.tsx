"use client";

import { useState } from "react";
import "../../style/calendar.css";
import CustomCursor from "@/app/cursor";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface Event {
    id: string;
    text: string;
    type: "exam" | "plan" | "other";
}

export default function CalendarPage() {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [events, setEvents] = useState<Record<string, Event[]>>({});
    const [newEventText, setNewEventText] = useState("");
    const [newEventType, setNewEventType] = useState<Event["type"]>("plan");
    const [showAISuggestion, setShowAISuggestion] = useState(false);

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((prev) => prev - 1);
        } else {
            setCurrentMonth((prev) => prev - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((prev) => prev + 1);
        } else {
            setCurrentMonth((prev) => prev + 1);
        }
    };

    const dateKey = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const isToday = (day: number) =>
        today.getDate() === day &&
        today.getMonth() === currentMonth &&
        today.getFullYear() === currentYear;

    const handleDateClick = (day: number) => {
        setSelectedDate(new Date(currentYear, currentMonth, day));
        setShowAISuggestion(false);
    };

    const addEvent = () => {
        if (!selectedDate || !newEventText.trim()) return;
        const key = dateKey(selectedDate);
        const newEvent: Event = {
            id: Date.now().toString(),
            text: newEventText.trim(),
            type: newEventType,
        };
        setEvents((prev) => ({
            ...prev,
            [key]: [...(prev[key] || []), newEvent],
        }));
        setNewEventText("");
    };

    const removeEvent = (eventId: string) => {
        if (!selectedDate) return;
        const key = dateKey(selectedDate);
        setEvents((prev) => ({
            ...prev,
            [key]: (prev[key] || []).filter((e) => e.id !== eventId),
        }));
    };

    const handleAIRequest = () => {
        setShowAISuggestion(true);
    };

    const selectedKey = selectedDate ? dateKey(selectedDate) : null;
    const selectedEvents = selectedKey ? events[selectedKey] || [] : [];

    return (
        <div className="calendar-page">
            <CustomCursor />
            <div className="calendar-layout">
                <div className="calendar-card">
                    <div className="calendar-header">
                        <button onClick={prevMonth} className="month-nav">‹</button>
                        <h2>{MONTHS[currentMonth]} {currentYear}</h2>
                        <button onClick={nextMonth} className="month-nav">›</button>
                    </div>

                    <div className="calendar-grid">
                        {DAYS.map((d) => (
                            <div key={d} className="day-label">{d}</div>
                        ))}
                        {Array.from({ length: startDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="day-cell empty" />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                            const date = new Date(currentYear, currentMonth, day);
                            const key = dateKey(date);
                            const dayEvents = events[key] || [];
                            const isSelected =
                                selectedDate?.getDate() === day &&
                                selectedDate?.getMonth() === currentMonth &&
                                selectedDate?.getFullYear() === currentYear;
                            return (
                                <div
                                    key={day}
                                    className={`day-cell ${isToday(day) ? "today" : ""} ${
                                        isSelected ? "selected" : ""
                                    }`}
                                    onClick={() => handleDateClick(day)}
                                >
                                    <span className="day-number">{day}</span>
                                    {dayEvents.length > 0 && (
                                        <div className="event-dots">
                                        {dayEvents.slice(0, 3).map((ev, idx) => (
                                            <span
                                                key={idx}
                                                className={`dot ${ev.type}`}
                                            />
                                        ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        </div>
                    </div>
                <div className="side-panel">
                    {selectedDate ? (
                        <>
                            <h3>
                                {selectedDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                                })}
                            </h3>
                            <div className="add-event-form">
                                <input
                                type="text"
                                placeholder="Add exam / plan..."
                                value={newEventText}
                                onChange={(e) => setNewEventText(e.target.value)}
                                className="event-input"
                                />
                                <select
                                value={newEventType}
                                onChange={(e) => setNewEventType(e.target.value as Event["type"])}
                                className="type-select"
                                >
                                    <option value="exam">📝 Exam</option>
                                    <option value="plan">📅 Plan</option>
                                    <option value="other">📌 Other</option>
                                </select>
                                <button onClick={addEvent} className="add-btn">+ Add</button>
                            </div>

                            <div className="events-list">
                                {selectedEvents.length === 0 ? (
                                    <p className="no-events">No events yet</p>
                                ) : (
                                    selectedEvents.map((ev) => (
                                        <div key={ev.id} className={`event-item ${ev.type}`}>
                                            <span>{ev.text}</span>
                                            <button onClick={() => removeEvent(ev.id)} className="remove-btn">×</button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button onClick={handleAIRequest} className="ai-btn">
                                🤖 Ask AI to plan my study
                            </button>
                            {showAISuggestion && (
                                <div className="ai-suggestion">
                                    <p>🧠 AI Suggestion:</p>
                                    <p>Based on your exams, start reviewing "Math" on 10th and dedicate 2 hours/day.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="select-prompt">Select a date to view or add events</div>
                    )}
                </div>
            </div>
        </div>
    );
}