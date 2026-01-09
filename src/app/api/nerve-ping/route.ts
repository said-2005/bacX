import { NextRequest, NextResponse } from "next/server";

// ==============================================================================
// V14: NERVE SNIPER - Server-Side Heartbeat API
// ==============================================================================
// Pings a target page to check if server-side rendering is working.
// Returns response time or timeout status.
// ==============================================================================

export async function GET(request: NextRequest) {
    const target = request.nextUrl.searchParams.get("target");

    if (!target) {
        return NextResponse.json({ error: "Missing target parameter" }, { status: 400 });
    }

    const start = performance.now();

    try {
        // Build full URL from target path
        const baseUrl = request.nextUrl.origin;
        const fullUrl = target.startsWith("http") ? target : `${baseUrl}${target}`;

        // Create AbortController for 1s timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1000);

        const response = await fetch(fullUrl, {
            method: "GET",
            headers: {
                "x-nerve-ping": "true",
                // Pass along cookies for auth
                cookie: request.headers.get("cookie") || "",
            },
            signal: controller.signal,
        });

        clearTimeout(timeout);
        const elapsed = Math.round(performance.now() - start);

        console.log(`[NERVE-PING] ${target} responded in ${elapsed}ms (status: ${response.status})`);

        return NextResponse.json({
            ok: response.ok,
            status: response.status,
            ms: elapsed,
            target,
        });
    } catch (error) {
        const elapsed = Math.round(performance.now() - start);
        const isTimeout = error instanceof Error && error.name === "AbortError";

        console.log(`[NERVE-PING] ${target} FAILED after ${elapsed}ms (timeout: ${isTimeout})`);

        return NextResponse.json({
            ok: false,
            status: isTimeout ? 504 : 500,
            ms: elapsed,
            target,
            error: isTimeout ? "TIMEOUT" : "SERVER_ERROR",
        });
    }
}
