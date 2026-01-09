"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

// ==============================================================================
// V15: THE HUD SNIPER - Emergency Freeze Diagnostics
// ==============================================================================
// Uses Shadow DOM to render DIRECTLY on screen, bypassing React entirely.
// Even if React is dying, the Big Red Box will still appear.
// ==============================================================================

interface DiagnosticResult {
    type: "FREEZE" | "SERVER_PARALYSIS" | "MIDDLEWARE_BLOCK" | "500_ERROR";
    file: string;
    func: string;
    line: number;
    fullPath: string;
    middlewarePassed: boolean;
    serverResponseMs?: number;
    stack: string;
    timestamp: number;
}

// Parse Error stack trace - extract first meaningful frame
function parseStackForCulprit(stack: string): { file: string; func: string; line: number; fullPath: string } {
    const lines = stack.split("\n");

    for (const line of lines) {
        // Skip internal frames
        if (line.includes("node_modules") ||
            line.includes("next/") ||
            line.includes("react-dom") ||
            line.includes("webpack") ||
            line.includes("NerveSniper") ||
            line.includes("HudSniper") ||
            line.includes("NERVE_STACK_CAPTURE")) {
            continue;
        }

        // Match: at FunctionName (file.tsx:123:45) or at file.tsx:123:45
        const match = line.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?/);
        if (match) {
            const [, func, fullPath, lineNum] = match;
            const fileName = fullPath.split("/").pop()?.split("\\").pop() || fullPath;

            return {
                file: fileName,
                func: func || "(anonymous)",
                line: parseInt(lineNum, 10),
                fullPath: fullPath,
            };
        }
    }

    return { file: "unknown", func: "unknown", line: 0, fullPath: "unknown" };
}

// ==============================================================================
// EMERGENCY HUD - Shadow DOM Injection (React-Independent)
// ==============================================================================

class EmergencyHUD {
    private container: HTMLDivElement | null = null;
    private shadowRoot: ShadowRoot | null = null;
    private hudContent: HTMLDivElement | null = null;

    constructor() {
        this.init();
    }

    private init() {
        if (typeof document === "undefined") return;

        // Create container with absolute highest z-index
        this.container = document.createElement("div");
        this.container.id = "nerve-hud-container";
        this.container.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 2147483647 !important;
            pointer-events: none !important;
            display: none !important;
        `;

        // Create Shadow DOM to isolate from page styles
        this.shadowRoot = this.container.attachShadow({ mode: "open" });

        // Inject styles into Shadow DOM
        const style = document.createElement("style");
        style.textContent = `
            @keyframes hudSlideIn {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes hudPulse {
                0%, 100% { box-shadow: 0 0 30px rgba(255, 0, 0, 0.8); }
                50% { box-shadow: 0 0 60px rgba(255, 0, 0, 1); }
            }
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.7; }
            }
            .hud-overlay {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #1a0000 0%, #330000 50%, #1a0000 100%);
                border: 3px solid #ff0000;
                border-radius: 16px;
                padding: 24px 32px;
                min-width: 500px;
                max-width: 90vw;
                pointer-events: auto;
                animation: hudSlideIn 0.3s ease-out, hudPulse 2s infinite;
                font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
                color: #ffffff;
            }
            .hud-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
                padding-bottom: 12px;
                border-bottom: 2px solid #ff0000;
            }
            .hud-icon {
                font-size: 32px;
                animation: blink 1s infinite;
            }
            .hud-title {
                font-size: 20px;
                font-weight: bold;
                color: #ff4444;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .hud-close {
                margin-left: auto;
                background: transparent;
                border: 1px solid #ff0000;
                color: #ff0000;
                padding: 4px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }
            .hud-close:hover {
                background: #ff0000;
                color: #000;
            }
            .hud-row {
                display: flex;
                align-items: baseline;
                margin-bottom: 12px;
                gap: 12px;
            }
            .hud-label {
                font-size: 16px;
                color: #888;
                min-width: 140px;
            }
            .hud-value {
                font-size: 24px;
                font-weight: bold;
                color: #ff6666;
                word-break: break-all;
            }
            .hud-value.line {
                color: #ffff00;
                font-size: 32px;
            }
            .hud-value.error-type {
                color: #ff0000;
            }
            .hud-actions {
                display: flex;
                gap: 12px;
                margin-top: 20px;
                padding-top: 12px;
                border-top: 1px solid #330000;
            }
            .hud-btn {
                flex: 1;
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
            }
            .hud-btn-copy {
                background: #0066ff;
                color: white;
            }
            .hud-btn-copy:hover {
                background: #0088ff;
            }
            .hud-btn-copy.copied {
                background: #00aa00;
            }
            .hud-btn-dismiss {
                background: #333;
                color: #888;
            }
            .hud-btn-dismiss:hover {
                background: #444;
                color: #fff;
            }
            .hud-stack {
                margin-top: 16px;
                padding: 12px;
                background: rgba(0,0,0,0.5);
                border-radius: 8px;
                font-size: 11px;
                color: #666;
                max-height: 100px;
                overflow: auto;
                white-space: pre-wrap;
            }
        `;
        this.shadowRoot.appendChild(style);

        // Create HUD content container
        this.hudContent = document.createElement("div");
        this.shadowRoot.appendChild(this.hudContent);

        // Append to body
        document.body.appendChild(this.container);

        console.log("[HUD] 🎯 Emergency HUD initialized (Shadow DOM)");
    }

    show(result: DiagnosticResult) {
        if (!this.container || !this.hudContent) {
            this.init();
        }

        const errorTypeLabel = {
            FREEZE: "🧊 NAVIGATION FREEZE",
            SERVER_PARALYSIS: "💀 SERVER PARALYSIS",
            MIDDLEWARE_BLOCK: "🚧 MIDDLEWARE BLOCK",
            "500_ERROR": "💥 500 SERVER ERROR",
        };

        const errorInfo = `
