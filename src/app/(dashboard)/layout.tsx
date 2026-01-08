import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

// ============================================================================
// DASHBOARD LAYOUT v2 - SUSPENSE EVERYWHERE
// ============================================================================
// FIX: Wrap ALL client components with Suspense to prevent blocking
// ============================================================================

// Loading skeleton for sidebar
function SidebarSkeleton() {
    return (
        <div className="w-full h-full flex flex-col animate-pulse">
            <div className="h-24 flex items-center justify-center border-b border-white/5 mx-6">
                <div className="h-12 w-32 bg-white/10 rounded" />
            </div>
            <div className="flex-1 py-8 px-4 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-white/5 rounded-xl" />
                ))}
            </div>
        </div>
    );
}

// Loading skeleton for topnav
function TopNavSkeleton() {
    return (
        <div className="w-full h-full flex items-center justify-between px-8 animate-pulse">
            <div className="h-6 w-32 bg-white/10 rounded" />
            <div className="h-10 w-10 bg-white/10 rounded-full" />
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans" dir="rtl">
            {/* Sidebar - Desktop - WRAPPED IN SUSPENSE */}
            <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 right-0 z-40 border-l border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
                <Suspense fallback={<SidebarSkeleton />}>
                    <Sidebar />
                </Suspense>
            </aside>

            {/* Main */}
            <div className="lg:mr-72 min-h-screen">
                <header className="sticky top-0 z-30 h-20 border-b border-white/5 bg-[#050505]/90 backdrop-blur-xl">
                    <Suspense fallback={<TopNavSkeleton />}>
                        <TopNav />
                    </Suspense>
                </header>

                <main className="p-6 lg:p-10">
                    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
                        {children}
                    </Suspense>
                </main>
            </div>

            <Suspense fallback={null}>
                <BottomNav />
            </Suspense>
        </div>
    );
}

