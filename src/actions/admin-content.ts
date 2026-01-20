'use server';

import { createClient, verifyAdmin } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// SUBJECTS
export async function getSubjects() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('p_subjects') // Assuming table name
        .select('*')
        .order('created_at');

    if (error) console.error("Error fetching subjects:", error);
    return data || [];
}

export async function createSubject(title: string, icon: string) {
    // SECURITY: Verify Admin Role
    await verifyAdmin();
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from('p_subjects')
        .insert({ title, icon, active: true });

    if (error) throw error;
    return { success: true };
}

// LESSONS
export async function getLessons(subjectId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('p_lessons') // Assuming table name
        .select('*')
        .eq('subject_id', subjectId)
        .order('order_index');

    if (error) console.error("Error fetching lessons:", error);
    return data || [];
}

export async function createLesson(data: any) {
    // SECURITY: Verify Admin Role
    await verifyAdmin();
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from('p_lessons')
        .insert(data);

    if (error) throw error;
    return { success: true };
}

export async function deleteLesson(lessonId: string) {
    // SECURITY: Verify Admin Role
    await verifyAdmin();
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from('p_lessons')
        .delete()
        .eq('id', lessonId);

    if (error) throw error;
    return { success: true };
}