🔴 CULPRIT FILE: ${result.file}
📍 EXACT LINE: ${result.line}
📦 FUNCTION: ${result.func}
⚠️ ERROR TYPE: ${result.type}
🔗 FULL PATH: ${result.fullPath}
⏱️ TIMESTAMP: ${new Date(result.timestamp).toISOString()}

--- STACK TRACE ---
${result.stack}
        `.trim();

        this.hudContent!.innerHTML = `
            <div class="hud-overlay">
                <div class="hud-header">
                    <span class="hud-icon">🚨</span>
                    <span class="hud-title">${errorTypeLabel[result.type] || "ERROR DETECTED"}</span>
                    <button class="hud-close" id="hud-close">✕</button>
                </div>

                <div class="hud-row">
                    <span class="hud-label">🔴 CULPRIT FILE:</span>
                    <span class="hud-value">${result.file}</span>
                </div>

                <div class="hud-row">
                    <span class="hud-label">📍 EXACT LINE:</span>
                    <span class="hud-value line">${result.line}</span>
                </div>

                <div class="hud-row">
                    <span class="hud-label">📦 FUNCTION:</span>
                    <span class="hud-value">${result.func}</span>
                </div>

                <div class="hud-row">
                    <span class="hud-label">⚠️ ERROR TYPE:</span>
                    <span class="hud-value error-type">${result.type.replace("_", " ")}</span>
                </div>

                <div class="hud-actions">
                    <button class="hud-btn hud-btn-copy" id="hud-copy">📋 COPY ERROR FOR FIX</button>
                    <button class="hud-btn hud-btn-dismiss" id="hud-dismiss">Dismiss</button>
                </div>

                <div class="hud-stack">${result.stack.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            </div>
        `;

        // Show container
        this.container!.style.display = "block";

        // Bind events
        const closeBtn = this.shadowRoot?.getElementById("hud-close");
        const copyBtn = this.shadowRoot?.getElementById("hud-copy");
        const dismissBtn = this.shadowRoot?.getElementById("hud-dismiss");

        closeBtn?.addEventListener("click", () => this.hide());
        dismissBtn?.addEventListener("click", () => this.hide());

        copyBtn?.addEventListener("click", () => {
            navigator.clipboard.writeText(errorInfo).then(() => {
                if (copyBtn) {
                    copyBtn.textContent = "✅ COPIED!";
                    copyBtn.classList.add("copied");
                    setTimeout(() => {
                        copyBtn.textContent = "📋 COPY ERROR FOR FIX";
                        copyBtn.classList.remove("copied");
                    }, 2000);
                }
            });
        });

        console.log("[HUD] 🔴 EMERGENCY HUD DISPLAYED");
        console.log(`[HUD] STUCK AT FILE: ${result.file}`);
        console.log(`[HUD] STUCK AT FUNCTION: ${result.func}`);
        console.log(`[HUD] STUCK AT LINE: ${result.line}`);
    }

    hide() {
        if (this.container) {
            this.container.style.display = "none";
        }
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.shadowRoot = null;
        this.hudContent = null;
    }
}

// Global HUD instance
let globalHUD: EmergencyHUD | null = null;

function getHUD(): EmergencyHUD {
    if (!globalHUD) {
        globalHUD = new EmergencyHUD();
    }
    return globalHUD;
}

// Force show HUD even if React is broken
function forceShowHUD(result: DiagnosticResult) {
    try {
        getHUD().show(result);
    } catch (e) {
        // Last resort: basic alert
        console.error("[HUD] Shadow DOM failed, using alert fallback");
        alert(`🔴 FREEZE DETECTED!\n\nFile: ${result.file}\nLine: ${result.line}\nFunction: ${result.func}`);
    }
}

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================

export function NerveSniper() {
    const router = useRouter();
    const pathname = usePathname();

    const watchdogRef = useRef<NodeJS.Timeout | null>(null);
    const navigationTargetRef = useRef<string | null>(null);
    const navigationStartRef = useRef<number>(0);
    const stackCaptureRef = useRef<string>("");

    // Clear watchdog on pathname change (successful navigation)
    useEffect(() => {
        if (watchdogRef.current && navigationTargetRef.current) {
            console.log(`[HUD] ✓ Navigation completed to: ${pathname}`);
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
            console.log(`[HUD] Middleware passed: ${passed ? "YES" : "NO"}`);
            return passed;
        } catch {
            console.log(`[HUD] Middleware check failed`);
            return false;
        }
    }, []);

    // The intercepted push handler
    const interceptedPush = useCallback((href: string) => {
        const target = typeof href === "string" ? href : String(href);
        navigationTargetRef.current = target;
        navigationStartRef.current = performance.now();

        // Capture stack NOW before any async
        stackCaptureRef.current = new Error("HUD_STACK_CAPTURE").stack || "";

        console.log(`[HUD] 🎯 Watchdog started for: ${target}`);

        // Start 500ms watchdog
        watchdogRef.current = setTimeout(async () => {
            const elapsed = performance.now() - navigationStartRef.current;
            console.log(`[HUD] ⚠️ FREEZE DETECTED after ${elapsed.toFixed(0)}ms!`);

            // Parse stack for culprit
            const culprit = parseStackForCulprit(stackCaptureRef.current);

            // Check middleware and server in parallel
            const [middlewarePassed, serverResponse] = await Promise.all([
                checkMiddleware(target),
                serverPing(target),
            ]);

            // Determine error type
            let type: DiagnosticResult["type"] = "FREEZE";
            if (!middlewarePassed) {
                type = "MIDDLEWARE_BLOCK";
            } else if (!serverResponse.ok) {
                type = serverResponse.ms > 1000 ? "SERVER_PARALYSIS" : "500_ERROR";
            }

            const result: DiagnosticResult = {
                type,
                file: culprit.file,
                func: culprit.func,
                line: culprit.line,
                fullPath: culprit.fullPath,
                middlewarePassed,
                serverResponseMs: serverResponse.ms,
                stack: stackCaptureRef.current,
                timestamp: Date.now(),
            };

            // FORCE SHOW THE HUD (bypasses React)
            forceShowHUD(result);

        }, 500);

        // Call original router.push
        router.push(href);
    }, [router, checkMiddleware, serverPing]);

    // Install interceptor on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Initialize HUD
        getHUD();

        // Expose globals
        window.__NERVE_SNIPER_ACTIVE = true;
        window.__NERVE_INTERCEPT_PUSH = interceptedPush;
        window.__NERVE_STACK_CAPTURE = () => new Error("NERVE_CAPTURE").stack || "";

        console.log("[HUD] 🔫 V15 HUD Sniper ACTIVATED");
        console.log("[HUD] Use window.__NERVE_INTERCEPT_PUSH(path) to navigate with diagnostics");

        return () => {
            if (watchdogRef.current) {
                clearTimeout(watchdogRef.current);
            }
            window.__NERVE_SNIPER_ACTIVE = false;
        };
    }, [interceptedPush]);

    // This component renders nothing - HUD is injected via Shadow DOM
    return null;
}

export default NerveSniper;
