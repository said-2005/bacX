import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    // HEARTBEAT: Entry
    // console.log(`>> MIDDLEWARE_IN: ${request.nextUrl.pathname}`);

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // BYPASS: If keys are missing (e.g. during nuclear reset/dev), allow but log
    if (!supabaseUrl || !supabaseKey) {
        if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin')) {
            console.error("CRITICAL: SUPABASE KEYS MISSING. BLOCKING REQUEST.");
            return new NextResponse(
                JSON.stringify({ error: 'Internal Server Error: Security Configuration Missing' }),
                { status: 500, headers: { 'content-type': 'application/json' } }
            );
        }
        return response;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // ZERO-TRUST: Use getUser() instead of getSession() for strict server-side validation
    // This validates the JWT against Supabase Auth (checking revocation, etc.)
    const { data: { user }, error } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname;

    // Protected routes configuration
    const isProtectedRoute =
        path.startsWith('/dashboard') ||
        path.startsWith('/admin') ||
        path.startsWith('/complete-profile') ||
        path.startsWith('/subject') ||
        path.startsWith('/video') ||
        path.startsWith('/subscription') ||
        path.startsWith('/settings') ||
        path.startsWith('/profile');

    const isAuthRoute = path.startsWith('/auth') || path.startsWith('/login');

    // 1. UNAUTHENTICATED ACCESS TO PROTECTED ROUTE
    if (isProtectedRoute && (!user || error)) {
        console.log(`<< MIDDLEWARE_OUT: ${path} (REDIRECT to login - Zero Trust Failed)`);
        // SMART REDIRECT: Append original URL
        const nextUrl = new URL('/login', request.url);
        nextUrl.searchParams.set('next', path);
        return NextResponse.redirect(nextUrl);
    }

    // 2. AUTHENTICATED ACCESS TO AUTH ROUTE
    if (isAuthRoute && user) {
        console.log(`<< MIDDLEWARE_OUT: ${path} (REDIRECT to dashboard - Already Auth)`);
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 3. ADMIN SECURITY AUDIT & ACCESS CONTROL
    if (path.startsWith('/admin') && user) {

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            // LOG IT SECURELY
            console.warn(`SECURITY ALERT: Unauthorized Admin Access Attempt by ${user.email}`);

            // Use SERVICE ROLE for secure logging (bypass RLS that blocks user inserts)
            // Note: In Edge Runtime, we create a fresh client with Service Key
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (serviceKey) {
                const supabaseAdmin = createServerClient(
                    supabaseUrl,
                    serviceKey,
                    {
                        cookies: {
                            getAll() { return [] },
                            setAll() { }
                        }
                    }
                );

                await supabaseAdmin.from('security_logs').insert({
                    user_email: user.email || 'unknown',
                    ip_address: request.headers.get('x-forwarded-for') ?? 'unknown',
                    attempt_path: path,
                    reason: 'Unauthorized Role'
                });
            } else {
                console.error("FATAL: SUPABASE_SERVICE_ROLE_KEY missing. Cannot log security event.");
            }

            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // 4. SESSION ENFORCEMENT (Anti-Sharing / Strict One Device)
    // 4. SESSION ENFORCEMENT (Anti-Sharing / Strict One Device)
    if (user && isProtectedRoute) {
        const deviceIdCookie = request.cookies.get('x-device-id')?.value;

        if (deviceIdCookie) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('last_session_id')
                .eq('id', user.id)
                .single();

            if (profile?.last_session_id && profile.last_session_id !== deviceIdCookie) {
                console.warn(`SESSION KILLED: Device mismatch for ${user.email}. DB: ${profile.last_session_id}, Cookie: ${deviceIdCookie}`);
                const nextUrl = new URL('/login', request.url);
                nextUrl.searchParams.set('error', 'session_terminated');
                return NextResponse.redirect(nextUrl);
            }
        }
    }

    return response
}

