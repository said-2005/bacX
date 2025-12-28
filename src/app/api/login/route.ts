import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import {
    checkRateLimitDistributed,
    loginRateLimiter,
    getClientIp,
    createRateLimitResponse
} from "@/lib/rate-limit";

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    } catch (e: any) {
        console.error("Firebase admin init error: ", e);
    }
}

export async function POST(request: Request) {
    // 1. RATE LIMITING - Prevent credential stuffing
    const clientIp = getClientIp(request);
    const rateLimitResult = await checkRateLimitDistributed(
        `login:${clientIp}`,
        loginRateLimiter,
        { maxRequests: 5, windowMs: 60000 } // 5 attempts per minute
    );

    if (!rateLimitResult.success) {
        console.warn(`[RATE LIMIT] Login blocked for IP: ${clientIp}`);
        return createRateLimitResponse(rateLimitResult);
    }

    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
        }

        // Set session expiration to 5 days
        const expiresIn = 60 * 60 * 24 * 5 * 1000;

        // Create the session cookie
        const sessionCookie = await admin
            .auth()
            .createSessionCookie(idToken, { expiresIn });

        const response = NextResponse.json({ success: true });

        // Set the cookie with secure options
        response.cookies.set("bacx_session", sessionCookie, {
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict",
        });

        return response;
    } catch (error: any) {
        console.error("Login API Error:", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
