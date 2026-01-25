"use server";

import { createClient } from "@/utils/supabase/server";


export interface SignupState {
    error?: string;
    success?: boolean;
}

export async function signupAction(prevState: SignupState, formData: FormData): Promise<SignupState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    // Extract all fields from form
    const wilayaId = formData.get("wilaya_id") as string;
    const majorId = formData.get("major_id") as string;
    const studySystem = formData.get("study_system") as string;
    const phone = formData.get("phone") as string | null; // Optional field

    const supabase = await createClient();

    // Fetch the labels for IDs to store human-readable values
    // This is important because the trigger stores these as text, not foreign keys
    let wilayaLabel = "";
    let majorLabel = "";

    if (wilayaId) {
        const { data: wilayaData } = await supabase
            .from("wilayas")
            .select("full_label")
            .eq("id", parseInt(wilayaId))
            .single();
        wilayaLabel = wilayaData?.full_label || wilayaId;
    }

    if (majorId) {
        const { data: majorData } = await supabase
            .from("majors")
            .select("label")
            .eq("id", majorId)
            .single();
        majorLabel = majorData?.label || majorId;
    }

    // Sign Up User + Pass ALL Metadata for Trigger
    // CRITICAL: The trigger expects 'wilaya', 'major', 'study_system', 'phone'
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                wilaya: wilayaLabel,        // Human-readable label, not ID
                wilaya_id: wilayaId,        // Also store ID for relational queries
                major: majorLabel,          // Human-readable label, not ID
                major_id: majorId,          // Also store ID for relational queries
                study_system: studySystem,  // 'regular' or 'private'
                phone: phone || "",         // Phone number (optional)
                role: "student",            // Default role
                is_profile_complete: true,  // Mark as complete since all required fields provided
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    // MANUAL INGESTION: Guarantee Profile Creation
    // We manually insert/upsert the profile to ensure it exists even if the SQL trigger fails.
    if (data.user) {
        // Redundant Upsert
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            wilaya: wilayaLabel,
            major: majorLabel,
            study_system: studySystem,
            phone_number: phone || "",
            role: 'student',
            is_profile_complete: true,
            updated_at: new Date().toISOString(),
        });

        if (profileError) {
            console.error("Manual Profile Creation Failed:", profileError);
            // We do not stop the flow, as the trigger might have succeeded.
        }
    }

    // Success
    return { success: true };
}

