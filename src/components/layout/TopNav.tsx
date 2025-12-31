"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search, LogOut, Radio } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

export function TopNav() {
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLiveActive, setIsLiveActive] = useState(false);

    interface Notification {
        id: string;
        title: string;
        body: string;
        read: boolean;
    }
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const profileRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Live Status
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "app_settings", "global"), (doc) => {
            setIsLiveActive(doc.data()?.isLiveActive || false);
        });
        return () => unsub();
    }, []);

    // Notifications
    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "notifications"),
            where("userId", "in", [user.uid, "global"]),
            orderBy("createdAt", "desc"),
            limit(10)
        );
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
            setNotifications(data);
            setUnreadCount(data.filter((n) => !n.read).length);
        });
        return () => unsub();
    }, [user]);

    return (
        <motion.header
            className="fixed top-4 left-4 right-24 z-40"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
            <div className="glass-card py-3 px-6 flex items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ابحث عن درس..."
                        className="w-full bg-white/50 backdrop-blur-sm rounded-full py-2.5 pr-10 pl-4 text-sm text-slate-600 placeholder:text-slate-400 outline-none border border-white/50 focus:border-blue-300 focus:bg-white transition-all"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* Live Indicator */}
                    {isLiveActive && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <Link
                                href="/live"
                                className="glass-pill px-4 py-2 flex items-center gap-2 text-red-500"
                            >
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse-soft" />
                                <span className="text-xs font-medium">مباشر</span>
                            </Link>
                        </motion.div>
                    )}

                    {/* Notifications */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative p-2.5 rounded-full bg-white/50 hover:bg-white text-slate-500 transition-colors"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </motion.button>

                    {/* Profile */}
                    <div className="relative" ref={profileRef}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 py-2 px-3 rounded-full bg-white/50 hover:bg-white transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                                {user?.displayName?.[0]?.toUpperCase() || "U"}
                            </div>
                            <span className="text-sm font-medium text-slate-700 hidden sm:block">
                                {user?.displayName?.split(' ')[0] || "المستخدم"}
                            </span>
                        </motion.button>

                        {/* Dropdown */}
                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="absolute left-0 mt-2 w-48 glass-card p-2 overflow-hidden"
                                >
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-2 p-3 text-sm text-slate-600 hover:bg-white/80 rounded-xl transition-colors"
                                    >
                                        الملف الشخصي
                                    </Link>
                                    <Link
                                        href="/subscription"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-2 p-3 text-sm text-slate-600 hover:bg-white/80 rounded-xl transition-colors"
                                    >
                                        الاشتراك
                                    </Link>
                                    <div className="h-px bg-slate-100 my-1" />
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 w-full p-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        تسجيل الخروج
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
