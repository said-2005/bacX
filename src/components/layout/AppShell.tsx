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
        <div className="min-h-screen bg-background flex font-sans text-foreground relative overflow-hidden">
            {/* Ambient Background Mesh (Subtle for Light Mode) */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full mix-blend-multiply" />
            </div>

            <Sidebar />

            <div className="flex-1 flex flex-col mr-64 relative z-10 transition-all duration-300">
                <TopNav />
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
