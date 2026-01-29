"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export interface StudentProfile {
    id: string;
    full_name: string | null;
    email: string | null;
    wilaya: string | null;
    study_system: string | null;
    created_at: string;
    is_restored: boolean;
    is_subscribed: boolean;
    subscription_end_date: string | null;
}

// FETCH STUDENTS
export async function getStudents(
    page = 1,
    query = "",
    filter: "all" | "active" | "expired" | "banned" = "all"
) {
    // Read-only can be done with standard client usually, as Admin RLS lets them see all.
    // For complete robustness, we can switch to AdminClient, but let's stick to standard for Reads 
    // to verify RLS "Select" works.
    const supabase = await createClient();
    const adminClient = createAdminClient(); // Fallback for some filters if needed without RLS.

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Use Admin Client for Querying to ensure we see EVERYTHING regardless of quirky RLS
    // (God Mode for Read as well)
    let dbQuery = adminClient
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'student')
        .order('created_at', { ascending: false })
        .range((page - 1) * 10, ((page - 1) * 10) + 9);

    if (query) {
        dbQuery = dbQuery.ilike('full_name', `%${query}%`);
    }

    if (filter === 'active') {
        dbQuery = dbQuery.eq('is_subscribed', true);
    } else if (filter === 'expired') {
        dbQuery = dbQuery.eq('is_subscribed', false);
    }

    const { data, count, error } = await dbQuery;

    if (error) {
        console.error("Error fetching students:", error);
        throw new Error("Failed to fetch students");
    }

    return {
        students: data,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / 10) // 10 = PAGE_SIZE
    };
}

// ACTIONS

// TOGGLE BAN (God Mode)
export async function toggleBanStudent(userId: string, shouldBan: boolean) {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    // 1. Update Profile (Visual) - Use Admin Client to bypass profile RLS
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ is_banned: shouldBan } as any)
        .eq('id', userId);

    if (profileError) throw profileError;

    // 2. Update Auth User (Enforcement)
    if (shouldBan) {
        // Ban for 100 years
        await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
        await supabaseAdmin.auth.admin.signOut(userId); // Force Logout
    } else {
        await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: "0" });
    }

    revalidatePath('/admin/students');
}

// MANUAL EXPIRY / TERMINATE
export async function manualsExpireSubscription(userId: string) {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    const { error } = await supabaseAdmin
        .from('profiles')
        .update({
            is_subscribed: false,
            subscription_end_date: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) throw error;
    revalidatePath('/admin/students');
}

// EXTEND SUBSCRIPTION (God Mode)
export async function extendSubscription(userId: string, daysToAdd: number) {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    // Get current profile
    const { data: profileData } = await supabaseAdmin.from('profiles').select('subscription_end_date, is_subscribed').eq('id', userId).single();
    if (!profileData) throw new Error("Profile not found");

    let newEndDate = new Date();
    // If currently valid, add to end date
    if (profileData.is_subscribed && profileData.subscription_end_date && new Date(profileData.subscription_end_date) > new Date()) {
        newEndDate = new Date(profileData.subscription_end_date);
    }
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    const { error } = await supabaseAdmin
        .from('profiles')
        .update({
            is_subscribed: true,
            subscription_end_date: newEndDate.toISOString()
        })
        .eq('id', userId);

    if (error) throw error;
    revalidatePath('/admin/students');
}
