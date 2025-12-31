"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search, Settings, CreditCard, Monitor, LogOut, ChevronDown, Radio } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function TopNav() {
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // Logic State
    const [isLiveActive, setIsLiveActive] = useState(false);
    interface Notification { id: string; title: string; body: string; read: boolean; createdAt: { toDate: () => Date } | Date; }
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 1. Live Status Listener
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "app_settings", "global"), (doc) => {
            setIsLiveActive(doc.data()?.isLiveActive || false);
        });
        return () => unsub();
    }, []);

    // 2. Notifications Listener
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

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">

            {/* SEARCH */}
            <div className="flex-1 max-w-sm hidden md:block relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="ابحث عن درس أو موضوع..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pr-10 pl-4 text-sm text-slate-600 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-slate-100 transition-all"
                />
            </div>

            {/* ACTION AREA */}
            <div className="flex items-center gap-3 mr-auto">

                {/* LIVE INDICATOR — Subtle Professional Style */}
                {isLiveActive && (
                    <Link
                        href="/live"
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-medium">بث مباشر</span>
                    </Link>
                )}

                {/* NOTIFICATIONS */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsNotifOpen(!isNotifOpen); }}
                        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotifOpen && (
                        <div className="absolute left-0 mt-2 w-80 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
                            <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-700">الإشعارات</span>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                                        {unreadCount} جديد
                                    </span>
                                )}
                            </div>
                            <div className="max-h-72 overflow-y-auto custom-scrollbar">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <p className="text-sm font-medium text-slate-700 mb-0.5">{notif.title}</p>
                                            <p className="text-xs text-slate-500 line-clamp-2">{notif.body}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-sm">
                                        لا توجد إشعارات
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* PROFILE DROPDOWN */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                    >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm">
                            {user?.displayName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-700 leading-none">
                                {user?.displayName?.split(' ')[0] || "المستخدم"}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">BAC 2025</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Profile Menu */}
                    {isProfileOpen && (
                        <div className="absolute left-0 mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
                            <div className="p-1.5">
                                <Link
                                    href="/profile/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <Settings className="w-4 h-4 text-slate-400" />
                                    الإعدادات
                                </Link>
                                <Link
                                    href="/subscription"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <Monitor className="w-4 h-4 text-slate-400" />
                                    إدارة الأجهزة
                                </Link>
                                <Link
                                    href="/profile/payments"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <CreditCard className="w-4 h-4 text-slate-400" />
                                    سجل المدفوعات
                                </Link>

                                <div className="h-px bg-slate-100 my-1" />

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full p-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    تسجيل الخروج
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
