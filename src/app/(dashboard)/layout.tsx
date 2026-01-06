"use client";

import { useEffect, useState, useRef } from "react";
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

    // CRITICAL: Track if redirect has been initiated to prevent loop
    const hasRedirected = useRef(false);

    // Mounted guard - ensures we only render after client is ready
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);

        // CACHE-BUSTING: Handle stale chunk errors (404 for .js chunks)
        const handleError = (event: ErrorEvent) => {
            if (event.message && event.message.includes('ChunkLoadError')) {
                console.warn('🔄 Stale chunk detected, forcing hard reload...');
                // Clear service worker cache and reload
                if ('caches' in window) {
                    caches.keys().then(names => {
                        names.forEach(name => caches.delete(name));
                    });
                }
                window.location.reload();
            }
        };

        window.addEventListener('error', handleError);

        // DOM FORENSICS: Detect any fixed full-screen elements that could block clicks
        if (process.env.NODE_ENV === 'development') {
            const detectBlockingElements = () => {
                const allElements = document.querySelectorAll('*');
                allElements.forEach((el) => {
                    const style = window.getComputedStyle(el);
                    const isFixed = style.position === 'fixed';
                    const isAbsolute = style.position === 'absolute';
                    const isFullWidth = el.clientWidth >= window.innerWidth * 0.9;
                    const isFullHeight = el.clientHeight >= window.innerHeight * 0.9;
                    const hasNoPointerEvents = style.pointerEvents === 'none';

                    if ((isFixed || isAbsolute) && isFullWidth && isFullHeight && !hasNoPointerEvents) {
                        console.warn('🚨 DOM FORENSICS: Potential click blocker detected!', {
                            element: el,
                            className: el.className,
                            id: el.id,
                            tagName: el.tagName,
                            zIndex: style.zIndex,
                            pointerEvents: style.pointerEvents,
                            opacity: style.opacity,
                        });
                    }
                });
            };
            // Run after a short delay to let DOM settle
            setTimeout(detectBlockingElements, 1000);
        }

        return () => {
            window.removeEventListener('error', handleError);
        };
    }, []);

    // Auth redirect - with loop prevention
    useEffect(() => {
        // Only redirect once, when loading is complete and user is null
        if (!loading && !user && !hasRedirected.current) {
            hasRedirected.current = true;
            console.log("DashboardLayout: Redirecting to login...");
            // Use setTimeout to break out of React's render cycle
            setTimeout(() => {
                router.replace("/login");
            }, 0);
        }

        // Reset redirect flag if user becomes available (e.g., after login)
        if (user) {
            hasRedirected.current = false;
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
