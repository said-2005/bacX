"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Clock, Calendar, Bell, Radio, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import { differenceInDays, differenceInHours, differenceInMinutes, format } from "date-fns";
import { ar } from "date-fns/locale";
import { collection, query, orderBy, limit, onSnapshot, doc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Animation variants
const fadeSlide = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const stagger = {
    visible: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

// =============================================================================
// FLUID DASHBOARD
// =============================================================================
export default function DashboardPage() {
    return (
        <>
            {/* Animated Mesh Gradient Background */}
            <div className="mesh-gradient" />

            <motion.div
                className="max-w-4xl mx-auto space-y-8"
                initial="hidden"
                animate="visible"
                variants={stagger}
            >
                {/* PILLAR 1: Poetic Hero */}
                <motion.div variants={fadeSlide}>
                    <PoetryHero />
                </motion.div>

                {/* PILLAR 2: Floating Countdown Pill */}
                <motion.div variants={fadeSlide} className="flex justify-center">
                    <CountdownPill />
                </motion.div>

                {/* PILLAR 3: Fluid Timeline Program */}
                <motion.div variants={fadeSlide}>
                    <FluidProgram />
                </motion.div>

                {/* PILLAR 4: Card-less Feed */}
                <motion.div variants={fadeSlide}>
                    <FluidNewsroom />
                </motion.div>
            </motion.div>
        </>
    );
}

// =============================================================================
// PILLAR 1: POETRY HERO with Mesh Background
// =============================================================================
function PoetryHero() {
    return (
        <motion.div
            className="poetry-hero"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <Sparkles className="w-6 h-6 text-blue-400 mx-auto mb-4 opacity-50" />
            <p className="poetry-text">
                العِلمُ يَرفَعُ بَيْتاً لا عِمادَ لَهُ<br />
                والجَهلُ يَهدِمُ بَيْتَ العِزِّ والشَّرَفِ
            </p>
            <p className="poetry-author">— الإمام علي بن أبي طالب</p>
        </motion.div>
    );
}

// =============================================================================
// PILLAR 2: FLOATING COUNTDOWN PILL
// =============================================================================
function CountdownPill() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
    const bacDate = new Date("2025-06-01T08:00:00");

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setTimeLeft({
                days: Math.max(0, differenceInDays(bacDate, now)),
                hours: Math.max(0, differenceInHours(bacDate, now) % 24),
                minutes: Math.max(0, differenceInMinutes(bacDate, now) % 60)
            });
        };
        tick();
        const interval = setInterval(tick, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            className="countdown-pill"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <div className="countdown-segment">
                <div className="countdown-value">{timeLeft.days}</div>
                <div className="countdown-label">يوم</div>
            </div>
            <span className="countdown-separator">:</span>
            <div className="countdown-segment">
                <div className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="countdown-label">ساعة</div>
            </div>
            <span className="countdown-separator">:</span>
            <div className="countdown-segment">
                <div className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="countdown-label">دقيقة</div>
            </div>
        </motion.div>
    );
}

// =============================================================================
// PILLAR 3: FLUID TIMELINE PROGRAM
// =============================================================================
const weeklySchedule = [
    { day: "الأحد", time: "17:00", subject: "الرياضيات", topic: "الدوال العددية" },
    { day: "الإثنين", time: "17:00", subject: "الفيزياء", topic: "التحولات النووية" },
    { day: "الثلاثاء", time: "18:00", subject: "العلوم", topic: "التركيب الضوئي" },
    { day: "الأربعاء", time: "17:00", subject: "الرياضيات", topic: "الأعداد المركبة" },
    { day: "الخميس", time: "17:00", subject: "الفيزياء", topic: "الظواهر الكهربائية" },
];

