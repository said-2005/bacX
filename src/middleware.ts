import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // In a real app with Firebase, validating auth inside middleware is tricky 
    // because Firebase SDK isn't fully edge-compatible or requires session cookies.
    // For this "Phase 4" demo, we'll assume client-side protection or a cookie-based approach later.
    // However, we CAN check for a session cookie if one existed.

    // For now, we pass everything to allow the client AuthContext to handle protection 
    // to avoid blocking the "Static" build of the dashboard in this phase.

    // --- MAINTENANCE MODE CHECK ---
    const isMaintenance = process.env.MAINTENANCE_MODE === 'true';
    if (isMaintenance) {
        // Allow access to maintenance page and static assets
        if (!request.nextUrl.pathname.startsWith('/maintenance') &&
            !request.nextUrl.pathname.startsWith('/_next') &&
            !request.nextUrl.pathname.startsWith('/static')) {
            return NextResponse.rewrite(new URL('/maintenance', request.url));
        }
    } else {
        // If NOT in maintenance mode, but user visits /maintenance, redirect home
        if (request.nextUrl.pathname.startsWith('/maintenance')) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Match all paths except api, static files, images
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
