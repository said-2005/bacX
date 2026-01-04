/**
 * Server-side Access Validation Utility
 * Validates user subscription status with expiry check
 */

import * as admin from 'firebase-admin';

// Initialize admin if not already done
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    } catch (e) {
        console.error("Firebase Admin init error in access.ts:", e);
    }
}

interface AccessResult {
    valid: boolean;
    reason?: 'not_found' | 'not_subscribed' | 'expired' | 'admin';
    subscriptionEnd?: Date;
}

/**
 * Validates if a user has active subscription access
 * @param userId - The Firebase UID of the user
 * @returns Promise<AccessResult> - Validation result with reason
 */
export async function validateAccess(userId: string): Promise<AccessResult> {
    if (!userId) {
        return { valid: false, reason: 'not_found' };
    }

    try {
        const db = admin.firestore();
        const userRef = db.collection('users').doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return { valid: false, reason: 'not_found' };
        }

        const userData = userSnap.data();

        // Admins always have access
        if (userData?.role === 'admin') {
            return { valid: true, reason: 'admin' };
        }

        // Check subscriptionEnd timestamp
        const subscriptionEnd = userData?.subscriptionEnd;

        if (!subscriptionEnd) {
            // Fallback: Check legacy isSubscribed boolean
            if (userData?.isSubscribed === true) {
                // Legacy user - still grant access but log warning
                console.warn(`User ${userId} has legacy isSubscribed=true without subscriptionEnd`);
                return { valid: true, reason: 'admin' }; // Temporary grace
            }
            return { valid: false, reason: 'not_subscribed' };
        }

        // Convert Firestore Timestamp to Date
        const endDate = subscriptionEnd.toDate ? subscriptionEnd.toDate() : new Date(subscriptionEnd);
        const now = new Date();

        if (now > endDate) {
            return {
                valid: false,
                reason: 'expired',
                subscriptionEnd: endDate
            };
        }

        return {
            valid: true,
            subscriptionEnd: endDate
        };

    } catch (error) {
        console.error('validateAccess error:', error);
        // Fail-closed: deny access on error
        return { valid: false, reason: 'not_found' };
    }
}

/**
 * Lightweight check for API routes (Edge-compatible version)
 * Uses Firebase Client SDK or passed user data
 */
export function checkSubscriptionExpiry(subscriptionEnd: Date | string | null): boolean {
    if (!subscriptionEnd) return false;

    const endDate = typeof subscriptionEnd === 'string'
        ? new Date(subscriptionEnd)
        : subscriptionEnd;

    return new Date() < endDate;
}