function FluidProgram() {
    return (
        <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">البرنامج الأسبوعي</h2>
                    <p className="text-sm text-slate-400">جدول الحصص والمراجعات</p>
                </div>
            </div>

            <div className="timeline-container">
                <div className="timeline-line" />

                {weeklySchedule.map((item, index) => (
                    <motion.div
                        key={index}
                        className="timeline-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                    >
                        <div className="timeline-dot" />
                        <motion.div
                            className="glass-pill py-3 px-5 mr-4 hover-swell"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-mono text-slate-400 w-12">{item.time}</span>
                                    <span className="text-xs text-slate-400">{item.day}</span>
                                </div>
                                <div className="flex-1">
                                    <span className="font-medium text-slate-700">{item.subject}</span>
                                    <span className="text-slate-400 mx-2">—</span>
                                    <span className="text-sm text-slate-500">{item.topic}</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// =============================================================================
// PILLAR 4: CARD-LESS NEWSROOM FEED
// =============================================================================
interface Announcement {
    id: string;
    content: string;
    createdAt: { toDate: () => Date };
    priority?: 'high' | 'medium' | 'info';
}

interface LiveSession {
    id: string;
    title: string;
    date: { toDate: () => Date };
}

function FluidNewsroom() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [lives, setLives] = useState<LiveSession[]>([]);
    const [isLiveNow, setIsLiveNow] = useState(false);

    useEffect(() => {
        const announcementsQuery = query(
            collection(db, "announcements"),
            orderBy("createdAt", "desc"),
            limit(4)
        );
        const unsubAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
            setAnnouncements(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
        });

        const livesQuery = query(
            collection(db, "lives"),
            where("date", ">=", new Date()),
            orderBy("date", "asc"),
            limit(3)
        );
        const unsubLives = onSnapshot(livesQuery, (snapshot) => {
            setLives(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LiveSession)));
        });

        const unsubLiveStatus = onSnapshot(doc(db, "app_settings", "global"), (doc) => {
            setIsLiveNow(doc.data()?.isLiveActive || false);
        });

        return () => {
            unsubAnnouncements();
            unsubLives();
            unsubLiveStatus();
        };
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Announcements — Card-less */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-amber-500" />
                    </div>
                    <h3 className="font-semibold text-slate-700">الإعلانات</h3>
                </div>

                <div className="space-y-0">
                    {announcements.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">لا توجد إعلانات</p>
                    ) : (
                        announcements.map((ann, i) => (
                            <motion.div
                                key={ann.id}
                                className="feed-item"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <p className="text-sm text-slate-600 leading-relaxed">{ann.content}</p>
                                <span className="text-xs text-slate-400 font-mono mt-2 block">
                                    {ann.createdAt?.toDate
                                        ? format(ann.createdAt.toDate(), "d MMM، HH:mm", { locale: ar })
                                        : "الآن"
                                    }
                                </span>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Lives — Floating Pills */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                            <Radio className="w-4 h-4 text-red-500" />
                        </div>
                        <h3 className="font-semibold text-slate-700">الحصص المباشرة</h3>
                    </div>
                    {isLiveNow && (
                        <Link href="/live" className="glass-pill px-4 py-1.5 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse-soft" />
                            <span className="text-xs font-medium text-red-500">مباشر الآن</span>
                        </Link>
                    )}
                </div>

                <div className="space-y-3">
                    {lives.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">لا توجد حصص مجدولة</p>
                    ) : (
                        lives.map((live, i) => (
                            <motion.div
                                key={live.id}
                                className="glass-pill p-4 flex items-center justify-between hover-swell"
                                whileHover={{ scale: 1.02 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, type: "spring" }}
                            >
                                <div>
                                    <p className="text-sm font-medium text-slate-700">{live.title}</p>
                                    <p className="text-xs text-slate-400 font-mono mt-1">
                                        {live.date?.toDate
                                            ? format(live.date.toDate(), "EEEE، HH:mm", { locale: ar })
                                            : "قريباً"
                                        }
                                    </p>
                                </div>
                                <Link href="/live" className="btn-fluid btn-glass text-xs py-2 px-4">
                                    <ExternalLink className="w-3 h-3" />
                                    انضمام
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
