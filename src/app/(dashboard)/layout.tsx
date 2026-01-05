"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BackButton } from "@/components/ui/BackButton";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            console.log("DashboardLayout: Redirecting to login...");
            router.replace("/login");
        }
    }, [loading, user, router]);

    // STRICT GUARD: Do not attempt to render AppShell or Sidebar until we are SURE we have a user.
    // This prevents hydration mismatches and null pointer exceptions in child components.
    if (loading) {
        console.log("DashboardLayout: Rendering guard triggered - loading state is true");
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user) {
        console.log("DashboardLayout: Rendering guard triggered - no user, showing redirect message");
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#050505] text-white">
                Redirecting...
            </div>
        );
    }

    return (
        <AppShell>
            <BackButton />
            {children}
        </AppShell>
    );
}
