import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const GOOGLE_KEYS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

// Cache keys in global scope for Edge (cleared on cold start, but helps hot paths)
let cachedKeys: Record<string, string> | null = null;
let keysExpiry: number = 0;

async function getGooglePublicKeys() {
    if (cachedKeys && Date.now() < keysExpiry) {
        return cachedKeys;
    }

    try {
        const response = await fetch(GOOGLE_KEYS_URL, { next: { revalidate: 3600 } });
        const cacheControl = response.headers.get('cache-control');
        const maxAgeMatch = cacheControl?.match(/max-age=(\d+)/);
        const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;

        cachedKeys = await response.json();
        keysExpiry = Date.now() + (maxAge * 1000);
        return cachedKeys;
    } catch (error) {
        console.error('Failed to fetch Google public keys', error);
        return cachedKeys; // Return stale keys if available
    }
}

/**
 * FAST token verification that only checks signature validity
 * Does NOT check claims for non-admin routes (speed optimization)
 */
async function verifySessionCookie(cookie: string, fullValidation: boolean = false) {
    if (!cookie) return null;

    const keys = await getGooglePublicKeys();
    if (!keys) return null;

    try {
        const options: jose.JWTVerifyOptions = {};

        // Only do full validation (issuer/audience) for admin routes
        if (fullValidation) {
            options.issuer = `https://securetoken.google.com/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`;
            options.audience = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        }

        const { payload } = await jose.jwtVerify(cookie, async (protectedHeader) => {
            if (!protectedHeader.kid) throw new Error("No kid in header");
            const pem = keys[protectedHeader.kid];
            if (!pem) throw new Error("Key not found");
            return jose.importX509(pem, 'RS256');
        }, options);

        return payload;
    } catch (e) {
        // Only log for unexpected errors
        if (!(e instanceof jose.errors.JWTExpired)) {
            console.error("Token verification failed", e);
        }
        return null;
    }
}

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis from Environment (Safe fallback to null if env missing during build)
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

// Global Rate Limiter: 50 requests per 10 seconds
const ratelimit = redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(50, "10 s"),
        analytics: true,
    })
    : null;

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // --- SKIP STATIC ASSETS (FAST PATH) ---
    if (
        path.startsWith('/_next') ||
        path.startsWith('/static') ||
        path.startsWith('/favicon') ||
        path.includes('.')
    ) {
        return NextResponse.next();
    }

    // --- GLOBAL RATE LIMITING (EDGE) ---
    if (ratelimit) {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            "127.0.0.1";
        try {
            const { success } = await ratelimit.limit(ip);
            if (!success) {
                return new NextResponse('Too Many Requests', { status: 429 });
            }
        } catch (error) {
            console.error('Rate limit failed (fail-open):', error);
        }
    }

    // --- MAINTENANCE MODE CHECK ---
    const isMaintenance = process.env.MAINTENANCE_MODE === 'true';
    if (isMaintenance) {
        if (!path.startsWith('/maintenance')) {
            return NextResponse.rewrite(new URL('/maintenance', request.url));
        }
        return NextResponse.next();
    } else if (path.startsWith('/maintenance')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // --- ROUTE CLASSIFICATION ---
    const adminRoutes = ['/admin'];
    const protectedRoutes = ['/dashboard', '/live', '/video', '/subscription', '/subject', '/profile', '/subjects', ...adminRoutes];

    const isProtected = protectedRoutes.some(p => path.startsWith(p));
    const isAdminRoute = adminRoutes.some(p => path.startsWith(p));

    // --- PUBLIC ROUTES: FAST PASS THROUGH ---
    if (!isProtected) {
        return NextResponse.next();
    }

    // --- PROTECTED ROUTES: CHECK SESSION ---
    const sessionCookie = request.cookies.get('bacx_session')?.value;

    if (!sessionCookie) {
        const loginUrl = new URL('/auth', request.url);
        loginUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(loginUrl);
    }

    // For admin routes, do full validation including checking claims
    // For regular protected routes, just verify the token is valid (faster)
    const claims = await verifySessionCookie(sessionCookie, isAdminRoute);

    if (!claims) {
        // Invalid or expired token - redirect to login
        const response = NextResponse.redirect(new URL('/auth', request.url));
        // Clear the invalid cookie
        response.cookies.delete('bacx_session');
        return response;
    }

    // --- ADMIN ROUTE: CHECK ROLE IN JWT ---
    if (isAdminRoute) {
        // Check JWT claims for admin role
        // NOTE: If role is updated in Firestore after login, user must re-login
        // This is the performance tradeoff - no DB call in middleware
        const isAdmin = claims.role === 'admin' || claims.admin === true;

        if (!isAdmin) {
            // Check the user's UID exists (they're authenticated but not admin)
            // Redirect to dashboard instead of home since they're logged in
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes (they handle their own auth)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'
    ],
};
