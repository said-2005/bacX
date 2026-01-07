import { Suspense } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

/**
 * DASHBOARD LAYOUT - Pure Server Component
 * 
 * ARCHITECTURE RULES:
 * 1. NO "use client" - This is a server component shell
 * 2. NO useAuth, useEffect, useState - No client-side blocking
 * 3. NO if (loading) guards - Children always render immediately
 * 4. Auth protection handled by middleware.ts
 * 5. Individual pages fetch their own data if needed
 * 
 * This layout is a STATIC SHELL that never re-renders on navigation.
 * Sidebar, TopNav, BottomNav are isolated Client Component islands.
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans" dir="rtl">
            {/* ═══════════════════════════════════════════════════════════════
                SIDEBAR - Desktop Only, Fixed Position
                Client Component Island - isolated from layout re-renders
            ═══════════════════════════════════════════════════════════════ */}
            <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 right-0 z-40 border-l border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
                <Sidebar />
            </aside>

            {/* ═══════════════════════════════════════════════════════════════
                MAIN CONTENT AREA - Offset by sidebar width on desktop
            ═══════════════════════════════════════════════════════════════ */}
            <div className="lg:mr-72 min-h-screen flex flex-col">
                {/* Top Navigation - Sticky header */}
                <header className="sticky top-0 z-30 h-20 border-b border-white/5 bg-[#050505]/90 backdrop-blur-xl">
                    <TopNav />
                </header>

                {/* Page Content - Suspense boundary for streaming */}
                <main className="flex-1 p-6 lg:p-10">
                    <Suspense fallback={<DashboardSkeleton />}>
                        {children}
                    </Suspense>
                </main>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                BOTTOM NAV - Mobile Only, Fixed Position
            ═══════════════════════════════════════════════════════════════ */}
            <BottomNav />
        </div>
    );
}

/**
 * Minimal loading skeleton - inline to avoid import overhead
 */
function DashboardSkeleton() {
    return (
        <div className="w-full h-[calc(100vh-10rem)] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
