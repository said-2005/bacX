"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";

// --- TYPES ---

export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    wilaya?: string; // e.g., "16 - Algiers"
    major?: string;  // e.g., "science"
    study_system?: string; // e.g., "regular" or "private"
    role: "admin" | "student";
    is_profile_complete: boolean;
    is_subscribed?: boolean;
    subscription_end_date?: string;
    created_at: string;
}

export interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
}

export interface AuthContextType extends AuthState {
    loginWithEmail: (email: string, password: string) => Promise<void>;
    signupWithEmail: (data: { email: string, password: string, fullName: string, wilaya: string, major: string }) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    hydrateProfile: (profile: UserProfile | null) => Promise<void>;
    checkProfileStatus: () => Promise<boolean>;
    completeOnboarding: (data: { fullName: string; wilaya: string; major: string }) => Promise<void>;
    role: "admin" | "student" | null; // Direct Accessor
}

// ... CONTEXT ...
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
    children,
    initialUser = null,
    hydratedProfile = null
}: {
    children: ReactNode;
    initialUser?: User | null;
    hydratedProfile?: UserProfile | null;
}) {
    const supabase = createClient();
    const router = useRouter();

    const [state, setState] = useState<AuthState>({
        user: initialUser,
        profile: hydratedProfile,
        session: null,
        loading: false, // OPTIMISTIC: Never block UI on auth - trust SSR hydration
        error: null,
    });

    // --- HELPERS ---

    const fetchProfile = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from("profiles")
            .select(`
                *,
                wilayas ( full_label ),
                majors ( label )
            `)
            .eq("id", userId)
            .single();

        if (error) {
            console.error("Error fetching profile:", error);
            return null;
        }

        // Map relational data to flat strings
        const profile = {
            ...data,
            wilaya: data.wilayas?.full_label,
            major: data.majors?.label
        };

        return profile as unknown as UserProfile;
    }, [supabase]);

    // Track if we've completed initial auth check
    const hasInitialized = useRef(!!initialUser);
    // Track current user ID to avoid duplicate fetches
    const userIdRef = useRef<string | undefined>(initialUser?.id);

    useEffect(() => {
        // BACKGROUND AUTH LISTENER: Never blocks navigation
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            // Skip INITIAL_SESSION if we already have SSR data
            if (event === 'INITIAL_SESSION' && hasInitialized.current) {
                // Just sync the session object, don't re-fetch profile
                if (session) {
                    setState(prev => ({ ...prev, session }));
                }
                return;
            }

            if (session?.user) {
                const user = session.user;

                if (!hasInitialized.current) {
                    // First client-side auth - silently hydrate
                    hasInitialized.current = true;
                    userIdRef.current = user.id;
                    const profile = await fetchProfile(user.id);
                    setState(prev => ({ ...prev, user, session, profile }));
                } else if (user.id !== userIdRef.current) {
                    // User actually changed (rare: account switch)
                    userIdRef.current = user.id;
                    const profile = await fetchProfile(user.id);
                    setState(prev => ({ ...prev, user, session, profile }));
                } else {
                    // Same user, just session refresh - update session only
                    setState(prev => ({ ...prev, session }));
                }
            } else if (hasInitialized.current && userIdRef.current) {
                // Actual logout (not initial empty state)
                userIdRef.current = undefined;
                setState(prev => ({
                    ...prev,
                    user: null,
                    session: null,
                    profile: null
                }));
            }

            // ANTI-SHARING: Update last_session_id on login/restore
            if (session?.user?.id && session?.access_token) {
                // We do this optimistically, errors here shouldn't block app usage but might affect strict security
                // Ideally this is done via RPC or ensuring the user can update this column
                // For now, client-side update:
                /* 
                 * Note: The middleware will start rejecting requests if this isn't set, 
                 * so we must ensure it's set.
                 */
                // Only update if it's a new session or we haven't tracked it yet
                // But simply running it every time we get a session event is safer to ensure consistency
                // although it generates traffic.
                // Let's do it only if event is SIGN_IN or INITIAL_SESSION
                if (event === 'SIGNED_IN') {
                    const newDeviceId = crypto.randomUUID();
                    if (typeof window !== 'undefined') {
                        window.sessionStorage.setItem('brainy_device_id', newDeviceId);
                    }

                    // Update DB with this new device ID
                    supabase.from('profiles').update({
                        last_session_id: newDeviceId
                    }).eq('id', session.user.id).then(({ error }: { error: any }) => {
                        if (error) console.error("Failed to update session tracking:", error);
                    });
                } else if (event === 'INITIAL_SESSION') {
                    // Recovering session (F5)
                    // We trust the existing session storage if present, or if missing (cleared?), we might be in trouble.
                    // But typically sessionStorage persists on F5.
                    // If tabs are closed, sessionStorage is gone -> User has to login again (Single Session Policy).
                    // So we don't need to do anything special here unless we want to validate validity immediately.
                }
            }
        });



        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, fetchProfile]);

    // --- IDLE TIMEOUT (30 Minutes) ---
    useEffect(() => {
        if (!state.session) return;

        let timeoutId: NodeJS.Timeout;
        const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                console.log("Creation Idle Timeout Triggered. Logging out...");
                logout();
            }, TIMEOUT_DURATION);
        };

        // Events to monitor
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        // Attach listeners
        const setupListeners = () => events.forEach(event => window.addEventListener(event, resetTimer));
        const cleanupListeners = () => events.forEach(event => window.removeEventListener(event, resetTimer));

        setupListeners();
        resetTimer(); // Start timer

        return () => {
            cleanupListeners();
            clearTimeout(timeoutId);
        };
    }, [state.session]); // Re-bind when session changes

    // --- HEARTBEAT CHECK (Anti-Sharing) ---
    useEffect(() => {
        if (!state.session || !state.user) return;

        const checkSessionValidity = async () => {
            const storedDeviceId = typeof window !== 'undefined' ? window.sessionStorage.getItem('brainy_device_id') : null;
            if (!storedDeviceId) return; // Should be set on login

            const { data, error } = await supabase
                .from('profiles')
                .select('last_session_id')
                .eq('id', state.user!.id) // Non-null assertion safe due to check above
                .single();

            if (error || !data) return;

            // Strict check
            if (data.last_session_id && data.last_session_id !== storedDeviceId) {
                console.warn("Session invalidated by newer login on another device.");
                logout();
            }
        };

        // Check every 30 seconds
        const heartbeatInterval = setInterval(checkSessionValidity, 30000);

        // Initial check
        checkSessionValidity();

        return () => clearInterval(heartbeatInterval);
    }, [state.session, state.user, supabase]);
    const loginWithEmail = async (email: string, password: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setState(prev => ({ ...prev, loading: false, error: error.message }));
            throw error;
        }
    };

    const signupWithEmail = async ({ email, password, fullName, wilaya, major }: { email: string, password: string, fullName: string, wilaya: string, major: string }) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    wilaya: wilaya,
                    major: major,
                    is_profile_complete: true // Assuming sign up flow includes all data
                }
            }
        });

        if (error) {
            setState(prev => ({ ...prev, loading: false, error: error.message }));
            throw error;
        }

        // Note: Profile creation is usually handled by a Database Trigger on "auth.users" created.
        // Assuming trigger exists. If not, we might need manual insert here, but Trigger is Supabase best practice.
    };

    const logout = async () => {
        try {
            console.log("Logging out...");
            // Attempt to sign out from Supabase
            await supabase.auth.signOut();
            console.log("Logged out from Supabase success");
        } catch (error) {
            console.error("Logout error (non-blocking):", error);
        } finally {
            // ALWAYS Redirect, even if error occurs
            console.log("Redirecting to login...");
            if (typeof window !== 'undefined') {
                window.localStorage.clear(); // Clear all local storage
                window.sessionStorage.clear(); // Clear session storage
            }
            router.push("/"); // Client-side nav to LANDING (Rule 1)
            router.refresh();      // Clear server cache
        }
    };

    const refreshProfile = async () => {
        if (state.user) {
            const profile = await fetchProfile(state.user.id);
            setState(prev => ({ ...prev, profile }));
        }
    };

    const hydrateProfile = async (profile: UserProfile | null) => {
        setState(prev => ({ ...prev, profile }));
    };

    const checkProfileStatus = async () => {
        if (!state.user) return false;
        // If we have local profile, check it
        if (state.profile) return state.profile.is_profile_complete;

        // Otherwise fetch
        const profile = await fetchProfile(state.user.id);
        return profile?.is_profile_complete || false;
    };

    const completeOnboarding = async (data: { fullName: string; wilaya: string; major: string }) => {
        if (!state.user) throw new Error("No user logged in");

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: data.fullName,
                wilaya: data.wilaya,
                // major: data.major, // DB might expect IDs. Keeping metadata sync for checks.
                is_profile_complete: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', state.user.id);

        if (profileError) throw profileError;

        await supabase.auth.updateUser({
            data: {
                full_name: data.fullName,
                wilaya: data.wilaya,
                major: data.major,
                is_profile_complete: true
            }
        });

        await refreshProfile();
        router.replace('/dashboard');
    };

    // --- RENDER ---

    const value: AuthContextType = {
        ...state,
        loginWithEmail,
        signupWithEmail,
        logout,
        refreshProfile,
        hydrateProfile,
        checkProfileStatus,
        completeOnboarding,
        role: state.profile?.role || null
    };


    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
