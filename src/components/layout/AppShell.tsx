"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { memo } from "react";

// Memoize background mesh to prevent re-renders
const AmbientBackground = memo(function AmbientBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full mix-blend-multiply" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full mix-blend-multiply" />
        </div>
    );
});

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useAuth();

    // Routes that should NOT have the dashboard layout (public pages)
    const publicRoutes = ['/', '/auth', '/maintenance'];
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // Don't render shell for public routes
    if (isPublicRoute) {
        return <>{children}</>;
    }

    // During auth loading, show minimal layout to prevent flash
    // The AuthContext already shows a loading spinner, so just render children
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex font-sans text-foreground">
                <div className="flex-1 p-8 mr-64">
                    {children}
                </div>
            </div>
        );
    }

    // If no user after loading completes, don't render the shell
    // (middleware will redirect, but this prevents flash)
    if (!user) {
        return <>{children}</>;
    }

    // Authenticated user - render full shell
    return (
        <div className="min-h-screen bg-background flex font-sans text-foreground relative overflow-hidden">
            <AmbientBackground />
            <Sidebar />
            <div className="flex-1 flex flex-col mr-60 relative z-10 transition-all duration-200">
                <TopNav />
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
