"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Routes that should NOT have the dashboard layout
    const isPublicRoute = pathname === '/' || pathname === '/auth' || pathname.startsWith('/maintenance');

    if (isPublicRoute) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[#050505] flex font-vazirmatn text-[#EDEDED] relative overflow-hidden">
            {/* Ambient Background Mesh (Global for AppShell) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full opacity-50" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full opacity-50" />
            </div>

            <Sidebar />

            <div className="flex-1 flex flex-col mr-64 relative z-10">
                <TopNav />
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
