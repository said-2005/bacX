"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// ==============================================================================
// V14: THE NERVE SNIPER - Precision Freeze Debugger
// ==============================================================================
// Captures EXACT file, function, and line number when navigation hangs.
// ==============================================================================

interface StackFrame {
    file: string;
    func: string;
    line: number;
    col: number;
}

interface DiagnosticResult {
    type: "FREEZE" | "SERVER_PARALYSIS" | "MIDDLEWARE_BLOCK";
    file: string;
    func: string;
    line: number;
    middlewarePassed: boolean;
    serverResponseMs?: number;
    stack: StackFrame[];
    timestamp: number;
}

// Parse Error stack trace into structured frames
function parseStack(stack: string): StackFrame[] {
    const frames: StackFrame[] = [];
    const lines = stack.split("\n");

    for (const line of lines) {
        // Match patterns like: at FunctionName (file.tsx:123:45)
        // or: at file.tsx:123:45
        const match = line.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?/);
        if (match) {
            const [, func, file, lineNum, col] = match;
            // Extract just the filename from the path
            const fileName = file.split("/").pop()?.split("\\").pop() || file;

            // Skip internal Next.js/React frames
            if (fileName.includes("node_modules") ||
                fileName.includes("next/") ||
                fileName.includes("react-dom") ||
                fileName.startsWith("webpack")) {
                continue;
            }

            frames.push({
                file: fileName,
                func: func || "(anonymous)",
                line: parseInt(lineNum, 10),
                col: parseInt(col, 10),
            });
        }
    }

    return frames;
}

