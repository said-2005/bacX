"use client";

import { useAuth } from "@/context/AuthContext";
import { useLiveInteraction } from "@/hooks/useLiveInteraction";
import { ParticipationQueue } from "@/components/live/ParticipationQueue";
import { GlassCard } from "@/components/ui/GlassCard";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLivePage() {
    const { profile, loading } = useAuth();
    const router = useRouter();
    const { queue, currentSpeaker, acceptStudent, endCall, connectionError } = useLiveInteraction();

    useEffect(() => {
        if (!loading && profile?.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [profile, loading, router]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
    );

    if (profile?.role !== 'admin') return null;

    return (
        <div className="p-8 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">لوحة تحكم البث المباشر</h1>
                    <p className="text-zinc-400">إدارة مشاركات الطلاب الصوتية</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 font-bold text-sm">LIVE</span>
                </div>
            </header>

            {connectionError && (
                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-200">
                    <ShieldAlert size={20} />
                    {connectionError}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* QUEUE & CONTROL */}
                <GlassCard className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <h2 className="font-bold text-lg">قائمة الانتظار</h2>
                    </div>
                    <div className="p-6">
                        <ParticipationQueue
                            queue={queue}
                            currentSpeaker={currentSpeaker}
                            onAccept={acceptStudent}
                            onEndCall={endCall}
                        />
                    </div>
                </GlassCard>

                {/* INFO / PREVIEW */}
                <div className="space-y-6">
                    <GlassCard className="p-6">
                        <h2 className="font-bold text-lg mb-4">تعليمات للمعلم</h2>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2 text-sm">
                            <li>اضغط على "قبول" للسماح للطالب بالتحدث.</li>
                            <li>سيتم توصيل الصوت تلقائياً عبر جهازك.</li>
                            <li>تأكد من إعداد OBS لالتقاط "Desktop Audio" ليسمع باقي الطلاب صوت المتحدث.</li>
                            <li>يمكنك إنهاء المكالمة في أي وقت بالضغط على زر الإنهاء الأحمر.</li>
                        </ul>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
