"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { User, MapPin, Loader2, BookOpen, GraduationCap, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user } = useAuth();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        full_name: "",
        wilaya: "",
        major: "",
        study_system: ""
    });

    // 1. Fetch Profile Data
    useEffect(() => {
        let mounted = true;
        const fetchProfile = async () => {
            if (!user) {
                if (mounted) setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, wilaya, major, study_system')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error("ProfilePage: Supabase query error:", error);
                    throw error;
                }

                if (data && mounted) {
                    setProfileData({
                        full_name: data.full_name || "غير محدد",
                        wilaya: data.wilaya || "غير محدد",
                        major: data.major || "غير محدد",
                        study_system: data.study_system === 'regular' ? 'طالب نظامي' :
                            data.study_system === 'private' ? 'طالب حر' : "غير محدد"
                    });
                }
            } catch (error) {
                console.error("ProfilePage: error:", error);
                // toast.error("فشل في تحميل بيانات الملف الشخصي");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchProfile();
        return () => { mounted = false; };
    }, [user, supabase]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-8">
            <h1 className="text-3xl font-serif font-bold text-white mb-2">الملف الشخصي</h1>

            <GlassCard className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-white/10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-black/90 flex items-center justify-center">
                            <User className="w-10 h-10 text-white/80" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{profileData.full_name}</h2>
                        <div className="flex flex-wrap gap-2 text-sm text-white/60">
                            {profileData.study_system !== "غير محدد" && (
                                <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3" />
                                    {profileData.study_system}
                                </span>
                            )}
                            {profileData.major !== "غير محدد" && (
                                <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {profileData.major}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-1">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            الاسم الكامل
                        </label>
                        <p className="text-lg font-medium text-white">{profileData.full_name}</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            الولاية
                        </label>
                        <p className="text-lg font-medium text-white">{profileData.wilaya}</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            الشعبة
                        </label>
                        <p className="text-lg font-medium text-white">{profileData.major}</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            نظام الدراسة
                        </label>
                        <p className="text-lg font-medium text-white">{profileData.study_system}</p>
                    </div>
                </div>
            </GlassCard>

            <div className="text-center text-white/20 text-sm">
                لتعديل هذه المعلومات، انتقل إلى الإعدادات
            </div>
        </div>
    );
}
