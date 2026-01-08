"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * DIAGNOSTIC OVERLAY v11 - NUCLEAR BIOPSY
 * - Force hard reload button
 * - Re-render stress test
 * - Provider lock-in check
 * - Context collapse detection
 */

interface TimerResult {
    label: string;
    duration: number;
    timestamp: number;
}

interface RenderCount {
    component: string;
    count: number;
    windowStart: number;
}

interface DiagnosticState {
    authState: "LOADING" | "AUTHENTICATED" | "NULL";
    routerStatus: "IDLE" | "NAVIGATING";
    pathname: string;
    renderCount: number;
    timers: TimerResult[];
    totalWaitTime: number | null;
    waitStartTime: number | null;
    criticalAlert: boolean;
    culpritFile: string | null;
    culpritReason: string | null;
    targetRoute: string | null;
    renderCounts: RenderCount[];
    infiniteLoopDetected: string | null;
    contextCollapse: string | null;
    authContextValue: string;
}

const STORAGE_KEY = 'diag_probe_v11';

// Global event bus
declare global {
    interface Window {
        __DIAG_NAV_START?: (target: string) => void;
        __DIAG_CHECKPOINT?: (phase: string, source?: string) => void;
        __DIAG_FETCH_TIME?: (ms: number) => void;
        __DIAG_PROFILE?: (name: string, time: number, phase: string) => void;
        __DIAG_RENDER?: (component: string) => void;
        __originalFetch?: typeof fetch;
    }
}

