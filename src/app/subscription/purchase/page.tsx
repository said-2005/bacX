"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Upload, CheckCircle, Smartphone, Landmark } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PurchasePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<"CCP" | "BaridiMob">("CCP");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // In a real app, this would handle file upload to Storage
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

    const methods = {
        CCP: {
            title: "DZD (CCP)",
            icon: Landmark,
            details: "CCP: 0000000000 00 | CLE: 00 | NOM: BACX EDTECH"
        },
        BaridiMob: {
            title: "BaridiMob",
            icon: Smartphone,
            details: "RIP: 00799999000000000000 | NOM: BACX EDTECH"
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        if (!receiptFile) {
            toast.error("يرجى إرفاق صورة الوصل");
            return;
        }

        setIsSubmitting(true);
        try {
            // Mock Upload - in real world upload to storage and get URL
            const mockReceiptUrl = "https://fake-url.com/receipt.jpg";

            await addDoc(collection(db, "payments"), {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName,
                amount: "4500 DZD",
                method: selectedMethod,
                receiptUrl: mockReceiptUrl,
                status: "pending",
                createdAt: new Date()
            });

            toast.success("تم إرسال طلب التجديد بنجاح! سيتم مراجعته قريباً.");
            router.push("/subscription");
        } catch (error) {
            console.error(error);
            toast.error("حدث خطأ أثناء الإرسال");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center font-tajawal direction-rtl text-slate-900">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">تجديد الاشتراك السنوي</h1>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900">الباقة الشاملة (Full Access)</h3>
                        <p className="text-sm text-blue-600/80">وصول كامل لجميع الدروس والتمارين لمدة سنة كاملة.</p>
                    </div>
                    <div className="mr-auto font-bold text-xl text-blue-600">4500 د.ج</div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">اختر طريقة الدفع</label>
                        <div className="grid grid-cols-2 gap-4">
                            {(Object.keys(methods) as Array<"CCP" | "BaridiMob">).map((method) => (
                                <button
                                    key={method}
                                    onClick={() => setSelectedMethod(method)}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedMethod === method
                                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    <span className="p-2 bg-white/10 rounded-lg">
                                        {method === 'CCP' ? <Landmark className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                                    </span>
                                    <span className="font-bold">{methods[method].title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 text-center">
                        <p className="text-sm text-slate-500 mb-2">معلومات الدفع:</p>
                        <p className="font-mono text-lg font-bold text-slate-800 dir-ltr">{methods[selectedMethod].details}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">إرفاق وصل الدفع</label>
                        <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                            />
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                            <p className="text-sm text-slate-500">
                                {receiptFile ? <span className="text-green-600 font-bold">{receiptFile.name}</span> : "اضغط هنا لرفع صورة الوصل"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {isSubmitting ? "جاري الإرسال..." : "تأكيد وإرسال الطلب"}
                    </button>

                    <Link href="/subscription" className="block text-center text-sm text-slate-400 hover:text-slate-600">
                        إلغاء والعودة
                    </Link>
                </div>
            </div>
        </div>
    );
}
