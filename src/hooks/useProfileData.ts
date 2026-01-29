"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

interface ProfileData {
    id: string;
    email: string | null;
    full_name: string;
    wilaya_id: string;
    major_id: string;
    majors: { name: string } | null;
    wilayas: { name: string } | null;
    major_name: string;
    wilaya_name: string;
    study_system: string;
    bio: string;
    role: string;
    avatar_url: string;
}

interface UseProfileDataResult {
    profile: ProfileData | null;
    loading: boolean;
    error: string | null;
    retry: () => void;
}

export function useProfileData(): UseProfileDataResult {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);

    const fetchProfile = useCallback(async () => {
        if (!isMountedRef.current) return;

        setLoading(true);
        setError(null);

        const supabase = createClient();

        try {
            // Step 1: Get authenticated user
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError) {
                console.error('[useProfileData] Auth Error:', authError.message);
                throw new Error(authError.message);
            }

            if (!user) {
                throw new Error("No authenticated user");
            }

            console.log('[useProfileData] Fetching profile for:', user.id);

            // Step 2: Simple profile fetch (no FK joins for now)
            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error('[useProfileData] Profile Error:', profileError.message, profileError.code);
                throw new Error(profileError.message);
            }

            console.log('[useProfileData] Raw data:', data);

            // Step 3: Build profile object (using raw data, no FK joins)
            const profileData: ProfileData = {
                id: user.id,
                email: user.email || null,
                full_name: data?.full_name || "",
                wilaya_id: data?.wilaya_id || "",
                major_id: data?.major_id || "",
                majors: null,
                wilayas: null,
                // Use IDs for now until we add proper FK joins
                major_name: data?.major_id || "",
                wilaya_name: data?.wilaya_id || "",
                study_system: data?.study_system || "",
                bio: data?.bio || "",
                role: data?.role || "student",
                avatar_url: data?.avatar_url || "",
            };

            if (isMountedRef.current) {
                setProfile(profileData);
                console.log('[useProfileData] ✅ Profile loaded:', profileData.full_name);
            }

        } catch (err: any) {
            console.error('[useProfileData] ❌ Error:', err.message);
            if (isMountedRef.current) {
                setError(err.message);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        fetchProfile();

        return () => {
            isMountedRef.current = false;
        };
    }, [fetchProfile]);

    const retry = useCallback(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { profile, loading, error, retry };
}
