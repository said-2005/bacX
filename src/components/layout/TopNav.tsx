"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search, Settings, LogOut, ChevronDown, Radio } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function TopNav() {
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isLiveActive, setIsLiveActive] = useState(false);

    interface Notification {
        id: string;
        title: string;
        body: string;
        read: boolean;
        createdAt: { toDate: () => Date } | Date;
    }
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

    // Live Status Listener
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "app_settings", "global"), (doc) => {
            setIsLiveActive(doc.data()?.isLiveActive || false);
        });
        return () => unsub();
    }, []);

    // Notifications Listener
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
        <header className="h-14 px-6 flex items-center justify-between sticky top-0 z-40 bg-white border-b border-slate-200">

            {/* Search */}
            <div className="flex-1 max-w-sm hidden md:block relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="بحث..."
                    className="w-full bg-slate-50 border border-slate-200 rounded py-2 pr-10 pl-4 text-sm text-slate-600 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-300 transition-colors"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mr-auto">

                {/* Live Indicator */}
                {isLiveActive && (
                    <Link
                        href="/live"
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded border border-red-100 hover:bg-red-100 transition-colors text-xs font-medium"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        بث مباشر
                    </Link>
                )}

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded transition-colors"
                    >
                        <Bell className="w-4.5 h-4.5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute left-0 mt-1 w-80 bg-white border border-slate-200 rounded shadow-lg overflow-hidden z-50 animate-fade-in">
                            <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">الإشعارات</span>
                                {unreadCount > 0 && (
                                    <span className="status-chip status-info">{unreadCount} جديد</span>
                                )}
                            </div>
                            <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <p className="text-sm font-medium text-slate-700 mb-0.5">{notif.title}</p>
                                            <p className="text-xs text-slate-500 line-clamp-2">{notif.body}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-slate-400 text-xs">
                                        لا توجد إشعارات
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 transition-colors"
                    >
                        <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-xs">
                            {user?.displayName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-medium text-slate-700 leading-none">
                                {user?.displayName?.split(' ')[0] || "المستخدم"}
                            </p>
                        </div>
                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded shadow-lg overflow-hidden z-50 animate-fade-in">
                            <div className="p-1">
                                <Link
                                    href="/profile/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2 w-full p-2 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded transition-colors"
                                >
                                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                                    الإعدادات
                                </Link>

                                <div className="h-px bg-slate-100 my-1" />

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full p-2 text-xs text-red-500 hover:bg-red-50 rounded transition-colors"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
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
