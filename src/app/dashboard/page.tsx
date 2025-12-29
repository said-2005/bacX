"use client";

import { useAuth } from "@/context/AuthContext";
import { useLiveStatus } from "@/hooks/useLiveStatus";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { BookOpen, Radio, Calendar, ArrowLeft, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const { isLive, title: liveTitle } = useLiveStatus();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/auth");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Minimal Greeting */}
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                    صباح الخير، {user.displayName?.split(' ')[0] || "يا بطل"} 🚀
                </h1>
                <p className="text-zinc-500 mt-2 text-lg">
                    لديك 3 دروس جديدة في الرياضيات للمراجعة اليوم.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Feature: Live Status */}
                <div className="lg:col-span-2">
                    <GlassCard className={cn(
                        "h-full p-8 flex flex-col justify-between relative overflow-hidden group transition-all duration-300",
                        isLive ? "border-red-500/30 bg-red-950/10 shadow-[0_0_40px_-10px_rgba(239,68,68,0.2)]" : "hover:border-primary/20"
                    )}>
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-8">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner",
                                    isLive ? "bg-red-500 text-white shadow-red-500/20" : "bg-white/5 text-zinc-400"
                                )}>
                                    <Radio className="w-7 h-7" />
                                </div>
                                {isLive && (
                                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-pulse">
                                        <span className="w-2 h-2 rounded-full bg-red-500" /> مباشر الآن
                                    </span>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold mb-3 text-white">
                                {isLive ? liveTitle || "بث مباشر: مراجعة الدوال الأسية" : "لا يوجد بث مباشر حالياً"}
                            </h2>
                            <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                                {isLive
                                    ? "التحق الآن بالدرس المباشر وتفاعل مع الأستاذ وزملائك في الوقت الحقيقي."
                                    : "استغل هذا الوقت لمراجعة الدروس المسجلة أو حل التمارين المقترحة."}
                            </p>
                        </div>

                        <div className="mt-8 relative z-10">
                            {isLive ? (
                                <Link href="/live" className="block">
                                    <Button className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white h-14 text-lg font-bold shadow-lg shadow-red-900/20 border-t border-white/20">
                                        الالتحاق بالبث
                                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            ) : (
                                <Button disabled className="w-full bg-white/5 text-zinc-600 border border-white/5 cursor-not-allowed">
                                    انتظر موعد البث القادم
                                </Button>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* 2. Quick Stats / Actions */}
                <div className="space-y-6">
                    <Link href="/lessons" className="block group h-full">
                        <GlassCard className="p-6 h-full flex flex-col justify-center border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all duration-300 group-hover:translate-y-[-2px]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/10 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div className="text-xs text-zinc-500 font-mono">24 درس</div>
                            </div>
                            <h3 className="font-bold text-xl mb-1 text-white group-hover:text-blue-400 transition-colors">مكتبة الدروس</h3>
                            <p className="text-sm text-zinc-500">شاهد الدروس المسجلة بجودة عالية 4K</p>
                        </GlassCard>
                    </Link>

                    <GlassCard className="p-6 border-white/5 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-lg">الخطة القادمة</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-zinc-400 bg-white/5 p-3 rounded-lg border border-white/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    <span>السبت 20:00 - رياضيات</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-zinc-400 bg-white/5 p-3 rounded-lg border border-white/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    <span>الأحد 18:00 - فيزياء</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Subject Shortcuts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['الرياضيات', 'الفيزياء', 'العلوم', 'اللغات'].map((subject, i) => (
                    <Link href={`/lessons?filter=${subject}`} key={subject} className="group">
                        <GlassCard className="p-6 flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all duration-300 border-white/5 hover:border-white/10 group-hover:scale-[1.02]">
                            <span className={cn("text-lg font-bold transition-colors",
                                i === 0 ? "text-blue-400 group-hover:text-blue-300" :
                                    i === 1 ? "text-orange-400 group-hover:text-orange-300" :
                                        i === 2 ? "text-green-400 group-hover:text-green-300" :
                                            "text-pink-400 group-hover:text-pink-300"
                            )}>
                                {subject}
                            </span>
                            <span className="text-xs text-zinc-600 group-hover:text-zinc-500">تصفح المادة</span>
                        </GlassCard>
                    </Link>
                ))}
            </div>
        </div>
    );
}
