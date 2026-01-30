"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import {
    Shield, Key, Loader2, Settings, Bell, Smartphone,
    LogOut, Monitor, Clock, Mail
} from "lucide-react";
import { toast } from "sonner";
import { SmartButton } from "@/components/ui/SmartButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Password Change Schema
const passwordSchema = z.object({
    currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: z.string().min(8, "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"]
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
    const { user } = useAuth();
    const supabase = createClient();

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSigningOutOthers, setIsSigningOutOthers] = useState(false);

    // =====================================================
    // [REFACTOR] EMAIL NOTIFICATIONS ONLY - SMS REMOVED
    // =====================================================
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [isSavingEmail, setIsSavingEmail] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    // Device Info - MUST be inside useEffect to avoid SSR hydration errors
    const [sessionInfo, setSessionInfo] = useState({ os: "جاري التحميل...", browser: "" });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    });

    // =====================================================
    // INITIALIZATION: DEVICE DETECTION & EMAIL PREF FETCH
    // =====================================================
    useEffect(() => {
        let mounted = true;

        // -------------------------------------------------
        // 1. DEVICE DETECTION (Inside useEffect for SSR safety)
        // -------------------------------------------------
        if (typeof window !== "undefined" && window.navigator) {
            const ua = window.navigator.userAgent;

            let os = "نظام غير معروف";
            if (ua.includes("Win")) os = "Windows";
            else if (ua.includes("Mac")) os = "MacOS";
            else if (ua.includes("Linux")) os = "Linux";
            else if (ua.includes("Android")) os = "Android";
            else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

            let browser = "متصفح";
            if (ua.includes("Edg/")) browser = "Edge";
            else if (ua.includes("Chrome")) browser = "Chrome";
            else if (ua.includes("Firefox")) browser = "Firefox";
            else if (ua.includes("Safari")) browser = "Safari";

            if (mounted) setSessionInfo({ os, browser });
        }

        // -------------------------------------------------
        // 2. FETCH EMAIL NOTIFICATION PREFERENCE ONLY
        // -------------------------------------------------
        async function fetchEmailPreference() {
            if (!user) {
                if (mounted) setIsLoadingSettings(false);
                return;
            }

            try {
                // [REFACTOR] Only fetch email_notifications column
                const { data, error } = await supabase
                    .from("profiles")
                    .select("email_notifications")
                    .eq("id", user.id)
                    .single();

                if (error) {
                    console.error("Failed to fetch email preference:", error.message);
                    // Keep default (true), don't crash
                    return;
                }

                if (mounted && data) {
                    // Default to true if null/undefined
                    setNotifyEmail(data.email_notifications ?? true);
                }
            } catch (err) {
                console.error("Critical fetch error:", err);
            } finally {
                if (mounted) setIsLoadingSettings(false);
            }
        }

        fetchEmailPreference();

        return () => { mounted = false; };
    }, [user, supabase]);

    // =====================================================
    // PASSWORD CHANGE HANDLER
    // =====================================================
    const onPasswordSubmit = async (values: PasswordFormValues) => {
        setIsChangingPassword(true);
        try {
            // Verify current password by re-authenticating
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || "",
                password: values.currentPassword
            });

            if (signInError) {
                toast.error("كلمة المرور الحالية غير صحيحة");
                return;
            }

            // Update to new password
            const { error: updateError } = await supabase.auth.updateUser({
                password: values.newPassword
            });

            if (updateError) {
                toast.error("حدث خطأ أثناء تغيير كلمة المرور");
                console.error(updateError);
                return;
            }

            toast.success("تم تغيير كلمة المرور بنجاح");
            passwordForm.reset();
        } catch (error) {
            console.error("Password change error:", error);
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setIsChangingPassword(false);
        }
    };

    // =====================================================
    // [AUDIT 1] SIGN OUT OTHER DEVICES - Uses Supabase Auth
    // The Supabase SDK supports { scope: 'others' } to sign out
    // all sessions except the current one. Wrapped in try/catch.
    // =====================================================
    const handleSignOutOtherDevices = async () => {
        setIsSigningOutOthers(true);
        try {
            // Supabase Auth: scope: 'others' signs out all other sessions
            const { error } = await supabase.auth.signOut({ scope: "others" });

            if (error) {
                toast.error("حدث خطأ أثناء تسجيل الخروج من الأجهزة الأخرى");
                console.error("Sign out others error:", error);
                return;
            }

            toast.success("تم تسجيل الخروج من جميع الأجهزة الأخرى");
        } catch (error) {
            // Fallback error handling
            console.error("Sign out others error:", error);
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setIsSigningOutOthers(false);
        }
    };

    // =====================================================
    // [REFACTOR 3] EMAIL TOGGLE HANDLER - Optimistic UI
    // Immediately updates UI, then persists to database.
    // Reverts on error with toast feedback.
    // =====================================================
    const handleEmailToggle = async () => {
        if (!user || isLoadingSettings) return;

        // Store previous value for rollback
        const previousValue = notifyEmail;
        const newValue = !notifyEmail;

        // OPTIMISTIC UI: Update immediately
        setNotifyEmail(newValue);
        setIsSavingEmail(true);

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    email_notifications: newValue,
                    updated_at: new Date().toISOString()
                })
                .eq("id", user.id);

            if (error) {
                // ROLLBACK on error
                setNotifyEmail(previousValue);
                toast.error("فشل حفظ الإعداد");
                console.error("Email toggle error:", error);
                return;
            }

            // SUCCESS feedback
            toast.success(newValue ? "تم تفعيل إشعارات البريد" : "تم إيقاف إشعارات البريد");
        } catch (error) {
            // ROLLBACK on exception
            setNotifyEmail(previousValue);
            console.error("Email toggle exception:", error);
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setIsSavingEmail(false);
        }
    };

    // =====================================================
    // [AUDIT 2] DELETE ACCOUNT MAILTO LINK BUILDER
    // Dynamically builds mailto: href with encoded params
    // =====================================================
    const userEmail = user?.email || "";
    const deleteAccountMailto = `mailto:support@bac-x.com?subject=${encodeURIComponent(
        "Account Deletion Request"
    )}&body=${encodeURIComponent(
        `User Email: ${userEmail}\n\nI would like to request the deletion of my account.\n\nReason:\n[Please specify your reason here]`
    )}`;

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                    <Settings className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif">إعدادات الحساب</h1>
                    <p className="text-white/40 text-sm">إدارة الأمان والإشعارات</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Password Change Section */}
                    <GlassCard className="p-6 space-y-6 border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Key className="text-yellow-400" size={20} />
                            تغيير كلمة المرور
                        </h2>

                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-white/60">كلمة المرور الحالية</label>
                                <input
                                    {...passwordForm.register("currentPassword")}
                                    type="password"
                                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${passwordForm.formState.errors.currentPassword ? "border-red-500" : "border-white/10 focus:border-yellow-500/50"}`}
                                    placeholder="••••••••"
                                />
                                {passwordForm.formState.errors.currentPassword && (
                                    <p className="text-red-400 text-xs">{passwordForm.formState.errors.currentPassword.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-white/60">كلمة المرور الجديدة</label>
                                <input
                                    {...passwordForm.register("newPassword")}
                                    type="password"
                                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${passwordForm.formState.errors.newPassword ? "border-red-500" : "border-white/10 focus:border-yellow-500/50"}`}
                                    placeholder="••••••••"
                                />
                                {passwordForm.formState.errors.newPassword && (
                                    <p className="text-red-400 text-xs">{passwordForm.formState.errors.newPassword.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-white/60">تأكيد كلمة المرور الجديدة</label>
                                <input
                                    {...passwordForm.register("confirmPassword")}
                                    type="password"
                                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${passwordForm.formState.errors.confirmPassword ? "border-red-500" : "border-white/10 focus:border-yellow-500/50"}`}
                                    placeholder="••••••••"
                                />
                                {passwordForm.formState.errors.confirmPassword && (
                                    <p className="text-red-400 text-xs">{passwordForm.formState.errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <SmartButton
                                isLoading={isChangingPassword}
                                type="submit"
                                className="bg-yellow-600 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold shadow-lg"
                            >
                                <Key className="w-4 h-4 ml-2" />
                                تغيير كلمة المرور
                            </SmartButton>
                        </form>
                    </GlassCard>

                    {/* Active Sessions Section */}
                    <GlassCard className="p-6 space-y-6 border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Smartphone className="text-purple-400" size={20} />
                            الجلسات النشطة
                        </h2>

                        <div className="space-y-4">
                            {/* Current Session - Dynamic Device Info */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Monitor className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">
                                            {sessionInfo.os} — {sessionInfo.browser}
                                        </p>
                                        <p className="text-white/40 text-xs flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            نشط الآن
                                        </p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                                    الجلسة الحالية
                                </span>
                            </div>

                            <p className="text-white/50 text-sm">
                                إذا كنت تشك في أن حسابك قد تم استخدامه من جهاز آخر، يمكنك تسجيل الخروج من جميع الأجهزة الأخرى.
                            </p>

                            {/* [AUDIT 1] Sign Out Other Devices - with loading state */}
                            <SmartButton
                                isLoading={isSigningOutOthers}
                                onClick={handleSignOutOtherDevices}
                                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-6 py-3 rounded-xl font-bold"
                            >
                                <LogOut className="w-4 h-4 ml-2" />
                                تسجيل الخروج من الأجهزة الأخرى
                            </SmartButton>
                        </div>
                    </GlassCard>

                    {/* =====================================================
                        [REFACTOR 3] NOTIFICATION PREFERENCES - EMAIL ONLY
                        SMS toggle and all sms_notifications references removed.
                        Email toggle now uses optimistic UI pattern.
                    ===================================================== */}
                    <GlassCard className="p-6 space-y-6 border-white/10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Bell className="text-blue-400" size={20} />
                                تفضيلات الإشعارات
                            </h2>
                            {isLoadingSettings && <Loader2 className="w-4 h-4 text-white/50 animate-spin" />}
                        </div>

                        <div className="space-y-4">
                            {/* Email Toggle - Optimistic UI */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">إشعارات البريد الإلكتروني</p>
                                        <p className="text-white/40 text-xs">استلام التحديثات والتنبيهات عبر البريد</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleEmailToggle}
                                    disabled={isLoadingSettings || isSavingEmail}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${notifyEmail ? "bg-blue-600" : "bg-white/20"} ${(isLoadingSettings || isSavingEmail) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                    aria-label="Toggle email notifications"
                                >
                                    {isSavingEmail ? (
                                        <Loader2 className="w-4 h-4 text-white absolute top-1 left-1/2 -translate-x-1/2 animate-spin" />
                                    ) : (
                                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifyEmail ? "right-1" : "left-1"}`} />
                                    )}
                                </button>
                            </div>

                            {/* Status indicator */}
                            <p className="text-white/40 text-xs">
                                {notifyEmail ? "✓ الإشعارات مفعّلة" : "✗ الإشعارات متوقفة"}
                            </p>
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <GlassCard className="p-6 border-white/10 bg-blue-600/5">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-400" />
                            نصائح أمنية
                        </h3>
                        <ul className="text-sm text-white/60 space-y-2">
                            <li>• استخدم كلمة مرور قوية ومختلفة</li>
                            <li>• لا تشارك بيانات الدخول مع أحد</li>
                            <li>• تحقق من الجلسات النشطة بانتظام</li>
                            <li>• قم بتسجيل الخروج عند استخدام أجهزة عامة</li>
                        </ul>
                    </GlassCard>

                    {/* =====================================================
                        [AUDIT 2] DELETE ACCOUNT - Functional mailto: link
                        Uses encodeURIComponent for subject and body.
                        Email is dynamically retrieved from user state.
                    ===================================================== */}
                    <GlassCard className="p-6 border-white/10 bg-red-600/5">
                        <h3 className="text-lg font-bold text-white mb-2">حذف الحساب</h3>
                        <p className="text-sm text-white/60 mb-4">
                            لأسباب أمنية وتاريخية، لا يمكن حذف الحساب تلقائيًا. يرجى التواصل مع الدعم.
                        </p>
                        {/* Functional mailto: anchor tag */}
                        <a
                            href={deleteAccountMailto}
                            className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 underline transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            طلب حذف الحساب عبر البريد الإلكتروني
                        </a>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
