"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

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
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex">
                <div className="flex-1 p-6 mr-56">
                    {children}
                </div>
            </div>
        );
    }

    // If no user after loading completes, don't render the shell
    if (!user) {
        return <>{children}</>;
    }

    // Authenticated user - render full shell (clean, no ambient effects)
    return (
        <div className="min-h-screen bg-white flex">
            <Sidebar />
            <div className="flex-1 flex flex-col mr-56">
                <TopNav />
                <main className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                    {children}
                </main>
            </div>
        </div>
    );
}
