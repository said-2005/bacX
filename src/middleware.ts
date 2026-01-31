import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis & Ratelimit
// NOTE: Fails gracefully if env vars are missing (returns success)
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null

// GLOBAL LIMITER: 20 requests per 10 seconds (Sliding Window)
// Allows navigation but blocks spam/botting.
const ratelimit = redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(20, "10 s"),
        analytics: true,
        prefix: "@upstash/ratelimit",
    })
    : null

export async function middleware(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1"
    const path = request.nextUrl.pathname

    // 1. MAINTENANCE MODE CHECK
    if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true') {
        if (!request.nextUrl.pathname.startsWith('/maintenance')) {
            return NextResponse.redirect(new URL('/maintenance', request.url));
        }
    }

    // 2. RATE LIMITING (Only for APIs and dynamic pages)
    // Skip static assets to save Redis calls and latency
    const isStaticAsset =
        path.startsWith('/_next') ||
        path.startsWith('/static') ||
        path.includes('.') || // images, fonts etc usually have extensions
        path === '/favicon.ico'

    if (ratelimit && !isStaticAsset) {
        const { success, pending, limit, reset, remaining } = await ratelimit.limit(
            `mw_${ip}`
        )
        // pending is a promise for analytics, we don't await it

        if (!success) {
            return new NextResponse("Too Many Requests", {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": limit.toString(),
                    "X-RateLimit-Remaining": remaining.toString(),
                    "X-RateLimit-Reset": reset.toString(),
                },
            })
        }
    }

    // 3. AUTH & SESSION UPDATE
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
