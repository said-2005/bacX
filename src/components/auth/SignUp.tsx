"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveStudentData } from "@/lib/user";
import { ALGERIAN_WILAYAS } from "@/lib/data/wilayas";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Mail, Lock, MapPin, BookOpen, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SignUpProps {
    onToggleLogin: () => void;
}

export function SignUp({ onToggleLogin }: SignUpProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        wilaya: "",
        major: "شعبة علوم تجريبية" // Default
    });
    const [showPassword, setShowPassword] = useState(false);

    const MAJORS = [
        "شعبة علوم تجريبية",
        "شعبة رياضيات",
        "شعبة تقني رياضي"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.fullName.trim()) return toast.error("الاسم الكامل مطلوب");
        if (!formData.wilaya) return toast.error("يرجى اختيار الولاية");
        if (formData.password.length < 8) return toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");

        setIsLoading(true);
        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

            // 2. Save Firestore Data
            await saveStudentData({
                uid: userCredential.user.uid,
                email: formData.email,
                fullName: formData.fullName,
                wilaya: formData.wilaya,
                major: formData.major
            });

            toast.success("تم إنشاء الحساب بنجاح! جاري التوجيه...");
            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            // @ts-expect-error: error is unknown typed but we know it has code property in firebase auth
            if (error.code === 'auth/email-already-in-use') {
                toast.error("البريد الإلكتروني مستخدم بالفعل");
            } else {
                toast.error("حدث خطأ أثناء التسجيل");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Full Name */}
            <Input
                placeholder="الاسم الكامل"
                icon={User}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-white/5 border-white/10 focus:border-white/20 text-right"
                dir="rtl"
            />

            {/* Wilaya Select */}
            <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
                <select
                    value={formData.wilaya}
                    onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-zinc-200 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    dir="rtl"
                >
                    <option value="" className="bg-zinc-900 text-zinc-500">اختر الولاية...</option>
                    {ALGERIAN_WILAYAS.map(w => (
                        <option key={w.id} value={w.name} className="bg-zinc-900 text-white">
                            {w.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Major Select (Radio style for better UX or Select) - Using Select for compactness matching design */}
            <div className="relative">
                <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
                <select
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-zinc-200 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    dir="rtl"
                >
                    {MAJORS.map(m => (
                        <option key={m} value={m} className="bg-zinc-900 text-white">
                            {m}
                        </option>
                    ))}
                </select>
            </div>

            {/* Email */}
            <Input
                type="email"
                placeholder="البريد الإلكتروني"
                icon={Mail}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/5 border-white/10 focus:border-white/20 text-right"
                dir="rtl"
            />

            {/* Password */}
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="كلمة المرور"
                    icon={Lock}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-white/5 border-white/10 focus:border-white/20 text-right pl-12"
                    dir="rtl"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>

            <Button
                className="w-full mt-6 bg-white text-black hover:bg-zinc-200 font-bold"
                size="lg"
                isLoading={isLoading}
            >
                {isLoading ? "جاري الإنشاء..." : "نحو التفوق 🚀"}
            </Button>

            <div className="mt-4 text-center">
                <button
                    type="button"
                    onClick={onToggleLogin}
                    className="text-sm text-zinc-400 hover:text-white transition-colors font-tajawal"
                >
                    لديك حساب بالفعل؟ <span className="text-white underline decoration-blue-500/50 underline-offset-4">سجل دخولك</span>
                </button>
            </div>
        </form>
    );
}
