"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { LogOut, User, Phone, MapPin, Loader2, Save, BookOpen, Moon, Bell, Shield, CreditCard, Monitor } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface UserPreferences {
    theme: 'dark' | 'light';
    notifications: {
        live: boolean;
        community: boolean;
        materials: boolean;
    };
    video_quality: 'auto' | '720p' | '1080p';
}

export default function SettingsPage() {
    const { user, profile, logout } = useAuth();
    const supabase = createClient();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'app'>('profile');

    // Form Data State
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        wilaya: "",
        major: ""
    });

    const [preferences, setPreferences] = useState<UserPreferences>({
        theme: 'dark',
        notifications: { live: true, community: true, materials: true },
        video_quality: 'auto'
    });

    // 1. Fetch Profile & Preferences on Load
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, phone, wilaya, major, preferences')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setFormData({
                        full_name: data.full_name || "",
                        phone: data.phone || "",
                        wilaya: data.wilaya || "",
                        major: data.major || ""
                    });

                    if (data.preferences) {
                        setPreferences(data.preferences as UserPreferences);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("فشل في تحميل بيانات الملف الشخصي");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, supabase]);

    // 2. Handle Save
    const handleSave = async () => {
        if (!user) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    wilaya: formData.wilaya,
                    major: formData.major,
                    preferences: preferences,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success("تم حفظ التغييرات بنجاح", {
                style: {
                    background: "rgba(37, 99, 235, 0.2)",
                    borderColor: "rgba(37, 99, 235, 0.5)",
                    color: "white"
                }
            });

        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("حدث خطأ أثناء الحفظ");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        });
        if (error) toast.error(error.message);
        else toast.success("تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">الإعدادات</h1>
                    <p className="text-white/40">تحكم في ملفك الشخصي وتفضيلات التطبيق</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'profile' ? "bg-blue-600 text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5")}
                    >
                        الملف الشخصي
                    </button>
                    <button
                        onClick={() => setActiveTab('app')}
                        className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'app' ? "bg-blue-600 text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5")}
                    >
                        إعدادات التطبيق
                    </button>
                </div>
            </div>

            {activeTab === 'profile' ? (
                /* --- PROFILE TAB --- */
                <div className="space-y-6">
                    <GlassCard className="p-8 space-y-8">
                        <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2 text-blue-300">
                            <User className="w-5 h-5" />
                            المعلومات الشخصية
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/60 mr-1">الاسم الكامل</label>
                                <Input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    icon={User}
                                    placeholder="الاسم الكامل"
                                    className="bg-white/5 border-white/10 focus:border-blue-500/50"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/60 mr-1">رقم الهاتف</label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    icon={Phone}
                                    placeholder="رقم الهاتف"
                                    type="tel"
                                    className="bg-white/5 border-white/10 focus:border-blue-500/50"
                                />
                            </div>

                            {/* Wilaya */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/60 mr-1">الولاية</label>
                                <Input
                                    value={formData.wilaya}
                                    onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                                    icon={MapPin}
                                    placeholder="الولاية"
                                    className="bg-white/5 border-white/10 focus:border-blue-500/50"
                                />
                            </div>

                            {/* Branch / Major */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/60 mr-1">الشعبة</label>
                                <Input
                                    value={formData.major}
                                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                    icon={BookOpen}
                                    placeholder="مثال: علوم تجريبية"
                                    className="bg-white/5 border-white/10 focus:border-blue-500/50"
                                />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Security Section in Profile */}
                    <GlassCard className="p-8 space-y-6 border-yellow-500/20">
                        <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2 text-yellow-300">
                            <Shield className="w-5 h-5" />
                            الأمان
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-white">كلمة المرور</p>
                                <p className="text-sm text-white/40">تغيير كلمة المرور الخاصة بحسابك</p>
                            </div>
                            <button
                                onClick={handlePasswordReset}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors"
                            >
                                إرسال رابط التغيير
                            </button>
                        </div>
                    </GlassCard>
                </div>
            ) : (
                /* --- APP SETTINGS TAB --- */
                <div className="space-y-6">
                    {/* Preferences */}
                    <GlassCard className="p-8 space-y-6">
                        <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2 text-purple-300">
                            <Monitor className="w-5 h-5" />
                            التفضيلات
                        </h3>

                        {/* Theme */}
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg"><Moon className="w-4 h-4 text-purple-400" /></div>
                                <div>
                                    <p className="font-bold">المظهر الداكن</p>
                                    <p className="text-xs text-white/40">تفعيل الوضع الليلي لواجهة التطبيق</p>
                                </div>
                            </div>
                            <div
                                onClick={() => setPreferences(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
                                className={cn("w-12 h-6 rounded-full p-1 cursor-pointer transition-colors", preferences.theme === 'dark' ? "bg-purple-600 justify-end flex" : "bg-white/10 justify-start flex")}
                            >
                                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                            </div>
                        </div>

                        {/* Video Quality */}
                        <div className="flex items-center justify-between py-2 border-t border-white/5 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg"><Monitor className="w-4 h-4 text-blue-400" /></div>
                                <div>
                                    <p className="font-bold">جودة الفيديو الافتراضية</p>
                                    <p className="text-xs text-white/40">الجودة المفضلة عند تشغيل الدروس</p>
                                </div>
                            </div>
                            <select
                                value={preferences.video_quality}
                                onChange={(e) => setPreferences({ ...preferences, video_quality: e.target.value as any })}
                                className="bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="auto">تلقائي (Auto)</option>
                                <option value="720p">HD 720p</option>
                                <option value="1080p">FHD 1080p</option>
                            </select>
                        </div>
                    </GlassCard>

                    {/* Notifications */}
                    <GlassCard className="p-8 space-y-6">
                        <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2 text-green-300">
                            <Bell className="w-5 h-5" />
                            الإشعارات
                        </h3>
                        <div className="space-y-4">
                            {[
                                { key: 'live', label: 'تنبيهات الحصص المباشرة' },
                                { key: 'community', label: 'رسائل المجتمع' },
                                { key: 'materials', label: 'تحديثات المواد والدروس' }
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{item.label}</span>
                                    <input
                                        type="checkbox"
                                        checked={preferences.notifications[item.key as keyof typeof preferences.notifications]}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            notifications: { ...preferences.notifications, [item.key]: e.target.checked }
                                        })}
                                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-green-600 focus:ring-green-500 focus:ring-offset-0"
                                    />
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Subscription Info */}
                    <GlassCard className="p-8 space-y-6 border-blue-500/20 bg-blue-900/5">
                        <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2 text-blue-300">
                            <CreditCard className="w-5 h-5" />
                            الاشتراك
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-white/60 mb-1">نوع الاشتراك الحالي</p>
                                <p className="text-2xl font-bold text-white tracking-wider">
                                    {profile?.is_subscribed ? "PROFESSIONAL" : "مجاني Free"}
                                </p>
                            </div>
                            {profile?.is_subscribed ? (
                                <div className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-full text-xs font-bold">
                                    نشط
                                </div>
                            ) : (
                                <button onClick={() => router.push('/subscription')} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20">
                                    ترقية الحساب
                                </button>
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* SAVE BAR */}
            <div className="sticky bottom-6 flex items-center justify-between bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl z-50">
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-bold"
                >
                    <LogOut size={18} />
                    تسجيل الخروج
                </button>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            حفظ التغييرات
                        </>
                    )}
                </button>
            </div>

        </div>
    );
}
