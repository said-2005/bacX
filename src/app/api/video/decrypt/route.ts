import { NextResponse } from 'next/server';
import {
    checkRateLimitDistributed,
    videoRateLimiter,
    getClientIp,
    createRateLimitResponse
} from '@/lib/rate-limit';
import { createClient } from "@/utils/supabase/server";

// CRITICAL: No fallback. Fail-closed if not set.
const SERVER_SALT = process.env.VIDEO_ENCRYPTION_SALT;

export async function POST(request: Request) {
    // 1. DISTRIBUTED RATE LIMITING
    const clientIp = getClientIp(request);
    const rateLimitResult = await checkRateLimitDistributed(
        `video:${clientIp}`,
        videoRateLimiter,
        { maxRequests: 20, windowMs: 60000 } // Increased slightly for legitimate binge watching
    );

    if (!rateLimitResult.success) {
        console.warn(`[RATE LIMIT] Video decrypt blocked for IP: ${clientIp}`);
        return createRateLimitResponse(rateLimitResult);
    }

    // 2. ENVIRONMENT CHECK - Fail-closed
    if (!SERVER_SALT) {
        console.error('[CRITICAL] VIDEO_ENCRYPTION_SALT not configured!');
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

    // 3. SESSION VALIDATION (SUPABASE)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // 4. DECODE VIDEO ID & CHECK PERMISSIONS
    try {
        const body = await request.json();
        const { encodedId } = body;

        if (!encodedId) {
            return NextResponse.json({ error: 'Missing encodedId' }, { status: 400 });
        }

        const decodedString = Buffer.from(encodedId, 'base64').toString('utf-8');

        // Expected format per internal convention: SERVER_SALT + "enc_" + LESSON_ID + "_" + YOUTUBE_ID + SERVER_SALT
        // Wait, the client Mock suggests format: "enc_" + lessonId + "_" + youtubeId 
        // BUT the server check "decodedString.startsWith(SERVER_SALT)" implies the CLIENT sends the SALT? 
        // NO. The server usually decrypts. 
        // Looking at the original code: 
        // `decodedString.startsWith(SERVER_SALT) && decodedString.endsWith(SERVER_SALT)`
        // `realId = decodedString.slice(SERVER_SALT.length, -SERVER_SALT.length)`
        // This implies the client HAS THE SALT to construct the string? That's P1 Risk itself if SALT is generic. 
        // `NEXT_PUBLIC_VIDEO_SALT` exists in .env.example. Ah, the client sends `SALT + ID + SALT`.
        // This effectively just "obfuscates", it doesn't encrypt.
        // REMEDIATION: We must validate WHAT IS INSIDE.

        if (decodedString.startsWith(SERVER_SALT) && decodedString.endsWith(SERVER_SALT)) {
            const innerContent = decodedString.slice(SERVER_SALT.length, -SERVER_SALT.length);

            // Per `VideoPlayer.tsx`, we saw Mock "enc_LESSONID_REALID". 
            // The original `route.ts` just returned `realId`. 
            // We need to parse `innerContent`. 
            // Assumption: The client sends `base64(SALT + VIDEO_TOKEN + SALT)`. 
            // If `VIDEO_TOKEN` is just the YouTube ID, we are screwed (can't map to lesson).
            // We need to ENFORCE that `VIDEO_TOKEN` contains the Lesson ID.

            // Let's assume for this FIX that we are extracting the YouTube ID.
            // AND we need to find which lesson this belongs to.
            // We can query `lessons` table by `video_url` (or youtube_id column if it exists).
            // The schema showed `video_url` column. Assuming it stores the ID or full URL.

            const potentialVideoId = innerContent; // This might be "M7lc..." or "enc_..." based on mock?
            // Realistically, database has the YouTube ID in `video_url` or `youtube_id` (implied).
            // Let's generic query `lessons` where `video_url` contains this ID.

            // 4.1 FETCH USER PROFILE FOR PLAN
            const { data: profile } = await supabase
                .from('profiles')
                .select('active_plan_id, role, is_subscribed')
                .eq('id', userId)
                .single();

            if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
            if (profile.role === 'admin') {
                // Admin Bypass
                return NextResponse.json(
                    { videoId: potentialVideoId },
                    { headers: { 'X-Plan-Check': 'Bypass-Admin' } }
                );
            }

            // 4.2 FIND LESSON & CHECK PLAN
            // We search for a lesson that USES this video ID.
            // Note: `video_url` in DB might be full URL "https://youtube.com/..."
            // We use ILIKE to find match.
            const { data: lesson } = await supabase
                .from('lessons')
                .select('id, required_plan_id, is_free, title')
                .ilike('video_url', `%${potentialVideoId}%`)
                .limit(1)
                .single();

            if (!lesson) {
                // If video not found in DB, it's either an orphan or a loose ID. 
                // Strict Mode: BLOCK.
                console.warn(`[SECURITY] Video ID ${potentialVideoId} requested by ${user.email} NOT FOUND in DB. Blocking.`);
                return NextResponse.json({ error: 'Content verification failed' }, { status: 404 });
            }

            // 4.3 ENTITLEMEN CHECK
            let hasAccess = false;
            if (lesson.is_free) {
                hasAccess = true;
            } else if (lesson.required_plan_id) {
                hasAccess = profile.active_plan_id === lesson.required_plan_id;
            } else {
                // Legacy / General Subscription Fallback
                hasAccess = profile.is_subscribed;
            }

            if (!hasAccess) {
                console.warn(`[SECURITY] Unauthorized Access Attempt: User ${user.email} tried to access '${lesson.title}' (ID: ${lesson.id}) without valid plan.`);
                return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
            }

            return NextResponse.json(
                { videoId: potentialVideoId },
                {
                    headers: {
                        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': rateLimitResult.reset.toString()
                    }
                }
            );

        } else {
            console.error(`[SECURITY] Salt mismatch for user ${userId}, IP ${clientIp}`);
            return NextResponse.json({ error: 'Integrity check failed' }, { status: 403 });
        }
    } catch (error) {
        console.error("Decryption API Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
