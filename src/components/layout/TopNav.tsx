"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search, LogOut, Radio, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

// Breadcrumb mapping
const routeLabels: Record<string, string> = {
    "dashboard": "لوحة التحكم",
    "subjects": "المواد الدراسية",
    "subject": "المادة",
    "subscription": "الاشتراك",
    "profile": "الحساب",
    "video": "الدرس",
    "live": "البث المباشر",
    "admin": "الإدارة",
    "search": "البحث",
};

export function TopNav() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
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

    // Generate breadcrumbs from pathname
    const generateBreadcrumbs = () => {
        const segments = pathname.split('/').filter(Boolean);
        const crumbs: { label: string; href: string }[] = [
            { label: "الرئيسية", href: "/" }
        ];

        let currentPath = "";
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const label = routeLabels[segment] || segment;
            if (index < segments.length - 1) {
                crumbs.push({ label, href: currentPath });
            } else {
                crumbs.push({ label, href: "" }); // Current page, no link
            }
        });

        return crumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

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
        <header className="topnav-notion">
            {/* Breadcrumbs */}
            <nav className="breadcrumb">
                {breadcrumbs.map((crumb, index) => (
                    <span key={index} className="flex items-center">
                        {index > 0 && <span className="breadcrumb-separator">/</span>}
                        {crumb.href ? (
                            <Link href={crumb.href} className="breadcrumb-link">
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="breadcrumb-current">{crumb.label}</span>
                        )}
                    </span>
                ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <Link
                    href="/search"
                    className="btn-notion btn-ghost"
                >
                    <Search className="w-4 h-4" />
                </Link>

                {/* Live Indicator */}
                {isLiveActive && (
                    <Link href="/live" className="flex items-center gap-1.5 px-2 py-1 text-red-500 text-xs font-medium">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        مباشر
                    </Link>
                )}

                {/* Notifications */}
                <button className="btn-notion btn-ghost relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                </button>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="btn-notion btn-ghost flex items-center gap-2"
                    >
                        <div className="w-6 h-6 rounded bg-[var(--foreground)] text-white flex items-center justify-center text-xs font-medium">
                            {user?.displayName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <ChevronDown className="w-3 h-3" />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 mt-2 w-48 bg-white border border-[var(--border)] rounded-lg shadow-[var(--shadow-dropdown)] overflow-hidden z-50"
                            >
                                <div className="p-3 border-b border-[var(--border)]">
                                    <p className="text-sm font-medium text-[var(--foreground)]">
                                        {user?.displayName || "المستخدم"}
                                    </p>
                                    <p className="text-xs text-[var(--foreground-tertiary)] truncate">
                                        {user?.email}
                                    </p>
                                </div>
                                <div className="p-1">
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="block px-3 py-2 text-sm text-[var(--foreground-secondary)] hover:bg-[var(--background-hover)] rounded transition-colors"
                                    >
                                        الملف الشخصي
                                    </Link>
                                    <Link
                                        href="/subscription"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="block px-3 py-2 text-sm text-[var(--foreground-secondary)] hover:bg-[var(--background-hover)] rounded transition-colors"
                                    >
                                        الاشتراك
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        تسجيل الخروج
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