// ============================================================================
// MAIN DIAGNOSTIC OVERLAY
// ============================================================================
export function DiagnosticOverlay() {
    const pathname = usePathname();
    const segments = useSelectedLayoutSegments();
    const { user, loading, profile } = useAuth();

    const [state, setState] = useState<DiagnosticState>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    return {
                        ...parsed,
                        routerStatus: "IDLE",
                        waitStartTime: null,
                        renderCounts: [],
                        infiniteLoopDetected: null,
                        contextCollapse: null,
                    };
                }
            } catch (e) { }
        }
        return {
            authState: "LOADING",
            routerStatus: "IDLE",
            pathname: "",
            renderCount: 0,
            timers: [],
            totalWaitTime: null,
            waitStartTime: null,
            criticalAlert: false,
            culpritFile: null,
            culpritReason: null,
            targetRoute: null,
            renderCounts: [],
            infiniteLoopDetected: null,
            contextCollapse: null,
            authContextValue: "unknown",
        };
    });

    const waitStartRef = useRef<number | null>(null);
    const navigationTarget = useRef<string | null>(null);
    const renderCountsRef = useRef<Map<string, { count: number; windowStart: number }>>(new Map());

    // =========================================================================
    // SAVE TO LOCALSTORAGE
    // =========================================================================
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    timers: state.timers,
                    totalWaitTime: state.totalWaitTime,
                    criticalAlert: state.criticalAlert,
                    culpritFile: state.culpritFile,
                    culpritReason: state.culpritReason,
                    pathname: state.pathname,
                    infiniteLoopDetected: state.infiniteLoopDetected,
                }));
            } catch (e) { }
        }
    }, [state.timers, state.totalWaitTime, state.criticalAlert, state.culpritFile, state.culpritReason, state.pathname, state.infiniteLoopDetected]);

    // =========================================================================
    // AUTH CONTEXT MONITORING
    // =========================================================================
    useEffect(() => {
        let authState: DiagnosticState["authState"] = "NULL";
        if (loading) authState = "LOADING";
        else if (user) authState = "AUTHENTICATED";

        // Check for context collapse
        const authContextValue = `user:${user ? 'Y' : 'N'} loading:${loading} profile:${profile ? 'Y' : 'N'}`;

        // Detect if auth becomes undefined during navigation
        let contextCollapse: string | null = null;
        if (state.routerStatus === "NAVIGATING") {
            if (user === undefined) {
                contextCollapse = "AUTH_USER_UNDEFINED";
            }
        }

        setState(prev => ({
            ...prev,
            authState,
            authContextValue,
            contextCollapse,
            pathname,
            renderCount: prev.renderCount + 1,
        }));
    }, [user, loading, profile, pathname, state.routerStatus]);

    // =========================================================================
    // RENDER COUNT MONITOR
    // =========================================================================
    const handleRender = useCallback((component: string) => {
        const now = Date.now();
        const entry = renderCountsRef.current.get(component);

        if (entry && now - entry.windowStart < 1000) {
            entry.count++;
            if (entry.count > 10) {
                setState(prev => ({
                    ...prev,
                    infiniteLoopDetected: component,
                    culpritReason: `${component} rendered ${entry.count} times in 1 second - INFINITE_RENDER_LOOP`,
                }));
            }
        } else {
            renderCountsRef.current.set(component, { count: 1, windowStart: now });
        }
    }, []);

    // =========================================================================
    // TIMER LISTENER
    // =========================================================================
    useEffect(() => {
        const handleTimer = (e: CustomEvent<{ label: string; duration: number }>) => {
            const { label, duration } = e.detail;
            setState(prev => {
                const existing = prev.timers.findIndex(t => t.label === label);
                const newTimer: TimerResult = { label, duration, timestamp: Date.now() };

                let newTimers: TimerResult[];
                if (existing >= 0) {
                    newTimers = [...prev.timers];
                    newTimers[existing] = newTimer;
                } else {
                    newTimers = [...prev.timers, newTimer].slice(-12);
                }

                return { ...prev, timers: newTimers };
            });
        };

        window.addEventListener('diag-timer', handleTimer as EventListener);
        return () => window.removeEventListener('diag-timer', handleTimer as EventListener);
    }, []);

    // =========================================================================
    // NAVIGATION START
    // =========================================================================
    const handleNavStart = useCallback((target: string) => {
        const now = Date.now();
        waitStartRef.current = now;
        navigationTarget.current = target;
        renderCountsRef.current.clear();

        setState(prev => ({
            ...prev,
            routerStatus: "NAVIGATING",
            waitStartTime: now,
            totalWaitTime: null,
            criticalAlert: false,
            culpritFile: null,
            culpritReason: null,
            targetRoute: target,
            infiniteLoopDetected: null,
            contextCollapse: null,
        }));
    }, []);

    useEffect(() => {
        window.__DIAG_NAV_START = handleNavStart;
        window.__DIAG_RENDER = handleRender;
        return () => {
            delete window.__DIAG_NAV_START;
            delete window.__DIAG_RENDER;
        };
    }, [handleNavStart, handleRender]);

    // =========================================================================
    // NAVIGATION END
    // =========================================================================
    useEffect(() => {
        if (waitStartRef.current && navigationTarget.current) {
            const totalWait = Date.now() - waitStartRef.current;
            const isCritical = totalWait > 3000;

            let culpritReason = state.culpritReason;
            if (isCritical && !culpritReason) {
                culpritReason = "CLIENT_ROUTER_DEADLOCK - Try Force Hard Reload button";
            }

            setState(prev => ({
                ...prev,
                routerStatus: "IDLE",
                totalWaitTime: totalWait,
                criticalAlert: isCritical,
                culpritReason,
                timers: [
                    ...prev.timers.filter(t => t.label !== 'TOTAL_WAIT_TIME'),
                    { label: 'TOTAL_WAIT_TIME', duration: totalWait, timestamp: Date.now() }
                ],
            }));

            waitStartRef.current = null;
            navigationTarget.current = null;
        }
    }, [pathname, state.culpritReason]);

    // =========================================================================
    // LIVE ELAPSED
    // =========================================================================
    const [liveElapsed, setLiveElapsed] = useState(0);
    useEffect(() => {
        if (state.routerStatus !== "NAVIGATING" || !state.waitStartTime) return;
        const interval = setInterval(() => {
            setLiveElapsed(Date.now() - state.waitStartTime!);
        }, 100);
        return () => clearInterval(interval);
    }, [state.routerStatus, state.waitStartTime]);

    // =========================================================================
    // FORCE HARD RELOAD
    // =========================================================================
    const forceHardReload = () => {
        const target = state.targetRoute || '/dashboard';
        console.log(`[FORCE] Hard reload to: ${target}`);
        window.location.href = target;
    };

    // =========================================================================
    // CLEAR
    // =========================================================================
    const clearTimers = () => {
        setState(prev => ({
            ...prev,
            timers: [],
            totalWaitTime: null,
            criticalAlert: false,
            culpritFile: null,
            culpritReason: null,
            infiniteLoopDetected: null,
            contextCollapse: null,
        }));
        localStorage.removeItem(STORAGE_KEY);
    };

    // =========================================================================
    // COLORS
    // =========================================================================
    const getColor = (duration: number) => {
        if (duration > 100) return { bg: "bg-red-500/30", text: "text-red-400", flash: true };
        if (duration > 50) return { bg: "bg-yellow-500/30", text: "text-yellow-400", flash: false };
        return { bg: "bg-green-500/20", text: "text-green-400", flash: false };
    };

    // =========================================================================
    // RENDER
    // =========================================================================
    const isNavigating = state.routerStatus === "NAVIGATING";
    const bgColor = state.criticalAlert
        ? "bg-red-900 border-red-500"
        : isNavigating && liveElapsed > 3000
            ? "bg-red-900 border-red-500 animate-pulse"
            : "bg-black border-white/30";

    return (
        <div className={`fixed bottom-4 left-4 z-[9999] ${bgColor} border-2 rounded-lg p-4 font-mono text-xs shadow-2xl min-w-[380px] max-h-[600px] overflow-y-auto`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
                <span className="text-white font-bold text-sm">☢️ NUCLEAR BIOPSY v11</span>
                {isNavigating && (
                    <span className={`font-bold ${liveElapsed > 3000 ? 'text-red-400 animate-pulse text-lg' : liveElapsed > 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {(liveElapsed / 1000).toFixed(1)}s
                    </span>
                )}
            </div>

            {/* FORCE HARD RELOAD BUTTON */}
            {(state.criticalAlert || (isNavigating && liveElapsed > 2000)) && (
                <button
                    onClick={forceHardReload}
                    className="w-full mb-3 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg text-sm animate-pulse"
                >
                    ⚠️ FORCE HARD RELOAD → {state.targetRoute || '/dashboard'}
                </button>
            )}

            {/* VERDICT DISPLAY */}
            {state.criticalAlert && state.culpritReason && (
                <div className="mb-3 p-3 bg-red-500/40 border-2 border-red-500 rounded-lg">
                    <div className="text-red-300 text-[10px] uppercase tracking-wider mb-1">🎯 VERDICT:</div>
                    <div className="text-white font-bold text-sm">
                        {state.culpritReason}
                    </div>
                    {state.infiniteLoopDetected && (
                        <div className="text-orange-400 text-[10px] mt-1">
                            ⚠️ INFINITE_RENDER_LOOP: {state.infiniteLoopDetected}
                        </div>
                    )}
                    {state.contextCollapse && (
                        <div className="text-purple-400 text-[10px] mt-1">
                            ⚠️ CONTEXT_COLLAPSE: {state.contextCollapse}
                        </div>
                    )}
                </div>
            )}

            {/* TOTAL WAIT TIME */}
            {state.totalWaitTime !== null && (
                <div className={`mb-3 p-3 rounded-lg text-center ${state.totalWaitTime > 3000 ? 'bg-red-500/50' : state.totalWaitTime > 1000 ? 'bg-yellow-500/30' : 'bg-green-500/20'}`}>
                    <div className="text-white/60 text-[10px] uppercase tracking-wider">TOTAL WAIT TIME</div>
                    <div className={`text-2xl font-bold ${state.totalWaitTime > 3000 ? 'text-red-400' : state.totalWaitTime > 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {(state.totalWaitTime / 1000).toFixed(2)}s
                    </div>
                </div>
            )}

            {/* Context Status */}
            <div className="mb-3 p-2 bg-white/5 rounded text-[10px]">
                <div className="text-white/40 mb-1">CONTEXT STATUS:</div>
                <div className="text-cyan-400 font-mono">{state.authContextValue}</div>
            </div>

            {/* Timer Results */}
            <div className="space-y-1 mb-3">
                <div className="text-white/50 text-[10px] uppercase tracking-wider mb-1">TIMING:</div>
                {state.timers.length === 0 ? (
                    <div className="text-white/30 text-center py-2">Click a link...</div>
                ) : (
                    state.timers.sort((a, b) => b.duration - a.duration).slice(0, 6).map((timer) => {
                        const color = getColor(timer.duration);
                        return (
                            <div
                                key={timer.label}
                                className={`flex items-center justify-between px-2 py-1 rounded ${color.bg} ${color.flash ? 'animate-pulse' : ''}`}
                            >
                                <span className="text-white/80 text-[10px]">{timer.label}</span>
                                <span className={`font-bold ${color.text}`}>
                                    {timer.duration.toFixed(0)}ms
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Clear Button */}
            <button
                onClick={clearTimers}
                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded text-white/70 hover:text-white transition-colors text-[10px] uppercase tracking-wider"
            >
                Reset
            </button>

            {/* Footer */}
            <div className="mt-2 pt-2 border-t border-white/10 text-[9px] text-white/30">
                v11 | 💾 Persisted
            </div>
        </div>
    );
}
