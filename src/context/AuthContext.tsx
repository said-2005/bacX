"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { registerDevice, unregisterDevice } from "@/actions/device";

// Stable Fingerprinting
const getStableDeviceId = () => {
    if (typeof window === 'undefined') return 'server';
    const components = [
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency,
    ];
    const raw = components.join('||');
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) hash = (hash * 33) ^ raw.charCodeAt(i);
    return 'device_' + (hash >>> 0).toString(16);
};

// Clear all client-side storage
const clearAllStorage = () => {
    if (typeof window === 'undefined') return;

    // Clear all cookies
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    }

    // Clear localStorage and sessionStorage
    try {
        localStorage.clear();
        sessionStorage.clear();
    } catch (e) {
        console.error("Failed to clear storage:", e);
    }
};

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    role: 'admin' | 'student' | null;
    connectionStatus: 'online' | 'reconnecting' | 'offline';
    isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
    role: null,
    connectionStatus: 'online',
    isLoggingOut: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'student' | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'online' | 'reconnecting' | 'offline'>('online');
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // If logging out, don't process auth changes
            if (isLoggingOut) return;

            if (currentUser) {
                const token = await currentUser.getIdToken();
                const deviceId = getStableDeviceId();
                const userRef = doc(db, 'users', currentUser.uid);

                // Set the session cookie for Middleware
                document.cookie = `bacx_session=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;

                // --- RETRY LOGIC FOR NETWORK RESILIENCE ---
                let retries = 3;
                let success = false;

                while (retries > 0 && !success) {
                    try {
                        const userSnap = await getDoc(userRef);
                        success = true;
                        setConnectionStatus('online');

                        if (userSnap.exists()) {
                            const data = userSnap.data();
                            setRole(data.role || 'student');

                            try {
                                await registerDevice(currentUser.uid, {
                                    deviceId,
                                    deviceName: navigator.userAgent.slice(0, 50)
                                });
                            } catch (deviceError: unknown) {
                                // Device limit logic
                                const errorMessage = deviceError instanceof Error ? deviceError.message : String(deviceError);
                                if (errorMessage.includes('Device limit') || errorMessage.includes('resource-exhausted')) {
                                    await firebaseSignOut(auth);
                                    alert("تم تجاوز حد الأجهزة المسموح به (2).");
                                    clearAllStorage();
                                    setUser(null);
                                    setRole(null);
                                    setLoading(false);
                                    return;
                                }
                            }
                        } else {
                            // First Login - create user document
                            await setDoc(userRef, {
                                uid: currentUser.uid,
                                email: currentUser.email,
                                role: 'student',
                                createdAt: new Date(),
                                displayName: currentUser.displayName || "",
                                photoURL: currentUser.photoURL || ""
                            });
                            setRole('student');
                            await registerDevice(currentUser.uid, {
                                deviceId,
                                deviceName: navigator.userAgent.slice(0, 50)
                            });
                        }
                        setUser(currentUser);

                    } catch (error: unknown) {
                        console.error("Auth Error:", error);
                        const errorMessage = error instanceof Error ? error.message : String(error);

                        if (errorMessage.includes('offline') || errorMessage.includes('unavailable')) {
                            setConnectionStatus('reconnecting');
                            retries--;
                            await new Promise(r => setTimeout(r, 2000));
                        } else {
                            // Critical error
                            setLoading(false);
                            return;
                        }
                    }
                }
            } else {
                // Logged out
                setUser(null);
                setRole(null);
                clearAllStorage();
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isLoggingOut]);

    // Memoized secure logout function
    const logout = useCallback(async () => {
        const deviceId = getStableDeviceId();

        // Set logging out flag to prevent auth state changes from triggering
        setIsLoggingOut(true);

        // Immediately clear user state (prevents "ghost session" UI)
        setUser(null);
        setRole(null);

        // Unregister device (non-blocking)
        if (user) {
            try {
                await unregisterDevice(user.uid, deviceId);
            } catch (error) {
                console.error("Failed to unregister device:", error);
            }
        }

        // Clear all client storage
        clearAllStorage();

        // Clear server session
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch {
            // Ignore errors
        }

        // Sign out from Firebase
        await firebaseSignOut(auth);

        // Use replace to prevent back button from returning to dashboard
        router.replace('/auth');

        // Reset logging out flag after a short delay
        setTimeout(() => setIsLoggingOut(false), 500);
    }, [user, router]);

    return (
        <AuthContext.Provider value={{ user, loading, logout, role, connectionStatus, isLoggingOut }}>
            {!loading && children}
            {loading && (
                <div className="fixed inset-0 bg-background z-[100] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-600/20 animate-pulse">
                            B
                        </div>
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
