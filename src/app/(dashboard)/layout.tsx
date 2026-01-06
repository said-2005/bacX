"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { PageTransition } from "@/components/ui/PageTransition";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    // Mounted guard - ensures we only render after client is ready
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    // Auth redirect
    useEffect(() => {
        if (!loading && !user) {
            console.log("DashboardLayout: Redirecting to login...");
            router.replace("/login");
        }
    }, [loading, user, router]);

    // === LOADING STATE ===
    // Show centered loader while auth is checking
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // === REDIRECTING STATE ===
    // No user found, show redirecting message
    if (!user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#050505] text-white">
                Redirecting...
            </div>
        );
    }

    // === SSR SKELETON ===
    // Render a structural skeleton during SSR/initial hydration to prevent mismatch
    if (!isMounted) {
        return (
            <div className="flex h-screen w-full bg-[#050505] font-sans overflow-hidden text-white">
                {/* Sidebar Skeleton */}
                <aside className="hidden lg:block w-[280px] h-full shrink-0 relative z-[60]">
                    <div className="h-full w-full bg-white/[0.02] backdrop-blur-xl border-l border-white/10" />
                </aside>
                {/* Main Content Skeleton */}
                <div className="flex-1 flex flex-col h-full relative min-w-0">
                    <header className="h-16 w-full z-40 shrink-0 bg-white/[0.02] backdrop-blur-xl border-b border-white/10 sticky top-0" />
                    <div className="flex-1 overflow-y-auto">
                        <main className="w-full min-h-full p-6 lg:p-12 max-w-[1600px] mx-auto">
                            {/* Glassy skeleton placeholders */}
                            <div className="w-full h-48 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 animate-pulse" />
                        </main>
                    </div>
                </div>
            </div>
        );
    }

    // === MAIN LAYOUT ===
    return (
        <div className="flex h-screen w-full bg-[#050505] font-sans overflow-hidden text-white selection:bg-primary/30 pointer-events-auto">
            {/* Sidebar — Desktop Only */}
            <aside className="hidden lg:block w-[280px] h-full shrink-0 relative z-[70]">
                <div className="h-full w-full bg-white/[0.02] backdrop-blur-xl border-l border-white/10">
                    <Sidebar />
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full relative min-w-0">
                {/* Top Navigation */}
                <header className="h-16 w-full z-40 shrink-0 bg-white/[0.02] backdrop-blur-xl border-b border-white/10 sticky top-0 pointer-events-auto">
                    <TopNav />
                </header>

                {/* Page Content - Scrollable */}
                <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative pointer-events-auto">
                    <main className="w-full min-h-full p-6 lg:p-12 max-w-[1600px] mx-auto">
                        <BackButton />
                        <AnimatePresence mode="wait" initial={false}>
                            <PageTransition key={pathname}>
                                {children}
                            </PageTransition>
                        </AnimatePresence>
                    </main>
                </div>

                {/* Bottom Navigation — Mobile Only */}
                <div className="lg:hidden shrink-0 z-50 pointer-events-auto">
                    <BottomNav />
                </div>
            </div>
        </div>
    );
}
