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
