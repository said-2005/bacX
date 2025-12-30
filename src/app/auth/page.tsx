"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SignUp } from "@/components/auth/SignUp";
import { toast } from "sonner";

export default function AuthPage() {
    const { user, loading } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Login State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace("/dashboard");
        }
    }, [user, loading, router]);

    if (loading) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("تم تسجيل الدخول بنجاح");
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error("فشل تسجيل الدخول: تأكد من البيانات");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-[#050505] relative overflow-hidden font-tajawal" dir="rtl">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#1e1b4b]/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#020617]/40 blur-[100px] rounded-full" />
            </div>

            <GlassCard className="w-full max-w-[420px] p-8 relative z-10 border-white/5 bg-black/40">
                <div className="text-center mb-8">
                    <h1 className="font-bold text-3xl text-white mb-2">
                        {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
                    </h1>
                    <p className="text-zinc-400">
                        {isLogin ? "مرحباً بعودتك إلى منصة النخبة" : "ابدأ رحلتك نحو التفوق ولا تضيع الفرصة"}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {isLogin ? (
                        <motion.form
                            key="login"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleLogin}
                            className="space-y-4"
                        >
                            <Input
                                type="email"
                                placeholder="البريد الإلكتروني"
                                icon={Mail}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/5 border-white/10 focus:border-white/20 text-right"
                            />

                            <Input
                                type="password"
                                placeholder="كلمة المرور"
                                icon={Lock}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/5 border-white/10 focus:border-white/20 text-right"
                            />

                            <Button
                                className="w-full mt-6 bg-white text-black hover:bg-zinc-200 font-bold"
                                size="lg"
                                isLoading={isLoading}
                            >
                                دخول
                            </Button>

                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(false)}
                                    className="text-sm text-zinc-500 hover:text-white transition-colors"
                                >
                                    ليس لديك حساب؟ <span className="underline decoration-blue-500/50 underline-offset-4 text-zinc-300">سجل الآن</span>
                                </button>
                            </div>
                        </motion.form>
                    ) : (
                        <SignUp key="signup" onToggleLogin={() => setIsLogin(true)} />
                    )}
                </AnimatePresence>
            </GlassCard>
        </main>
    );
}

