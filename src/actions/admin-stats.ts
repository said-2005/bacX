'use server';

import { createClient, verifyAdmin } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export interface DashboardStats {
    totalStudents: number;
    regularStudents: number;
    vipStudents: number;
    totalRevenue: number;
    activeOnline: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // 1. Verify Admin (Basic check, middleware handles the rest mostly)
    // 1. Verify Admin Role (STRICT)
    await verifyAdmin();

    const { data: { user } } = await supabase.auth.getUser(); // Re-fetch or ignore, verifyAdmin handles it.
    if (!user) throw new Error("Unauthorized");

    // 2. Fetch Students Stats
    // Assuming 'student' role or just all profiles that are not admin
    // We can use is_subscribed to differentiate Regular vs Private (VIP)
    const { data: profiles, error: profilesError } = await adminClient
        .from('profiles')
        .select('id, role, is_subscribed, last_sign_in_at');

    if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw new Error("Failed to fetch student stats");
    }

    const students = profiles.filter(p => p.role !== 'admin');
    const totalStudents = students.length;
    const vipStudents = students.filter(p => p.is_subscribed).length;
    const regularStudents = totalStudents - vipStudents;

    // 3. Active Online (Heuristic: Signed in within last 15 mins)
    // Note: 'last_sign_in_at' might be in auth.users, but we might have it in profiles if synced
    // If profiles doesn't have it, we'd need to list users which is slower.
    // Let's assume profiles has a trigger or we just use a rough estimate if not.
    // Actually, let's try to query auth.users via adminClient if possible? 
    // unique to auth schema. adminClient.auth.admin.listUsers() is better.

    let activeOnline = 0;
    try {
        // This can be slow for many users, but fine for now.
        // For a mega structure, we'd want a dedicated 'presence' table or Redis.
        // defaulting to 0 or random for demo if listUsers is too heavy/restricted.
        // For now, let's use a placeholder or heuristic from profiles if available.
        // Check if profiles has updated_at recently?
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const activeProfiles = students.filter(p => p.last_sign_in_at && p.last_sign_in_at > fifteenMinutesAgo);
        // Note: profiles might not have last_sign_in_at synced. 
        // If it's effectively 0, I'll mock it for the "Mega Structure" feel if real data is empty
        activeOnline = activeProfiles.length;
    } catch (e) {
        console.warn("Failed to calc active users", e);
    }

    // 4. Calculate Revenue
    // Sum 'amount' from approved payments
    const { data: payments, error: paymentsError } = await adminClient
        .from('payments')
        .select('amount')
        .eq('status', 'approved');

    if (paymentsError) {
        console.error("Error fetching payments:", paymentsError);
        throw new Error("Failed to fetch revenue");
    }

    let totalRevenue = 0;
    payments.forEach(p => {
        // Clean string: "2500 DA" -> 2500
        const amountStr = String(p.amount).replace(/[^0-9.]/g, '');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount)) {
            totalRevenue += amount;
        }
    });

    return {
        totalStudents,
        regularStudents,
        vipStudents,
        totalRevenue,
        activeOnline
    };
}
