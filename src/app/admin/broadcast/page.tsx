'use client';

import { sendGlobalAnnouncement, getRecentAnnouncements } from "@/actions/admin-broadcast";
import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Megaphone, BellRing, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";

export default function BroadcastPage() {
    const [message, setMessage] = useState("");
    const [type, setType] = useState<'info' | 'warning' | 'success' | 'urgent'>('info');
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true); // [NEW] Loading State

    // Simple client-side fetch for history on mount
    useEffect(() => {
        setLoading(true);
        getRecentAnnouncements()
            .then(res => setHistory(res.announcements))
            .finally(() => setLoading(false));
    }, []);

    const handleSend = async () => {
        if (!message.trim()) return;

        // Optimistic UI could go here
        const res = await sendGlobalAnnouncement(message, type);

        if (res.success) {
            toast.success("تم إرسال الإعلان بنجاح!");
            setMessage("");
            getRecentAnnouncements().then(r => setHistory(r.announcements)); // Refresh list
        } else {
            toast.error("فشل في إرسال الإعلان.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                <p className="text-white/50 animate-pulse font-tajawal">جاري تحميل الإعلانات...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white font-tajawal">مركز البث (Broadcast Center)</h1>
                <p className="text-gray-400 font-tajawal">إدارة الإعلانات والتنبيهات العامة</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Sender Form */}
                <AdminGlassCard>
                    <h3 className="mb-4 text-xl font-bold text-white flex items-center gap-2 font-tajawal">
                        <Megaphone className="h-5 w-5 text-blue-400" />
                        إعلان جديد
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm text-gray-400 font-tajawal">نص الرسالة</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="h-32 w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white focus:border-blue-500/50 focus:outline-none text-right"
                                placeholder="اكتب رسالتك هنا..."
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-gray-400 font-tajawal">نوع التنبيه</label>
                            <div className="flex gap-2">
                                <button onClick={() => setType('info')} className={`flex-1 rounded-lg border py-2 text-sm font-bold transition-all ${type === 'info' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-transparent border-white/5 text-gray-500'}`}>معلومة</button>
                                <button onClick={() => setType('success')} className={`flex-1 rounded-lg border py-2 text-sm font-bold transition-all ${type === 'success' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-transparent border-white/5 text-gray-500'}`}>نجاح</button>
                                <button onClick={() => setType('warning')} className={`flex-1 rounded-lg border py-2 text-sm font-bold transition-all ${type === 'warning' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-transparent border-white/5 text-gray-500'}`}>تنبيه</button>
                                <button onClick={() => setType('urgent')} className={`flex-1 rounded-lg border py-2 text-sm font-bold transition-all ${type === 'urgent' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-transparent border-white/5 text-gray-500'}`}>عاجل</button>
                            </div>
                        </div>

                        <button
                            onClick={handleSend}
                            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 font-tajawal"
                        >
                            إرسال الإعلان (Send)
                        </button>
                    </div>
                </AdminGlassCard>

                {/* Live Preview / History */}
                <AdminGlassCard>
                    <h3 className="mb-4 text-xl font-bold text-white flex items-center gap-2 font-tajawal">
                        <BellRing className="h-5 w-5 text-purple-400" />
                        آخر التنبيهات
                    </h3>

                    <div className="space-y-3">
                        {history.length === 0 && <p className="text-gray-500 text-sm font-tajawal">لا توجد إعلانات حديثة.</p>}
                        {history.map((item) => (
                            <div key={item.id} className="flex items-start gap-4 rounded-xl bg-white/5 p-3 text-right" dir="rtl">
                                <div className={`mt-1 rounded-full p-1 shrink-0 ${item.type === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                    item.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                        item.type === 'success' ? 'bg-green-500/20 text-green-400' :
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {item.type === 'urgent' ? <AlertTriangle className="h-4 w-4" /> :
                                        item.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
                                            <Info className="h-4 w-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{item.message}</p>
                                    <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminGlassCard>
            </div>
        </div>
    );
}