// The Verdict Pop-up Component
function VerdictPopup({ result, onDismiss }: { result: DiagnosticResult; onDismiss: () => void }) {
    const typeLabel = {
        FREEZE: "🎯 NAVIGATION FREEZE DETECTED",
        SERVER_PARALYSIS: "💀 SERVER-SIDE PARALYSIS",
        MIDDLEWARE_BLOCK: "🚧 MIDDLEWARE BLOCK",
    };

    const typeColor = {
        FREEZE: "#FF6B6B",
        SERVER_PARALYSIS: "#9B59B6",
        MIDDLEWARE_BLOCK: "#F39C12",
    };

    return (
        <div
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                zIndex: 99999,
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                border: `2px solid ${typeColor[result.type]}`,
                borderRadius: "12px",
                padding: "16px 20px",
                minWidth: "380px",
                maxWidth: "450px",
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${typeColor[result.type]}40`,
                fontFamily: "monospace",
                color: "#fff",
                animation: "slideIn 0.3s ease-out",
            }}
        >
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `}</style>

            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                paddingBottom: "8px",
                borderBottom: `1px solid ${typeColor[result.type]}50`,
            }}>
                <span style={{
                    color: typeColor[result.type],
                    fontWeight: "bold",
                    fontSize: "13px",
                    animation: "pulse 2s infinite",
                }}>
                    {typeLabel[result.type]}
                </span>
                <button
                    onClick={onDismiss}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "#888",
                        cursor: "pointer",
                        fontSize: "18px",
                        padding: "0 4px",
                    }}
                >
                    ×
                </button>
            </div>

            {/* The Verdict */}
            <div style={{
                background: "#0f0f1a",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "12px",
            }}>
                <div style={{ color: "#4ECDC4", fontSize: "11px", marginBottom: "4px" }}>
                    🔍 FOUND IT! THE CULPRIT IS:
                </div>
                <div style={{
                    color: "#FF6B6B",
                    fontSize: "14px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                }}>
                    Line {result.line} in {result.file}
                </div>
                <div style={{ color: "#888", fontSize: "11px" }}>
                    Function: <span style={{ color: "#F39C12" }}>{result.func}</span>
                </div>
            </div>

            {/* Diagnostic Details */}
            <div style={{ fontSize: "11px", color: "#888" }}>
                <div style={{ marginBottom: "4px" }}>
                    Middleware: {" "}
                    <span style={{ color: result.middlewarePassed ? "#2ECC71" : "#E74C3C" }}>
                        {result.middlewarePassed ? "✓ PASSED" : "✗ BLOCKED"}
                    </span>
                </div>
                {result.serverResponseMs !== undefined && (
                    <div style={{ marginBottom: "4px" }}>
                        Server Response: {" "}
                        <span style={{
                            color: result.serverResponseMs > 1000 ? "#E74C3C" : "#2ECC71"
                        }}>
                            {result.serverResponseMs > 1000 ? "TIMEOUT" : `${result.serverResponseMs}ms`}
                        </span>
                    </div>
                )}
            </div>

            {/* Stack Preview */}
            {result.stack.length > 0 && (
                <details style={{ marginTop: "8px" }}>
                    <summary style={{
                        cursor: "pointer",
                        color: "#666",
                        fontSize: "10px",
                        outline: "none",
                    }}>
                        Full Stack Trace ({result.stack.length} frames)
                    </summary>
                    <div style={{
                        marginTop: "8px",
                        maxHeight: "120px",
                        overflow: "auto",
                        fontSize: "10px",
                        color: "#555",
                    }}>
                        {result.stack.map((frame, i) => (
                            <div key={i} style={{ marginBottom: "2px" }}>
                                {frame.func} → {frame.file}:{frame.line}
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
}

export function NerveSniper() {
    const router = useRouter();
    const pathname = usePathname();
    const [verdict, setVerdict] = useState<DiagnosticResult | null>(null);

    const watchdogRef = useRef<NodeJS.Timeout | null>(null);
    const navigationTargetRef = useRef<string | null>(null);
    const navigationStartRef = useRef<number>(0);
    const stackCaptureRef = useRef<string>("");

    // Clear watchdog on pathname change (successful navigation)
    useEffect(() => {
        if (watchdogRef.current && navigationTargetRef.current) {
            console.log(`[NERVE] ✓ Navigation completed to: ${pathname}`);
            clearTimeout(watchdogRef.current);
            watchdogRef.current = null;
            navigationTargetRef.current = null;
        }
    }, [pathname]);

    // Server-side heartbeat ping
    const serverPing = useCallback(async (target: string): Promise<{ ok: boolean; ms: number }> => {
        const start = performance.now();
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1000);

            const res = await fetch(`/api/nerve-ping?target=${encodeURIComponent(target)}`, {
                signal: controller.signal,
            });

            clearTimeout(timeout);
            const ms = Math.round(performance.now() - start);
            return { ok: res.ok, ms };
        } catch {
            return { ok: false, ms: Math.round(performance.now() - start) };
        }
    }, []);

    // Check middleware status
    const checkMiddleware = useCallback(async (target: string): Promise<boolean> => {
        try {
            const res = await fetch(target, { method: "HEAD" });
            const trace = res.headers.get("x-middleware-trace");
            const passed = trace !== null;
            console.log(`[NERVE] Middleware passed: ${passed ? "YES" : "NO"}`);
            return passed;
        } catch {
            console.log(`[NERVE] Middleware check failed`);
            return false;
        }
    }, []);

    // The Stack Tracer - intercepts router.push
    const interceptedPush = useCallback((href: string) => {
        const target = typeof href === "string" ? href : String(href);
        navigationTargetRef.current = target;
        navigationStartRef.current = performance.now();

        // Capture stack NOW before async operations
        stackCaptureRef.current = new Error("NERVE_STACK_CAPTURE").stack || "";

        console.log(`[NERVE] 🎯 Watchdog started for: ${target}`);
        console.log(`[NERVE] Checking middleware status...`);

        // Start the watchdog timer (500ms)
        watchdogRef.current = setTimeout(async () => {
            const elapsed = performance.now() - navigationStartRef.current;
            console.log(`[NERVE] ⚠️ FREEZE DETECTED after ${elapsed.toFixed(0)}ms!`);

            // Parse the captured stack
            const frames = parseStack(stackCaptureRef.current);
            const culprit = frames[0] || { file: "unknown", func: "unknown", line: 0, col: 0 };

            // Check middleware and server
            const middlewarePassed = await checkMiddleware(target);
            const serverResponse = await serverPing(target);

            // Determine type
            let type: DiagnosticResult["type"] = "FREEZE";
            if (!middlewarePassed) {
                type = "MIDDLEWARE_BLOCK";
            } else if (!serverResponse.ok || serverResponse.ms > 1000) {
                type = "SERVER_PARALYSIS";
            }

            const result: DiagnosticResult = {
                type,
                file: culprit.file,
                func: culprit.func,
                line: culprit.line,
                middlewarePassed,
                serverResponseMs: serverResponse.ms,
                stack: frames,
                timestamp: Date.now(),
            };

            console.log(`[NERVE] 🔴 VERDICT:`, result);
            console.log(`[NERVE] STUCK AT FILE: ${result.file}`);
            console.log(`[NERVE] STUCK AT FUNCTION: ${result.func}`);
            console.log(`[NERVE] STUCK AT LINE: ${result.line}`);

            setVerdict(result);
        }, 500);

        // Call original router.push
        router.push(href);
    }, [router, checkMiddleware, serverPing]);

    // Install interceptor on mount
    useEffect(() => {
        // Expose to window for global access
        if (typeof window !== "undefined") {
            window.__NERVE_SNIPER_ACTIVE = true;
            window.__NERVE_INTERCEPT_PUSH = interceptedPush;
            window.__NERVE_STACK_CAPTURE = () => new Error("NERVE_CAPTURE").stack || "";

            console.log("[NERVE] 🔫 V14 Nerve Sniper ACTIVATED");
            console.log("[NERVE] Use window.__NERVE_INTERCEPT_PUSH(path) to navigate with diagnostics");
        }

        return () => {
            if (watchdogRef.current) {
                clearTimeout(watchdogRef.current);
            }
            if (typeof window !== "undefined") {
                window.__NERVE_SNIPER_ACTIVE = false;
            }
        };
    }, [interceptedPush]);

    // Render verdict popup if we have one
    if (verdict) {
        return <VerdictPopup result={verdict} onDismiss={() => setVerdict(null)} />;
    }

    return null;
}

export default NerveSniper;
