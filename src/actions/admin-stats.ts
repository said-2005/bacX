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
    try {
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
            throw new Error(`Failed to fetch student stats: ${profilesError.message}`);
        }

        const students = profiles.filter(p => p.role !== 'admin');
        const totalStudents = students.length;
        const vipStudents = students.filter(p => p.is_subscribed).length;
        const regularStudents = totalStudents - vipStudents;

        // 3. Active Online (Heuristic: Signed in within last 15 mins)
        let activeOnline = 0;
        try {
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
            const activeProfiles = students.filter(p => p.last_sign_in_at && p.last_sign_in_at > fifteenMinutesAgo);
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
            console.warn("Error fetching revenues (table might not exist yet):", paymentsError);
            // Don't throw for revenue, just return 0
        }

        let totalRevenue = 0;
        if (payments) {
            payments.forEach(p => {
                // Clean string: "2500 DA" -> 2500
                const amountStr = String(p.amount).replace(/[^0-9.]/g, '');
                const amount = parseFloat(amountStr);
                if (!isNaN(amount)) {
                    totalRevenue += amount;
                }
            });
        }

        return {
            totalStudents,
            regularStudents,
            vipStudents,
            totalRevenue,
            activeOnline
        };

    } catch (err: any) {
        console.error("CRITICAL ADMIN STATS ERROR:", err);
        // Return safe fallback to prevent page crash
        return {
            totalStudents: 0,
            regularStudents: 0,
            vipStudents: 0,
            totalRevenue: 0,
            activeOnline: 0
        };
    }
}
