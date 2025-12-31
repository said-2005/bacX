"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { motion, AnimatePresence } from "framer-motion";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useAuth();

    // Routes that should NOT have the dashboard layout
    const publicRoutes = ['/', '/auth', '/maintenance'];
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // Don't render shell for public routes
    if (isPublicRoute) {
        return <>{children}</>;
    }

    // During auth loading
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // If no user after loading
    if (!user) {
        return <>{children}</>;
    }

    // Authenticated user — Notion-style layout
    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Sidebar — Right side (RTL) */}
            <Sidebar />

            {/* Top Navigation with Breadcrumbs */}
            <TopNav />

            {/* Main Content */}
            <AnimatePresence mode="wait">
                <motion.main
                    key={pathname}
                    className="min-h-screen pt-12 pr-[240px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {children}
                </motion.main>
            </AnimatePresence>
        </div>
    );
}
