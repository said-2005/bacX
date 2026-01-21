"use client";

import { useState } from "react";
import { toggleLiveStream, archiveStream } from "@/actions/live";
import { useLiveStatus } from "@/hooks/useLiveStatus";
import { useLiveInteraction } from "@/hooks/useLiveInteraction";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Radio, Archive, Loader2, Youtube, Hand } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ParticipationQueue } from "@/components/live/ParticipationQueue";
import { LiveChat } from "@/components/live/LiveChat";

export default function AdminLiveDashboard() {
    const { isLive, youtubeId: currentId, title: currentTitle } = useLiveStatus();

    // Live Interaction Hook (Hooks into PeerJS & Realtime DB)
    const {
        queue,
        currentSpeaker,
        acceptStudent,
        endCall,
        status: callStatus
    } = useLiveInteraction();

    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [youtubeId, setYoutubeId] = useState("");
    const [subject, setSubject] = useState("Physics");
    const [showArchiveModal, setShowArchiveModal] = useState(false); // [NEW]
    const [archiveType, setArchiveType] = useState<'lesson' | 'exercise'>('lesson'); // [NEW]

    const handleGoLive = async () => {
        if (!title || !youtubeId) {
            toast.error("يرجى ملء جميع الحقول", { position: "top-center" });
            return;
        }

        setLoading(true);
        try {
            await toggleLiveStream({
                isLive: true,
                youtubeId,
                title,
                subject
            });
            toast.success("🔴 البث المباشر قيد التشغيل!", { position: "top-center" });
        } catch (e) {
            toast.error("حدث خطأ أثناء بدء البث");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleEndAndArchive = async () => {
        setLoading(true);
        try {
            const idToArchive = currentId || youtubeId;
            const titleToArchive = currentTitle || title || "Recorded Session";
            await archiveStream(idToArchive, titleToArchive, subject, archiveType);

            toast.success("✅ الحصة تم حفظها بنجاح", { position: "top-center" });

            setTitle("");
            setYoutubeId("");
            setShowArchiveModal(false);
        } catch (e) {
            toast.error("حدث خطأ أثناء الأرشفة");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 h-[calc(100vh-100px)] overflow-y-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-tajawal text-white">مركز القيادة المباشر</h1>
                {isLive && (
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                        className="px-4 py-2 bg-red-600 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                    >
                        <Radio className="w-4 h-4 text-white" />
                        <span className="text-sm font-bold text-white uppercase">On Air</span>
                    </motion.div>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Control (Go Live / Archive) */}
                <div className="xl:col-span-2 space-y-6">
                    <GlassCard className="p-8 border-white/10 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {!isLive ? (
                                <motion.div
                                    key="setup"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5">
                                            <Youtube className="w-6 h-6 text-red-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white font-tajawal">إعداد البث الجديد</h2>
                                            <p className="text-zinc-400 text-sm font-tajawal">قم بربط معرف فيديو اليوتيوب لبدء الجلسة.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm text-zinc-400 font-tajawal">عنوان الحصة</label>
                                            <Input
                                                placeholder="مثال: مراجعة شاملة للوحدة الأولى"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="bg-black/20 border-white/10 focus:border-red-500/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-zinc-400 font-tajawal">المادة / القسم</label>
                                            <select
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="w-full h-10 px-3 rounded-md border border-white/10 bg-black/20 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                            >
                                                <option value="Physics">الفيزياء (Physics)</option>
                                                <option value="Math">الرياضيات (Math)</option>
                                                <option value="Science">العلوم (Science)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400 font-tajawal">YouTube Video ID</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">youtube.com/watch?v=</span>
                                            <Input
                                                placeholder="dQw4w9WgXcQ"
                                                value={youtubeId}
                                                onChange={(e) => setYoutubeId(e.target.value)}
                                                className="pl-[160px] font-mono bg-black/20 border-white/10"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleGoLive}
                                        disabled={loading}
                                        className="w-full h-12 mt-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Go Live • بدء البث"}
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="active"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex flex-col items-center text-center space-y-6 py-10"
                                >
                                    <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center relative">
                                        <div className="absolute inset-0 rounded-full border border-red-500/30 animate-[ping_3s_linear_infinite]" />
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,1)]" />
                                    </div>

                                    <div>
                                        <h2 className="text-3xl font-bold text-white font-tajawal mb-2">{currentTitle}</h2>
                                        <p className="text-zinc-400 font-mono">ID: {currentId}</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Queue</p>
                                            <p className="text-2xl font-mono text-white">{queue.length}</p>
                                        </div>
                                        <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                                            {/* Static mock for now */}
                                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Time</p>
                                            <p className="text-2xl font-mono text-white">00:45</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setShowArchiveModal(true)}
                                        disabled={loading}
                                        variant="secondary"
                                        className="w-full max-w-md h-12 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Archive className="w-4 h-4" />
                                            إنهاء وأرشفة (End & Archive)
                                        </span>
                                    </Button>

                                    {/* Archive Modal Overlay */}
                                    {showArchiveModal && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                                            <GlassCard className="w-full max-w-md p-6 space-y-6 border-red-500/20">
                                                <h3 className="text-xl font-bold text-white text-center">أرشفة البث (Save Stream)</h3>
                                                <p className="text-center text-zinc-400">كيف تريد حفظ هذا البث في المكتبة؟</p>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        onClick={() => setArchiveType('lesson')}
                                                        className={`p-4 rounded-xl border transition-all ${archiveType === 'lesson' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-black/20 border-white/10 text-zinc-400'}`}
                                                    >
                                                        <span className="block font-bold mb-1">درس (Lesson)</span>
                                                        <span className="text-xs opacity-60">شرح نظري</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setArchiveType('exercise')}
                                                        className={`p-4 rounded-xl border transition-all ${archiveType === 'exercise' ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-black/20 border-white/10 text-zinc-400'}`}
                                                    >
                                                        <span className="block font-bold mb-1">تمرين (Exercise)</span>
                                                        <span className="text-xs opacity-60">حل تمارين</span>
                                                    </button>
                                                </div>

                                                <div className="flex gap-3">
                                                    <Button variant="secondary" onClick={() => setShowArchiveModal(false)} className="flex-1">إلغاء</Button>
                                                    <Button onClick={handleEndAndArchive} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-500">
                                                        {loading ? <Loader2 className="animate-spin" /> : "تأكيد وإنهاء"}
                                                    </Button>
                                                </div>
                                            </GlassCard>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassCard>

                    {/* Participation Queue */}
                    {isLive && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Hand className="w-5 h-5 text-blue-400" />
                                طابور المشاركات الصوتية
                            </h3>
                            <ParticipationQueue
                                queue={queue}
                                currentSpeaker={currentSpeaker}
                                onAccept={acceptStudent}
                                onEndCall={endCall}
                            />
                        </div>
                    )}
                </div>

                {/* Right Column: Live Chat */}
                <div className="xl:col-span-1 h-[600px] xl:h-auto">
                    <LiveChat />
                </div>
            </div>
        </div>
    );
}
