"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * DIAGNOSTIC OVERLAY
 * Displays real-time state for debugging navigation freezes.
 * Shows: Auth State, Router Status, Last Navigation, Pathname
 */

interface DiagnosticState {
    authState: "LOADING" | "AUTHENTICATED" | "NULL";
    routerStatus: "IDLE" | "NAVIGATING";
    lastNavClick: string | null;
    lastNavTarget: string | null;
    pathname: string;
    renderCount: number;
}

// Global event bus for router status
declare global {
    interface Window {
        __DIAG_NAV_START?: (target: string) => void;
        __DIAG_NAV_END?: () => void;
    }
}

export function DiagnosticOverlay() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [state, setState] = useState<DiagnosticState>({
        authState: "LOADING",
        routerStatus: "IDLE",
        lastNavClick: null,
        lastNavTarget: null,
        pathname: "",
        renderCount: 0,
    });

    // Update auth state
    useEffect(() => {
        let authState: DiagnosticState["authState"] = "NULL";
        if (loading) authState = "LOADING";
        else if (user) authState = "AUTHENTICATED";

        setState(prev => ({
            ...prev,
            authState,
            pathname,
            renderCount: prev.renderCount + 1,
        }));
    }, [user, loading, pathname]);

    // Navigation event handlers
    const handleNavStart = useCallback((target: string) => {
        setState(prev => ({
            ...prev,
            routerStatus: "NAVIGATING",
            lastNavClick: new Date().toISOString().slice(11, 23),
            lastNavTarget: target,
        }));
    }, []);

    const handleNavEnd = useCallback(() => {
        setState(prev => ({
            ...prev,
            routerStatus: "IDLE",
        }));
    }, []);

    // Register global handlers
    useEffect(() => {
        window.__DIAG_NAV_START = handleNavStart;
        window.__DIAG_NAV_END = handleNavEnd;
        return () => {
            delete window.__DIAG_NAV_START;
            delete window.__DIAG_NAV_END;
        };
    }, [handleNavStart, handleNavEnd]);

    // Auto-reset to IDLE when pathname changes (navigation completed)
    useEffect(() => {
        setState(prev => ({
            ...prev,
            routerStatus: "IDLE",
        }));
    }, [pathname]);

    const getColor = (status: string) => {
        switch (status) {
            case "AUTHENTICATED":
            case "IDLE":
                return "text-green-400";
            case "LOADING":
            case "NAVIGATING":
                return "text-yellow-400";
            case "NULL":
                return "text-red-400";
            default:
                return "text-white";
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/90 border border-white/20 rounded-lg p-3 font-mono text-xs space-y-1 shadow-2xl min-w-[280px]">
            <div className="text-white/50 font-bold border-b border-white/10 pb-1 mb-2">
                🔬 DIAGNOSTIC PROBE
            </div>

            <div className="flex justify-between">
                <span className="text-white/60">AUTH_STATE:</span>
                <span className={getColor(state.authState)}>{state.authState}</span>
            </div>

            <div className="flex justify-between">
                <span className="text-white/60">ROUTER_STATUS:</span>
                <span className={getColor(state.routerStatus)}>
                    {state.routerStatus}
                    {state.routerStatus === "NAVIGATING" && (
                        <span className="animate-pulse ml-1">●</span>
                    )}
                </span>
            </div>

            <div className="flex justify-between">
                <span className="text-white/60">PATHNAME:</span>
                <span className="text-blue-400 truncate max-w-[150px]">{state.pathname}</span>
            </div>

            {state.lastNavClick && (
                <>
                    <div className="border-t border-white/10 pt-1 mt-1" />
                    <div className="flex justify-between">
                        <span className="text-white/60">LAST_CLICK:</span>
                        <span className="text-orange-400">{state.lastNavClick}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">TARGET:</span>
                        <span className="text-purple-400 truncate max-w-[150px]">{state.lastNavTarget}</span>
                    </div>
                </>
            )}

            <div className="border-t border-white/10 pt-1 mt-1">
                <div className="flex justify-between">
                    <span className="text-white/60">RENDERS:</span>
                    <span className="text-white/40">{state.renderCount}</span>
                </div>
            </div>
        </div>
    );
}
