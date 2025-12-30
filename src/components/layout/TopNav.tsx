"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search, Settings, CreditCard, Monitor, LogOut, ChevronDown, Radio } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation"; // Correct import for App Router

export function TopNav() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // Logic State
    const [isLiveActive, setIsLiveActive] = useState(false);
    interface Notification { id: string; title: string; body: string; read: boolean; createdAt: { toDate: () => Date } | Date; }
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLButtonElement>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                // Keep open if clicking inside the dropdown menu itself (handled by standard DOM bubbling usually, but explicit check good)
                // For simplified structure, we'll just toggle state on button click and rely on that.
                // Actually, for dropdown logic, usually separate ref for menu. 
                // Simplified: close if click is not on the button.
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
        router.push("/auth");
    };

    return (
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-blue-100/50 shadow-sm direction-rtl font-tajawal">

            {/* SEARCH */}
            <div className="flex-1 max-w-md hidden md:block relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="ابحث عن درس..."
                    className="w-full bg-slate-100/50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-sm outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
            </div>

            {/* ACTION AREA */}
            <div className="flex items-center gap-4 mr-auto">

                {/* LIVE INDICATOR */}
                {isLiveActive && (
                    <Link href="/live" className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-600 rounded-full border border-red-500/20 hover:bg-red-500/20 transition-all animate-pulse">
                        <Radio className="w-4 h-4 animate-ping" />
                        <span className="text-xs font-bold">بث مباشر الآن</span>
                    </Link>
                )}

                {/* NOTIFICATIONS */}
                <div className="relative">
                    <button
                        ref={notifRef}
                        onClick={(e) => { e.stopPropagation(); setIsNotifOpen(!isNotifOpen); }}
                        className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 left-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-bounce"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotifOpen && (
                        <div onClick={(e) => e.stopPropagation()} className="absolute left-0 mt-4 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                <span className="font-bold text-slate-800 text-sm">الإشعارات</span>
                                {unreadCount > 0 && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{unreadCount} جديد</span>}
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                                            <p className="text-sm font-medium text-slate-800 mb-1">{notif.title}</p>
                                            <p className="text-xs text-slate-500 line-clamp-2">{notif.body}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-sm">لا توجد إشعارات حالياً</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* PROFILE DROPDOWN */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-2 pr-2 py-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                    >
                        <div className="text-left hidden sm:block">
                            <p className="text-sm font-bold text-slate-800 leading-none mb-1">{user?.displayName || "Student"}</p>
                            <p className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded-full inline-block">BAC 2025</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shadow-sm">
                            {user?.displayName?.[0]?.toUpperCase() || "S"}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Profile Menu */}
                    {isProfileOpen && (
                        <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="p-2 space-y-1">
                                <Link
                                    href="/profile/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                >
                                    <Settings className="w-4 h-4" /> الإعدادات الشخصية
                                </Link>
                                <Link
                                    href="/subscription"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                >
                                    <Monitor className="w-4 h-4" /> إدارة الأجهزة
                                </Link>
                                <Link
                                    href="/profile/payments"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                >
                                    <CreditCard className="w-4 h-4" /> سجل المدفوعات
                                </Link>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full p-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-4 h-4" /> تسجيل الخروج
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
