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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // If no user after loading
    if (!user) {
        return <>{children}</>;
    }

    // Authenticated user — Fluid layout with floating sidebar
    return (
        <div className="min-h-screen font-sans relative">
            {/* Mesh Gradient Background */}
            <div className="mesh-gradient" />

            {/* Floating Sidebar */}
            <Sidebar />

            {/* Top Navigation */}
            <TopNav />

            {/* Main Content — Fluid Layout */}
            <AnimatePresence mode="wait">
                <motion.main
                    key={pathname}
                    className="min-h-screen pt-20 pb-8 px-6 pr-24"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                    {children}
                </motion.main>
            </AnimatePresence>
        </div>
    );
}
