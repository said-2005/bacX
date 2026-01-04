
import { NextResponse } from "next/server";
import { admin } from "@/lib/firebase-admin";
import {
    checkRateLimitDistributed,
    loginRateLimiter,
    getClientIp,
    createRateLimitResponse
} from "@/lib/rate-limit";

export async function POST(request: Request) {
    // 1. RATE LIMITING
    const clientIp = getClientIp(request);
    const rateLimitResult = await checkRateLimitDistributed(
        `login:${clientIp}`,
        loginRateLimiter,
        { maxRequests: 5, windowMs: 60000 }
    );

    if (!rateLimitResult.success) {
        return createRateLimitResponse(rateLimitResult);
    }

    try {
        const body = await request.json() as { idToken?: string };
        const { idToken } = body;

        if (!idToken) {
            return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
        }

        // 5 Days expiration
        const expiresIn = 60 * 60 * 24 * 5 * 1000;

        const sessionCookie = await admin
            .auth()
            .createSessionCookie(idToken, { expiresIn });

        const response = NextResponse.json({ success: true });

        response.cookies.set("bacx_session", sessionCookie, {
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "lax",
        });

        return response;
    } catch (error) {
        console.error("Login API Error:", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
