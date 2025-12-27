"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WifiOff, Loader2 } from "lucide-react";

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

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    role: 'admin' | 'student' | null;
    connectionStatus: 'online' | 'reconnecting' | 'offline';
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
    role: null,
    connectionStatus: 'online',
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'student' | null>(null);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState<'online' | 'reconnecting' | 'offline'>('online');
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const deviceId = getStableDeviceId();
                const userRef = doc(db, 'users', currentUser.uid);

                // --- RETRY LOGIC FOR NETWORK RESILIENCE ---
                let retries = 3;
                let success = false;

                while (retries > 0 && !success) {
                    try {
                        const userSnap = await getDoc(userRef);
                        success = true; // Fetch succeeded
                        setConnectionStatus('online');

                        if (userSnap.exists()) {
                            const data = userSnap.data();
                            const activeDevices = data.activeDevices || [];
                            setRole(data.role || 'student');

                            if (!activeDevices.includes(deviceId)) {
                                // Check limit before writing (Client check is UX only, Server rules enforce security)
                                if (activeDevices.length >= 2 && data.role !== 'admin') {
                                    await firebaseSignOut(auth);
                                    alert("تم تجاوز حد الأجهزة المسموح به (2).");
                                    setUser(null);
                                    setRole(null);
                                    setLoading(false);
                                    return;
                                } else {
                                    // Register new device with Atomic ArrayUnion
                                    await updateDoc(userRef, {
                                        activeDevices: arrayUnion(deviceId)
                                    });
                                }
                            }
                        } else {
                            // First Login
                            await setDoc(userRef, {
                                email: currentUser.email,
                                activeDevices: [deviceId],
                                role: 'student',
                                createdAt: new Date(),
                                isSubscribed: false,
                                displayName: currentUser.displayName || "",
                                photoURL: currentUser.photoURL || ""
                            });
                            setRole('student');
                        }
                        setUser(currentUser);

                    } catch (error: any) {
                        console.error("Auth Error:", error);
                        // Only retry if it looks like a network error
                        if (error.code === 'unavailable' || error.message.includes('offline')) {
                            setConnectionStatus('reconnecting');
                            toast("جاري إعادة الاتصال...", { icon: <WifiOff className="w-4 h-4" /> });
                            retries--;
                            await new Promise(r => setTimeout(r, 2000)); // Wait 2s
                        } else {
                            // Fatal Error (Permission Denied etc)
                            await firebaseSignOut(auth);
                            setUser(null);
                            setRole(null);
                            setLoading(false);
                            return;
                        }
                    }
                }

                if (!success) {
                    // Failed after retries
                    setConnectionStatus('offline');
                    toast.error("يبدو أن هناك مشكلة في الاتصال بالانترنت");
                    // We don't force logout here to be nice, just show offline state? 
                    // Or force logout for security? Let's keep user session but disable features.
                }

            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        const deviceId = getStableDeviceId();
        // Optional: Remove device on logout? 
        // Logic: Usually we keep it until they manually revoke, to prevent "Device Hopping".
        await firebaseSignOut(auth);
        router.push('/auth');
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, role, connectionStatus }}>
            {!loading && children}
            {loading && (
                <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            )}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
